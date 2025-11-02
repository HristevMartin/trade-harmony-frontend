import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HiXMark, HiEye, HiEyeSlash } from "react-icons/hi2";
import { X } from "lucide-react";
import { markRecentLogin } from "@/lib/fetch-interceptor";
import { GoogleLogin } from '@react-oauth/google';

interface AuthData {
    id: string;
    role: string[];
    token: string;
    email?: string;
}

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (authData: AuthData) => void;
    role?: string; // Optional role to specify user type (e.g., 'trader', 'customer')
    initialEmail?: string; // Optional initial email to prefill the form
    defaultTab?: 'login' | 'register'; // Optional default tab to show
}

const AuthModal = ({ isOpen, onClose, onSuccess, role = 'customer', initialEmail, defaultTab = 'login' }: AuthModalProps) => {
    const [activeTab, setActiveTab] = useState<'login' | 'register'>(defaultTab);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: initialEmail || '',
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Update email when initialEmail prop changes
    useEffect(() => {
        if (initialEmail && initialEmail !== formData.email) {
            setFormData(prev => ({ ...prev, email: initialEmail }));
        }
    }, [initialEmail]);

    // Reset to default tab when modal opens
    useEffect(() => {
        if (isOpen) {
            setActiveTab(defaultTab);
        }
    }, [isOpen, defaultTab]);

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => {
            const newData = { ...prev, [field]: value };
            
            // Clear errors after state update, with access to new values
            setErrors(prevErrors => {
                const newErrors = { ...prevErrors };
                
                // Clear current field error
                if (newErrors[field]) {
                    delete newErrors[field];
                }
                
                // Clear confirmPassword error when either password field changes
                // But only if passwords now match
                if (field === 'password' || field === 'confirmPassword') {
                    if (field === 'password' && newData.confirmPassword && newData.password === newData.confirmPassword) {
                        delete newErrors.confirmPassword;
                    } else if (field === 'confirmPassword' && newData.password === value) {
                        delete newErrors.confirmPassword;
                    }
                }
                
                return newErrors;
            });
            
            return newData;
        });
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }



        if (activeTab === 'register') {
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
        
        if (!validateForm()) return;

        setIsSubmitting(true);
        setErrors({});

        try {
            const endpoint = activeTab === 'login' ? '/travel/login' : '/travel/register';
            const payload = activeTab === 'login' 
                ? { email: formData.email, password: formData.password }
                : { email: formData.email, password: formData.password, role: role };

            const response = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (response.ok) {
                // Normalize role to always be an array
                const normalizedRole = Array.isArray(data.role) ? data.role : [data.role];
                const uniqueRoles = Array.from(new Set(normalizedRole.filter(Boolean))) as string[];
                
                localStorage.setItem("auth_user", JSON.stringify({
                    id: data.id,
                    role: uniqueRoles,
                }));

                markRecentLogin();

                window.dispatchEvent(new Event('authChange'));

                onSuccess({
                    id: data.id,
                    role: uniqueRoles,
                    token: data.token || '',
                    email: data.email,
                });

                setFormData({ email: '', password: '', confirmPassword: '' });
                onClose();
            } else {
                // Handle API errors
                if (data.message) {
                    setErrors({ general: data.message });
                } else {
                    setErrors({ general: 'An error occurred. Please try again.' });
                }
            }
        } catch (error) {
            console.error('Auth error:', error);
            setErrors({ general: 'Network error. Please check your connection.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse: any) => {
        setIsSubmitting(true);
        setErrors({});

        try {
            const apiUrl = import.meta.env.VITE_API_URL;
            const response = await fetch(`${apiUrl}/travel/auth/google`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    credential: credentialResponse.credential,
                    role: role // Pass the role from props (customer or trader)
                }),
            });

            const data = await response.json();

            if (response.ok) {
                // Normalize role to always be an array
                const normalizedRole = Array.isArray(data.role) ? data.role : [data.role];
                const uniqueRoles = Array.from(new Set(normalizedRole.filter(Boolean))) as string[];
                
                localStorage.setItem('auth_user', JSON.stringify({
                    id: data.id,
                    role: uniqueRoles,
                }));

                markRecentLogin();
                window.dispatchEvent(new Event('authChange'));

                onSuccess({
                    id: data.id,
                    role: uniqueRoles,
                    token: data.token || '',
                    email: data.email,
                });

                setFormData({ email: '', password: '', confirmPassword: '' });
                onClose();
            } else {
                setErrors({ general: data.message || 'Google authentication failed' });
            }
        } catch (error) {
            console.error('Google auth error:', error);
            setErrors({ general: 'Network error. Please try again.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGoogleError = () => {
        setErrors({ general: 'Google sign-in was cancelled or failed.' });
    };

    const handleClose = () => {
        setFormData({ email: '', password: '', confirmPassword: '' });
        setErrors({});
        setActiveTab('login');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <Card className="max-w-md w-full bg-white shadow-2xl rounded-2xl border-0">
                <CardHeader className="relative pb-4">
                    <button
                        onClick={handleClose}
                        className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 transition-colors"
                        aria-label="Close modal"
                    >
                        <HiXMark className="w-5 h-5" />
                    </button>
                    
                    <CardTitle className="text-xl font-bold text-center text-slate-900 pr-8">
                        Welcome to HireLocal
                    </CardTitle>
                    
                    {/* Subtitle for registration flow */}
                    {defaultTab === 'register' && (
                        <p className="text-sm text-center text-slate-600 mt-2">
                            Create your account to continue
                        </p>
                    )}
                    
                    {/* Tab Navigation - Hide when defaultTab is 'register' (user is in registration flow) */}
                    {defaultTab !== 'register' && (
                        <div className="flex bg-slate-100 rounded-lg p-1 mt-4">
                            <button
                                onClick={() => setActiveTab('login')}
                                className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                                    activeTab === 'login'
                                        ? 'bg-white text-slate-900 shadow-sm'
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                Login
                            </button>
                            <button
                                onClick={() => setActiveTab('register')}
                                className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                                    activeTab === 'register'
                                        ? 'bg-white text-slate-900 shadow-sm'
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                Register
                            </button>
                        </div>
                    )}
                </CardHeader>

                <CardContent className="pt-0">
                    {/* General Error */}
                    {errors.general && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-600">{errors.general}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">

                        {/* Email */}
                        <div>
                            <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                                Email Address
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                placeholder="Enter your email"
                                className={`mt-1 rounded-lg border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 ${
                                    errors.email ? 'border-red-300 bg-red-50' : ''
                                }`}
                                aria-invalid={!!errors.email}
                            />
                            {errors.email && (
                                <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                            )}
                        </div>

                        {/* Password */}
                        <div>
                            <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                                Password
                            </Label>
                            <div className="relative mt-1">
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={(e) => handleInputChange('password', e.target.value)}
                                    placeholder={activeTab === 'login' ? 'Enter your password' : 'Create a password (min 6 characters)'}
                                    className={`pr-10 rounded-lg border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 ${
                                        errors.password ? 'border-red-300 bg-red-50' : ''
                                    }`}
                                    aria-invalid={!!errors.password}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? (
                                        <HiEyeSlash className="w-4 h-4" />
                                    ) : (
                                        <HiEye className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="mt-1 text-xs text-red-600">{errors.password}</p>
                            )}
                        </div>

                        {/* Confirm Password (Register only) */}
                        {activeTab === 'register' && (
                            <div>
                                <Label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700">
                                    Confirm Password
                                </Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    value={formData.confirmPassword}
                                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                                    placeholder="Confirm your password"
                                    className={`mt-1 rounded-lg border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 ${
                                        errors.confirmPassword ? 'border-red-300 bg-red-50' : ''
                                    }`}
                                    aria-invalid={!!errors.confirmPassword}
                                />
                                {errors.confirmPassword && (
                                    <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>
                                )}
                            </div>
                        )}

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <div className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    {activeTab === 'login' ? 'Signing In...' : 'Creating Account...'}
                                </div>
                            ) : (
                                activeTab === 'login' ? 'Sign In' : 'Create Account'
                            )}
                        </Button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-gray-300" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-2 text-gray-500">Or continue with</span>
                        </div>
                    </div>

                    {/* Google Sign-In Button */}
                    <div className="w-full flex justify-center">
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={handleGoogleError}
                            useOneTap={false}
                            theme="outline"
                            size="large"
                            text={activeTab === 'login' ? 'signin_with' : 'signup_with'}
                        />
                    </div>

                    {/* Footer Message - Hide when in registration flow */}
                    {defaultTab !== 'register' && (
                        <div className="mt-6 text-center">
                            <p className="text-sm text-slate-600">
                                {activeTab === 'login' ? "Don't have an account? " : "Already have an account? "}
                                <button
                                    type="button"
                                    onClick={() => setActiveTab(activeTab === 'login' ? 'register' : 'login')}
                                    className="text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    {activeTab === 'login' ? 'Sign up' : 'Sign in'}
                                </button>
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default AuthModal;
