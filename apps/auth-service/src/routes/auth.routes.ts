import express ,{ Router } from "express";
import { userRegister, verifyUser , userLogin, userForgetPassword, verifyUserForgetPassword, resetPassword, refreshTokenUser, getLoggedInUser} from "../controller/auth.controller";


const router : Router = express.Router();

// User registration route
router.post('/user-register', userRegister);
router.post('/verify-otp',verifyUser )
router.post('/login-user',userLogin )
router.post('/user-forget-password' ,userForgetPassword);
router.post('/reset-password-user',resetPassword)
router.post('/verify-forget-password-otp' ,verifyUserForgetPassword )
router.post('/refresh-token-user' , refreshTokenUser ) ;
router.get('/logged-in-user' , getLoggedInUser );

export default router;      