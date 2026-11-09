import prisma from "../config/db.js";
import { toPositiveInt } from "../utils/validate.js";

class CheckoutError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}

export const checkout = async (req, res) => {
    const userId = toPositiveInt(req.params.userId);
    if (!userId) {
        return res.status(400).json({ error: "userId must be a positive integer" });
    }

    try {
        const order = await prisma.$transaction(async (tx) => {
            const cart = await tx.cartItem.findMany({
                where: { userId },
                include: { product: true }
            });
            if (cart.length === 0) {
                throw new CheckoutError(404, "Cart is empty");
            }
            
            for (const item of cart) {
                const result = await tx.product.updateMany({
                    where: { id: item.productId, stock: { gte: item.quantity } },
                    data: { stock: { decrement: item.quantity } }
                });
                if (result.count === 0) {
                    throw new CheckoutError(
                        400,
                        `Insufficient stock for ${item.product.name}. Requested: ${item.quantity}`
                    );
                }
            }

            const totalAmount = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

            const newOrder = await tx.order.create({
                data: {
                    userId,
                    totalAmount,
                    items: {
                        create: cart.map((item) => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            price: item.product.price
                        }))
                    }
                },
                include: { items: true }
            });

            await tx.cartItem.deleteMany({ where: { userId } });
            return newOrder;
        });

        res.status(201).json({ message: "Order placed successfully", order });
    } catch (error) {
        if (error instanceof CheckoutError) {
            return res.status(error.status).json({ error: error.message });
        }
        console.error("checkout failed", error);
        res.status(500).json({ error: "Checkout failed due to server error" });
    }
};