import connectToDatabase from "../lib/mongodb";
import User from "../models/User";
import { validateUserInput, validUserId, userErrorResponse } from "../lib/userValidation";

function publicUser(user) {
  const result = user.toObject();
  delete result.password;
  return result;
}
function fail(res, error) {
  const result = userErrorResponse(error);
  return res.status(result.status).json({ success: false, message: result.message });
}

export async function getUsers(req, res) {
  try {
    await connectToDatabase();
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const query = {};
    if (["admin", "user"].includes(req.query.role)) query.role = req.query.role;
    if (req.query.search) {
      const search = String(req.query.search).trim().slice(0, 200).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      query.$or = [{ name: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }];
    }
    const total = await User.countDocuments(query);
    const pages = Math.max(1, Math.ceil(total / limit));
    const current = Math.min(page, pages);
    const users = await User.find(query).select("-password").sort({ createdAt: -1 }).limit(limit).skip((current - 1) * limit);
    return res.status(200).json({ success: true, count: users.length, total, pagination: { current, pages }, data: users });
  } catch (error) { return fail(res, error); }
}

export async function getUser(req, res) {
  if (!validUserId(req.query.id)) return res.status(400).json({ success: false, message: "Invalid user ID." });
  try {
    await connectToDatabase();
    const user = await User.findById(req.query.id).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found." });
    return res.status(200).json({ success: true, data: user });
  } catch (error) { return fail(res, error); }
}

export async function createUser(req, res) {
  const { data, error } = validateUserInput(req.body, { create: true });
  if (error) return res.status(400).json({ success: false, message: error });
  try {
    await connectToDatabase();
    if (await User.findOne({ email: { $regex: `^${data.email.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" } })) {
      return res.status(409).json({ success: false, message: "A user with this email already exists." });
    }
    // Pass plaintext once; the model owns password hashing for every save.
    const user = await User.create(data);
    return res.status(201).json({ success: true, data: publicUser(user) });
  } catch (error) { return fail(res, error); }
}

export async function updateUser(req, res) {
  if (!validUserId(req.query.id)) return res.status(400).json({ success: false, message: "Invalid user ID." });
  const { data, error } = validateUserInput(req.body, { passwordOnly: !!req.userPasswordOnly });
  if (error) return res.status(400).json({ success: false, message: error });
  const isSelf = req.actorId === req.query.id;
  if (isSelf && data.role && data.role !== "admin") {
    return res.status(400).json({ success: false, message: "You cannot remove your own admin access." });
  }
  try {
    await connectToDatabase();
    const user = await User.findById(req.query.id).select("+password");
    if (!user) return res.status(404).json({ success: false, message: "User not found." });
    if (data.email && data.email !== user.email && await User.findOne({
      _id: { $ne: user._id }, email: { $regex: `^${data.email.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" },
    })) return res.status(409).json({ success: false, message: "A user with this email already exists." });
    const authChanged = data.password !== undefined || (data.email !== undefined && data.email !== user.email) || (data.role !== undefined && data.role !== user.role);
    Object.assign(user, data);
    if (authChanged) user.sessionVersion = (user.sessionVersion || 0) + 1;
    await user.save();
    return res.status(200).json({ success: true, data: publicUser(user), reauthenticate: isSelf && authChanged });
  } catch (error) { return fail(res, error); }
}

export async function deleteUser(req, res) {
  if (!validUserId(req.query.id)) return res.status(400).json({ success: false, message: "Invalid user ID." });
  if (req.actorId === req.query.id) return res.status(400).json({ success: false, message: "You cannot delete your own account." });
  try {
    await connectToDatabase();
    const user = await User.findByIdAndDelete(req.query.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found." });
    return res.status(200).json({ success: true, message: "User deleted successfully." });
  } catch (error) { return fail(res, error); }
}
