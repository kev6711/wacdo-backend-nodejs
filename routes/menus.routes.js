const express = require("express");
const auth = require("../middleware/auth");
const authorizeRoles = require("../middleware/role");
const upload = require("../middleware/multer");
const { getMenus, getMenu, createMenu, updateMenu, deleteMenu } = require("../controllers/menus.controller");
const router = express.Router();

router.get("/", auth, authorizeRoles("admin"), getMenus);
router.get("/:id", auth, authorizeRoles("admin"), getMenu);
router.post("/", auth, authorizeRoles("admin"), upload.single("image"), createMenu);
router.put("/:id", auth, authorizeRoles("admin"), upload.single("image"), updateMenu);
router.delete("/:id", auth, authorizeRoles("admin"), deleteMenu);

module.exports = router;
