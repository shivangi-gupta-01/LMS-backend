import express from 'express';
import { authorizedRoles, isLoggedIn } from '../middlewares/auth.middleware.js';
import { buySubscription, cancelSubscription, getPaymentDetails, razorpayApiKey, verifySubscription } from '../controllers/payment.controller.js';

const router = express.Router();

router
      .route('/razorpay-key')
      .get(
        razorpayApiKey
        );

router
      .route('/subscribe')
      .post(
        buySubscription
        );

router
      .route('/verify')
      .post(
        verifySubscription
        );

router
      .route('/unsubscribe')
      .post(
        cancelSubscription
        );

router
      .route('/')
      .get(
        authorizedRoles('ADMIN'),
        getPaymentDetails
        );


export default router;