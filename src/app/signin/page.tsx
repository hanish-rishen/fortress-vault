'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { checkPasswordStrength, generatePassword } from '@/lib/passwordUtils';

const PasswordInput = ({ 
  id, 
  value, 
  onChange, 
  placeholder = "Password",
  showGenerateButton = false,
  onGenerate
}: {
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  showGenerateButton?: boolean;
  onGenerate?: () => void;
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <input
        id={id}
        name={id}
        type={showPassword ? "text" : "password"}
        required
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-black text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
      >
        {showPassword ? (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        )}
      </button>
      {showGenerateButton && (
        <button
          type="button"
          onClick={onGenerate}
          className="absolute right-9 top-1/2 -translate-y-1/2 text-sm text-blue-500 hover:text-blue-600 mr-4"
        >
          Generate
        </button>
      )}
    </div>
  );
};

export default function SignIn() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [statusMessage, setStatusMessage] = useState<{text: string, isError: boolean} | null>(null);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const passwordStrength = checkPasswordStrength(password);
  const strengthColor = {
    1: 'bg-red-500',
    2: 'bg-orange-500',
    3: 'bg-yellow-500',
    4: 'bg-green-500',
    5: 'bg-green-600',
  }[passwordStrength.score] || 'bg-gray-200';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLogin && password !== confirmPassword) {
      setStatusMessage({
        text: 'Passwords do not match',
        isError: true
      });
      return;
    }

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, isLogin })
      });

      const data = await response.json();
      
      if (!response.ok) {
        setStatusMessage({
          text: data.error || 'Authentication failed',
          isError: true
        });
        return;
      }

      if (!isLogin) {
        setStatusMessage({
          text: 'Registration successful! Please sign in.',
          isError: false
        });
        setIsLogin(true);
        setPassword('');
        setConfirmPassword('');
      } else {
        setStatusMessage({
          text: 'Login successful!',
          isError: false
        });
        setTimeout(() => {
          router.replace('/');
        }, 100);
      }
    } catch (error) {
      console.error('Detailed auth error:', error);
      setStatusMessage({
        text: 'Authentication failed - please check console for details',
        isError: true
      });
    }
  };

  const handleGeneratePassword = () => {
    const newPassword = generatePassword();
    setPassword(newPassword);
    setConfirmPassword(newPassword);
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold">Fortress Vault</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {isLogin ? 'Sign in to access your vault' : 'Create your vault account'}
          </p>
        </div>

        {statusMessage && (
          <div className={`p-4 rounded-md flex items-center space-x-3 border-2 ${
            statusMessage.isError 
              ? 'bg-red-100 text-red-700 border-red-500' 
              : 'bg-green-100 text-green-700 border-green-500'
          }`}>
            {statusMessage.isError ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
            <span className="font-medium">{statusMessage.text}</span>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-black text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium">
                Password
              </label>
              <div className="mt-1 space-y-2">
                <PasswordInput
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  showGenerateButton={!isLogin}
                  onGenerate={handleGeneratePassword}
                />
                {!isLogin && (
                  <>
                    <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${strengthColor} transition-all duration-300`}
                        style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                      />
                    </div>
                    <ul className="text-xs space-y-1 text-gray-500">
                      <li className={passwordStrength.checks.length ? 'text-green-500' : ''}>
                        ✓ At least 8 characters
                      </li>
                      <li className={passwordStrength.checks.uppercase ? 'text-green-500' : ''}>
                        ✓ At least one uppercase letter
                      </li>
                      <li className={passwordStrength.checks.lowercase ? 'text-green-500' : ''}>
                        ✓ At least one lowercase letter
                      </li>
                      <li className={passwordStrength.checks.numbers ? 'text-green-500' : ''}>
                        ✓ At least one number
                      </li>
                      <li className={passwordStrength.checks.special ? 'text-green-500' : ''}>
                        ✓ At least one special character
                      </li>
                    </ul>
                  </>
                )}
              </div>
            </div>
            {!isLogin && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium">
                  Confirm Password
                </label>
                <div className="mt-1">
                  <PasswordInput
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {isLogin ? 'Sign in' : 'Register'}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setPassword('');
                setConfirmPassword('');
                setStatusMessage(null);
              }}
              className="text-sm text-blue-500 hover:text-blue-600"
            >
              {isLogin ? 'Need an account? Register' : 'Already have an account? Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}