"use client";
import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { Mail, Lock, User2, ArrowRight, RefreshCw } from 'lucide-react';

type SignupForm = {
  name: string;
  email: string;
  password: string;
};

const SignupPage = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SignupForm>();

  // OTP state and related controls
  const [showOtpForm, setShowOtpForm] = useState(true);
  const [canResend, setCanResend] = useState(false);
  const [userData, setUserData] = useState<SignupForm | null>(null);
  const [otp, setOtp] = useState<string[]>(['', '', '', '']);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  const handleResend = () => {
    setCanResend(false);
    // Simulate resend cooldown
    setTimeout(() => setCanResend(true), 30000);
  };

  const onSubmit = async (data: SignupForm) => {
    // TODO: call signup API, then show OTP
    setUserData(data);
    setShowOtpForm(true);
    setCanResend(false);
    setTimeout(() => setCanResend(true), 30000);
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
    if (code.length !== 4) return;
    // TODO: verify OTP with API
    console.log('Verify OTP', code, userData);
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="px-6 pt-6 pb-4">
            <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
            <p className="text-sm text-gray-500">Sign up to explore great deals</p>
          </div>

          {!showOtpForm ? (
            <form onSubmit={handleSubmit(onSubmit)} className="px-6 pb-6 space-y-5">
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

              <button type="submit" disabled={isSubmitting} className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition">
                {isSubmitting ? 'Signing up...' : 'Sign up'}
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-sm text-gray-600 text-center">
                Already have an account? <Link href="/auth/login" className="text-blue-600 hover:text-blue-700 font-medium">Sign in</Link>
              </p>
            </form>
          ) : (
            <div className="px-6 pb-6 space-y-5">
              <div className="text-center">
                <h2 className="text-lg font-semibold text-gray-900">Verify your email</h2>
                <p className="text-sm text-gray-500">Enter the 6-digit code sent to {userData?.email}</p>
              </div>

              {/* OTP inputs */}
              <div className="flex items-center justify-center gap-4">
                {[0,1,2,3,4,5].map((i) => (
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

              <button onClick={verifyOtp} className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition">
                Verify OTP
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-between text-sm">
                <button disabled={!canResend} onClick={handleResend} className={`inline-flex items-center gap-2 ${canResend ? 'text-blue-600 hover:text-blue-700' : 'text-gray-400'}`}>
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