import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const AuthPage = () => {
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const signIn = async () => {
    setError(null); setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) setError(error.message);
  };
  const signUp = async () => {
    setError(null); setLoading(true);
    const redirectUrl = `${window.location.origin}/`;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName }, emailRedirectTo: redirectUrl }
    });
    setLoading(false);
    if (error) setError(error.message);
  };

  const signInWithGoogle = async () => {
    setError(null);
    const redirectUrl = `${window.location.origin}/`;
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: redirectUrl } });
    if (error) setError(error.message);
  };

  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
      <section className="w-full max-w-md bg-card border border-border rounded-xl p-6 shadow-sm">
        <h1 className="text-2xl font-bold mb-2">{mode === 'signin' ? 'Sign in' : 'Create account'}</h1>
        <p className="text-sm text-muted-foreground mb-6">Lane AI — secure login</p>

        {mode === 'signup' && (
          <div className="mb-4">
            <label className="block text-sm mb-1">Full name</label>
            <input className="w-full px-3 py-2 rounded-md bg-background border border-border" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Jane Doe" />
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm mb-1">Email</label>
          <input className="w-full px-3 py-2 rounded-md bg-background border border-border" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
        </div>

        <div className="mb-6">
          <label className="block text-sm mb-1">Password</label>
          <input type="password" className="w-full px-3 py-2 rounded-md bg-background border border-border" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
        </div>

        {error && <div className="mb-4 text-sm text-red-600">{error}</div>}

        <div className="space-y-3">
          {mode === 'signin' ? (
            <button onClick={signIn} disabled={loading} className="w-full py-2 rounded-md bg-primary text-primary-foreground">{loading ? 'Signing in...' : 'Sign in'}</button>
          ) : (
            <button onClick={signUp} disabled={loading} className="w-full py-2 rounded-md bg-primary text-primary-foreground">{loading ? 'Creating...' : 'Create account'}</button>
          )}
          <button onClick={signInWithGoogle} className="w-full py-2 rounded-md border border-border">Continue with Google</button>
        </div>

        <div className="mt-6 text-sm text-center text-muted-foreground">
          {mode === 'signin' ? (
            <span>Don't have an account? <button onClick={() => setMode('signup')} className="text-primary">Sign up</button></span>
          ) : (
            <span>Already have an account? <button onClick={() => setMode('signin')} className="text-primary">Sign in</button></span>
          )}
        </div>
      </section>
    </main>
  );
};

export default AuthPage;