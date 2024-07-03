import { Schema , model } from 'mongoose';

const courseSchema = new Schema({
    title : {
        type: String,
        require: [true , "Title is required"],
        minLen: [8 , "Title must be at least 8 characters"],
        maxLen: [60 , "Title must less than 60 characters"],
        trim: true
    },

    description : {
        type: String,
        require: [true , "description is required"],
        minLen: [8 , "description must be at least 8 characters"],
        maxLen: [200 , "description must less than 200 characters"],
        trim: true
    },

    category : {
        type :String,
        require : [true , 'Category is required']
    },

    thumbnail : {
        public_id : {
            type: String,
            require: true
        },

        secure_url: {
            type :String,
            require: true
        }
    },

    lectures : [{
        title : String,
        description : String,
        lecture : {
            public_id : {
                type : String,
                require : true
            },

            secure_url : {
                type: String,
                require: true
            }
        }
    }],

    numOfLectures : {
        type : Number,
        default: 0
    },

    createdBy : {
        type : String,
        required: true
    }
}, {
    timestamps : true
});

const Course = model('Course' , courseSchema);

export default Course;