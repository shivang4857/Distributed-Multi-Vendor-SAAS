"use client";
import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Mail, Lock, ArrowRight, RefreshCw } from 'lucide-react';

type EmailForm = {
  email: string;
};

type ResetForm = {
  password: string;
  confirmPassword: string;
};

const rawApiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const API_BASE_URL = rawApiBaseUrl.replace(/\/+$/, '').endsWith('/api')
  ? rawApiBaseUrl.replace(/\/+$/, '')
  : `${rawApiBaseUrl.replace(/\/+$/, '')}/api`;

const ForgetPasswordPage = () => {
  const router = useRouter();
  const [step, setStep] = useState<'email' | 'otp' | 'reset'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState<string[]>(['', '', '', '']);
  const [resendSeconds, setResendSeconds] = useState(0);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  const emailForm = useForm<EmailForm>();
  const resetForm = useForm<ResetForm>();

  const getErrorMessage = (error: unknown) => {
    if (axios.isAxiosError(error)) {
      return error.response?.data?.message || error.message || 'Something went wrong.';
    }
    if (error instanceof Error) return error.message;
    return 'Something went wrong.';
  };

  const sendOtpMutation = useMutation({
    mutationFn: async (payload: EmailForm) => {
      const response = await axios.post(`${API_BASE_URL}/user-forget-password`, payload);
      return response.data;
    },
    onSuccess: (data, variables) => {
      setEmail(variables.email);
      setStep('otp');
      setOtp(['', '', '', '']);
      setResendSeconds(30);
      toast.success(data?.message || 'OTP sent to your email.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async ({ emailValue, otpCode }: { emailValue: string; otpCode: string }) => {
      const response = await axios.post(`${API_BASE_URL}/verify-forget-password-otp`, {
        email: emailValue,
        otp: otpCode,
      });
      return response.data;
    },
    onSuccess: (data) => {
      setStep('reset');
      toast.success(data?.message || 'OTP verified. Please reset your password.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async ({ emailValue, otpCode, newPassword }: { emailValue: string; otpCode: string; newPassword: string }) => {
      const response = await axios.post(`${API_BASE_URL}/reset-password-user`, {
        email: emailValue,
        otp: otpCode,
        newPassword,
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || 'Password reset successfully.');
      router.push('/login');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  useEffect(() => {
    if (step !== 'otp' || resendSeconds <= 0) return;
    const timer = setInterval(() => {
      setResendSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [step, resendSeconds]);

  const handleEmailSubmit = async (data: EmailForm) => {
    await sendOtpMutation.mutateAsync(data);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    if (value && index < inputsRef.current.length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const code = otp.join('');
    if (code.length !== 4) {
      toast.error('Please enter the 4-digit OTP.');
      return;
    }
    await verifyOtpMutation.mutateAsync({ emailValue: email, otpCode: code });
  };

  const handleResendOtp = async () => {
    if (!email || resendSeconds > 0) return;
    await sendOtpMutation.mutateAsync({ email });
  };

  const handleResetPassword = async (data: ResetForm) => {
    if (data.password !== data.confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    const code = otp.join('');
    await resetPasswordMutation.mutateAsync({ emailValue: email, otpCode: code, newPassword: data.password });
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="px-6 pt-6 pb-4">
            <h1 className="text-2xl font-bold text-gray-900">Forgot password</h1>
            <p className="text-sm text-gray-500">We will help you reset it quickly</p>
          </div>

          {step === 'email' && (
            <form onSubmit={emailForm.handleSubmit(handleEmailSubmit)} className="px-6 pb-6 space-y-5">
              <div className="group">
                <label className="text-sm font-medium text-gray-700">Email</label>
                <div className="mt-1 relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    {...emailForm.register('email', { required: 'Email is required' })}
                  />
                </div>
                {emailForm.formState.errors.email && (
                  <p className="text-xs text-red-600 mt-1">{emailForm.formState.errors.email.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={sendOtpMutation.isPending}
                className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition"
              >
                {sendOtpMutation.isPending ? 'Sending OTP...' : 'Send OTP'}
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-sm text-gray-600 text-center">
                Remember your password? <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">Sign in</Link>
              </p>
            </form>
          )}

          {step === 'otp' && (
            <div className="px-6 pb-6 space-y-5">
              <div className="text-center">
                <h2 className="text-lg font-semibold text-gray-900">Verify OTP</h2>
                <p className="text-sm text-gray-500">Enter the 4-digit code sent to {email}</p>
              </div>

              <div className="flex items-center justify-center gap-4">
                {[0, 1, 2, 3].map((i) => (
                  <input
                    key={i}
                    ref={(el) => { inputsRef.current[i] = el; }}
                    value={otp[i]}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    className="w-12 h-12 text-center text-lg font-semibold rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition transform"
                    placeholder="-"
                    maxLength={1}
                  />
                ))}
              </div>

              <button
                onClick={handleVerifyOtp}
                disabled={verifyOtpMutation.isPending}
                className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition"
              >
                {verifyOtpMutation.isPending ? 'Verifying...' : 'Verify OTP'}
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-between text-sm">
                <button
                  disabled={resendSeconds > 0 || sendOtpMutation.isPending}
                  onClick={handleResendOtp}
                  className={`inline-flex items-center gap-2 ${resendSeconds > 0 ? 'text-gray-400' : 'text-blue-600 hover:text-blue-700'}`}
                >
                  <RefreshCw className="w-4 h-4" />
                  {resendSeconds > 0 ? `Resend in ${resendSeconds}s` : 'Resend Code'}
                </button>
                <button onClick={() => setStep('email')} className="text-gray-600 hover:text-gray-800">Change email</button>
              </div>
            </div>
          )}

          {step === 'reset' && (
            <form onSubmit={resetForm.handleSubmit(handleResetPassword)} className="px-6 pb-6 space-y-5">
              <div className="group">
                <label className="text-sm font-medium text-gray-700">New password</label>
                <div className="mt-1 relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    {...resetForm.register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })}
                  />
                </div>
                {resetForm.formState.errors.password && (
                  <p className="text-xs text-red-600 mt-1">{resetForm.formState.errors.password.message}</p>
                )}
              </div>

              <div className="group">
                <label className="text-sm font-medium text-gray-700">Confirm password</label>
                <div className="mt-1 relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    {...resetForm.register('confirmPassword', { required: 'Please confirm your password' })}
                  />
                </div>
                {resetForm.formState.errors.confirmPassword && (
                  <p className="text-xs text-red-600 mt-1">{resetForm.formState.errors.confirmPassword.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={resetPasswordMutation.isPending}
                className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition"
              >
                {resetPasswordMutation.isPending ? 'Resetting...' : 'Reset password'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgetPasswordPage;
