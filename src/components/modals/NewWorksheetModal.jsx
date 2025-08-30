import React, { useState } from 'react';
import { MessageSquare, FileSpreadsheet, Plus } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

const NewWorksheetModal = ({ isOpen, onClose, onChatBuild, onChooseTemplate, onBlankWorksheet }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Create New Worksheet</CardTitle>
              <CardDescription>Choose how you want to start</CardDescription>
            </div>
            <Button variant="ghost" onClick={onClose}>×</Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Chat Build Option */}
            <Card className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary">
              <CardContent className="p-4" onClick={() => { onChatBuild(); onClose(); }}>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <MessageSquare className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">Chat Build (AI-guided)</h3>
                    <p className="text-sm text-muted-foreground">
                      Tell AI what you want to track and it will create a custom worksheet for you
                    </p>
                    <div className="mt-2">
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Recommended</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Choose Template Option */}
            <Card className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary">
              <CardContent className="p-4" onClick={() => { onChooseTemplate(); onClose(); }}>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <FileSpreadsheet className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">Choose Template</h3>
                    <p className="text-sm text-muted-foreground">
                      Start with pre-built templates like ROI Calculator, Balance Sheet, or Cashflow
                    </p>
                    <div className="mt-2">
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Fast Start</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Blank Worksheet Option */}
            <Card className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary">
              <CardContent className="p-4" onClick={() => { onBlankWorksheet(); onClose(); }}>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Plus className="h-5 w-5 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">Blank Worksheet</h3>
                    <p className="text-sm text-muted-foreground">
                      Start from scratch with an empty Excel-like grid
                    </p>
                    <div className="mt-2">
                      <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">Advanced</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewWorksheetModal;