import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select } from '@/components/ui/select';
import { ArrowLeft, ArrowRight, CheckCircle2, Building2, Users, PhoneCall, MessageSquare, ShieldCheck, Database, Upload, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { OnboardingDraft, Role } from '@/types';

const steps = [
  { id: 1, title: 'Welcome', icon: Building2 },
  { id: 2, title: 'Basics', icon: Building2 },
  { id: 3, title: 'Sales Facts', icon: Database },
  { id: 4, title: 'Lead Sources', icon: Users },
  { id: 5, title: 'Team', icon: Users },
  { id: 6, title: 'Routing', icon: ArrowRight },
  { id: 7, title: 'Calling & SLA', icon: PhoneCall },
  { id: 8, title: 'Messaging', icon: MessageSquare },
  { id: 9, title: 'Compliance', icon: ShieldCheck },
  { id: 10, title: 'Inbound', icon: PhoneCall },
  { id: 11, title: 'Review', icon: CheckCircle2 },
];

export default function ProjectOnboarding() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editProjectId = searchParams.get('projectId');
  
  const { onboardingDraft, updateOnboardingDraft, launchProjectFromDraft, resetOnboardingDraft, projects, startProjectOnboarding } = useStore();
  const [currentStep, setCurrentStep] = useState(onboardingDraft?.step || 1);

  // Initialize for Edit Mode if projectId is present
  useEffect(() => {
    if (editProjectId) {
      const projectToEdit = projects.find(p => p.id === editProjectId);
      if (projectToEdit) {
        // If no draft, or draft is for a different project, start onboarding with this project
        if (!onboardingDraft || onboardingDraft.project.id !== editProjectId) {
          startProjectOnboarding(projectToEdit);
          setCurrentStep(2); // Skip Welcome
        }
      }
    }
  }, [editProjectId, projects, onboardingDraft, startProjectOnboarding]);

  // Sync step to store
  useEffect(() => {
    if (onboardingDraft) {
      updateOnboardingDraft({ step: currentStep });
    }
  }, [currentStep]);

  if (!onboardingDraft) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Loading project setup...</h2>
          <Button className="mt-4" onClick={() => navigate('/workspace')}>Return to Workspace</Button>
        </div>
      </div>
    );
  }

  const isEditMode = !!editProjectId;

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      launchProjectFromDraft();
      navigate('/dashboard');
    }
  };

  const handleBack = () => {
    if (currentStep > 1 && !(isEditMode && currentStep === 2)) {
      setCurrentStep(currentStep - 1);
    } else {
      resetOnboardingDraft();
      navigate(isEditMode ? `/projects/${editProjectId}` : '/workspace');
    }
  };

  const updateProject = (updates: Partial<typeof onboardingDraft.project>) => {
    updateOnboardingDraft({ project: { ...onboardingDraft.project, ...updates } });
  };

  const updateConfig = (updates: Partial<typeof onboardingDraft.config>) => {
    updateOnboardingDraft({ config: { ...onboardingDraft.config, ...updates } });
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1: // Welcome
        return (
          <div className="text-center space-y-6 py-8">
            <div className="mx-auto h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Building2 className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Welcome to Project Setup</h2>
            <p className="text-gray-600 max-w-md mx-auto">
              Set up your project, team, routing, calling rules, and guardrails so your AI lead-to-site-visit system is ready to run.
            </p>
            <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto text-left text-sm text-gray-600 bg-gray-50 p-6 rounded-xl border border-gray-200">
              <ul className="space-y-2">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Project Basics</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Sales Facts</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Team Setup</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Routing Rules</li>
              </ul>
              <ul className="space-y-2">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Calling & SLA</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Messaging</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Compliance</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Inbound Calls</li>
              </ul>
            </div>
          </div>
        );

      case 2: // Basics
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Project Name</Label>
                <Input value={onboardingDraft.project.name} onChange={(e) => updateProject({ name: e.target.value })} placeholder="e.g. Green Valley" />
              </div>
              <div className="space-y-2">
                <Label>City / Area</Label>
                <Input value={onboardingDraft.project.cityArea} onChange={(e) => updateProject({ cityArea: e.target.value })} placeholder="e.g. Whitefield, Bangalore" />
              </div>
              <div className="space-y-2">
                <Label>Visit Address</Label>
                <Input value={onboardingDraft.project.visitAddress} onChange={(e) => updateProject({ visitAddress: e.target.value })} placeholder="Full address for site visits" />
              </div>
              <div className="space-y-2">
                <Label>Sales Office Timings</Label>
                <Input value={onboardingDraft.project.visitTimings} onChange={(e) => updateProject({ visitTimings: e.target.value })} placeholder="e.g. 10:00 AM - 07:00 PM" />
              </div>
              <div className="space-y-2">
                <Label>RERA Number (Optional)</Label>
                <Input value={onboardingDraft.project.reraNumber || ''} onChange={(e) => updateProject({ reraNumber: e.target.value })} placeholder="e.g. PRM/KA/RERA/..." />
              </div>
            </div>
          </div>
        );

      case 3: // Sales Facts
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Price Bands</Label>
                <Input value={onboardingDraft.project.factsSheet?.priceBands} onChange={(e) => updateProject({ factsSheet: { ...onboardingDraft.project.factsSheet!, priceBands: e.target.value } })} placeholder="e.g. ₹85L - ₹1.5Cr" />
              </div>
              <div className="space-y-2">
                <Label>BHK Options</Label>
                <Input value={onboardingDraft.project.factsSheet?.bhkOptions} onChange={(e) => updateProject({ factsSheet: { ...onboardingDraft.project.factsSheet!, bhkOptions: e.target.value } })} placeholder="e.g. 2, 2.5, 3 BHK" />
              </div>
              <div className="space-y-2">
                <Label>Possession Timeline</Label>
                <Input value={onboardingDraft.project.factsSheet?.possession} onChange={(e) => updateProject({ factsSheet: { ...onboardingDraft.project.factsSheet!, possession: e.target.value } })} placeholder="e.g. Dec 2025" />
              </div>
              <div className="space-y-2">
                <Label>USPs (Comma separated)</Label>
                <Input value={onboardingDraft.project.usp?.join(', ') || ''} onChange={(e) => updateProject({ usp: e.target.value.split(',').map(s => s.trim()) })} placeholder="e.g. Lake View, Metro Access" />
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">AI Guardrails</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between border p-3 rounded-lg">
                  <Label className="cursor-pointer" htmlFor="gb1">Approved Price Bands Only</Label>
                  <input type="checkbox" id="gb1" checked={onboardingDraft.project.aiAgentConfig?.guardrails.priceBandsOnly} onChange={(e) => updateProject({ aiAgentConfig: { ...onboardingDraft.project.aiAgentConfig!, guardrails: { ...onboardingDraft.project.aiAgentConfig!.guardrails, priceBandsOnly: e.target.checked } } })} />
                </div>
                <div className="flex items-center justify-between border p-3 rounded-lg">
                  <Label className="cursor-pointer" htmlFor="gb2">No Availability Commitments</Label>
                  <input type="checkbox" id="gb2" checked={onboardingDraft.project.aiAgentConfig?.guardrails.noAvailabilityCommitments} onChange={(e) => updateProject({ aiAgentConfig: { ...onboardingDraft.project.aiAgentConfig!, guardrails: { ...onboardingDraft.project.aiAgentConfig!.guardrails, noAvailabilityCommitments: e.target.checked } } })} />
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800 flex gap-2">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <p>AI will strictly follow these facts. You can upload brochures and inventory sheets later in the Project settings.</p>
            </div>
          </div>
        );

      case 4: // Lead Sources
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <Label>Enable Lead Sources</Label>
              <div className="grid grid-cols-2 gap-3">
                {['Website', 'Ads', 'Property Portals', 'Referrals', 'Missed Calls', 'Walk-ins'].map(source => (
                  <div key={source} className="flex items-center space-x-2 border p-3 rounded-lg">
                    <Checkbox 
                      id={source} 
                      checked={onboardingDraft.config.leadSources.includes(source)}
                      onCheckedChange={(checked) => {
                        const current = onboardingDraft.config.leadSources;
                        const newSources = checked 
                          ? [...current, source]
                          : current.filter(s => s !== source);
                        updateConfig({ leadSources: newSources });
                      }}
                    />
                    <Label htmlFor={source} className="cursor-pointer">{source}</Label>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-sm text-gray-500">You can import CSV leads manually from the dashboard after setup.</p>
          </div>
        );

      case 5: // Team
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Team Members</h3>
              <Button size="sm" variant="outline" onClick={() => {
                updateOnboardingDraft({ 
                  teamMembers: [...onboardingDraft.teamMembers, { name: '', email: '', phone: '', roles: ['Agent'] }] 
                });
              }}>
                <Plus className="h-4 w-4 mr-1" /> Add Member
              </Button>
            </div>
            
            <div className="space-y-4">
              {onboardingDraft.teamMembers.map((member, idx) => (
                <div key={idx} className="border p-4 rounded-lg space-y-3 relative bg-gray-50">
                  <div className="grid grid-cols-2 gap-4">
                    <Input 
                      placeholder="Name" 
                      value={member.name} 
                      onChange={(e) => {
                        const newMembers = [...onboardingDraft.teamMembers];
                        newMembers[idx].name = e.target.value;
                        updateOnboardingDraft({ teamMembers: newMembers });
                      }} 
                    />
                    <Input 
                      placeholder="Email" 
                      value={member.email} 
                      onChange={(e) => {
                        const newMembers = [...onboardingDraft.teamMembers];
                        newMembers[idx].email = e.target.value;
                        updateOnboardingDraft({ teamMembers: newMembers });
                      }} 
                    />
                  </div>
                  <div className="flex gap-4 items-center">
                    <div className="flex-1">
                      <Label className="text-xs mb-1 block">Roles</Label>
                      <div className="flex gap-3">
                        {['Admin', 'Agent', 'Coordinator'].map(role => (
                          <label key={role} className="flex items-center gap-1 text-sm">
                            <input 
                              type="checkbox" 
                              checked={member.roles.includes(role as Role)}
                              onChange={(e) => {
                                const newMembers = [...onboardingDraft.teamMembers];
                                if (e.target.checked) {
                                  newMembers[idx].roles.push(role as Role);
                                } else {
                                  newMembers[idx].roles = newMembers[idx].roles.filter(r => r !== role);
                                }
                                updateOnboardingDraft({ teamMembers: newMembers });
                              }}
                            />
                            {role}
                          </label>
                        ))}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-red-500" onClick={() => {
                       const newMembers = onboardingDraft.teamMembers.filter((_, i) => i !== idx);
                       updateOnboardingDraft({ teamMembers: newMembers });
                    }}>Remove</Button>
                  </div>
                </div>
              ))}
              {onboardingDraft.teamMembers.length === 0 && (
                <p className="text-sm text-gray-500 italic text-center py-4">No team members added yet. You will be the default Admin.</p>
              )}
            </div>
          </div>
        );

      case 6: // Routing
        return (
          <div className="space-y-6">
            <div className="border p-6 rounded-xl bg-blue-50 border-blue-100 text-center">
              <div className="mx-auto h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                <ArrowRight className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-lg text-blue-900">Round Robin Routing</h3>
              <p className="text-sm text-blue-700 mt-2 max-w-sm mx-auto">
                Leads and handoffs are assigned one by one across eligible agents in sequence.
              </p>
              <div className="mt-6 flex items-center justify-center gap-2 text-sm font-medium text-gray-600 bg-white p-3 rounded-lg inline-flex border border-gray-200">
                <span>Agent 1</span>
                <ArrowRight className="h-4 w-4 text-gray-400" />
                <span>Agent 2</span>
                <ArrowRight className="h-4 w-4 text-gray-400" />
                <span>Agent 3</span>
                <ArrowRight className="h-4 w-4 text-gray-400" />
                <span>Agent 1</span>
              </div>
            </div>
            <p className="text-sm text-gray-500 text-center">
              If no eligible agent is available, leads will remain in the unassigned queue. You can change this later in Settings.
            </p>
          </div>
        );

      case 7: // Calling & SLA
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Calling Start Time</Label>
                <Input type="time" value={onboardingDraft.config.callingConfig.window.startTime} onChange={(e) => updateConfig({ callingConfig: { ...onboardingDraft.config.callingConfig, window: { ...onboardingDraft.config.callingConfig.window, startTime: e.target.value } } })} />
              </div>
              <div className="space-y-2">
                <Label>Calling End Time</Label>
                <Input type="time" value={onboardingDraft.config.callingConfig.window.endTime} onChange={(e) => updateConfig({ callingConfig: { ...onboardingDraft.config.callingConfig, window: { ...onboardingDraft.config.callingConfig.window, endTime: e.target.value } } })} />
              </div>
              <div className="space-y-2">
                <Label>SLA Target (Minutes)</Label>
                <Input type="number" value={onboardingDraft.config.callingConfig.slaTargetMins} onChange={(e) => updateConfig({ callingConfig: { ...onboardingDraft.config.callingConfig, slaTargetMins: parseInt(e.target.value) } })} />
              </div>
              <div className="space-y-2">
                <Label>Max AI Attempts</Label>
                <Input type="number" value={onboardingDraft.config.callingConfig.maxAiAttempts} onChange={(e) => updateConfig({ callingConfig: { ...onboardingDraft.config.callingConfig, maxAiAttempts: parseInt(e.target.value) } })} />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Active Days</Label>
              <div className="flex flex-wrap gap-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, idx) => (
                  <div key={day} className="flex items-center space-x-2 border rounded-md px-3 py-2 bg-white">
                    <input
                      type="checkbox"
                      checked={onboardingDraft.config.callingConfig.window.daysOfWeek.includes(idx)}
                      onChange={(e) => {
                        const currentDays = onboardingDraft.config.callingConfig.window.daysOfWeek;
                        const newDays = e.target.checked
                          ? [...currentDays, idx]
                          : currentDays.filter(d => d !== idx);
                        updateConfig({ callingConfig: { ...onboardingDraft.config.callingConfig, window: { ...onboardingDraft.config.callingConfig.window, daysOfWeek: newDays } } });
                      }}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">{day}</span>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-xs text-gray-500">These settings can be adjusted later in Project Settings.</p>
          </div>
        );

      case 8: // Messaging
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Enable WhatsApp Messaging</Label>
                <input type="checkbox" checked={onboardingDraft.config.whatsAppConfig.enabled} onChange={(e) => updateConfig({ whatsAppConfig: { ...onboardingDraft.config.whatsAppConfig, enabled: e.target.checked } })} className="toggle" />
              </div>
              
              {onboardingDraft.config.whatsAppConfig.enabled && (
                <>
                  <div className="space-y-2">
                    <Label>WhatsApp Business Number</Label>
                    <Input value={onboardingDraft.config.whatsAppConfig.businessNumber || ''} onChange={(e) => updateConfig({ whatsAppConfig: { ...onboardingDraft.config.whatsAppConfig, businessNumber: e.target.value } })} placeholder="+91 98765 43210" />
                  </div>
                  
                  <div className="space-y-3 border-t pt-4">
                    <Label>Enabled Templates</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(onboardingDraft.config.whatsAppConfig.templates).map(([key, enabled]) => (
                        <div key={key} className="flex items-center space-x-2 border p-3 rounded-lg bg-white">
                          <Checkbox 
                            checked={enabled}
                            onCheckedChange={(checked) => {
                              updateConfig({ 
                                whatsAppConfig: { 
                                  ...onboardingDraft.config.whatsAppConfig, 
                                  templates: { ...onboardingDraft.config.whatsAppConfig.templates, [key]: !!checked } 
                                } 
                              });
                            }}
                          />
                          <span className="capitalize text-sm">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        );

      case 9: // Compliance
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between border p-4 rounded-lg">
                <div>
                  <h4 className="font-medium text-sm">Call Recording Disclosure</h4>
                  <p className="text-xs text-gray-500">Announce that calls are recorded</p>
                </div>
                <input type="checkbox" checked={onboardingDraft.config.complianceConfig.recordingNotice} onChange={(e) => updateConfig({ complianceConfig: { ...onboardingDraft.config.complianceConfig, recordingNotice: e.target.checked } })} />
              </div>
              <div className="flex items-center justify-between border p-4 rounded-lg">
                <div>
                  <h4 className="font-medium text-sm">DND / Opt-out Handling</h4>
                  <p className="text-xs text-gray-500">Automatically skip DND numbers</p>
                </div>
                <input type="checkbox" checked={onboardingDraft.config.complianceConfig.dndSkip} onChange={(e) => updateConfig({ complianceConfig: { ...onboardingDraft.config.complianceConfig, dndSkip: e.target.checked } })} />
              </div>
              <div className="flex items-center justify-between border p-4 rounded-lg">
                <div>
                  <h4 className="font-medium text-sm">Consent-Aware Calling</h4>
                  <p className="text-xs text-gray-500">Only call leads with explicit consent</p>
                </div>
                <input type="checkbox" checked={onboardingDraft.config.complianceConfig.consentAware} onChange={(e) => updateConfig({ complianceConfig: { ...onboardingDraft.config.complianceConfig, consentAware: e.target.checked } })} />
              </div>
            </div>
          </div>
        );

      case 10: // Inbound
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Enable Inbound Call Logging</Label>
                <input type="checkbox" checked={onboardingDraft.config.inboundConfig.enabled} onChange={(e) => updateConfig({ inboundConfig: { ...onboardingDraft.config.inboundConfig, enabled: e.target.checked } })} />
              </div>
              
              {onboardingDraft.config.inboundConfig.enabled && (
                <>
                  <div className="space-y-2">
                    <Label>Callback SLA Target (Minutes)</Label>
                    <Input type="number" value={onboardingDraft.config.inboundConfig.callbackSlaMins} onChange={(e) => updateConfig({ inboundConfig: { ...onboardingDraft.config.inboundConfig, callbackSlaMins: parseInt(e.target.value) } })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Unknown Number Behavior</Label>
                    <Select 
                      value={onboardingDraft.config.inboundConfig.unknownNumberBehavior} 
                      onChange={(e) => updateConfig({ inboundConfig: { ...onboardingDraft.config.inboundConfig, unknownNumberBehavior: e.target.value as any } })}
                    >
                      <option value="CreateLead">Create New Lead</option>
                      <option value="CallbackQueue">Add to Callback Queue</option>
                    </Select>
                  </div>
                </>
              )}
            </div>
          </div>
        );

      case 11: // Review
        return (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-bold text-green-900">Ready to Launch</h3>
              <p className="text-green-700 text-sm">Review your settings below before launching.</p>
            </div>

            <div className="space-y-4 text-sm">
              <div className="border rounded-lg p-4">
                <h4 className="font-bold text-gray-900 mb-2">Project Basics</h4>
                <p><span className="text-gray-500">Name:</span> {onboardingDraft.project.name}</p>
                <p><span className="text-gray-500">Location:</span> {onboardingDraft.project.cityArea}</p>
              </div>
              <div className="border rounded-lg p-4">
                <h4 className="font-bold text-gray-900 mb-2">Team</h4>
                <p>{onboardingDraft.teamMembers.length} members added</p>
              </div>
              <div className="border rounded-lg p-4">
                <h4 className="font-bold text-gray-900 mb-2">Configuration</h4>
                <p><span className="text-gray-500">Calling Window:</span> {onboardingDraft.config.callingConfig.window.startTime} - {onboardingDraft.config.callingConfig.window.endTime}</p>
                <p><span className="text-gray-500">SLA:</span> {onboardingDraft.config.callingConfig.slaTargetMins} mins</p>
                <p><span className="text-gray-500">WhatsApp:</span> {onboardingDraft.config.whatsAppConfig.enabled ? 'Enabled' : 'Disabled'}</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const currentStepInfo = steps.find(s => s.id === currentStep);
  const Icon = currentStepInfo?.icon || Building2;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b px-8 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center text-white">
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-bold text-gray-900">Project Setup</h1>
            <p className="text-xs text-gray-500">Step {currentStep} of {steps.length}: {currentStepInfo?.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={handleBack} disabled={currentStep === 1}>
            Cancel
          </Button>
          <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-600 transition-all duration-300" 
              style={{ width: `${(currentStep / steps.length) * 100}%` }} 
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex justify-center p-8">
        <Card className="w-full max-w-2xl h-fit">
          <CardHeader>
            <CardTitle>{currentStepInfo?.title}</CardTitle>
            <CardDescription>Configure your project settings.</CardDescription>
          </CardHeader>
          <CardContent>
            {renderStepContent()}
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-6">
            <Button variant="outline" onClick={handleBack}>
              {(currentStep === 1 || (isEditMode && currentStep === 2)) ? 'Cancel' : 'Back'}
            </Button>
            <Button onClick={handleNext} disabled={currentStep === 2 && !onboardingDraft.project.name}>
              {currentStep === steps.length ? (isEditMode ? 'Save Changes' : 'Launch Project') : 'Next'}
              {currentStep < steps.length && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

function Plus(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  )
}
