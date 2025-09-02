import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const AuthPage = () => {
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleError = (error) => {
    let message = error?.message || 'An unexpected error occurred';
    
    // Handle common Supabase auth errors
    if (message.includes('Invalid login credentials')) {
      message = 'Invalid email or password. Please check your credentials and try again.';
    } else if (message.includes('Email not confirmed')) {
      message = 'Please check your email and click the confirmation link before signing in.';
    } else if (message.includes('User already registered')) {
      message = 'An account with this email already exists. Try signing in instead.';
    }
    
    toast({
      title: "Authentication Error",
      description: message,
      variant: "destructive"
    });
  };

  const signIn = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Missing Information",
        description: "Please enter both email and password.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    
    if (error) {
      handleError(error);
    } else {
      toast({
        title: "Welcome back!",
        description: "You've been signed in successfully."
      });
    }
  };

  const signUp = async (e) => {
    e.preventDefault();
    if (!email || !password || !fullName) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields.",
        variant: "destructive"
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    const redirectUrl = `${window.location.origin}/`;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { 
        data: { full_name: fullName },
        emailRedirectTo: redirectUrl
      }
    });
    setLoading(false);
    
    if (error) {
      handleError(error);
    } else {
      toast({
        title: "Account Created!",
        description: "Please check your email for a confirmation link."
      });
    }
  };

  const signInWithGoogle = async () => {
    const redirectUrl = `${window.location.origin}/`;
    const { error } = await supabase.auth.signInWithOAuth({ 
      provider: 'google', 
      options: { redirectTo: redirectUrl } 
    });
    
    if (error) {
      handleError(error);
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
      <section className="w-full max-w-md bg-card border border-border rounded-xl p-6 shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Lane AI
          </h1>
          <p className="text-muted-foreground">
            {mode === 'signin' ? 'Welcome back' : 'Create your account'}
          </p>
        </div>

        <form onSubmit={mode === 'signin' ? signIn : signUp} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-medium mb-2">Full name</label>
              <input 
                type="text"
                className="w-full px-3 py-2 rounded-md bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" 
                value={fullName} 
                onChange={e => setFullName(e.target.value)} 
                placeholder="Jane Doe" 
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input 
              type="email"
              className="w-full px-3 py-2 rounded-md bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              placeholder="you@example.com" 
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input 
              type="password" 
              className="w-full px-3 py-2 rounded-md bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              placeholder="••••••••" 
              minLength={6}
              required
            />
            {mode === 'signup' && (
              <p className="text-xs text-muted-foreground mt-1">Minimum 6 characters</p>
            )}
          </div>

          <div className="space-y-3 pt-2">
            <button 
              type="submit"
              disabled={loading} 
              className="w-full py-2 px-4 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                  {mode === 'signin' ? 'Signing in...' : 'Creating account...'}
                </span>
              ) : (
                mode === 'signin' ? 'Sign in' : 'Create account'
              )}
            </button>
            
            <button 
              type="button"
              onClick={signInWithGoogle} 
              disabled={loading}
              className="w-full py-2 px-4 rounded-md border border-border hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Continue with Google
            </button>
          </div>
        </form>

        <div className="mt-6 text-sm text-center text-muted-foreground">
          {mode === 'signin' ? (
            <span>
              Don't have an account?{' '}
              <button 
                onClick={() => setMode('signup')} 
                className="text-primary hover:underline font-medium"
              >
                Sign up
              </button>
            </span>
          ) : (
            <span>
              Already have an account?{' '}
              <button 
                onClick={() => setMode('signin')} 
                className="text-primary hover:underline font-medium"
              >
                Sign in
              </button>
            </span>
          )}
        </div>
      </section>
    </main>
  );
};

export default AuthPage;