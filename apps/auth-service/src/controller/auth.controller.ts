  // register a new user
import { Request, Response, NextFunction } from 'express';  
import { checkOtpResetrications, validRegisterationData  , sendOtp , trackOtpRequests} from '../utils/ auth.helper';
import prisma from '@packages/libs/prisma';


  export const userRegister = async (req: Request,res: Response, next:NextFunction) => {
    try {
        const { name, email } = req.body;

       validRegisterationData(req.body , "user");

    const existingUser = await prisma.users.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists.' });
    }
    await checkOtpResetrications(email , next);
    await trackOtpRequests(email , next);
    await sendOtp(name , email , "user-registration-mail");
    return res.status(200).json({ message: 'OTP sent to email for verification.' });
  } catch (error) {
    return next(error);
  }
}
