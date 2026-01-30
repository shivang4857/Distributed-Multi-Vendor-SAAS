"use client";
import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User2, ArrowRight, RefreshCw } from 'lucide-react';

type SignupForm = {
  name: string;
  email: string;
  password: string;
  phoneCountryCode: string;
  phoneNumber: string;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const SignupPage = () => {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SignupForm>();

  // OTP state and related controls
  const [showOtpForm, setShowOtpForm] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [userData, setUserData] = useState<SignupForm | null>(null);
  const [otp, setOtp] = useState<string[]>(['', '', '', '']);
  const [apiError, setApiError] = useState<string | null>(null);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpSuccess, setOtpSuccess] = useState<string | null>(null);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const currentStep = 1;

  const phoneCountryOptions = [
    { label: 'India (+91)', value: '+91' },
    { label: 'United States (+1)', value: '+1' },
    { label: 'United Kingdom (+44)', value: '+44' },
    { label: 'Canada (+1)', value: '+1' },
    { label: 'Australia (+61)', value: '+61' },
    { label: 'Germany (+49)', value: '+49' },
    { label: 'France (+33)', value: '+33' },
    { label: 'Singapore (+65)', value: '+65' },
    { label: 'UAE (+971)', value: '+971' },
  ];

  const getErrorMessage = (error: unknown) => {
    if (axios.isAxiosError(error)) {
      return error.response?.data?.message || error.message || 'Something went wrong.';
    }
    if (error instanceof Error) return error.message;
    return 'Something went wrong.';
  };

  const signupMutation = useMutation({
    mutationFn: async (data: SignupForm) => {
      console.log("API_BASE_URL:", API_BASE_URL);
      const response = await axios.post(`${API_BASE_URL}/api/user-register`, data);
      return response.data;
    },
    onSuccess: (_data, variables) => {
      setUserData(variables);
      setShowOtpForm(true);
      setOtp(['', '', '', '']);
      setApiError(null);
      setOtpError(null);
      setOtpSuccess(null);
      setCanResend(false);
      setTimeout(() => setCanResend(true), 30000);
    },
    onError: (error) => {
      setApiError(getErrorMessage(error));
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async ({ payload, otpCode }: { payload: SignupForm; otpCode: string }) => {
      const response = await axios.post(`${API_BASE_URL}/api/verify-otp`, { ...payload, otp: otpCode });
      return response.data;
    },
    onSuccess: () => {
      setOtpError(null);
      setOtpSuccess('OTP verified successfully. Redirecting to login...');
      router.push('/login');
    },
    onError: (error) => {
      setOtpError(getErrorMessage(error));
    },
  });

  const handleResend = () => {
    if (!userData) return;
    setOtpError(null);
    setOtpSuccess(null);
    setCanResend(false);
    signupMutation.mutate(userData);
  };

  const onSubmit = async (data: SignupForm) => {
    setApiError(null);
    await signupMutation.mutateAsync(data);
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

  const verifyOtp = async () => {
    const code = otp.join('');
    if (!userData) {
      setOtpError('Please complete signup before verifying OTP.');
      return;
    }
    if (code.length !== 4) {
      setOtpError('Please enter the 4-digit OTP.');
      return;
    }
    setOtpError(null);
    setOtpSuccess(null);
    await verifyOtpMutation.mutateAsync({ payload: userData, otpCode: code });
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="px-6 pt-6 pb-4">
            <div className="flex items-center justify-between gap-2 text-xs font-medium text-gray-500">
              {['Create account', 'Setup the shop', 'Connect bank'].map((label, index) => {
                const stepNumber = index + 1;
                const isActive = stepNumber === currentStep;
                const isComplete = stepNumber < currentStep;
                return (
                  <div key={label} className="flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-6 w-6 rounded-full inline-flex items-center justify-center border ${
                          isComplete ? 'bg-blue-600 border-blue-600 text-white' : isActive ? 'border-blue-600 text-blue-600' : 'border-gray-300 text-gray-400'
                        }`}
                      >
                        {stepNumber}
                      </span>
                      <span className={`${isActive ? 'text-blue-600' : 'text-gray-500'}`}>{label}</span>
                    </div>
                    {index < 2 && (
                      <div className="mt-2 h-px w-full bg-gray-200">
                        <div className={`h-px ${isComplete ? 'bg-blue-600 w-full' : 'bg-gray-200 w-full'}`} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <h1 className="mt-5 text-2xl font-bold text-gray-900">Create your account</h1>
            <p className="text-sm text-gray-500">Sign up to explore great deals</p>
          </div>

          {!showOtpForm ? (
            <form onSubmit={handleSubmit(onSubmit)} className="px-6 pb-6 space-y-5">
              {apiError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {apiError}
                </div>
              )}
              <div className="group">
                <label className="text-sm font-medium text-gray-700">Name</label>
                <div className="mt-1 relative">
                  <User2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Your name"
                    className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    {...register('name', { required: 'Name is required' })}
                  />
                </div>
                {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>}
              </div>

              <div className="group">
                <label className="text-sm font-medium text-gray-700">Email</label>
                <div className="mt-1 relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    {...register('email', { required: 'Email is required' })}
                  />
                </div>
                {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>}
              </div>

              <div className="group">
                <label className="text-sm font-medium text-gray-700">Password</label>
                <div className="mt-1 relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })}
                  />
                </div>
                {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>}
              </div>

              <div className="group">
                <label className="text-sm font-medium text-gray-700">Phone number</label>
                <div className="mt-1 flex items-center gap-2">
                  <select
                    className="w-40 rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    defaultValue="+91"
                    {...register('phoneCountryCode', { required: 'Country code is required' })}
                  >
                    {phoneCountryOptions.map((option) => (
                      <option key={option.label} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    placeholder="Phone number"
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    {...register('phoneNumber', {
                      required: 'Phone number is required',
                      pattern: { value: /^[0-9]{7,15}$/, message: 'Enter 7-15 digits' },
                    })}
                  />
                </div>
                {errors.phoneCountryCode && <p className="text-xs text-red-600 mt-1">{errors.phoneCountryCode.message}</p>}
                {errors.phoneNumber && <p className="text-xs text-red-600 mt-1">{errors.phoneNumber.message}</p>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting || signupMutation.isPending}
                className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition"
              >
                {isSubmitting || signupMutation.isPending ? 'Signing up...' : 'Sign up'}
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-sm text-gray-600 text-center">
                Already have an account? <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">Sign in</Link>
              </p>
            </form>
          ) : (
            <div className="px-6 pb-6 space-y-5">
              <div className="text-center">
                <h2 className="text-lg font-semibold text-gray-900">Verify your email</h2>
                <p className="text-sm text-gray-500">Enter the 4-digit code sent to {userData?.email}</p>
              </div>

              {/* OTP inputs */}
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

              {otpError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {otpError}
                </div>
              )}
              {otpSuccess && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                  {otpSuccess}
                </div>
              )}

              <button
                onClick={verifyOtp}
                disabled={verifyOtpMutation.isPending}
                className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition"
              >
                {verifyOtpMutation.isPending ? 'Verifying...' : 'Verify OTP'}
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-between text-sm">
                <button
                  disabled={!canResend || signupMutation.isPending}
                  onClick={handleResend}
                  className={`inline-flex items-center gap-2 ${canResend ? 'text-blue-600 hover:text-blue-700' : 'text-gray-400'}`}
                >
                  <RefreshCw className="w-4 h-4" /> Resend Code
                </button>
                <button onClick={() => setShowOtpForm(false)} className="text-gray-600 hover:text-gray-800">Change email</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
