import dotenv from "dotenv"
import connectDB from "./db/index.js"
import { app } from "./app.js"
dotenv.config({
    path: './.env'
})

connectDB()
.then(()=>{
    app.listen(process.env.PORT|| 8000,()=>{
        console.log(`Server is running at port: ${process.env.PORT}`);
    })  
})
.catch((err)=>{
    console.log("MONGO db connection failed !!!", err );
})
  

/*

ye tarika thik nahi hai ye sara code db folder me alg file me rakenge vha se import kr lenge 


;(async()=>{
    try{
        await mongoose.connect(`${ProcessingInstruction.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error", (e)=>{
            console.log("errf: ",error);
            throw error
        })
    app.listen(process.env.PORT, ()=>{
        console.log(`App is listening on port ${process.env.PORT}`
        )
    })
}
    catch(error){
        console.error("Error: ",error)
        throw error
    }
})()*/
   