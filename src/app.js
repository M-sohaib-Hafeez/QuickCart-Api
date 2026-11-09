import express from 'express';
import cors from 'cors';
import usersRouter from './user/userRoutes.js';
import productsRouter from './product/productRoutes.js';
import checkoutRouter from './checkout/checkoutRoutes.js';
import cartRouter from './cart/cartRoutes.js';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/users', usersRouter);
app.use('/api/products', productsRouter);
app.use('/api/cart', cartRouter);
app.use('/api/checkout', checkoutRouter);

app.get('/', (req, res) => res.json({ message: 'Welcome to QuickCart API' }));

app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

app.use((err, req, res, next) => {
    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({ error: 'Invalid JSON body' });
    }
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

export default app;