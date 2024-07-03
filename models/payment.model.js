import { Schema , model } from 'mongoose';

const paymentSchema = new Schema({
    razorpay_payment_id : {
        type : String,
        require : true
    },

    razorpay_signature : {
        type : String,
        require : true
    },

    razorpay_subscription_id : {
        type : String,
        require: true
    }
},{
    timestamps : true
});

const Payment = model('Payment' , paymentSchema);

export default Payment;