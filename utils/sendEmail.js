import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();
const sendEmail = async function(email , subject , message){
    // creating reusable transporter object using the default SMTP transport

    let transport = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
          user: "1234shivangigupta@gmail.com",
          pass: "fzfq umns eurg xada",
        },
      });

    // send mail with defined transport object
    await transport.sendMail({
        from: "1234shivangigupta@gmail.com", // sender address
        to: email, //user email
        subject: subject,
        html: message,
    })
}

export default sendEmail;
