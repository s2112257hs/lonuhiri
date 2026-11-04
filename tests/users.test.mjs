import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { timingSafeEqual } from "node:crypto";
import UserModel from "../models/User.js";
import { createUserAuth } from "../lib/userAuth.js";
import { validateUserInput, validUserId, userErrorResponse } from "../lib/userValidation.js";

const id = "507f1f77bcf86cd799439011";
const actorId = "507f191e810c19729de860ea";
const password = "Test-password-123";
function beforeSave(doc) {
  return new Promise((resolve, reject) => UserModel.schema.s.hooks.execPre("save", doc, [{}], (error) => error ? reject(error) : resolve()));
}
function res() {
  return { setHeader() {}, status(code) { this.code = code; return this; }, json(data) { this.data = data; return this; } };
}
async function controllers(User) {
  const source = fs.readFileSync(new URL("../controller/userController.js", import.meta.url), "utf8")
    .replace(/^import .*;$/gm, "").replace(/export async function/g, "async function");
  const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
  return new AsyncFunction("connectToDatabase", "User", "validateUserInput", "validUserId", "userErrorResponse", source + "; return {createUser,updateUser,deleteUser,getUsers};")(
    async () => {}, User, validateUserInput, validUserId, userErrorResponse,
  );
}

test("creation validates and normalizes email, role and password", () => {
  assert.deepEqual(validateUserInput({ name: " Guest ", email: "Guest@Example.com", password }, { create: true }).data,
    { name: "Guest", email: "guest@example.com", password, role: "user" });
  for (const details of [{ name: "", email: "a@example.com", password }, { name: "Guest", email: "invalid", password }, { name: "Guest", email: "a@example.com", password: "short" }, { name: "Guest", email: "a@example.com", password, role: "owner" }]) {
    assert.ok(validateUserInput(details, { create: true }).error);
  }
  assert.ok(validateUserInput({ password: "😀".repeat(19) }, { passwordOnly: true }).error);
});

test("new user passwords are hashed once and never returned by creation", async () => {
  const c = await controllers({
    findOne: async () => null,
    create: async (data) => { const doc = new UserModel(data); await beforeSave(doc); assert.equal(await doc.comparePassword(password), true); return doc; },
  });
  const response = res();
  await c.createUser({ body: { name: "Guest", email: "Guest@Example.com", password } }, response);
  assert.equal(response.code, 201);
  assert.equal(response.data.data.password, undefined);
});

test("saving profile fields does not rehash an existing password", async () => {
  const original = new UserModel({ name: "Guest", email: "guest@example.com", password });
  await beforeSave(original);
  const doc = UserModel.hydrate({ ...original.toObject(), _id: id });
  const hash = doc.password;
  doc.name = "Updated guest";
  await beforeSave(doc);
  assert.equal(doc.password, hash);
  assert.equal(await doc.comparePassword(password), true);
});

test("password endpoint updates only the password and invalidates old sessions", async () => {
  const original = new UserModel({ name: "Guest", email: "guest@example.com", password, role: "user" });
  await beforeSave(original);
  const doc = UserModel.hydrate({ ...original.toObject(), _id: id, sessionVersion: 0 });
  doc.save = async () => beforeSave(doc);
  const c = await controllers({ findById: () => ({ select: async () => doc }) });
  const response = res();
  await c.updateUser({ query: { id }, actorId, userPasswordOnly: true, body: { password: "Replacement-123", role: "admin", name: "Injected" } }, response);
  assert.equal(response.code, 200);
  assert.equal(doc.name, "Guest");
  assert.equal(doc.role, "user");
  assert.equal(doc.sessionVersion, 1);
  assert.equal(await doc.comparePassword("Replacement-123"), true);
  assert.equal(await doc.comparePassword(password), false);
  assert.equal(response.data.data.password, undefined);
});

test("duplicate email races return conflict instead of a raw database error", async () => {
  const c = await controllers({ findOne: async () => null, create: async () => { const error = new Error("sensitive database detail"); error.code = 11000; throw error; } });
  const response = res();
  await c.createUser({ body: { name: "Guest", email: "guest@example.com", password } }, response);
  assert.equal(response.code, 409);
  assert.equal(JSON.stringify(response.data).includes("sensitive"), false);
});

