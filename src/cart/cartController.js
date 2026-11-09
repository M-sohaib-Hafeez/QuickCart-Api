import prisma from "../config/db.js";
import { toPositiveInt } from "../utils/validate.js";

export const addtoCart = async (req, res) => {
    try {
        const userId = toPositiveInt(req.body.userId);
        const productId = toPositiveInt(req.body.productId);
        const quantity = toPositiveInt(req.body.quantity ?? 1);

        if (!userId || !productId || !quantity) {
            return res.status(400).json({ error: "userId, productId and quantity must be positive integers" });
        }

        const [user, product] = await Promise.all([
            prisma.user.findUnique({ where: { id: userId } }),
            prisma.product.findUnique({ where: { id: productId } })
        ]);
        if (!user) return res.status(404).json({ error: `User ${userId} not found` });
        if (!product) return res.status(404).json({ error: `Product ${productId} not found` });

        const cartItem = await prisma.cartItem.upsert({
            where: { userId_productId: { userId, productId } },
            update: { quantity: { increment: quantity } },
            create: { userId, productId, quantity }
        });
        res.status(200).json(cartItem);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getCart = async (req, res) => {
    try {
        const userId = toPositiveInt(req.params.userId);
        if (!userId) {
            return res.status(400).json({ error: "userId must be a positive integer" });
        }
        const cart = await prisma.cartItem.findMany({
            where: { userId },
            include: { product: true }
        });
        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};