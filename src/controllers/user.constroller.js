import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"

const registerUser = asyncHandler(async(req, res)=>{
    //kya ky steps honge

    //get user details form frontened 
    //validation - not empty
    //check if user already exists(by username or email)
    //check for images, check for avatar
    //upload them to cloudinary, avatar
    //create user object(esi object me data hoga jo db me jayega)- create entery in db 
     //remobe password and refresh token field from response
     //check for user creation
     //return response
    
    
    
const {fullName, email, username, password} = req.body;
console.log("email:", email);

/* ye simple tarika hai validate krne ka iske niche advance tarika hai ese bhi check kr skte hai 

if(fullName===""){
        throw new ApiError(400, "fullname is required")
     }
})*/
// validation for checking all fields have data 
 if(
        [fullName, email, username, password].some((field)=>
            field?.trim()==="")
     ){
        throw new ApiError(400,"All fields are required")
     }



//validation for checking that if user already exist or not
const existedUser = await User.findOne({
    $or: [{ username },{ email }]
})

//if user exist then throwing error
if(existedUser){
    throw new ApiError(409,"user with email or username already exist")
}

// handling image 

const avatarLocalPath = req.files?.avatar[0]?.path;
//const coverImageLocalPath = req.files?.coverImage[0]?.path;
let coverImageLocalPath;
if(req.files && Array.isArray(req.files.coverImage) && 
req.files.coverImage.length>0){
    coverImageLocalPath = req.files.coverImage[0].path
}

//if avatar is not uploaded by user 
if(!avatarLocalPath){
    throw new ApiError(400, "Avatar file is required")
}

// uploading image to cloudinary 
const avatar = await uploadOnCloudinary(avatarLocalPath)
const coverImage = await uploadOnCloudinary(coverImageLocalPath);
console.log("hi")

if(!avatar){
    throw new ApiError(400, "Avatar file is required")
}


//if everything is fine then create a object and store in db
const user = await User.create({
    fullName,
    avatar:avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase()
})

//checking is user created or not  and with .select method we removed password 
const  createdUser = await User.findById(user._id).select(
"-password -refreshToken"
)

if(!createdUser){
    throw new ApiError(500, "Something went wrong while registering the user ")
}

//sending api response 
return res.status(201).json(
    new ApiResponse(200, createdUser, "user registered successfully")
)



})
export {registerUser};