test("invalid IDs and self deletion/demotion are rejected before changing accounts", async () => {
  const c = await controllers({});
  const response = res();
  await c.updateUser({ query: { id: "invalid" }, body: { name: "Guest" } }, response);
  assert.equal(response.code, 400);
  await c.updateUser({ query: { id }, actorId: id, body: { role: "user" } }, response);
  assert.equal(response.code, 400);
  await c.deleteUser({ query: { id }, actorId: id }, response);
  assert.equal(response.code, 400);
});

test("login checks stored passwords, including the former hardcoded admin address", async () => {
  const auth = createUserAuth({ connect: async () => {}, User: { findOne: () => ({ select: async () => ({ _id: id, role: "admin", email: "admin@admin.com", name: "Admin", comparePassword: async (value) => value === "new-password" }) }) } });
  assert.equal(await auth.authorize({ email: "admin@admin.com", password: "123456" }), null);
  assert.equal((await auth.authorize({ email: " ADMIN@ADMIN.COM ", password: "new-password" })).id, id);
  assert.equal(await auth.authorize({}), null);
});

test("deleted accounts and password changes invalidate sessions; role is refreshed", async () => {
  let current = { name: "Guest", email: "guest@example.com", role: "user", sessionVersion: 1 };
  const auth = createUserAuth({ connect: async () => {}, User: { findById: () => ({ select: async () => current }) } });
  assert.equal((await auth.jwt({ token: { id, role: "admin", sessionVersion: 0 } })).invalid, true);
  const token = await auth.jwt({ token: { id, role: "admin", sessionVersion: 1 } });
  assert.equal(token.role, "user");
  current = null;
  assert.equal((await auth.jwt({ token })).invalid, true);
  assert.equal(await auth.session({ session: {}, token: { invalid: true } }), null);
});

test("all user endpoints block anonymous and non-admin requests", async () => {
  const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
  for (const file of ["../pages/api/users/index.js", "../pages/api/users/[id].js", "../pages/api/users/[id]/password.js"]) {
    const source = fs.readFileSync(new URL(file, import.meta.url), "utf8").replace(/^import .*;$/gm, "").replace("export default async function", "async function");
    let session = null;
    const handler = await new AsyncFunction("getServerSession", "authOptions", "getUsers", "createUser", "getUser", "updateUser", "deleteUser", source + ";return handler;")(
      async () => session, {}, ...Array.from({ length: 5 }, () => () => { throw new Error("Must not reach controller"); }),
    );
    const response = res();
    await handler({ method: "POST", query: { id } }, response);
    assert.equal(response.code, 401);
    session = { user: { id: actorId, role: "user" } };
    await handler({ method: "PUT", query: { id } }, response);
    assert.equal(response.code, 403);
  }
});

test("admin setup rejects anonymous requests and requires explicit recovery authorization", async () => {
  const source = fs.readFileSync(new URL("../pages/api/seed-admin.js", import.meta.url), "utf8")
    .replace(/^import .*;$/gm, "").replace("export default async function", "async function");
  const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
  let saved = false;
  let connected = false;
  const existing = { sessionVersion: 2, save: async () => { saved = true; } };
  const handler = await new AsyncFunction("timingSafeEqual", "getServerSession", "authOptions", "connectToDatabase", "User", "validateUserInput", "userErrorResponse", "process", source + ";return handler;")(
    timingSafeEqual, async () => null, {}, async () => { connected = true; },
    { findOne: () => ({ select: async () => existing }) }, validateUserInput, userErrorResponse,
    { env: { ADMIN_BOOTSTRAP_TOKEN: "dummy-recovery-token" } },
  );
  const request = { method: "POST", headers: {}, body: { name: "Admin", email: "admin@example.com", password } };
  const response = res();
  await handler(request, response);
  assert.equal(response.code, 403);
  assert.equal(connected, false);
  request.headers.authorization = "Bearer dummy-recovery-token";
  await handler(request, response);
  assert.equal(response.code, 409);
  assert.equal(saved, false);
  request.body.resetPassword = true;
  await handler(request, response);
  assert.equal(response.code, 200);
  assert.equal(saved, true);
  assert.equal(existing.sessionVersion, 3);
  assert.equal(existing.password, password);
  assert.equal(existing.role, "admin");
});
