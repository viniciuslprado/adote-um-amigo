const express = require("express");
const authController = require("../controllers/authController");
const { authenticate, authorizeRoles } = require("../middleware/auth");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.post("/register", asyncHandler(authController.register));
router.post("/login", asyncHandler(authController.login));
router.get("/me", authenticate, asyncHandler(authController.me));
router.get("/users", authenticate, authorizeRoles("admin"), asyncHandler(authController.listUsers));
router.patch(
  "/users/:id/role",
  authenticate,
  authorizeRoles("admin"),
  asyncHandler(authController.updateUserRole)
);

module.exports = router;
