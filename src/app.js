import express from 'express';
import cors from 'cors';
import productsRouter from './product/productRoutes.js';
import checkoutRouter from './checkout/checkoutRoutes.js';
import cartRouter from './cart/cartRoutes.js';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/products', productsRouter);
app.use('/api/checkout', checkoutRouter);
app.use('/api/cart', cartRouter);

app.get('/', (req, res) => res.json({message: 'Welcome to QuickCart API'}));

app.use((req , res) => res.status(404).json({error: 'Route not found'}));

export default app;