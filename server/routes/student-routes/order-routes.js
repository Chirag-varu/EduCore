import { Router } from "express";
import orderController from "../../controllers/student-controller/order-controller.js";
const { createOrder, capturePaymentAndFinalizeOrder } = orderController;

const router = Router();

router.post("/create", createOrder);
router.post("/capture", capturePaymentAndFinalizeOrder);

export default router;
