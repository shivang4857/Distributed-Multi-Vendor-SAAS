  // register a new user
import { Request, Response, NextFunction } from 'express';  
import { checkOtpResetrications, validRegisterationData  , sendOtp , trackOtpRequests} from '../utils/ auth.helper';
import prisma from '../../../../packages/libs/prisma';
import { send } from 'process';


  export const userRegister = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, email } = req.body;

      validRegisterationData(req.body , "user");

    const existingUser = await prisma.user.findUnique({
      where: { email: req.body.email }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists.' });
    }
    await checkOtpResetrications(req.body.email , next);
    await trackOtpRequests(req.body.email , next);
    await sendOtp(name , email , "user-registration-mail");
    res.status(200).json({ message: 'OTP sent to email for verification.' });
  } catch (error) {
    next(error);
  }
}
