import express ,{ Router } from "express";
import { userRegister, verifyUser , userLogin, userForgetPassword, verifyUserForgetPassword, resetPassword} from "../controller/auth.controller";


const router : Router = express.Router();

// User registration route
router.post('/user-register', userRegister);
router.post('/verify-otp',verifyUser )
router.post('/login-user',userLogin )
router.post('/user-forget-password' ,userForgetPassword);
router.post('/reset-password-user',resetPassword)
router.post('/verify-forget-password-otp' ,verifyUserForgetPassword )

export default router;      