import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card } from '../components/ui/card';
import { User, CreditCard, Bell, Monitor, HelpCircle } from 'lucide-react';
import ProfileSettings from '../components/settings/ProfileSettings';
import DisplaySettings from '../components/settings/DisplaySettings';
import BillingTab from '../components/billing/BillingTab';

const SettingsPage = ({ userProfile }) => {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
              <p className="text-sm text-muted-foreground mt-1">Manage your account and preferences</p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 max-w-2xl">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="display" className="flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              Display
            </TabsTrigger>
            <TabsTrigger value="billing" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Billing
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="support" className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4" />
              Support
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <ProfileSettings userProfile={userProfile} />
          </TabsContent>

          <TabsContent value="display">
            <DisplaySettings />
          </TabsContent>

          <TabsContent value="billing">
            <BillingTab />
          </TabsContent>

          <TabsContent value="notifications">
            <NotificationSettings />
          </TabsContent>

          <TabsContent value="support">
            <SupportSettings />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

// Notification Settings Component
const NotificationSettings = () => {
  const [notifications, setNotifications] = useState({
    email: true,
    browser: false,
    alerts: true,
    reports: true,
    marketing: false
  });

  const handleToggle = (key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Notification Preferences</h3>
        <p className="text-sm text-muted-foreground">
          Choose how you want to be notified about important updates
        </p>
      </div>

      <Card className="p-6 space-y-4">
        {Object.entries(notifications).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between">
            <div>
              <div className="font-medium capitalize">{key.replace('_', ' ')} Notifications</div>
              <div className="text-sm text-muted-foreground">
                {getNotificationDescription(key)}
              </div>
            </div>
            <button
              onClick={() => handleToggle(key)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                value ? 'bg-primary' : 'bg-muted'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  value ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        ))}
      </Card>
    </div>
  );
};

// Support Settings Component
const SupportSettings = () => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Help & Support</h3>
        <p className="text-sm text-muted-foreground">
          Get help with your LaneAI account and features
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 space-y-4">
          <h4 className="font-medium">Contact Support</h4>
          <p className="text-sm text-muted-foreground">
            Get in touch with our support team for help with your account
          </p>
          <button
            onClick={() => window.open('mailto:support@laneai.com')}
            className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-lg hover:bg-primary/90 transition-colors"
          >
            Email Support
          </button>
        </Card>

        <Card className="p-6 space-y-4">
          <h4 className="font-medium">Documentation</h4>
          <p className="text-sm text-muted-foreground">
            Learn how to make the most of LaneAI features
          </p>
          <button className="w-full border border-border py-2 px-4 rounded-lg hover:bg-muted/50 transition-colors">
            View Docs
          </button>
        </Card>

        <Card className="p-6 space-y-4">
          <h4 className="font-medium">Feature Request</h4>
          <p className="text-sm text-muted-foreground">
            Suggest new features or improvements
          </p>
          <button className="w-full border border-border py-2 px-4 rounded-lg hover:bg-muted/50 transition-colors">
            Submit Request
          </button>
        </Card>

        <Card className="p-6 space-y-4">
          <h4 className="font-medium">Community</h4>
          <p className="text-sm text-muted-foreground">
            Join our community of founders and entrepreneurs
          </p>
          <button className="w-full border border-border py-2 px-4 rounded-lg hover:bg-muted/50 transition-colors">
            Join Discord
          </button>
        </Card>
      </div>

      <Card className="p-6">
        <h4 className="font-medium mb-4">System Information</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Version:</span>
            <span>1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Last Updated:</span>
            <span>January 15, 2025</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Build:</span>
            <span>Phase-1</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

const getNotificationDescription = (key) => {
  const descriptions = {
    email: 'Receive updates via email',
    browser: 'Show browser notifications',
    alerts: 'Important alerts and warnings',
    reports: 'Weekly and monthly reports',
    marketing: 'Product updates and tips'
  };
  return descriptions[key] || '';
};

export default SettingsPage;