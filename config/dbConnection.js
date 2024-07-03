import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
mongoose.set('strictQuery' , false);

const connectToDB = async () => {

    try {
        const { connection } = await mongoose.connect(
            process.env.MONGO_URL
        );
    
    
        if(connection){
            console.log(`Connection to MongoDB: ${connection.host}`);
        }
    } catch(err) {
        console.log(err);
        process.exit(1);
    }
}

export default connectToDB;