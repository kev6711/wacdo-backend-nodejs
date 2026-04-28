const express = require("express");
const auth = require("../middleware/auth");
const authorizeRoles = require("../middleware/role");
const upload = require("../middleware/multer");
const {
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
} = require("../controllers/products.controller");
const router = express.Router();

router.get("/", auth, authorizeRoles("admin"), getProducts);
router.get("/:id", auth, authorizeRoles("admin"), getProduct);
router.post("/", auth, authorizeRoles("admin"), upload.single("image"), createProduct);
router.put("/:id", auth, authorizeRoles("admin"), upload.single("image"), updateProduct);
router.delete("/:id", auth, authorizeRoles("admin"), deleteProduct);

module.exports = router;
