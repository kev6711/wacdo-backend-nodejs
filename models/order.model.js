const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
    {
        status: {
            type: String,
            enum: ["awaiting_preparation", "in_preparation", "prepared", "delivered"],
            default: "awaiting_preparation",
            required: true,
        },

        products: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product",
                    required: true,
                },
                quantity: {
                    type: Number,
                    required: true,
                    min: 1,
                    default: 1,
                },
                unitPrice: {
                    type: Number,
                    required: true,
                    min: 0,
                },
            },
        ],

        menus: [
            {
                menu: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Menu",
                    required: true,
                },
                quantity: {
                    type: Number,
                    required: true,
                    min: 1,
                    default: 1,
                },
                unitPrice: {
                    type: Number,
                    required: true,
                    min: 0,
                },
            },
        ],

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        totalPrice: {
            type: Number,
            required: true,
            min: 0,
        },
        deliveryTime: {
            type: Date,
            required: true,
        },
    },
    { timestamps: true },
);

module.exports = mongoose.model("Order", orderSchema);
