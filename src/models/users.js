const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Task = require('./tasks');

const userSchema = new mongoose.Schema({
    name : {
        type : String,
        trim : true,
        required : true,
    },
    email : {
         type : String,
         unique : true,
         trim : true,
         required : true,
         validate(value){
             if(!validator.isEmail(value))
               throw new Error('Email is invalid')
         },
         lowercase : true
    },
    password : {
        type : String,
        trim : true,
        required : true,
        validate(value){
            if(value.length<6){
              throw new Error('password length must be greater than 6');
            } else if(value.includes('password'))
                throw new Error('Enter more secure password');
        }
    },
    age : {
        type : Number,
        default : 0,
        trim : true,
        validate(value){
            if(value<0)
              throw new Error('Hello time traveller')
        }
    },
    tokens : [{
        token : {
            type : String,
            required : true
        }
    }]
}, {
    timestamps : true
})

userSchema.virtual('tasks', {
    ref : 'Tasks',
    localField : '_id',
    foreignField : 'owner'
})

userSchema.methods.toJSON = function () {
    const user = this;
    const userObject = user.toObject();

    delete userObject.password;
    delete userObject.tokens;

    return userObject;
}

userSchema.methods.generateAuthToken = async function() {
    const user = this;
    const token = jwt.sign({_id : user._id.toString()}, 'testtoken');
    user.tokens = user.tokens.concat({token});
    await user.save();
    return token;
}

userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({email});
    if(!user){
        throw new Error('Unable to login!');
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch){
        throw new Error('Unable to login!');
    }
    return user;
}

userSchema.pre('save', async function (next) {
   const user = this;
   console.log('before saving');
   if(user.isModified('password')){
       user.password = await bcrypt.hash(user.password, 8);
   }
   next();
})

userSchema.pre('remove', async function(next) {
    const user = this;
    await Task.deleteMany( { owner : user._id} );
    next();
})

const User = mongoose.model('user', userSchema);

module.exports = User;