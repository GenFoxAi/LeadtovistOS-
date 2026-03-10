import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { Building2, ArrowRight, Shield, Headset, CalendarCheck, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { hasRole } from '@/types';

export default function Login() {
  const navigate = useNavigate();
  const { users, setCurrentUser } = useStore();

  const handleLogin = (roleLabel: string) => {
    // Find a user that has this role (and preferably only this role for clarity, unless it's Super User)
    let user;
    if (roleLabel === 'Super User') {
       user = users.find(u => hasRole(u, 'Admin') && hasRole(u, 'Agent') && hasRole(u, 'Coordinator'));
    } else {
       user = users.find(u => hasRole(u, roleLabel as any) && u.roles.length === 1);
       
       // Fallback if no single-role user found
       if (!user) {
           user = users.find(u => hasRole(u, roleLabel as any));
       }
    }

    if (user) {
      setCurrentUser(user.id);
      // Always go to workspace select first to choose context
      navigate('/workspace');
    }
  };

  const roles = [
    { label: 'Admin', icon: Shield, description: 'Manage projects & settings' },
    { label: 'Agent', icon: Headset, description: 'Handle leads & calls' },
    { label: 'Coordinator', icon: CalendarCheck, description: 'Manage site visits' },
    { label: 'Super User', icon: UserPlus, description: 'All permissions (SME Mode)' },
  ];

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="rounded-full bg-blue-100 p-3 mb-4">
            <Building2 className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            Lead-to-Visit OS
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your account to continue
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Demo Login</CardTitle>
            <CardDescription>Select a role to experience the platform</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {roles.map((role) => {
              const Icon = role.icon;
              return (
                <Button
                  key={role.label}
                  variant="outline"
                  className="w-full justify-between h-16"
                  onClick={() => handleLogin(role.label)}
                >
                  <div className="flex items-center gap-4">
                    <div className="rounded-full bg-blue-50 p-2 text-blue-600">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="font-semibold text-base">{role.label}</span>
                      <span className="text-xs text-gray-500">{role.description}</span>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                </Button>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
