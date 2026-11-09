import { Router } from 'express';
import {createProduct, getAllProducts} from "./productController.js";

const router = Router();
router.post('/', createProduct);
router.get('/', getAllProducts);

export default router;
