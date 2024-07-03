import AppError from "../utils/appError.js";
import sendEmail from "../utils/sendEmail.js";

const contactUs = async (req, res , next) => {

    const { name, email, message } = req.body;

    if(!name || !email || !message){
        return next(new AppError('Name, Email, Message are required'));
    }

    try {
        
        const subject = 'Contact Us Form';
        // const textMessage = `${name} - ${email} <br /> ${message}`;
        const textMessage = `
            <div style="font-family: Arial, sans-serif; background-color:#f4f4f4; padding: 20px; border-radius: 5px;">
            <p style="margin-bottom: 10px;"><strong>Name:</strong> ${name}</p>
            <p style="margin-bottom: 10px;"><strong>Email:</strong> ${email}</p>
            <p><strong>Message:</strong><br />${message}</p>
        </div>`;


        await sendEmail(process.env.CONTACT_US_EMAIL , subject , textMessage);

    } catch (error) {
        console.log(error);
        return next(new AppError(error.message , 400));
    }

    res.status(200).json({
        success : true,
        message: 'Your request has been submitted successfully'
    });
}

export default contactUs;