const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Task = require("./task")
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: true,
    validate(value) {
      if (value.length <= 1) {
        throw new Error("Very short name!");
      }
    },
  },
  age: {
    type: Number,
    default: 0,
    validate(num) {
      if (num < 0) {
        throw new Error("Age must be a positive number!!");
      }
    },
  },
  email: {
    type: String,
    unique: true,
    required: true,
    lowercase: true,
    trim: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error("Invalid Email!");
      }
    },
  },
  password: {
    type: String,
    required: true,
    trim: true,

    validate(value) {
      if (value.length < 6) {
        throw new Error("Too short!");
      } else if (value.includes("password")) {
        throw new Error("password should not be in your Password!");
      }
    },
  },
  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
  avatar:{
    type:Buffer
  }
},{timestamps:true});
userSchema.virtual('tasks',{
  ref: 'Task',
  localField:'_id',
  foreignField:'owner'
})
userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);
  user.tokens = user.tokens.concat({ token });
  await user.save();
  return token;
};
// userSchema.methods.getPrivateProfile=async function(){
//   const userObject=this.toObject()
//   delete userObject.password
//   delete userObject.tokens
  
//   return userObject
// }
userSchema.methods.toJSON= function(){
  const userObject=this.toObject()
  delete userObject.password
  delete userObject.tokens
  
  return userObject
}
userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error("Unable to Login(Email)");
  }

  const isValid = await bcrypt.compare(password, user.password);

  if (!isValid) {
    throw new Error("Unable to Login(password)");
  }

  return user;
};
userSchema.pre("save", async function (next) {
  //const user=this
  if (this.isModified("password")) {
    const hashPassword = await bcrypt.hash(this.password, 8);
    //console.log(hashPassword);
    this.password = hashPassword;
  }
  next();
});
userSchema.pre('remove',async function(next){
  await Task.deleteMany({owner:this._id})
  next()
})
const User = mongoose.model("User", userSchema);
module.exports = User;
