import React, { useState } from 'react';
import { Search, Bell, User, Command, Crown, Home, Bot } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

const TopBar = ({ onSearchClick, onProfileClick, onFounderMode, onHomeClick, onToggleCoPilot, className }) => {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  
  // Mock notifications - will be replaced with real data
  const mockNotifications = [
    {
      id: 1,
      type: 'alert',
      title: 'Cashflow Alert',
      message: 'Your cashflow turned negative',
      timestamp: '2 hours ago',
      isRead: false
    },
    {
      id: 2,
      type: 'warning',
      title: 'High Burn Rate',
      message: 'Monthly expenses increased by 25%',
      timestamp: '1 day ago',
      isRead: false
    },
    {
      id: 3,
      type: 'info',
      title: 'Revenue Growth',
      message: 'Monthly revenue up 15%',
      timestamp: '2 days ago',
      isRead: true
    }
  ];

  const unreadCount = mockNotifications.filter(n => !n.isRead).length;

  return (
    <header className={cn(
      "h-14 border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-50",
      className
    )}>
      <div className="flex items-center justify-between h-full px-4 max-w-screen-2xl mx-auto">
        
        {/* App Logo/Name - Left */}
        <div className="flex items-center gap-3">
          <button 
            onClick={onHomeClick}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
              <span className="text-primary-foreground font-semibold text-sm">L</span>
            </div>
            <span className="font-semibold text-foreground text-lg">LaneAI</span>
          </button>
        </div>

        {/* Search Bar - Center */}
        <div className="flex-1 max-w-md mx-6">
          <Button
            variant="outline"
            className="w-full justify-start text-muted-foreground hover:bg-muted/50"
            onClick={onSearchClick}
          >
            <Search className="h-4 w-4 mr-2" />
            <span className="flex-1 text-left">Search or jump to...</span>
            <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
              <Command className="h-3 w-3" />K
            </kbd>
          </Button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1">
          {/* AI Co-Pilot Button */}
          <Button 
            variant="outline" 
            size="sm"
            onClick={onToggleCoPilot || (() => console.log('Toggle Co-Pilot'))}
            className="hidden sm:flex items-center gap-2"
          >
            <Bot className="h-4 w-4" />
            <span className="hidden md:inline">AI Co-Pilot</span>
          </Button>

          {/* Founder Mode Button */}
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onFounderMode}
            className="text-amber-600 hover:bg-amber-50 hidden sm:flex items-center gap-2"
          >
            <Crown className="h-4 w-4" />
            <span className="hidden md:inline">Founder Mode</span>
          </Button>

          {/* Notifications */}
          <div className="relative">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Button>
            
            {/* Notifications Dropdown */}
            {notificationsOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-[60]">
                <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                  <h3 className="font-medium text-sm text-gray-900 dark:text-white">Notifications</h3>
                </div>
                <div className="max-h-80 overflow-y-auto bg-white dark:bg-gray-800">
                  {mockNotifications.map((notification) => (
                    <div 
                      key={notification.id}
                      className={cn(
                        "p-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer bg-white dark:bg-gray-800",
                        !notification.isRead && "bg-blue-50 dark:bg-blue-900/20"
                      )}
                    >
                      <div className="flex items-start gap-2">
                        <div className={cn(
                          "w-2 h-2 rounded-full mt-2 flex-shrink-0",
                          notification.type === 'alert' && "bg-red-500",
                          notification.type === 'warning' && "bg-amber-500",
                          notification.type === 'info' && "bg-blue-500"
                        )} />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {notification.title}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {notification.message}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            {notification.timestamp}
                          </div>
                        </div>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                  <button className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-500 w-full text-center">
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Profile Menu */}
          <div className="relative">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setProfileOpen(!profileOpen)}
              className="w-8 h-8 rounded-full p-0 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <span className="text-sm font-medium">JD</span>
            </Button>
            
            {/* Profile Dropdown */}
            {profileOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-[60]">
                <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">John Doe</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">john@example.com</div>
                </div>
                <div className="p-1 bg-white dark:bg-gray-800">
                  <button className="w-full text-left px-2 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-900 dark:text-white">
                    Profile Settings
                  </button>
                  <button className="w-full text-left px-2 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-900 dark:text-white">
                    Billing
                  </button>
                  <button className="w-full text-left px-2 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-900 dark:text-white">
                    Workspace Settings
                  </button>
                  <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                  <button className="w-full text-left px-2 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-red-600 dark:text-red-400">
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Click outside handlers */}
      {(notificationsOpen || profileOpen) && (
        <div 
          className="fixed inset-0 z-[50]" 
          onClick={() => {
            setNotificationsOpen(false);
            setProfileOpen(false);
          }}
        />
      )}
    </header>
  );
};

export default TopBar;