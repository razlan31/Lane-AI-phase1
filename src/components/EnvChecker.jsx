import React, { useEffect, useState } from 'react';
import { AlertCircle, Key, ExternalLink } from 'lucide-react';
import { displayMissingEnvWarnings, checkRequiredEnvVars } from '@/lib/envConfig';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const EnvChecker = ({ children }) => {
  const [missingVars, setMissingVars] = useState([]);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    // Check for missing environment variables on mount
    const missing = displayMissingEnvWarnings();
    setMissingVars(missing);
    setShowWarning(missing.length > 0);
  }, []);

  if (!showWarning) {
    return children;
  }

  return (
    <div className="min-h-screen bg-background p-4 flex items-center justify-center">
      <Card className="w-full max-w-2xl p-6 border-orange-200 bg-orange-50/50">
        <div className="flex items-start gap-4">
          <AlertCircle className="h-6 w-6 text-orange-600 mt-1 flex-shrink-0" />
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-orange-900 mb-2">
              Environment Configuration Required
            </h2>
            <p className="text-orange-800 mb-4">
              Some environment variables are missing. This may affect certain features of the application.
            </p>
            
            <div className="space-y-3 mb-6">
              {missingVars.map(({ key, name, description }) => (
                <div key={key} className="flex items-start gap-3 p-3 bg-white rounded border border-orange-200">
                  <Key className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-orange-900">{name}</div>
                    <div className="text-sm text-orange-700">{description}</div>
                    <code className="text-xs bg-orange-100 px-2 py-1 rounded mt-1 inline-block text-orange-800">
                      {key}
                    </code>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white p-4 rounded border border-orange-200 mb-4">
              <h3 className="font-medium text-orange-900 mb-2 flex items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                How to Fix This
              </h3>
              <ol className="text-sm text-orange-800 space-y-1 list-decimal list-inside">
                <li>Create a <code className="bg-orange-100 px-1 rounded">.env.local</code> file in your project root</li>
                <li>Copy the template from <code className="bg-orange-100 px-1 rounded">.env.local.example</code></li>
                <li>Fill in your actual API keys</li>
                <li>Restart your development server</li>
              </ol>
              <div className="mt-3 p-2 bg-orange-100 rounded text-xs text-orange-700">
                <strong>For Lovable users:</strong> Server-side secrets (like OPENAI_API_KEY, STRIPE_SECRET_KEY) 
                should be added via Supabase Secrets, not .env.local
              </div>
            </div>

            <div className="flex gap-3">
              <Button 
                onClick={() => setShowWarning(false)} 
                variant="outline"
                className="border-orange-300 text-orange-700 hover:bg-orange-100"
              >
                Continue Anyway
              </Button>
              <Button 
                onClick={() => window.location.reload()} 
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                Refresh After Setup
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default EnvChecker;