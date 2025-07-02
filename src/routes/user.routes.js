import {Router} from "express";
import { registerUser } from "../controllers/user.constroller.js";
const router = Router()

/*router.route("/register").post(registerUser)\
        or
*/
router.post("/register", registerUser);



export default router