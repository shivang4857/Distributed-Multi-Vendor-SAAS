  // register a new user
import { Request, Response, NextFunction } from 'express';  
import { checkOtpResetrications, validRegisterationData  , sendOtp , trackOtpRequests , verifyOtp , handleforgetpassword ,verifyForgetPasswordOtp} from '../utils/ auth.helper';
import prisma from '@packages/libs/prisma';
import { ValidationError } from '@packages/error-handler';
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { setCookie } from '../utils/cookies/setCookie';

export const userRegister = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email } = req.body;

    validRegisterationData(req.body, "user");

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


//verify user with the otp
export const  verifyUser = async ( 
  req : Request ,
  response : Response ,
  next : NextFunction
 ) => {
 
  try {
    const { email, name, password, otp } = req.body;
    if ( !email || ! otp || !password || !name) {
      return next(new ValidationError('Missing required fields.'));
    }
    const existingUser = await prisma.users.findUnique({
      where: { email }
    })
    if (existingUser){
      return next( new ValidationError("All feilds are required"))
    }
    const otpVerified = await verifyOtp(email, otp, next);
    if (!otpVerified) {
      return next(new ValidationError('OTP verification failed.'));
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.users.create({
      data: {
        email,
        name,
        password: hashedPassword,
        isVerified: true,
      },
    });
    return response.status(201).json({ message: 'User registered successfully.' });
  } catch (error) {
    return next(error);
  }
}

// login the user 

export const userLogin = async (
  req : Request ,
  response : Response ,
  next : NextFunction
 ) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw next(new ValidationError('Email and password are required.'));
    }

    const user = await prisma.users.findUnique({
      where: { email }
    });

    if (!user) {
      throw next(new ValidationError('Invalid email or password.'));
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw next(new ValidationError('Invalid email or password.'));
    }
 // generate refersh and accees token 
    const refresh_token = jwt.sign({ userId: user.id , role: "user" }, process.env.JWT_ACCESS_SECRET as string, { expiresIn: '15m' });
    const access_token = jwt.sign({ userId: user.id , role: "user" }, process.env.JWT_REFRESH_SECRET as string, { expiresIn: '7d' });
// store the refersh and access token in the  httponly secure cookie
 setCookie(response, 'refresh_token', refresh_token);
 setCookie(response, 'access_token', access_token);

    return response.status(200).json({ message: 'Login successful.', id: user.id ,name : user.name, email : user.email});
  } catch (error) {
    return next(error);
  }
}


//user forget password 

export const userForgetPassword = async ( req: Request , res: Response , next : NextFunction) => {
    await handleforgetpassword( req , res , next , "user") ;
}


//verify forget password otp

export const verifyUserForgetPassword = async( req : Request , res : Response , next : NextFunction ) => {
    await verifyForgetPasswordOtp( req , res , next, ) ;
}

//reset password

export const resetPassword = async( req : Request , res : Response , next : NextFunction ) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return next(new ValidationError('Missing required fields.'));
    }
  // check if user has entered old password only
    const user = await prisma.users.findUnique({
      where: { email }
    });
    if (!user) {
      return next(new ValidationError('User not found.'));
    }
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return next(new ValidationError('New password must be different from the old password.'));
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password in database
    await prisma.users.update({
      where: { email },
      data: { password: hashedPassword },
    });

    return res.status(200).json({ message: 'Password reset successfully.' });
  } catch (error) {
    return next(error);
  }
}

// refresh token user 

export const refreshTokenUser = async ( req : Request , res : Response , next : NextFunction) => {
  try {
    const refreshToken = req.cookies['refresh_token'];
    if (!refreshToken) {
      return next(new ValidationError('Refresh token not provided.'));
    }

    let payload: any;
    try {
      payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string);
    } catch (err) {
      return next(new ValidationError('Invalid refresh token.'));
    }

    const user = await prisma.users.findUnique({
      where: { id: payload.userId }
    });

    if (!user) {
      return next(new ValidationError('User not found.'));
    }

    const newAccessToken = jwt.sign({ userId: user.id , role: "user" }, process.env.JWT_ACCESS_SECRET as string, { expiresIn: '15m' });

    setCookie(res, 'access_token', newAccessToken);

    return res.status(200).json({ message: 'Access token refreshed successfully.' });
  } catch (error) {
    return next(error);
  }
}


// get logged in user details
export const getLoggedInUser = async ( req : any , res : Response , next : NextFunction) => {
  try {
      const user = req.user;
      return res.status(200).json({ user });
  } catch (error) {
    return next(error);
  }
}