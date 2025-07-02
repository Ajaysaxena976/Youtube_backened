import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"; 


    // Configuration
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME ,  
        api_key:  process.env.CLOUDINARY_API_KEY  , 
        api_secret:  process.env.CLOUDINARY_API_SECRET   // Click 'View API Keys' above to copy your API secret
    })

console.log(process.env.CLOUDINARY_CLOUD_NAME)
      // Upload an image
      const uploadOnCloudinary = async (localFilePath)=>{
        try{
            if(!localFilePath) return null
            //upload the file on cloudinary
            console.log("upload on cloud",localFilePath)
            const response = await cloudinary.uploader.upload(localFilePath,{
                resourse_type:"auto"
            })
             console.log("uploaedd on cloud")
            //file has been uploaded successfull
            console.log("file is uploaded on cloudinary",
                response.url);
                fs.unlinkSync(localFilePath)
                return response
        }
        catch(error){
            console.log("error cloudinary",error)
          fs.unlinkSync(localFilePath)//remove the locally saved temporary file as the upload operation got failed
            return null;
        }
      }

      export {uploadOnCloudinary}