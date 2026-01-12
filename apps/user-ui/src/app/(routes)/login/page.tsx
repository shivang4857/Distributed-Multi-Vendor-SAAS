"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Mail, Lock, ArrowRight, Circle } from 'lucide-react';

type LoginForm = {
  email: string;
  password: string;
  remember: boolean;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const LoginPage = () => {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    defaultValues: { remember: true }
  });
  const [apiError, setApiError] = useState<string | null>(null);

  const getErrorMessage = (error: unknown) => {
    if (axios.isAxiosError(error)) {
      return error.response?.data?.message || error.message || 'Something went wrong.';
    }
    if (error instanceof Error) return error.message;
    return 'Something went wrong.';
  };

  const loginMutation = useMutation({
    mutationFn: async (payload: LoginForm) => {
      const response = await axios.post(
        `${API_BASE_URL}api/login-user`,
        { email: payload.email, password: payload.password },
        { withCredentials: true }
      );
      return response.data;
    },
    onSuccess: () => {
      setApiError(null);
      router.push('/');
    },
    onError: (error) => {
      setApiError(getErrorMessage(error));
    },
  });

  const onSubmit = async (data: LoginForm) => {
    setApiError(null);
    await loginMutation.mutateAsync(data);
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="px-6 pt-6 pb-4">
            <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
            <p className="text-sm text-gray-500">Login to continue shopping</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="px-6 pb-6 space-y-5">
            {apiError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {apiError}
              </div>
            )}
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
                  {...register('password', { required: 'Password is required' })}
                />
              </div>
              {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 cursor-pointer select-none">
                <input type="checkbox" className="hidden" {...register('remember')} />
                <span className="inline-flex items-center justify-center w-5 h-5 rounded border border-gray-300">
                  { /* Simple checkbox icon change */ }
                  { /* Using CheckCircle and Circle for demo */ }
                  <Circle className="w-4 h-4 text-gray-400" />
                </span>
                <span className="text-sm text-gray-700">Remember me</span>
              </label>
              <Link href="/forget-password" className="text-sm text-blue-600 hover:text-blue-700">Forgot password?</Link>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || loginMutation.isPending}
              className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition"
            >
              {isSubmitting || loginMutation.isPending ? 'Signing in...' : 'Sign in'}
              <ArrowRight className="w-4 h-4" />
            </button>

            <button type="button" className="w-full inline-flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 font-medium py-2.5 rounded-lg hover:bg-gray-50 transition">
              {/* Placeholder Google icon */}
              <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#EA4335" d="M12 10.2v3.6h5.1c-.2 1.3-1.6 3.7-5.1 3.7-3.1 0-5.7-2.6-5.7-5.7s2.6-5.7 5.7-5.7c1.8 0 3 .8 3.7 1.5l2.5-2.4C16.8 3.8 14.6 3 12 3 6.9 3 2.7 7.2 2.7 12.3S6.9 21.6 12 21.6c5.1 0 8.4-3.6 8.4-8.7 0-.6-.1-1-.1-1.5H12z"/></svg>
              Continue with Google
            </button>

            <p className="text-sm text-gray-600 text-center">
              Don&apos;t have an account? <Link href="/signup" className="text-blue-600 hover:text-blue-700 font-medium">Create one</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
