import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { Layout } from '@/components/layout/Layout';
import Login from '@/pages/Login';
import Onboarding from '@/pages/Onboarding';
import Inbox from '@/pages/Inbox';
import AIQueue from '@/pages/AIQueue';
import ImportLeads from '@/pages/ImportLeads';
import Calendar from '@/pages/Calendar';
import Leads from '@/pages/Leads';
import LeadDetail from '@/pages/LeadDetail';
import Projects from '@/pages/Projects';
import Dashboard from '@/pages/Dashboard';
import Settings from '@/pages/Settings';
import WorkspaceSelect from '@/pages/WorkspaceSelect';
import ProjectOnboarding from '@/pages/ProjectOnboarding';
import { hasAnyRole, Role } from '@/types';

function ProtectedRoute({ children, allowedRoles, requireProject = true }: { children: React.ReactNode, allowedRoles: Role[], requireProject?: boolean }) {
  const currentUser = useStore(state => state.currentUser);
  const activeProjectId = useStore(state => state.activeProjectId);
  
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  if (!hasAnyRole(currentUser, allowedRoles)) {
    return <Navigate to="/login" replace />;
  }

  if (requireProject && !activeProjectId) {
    return <Navigate to="/workspace" replace />;
  }
  
  return <>{children}</>;
}

export default function App() {
  const { processNextQueueItem, queueState } = useStore();

  // Queue processing loop
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (queueState.isRunning && !queueState.currentLeadId) {
      interval = setInterval(() => {
        processNextQueueItem();
      }, 5000); // Check every 5s if we need to start a new call
    }
    return () => clearInterval(interval);
  }, [queueState.isRunning, queueState.currentLeadId, processNextQueueItem]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/onboarding" element={<Onboarding />} />
        
        <Route path="/workspace" element={
          <ProtectedRoute allowedRoles={['Admin', 'Agent', 'Coordinator']} requireProject={false}>
            <WorkspaceSelect />
          </ProtectedRoute>
        } />
        
        <Route path="/project-setup" element={
          <ProtectedRoute allowedRoles={['Admin']} requireProject={false}>
            <ProjectOnboarding />
          </ProtectedRoute>
        } />

        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/login" replace />} />

          <Route path="dashboard" element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route path="inbox" element={
            <ProtectedRoute allowedRoles={['Admin', 'Agent']}>
              <Inbox />
            </ProtectedRoute>
          } />

          <Route path="ai-queue" element={
            <ProtectedRoute allowedRoles={['Admin', 'Agent']}>
              <AIQueue />
            </ProtectedRoute>
          } />

          <Route path="import" element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <ImportLeads />
            </ProtectedRoute>
          } />
          
          <Route path="calendar" element={
            <ProtectedRoute allowedRoles={['Admin', 'Agent', 'Coordinator']}>
              <Calendar />
            </ProtectedRoute>
          } />

          <Route path="leads" element={
            <ProtectedRoute allowedRoles={['Admin', 'Agent', 'Coordinator']}>
              <Leads />
            </ProtectedRoute>
          } />

          <Route path="leads/:leadId" element={
            <ProtectedRoute allowedRoles={['Admin', 'Agent', 'Coordinator']}>
              <LeadDetail />
            </ProtectedRoute>
          } />
          
          <Route path="projects/:projectId/edit" element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <Projects />
            </ProtectedRoute>
          } />
          
          <Route path="settings" element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <Settings />
            </ProtectedRoute>
          } />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
