import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, ExternalLink } from 'lucide-react';

const GoogleAuthSetup = () => {
  return (
    <Card className="border-amber-200 bg-amber-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-amber-800">
          <AlertTriangle className="h-5 w-5" />
          Google OAuth Setup Required
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-amber-700 space-y-3">
        <p>
          To enable Google sign-in, you need to configure OAuth in your Supabase dashboard.
        </p>
        <div className="space-y-2">
          <div className="font-medium">Steps:</div>
          <ol className="list-decimal list-inside space-y-1 text-xs">
            <li>Go to Supabase Dashboard → Authentication → Providers</li>
            <li>Enable Google Provider</li>
            <li>Add your Google OAuth credentials</li>
            <li>Set the correct redirect URLs</li>
          </ol>
        </div>
        <div className="flex items-center gap-2 pt-2">
          <a 
            href="https://supabase.com/dashboard" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-amber-600 hover:text-amber-800 font-medium"
          >
            Open Supabase Dashboard
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </CardContent>
    </Card>
  );
};

export default GoogleAuthSetup;