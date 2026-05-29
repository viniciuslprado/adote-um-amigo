const bcrypt = require("bcryptjs");
const User = require("../models/User");

async function bootstrapAdmin() {
  const username = process.env.ADMIN_USERNAME || "admin";
  const email = process.env.ADMIN_EMAIL || "admin@adote.local";
  const password = process.env.ADMIN_PASSWORD || "admin123";
  const name = process.env.ADMIN_NAME || "Administrador";

  if (!username || !email || !password) {
    console.warn("Admin seed skipped: ADMIN_USERNAME, ADMIN_EMAIL or ADMIN_PASSWORD not configured.");
    return;
  }

  const existingAdmin = await User.findOne({
    $or: [{ username }, { email }],
  });
  const passwordHash = await bcrypt.hash(password, 10);

  if (existingAdmin) {
    existingAdmin.name = name;
    existingAdmin.email = email;
    existingAdmin.username = username;
    existingAdmin.passwordHash = passwordHash;
    existingAdmin.role = "admin";
    existingAdmin.active = true;
    await existingAdmin.save();
    console.log(`Admin user ready: ${username}`);
    return;
  }

  await User.create({
    name,
    email,
    username,
    passwordHash,
    role: "admin",
    active: true,
  });

  console.log(`Admin user created: ${username}`);
}

module.exports = bootstrapAdmin;
