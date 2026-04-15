const express = require("express");
const auth = require("../middleware/auth");
const isAdmin = require("../middleware/isAdmin");
const { body } = require("express-validator");
const {
    getUsers,
    getUser,
    createUser,
    login,
} = require("../controllers/users.controller");
const router = express.Router();

router.get("/", auth, isAdmin, getUsers);
router.get("/:id", auth, isAdmin, getUser);
router.post("/", auth, isAdmin, createUser);
router.post("/login", body("email").isEmail(), login);

module.exports = router;
