import express from 'express'
import User from '../models/user.js'
import auth from '../middlewares/auth.js'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url';
import sharp from 'sharp'
import {sendWelcomeEmail, sendCancelationEmail} from '../emails/accounts.js'


//create a router
const router = new express.Router()


//setting up user creation endpoint -> signup route
router.post('/users', async(req, res) => {
    const user = new User(req.body)

    try{
        await user.save()
        sendWelcomeEmail(user.email, user.name)
        const token = await user.generateToken()
        //next line after await is executed only after the promise is fulfilled
        res.status(201).send({user, token})
    }catch(err){
        res.status(400).send(err)
    }
})


//user log in -> log in route
router.post('/users/login', async (req, res) => {
    try{
        const user = await User.loginCredentials(req.body.email, req.body.password)
        const token = await user.generateToken()
        res.send({user, token})
    }catch(e){
        res.status(400).send('error')
    }
})


//user log out -> one device only
router.post('/users/logout', auth, async(req, res) => {
    try{
        //removing the token used during authentication from tokens array
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })

        await req.user.save()
        res.send()
    }catch(e){
        res.status(500).send()
    }
})


//user logOut -> all devices
router.post('/users/logoutAll', auth, async(req, res) => {
    try{
        req.user.tokens = []
        await req.user.save()
        res.status(200).send()
    }catch(e){
        res.status(500).send()
    }
})


//read user
router.get('/users/me', auth, async(req, res) => {
    res.send(req.user)
})


//update user
router.patch('/users/me', auth, async(req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))  

    if(!isValidOperation){
        return res.status(400).send({error: 'Invalid Updates'})
    }

    try{
        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save()
        res.status(200).send(req.user)
    }catch(e){
        return res.status(500).send(e)
    }
})


//delete user
router.delete('/users/me', auth, async(req, res) => {
    try{
        await req.user.deleteOne()
        sendCancelationEmail(req.user.email, req.user.name)
        res.send(req.user)
    }catch(e){
        res.status(500).send()
    }
})


// Fix for ES6: Get __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// Create "images" directory if not exists
const uploadDir = path.join(__dirname, 'images')
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true })
}


// Configure Multer Storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir)
    },
    filename: function (req, file, cb) {
        //determines the name of the file inside the folder
        cb(null, `${Date.now()}-${file.originalname}`)
    }
});

// Initialize Multer
const upload = multer({ 
    // storage: storage,
    limits:{
        fileSize:1000000 //1MB
    },
    fileFilter(req, file, cb){
        //cb(callback) is called with a boolean to indicate if the file should be accepted. Reject->false, accept->true
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error('Upload an image'))
        }

        return cb(null, true)
    }
})

// Upload avatar image
router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({ width:100, height:100 }).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send({ message: 'File uploaded successfully'})
}, (error, req, res, next) => {
    res.status(400).send({error: error.message})
})

//Delete avatar image
router.delete('/users/me/avatar', auth, async (req, res) => {
    try{
        req.user.avatar = undefined //removes the image
        await req.user.save()
        res.status(200).send({message: 'Profile picture successfully removed'})
    }catch(e){
        res.status(500).send()
    } 
})

//fetching avatar image by id
router.get('/users/:id/avatar', async(req, res) => {
    try{
        const user = await User.findById(req.params.id)

        if(!user || !user.avatar){
            throw new Error()
        }

        res.set('Content-Type', 'image/png')
        res.send(user.avatar)
    }catch(e){
        res.status(400).send()
    }
})


export default router;