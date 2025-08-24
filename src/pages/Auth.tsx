import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, Loader2, Mail, Lock, User, ArrowLeft } from "lucide-react";

const Auth = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      
      // Clear errors after state update, with access to new values
      setErrors(prevErrors => {
        const newErrors = { ...prevErrors };
        
        // Clear current field error
        if (newErrors[name]) {
          delete newErrors[name];
        }
        
        // Clear confirmPassword error when either password field changes
        // But only if passwords now match
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

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (activeTab === 'register') {
      // Confirm password validation
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const endpoint = activeTab === 'login' ? '/travel/login' : '/travel/register';
      
      const payload = activeTab === 'login' 
        ? { 
            email: formData.email, 
            password: formData.password 
          }
        : { 
            email: formData.email, 
            password: formData.password 
          };

      const fullUrl = `${apiUrl}${endpoint}`;
      console.log('the full url is', fullUrl);

      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        // Store authentication data
        localStorage.setItem('access_token', data.token);
        localStorage.setItem('auth_user', JSON.stringify({ 
          id: data.id, 
          role: data.role, 
          email: formData.email
        }));
        
        // Dispatch custom event to notify other components of auth change
        window.dispatchEvent(new Event('authChange'));
        
        // Redirect to home page
        navigate('/');
      } else {
        setErrors({ general: data.message || 'Authentication failed' });
      }
    } catch (error) {
      setErrors({ general: 'Network error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const switchTab = (tab: 'login' | 'register') => {
    setActiveTab(tab);
    setErrors({});
    setFormData({
      email: '',
      password: '',
      confirmPassword: ''
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto px-4 sm:px-6 py-6 md:py-12 flex flex-col min-h-screen md:justify-center">
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6 md:mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
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
                <CardTitle className="text-2xl font-bold text-trust-blue">Welcome to JobHub</CardTitle>
                <CardDescription className="text-muted-foreground mt-2">
                  {activeTab === 'login' 
                    ? 'Sign in to your account to continue' 
                    : 'Create your account to get started'
                  }
                </CardDescription>
              </div>

              {/* Tab Switcher */}
              <div className="flex rounded-lg bg-muted p-1">
                <button
                  onClick={() => switchTab('login')}
                  className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all duration-200 ${
                    activeTab === 'login'
                      ? 'bg-white text-trust-blue shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Login
                </button>
                <button
                  onClick={() => switchTab('register')}
                  className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all duration-200 ${
                    activeTab === 'register'
                      ? 'bg-white text-trust-blue shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Register
                </button>
              </div>
            </CardHeader>

            <CardContent className="space-y-6 flex-1 flex flex-col md:block">
              {/* General Error */}
              {errors.general && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {errors.general}
                </div>
              )}

              {activeTab === 'login' ? (
                <form id="auth-form" onSubmit={handleSubmit} className="space-y-4 flex-1 flex flex-col md:block">
                  <div className="flex-1 space-y-4 md:space-y-4">
                  {/* Email Field */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-foreground">
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`pl-10 h-12 min-h-[48px] rounded-lg border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 ${errors.email ? 'border-red-300 bg-red-50' : ''}`}
                        disabled={isLoading}
                        aria-invalid={!!errors.email}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                    )}
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium text-foreground">
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleInputChange}
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
                  </div>

                  {/* Desktop Submit Button - Login Only */}
                  <div className="hidden md:block">
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-12 bg-accent-orange hover:bg-accent-orange/90 text-white font-semibold transition-all duration-300 mt-6"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Signing in...
                        </>
                      ) : (
                        'Sign In'
                      )}
                    </Button>
                  </div>
                </form>
              ) : (
                /* Register Tab - Call to Action Content */
                <div className="flex-1 flex flex-col md:block space-y-6">
                  <div className="flex-1 text-center space-y-6">
                    <h3 className="text-xl font-semibold text-foreground mb-4">
                      Create your account by starting the right journey
                    </h3>
                    
                    <div className="space-y-4 text-left">
                      <p className="text-sm text-gray-600 flex items-start gap-2">
                        <span className="text-accent-orange font-bold">•</span>
                        <span><strong>Homeowners:</strong> You'll be asked to create an account when posting your first job.</span>
                      </p>
                      <p className="text-sm text-gray-600 flex items-start gap-2">
                        <span className="text-trust-blue font-bold">•</span>
                        <span><strong>Tradespeople:</strong> You'll create your account during the onboarding process.</span>
                      </p>
                    </div>

                    <div className="space-y-3 mt-8">
                      {/* Primary CTA - Post a Job */}
                      <Button
                        onClick={() => navigate('/post-job')}
                        className="bg-orange-500 text-white hover:bg-orange-600 w-full py-2.5 rounded-lg font-medium h-12 min-h-[48px] transition-all duration-300"
                        aria-label="Post a Job"
                      >
                        Post a Job
                      </Button>

                      {/* Secondary CTA - Join as Tradesperson */}
                      <Button
                        onClick={() => navigate('/tradesperson/onboarding')}
                        variant="outline"
                        className="border border-gray-300 text-gray-700 hover:bg-gray-50 w-full py-2.5 rounded-lg font-medium h-12 min-h-[48px] transition-all duration-300"
                        aria-label="Join as a Tradesperson"
                      >
                        Join as a Tradesperson
                      </Button>
                    </div>

                    <small className="text-xs text-gray-500 mt-6 block">
                      Registration happens inside the flow so we can set up your account correctly.
                    </small>
                  </div>
                </div>
              )}

              {/* Footer Links - Only for Login Tab */}
              {activeTab === 'login' && (
                <div className="text-center space-y-3 pt-4 border-t border-border/50">
                  <div className="space-y-2">
                    <button className="text-sm text-trust-blue hover:underline">
                      Forgot your password?
                    </button>
                    <p className="text-sm text-muted-foreground">
                      Don't have an account?{' '}
                      <button
                        onClick={() => switchTab('register')}
                        className="text-trust-blue hover:underline font-medium"
                      >
                        Sign up here
                      </button>
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Mobile Sticky Button - Only for Login Tab */}
        {activeTab === 'login' && (
          <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 p-4">
            <Button
              type="submit"
              form="auth-form"
              disabled={isLoading}
              className="w-full h-12 min-h-[48px] bg-accent-orange hover:bg-accent-orange/90 text-white font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </div>
        )}

        {/* Mobile spacer for sticky button - Only for Login Tab */}
        {activeTab === 'login' && <div className="h-20 md:hidden" />}
      </div>
    </div>
  );
};

export default Auth;
