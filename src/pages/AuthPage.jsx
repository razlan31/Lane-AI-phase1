import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import EnhancedAuthFlow from "@/components/auth/EnhancedAuthFlow";

const AuthPage = () => {
  
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const { toast } = useToast();


  const signIn = async () => {
    setError(null);
    setLoading(true);
    try {
      const normalizedEmail = (email || '').trim().toLowerCase();
      const { error } = await supabase.auth.signInWithPassword({ 
        email: normalizedEmail, 
        password 
      });
      
      if (error) {
        if (error.message.includes('email_not_confirmed')) {
          setError("Please check your email and click the confirmation link before signing in.");
        } else if (error.message.includes('Invalid login credentials')) {
          setError("Invalid email or password. Please check your credentials and try again.");
        } else {
          setError(error.message);
        }
      } else {
        toast.success("Welcome back! You have successfully signed in.");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  const signUp = async () => {
    setError(null);
    setSuccess(null);
    setLoading(true);
    
    try {
      const redirectUrl = `${window.location.origin}/`;
      const normalizedEmail = (email || '').trim().toLowerCase();
      const { error, data } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: { 
          data: { full_name: fullName }, 
          emailRedirectTo: redirectUrl 
        }
      });
      
      if (error) {
        if (error.message.includes('over_email_send_rate_limit')) {
          setError("Too many signup attempts. Please wait 45 seconds before trying again.");
        } else if (error.message.includes('User already registered')) {
          setError("An account with this email already exists. Please sign in instead.");
        } else {
          setError(error.message);
        }
      } else if (data?.user && !data?.session) {
        setSuccess("Account created! Please check your email and click the confirmation link to complete registration.");
        // Switch to sign in mode after successful signup
        setTimeout(() => {
          setMode("signin");
          setSuccess(null);
        }, 3000);
      } else {
        toast.success("Account created! Welcome to Lane AI!");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    if (!email) {
      setError("Please enter your email address first.");
      return;
    }
    
    setError(null);
    setLoading(true);
    
    try {
      const normalizedEmail = (email || '').trim().toLowerCase();
      const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
        redirectTo: `${window.location.origin}/#/reset-password`
      });
      
      if (error) {
        setError(error.message);
        toast.error(`Password Reset Failed: ${error.message}`);
      } else {
        setSuccess("Password reset email sent! Please check your inbox.");
        toast.success("Reset Email Sent - Please check your email and follow the link to reset your password.");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">
            {mode === 'signin' ? 'Welcome back' : 'Create account'}
          </CardTitle>
          <CardDescription className="text-center">
            {mode === 'signin' 
              ? 'Sign in to your Lane AI account' 
              : 'Create your Lane AI account to get started'
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {mode === 'signup' && (
            <div className="space-y-2">
              <Label htmlFor="fullName">Full name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="Jane Doe"
                  className="pl-10"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="pl-10 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {mode === 'signin' && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="rememberMe" 
                  checked={rememberMe}
                  onCheckedChange={setRememberMe}
                />
                <Label htmlFor="rememberMe" className="text-sm">Keep me logged in</Label>
              </div>
              <button 
                onClick={resetPassword}
                className="text-sm text-primary hover:underline"
                disabled={loading}
              >
                Forgot password?
              </button>
            </div>
          )}

          {error && (
            <div className="flex items-start space-x-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {success && (
            <div className="flex items-start space-x-2 p-3 bg-green-50 border border-green-200 rounded-md">
              <Mail className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-green-700">{success}</p>
            </div>
          )}

          <div className="space-y-3">
            {mode === 'signin' ? (
              <Button 
                onClick={signIn} 
                disabled={loading || !email || !password} 
                className="w-full"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </Button>
            ) : (
              <Button 
                onClick={signUp} 
                disabled={loading || !email || !password || !fullName} 
                className="w-full"
              >
                {loading ? 'Creating account...' : 'Create account'}
              </Button>
            )}
          </div>

          <div className="text-center">
            {mode === 'signin' ? (
              <p className="text-sm text-muted-foreground">
                Don't have an account?{' '}
                <button 
                  onClick={() => {
                    setMode('signup');
                    setError(null);
                    setSuccess(null);
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
                    setMode('signin');
                    setError(null);
                    setSuccess(null);
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

export default AuthPage;