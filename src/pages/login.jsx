import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/auth/AuthContext';
import config from '../config/config';
import { showToast } from '../utils/toast';
import { Eye, EyeOff } from 'lucide-react';
import useFormData from '../hooks/useFormData';

export default function LoginPage() {
  const dynamicFormData = useFormData();
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isSending, setIsSending] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSending(true);

    config.initAPI(null)
    config.postData('/user/login', formData)
      .then(data => {
        console.log(data)
        const success = data.data.success;
        const message = data.data.message;
        if (success) {
          const user = data.data.data.user;
          const at = data.data.data.access_token;
          login({
            token: at,
            user: user,
          });
          showToast.success(message);
        }
        else {
          showToast.error(message);
        }
      })
      .catch(error => {
        console.error('Login error:', error);
        showToast.error(error.message);
      })
      .finally(() => {
        setIsSending(false);
      });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold">{dynamicFormData.websiteName}</h2>
          <p className="text-gray-600 mt-2">Please sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                className="mt-1"
                placeholder="Enter your password"
                required
              />
                 <span
                    className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-gray-500"
                    onClick={() => setShowPassword(prev => !prev)}
                  >
                    {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                  </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="rememberMe"
                type="checkbox"
                checked={formData.rememberMe}
                onChange={handleChange}
                className="h-4 w-4 text-primary border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                className="font-medium text-primary hover:text-primary/80"
              >
                Forgot your password?
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full">
            {isSending ? 'Signing in...' : 'Sign in'}
          </Button>

        </form>
      </Card>
    </div>
  );
}