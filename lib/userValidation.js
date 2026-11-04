export function validatePassword(password) {
  if (typeof password !== "string" || password.length < 6 || Buffer.byteLength(password, "utf8") > 72) {
    return "Password must be at least 6 characters and no more than 72 UTF-8 bytes.";
  }
  return null;
}

export function validateUserInput(body, { create = false, passwordOnly = false } = {}) {
  if (!body || typeof body !== "object" || Array.isArray(body)) return { error: "Invalid user details." };
  const data = {};
  if (!passwordOnly) {
    for (const field of ["name", "email", "role"]) {
      if (create || body[field] !== undefined) {
        const value = body[field];
        if (field === "name" && (typeof value !== "string" || !value.trim() || value.length > 100)) return { error: "Please provide a name of up to 100 characters." };
        if (field === "email" && (typeof value !== "string" || value.length > 254 || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(value.trim()))) return { error: "Please provide a valid email address." };
        if (field === "role" && value !== undefined && !["user", "admin"].includes(value)) return { error: "Role must be user or admin." };
        data[field] = field === "email" ? value.trim().toLowerCase() : field === "name" ? value.trim() : value || "user";
      }
    }
  }
  if (create || passwordOnly || body.password !== undefined) {
    const error = validatePassword(body.password);
    if (error) return { error };
    data.password = body.password;
  }
  if (!Object.keys(data).length) return { error: "No user changes provided." };
  return { data };
}

export function validUserId(id) { return typeof id === "string" && /^[a-f0-9]{24}$/i.test(id); }

export function userErrorResponse(error) {
  if (error.code === 11000) return { status: 409, message: "A user with this email already exists." };
  if (error.name === "ValidationError") return { status: 400, message: "Invalid user details." };
  return { status: 500, message: "Unable to complete the user request. Please try again." };
}
