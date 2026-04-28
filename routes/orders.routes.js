const express = require("express");
const auth = require("../middleware/auth");
const authorizeRoles = require("../middleware/role");
const { getOrders, getOrder, createOrder, updateOrder, deleteOrder } = require("../controllers/orders.controller");
const router = express.Router();

router.get("/", auth, getOrders);
router.get("/:id", auth, getOrder);
router.post("/", auth, authorizeRoles("admin", "reception"), createOrder);
router.put("/:id", auth, updateOrder);
router.delete("/:id", auth, authorizeRoles("admin"), deleteOrder);

module.exports = router;
