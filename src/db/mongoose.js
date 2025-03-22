import mongoose from 'mongoose'

let connection = await mongoose.connect(process.env.MONGODB_URL)