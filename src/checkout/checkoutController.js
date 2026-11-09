import prisma from "../config/db.js";

export const checkout = async (req, res) => {
    const userId = parseInt(req.params.userId);

    try{
        const cart = await prisma.cartItem.findMany({
            where: {userId},
            include: {product: true}
        });
        if(cart.length === 0){
            return res.status(404).json({message: "Cart is empty"});
        }
        for (const item of cart){
            if(item.product.stock < item.quantity){
                return res.status(400).json({error: `Insufficient stock for ${item.product.name}. Available: ${item.product.stock}`});
            }
        }
        const totalamount = cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);

        const newOrder = await prisma.$transaction(async (tx) => {
            const order = await tx.order.create({
                data: {
                    userId,
                    totalamount,
                    item: {
                        create: cart.map(item => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            price: item.product.price
                        }))
                    }
                }
            });

            for (const item of cart){
                await tx.product.update({
                    where: {id: item.productId},
                    data: {stock: {decrement: item.quantity}}
                });
            }
             await tx.cartItem.deleteMany({where: {userId}});
            return order;
        });
        res.status(201).json({message: "Order placed successfully", order: newOrder});
    } catch (error) {
        console.error("checkout failed" , error);
        res.status(500).json({error: "Checkout failed due to server error"});
    }
};