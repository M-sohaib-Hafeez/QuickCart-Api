import prisma from "../config/db.js";

export const createProduct = async (req, res) => {
    try {
        const {name, price, stock} = req.body;
        const product = await prisma.product.create({data: {name, price, stock}});
        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
};

export const getAllProducts = async (req, res) => {
    try {
        const products = await prisma.product.findMany();
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
};

