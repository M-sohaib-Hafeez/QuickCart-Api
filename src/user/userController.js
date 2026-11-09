import prisma from "../config/db.js";

export const createUser = async (req, res) => {
    try {
        const { name, email } = req.body;
        if (typeof name !== "string" || !name.trim() || typeof email !== "string" || !email.trim()) {
            return res.status(400).json({ error: "name and email are required" });
        }
        const user = await prisma.user.create({ data: { name: name.trim(), email: email.trim().toLowerCase() } });
        res.status(201).json(user);
    } catch (error) {
        if (error.code === "P2002") {
            return res.status(409).json({ error: "A user with this email already exists" });
        }
        res.status(500).json({ error: error.message });
    }
};

export const getAllUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};