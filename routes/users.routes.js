const express = require("express");
const {
    getUsers,
    getUser,
    createUser,
    login,
} = require("../controllers/users.controller");
const router = express.Router();

router.get("/", getUsers);
router.get("/:id", getUser);
router.post("/", createUser);
router.post("/login", login);

module.exports = router;
