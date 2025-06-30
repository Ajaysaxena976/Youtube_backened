const asyncHandler = (requestHandler)=>{
    (req, res, next)=>{
        Promise.resolve(requestHandler(req, res, next)).
        catch((err)>next(err))
    }
}



export {asyncHandler}

//Concept of High Order function
//const asynHandler=()=>{}
//const asyncHandler= (func)=>()=>{}
//const asyncHandler = (func)=>async ()=>{}
/* 
wrapper funciton using try catch 
const asyncHandler = (fn)=> async (req, res, next)=>{
    try{
        await fn(req,res,next)
    }
    catch(error){
        res.status(error.code || 500).json({
            success:false,
            message:err.message
        })
    }
}*/