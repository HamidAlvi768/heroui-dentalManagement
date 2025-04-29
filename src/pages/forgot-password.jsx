import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import config from '../config/config';
import { showToast } from '../utils/toast';
import { Icon } from '@iconify/react';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [isSending, setIsSending] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSending(true);

    config.postData('/user/forgot-password', { email })
      .then(response => {
        const { success, message } = response.data;
        if (success) {
          showToast.success(message || 'Reset password link has been sent to your email');
          navigate('/login');
        } else {
          showToast.error(message || 'Failed to process request');
        }
      })
      .catch(error => {
        console.error('Forgot password error:', error);
        showToast.error(error.message || 'An error occurred');
      })
      .finally(() => {
        setIsSending(false);
      });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Icon icon="lucide:lock" className="w-12 h-12 text-primary" />
          </div>
          <h2 className="text-3xl font-bold">Forgot Password?</h2>
          <p className="text-gray-600 mt-2">Enter your email to reset your password</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1"
              placeholder="Enter your email"
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSending}>
            {isSending ? 'Sending...' : 'Send Reset Link'}
          </Button>

          <p className="text-center text-sm text-gray-600">
            Remember your password?{' '}
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="font-medium text-primary hover:text-primary/80"
            >
              Back to login
            </button>
          </p>
        </form>
      </Card>
    </div>
  );
}