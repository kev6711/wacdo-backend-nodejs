const User = require("../models/user.model");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.getUsers = async (req, res) => {
    try {
        const users = await User.find().sort({ createdAt: -1 });
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({
            error: "Erreur lors de la récupération des utilisateurs",
        });
    }
};

exports.getUser = async (req, res) => {
    try {
        const id = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(id))
            return res.status(400).json({ error: "ID invalide" });

        const user = await User.findById(id);
        if (!user) return res.status(404).json({ error: "Utilisateur introuvable" });

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({
            error: "Erreur lors de la récupération de l'utilisateur",
        });
    }
};

exports.createUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        if (!email || !password)
            return res.status(400).json({ error: "Email et mot de passe obligatoire" });

        const existingUser = await User.findOne({ email });
        if (existingUser)
            return res.status(400).json({ message: "Compte déjà existant" });

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            name,
            email,
            password: hashedPassword,
            role,
        });

        const newUser = await user.save();
        res.status(201).json(newUser);
    } catch (error) {
        res.status(500).json({ error: "Erreur lors de la création de l'utilisateur" });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({ error: "Email et mot de passe obligatoire" });

        const existingUser = await User.findOne({ email });
        if (!existingUser)
            return res.status(401).json({ message: "Identifiants invalides" });

        const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);
        if (!isPasswordCorrect)
            return res.status(401).json({ message: "Identifiants invalides" });

        const token = jwt.sign({ userId: existingUser._id }, "JWT_SECRET", {
            expiresIn: "7d",
        });
        res.status(200).json({ token });
    } catch (error) {
        res.status(500).json({ error: "Erreur lors de la connexion" });
    }
};
