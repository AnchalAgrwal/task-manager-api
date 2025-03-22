import mongoose from 'mongoose'

const taskSchema = new mongoose.Schema({
    desc: {
        type: String,
        required: true,
        trim: true,
    }, 
    isCompleted: {
        type: Boolean,
        default: false,
    },
    owner:{
        type: mongoose.Schema.Types.ObjectId,//type of object id
        required: true,
        ref:'User'
    }
}, {
    timestamps: true
})


//collection name = converts given name to lowercase + makes it plural 
const Task = mongoose.model('Task', taskSchema)

export default Task;