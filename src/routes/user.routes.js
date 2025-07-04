import {Router} from "express";
import { registerUser } from "../controllers/user.constroller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router()

/*router.route("/register").post(registerUser)\
        or
*/
router.post("/register",
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]), 
    registerUser);



export default router