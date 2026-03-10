import React, { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Users, PhoneCall, ShieldCheck, CreditCard, Settings2, RefreshCw, UserPlus, Check, GitMerge, MessageSquare, Plus, Trash2 } from 'lucide-react';
import { User, Role, WhatsAppTemplate } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export default function Settings() {
  const { users, projects, leads, visits, queueState, setQueueState, resetDemoData, updateUser, routingConfig, whatsAppConfig, setWhatsAppConfig } = useStore();
  const [activeTab, setActiveTab] = useState<'team' | 'calling' | 'compliance' | 'billing' | 'advanced' | 'demo' | 'routing' | 'whatsapp'>('team');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  
  // Billing Metrics Calculation
  const totalLeads = leads.length;
  
  const aiCalls = leads.flatMap(l => l.callHistory).filter(c => c.type === 'AI');
  const aiCallsCount = aiCalls.length;
  const aiCallsMinutes = Math.ceil(aiCalls.reduce((acc, c) => acc + c.durationSec, 0) / 60);

  const humanCalls = leads.flatMap(l => l.callHistory).filter(c => c.type === 'Human');
  const humanCallsCount = humanCalls.length;
  const humanCallsMinutes = Math.ceil(humanCalls.reduce((acc, c) => acc + c.durationSec, 0) / 60);

  const visitsBookedCount = visits.length;

  const whatsappMessagesCount = leads.flatMap(l => l.messages).filter(m => m.type === 'WhatsApp').length;
  
  // WhatsApp Template State
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateContent, setNewTemplateContent] = useState('');

  const handleAddTemplate = () => {
    if (!newTemplateName || !newTemplateContent) return;
    const newTemplate: WhatsAppTemplate = {
      id: uuidv4(),
      name: newTemplateName,
      content: newTemplateContent
    };
    setWhatsAppConfig({
      templates: [...whatsAppConfig.templates, newTemplate]
    });
    setNewTemplateName('');
    setNewTemplateContent('');
  };

  const handleDeleteTemplate = (id: string) => {
    setWhatsAppConfig({
      templates: whatsAppConfig.templates.filter(t => t.id !== id)
    });
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      updateUser(editingUser.id, {
        dailyLeadLimit: editingUser.dailyLeadLimit,
        assignedProjectIds: editingUser.assignedProjectIds,
        roles: editingUser.roles
      });
      setEditingUser(null);
    }
  };

  const toggleProjectAssignment = (projectId: string) => {
    if (!editingUser) return;
    const current = editingUser.assignedProjectIds || [];
    const updated = current.includes(projectId)
      ? current.filter(id => id !== projectId)
      : [...current, projectId];
    setEditingUser({ ...editingUser, assignedProjectIds: updated });
  };

  const toggleRole = (role: Role) => {
    if (!editingUser) return;
    const current = editingUser.roles || [];
    const updated = current.includes(role)
      ? current.filter(r => r !== role)
      : [...current, role];
    setEditingUser({ ...editingUser, roles: updated });
  };

  return (
    <div className="flex h-full w-full bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 border-r border-gray-200 bg-white flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">Settings</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {[
            { id: 'team', label: 'Team', icon: Users },
            { id: 'routing', label: 'Routing & Queue', icon: GitMerge },
            { id: 'whatsapp', label: 'WhatsApp & Messaging', icon: MessageSquare },
            { id: 'calling', label: 'Calling & SLA', icon: PhoneCall },
            { id: 'compliance', label: 'Compliance', icon: ShieldCheck },
            { id: 'billing', label: 'Billing', icon: CreditCard },
            { id: 'advanced', label: 'Advanced', icon: Settings2 },
            { id: 'demo', label: 'Demo Controls', icon: RefreshCw },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-4xl space-y-6">
          
          {activeTab === 'whatsapp' && (
            <Card>
              <CardHeader>
                <CardTitle>WhatsApp & Messaging</CardTitle>
                <CardDescription>Configure your business number and message templates.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Business Phone Number</Label>
                  <Input 
                    value={whatsAppConfig?.businessNumber || ''} 
                    onChange={(e) => setWhatsAppConfig({ businessNumber: e.target.value })}
                    placeholder="+91 98765 43210"
                  />
                  <p className="text-xs text-gray-500">This number will be used as the sender ID for all WhatsApp messages.</p>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900 mb-4">Message Templates</h4>
                  
                  <div className="grid gap-4 mb-6">
                    {whatsAppConfig?.templates.map(template => (
                      <div key={template.id} className="p-4 border border-gray-200 rounded-lg bg-gray-50 relative group">
                        <div className="flex justify-between items-start mb-2">
                          <h5 className="font-semibold text-sm">{template.name}</h5>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleDeleteTemplate(template.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="text-sm text-gray-600 whitespace-pre-wrap">{template.content}</p>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 border border-dashed border-gray-300 rounded-lg bg-white">
                    <h5 className="text-sm font-medium text-gray-900 mb-3">Add New Template</h5>
                    <div className="space-y-3">
                      <Input 
                        placeholder="Template Name (e.g. Follow Up)" 
                        value={newTemplateName}
                        onChange={(e) => setNewTemplateName(e.target.value)}
                      />
                      <textarea 
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Template Content (use {{name}} for variables)"
                        value={newTemplateContent}
                        onChange={(e) => setNewTemplateContent(e.target.value)}
                      />
                      <Button size="sm" onClick={handleAddTemplate} disabled={!newTemplateName || !newTemplateContent}>
                        <Plus className="mr-2 h-3 w-3" /> Add Template
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'team' && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Team Management</CardTitle>
                  <CardDescription>Manage your sales agents and site coordinators.</CardDescription>
                </div>
                <Button size="sm" onClick={() => setIsInviteOpen(true)}><UserPlus className="mr-2 h-4 w-4" /> Invite User</Button>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border border-gray-200">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                      <tr>
                        <th className="px-4 py-3 font-medium">Name</th>
                        <th className="px-4 py-3 font-medium">Role</th>
                        <th className="px-4 py-3 font-medium">Daily Limit</th>
                        <th className="px-4 py-3 font-medium">Projects</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                        <th className="px-4 py-3 font-medium text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {users?.map(user => (
                        <tr key={user.id} className="bg-white">
                          <td className="px-4 py-3 font-medium text-gray-900">{user.name}</td>
                          <td className="px-4 py-3 text-gray-500">
                            <div className="flex flex-wrap gap-1">
                              {user.roles?.map(r => (
                                <Badge key={r} variant="secondary" className="text-[10px]">{r}</Badge>
                              ))}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-900 font-mono">
                            {user.dailyLeadLimit ? user.dailyLeadLimit : <span className="text-gray-400">∞</span>}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1">
                              {user.assignedProjectIds?.map(pid => {
                                const p = projects.find(proj => proj.id === pid);
                                return p ? <Badge key={pid} variant="outline" className="text-[10px]">{p.name}</Badge> : null;
                              })}
                              {(!user.assignedProjectIds || user.assignedProjectIds.length === 0) && <span className="text-xs text-gray-400 italic">None</span>}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium ${
                              user.onlineStatus === 'Online' ? 'bg-green-50 text-green-700' :
                              user.onlineStatus === 'Busy' ? 'bg-orange-50 text-orange-700' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${
                                user.onlineStatus === 'Online' ? 'bg-green-500' :
                                user.onlineStatus === 'Busy' ? 'bg-orange-500' :
                                'bg-gray-400'
                              }`} />
                              {user.onlineStatus}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                              onClick={() => setEditingUser(user)}
                            >
                              Edit
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'routing' && (
            <Card>
              <CardHeader>
                <CardTitle>Routing & Queue</CardTitle>
                <CardDescription>Configure how leads are distributed to your team.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Routing Strategy</Label>
                  <Select disabled value={routingConfig?.strategy || 'RoundRobin'}>
                    <option value="RoundRobin">Round Robin</option>
                  </Select>
                  <p className="text-xs text-gray-500">
                    Leads are distributed sequentially to available agents in a project.
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900 mb-4">Queue Debugger</h4>
                  <div className="space-y-4">
                    {projects?.map(project => {
                      const projectAgents = users?.filter(u => 
                        u.roles?.includes('Agent') && 
                        u.assignedProjectIds?.includes(project.id)
                      ) || [];
                      const currentIndex = routingConfig?.roundRobinIndexByProject?.[project.id] || 0;

                      return (
                        <div key={project.id} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                          <div className="flex justify-between items-center mb-2">
                            <h5 className="font-medium text-sm">{project.name}</h5>
                            <Badge variant="outline">Index: {currentIndex}</Badge>
                          </div>
                          <div className="text-xs text-gray-500 mb-2">
                            {projectAgents.length} Agents Eligible
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {projectAgents.map((agent, idx) => (
                              <div 
                                key={agent.id}
                                className={`px-2 py-1 rounded text-xs border ${
                                  idx === currentIndex 
                                    ? 'bg-blue-100 border-blue-300 text-blue-700 font-medium' 
                                    : 'bg-white border-gray-200 text-gray-600'
                                }`}
                              >
                                {agent.name} {idx === currentIndex && '(Next)'}
                              </div>
                            ))}
                            {projectAgents.length === 0 && (
                              <span className="text-gray-400 italic text-xs">No agents assigned</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ... other tabs ... */}
          {activeTab === 'calling' && (
            <Card>
              <CardHeader>
                <CardTitle>Calling & SLA</CardTitle>
                <CardDescription>Configure AI calling behavior and service level agreements.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>SLA Default (Minutes)</Label>
                    <Input type="number" defaultValue={5} />
                    <p className="text-xs text-gray-500">Time before a new lead is marked as breached.</p>
                  </div>
                  <div className="space-y-2">
                    <Label>AI Concurrency</Label>
                    <Input type="number" defaultValue={1} />
                    <p className="text-xs text-gray-500">Number of simultaneous calls AI can make.</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Retry Preset</Label>
                    <Select value={queueState.retryPreset.toString()} onChange={(e) => setQueueState({ retryPreset: parseInt(e.target.value) })}>
                      <option value="1">1 Attempt</option>
                      <option value="3">3 Attempts (Immediate, +2h, Next Day)</option>
                      <option value="5">5 Attempts</option>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Handoff Ring Time (Seconds)</Label>
                    <Input type="number" value={queueState.ringTime} onChange={(e) => setQueueState({ ringTime: parseInt(e.target.value) })} />
                    <p className="text-xs text-gray-500">How long to ring human agent before creating ticket.</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900 mb-4">Calling Window</h4>
                  <div className="grid grid-cols-2 gap-6 mb-4">
                    <div className="space-y-2">
                      <Label>Start Time</Label>
                      <Input 
                        type="time" 
                        value={queueState.callingWindow?.startTime || '09:00'} 
                        onChange={(e) => setQueueState({ 
                          callingWindow: { ...queueState.callingWindow, startTime: e.target.value } 
                        })} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>End Time</Label>
                      <Input 
                        type="time" 
                        value={queueState.callingWindow?.endTime || '18:00'} 
                        onChange={(e) => setQueueState({ 
                          callingWindow: { ...queueState.callingWindow, endTime: e.target.value } 
                        })} 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Active Days</Label>
                    <div className="flex flex-wrap gap-2">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, idx) => (
                        <div key={day} className="flex items-center space-x-2 border rounded-md px-3 py-2 bg-white">
                          <input
                            type="checkbox"
                            id={`day-${idx}`}
                            checked={queueState.callingWindow?.daysOfWeek?.includes(idx)}
                            onChange={(e) => {
                              const currentDays = queueState.callingWindow?.daysOfWeek || [];
                              const newDays = e.target.checked
                                ? [...currentDays, idx]
                                : currentDays.filter(d => d !== idx);
                              setQueueState({
                                callingWindow: { ...queueState.callingWindow, daysOfWeek: newDays }
                              });
                            }}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <label htmlFor={`day-${idx}`} className="text-sm font-medium text-gray-700 cursor-pointer">
                            {day}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900 mb-4">Handoff Triggers</h4>
                  <div className="space-y-3">
                    {queueState.handoffTriggers && Object.entries(queueState.handoffTriggers).map(([key, value]) => (
                      <label key={key} className="flex items-center gap-3">
                        <input 
                          type="checkbox" 
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          checked={value}
                          onChange={(e) => setQueueState({ 
                            handoffTriggers: { ...queueState.handoffTriggers, [key]: e.target.checked } 
                          })}
                        />
                        <span className="text-sm text-gray-700 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'compliance' && (
            <Card>
              <CardHeader>
                <CardTitle>Compliance</CardTitle>
                <CardDescription>Manage legal and regulatory calling requirements.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-white">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Call Recording Notice</h4>
                    <p className="text-xs text-gray-500 mt-1">Play "This call is being recorded" before AI speaks.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={queueState.compliance.recordingNotice} onChange={(e) => setQueueState({ compliance: { ...queueState.compliance, recordingNotice: e.target.checked } })} />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-white">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">DND Skip</h4>
                    <p className="text-xs text-gray-500 mt-1">Automatically skip leads marked as Do Not Call or Opt-Out.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={queueState.compliance.dndSkip} onChange={(e) => setQueueState({ compliance: { ...queueState.compliance, dndSkip: e.target.checked } })} />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'billing' && (
            <Card>
              <CardHeader>
                <CardTitle>Billing & Usage</CardTitle>
                <CardDescription>Current plan: <span className="font-semibold text-blue-600">Starter</span></CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Total Leads */}
                  <div className="p-4 border border-gray-200 rounded-lg bg-white">
                    <div className="text-sm text-gray-500 mb-1">Total Leads</div>
                    <div className="text-2xl font-bold text-gray-900">{totalLeads}</div>
                    <div className="text-xs text-gray-400 mt-1">All time</div>
                  </div>

                  {/* AI Calls */}
                  <div className="p-4 border border-gray-200 rounded-lg bg-white">
                    <div className="text-sm text-gray-500 mb-1">AI Calls</div>
                    <div className="flex items-baseline gap-2">
                      <div className="text-2xl font-bold text-blue-600">{aiCallsCount}</div>
                      <div className="text-sm text-gray-500">calls</div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      <span className="font-medium">{aiCallsMinutes}</span> mins used
                    </div>
                  </div>

                  {/* Human Calls */}
                  <div className="p-4 border border-gray-200 rounded-lg bg-white">
                    <div className="text-sm text-gray-500 mb-1">Human Calls</div>
                    <div className="flex items-baseline gap-2">
                      <div className="text-2xl font-bold text-purple-600">{humanCallsCount}</div>
                      <div className="text-sm text-gray-500">calls</div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      <span className="font-medium">{humanCallsMinutes}</span> mins used
                    </div>
                  </div>

                  {/* Visits Booked */}
                  <div className="p-4 border border-gray-200 rounded-lg bg-white">
                    <div className="text-sm text-gray-500 mb-1">Visits Booked</div>
                    <div className="text-2xl font-bold text-green-600">{visitsBookedCount}</div>
                    <div className="text-xs text-gray-400 mt-1">All time</div>
                  </div>

                  {/* WhatsApp Messages */}
                  <div className="p-4 border border-gray-200 rounded-lg bg-white">
                    <div className="text-sm text-gray-500 mb-1">WhatsApp Messages</div>
                    <div className="text-2xl font-bold text-green-600">{whatsappMessagesCount}</div>
                    <div className="text-xs text-gray-400 mt-1">Sent & Received</div>
                  </div>

                  {/* Plan Limits (Static) */}
                  <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="text-sm text-gray-500 mb-1">Plan Limits</div>
                    <div className="space-y-1 mt-2">
                      <div className="flex justify-between text-xs">
                        <span>AI Mins</span>
                        <span className="font-medium">1000 / mo</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span>WhatsApp</span>
                        <span className="font-medium">5000 / mo</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span>Users</span>
                        <span className="font-medium">5 max</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900 mb-4">Recent Invoices</h4>
                  <div className="text-sm text-gray-500 italic">No past invoices available.</div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'demo' && (
            <Card className="border-red-200">
              <CardHeader className="bg-red-50/50">
                <CardTitle className="text-red-700">Demo Controls</CardTitle>
                <CardDescription>Use these tools to reset the prototype state.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="flex items-center justify-between p-4 border border-red-100 rounded-lg bg-white">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Reset Demo Data</h4>
                    <p className="text-xs text-gray-500 mt-1">Restore all leads, visits, and settings to their initial state.</p>
                  </div>
                  <Button variant="destructive" onClick={() => {
                    resetDemoData();
                    alert('Demo data reset successfully.');
                  }}>
                    <RefreshCw className="mr-2 h-4 w-4" /> Reset Data
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

        </div>
      </div>

      {/* Edit User Dialog */}
      <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)} className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Update role, daily limits, and project assignments for {editingUser?.name}.
          </DialogDescription>
        </DialogHeader>
        
        {editingUser && (
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Name</Label>
              <Input id="name" value={editingUser.name} disabled className="col-span-3 bg-gray-50" />
            </div>
            
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right mt-2">Roles</Label>
              <div className="col-span-3 space-y-2 border rounded-md p-3">
                {(['Admin', 'Agent', 'Coordinator'] as Role[]).map(role => (
                  <div key={role} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`role-${role}`}
                      checked={editingUser.roles?.includes(role)}
                      onChange={() => toggleRole(role)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label 
                      htmlFor={`role-${role}`} 
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {role}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="limit" className="text-right">Daily Limit</Label>
              <div className="col-span-3">
                <Input 
                  id="limit" 
                  type="number" 
                  value={editingUser.dailyLeadLimit || ''} 
                  placeholder="No limit"
                  onChange={(e) => setEditingUser({ ...editingUser, dailyLeadLimit: e.target.value ? parseInt(e.target.value) : undefined })} 
                />
                <p className="text-[10px] text-gray-500 mt-1">Max leads assigned per day. Leave empty for unlimited.</p>
              </div>
            </div>

            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right mt-2">Projects</Label>
              <div className="col-span-3 space-y-2 border rounded-md p-3 max-h-40 overflow-y-auto">
                {projects?.map(project => (
                  <div key={project.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`proj-${project.id}`}
                      checked={editingUser.assignedProjectIds?.includes(project.id)}
                      onChange={() => toggleProjectAssignment(project.id)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label 
                      htmlFor={`proj-${project.id}`} 
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {project.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => setEditingUser(null)}>Cancel</Button>
          <Button onClick={handleSaveUser}>Save Changes</Button>
        </DialogFooter>
      </Dialog>

      {/* Invite User Dialog (Mock) */}
      <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
        <DialogHeader>
          <DialogTitle>Invite New User</DialogTitle>
          <DialogDescription>Send an invitation to join the team.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Email Address</Label>
            <Input placeholder="colleague@example.com" />
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <Select>
              <option>Agent</option>
              <option>Coordinator</option>
              <option>Admin</option>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsInviteOpen(false)}>Cancel</Button>
          <Button onClick={() => { setIsInviteOpen(false); alert('Invitation sent!'); }}>Send Invitation</Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
