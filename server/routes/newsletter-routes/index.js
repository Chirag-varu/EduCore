import express from 'express';
import authenticate from '../../middleware/auth-middleware.js';
import subscriptionController from '../../controllers/newsletter/subscription-controller.js';
import newsletterController from '../../controllers/newsletter/newsletter-controller.js';

const router = express.Router();

// Public routes for subscription management
router.post('/subscribe', subscriptionController.subscribeToNewsletter);
router.post('/unsubscribe', subscriptionController.unsubscribeFromNewsletter);
router.get('/confirm/:token', subscriptionController.confirmSubscription);

// Protected routes for administrators
router.use('/admin', authenticate);
router.get('/admin/subscriptions', subscriptionController.getSubscriptions);

// Newsletter management (admin only)
router.post('/admin', newsletterController.createNewsletter);
router.get('/admin', newsletterController.getNewsletters);
router.get('/admin/:id', newsletterController.getNewsletterById);
router.put('/admin/:id', newsletterController.updateNewsletter);
router.post('/admin/:id/send', newsletterController.sendNewsletter);
router.delete('/admin/:id', newsletterController.deleteNewsletter);

export default router;