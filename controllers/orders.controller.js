const Order = require("../models/order.model");
const Product = require("../models/product.model");
const Menu = require("../models/menu.model");
const User = require("../models/user.model");
const mongoose = require("mongoose");

const generateOrderNumber = () => {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const random = Math.floor(1000 + Math.random() * 9000);

    return `CMD-${date}-${random}`;
};

exports.getOrders = async (req, res) => {
    let roleFilter = {};

    if (req.user.role === "order_picker") {
        roleFilter = {
            $or: [{ status: "awaiting_preparation" }, { status: "in_preparation" }],
        };
    }
    if (req.user.role === "reception") {
        roleFilter = {
            status: "prepared",
        };
    }
    try {
        const orders = await Order.find(roleFilter)
            .populate("user", "name email")
            .populate("products.product", "name image availability price")
            .populate("menus.menu", "name image availability price")
            .sort({ deliveryTime: 1 });

        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({
            error: "Erreur lors de la récupération des commandes",
        });
    }
};

exports.getOrder = async (req, res) => {
    try {
        const id = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: "ID invalide" });

        const order = await Order.findById(id)
            .populate("user", "name email")
            .populate("products.product", "name image availability price")
            .populate("menus.menu", "name image availability price");

        if (!order) return res.status(404).json({ error: "Commande introuvable" });

        if (
            req.user.role === "order_picker" &&
            order.status !== "awaiting_preparation" &&
            order.status !== "in_preparation"
        )
            return res.status(403).json({ message: "Accès refusé" });

        if (req.user.role === "reception" && order.status !== "prepared")
            return res.status(403).json({ message: "Accès refusé" });

        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({
            error: "Erreur lors de la récupération de la commande",
        });
    }
};

exports.createOrder = async (req, res) => {
    let orderPrice = 0;

    try {
        const { products, menus, user, deliveryTime } = req.body;

        if (
            !Array.isArray(products) ||
            !Array.isArray(menus) ||
            (products.length === 0 && menus.length === 0) ||
            !user ||
            !deliveryTime
        ) {
            return res.status(400).json({
                error: "Produits, menus, utilisateur et heure de livraison obligatoires",
            });
        }

        if (!mongoose.Types.ObjectId.isValid(user)) {
            return res.status(400).json({ error: "ID utilisateur invalide" });
        }

        const existingUser = await User.findById(user);
        if (!existingUser) {
            return res.status(400).json({ error: "Utilisateur introuvable" });
        }

        for (const item of products) {
            if (!mongoose.Types.ObjectId.isValid(item.product)) {
                return res.status(400).json({ error: "ID produit invalide" });
            }

            const existingProduct = await Product.findById(item.product);
            if (!existingProduct) {
                return res.status(400).json({ error: "Produit introuvable" });
            }

            const quantity = item.quantity || 1;
            if (quantity < 1) {
                return res.status(400).json({ error: "La quantité doit être au minimum de 1" });
            }

            orderPrice += existingProduct.price * quantity;
            item.quantity = quantity;
            item.unitPrice = existingProduct.price;
        }

        for (const item of menus) {
            if (!mongoose.Types.ObjectId.isValid(item.menu)) {
                return res.status(400).json({ error: "ID menu invalide" });
            }

            const existingMenu = await Menu.findById(item.menu);
            if (!existingMenu) {
                return res.status(400).json({ error: "Menu introuvable" });
            }

            const quantity = item.quantity || 1;
            if (quantity < 1) {
                return res.status(400).json({ error: "La quantité doit être au minimum de 1" });
            }

            orderPrice += existingMenu.price * quantity;
            item.quantity = quantity;
            item.unitPrice = existingMenu.price;
        }

        const order = new Order({
            orderNumber: generateOrderNumber(),
            products,
            menus,
            user,
            totalPrice: orderPrice,
            deliveryTime,
        });

        const newOrder = await order.save();

        res.status(201).json(newOrder);
    } catch (error) {
        res.status(500).json({
            error: "Erreur lors de la création de la commande",
        });
    }
};

exports.updateOrder = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: "ID invalide" });

        const { status, deliveryTime } = req.body;

        const order = await Order.findById(id);
        if (!order) return res.status(404).json({ error: "Commande introuvable" });

        if (status !== undefined) {
            if (req.user.role === "order_picker" && status !== "in_preparation" && status !== "prepared")
                return res.status(403).json({ error: "Changement de statut refusé" });
            if (req.user.role === "reception" && status !== "delivered")
                return res.status(403).json({ error: "Changement de statut refusé" });

            order.status = status;
        }

        if (deliveryTime !== undefined) {
            if (req.user.role !== "admin" && req.user.role !== "reception") {
                return res.status(403).json({
                    error: "Modification de l'heure de livraison refusée",
                });
            }

            order.deliveryTime = deliveryTime;
        }

        const updatedOrder = await order.save();
        res.status(200).json(updatedOrder);
    } catch (error) {
        res.status(500).json({ error: "Erreur lors de la modification de la commande" });
    }
};

exports.deleteOrder = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: "ID invalide" });

        const order = await Order.findById(id);
        if (!order) return res.status(404).json({ error: "Commande introuvable" });

        await order.deleteOne();
        res.status(200).json({ message: "Commande supprimée avec succès" });
    } catch (error) {
        res.status(500).json({ error: "Erreur lors de la suppression de la commande" });
    }
};
