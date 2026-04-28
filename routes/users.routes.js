const express = require("express");
const auth = require("../middleware/auth");
const authorizeRoles = require("../middleware/role");
const { body } = require("express-validator");
const { getUsers, getUser, createUser, updateUser, deleteUser, login } = require("../controllers/users.controller");
const router = express.Router();

router.post("/login", body("email").isEmail(), login);
router.post("/", auth, authorizeRoles("admin"), body("email").isEmail(), createUser);
router.get("/", auth, authorizeRoles("admin"), getUsers);
router.get("/:id", auth, authorizeRoles("admin"), getUser);
router.put("/:id", auth, authorizeRoles("admin"), body("email").optional().isEmail(), updateUser);
router.delete("/:id", auth, authorizeRoles("admin"), deleteUser);

module.exports = router;
