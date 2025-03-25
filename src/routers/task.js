import express from 'express'
import Task from '../models/task.js'
import auth from '../middlewares/auth.js'

//creating a new router for task
const router = new express.Router()


//create task 
router.post('/tasks', auth, async(req, res) => {
    const task = new Task({
        ...req.body,
        owner: req.user.id
    })

    try{
        await task.save()
        res.send(task)
    }catch(err){
        res.status(400).send(err)
    }
})


//read all tasks with optional filtering by isCompleted
router.get('/tasks', auth, async(req, res) => {
    const match = {}
    const sort = {}

    if(req.query.isCompleted){
        match.isCompleted = req.query.isCompleted === 'true'
    }

    if(req.query.sortBy){
        const parts = req.query.sortBy.split(':')//splitting sortBy string by special character ':', path = [createdAt, desc]
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }

    try{
        await req.user.populate({
            path: 'tasks', 
            match,
            options:{
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        })
        res.send(req.user.tasks)
    }catch(e){
        res.status(500).send(e)
    }
})


router.get('/tasks/:id', auth, async(req, res) => {
    const id = req.params.id
    try{
        const task = await Task.findOne({id , owner: req.user._id})

        if(!task){
            res.status(404).send()
        }

        res.send(task)
    }catch(e){
        res.status(500).send(e)
    }
})  



//resource updating endpoint -> updating task by id
router.patch('/tasks/:id', async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['desc', 'isCompleted']
    const isValid = updates.every((update) => allowedUpdates.includes(update))

    if(!isValid){
        return res.status(400).send('Error: Invalid Update')
    }

   try{
        const task = await Task.findOne({_id:req.params.id, owner:req.user._id}) //find task

        if(!task){
            res.send(404).send('No task found')
        }

       updates.forEach((update) => task[update] = req.body[update]) //update
        await task.save() //save 
        res.send(task)
   }catch(e){
        res.status(400).send(e)
   }
})



//resource deleting endpoint -> deleting task
router.delete('/tasks/:id', auth, async(req, res) => {
    try{
        const task = await Task.findOneAndDelete({_id: req.params.id, owner:req.user._id})

        if(!task){
            //if the entered id does not exist
            return res.status(404).send()
        }

        return res.send(task)
    }catch(e){
        //in case of invalid task id
        res.status(400).send(e)
    }
})


export default router