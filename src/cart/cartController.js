import prisma from "../config/db.js";

export const addtoCart = async (req , res) => {
    try{
        const {userId , productId , quantity} = req.body;
        const cartItem = await prisma.cartItem.upsert({
            where: {userId_productId: {userId, productId}},
            update: {quantity: {increment: quantity}},
            create: {userId, productId, quantity}
        })
        res.status(200).json(cartItem);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
};

export const getCart = async (req , res) => {
    try{
        const userId = parseInt(req.params.userId);
        const cart= await prisma.cartItem.findMany({
            where: {userId},
            include: {product: true}
        });
        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
};

