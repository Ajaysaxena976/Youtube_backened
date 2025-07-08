import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"


//generate access and refresh token 
const generateAccessAndRefreshTokens = async(userId)=>{
    try{
        const user = await User.findById(userId)
        console.log(userId,user)
        const accessToken = await user.generateAccessToken()
        console.log("this is accesss token -",accessToken);
        const refreshToken = await user.generateRefreshToken()

        
        console.log("this is refresh token - ", refreshToken)
        //storing refresh token in db
        user.refreshToken = refreshToken
        // now save user in db
       await user.save({validateBeforeSave: false})
       return {accessToken, refreshToken}
    }
    catch(error){
        throw new ApiError(500, "something went wrong while generating refresh and access token")
    }
}




// register user


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


//login user 


const loginUser = asyncHandler(async (req, res)=>{
     
    //req body -> data 
    //username or email
    // find the user 
    //password check 
    //accesss and refresh token 
    //send cookie 
    const {email, username, password} = req.body 
   //if both are not given
    if(!username && !email){
        throw new ApiError(400, "username or email is required")
    }
    //if user exist then find username or email of the user
    const user = await User.findOne({
        $or: [{username}, {email}]
    })
    // if user not exist 
    if(!user){
        throw new ApiError(404, "user doesnot exist")
    }

        //checking input password with pwd store in db
        const isPasswordValid = await user.isPasswordCorrect(password)
        if(!isPasswordValid){
            throw new ApiError(401, "inavalid user credentials")
        }
    
        //using method to generate tokens defined above
       const {accessToken, refreshToken} = await generateAccessAndRefreshTokens (user._id)
        
        //removing some filds  
        const loggedInUser =await User.findById(user._id).select("-password -refreshToken")
         
        const options = {
            httpOnly: true, 
            secure: true
        }


        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200, 
            {
                user:loggedInUser, accessToken,
                refreshToken
            },
        "user logged in successfully"
        ) 
        )
    })


//logged out logic
const logoutUser = asyncHandler(async(req,res)=>{
  //clear cookies 
  //delete refresh token in db 
   await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )
 const options = {
    httpOnly: true, 
    secure: true
 }
 
 return res
 .status(200)
 .clearCookie("accessToken", options)
 .clearCookie("accessToken", options)
 .json(new ApiResponse(200, {}, "user logged out successfully"))
})

//refreshing the access token 
const refreshAccessToken = asyncHandler( async(req, res) =>{
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken 
    if(incomingRefreshToken){
        throw new ApiError(401, "Unauthorized access")
    }
  try {
     const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
     const user = await User.findById(decodedToken?._id)
      if(!user){
          throw new ApiError(401, "Invalid refresh token")
      }
  
      if(incomingRefreshToken !== user?.refreshToken){
          throw new ApiError(401, "invalid refresh token ")
      }
      //if token matches
      const options = {
          httpOnly: true,
          secure: true
      }
      const {newRefreshToken, accessToken} = await generateAccessAndRefreshTokens(user._id)
      return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
          new ApiError(
              200,
              {accessToken, refreshToken: newRefreshToken},
              "Access token refreshed"
          )
      )
      
  } catch (error) {
    throw new ApiError(400, error?.message || "Invalid refresh token "
    )
  }
}
)
export {registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken
};