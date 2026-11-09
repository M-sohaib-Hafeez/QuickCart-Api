import { Router } from 'express';
import {addtoCart, getCart} from "./cartController.js";

const router = Router();

router.post('/', addtoCart);
router.get('/:userId', getCart);

export default router;