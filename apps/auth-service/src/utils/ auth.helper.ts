import crypto from 'crypto';
import { ValidationError } from "@packages/error-handler";
import redis from '@packages/libs/redis';
import {sendMail} from '../utils/sendmail/index'
import { NextFunction } from 'express';
import { Request, Response } from 'express';
import prisma from '@packages/libs/prisma';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validRegisterationData = (data: any  , userType : "user" | "seller") => {
  const { name, email, password , phone_number , country} = data;

  if (!name || !email || !password || (userType === "seller" && (!phone_number || !country))) {
    return new ValidationError('Missing required fields for registration.');
  }
    
  if (!name || typeof name !== 'string' || name.trim().length < 3) {
    return new ValidationError('Name must be at least 3 characters long.');
  }

  if (!email || typeof email !== 'string' || !emailRegex.test(email)) {
    return new ValidationError('Invalid email format.');
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    return new ValidationError('Password must be at least 6 characters long.');
  }

  if (userType === "seller") {
    if (!phone_number || typeof phone_number !== 'string' || phone_number.trim().length < 10) {
      return new ValidationError('Phone number must be at least 10 digits long.');
    }

    if (!country || typeof country !== 'string' || country.trim().length < 2) {
      return new ValidationError('Country must be at least 2 characters long.');
    }
  }

  return { valid: true };
}

export const checkOtpResetrications =  async( email : string ,
    next : NextFunction) => {
        if (await redis.get(`otp_lock:${email}`)) {
            return next(new ValidationError('OTP request is on cooldown. Please wait before requesting a new OTP.'));
        }
        if (await redis.get(`otp_spam_lock:${email}`)) {
            return next(new ValidationError('Please wait for 1 hour before requesting a new OTP.'));
        }
        if (await redis.get(`otp_cooldown:${email}`)) {
            return next(new ValidationError('Please wait for 1 minute before requesting a new OTP.'));
        }
        return true;
    }

export const trackOtpRequests = async(email : string , next : NextFunction) => {
    const otpRequestsKey = `otp_request_count:${email}`;
    let otpRequests = parseInt((await redis.get(otpRequestsKey)) || "0");

    if (otpRequests >= 2) {
        await redis.set(`otp_spam_lock:${email}`, "true", 'EX', 3600); // 1 hour lock
        return next(new ValidationError('Too many OTP requests. Please wait for 1 hour before requesting a new OTP.'));
    }
    await redis.set(otpRequestsKey, (otpRequests + 1), 'EX', 3600); // Count resets after 1 hour

}

export const sendOtp = async(name : string ,email : string , template : string) => {
    const otp = crypto.randomInt(1000, 9999).toString();
    await sendMail(email, 'Your OTP Code', template, { name, otp });
    await redis.set(`otp:${email}`, otp, 'EX', 300); // OTP valid for 5 minutes
    await redis.set(`otpcooldown:${email}`, "true", 'EX', 60); // Cooldown of 1 minute
    return otp;
}

//verify otp
export const verifyOtp = async(email : string , otp : string , next : NextFunction) => {
    const storedOtp = await redis.get(`otp:${email}`);
    if (storedOtp !== otp) {
        throw next(new ValidationError('Invalid or expired OTP.'));
    }
    const failedAttemptKey = `otp_attempts:${email}`
    const failedAttempts = parseInt((await redis.get(failedAttemptKey)) || "0");   
// when otp attempts fails

  if (storedOtp !== otp) {
    if (failedAttempts >= 2) {
      await redis.set(`otp_locked:${email}`, "locked", "EX", 1800)
      await redis.del(`otp:${email}` , failedAttemptKey)
      throw new ValidationError('Too many failed OTP attempts. Please try again later.')
    }
    await redis.set(failedAttemptKey , failedAttempts + 1 , "EX" , 1800)
    throw new ValidationError(`Incorrect Otp only ${2-failedAttempts} Attempts Left`)
  }
   await redis.del( `otp:${email}`, failedAttemptKey)
   return true;
}


//handle forget password

export const handleforgetpassword = async( req : Request, res : Response , next : NextFunction , userTypes : "user"| "seller" ) => {
  try {
    const { email } = req.body;

    if (!email) {
      return next(new ValidationError('Email is required.'));
    }

    // Check if user exists
    const user = await prisma.users.findUnique({
      where: { email }
    });

    if (!user) {
      return next(new ValidationError('User not found.'));
    }

    // Generate OTP
    await checkOtpResetrications(email , next);
    await trackOtpRequests(email , next);
   // generate otp
   const displayName = user?.name || email.split('@')[0] || 'there';
   await sendOtp(displayName, email, "user-forget-password-mail");
   res.status(200).json({ message: 'OTP sent to email for password reset.' });
  } catch (error) {
    return next(error);
  }
}


export const verifyForgetPasswordOtp = async( req : Request , res : Response , next : NextFunction) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp ) {
      return next(new ValidationError('Missing required fields.'));
    }

    // Verify OTP
    await verifyOtp(email, otp, next);

    return res.status(200).json({ message: 'Otp verfied successfully you can now reset you password' });
  } catch (error) {
    return next(error);
  }
}
