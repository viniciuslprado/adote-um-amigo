const express = require("express");
const adoptionController = require("../controllers/adoptionController");
const { authenticate, optionalAuthenticate, authorizeRoles } = require("../middleware/auth");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.post("/", optionalAuthenticate, asyncHandler(adoptionController.createAdoptionRequest));
router.get("/", authenticate, asyncHandler(adoptionController.listAdoptionRequests));
router.get("/:id", authenticate, asyncHandler(adoptionController.getAdoptionRequest));
router.patch(
  "/:id/status",
  authenticate,
  authorizeRoles("admin"),
  asyncHandler(adoptionController.updateAdoptionStatus)
);

module.exports = router;
