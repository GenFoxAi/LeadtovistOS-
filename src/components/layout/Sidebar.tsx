import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { 
  Inbox, 
  Calendar, 
  Building2, 
  LayoutDashboard, 
  Settings, 
  Upload,
  LogOut,
  Bot,
  HelpCircle,
  Edit,
  Users,
  PhoneIncoming
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { hasAnyRole, Role } from '@/types';
import { Badge } from '@/components/ui/badge';

export function Sidebar() {
  const { currentUser, projects, activeProjectId, setActiveProjectId } = useStore();
  const navigate = useNavigate();

  if (!currentUser) return null;

  const roles = currentUser.roles;

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['Admin'] as Role[] },
    { name: 'Import Leads', path: '/import', icon: Upload, roles: ['Admin'] as Role[] },
    { name: 'AI Queue', path: '/ai-queue', icon: HelpCircle, roles: ['Admin', 'Agent'] as Role[] },
    { name: 'My Leads', path: '/inbox', icon: Inbox, roles: ['Admin', 'Agent'] as Role[] },
    { name: 'Leads', path: '/leads', icon: Users, roles: ['Admin', 'Agent', 'Coordinator'] as Role[] },
    { name: 'Site Visits', path: '/calendar', icon: Calendar, roles: ['Admin', 'Agent', 'Coordinator'] as Role[] },
    { name: 'Settings', path: '/settings', icon: Settings, roles: ['Admin'] as Role[] },
  ];

  const visibleItems = navItems.filter(item => hasAnyRole(currentUser, item.roles));

  const handleEditProject = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeProjectId && activeProjectId !== 'all') {
      navigate(`/projects/${activeProjectId}/edit`);
    }
  };

  return (
    <div className="flex h-full w-64 flex-col border-r border-gray-200 bg-gray-50/50">
      <div className="flex flex-col border-b border-gray-200 p-4 gap-3">
        <div className="flex items-center gap-2 font-semibold text-blue-600">
          <Building2 className="h-6 w-6" />
          <span>Lead-to-Visit OS</span>
        </div>
        
        <div className="flex items-center gap-2">
          <select 
            value={activeProjectId || ''} 
            onChange={(e) => setActiveProjectId(e.target.value)}
            className="w-full h-9 bg-white rounded-md border border-input px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="" disabled>Select Project</option>
            <option value="all">All Projects</option>
            {projects?.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          {activeProjectId !== 'all' && (
            <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0" onClick={handleEditProject}>
              <Edit className="h-4 w-4 text-gray-500" />
            </Button>
          )}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="grid items-start px-2 text-sm font-medium">
          {visibleItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900",
                  isActive ? "bg-gray-100 text-gray-900" : ""
                )
              }
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="mt-auto border-t border-gray-200 p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold shrink-0">
            {currentUser.name.charAt(0)}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium truncate">{currentUser.name}</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {roles?.map(r => (
                <span key={r} className="text-[10px] bg-gray-200 px-1.5 py-0.5 rounded-full text-gray-700 leading-none">
                  {r}
                </span>
              ))}
            </div>
          </div>
        </div>
        <button 
          onClick={() => navigate('/login')}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-500 transition-all hover:bg-gray-100 hover:text-gray-900"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </div>
  );
}
