import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  AlertCircle,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const EnhancedAuthFlow = () => {
  const [step, setStep] = useState(1);
  const [authMode, setAuthMode] = useState('signin');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    experienceLevel: '',
    ventureType: '',
    role: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(0);
  const { toast } = useToast();

  const totalSteps = authMode === 'signup' ? 3 : 1;
  const progress = (step / totalSteps) * 100;

  // Password strength calculation
  useEffect(() => {
    if (formData.password) {
      let strength = 0;
      if (formData.password.length >= 8) strength += 25;
      if (/[A-Z]/.test(formData.password)) strength += 25;
      if (/[0-9]/.test(formData.password)) strength += 25;
      if (/[^A-Za-z0-9]/.test(formData.password)) strength += 25;
      setPasswordStrength(strength);
    } else {
      setPasswordStrength(0);
    }
  }, [formData.password]);

  const validateStep = (stepNumber) => {
    const newErrors = {};
    
    switch (stepNumber) {
      case 1:
        if (!formData.email) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email';
        
        if (!formData.password) newErrors.password = 'Password is required';
        else if (authMode === 'signup' && formData.password.length < 8) {
          newErrors.password = 'Password must be at least 8 characters';
        }
        
        if (authMode === 'signup') {
          if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm password';
          else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
          }
          if (!formData.fullName) newErrors.fullName = 'Full name is required';
        }
        break;
        
      case 2:
        if (!formData.experienceLevel) newErrors.experienceLevel = 'Experience level is required';
        if (!formData.ventureType) newErrors.ventureType = 'Venture type is required';
        break;
        
      case 3:
        if (!formData.role) newErrors.role = 'Role is required';
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      if (step < totalSteps) {
        setStep(step + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    
    try {
      if (authMode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email.trim().toLowerCase(),
          password: formData.password
        });
        
        if (error) throw error;
        
        toast({
          title: "Welcome back!",
          description: "You have successfully signed in."
        });
      } else {
        // Sign up
        const { error, data } = await supabase.auth.signUp({
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          options: {
            data: {
              full_name: formData.fullName,
              experience_level: formData.experienceLevel,
              venture_type: formData.ventureType,
              role: formData.role
            }
          }
        });
        
        if (error) throw error;
        
        if (data?.user && !data?.session) {
          toast({
            title: "Account Created!",
            description: "Please check your email and click the confirmation link.",
          });
          setStep(4); // Show email confirmation step
        } else {
          toast({
            title: "Welcome to Lane AI!",
            description: "Your account has been created successfully."
          });
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      toast({
        title: "Authentication Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      {authMode === 'signup' && (
        <div className="space-y-2">
          <Label htmlFor="fullName">Full name</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="fullName"
              value={formData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              placeholder="Jane Doe"
              className={`pl-10 ${errors.fullName ? 'border-destructive' : ''}`}
            />
          </div>
          {errors.fullName && (
            <p className="text-sm text-destructive">{errors.fullName}</p>
          )}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="you@example.com"
            className={`pl-10 ${errors.email ? 'border-destructive' : ''}`}
          />
        </div>
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            placeholder="••••••••"
            className={`pl-10 pr-10 ${errors.password ? 'border-destructive' : ''}`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {authMode === 'signup' && formData.password && (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Progress value={passwordStrength} className="flex-1 h-2" />
              <span className="text-xs text-muted-foreground">
                {passwordStrength < 50 ? 'Weak' : passwordStrength < 75 ? 'Good' : 'Strong'}
              </span>
            </div>
          </div>
        )}
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password}</p>
        )}
      </div>

      {authMode === 'signup' && (
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              placeholder="••••••••"
              className={`pl-10 pr-10 ${errors.confirmPassword ? 'border-destructive' : ''}`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-sm text-destructive">{errors.confirmPassword}</p>
          )}
        </div>
      )}
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold">Tell us about yourself</h3>
        <p className="text-sm text-muted-foreground">
          This helps us personalize your experience
        </p>
      </div>

      <div className="space-y-2">
        <Label>What's your experience level?</Label>
        <div className="grid grid-cols-1 gap-2">
          {[
            { value: 'first-time', label: 'First-time founder' },
            { value: 'experienced', label: 'Experienced entrepreneur' },
            { value: 'serial', label: 'Serial entrepreneur' },
            { value: 'employee', label: 'Employee with startup aspirations' }
          ].map(option => (
            <label key={option.value} className="flex items-center space-x-2 p-3 rounded-lg border cursor-pointer hover:bg-muted/50">
              <input
                type="radio"
                value={option.value}
                checked={formData.experienceLevel === option.value}
                onChange={(e) => handleInputChange('experienceLevel', e.target.value)}
                className="rounded"
              />
              <span className="text-sm">{option.label}</span>
            </label>
          ))}
        </div>
        {errors.experienceLevel && (
          <p className="text-sm text-destructive">{errors.experienceLevel}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>What type of venture are you working on?</Label>
        <div className="grid grid-cols-1 gap-2">
          {[
            { value: 'saas', label: 'SaaS / Software' },
            { value: 'ecommerce', label: 'E-commerce / Retail' },
            { value: 'consulting', label: 'Consulting / Services' },
            { value: 'marketplace', label: 'Marketplace / Platform' },
            { value: 'hardware', label: 'Hardware / Physical Product' },
            { value: 'other', label: 'Other / Exploring' }
          ].map(option => (
            <label key={option.value} className="flex items-center space-x-2 p-3 rounded-lg border cursor-pointer hover:bg-muted/50">
              <input
                type="radio"
                value={option.value}
                checked={formData.ventureType === option.value}
                onChange={(e) => handleInputChange('ventureType', e.target.value)}
                className="rounded"
              />
              <span className="text-sm">{option.label}</span>
            </label>
          ))}
        </div>
        {errors.ventureType && (
          <p className="text-sm text-destructive">{errors.ventureType}</p>
        )}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold">What's your role?</h3>
        <p className="text-sm text-muted-foreground">
          This helps us show you the most relevant metrics
        </p>
      </div>

      <div className="space-y-2">
        <div className="grid grid-cols-1 gap-2">
          {[
            { value: 'founder-ceo', label: 'Founder / CEO' },
            { value: 'founder-cto', label: 'Founder / CTO' },
            { value: 'cofounder', label: 'Co-founder' },
            { value: 'product-manager', label: 'Product Manager' },
            { value: 'business-dev', label: 'Business Development' },
            { value: 'consultant', label: 'Consultant / Advisor' }
          ].map(option => (
            <label key={option.value} className="flex items-center space-x-2 p-3 rounded-lg border cursor-pointer hover:bg-muted/50">
              <input
                type="radio"
                value={option.value}
                checked={formData.role === option.value}
                onChange={(e) => handleInputChange('role', e.target.value)}
                className="rounded"
              />
              <span className="text-sm">{option.label}</span>
            </label>
          ))}
        </div>
        {errors.role && (
          <p className="text-sm text-destructive">{errors.role}</p>
        )}
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="text-center space-y-4">
      <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
      <h3 className="text-lg font-semibold">Check Your Email</h3>
      <p className="text-sm text-muted-foreground">
        We've sent a confirmation link to <strong>{formData.email}</strong>
      </p>
      <p className="text-xs text-muted-foreground">
        Click the link in your email to complete your registration
      </p>
    </div>
  );

  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">
            {authMode === 'signin' ? 'Welcome back' : 'Join Lane AI'}
          </CardTitle>
          <CardDescription className="text-center">
            {authMode === 'signin' 
              ? 'Sign in to your account' 
              : 'Create your account and start building'
            }
          </CardDescription>
          {authMode === 'signup' && step <= totalSteps && (
            <div className="space-y-2">
              <Progress value={progress} className="w-full" />
              <p className="text-xs text-muted-foreground text-center">
                Step {step} of {totalSteps}
              </p>
            </div>
          )}
        </CardHeader>
        
        <CardContent className="space-y-4">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}

          {step <= totalSteps && (
            <div className="flex justify-between pt-4">
              {step > 1 && authMode === 'signup' ? (
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={loading}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              ) : (
                <div />
              )}

              {step < totalSteps || authMode === 'signin' ? (
                <Button
                  onClick={handleNext}
                  disabled={loading}
                >
                  {loading ? (
                    'Processing...'
                  ) : step === totalSteps || authMode === 'signin' ? (
                    authMode === 'signin' ? 'Sign In' : 'Create Account'
                  ) : (
                    <>
                      Next
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              ) : null}
            </div>
          )}

          <div className="text-center pt-4">
            {authMode === 'signin' ? (
              <p className="text-sm text-muted-foreground">
                Don't have an account?{' '}
                <button 
                  onClick={() => {
                    setAuthMode('signup');
                    setStep(1);
                    setErrors({});
                  }} 
                  className="text-primary hover:underline"
                >
                  Sign up
                </button>
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <button 
                  onClick={() => {
                    setAuthMode('signin');
                    setStep(1);
                    setErrors({});
                  }} 
                  className="text-primary hover:underline"
                >
                  Sign in
                </button>
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </main>
  );
};

export default EnhancedAuthFlow;