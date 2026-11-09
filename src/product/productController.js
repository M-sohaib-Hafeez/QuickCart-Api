import prisma from "../config/db.js";

export const createProduct = async (req, res) => {
    try {
        const { name, price, stock = 0 } = req.body;
        if (typeof name !== "string" || !name.trim()) {
            return res.status(400).json({ error: "name is required" });
        }
        if (typeof price !== "number" || !(price >= 0)) {
            return res.status(400).json({ error: "price must be a non-negative number" });
        }
        if (!Number.isInteger(stock) || stock < 0) {
            return res.status(400).json({ error: "stock must be a non-negative integer" });
        }
        const product = await prisma.product.create({ data: { name: name.trim(), price, stock } });
        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getAllProducts = async (req, res) => {
    try {
        const products = await prisma.product.findMany();
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};