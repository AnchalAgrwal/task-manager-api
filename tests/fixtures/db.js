import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'
import User from '../../src/models/user'
import Task from '../../src/models/task'

const userId = new mongoose.Types.ObjectId()
const userOne = {
    _id: userId,
    name:'Anchal',
    email:'anchal@example.com',
    password:'Anchalexample@',
    tokens:[{
        token: jwt.sign({id:userId}, process.env.JWT_SECRET)
    }]
}


const userTwoId = new mongoose.Types.ObjectId()
const userTwo = {
    _id: userTwoId,
    name:'Anand',
    email:'anand@example.com',
    password:'Anandexample@',
    tokens:[{
        token: jwt.sign({id:userTwoId}, process.env.JWT_SECRET)
    }]
}


const taskOne = {
    _id: new mongoose.Types.ObjectId(),
    desc:'First Task',
    isCompleted: false,
    owner: userOne._id
}


const taskTwo = {
    _id: new mongoose.Types.ObjectId(),
    desc:'Second Task',
    isCompleted: true,
    owner: userTwo._id
}


const taskThree = {
    _id: new mongoose.Types.ObjectId(),
    desc:'Third Task',
    isCompleted: true,
    owner: userOne._id
}


const setupDB = async () => {
    await User.deleteMany()
    await Task.deleteMany()
    await new User(userOne).save()
    await new User(userTwo).save()
    await new Task(taskOne).save()
    await new Task(taskTwo).save()
    await new Task(taskThree).save()
}

export {
    setupDB, 
    userId, 
    userOne,
    userTwoId,
    userTwo,
    taskOne,
    taskTwo,
    taskThree
}