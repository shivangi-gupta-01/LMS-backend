import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import errorMiddleware from './middlewares/error.middleware.js';
import userRoute from './routes/user.routes.js';
import courseRoute from './routes/course.routes.js';
import paymentRoute from './routes/payment.routes.js';
import miscRoute from './routes/miscellaneous.routes.js';
import connectToDB from './config/dbConnection.js';
import morgan from 'morgan';
import dotenv from 'dotenv';
dotenv.config();
const app = express();
app.use(cors({
    origin : ["http://localhost:5173","http://localhost:5173/", "https://lms-frontend-red.vercel.app/" , "https://lms-frontend-red.vercel.app"],
    credentials: true
}));
connectToDB();

app.use((req, res, next) => {
    // res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
    res.setHeader('Access-Control-Allow-Origin', 'https://lms-frontend-red.vercel.app');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    next();
});



// app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
app.use(morgan('dev'));

app.get('/ping' , ( req , res) => {
   return res.send('Pong');
});
app.use('/api/v1/user' , userRoute);
app.use('/api/v1/course' , courseRoute);
app.use('/api/v1/payment' , paymentRoute);
app.use('/api/v1' , miscRoute);

app.use('*' , ( req , res) => {
   return res.status(404).send('Oops!! 404 page not found');
});

app.use(errorMiddleware);

export default app;
