const express = require("express");
const animalController = require("../controllers/animalController");
const { authenticate, authorizeRoles } = require("../middleware/auth");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.get("/", asyncHandler(animalController.listAnimals));
router.get("/admin/list", authenticate, authorizeRoles("admin"), asyncHandler(animalController.listDatabaseAnimals));
router.post("/import/dogs", authenticate, authorizeRoles("admin"), asyncHandler(animalController.importDogs));
router.post("/import/cats", authenticate, authorizeRoles("admin"), asyncHandler(animalController.importCats));
router.get("/external", asyncHandler(animalController.listExternalAnimals));
router.get("/:id", asyncHandler(animalController.getAnimal));
router.post("/", authenticate, authorizeRoles("admin"), asyncHandler(animalController.createAnimal));
router.put("/:id", authenticate, authorizeRoles("admin"), asyncHandler(animalController.replaceAnimal));
router.patch("/:id", authenticate, authorizeRoles("admin"), asyncHandler(animalController.updateAnimal));
router.delete("/:id", authenticate, authorizeRoles("admin"), asyncHandler(animalController.deleteAnimal));

module.exports = router;
