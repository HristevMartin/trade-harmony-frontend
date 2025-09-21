import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, Loader2, Lock, ArrowLeft, CheckCircle, XCircle } from "lucide-react";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? "";
  
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [resetComplete, setResetComplete] = useState(false);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });

  // Check if token exists on component mount
  useEffect(() => {
    if (!token) {
      setTokenValid(false);
    } else {
      setTokenValid(true);
    }
  }, [token]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      
      setErrors(prevErrors => {
        const newErrors = { ...prevErrors };
        
        if (newErrors[name]) {
          delete newErrors[name];
        }
        
        if (name === 'password' || name === 'confirmPassword') {
          if (name === 'password' && newData.confirmPassword && newData.password === newData.confirmPassword) {
            delete newErrors.confirmPassword;
          } else if (name === 'confirmPassword' && newData.password === value) {
            delete newErrors.confirmPassword;
          }
        }
        
        return newErrors;
      });
      
      return newData;
    });
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Guard against missing token
    if (!token) {
      setTokenValid(false);
      return;
    }
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const endpoint = '/travel/reset-password';
      
      const payload = {
        token: token,
        new_password: formData.password
      };

      const headers = {
        "Content-Type": "application/json",
      };

      const fullUrl = `${apiUrl}${endpoint}`;
      console.log('Reset password URL:', fullUrl);
      console.log('Reset password payload:', payload);

      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        setResetComplete(true);
      } else {
        const errorMessage = data.error || data.message || 'Failed to reset password';
        
        if (response.status === 400 && errorMessage.toLowerCase().includes('invalid') || errorMessage.toLowerCase().includes('expired')) {
          setTokenValid(false);
        } else {
          setErrors({ general: errorMessage });
        }
      }
    } catch (error) {
      setErrors({ general: 'Network error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Invalid token state
  if (tokenValid === false) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-md mx-auto px-4 sm:px-6 py-6 md:py-12 flex flex-col min-h-screen md:justify-center">
          <button
            onClick={() => navigate('/auth')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6 md:mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Login
          </button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex-1 flex flex-col"
          >
            <Card className="shadow-xl border-0 bg-white/95 backdrop-blur flex-1 md:flex-initial">
              <CardContent className="p-8 text-center space-y-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                  <XCircle className="h-8 w-8 text-red-600" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold text-foreground">
                    Invalid Reset Link
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    This password reset link is invalid or has expired. Please request a new one.
                  </p>
                </div>
                <Button
                  onClick={() => navigate('/auth')}
                  className="w-full bg-accent-orange hover:bg-accent-orange/90"
                >
                  Request New Reset Link
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  // Success state
  if (resetComplete) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-md mx-auto px-4 sm:px-6 py-6 md:py-12 flex flex-col min-h-screen md:justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex-1 flex flex-col"
          >
            <Card className="shadow-xl border-0 bg-white/95 backdrop-blur flex-1 md:flex-initial">
              <CardContent className="p-8 text-center space-y-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold text-foreground">
                    Password Reset Successful
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Your password has been successfully updated. You can now sign in with your new password.
                  </p>
                </div>
                <Button
                  onClick={() => navigate('/auth')}
                  className="w-full bg-accent-orange hover:bg-accent-orange/90"
                >
                  Sign In Now
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  // Main reset password form
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto px-4 sm:px-6 py-6 md:py-12 flex flex-col min-h-screen md:justify-center">
        <button
          onClick={() => navigate('/auth')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6 md:mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Login
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex-1 flex flex-col"
        >
          <Card className="shadow-xl border-0 bg-white/95 backdrop-blur flex-1 md:flex-initial">
            <CardHeader className="space-y-4 pb-6">
              <div className="text-center">
                <CardTitle className="text-2xl font-bold text-trust-blue">Reset Your Password</CardTitle>
                <CardDescription className="text-muted-foreground mt-2">
                  Enter your new password below
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-6 flex-1 flex flex-col md:block">
              {/* General Error */}
              {errors.general && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm" aria-live="polite">
                  {errors.general}
                </div>
              )}

              <form id="reset-form" onSubmit={handleSubmit} className="space-y-4 flex-1 flex flex-col md:block">
                <div className="flex-1 space-y-4 md:space-y-4">
                  {/* New Password Field */}
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium text-foreground">
                      New Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your new password"
                        value={formData.password}
                        onChange={handleInputChange}
                        autoComplete="new-password"
                        className={`pl-10 pr-10 h-12 min-h-[48px] rounded-lg border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 ${errors.password ? 'border-red-300 bg-red-50' : ''}`}
                        disabled={isLoading}
                        aria-invalid={!!errors.password}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                    )}
                  </div>

                  {/* Confirm Password Field */}
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
                      Confirm New Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm your new password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        autoComplete="new-password"
                        className={`pl-10 pr-10 h-12 min-h-[48px] rounded-lg border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 ${errors.confirmPassword ? 'border-red-300 bg-red-50' : ''}`}
                        disabled={isLoading}
                        aria-invalid={!!errors.confirmPassword}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
                    )}
                  </div>
                </div>

                {/* Desktop Submit Button */}
                <div className="hidden md:block">
                  <Button
                    type="submit"
                    disabled={isLoading || !token}
                    className="w-full h-12 bg-accent-orange hover:bg-accent-orange/90 text-white font-semibold transition-all duration-300 mt-6"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating Password...
                      </>
                    ) : (
                      'Update Password'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Mobile Sticky Button */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 p-4">
          <Button
            type="submit"
            form="reset-form"
            disabled={isLoading || !token}
            className="w-full h-12 min-h-[48px] bg-accent-orange hover:bg-accent-orange/90 text-white font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating Password...
              </>
            ) : (
              'Update Password'
            )}
          </Button>
        </div>

        {/* Mobile spacer for sticky button */}
        <div className="h-20 md:hidden" />
      </div>
    </div>
  );
};

export default ResetPassword;
