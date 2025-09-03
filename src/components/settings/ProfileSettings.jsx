import { useState } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { User, Building2, TrendingUp, Brain, Target, DollarSign, Users, Zap, Mail } from 'lucide-react';
import { sendTestEmail } from '../../lib/email';
import { useAuth } from '../../hooks/useAuth.jsx';
import { useToast } from '../../hooks/use-toast';

const ProfileSettings = ({ userProfile }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isTestingEmail, setIsTestingEmail] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const [profileData, setProfileData] = useState({
    role: userProfile?.role || 'founder',
    ventureType: userProfile?.ventureType || 'tech_startup',
    stage: userProfile?.stage || 'mvp',
    northStar: userProfile?.northStar || 'Launch MVP and get 100 customers',
    decisionStyle: userProfile?.decisionStyle || 'data_driven',
    moneyStyle: userProfile?.moneyStyle || 'balanced',
    growthStyle: userProfile?.growthStyle || 'viral',
    riskAppetite: userProfile?.riskAppetite || 'calculated'
  });

  const roles = [
    { id: 'founder', label: 'Founder/Entrepreneur', icon: Target },
    { id: 'student', label: 'Student/Academic', icon: User },
    { id: 'freelancer', label: 'Freelancer/Consultant', icon: Users },
    { id: 'employee', label: 'Employee/Intrapreneur', icon: Building2 }
  ];

  const ventureTypes = [
    { id: 'tech_startup', label: 'Tech Startup', icon: Zap },
    { id: 'service_business', label: 'Service Business', icon: Users },
    { id: 'ecommerce', label: 'E-commerce/Retail', icon: DollarSign },
    { id: 'local_business', label: 'Local Business', icon: Building2 },
    { id: 'creative', label: 'Creative/Content', icon: Brain },
    { id: 'other', label: 'Other/Multiple', icon: Target }
  ];

  const stages = [
    { id: 'idea', label: 'Idea Stage', icon: Brain },
    { id: 'mvp', label: 'MVP/Early', icon: Zap },
    { id: 'growth', label: 'Growth Stage', icon: TrendingUp },
    { id: 'established', label: 'Established', icon: Building2 }
  ];

  const dnaOptions = {
    decisionStyle: [
      { id: 'data_driven', label: 'Data-Driven', description: 'Numbers and analytics first' },
      { id: 'intuitive', label: 'Intuitive', description: 'Trust gut feelings and experience' },
      { id: 'collaborative', label: 'Collaborative', description: 'Team input and consensus' },
      { id: 'rapid_fire', label: 'Rapid Fire', description: 'Quick decisions, iterate fast' }
    ],
    moneyStyle: [
      { id: 'conservative', label: 'Conservative', description: 'Careful with spending and risk' },
      { id: 'aggressive', label: 'Aggressive', description: 'Big bets for big returns' },
      { id: 'balanced', label: 'Balanced', description: 'Measured risk and return' },
      { id: 'bootstrapper', label: 'Bootstrapper', description: 'Self-funded and lean' }
    ],
    growthStyle: [
      { id: 'organic', label: 'Organic', description: 'Word of mouth and natural growth' },
      { id: 'viral', label: 'Viral', description: 'Product-led and viral loops' },
      { id: 'paid_growth', label: 'Paid Growth', description: 'Marketing and advertising' },
      { id: 'partnerships', label: 'Partnerships', description: 'Alliances and collaborations' }
    ],
    riskAppetite: [
      { id: 'risk_averse', label: 'Risk Averse', description: 'Prefer safe, proven approaches' },
      { id: 'calculated', label: 'Calculated Risk', description: 'Measured risks with good upside' },
      { id: 'risk_taker', label: 'Risk Taker', description: 'Comfortable with uncertainty' },
      { id: 'all_in', label: 'All-In', description: 'Go big or go home mentality' }
    ]
  };

  const getOptionLabel = (options, value) => {
    const option = options.find(opt => opt.id === value);
    return option ? option.label : value;
  };

  const handleSave = () => {
    // Save profile data
    console.log('Saving profile:', profileData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    // Reset to original data
    setIsEditing(false);
  };

  const handleTestEmail = async () => {
    if (!user?.email) {
      toast({
        title: "Error",
        description: "No email address found for current user",
        variant: "destructive"
      });
      return;
    }

    setIsTestingEmail(true);
    try {
      await sendTestEmail(user.email);
      toast({
        title: "Email sent!",
        description: `Test email sent successfully to ${user.email}`,
      });
    } catch (error) {
      console.error('Test email failed:', error);
      toast({
        title: "Email failed",
        description: error.message || "Failed to send test email",
        variant: "destructive"
      });
    } finally {
      setIsTestingEmail(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Profile Information</h3>
          <p className="text-sm text-muted-foreground">
            Your onboarding responses help us personalize your experience
          </p>
        </div>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel}>Cancel</Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Info */}
        <Card className="p-4 space-y-4">
          <h4 className="font-medium">Basic Information</h4>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Role</label>
            {isEditing ? (
              <select
                value={profileData.role}
                onChange={(e) => setProfileData(prev => ({ ...prev, role: e.target.value }))}
                className="w-full p-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {roles.map(role => (
                  <option key={role.id} value={role.id}>{role.label}</option>
                ))}
              </select>
            ) : (
              <p className="text-sm text-muted-foreground">
                {getOptionLabel(roles, profileData.role)}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Venture Type</label>
            {isEditing ? (
              <select
                value={profileData.ventureType}
                onChange={(e) => setProfileData(prev => ({ ...prev, ventureType: e.target.value }))}
                className="w-full p-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {ventureTypes.map(type => (
                  <option key={type.id} value={type.id}>{type.label}</option>
                ))}
              </select>
            ) : (
              <p className="text-sm text-muted-foreground">
                {getOptionLabel(ventureTypes, profileData.ventureType)}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Stage</label>
            {isEditing ? (
              <select
                value={profileData.stage}
                onChange={(e) => setProfileData(prev => ({ ...prev, stage: e.target.value }))}
                className="w-full p-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {stages.map(stage => (
                  <option key={stage.id} value={stage.id}>{stage.label}</option>
                ))}
              </select>
            ) : (
              <p className="text-sm text-muted-foreground">
                {getOptionLabel(stages, profileData.stage)}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">North Star Goal</label>
            {isEditing ? (
              <textarea
                value={profileData.northStar}
                onChange={(e) => setProfileData(prev => ({ ...prev, northStar: e.target.value }))}
                className="w-full p-2 border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                rows="3"
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                {profileData.northStar}
              </p>
            )}
          </div>
        </Card>

        {/* Founder DNA */}
        <Card className="p-4 space-y-4">
          <h4 className="font-medium">Founder DNA</h4>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Decision Style</label>
            {isEditing ? (
              <select
                value={profileData.decisionStyle}
                onChange={(e) => setProfileData(prev => ({ ...prev, decisionStyle: e.target.value }))}
                className="w-full p-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {dnaOptions.decisionStyle.map(option => (
                  <option key={option.id} value={option.id}>{option.label}</option>
                ))}
              </select>
            ) : (
              <p className="text-sm text-muted-foreground">
                {getOptionLabel(dnaOptions.decisionStyle, profileData.decisionStyle)}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Money Approach</label>
            {isEditing ? (
              <select
                value={profileData.moneyStyle}
                onChange={(e) => setProfileData(prev => ({ ...prev, moneyStyle: e.target.value }))}
                className="w-full p-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {dnaOptions.moneyStyle.map(option => (
                  <option key={option.id} value={option.id}>{option.label}</option>
                ))}
              </select>
            ) : (
              <p className="text-sm text-muted-foreground">
                {getOptionLabel(dnaOptions.moneyStyle, profileData.moneyStyle)}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Growth Style</label>
            {isEditing ? (
              <select
                value={profileData.growthStyle}
                onChange={(e) => setProfileData(prev => ({ ...prev, growthStyle: e.target.value }))}
                className="w-full p-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {dnaOptions.growthStyle.map(option => (
                  <option key={option.id} value={option.id}>{option.label}</option>
                ))}
              </select>
            ) : (
              <p className="text-sm text-muted-foreground">
                {getOptionLabel(dnaOptions.growthStyle, profileData.growthStyle)}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Risk Appetite</label>
            {isEditing ? (
              <select
                value={profileData.riskAppetite}
                onChange={(e) => setProfileData(prev => ({ ...prev, riskAppetite: e.target.value }))}
                className="w-full p-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {dnaOptions.riskAppetite.map(option => (
                  <option key={option.id} value={option.id}>{option.label}</option>
                ))}
              </select>
            ) : (
              <p className="text-sm text-muted-foreground">
                {getOptionLabel(dnaOptions.riskAppetite, profileData.riskAppetite)}
              </p>
            )}
          </div>
        </Card>
      </div>

      {/* Email Testing */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">Test Email Integration</h4>
            <p className="text-sm text-muted-foreground">
              Send a test email to verify SendGrid integration is working
            </p>
            {user?.email && (
              <p className="text-xs text-muted-foreground mt-1">
                Test email will be sent to: {user.email}
              </p>
            )}
          </div>
          <Button 
            variant="outline" 
            onClick={handleTestEmail}
            disabled={isTestingEmail || !user?.email}
            className="flex items-center gap-2"
          >
            <Mail className="h-4 w-4" />
            {isTestingEmail ? 'Sending...' : 'Send Test Email'}
          </Button>
        </div>
      </Card>

      {/* Contact Support */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">Need Help?</h4>
            <p className="text-sm text-muted-foreground">
              Contact our support team for assistance with your account
            </p>
          </div>
          <Button variant="outline" onClick={() => window.open('mailto:support@laneai.com')}>
            Contact Support
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default ProfileSettings;