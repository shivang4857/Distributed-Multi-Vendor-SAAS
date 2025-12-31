import express ,{ Router } from "express";
import { userRegister } from "../controller/auth.controller";

const router : Router = express.Router();

// User registration route
router.post('/user-register', userRegister);

export default router;      