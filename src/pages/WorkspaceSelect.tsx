import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, Plus, ArrowRight, MapPin, Users } from 'lucide-react';

export default function WorkspaceSelect() {
  const navigate = useNavigate();
  const { projects, setActiveProjectId, startProjectOnboarding, currentUser } = useStore();

  const handleSelectProject = (projectId: string) => {
    setActiveProjectId(projectId);
    navigate('/dashboard');
  };

  const handleCreateNew = () => {
    startProjectOnboarding();
    navigate('/project-setup');
  };

  // Filter projects assigned to the user (unless Admin)
  const userProjects = projects.filter(p => 
    currentUser?.roles.includes('Admin') || 
    currentUser?.assignedProjectIds.includes(p.id)
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center space-y-2">
          <div className="mx-auto h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Building2 className="h-6 w-6 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Select Workspace</h1>
          <p className="text-gray-500">Choose a project to manage or create a new one.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Create New Card */}
          <Card 
            className="border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-white hover:border-blue-500 transition-all cursor-pointer group flex flex-col items-center justify-center min-h-[200px]"
            onClick={handleCreateNew}
          >
            <div className="h-12 w-12 rounded-full bg-white border border-gray-200 flex items-center justify-center mb-4 group-hover:bg-blue-50 group-hover:border-blue-200 transition-colors">
              <Plus className="h-6 w-6 text-gray-400 group-hover:text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 group-hover:text-blue-700">Create New Project</h3>
            <p className="text-sm text-gray-500 mt-1">Set up a new workspace</p>
          </Card>

          {/* Existing Projects */}
          {userProjects.map(project => (
            <Card 
              key={project.id} 
              className="hover:shadow-md transition-shadow cursor-pointer border-gray-200"
              onClick={() => handleSelectProject(project.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
                    {project.name.charAt(0)}
                  </div>
                  <Button variant="ghost" size="icon" className="text-gray-400 hover:text-blue-600">
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
                <CardTitle className="mt-4 text-xl">{project.name}</CardTitle>
                <CardDescription className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {project.cityArea}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Visit Address:</span>
                    <span className="font-medium truncate max-w-[150px]">{project.visitAddress}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Timings:</span>
                    <span className="font-medium">{project.visitTimings}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-3 border-t bg-gray-50/50 text-xs text-gray-500 flex justify-between">
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" /> Team Access
                </span>
                <span>Active</span>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
