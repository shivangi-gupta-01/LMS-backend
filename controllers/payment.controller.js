import Payment from "../models/payment.model.js";
import User from '../models/user.model.js';
import { razorpay } from "../server.js";
import AppError from '../utils/appError.js';
import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();
export const razorpayApiKey = async (req , res , next) => {

    try {
        console.log(process.env.RAZORPAY_KEY_ID);
        return res.status(200).json({
            success : true,
            message : 'RAZORPAY API KEY',
            key : process.env.RAZORPAY_KEY_ID
        })
        

    } catch (err) {
        return next(new AppError(err.message , 500));
    }
}
export const buySubscription = async (req , res , next) => {
    try {
      
    const subscription = await razorpay.subscriptions.create({
                plan_id: process.env.RAZORPAY_PLAN_ID,
                customer_notify: 1,
                total_count: 12
            });
        //update user model with subscription

        res.status(200).json({
            success : true,
            message : 'Subscribed successfully',
            subscription_id: subscription.id
        });
        console.log(subscription.id);
        //     console.log('Subscription created:', subscription);
        } catch (error) {
            console.error('Error creating subscription:', error);
        }
        
        

}
export const verifySubscription = async (req , res , next) => {

    try {

        const { id } = req.user;

        const user = await User.findById(id);

        if(!user){
            return next(new AppError('Unauthorized, please login', 500));
        }

        const { razorpay_payment_id , razorpay_subscription_id , razorpay_signature} = req.body;

        const subscription = crypto.createHmac('sha256' , process.env.RAZORPAY_SECRET).update(`${razorpay_payment_id}|${razorpay_subscription_id}`).digest('hex');

        //check the both subscription and payment_signature
        if(subscription !== razorpay_signature){
            return next(new AppError('Payment not verified, please try again' , 500));
        }

        // save the details into payment collection
        // update user mode subscription status
        user.subscription.status = 'active';

        await user.save();
        
        await Payment.create({
            razorpay_payment_id,
            razorpay_signature,
            razorpay_subscription_id
        });


        console.log(user);
        res.status(200).json({
            success :true,
            message: 'Payment verified successfully'
        });

    } catch (err) {
        return next(new AppError(err.message , 500));
    }
}
export const cancelSubscription = async (req , res , next) => {

    try {
        const { id } = req.user.id;

        const user = await User.findById(id);

        if(!user){
            return next(new AppError('Unauthorized, please login', 500));
        }

        if(user.role === 'ADMIN'){
            return next(new AppError('Admin can not cancel a subscription', 400));
        }

        const subscriptionId = req.user.subscription.id;

        const subscription = await razorpay.subscriptions.cancel(
            subscriptionId
        );

        user.subscription.status = subscription.status;

        await user.save();

        res.status(200).json({
            success : true,
            message : 'Subscription cancelled'
        });

    } catch (err) {
        return next(new AppError(err.message , 500));
    }
}
export const getPaymentDetails = async (req , res , next) => {

    try {
        const { count } = req.query;

        const subscriptions = await razorpay.subscriptions.all({
            count: count || 10
        });

        res.status(200).json({
            success :true,
            message : 'All payments',
            payments: subscriptions
        });

    } catch (err) {
        return next(new AppError(err.message , 500));
    }
}
