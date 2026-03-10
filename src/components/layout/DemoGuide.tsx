import React, { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Settings2, Play, Users, Calendar, BarChart3, RefreshCw, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function DemoGuide() {
  const [isOpen, setIsOpen] = useState(false);
  const { startQueue, resetDemoData, leads } = useStore();
  const navigate = useNavigate();

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="fixed bottom-4 right-4 shadow-lg bg-white border-blue-200 text-blue-700 hover:bg-blue-50 z-50"
        onClick={() => setIsOpen(true)}
      >
        <Settings2 className="mr-2 h-4 w-4" />
        Demo Guide
      </Button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-white border border-gray-200 shadow-2xl rounded-xl z-50 overflow-hidden">
      <div className="bg-blue-600 text-white px-4 py-3 flex justify-between items-center">
        <h3 className="font-semibold text-sm">Investor Demo Mode</h3>
        <button onClick={() => setIsOpen(false)} className="text-blue-100 hover:text-white">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="p-4 space-y-3">
        <Button 
          variant="outline" 
          className="w-full justify-start text-sm"
          onClick={() => {
            resetDemoData();
            navigate('/inbox');
          }}
        >
          <RefreshCw className="mr-2 h-4 w-4 text-gray-500" />
          1. Reset & Load Sample Leads
        </Button>
        
        <Button 
          variant="outline" 
          className="w-full justify-start text-sm"
          onClick={() => {
            navigate('/inbox');
            startQueue();
          }}
        >
          <Play className="mr-2 h-4 w-4 text-green-500" />
          2. Start AI Calling Queue
        </Button>
        
        <Button 
          variant="outline" 
          className="w-full justify-start text-sm"
          onClick={() => {
            navigate('/inbox');
            // We'll handle opening drawer in Inbox component via URL or state, 
            // but for now just navigate
          }}
        >
          <Users className="mr-2 h-4 w-4 text-blue-500" />
          3. Open a Hot Lead Drawer
        </Button>
        
        <Button 
          variant="outline" 
          className="w-full justify-start text-sm"
          onClick={() => {
            navigate('/calendar');
          }}
        >
          <Calendar className="mr-2 h-4 w-4 text-purple-500" />
          4. Book/Manage Visits
        </Button>
        
        <Button 
          variant="outline" 
          className="w-full justify-start text-sm"
          onClick={() => {
            navigate('/dashboard');
          }}
        >
          <BarChart3 className="mr-2 h-4 w-4 text-orange-500" />
          5. View Dashboard Impact
        </Button>
      </div>
    </div>
  );
}
