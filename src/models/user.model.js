import mongoose, {Schema} from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
const userSchema = new Schema({
    username:{
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
    },
    email:{
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    fullName:{
        type: String,
        required: true,
        unique: true,
        index: true,
        trim: true,
    },
    avatar: {
        type: String,  //cloudinary url
        required: true,
    },
    coverImage:{
        type: String,  //cloudinary url
    },
    watchHistory: [
        {
            type:Schema.Types.ObjectId,
            ref: "Video"
        }
    ],
    password: {
        type: String,
        required:[true,'Password is required']
    },
    refreshToken: {
        type: String
    },
    
},
{
        timestamps: true
}
)

//before saving user encrypting the password
userSchema.pre("save", async function(next){
    if(this.isModified("password")){
    this.password = await bcrypt.hash(this.password, 10)
    next()
    }   
})


userSchema.methods.generateAccessToken = async function(){
    
  try {
      return await jwt.sign({
          _id: this._id,
          email: this.email,
          username: this.username,
          fullName: this.fullName
        }, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        })
    } catch (error) {
        console.log(error);
        return null
    }
}
userSchema.methods.generateRefreshToken = async function(){
    try {
         console.log("hhhhhhhhhhhhhhhhhh");
        return await jwt.sign({
           _id: this._id,  
       }, process.env.REFRESH_TOKEN_SECRET, {
           expiresIn: process.env.REFRESH_TOKEN_EXPIRY
       })
     } catch (error) {
        console.log(error);
        return null
     }
}

export const User = mongoose.model("User", userSchema);