import { Router } from 'express';
import {checkout} from "./checkoutController.js";

const router = Router();

router.post('/:userId', checkout);

export default router;