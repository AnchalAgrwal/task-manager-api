import mongoose from 'mongoose'
import validator from 'validator'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const UserSchema = new mongoose.Schema({
    name:{
        type: String, 
        required: [true, 'Username is required'],
        trim: true //removes extra spaces 
    }, 
    email:{
        type: String,
        unique: true,//for this to work -> drop the db, save the code again and recreate db so indexing can be done
        required: [true, 'Provide an email address'],
        trim: true,
        lowercase: true, //makes sure that input email is in lowercase
        validate:{
            validator: function(value){
                // Return true if the value is a valid email, false otherwise.
                return validator.isEmail(value)
            },
            //When the validator returns false, this custome error msg is included in the validation error
            message: props => `${props.value} is not an valid email addess!`
        }
    },  
    age:{
        type: Number,
        default: 1,
        //custom validator
        validate:{
            validator: function(value){
                //regular expression for matching numbers greater than 0 :-> ^[1-9]\d*$
                return /^[1-9]\d*$/.test(value);
            },
            message: props => `${props.value} is not a valid age! Only positive numbers are allowed.`
        }
    },
    password:{
        type: String,
        required: true,
        trim: true,
        validate:[
            {
                validator: function(val){
                    //if len is gt 6 then true otherwise false
                    return val.length > 6;
                },
                message: props => `"${props.value}" is not a valid password.`
            },
            {
                validator: function(val){
                    //if password is included then false so message is included otherwise true
                    return !(val.includes("password"))
                },
                message: props => `The string password can't be included in your password`
            }
        ]
    }, 
    tokens:[{
        token:{
            type:String,
            required: true
        }
    }],
    avatar:{
        type:Buffer
    }
}, {
    timestamps:true
});


UserSchema.virtual('tasks', {
    ref:'Task',
    localField:'_id',
    foreignField:'owner'
})


UserSchema.methods.toJSON =  function () {
    const user = this
    const userObj = user.toObject()

    delete userObj.password
    delete userObj.tokens
    delete userObj.avatar

    return userObj
}


UserSchema.methods.generateToken = async function () {
    const user = this
    const token = jwt.sign({id:user._id.toString()}, process.env.JWT_SECRET)
    
    user.tokens = user.tokens.concat({token: token })
    await user.save()

    return token
}


//login 
UserSchema.statics.loginCredentials = async (email, password) => {
    const user = await User.findOne({email: email})//finding the user by email

    if(!user){
        throw new Error('Login failed')
    }

    //if user exists then check password
    const isMatch = await bcrypt.compare(password, user.password)

    if(!isMatch){
        throw new Error('Login failed')
    }

    //return user if both email and password are correct
    return user
} 


//converting plain text password to hashed password before saving user
UserSchema.pre('save', async function(next) {
    const user = this

    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8)
    }

    next() 
})


//Delete user tasks when user is removed
UserSchema.pre('remove', async function (next){
    const user = this
    await Task.deleteMany({ owner:user._id })
    next()
})


const User = mongoose.model('User', UserSchema)

export default User