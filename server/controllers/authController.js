const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { query } = require("../db");
const { getConfig } = require("../config");
const { createHttpError } = require("../middleware");
const roles = new Set(["BUYER", "SELLER", "BOTH"]);
function token(u) {
  return jwt.sign(
    {
      sub: u.id,
      id: u.id,
      fullName: u.full_name,
      email: u.email,
      role: u.role,
    },
    getConfig().jwtSecret,
    { expiresIn: "12h" },
  );
}
function pub(u) {
  return {
    id: u.id,
    fullName: u.full_name,
    email: u.email,
    phone: u.phone,
    role: u.role,
    aadhaarVerified: u.aadhaar_verified,
  };
}
async function register(req, res) {
  const { fullName, email, phone, password, role = "BOTH" } = req.body || {};
  if (
    !fullName ||
    !email ||
    !phone ||
    typeof password !== "string" ||
    password.length < 8 ||
    !roles.has(role)
  )
    throw createHttpError(
      400,
      "Valid fullName, email, phone, role, and 8-character password are required",
    );
  const hash = await bcrypt.hash(password, 12);
  const r = await query(
    "INSERT INTO users(full_name,email,phone,password_hash,role) VALUES($1,LOWER($2),$3,$4,$5) RETURNING id,full_name,email,phone,role,aadhaar_verified",
    [fullName.trim(), email.trim(), phone.trim(), hash, role],
  );
  return res
    .status(201)
    .json({ user: pub(r.rows[0]), token: token(r.rows[0]) });
}
async function login(req, res) {
  const { email, password } = req.body || {};
  const r = await query(
    "SELECT id,full_name,email,phone,role,aadhaar_verified,password_hash FROM users WHERE email=LOWER($1)",
    [email],
  );
  if (
    !r.rows[0] ||
    typeof password !== "string" ||
    !(await bcrypt.compare(password, r.rows[0].password_hash))
  )
    throw createHttpError(401, "Invalid email or password");
  return res.json({ user: pub(r.rows[0]), token: token(r.rows[0]) });
}
module.exports = { register, login };
