const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { z } = require("zod");
const User = require("../models/User");

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email().optional(),
  username: z.string().min(1).optional(),
  password: z.string().min(1),
}).refine((data) => data.email || data.username, {
  message: "Informe email ou username.",
});

function signToken(user) {
  return jwt.sign(
    {
        id: user._id.toString(),
        email: user.email,
        username: user.username,
        role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
  );
}

async function register(req, res) {
  const data = registerSchema.parse(req.body);
  const existingUser = await User.findOne({ email: data.email });

  if (existingUser) {
    return res.status(409).json({ message: "E-mail ja cadastrado." });
  }

  const passwordHash = await bcrypt.hash(data.password, 10);
  const user = await User.create({ ...data, passwordHash });
  const token = signToken(user);

  return res.status(201).json({ user, token });
}

async function login(req, res) {
  const data = loginSchema.parse(req.body);
  const user = await User.findOne({
    active: true,
    $or: [
      ...(data.email ? [{ email: data.email }] : []),
      ...(data.username ? [{ username: data.username.toLowerCase() }] : []),
    ],
  });

  if (!user) {
    return res.status(401).json({ message: "Credenciais invalidas." });
  }

  const passwordMatches = await bcrypt.compare(data.password, user.passwordHash);

  if (!passwordMatches) {
    return res.status(401).json({ message: "Credenciais invalidas." });
  }

  return res.json({ user, token: signToken(user) });
}

async function me(req, res) {
  const user = await User.findById(req.user.id);

  if (!user || !user.active) {
    return res.status(404).json({ message: "Usuario nao encontrado." });
  }

  return res.json(user);
}

async function listUsers(req, res) {
  const users = await User.find().sort({ createdAt: -1 });
  return res.json(users);
}

async function updateUserRole(req, res) {
  const roleSchema = z.object({ role: z.enum(["admin", "user"]) });
  const { role } = roleSchema.parse(req.body);
  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });

  if (!user) {
    return res.status(404).json({ message: "Usuario nao encontrado." });
  }

  return res.json(user);
}

module.exports = { register, login, me, listUsers, updateUserRole };
