import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { BookVisitModal } from '@/components/inbox/BookVisitModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Phone, MessageSquare, Calendar, MoreHorizontal, AlertCircle, Clock, Play, Pause, Settings, PhoneIncoming, UserPlus, CheckCircle } from 'lucide-react';
import { Lead, Stage, hasRole, InboundCallRecord } from '@/types';
import { formatTimeAgo } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { v4 as uuidv4 } from 'uuid';
import { Dialog, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

const tabs: { id: Stage | 'All' | 'Inbound', label: string }[] = [
  { id: 'All', label: 'All AI Leads' },
  { id: 'New (SLA)', label: 'New (SLA)' },
  { id: 'Attempting', label: 'Attempting' },
  { id: 'Connected', label: 'Connected' },
  { id: 'Site Visit', label: 'Site Visit' },
  { id: 'Inbound', label: 'Inbound Calls' },
];

export default function AIQueue() {
  const navigate = useNavigate();
  const { 
    leads, 
    projects, 
    currentUser, 
    queueState, 
    startQueue, 
    pauseQueue, 
    activeProjectId, 
    setActiveProjectId,
    inboundCalls,
    addInboundCall,
    updateInboundCall,
    addLead,
    setQueueState
  } = useStore();
  
  const [activeTab, setActiveTab] = useState<Stage | 'All' | 'Inbound'>('New (SLA)');
  const [searchQuery, setSearchQuery] = useState('');
  const [bookVisitLead, setBookVisitLead] = useState<Lead | null>(null);

  // Inbound specific state
  const [isCreateLeadOpen, setIsCreateLeadOpen] = useState(false);
  const [selectedCall, setSelectedCall] = useState<InboundCallRecord | null>(null);
  const [newLeadName, setNewLeadName] = useState('');

  const filteredLeads = useMemo(() => {
    if (activeTab === 'Inbound') return [];
    if (!leads) return [];
    return leads.filter(lead => {
      // Exclude Human Working from AI Queue
      if (lead.stage === 'Human Working') return false;

      // Role-based filtering (Agents only see their assigned projects)
      if (hasRole(currentUser, 'Agent') && !hasRole(currentUser, 'Admin') && !currentUser?.assignedProjectIds?.includes(lead.projectId)) {
        return false;
      }
      
      const matchesTab = activeTab === 'All' || lead.stage === activeTab;
      const matchesSearch = lead.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            lead.phone.includes(searchQuery);
      const matchesProject = activeProjectId === 'all' || lead.projectId === activeProjectId;
      
      return matchesTab && matchesSearch && matchesProject;
    }).sort((a, b) => b.priorityScore - a.priorityScore);
  }, [leads, activeTab, searchQuery, activeProjectId, currentUser]);

  const filteredInboundCalls = useMemo(() => {
    if (activeTab !== 'Inbound') return [];
    return inboundCalls.filter(c => {
      const matchesProject = activeProjectId === 'all' || c.projectId === activeProjectId;
      const matchesSearch = c.phone.includes(searchQuery);
      return matchesProject && matchesSearch;
    }).sort((a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime());
  }, [inboundCalls, activeTab, searchQuery, activeProjectId]);

  const getSlaStatus = (lead: Lead) => {
    if (lead.stage !== 'New (SLA)') return null;
    const dueTime = new Date(lead.slaDueAt).getTime();
    const now = new Date().getTime();
    const diffMins = Math.floor((dueTime - now) / 60000);
    
    if (diffMins < 0) return { label: 'Breached', color: 'text-red-600 bg-red-50 border-red-200' };
    if (diffMins <= 5) return { label: `${diffMins}m left`, color: 'text-orange-600 bg-orange-50 border-orange-200' };
    return { label: `${diffMins}m left`, color: 'text-green-600 bg-green-50 border-green-200' };
  };

  // Inbound Actions
  const handleSimulateCall = () => {
    const project = projects.find(p => p.id === activeProjectId) || projects[0];
    if (!project) return;

    const randomPhone = `+91 ${Math.floor(Math.random() * 9000000000) + 1000000000}`;
    const matchedLead = leads.find(l => l.phone === randomPhone);

    const newCall: InboundCallRecord = {
      id: uuidv4(),
      phone: randomPhone,
      receivedAt: new Date().toISOString(),
      projectId: project.id,
      matchedLeadId: matchedLead?.id,
      status: 'New'
    };

    addInboundCall(newCall);
    
    // Log simulation
    setQueueState({
      recentOutcomes: [
        { leadId: 'inbound-sim', name: 'Inbound Call', outcome: 'Simulated Incoming', time: new Date().toLocaleTimeString() },
        ...queueState.recentOutcomes
      ].slice(0, 10)
    });
  };

  const handleCallBack = (call: InboundCallRecord) => {
    // If lead exists, navigate to lead detail
    if (call.matchedLeadId) {
        updateInboundCall(call.id, { status: 'Closed' });
        
        // Log outcome
        const lead = leads.find(l => l.id === call.matchedLeadId);
        setQueueState({
          recentOutcomes: [
            { leadId: lead?.id || 'unknown', name: lead?.name || 'Unknown', outcome: 'Inbound Callback', time: new Date().toLocaleTimeString() },
            ...queueState.recentOutcomes
          ].slice(0, 10)
        });

        navigate(`/leads/${call.matchedLeadId}`);
    } else {
        // If no lead, prompt to create one or just mark as callback queued
        updateInboundCall(call.id, { status: 'CallbackQueued' });
        
        setQueueState({
            recentOutcomes: [
              { leadId: 'unknown', name: call.phone, outcome: 'Callback Queued', time: new Date().toLocaleTimeString() },
              ...queueState.recentOutcomes
            ].slice(0, 10)
          });
          
        alert(`Callback queued for ${call.phone}. Create a lead to track this interaction.`);
    }
  };

  const openCreateLead = (call: InboundCallRecord) => {
    setSelectedCall(call);
    setNewLeadName('');
    setIsCreateLeadOpen(true);
  };

  const handleCreateLead = () => {
    if (!selectedCall || !newLeadName) return;

    const newLead: Lead = {
      id: uuidv4(),
      name: newLeadName,
      phone: selectedCall.phone,
      source: 'Inbound Call',
      projectId: selectedCall.projectId,
      languagePreference: 'Auto',
      stage: 'New (SLA)',
      createdAt: new Date().toISOString(),
      slaDueAt: new Date(Date.now() + 30 * 60000).toISOString(), // 30 mins SLA
      priorityScore: 50,
      extracted: {},
      doNotCall: false,
      tasks: [],
      callHistory: [],
      messages: []
    };

    addLead(newLead);
    updateInboundCall(selectedCall.id, { matchedLeadId: newLead.id, status: 'Closed' });
    
    // Log outcome
    setQueueState({
        recentOutcomes: [
          { leadId: newLead.id, name: newLead.name, outcome: 'Inbound Converted to Lead', time: new Date().toLocaleTimeString() },
          ...queueState.recentOutcomes
        ].slice(0, 10)
      });

    setIsCreateLeadOpen(false);
    setSelectedCall(null);
    navigate(`/leads/${newLead.id}`);
  };

  const hasAiAttempted = (phone: string) => {
    const lead = leads.find(l => l.phone === phone);
    if (!lead) return false;
    return lead.callHistory.some(c => c.type === 'AI');
  };

  return (
    <div className="flex h-full w-full flex-col bg-gray-50">
      {/* Top Bar for Queue Controls */}
      <div className="border-b border-gray-200 bg-white px-6 py-4 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">AI Queue</h1>
          <Badge variant={queueState.isRunning ? "success" : "secondary"} className="uppercase text-[10px]">
            {queueState.isRunning ? 'Running' : 'Paused'}
          </Badge>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-6 mr-4">
            <div className="text-center">
              <div className="text-xs text-gray-500 uppercase">Attempts</div>
              <div className="font-bold text-gray-900">{queueState.stats.attempts}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500 uppercase">Connected</div>
              <div className="font-bold text-blue-600">{queueState.stats.connected}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500 uppercase">Qualified</div>
              <div className="font-bold text-purple-600">{queueState.stats.qualified}</div>
            </div>
          </div>

          <Button variant="outline" className="shadow-sm" onClick={handleSimulateCall}>
             <PhoneIncoming className="mr-2 h-4 w-4" /> Simulate Inbound
          </Button>

          {!queueState.isRunning ? (
            <Button className="bg-green-600 hover:bg-green-700 shadow-sm" onClick={startQueue}>
              <Play className="mr-2 h-4 w-4" /> Start Queue
            </Button>
          ) : (
            <Button variant="destructive" className="shadow-sm" onClick={pauseQueue}>
              <Pause className="mr-2 h-4 w-4" /> Pause
            </Button>
          )}
          <Button variant="outline" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Live Monitor Strip */}
      {queueState.isRunning && (
        <div className="bg-blue-50 border-b border-blue-100 px-6 py-2 flex items-center gap-3 text-sm">
          {queueState.currentLeadId ? (
            <>
              <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="font-medium text-blue-900">AI is currently calling a lead...</span>
            </>
          ) : (
            <>
              <Clock className="h-4 w-4 text-blue-500 animate-spin-slow" />
              <span className="text-blue-800">Waiting for next lead in queue...</span>
            </>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="px-6 py-4 flex items-center justify-between bg-white border-b border-gray-200">
        <div className="flex gap-6 overflow-x-auto hide-scrollbar">
          {tabs.map(tab => {
            let count = 0;
            if (tab.id === 'Inbound') {
                count = inboundCalls.filter(c => activeProjectId === 'all' || c.projectId === activeProjectId).length;
            } else {
                count = leads?.filter(l => 
                    l.stage !== 'Human Working' &&
                    (tab.id === 'All' || l.stage === tab.id) &&
                    (!hasRole(currentUser, 'Agent') || hasRole(currentUser, 'Admin') || currentUser?.assignedProjectIds?.includes(l.projectId))
                ).length || 0;
            }
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 pb-2 border-b-2 text-sm font-medium whitespace-nowrap transition-colors",
                  activeTab === tab.id 
                    ? "border-blue-600 text-blue-600" 
                    : "border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300"
                )}
              >
                {tab.label}
                <span className={cn(
                  "rounded-full px-2 py-0.5 text-xs",
                  activeTab === tab.id ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"
                )}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input 
              placeholder={activeTab === 'Inbound' ? "Search inbound numbers..." : "Search AI leads..."}
              className="pl-9 h-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select 
            className="w-48 h-9"
            value={activeProjectId}
            onChange={(e) => setActiveProjectId(e.target.value)}
          >
            <option value="all">All Projects</option>
            {projects?.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </Select>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'Inbound' ? (
             // Inbound Calls List
             filteredInboundCalls.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-4">
                  <div className="rounded-full bg-gray-100 p-4">
                    <PhoneIncoming className="h-8 w-8 text-gray-400" />
                  </div>
                  <p>No inbound calls found.</p>
                  <Button variant="link" onClick={handleSimulateCall}>Simulate one now</Button>
                </div>
              ) : (
                <div className="space-y-3 max-w-5xl mx-auto">
                    {filteredInboundCalls.map(call => {
                        const lead = leads.find(l => l.id === call.matchedLeadId);
                        const aiAttempted = hasAiAttempted(call.phone);
                        
                        return (
                            <div 
                                key={call.id}
                                className="group relative flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:border-blue-300 hover:shadow-md"
                            >
                                <div className="flex items-start gap-4 flex-1 min-w-0">
                                    <div className={cn(
                                        "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full font-semibold",
                                        call.status === 'New' ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-600"
                                    )}>
                                        <PhoneIncoming className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="text-sm font-semibold text-gray-900 truncate">{call.phone}</h3>
                                            <Badge variant={
                                                call.status === 'New' ? 'destructive' :
                                                call.status === 'CallbackQueued' ? 'warning' : 'secondary'
                                            } className="text-[10px]">
                                                {call.status === 'New' ? 'Missed' : call.status}
                                            </Badge>
                                            {aiAttempted && (
                                                <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700 border-blue-200">
                                                    AI Attempted
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" /> {formatTimeAgo(call.receivedAt)}
                                            </span>
                                            <span>•</span>
                                            {lead ? (
                                                <span className="flex items-center gap-1 text-blue-600 font-medium">
                                                    <CheckCircle className="h-3 w-3" /> Matched: {lead.name}
                                                </span>
                                            ) : (
                                                <span className="text-gray-400 italic">Unknown Caller</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {!lead && (
                                        <Button size="sm" variant="outline" onClick={() => openCreateLead(call)}>
                                            <UserPlus className="mr-2 h-3 w-3" /> Create Lead
                                        </Button>
                                    )}
                                    <Button size="sm" onClick={() => handleCallBack(call)} className={lead ? "bg-green-600 hover:bg-green-700" : ""}>
                                        <Phone className="mr-2 h-3 w-3" /> {lead ? "Call Back" : "Queue Callback"}
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                </div>
              )
        ) : (
          // Standard AI Queue List
          filteredLeads.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-4">
              <div className="rounded-full bg-gray-100 p-4">
                <AlertCircle className="h-8 w-8 text-gray-400" />
              </div>
              <p>No leads found in this view.</p>
            </div>
          ) : (
            <div className="space-y-3 max-w-5xl mx-auto">
              {filteredLeads.map(lead => {
                const project = projects.find(p => p.id === lead.projectId);
                const slaStatus = getSlaStatus(lead);
                
                return (
                  <div 
                    key={lead.id}
                    onClick={() => navigate(`/leads/${lead.id}`)}
                    className="group relative flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:border-blue-300 hover:shadow-md cursor-pointer"
                  >
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 font-semibold">
                        {lead.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-semibold text-gray-900 truncate">{lead.name}</h3>
                          {slaStatus && (
                            <span className={cn("text-[10px] px-1.5 py-0.5 rounded border font-medium flex items-center gap-1", slaStatus.color)}>
                              <Clock className="h-3 w-3" /> {slaStatus.label}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                          <span>{lead.phone}</span>
                          <span>•</span>
                          <span className="truncate max-w-[120px]">{project?.name}</span>
                          <span>•</span>
                          <span>{formatTimeAgo(lead.createdAt)}</span>
                          {lead.callHistory.length > 0 && (
                            <>
                              <span>•</span>
                              <span className="text-blue-600 font-medium">{lead.callHistory.length} AI Attempts</span>
                            </>
                          )}
                        </div>
                        
                        {/* Extracted Chips */}
                        <div className="flex flex-wrap gap-1.5">
                          {lead.extracted.budgetBand && (
                            <Badge variant="secondary" className="text-[10px] font-normal">{lead.extracted.budgetBand}</Badge>
                          )}
                          {lead.extracted.bhk && (
                            <Badge variant="secondary" className="text-[10px] font-normal">{lead.extracted.bhk}</Badge>
                          )}
                          {lead.extracted.timeline && (
                            <Badge variant="secondary" className="text-[10px] font-normal">{lead.extracted.timeline}</Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Hover Actions */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 ml-4">
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50" onClick={(e) => { e.stopPropagation(); }}>
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-[#25D366] hover:text-[#128C7E] hover:bg-green-50" onClick={(e) => { e.stopPropagation(); }}>
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50" onClick={(e) => { e.stopPropagation(); setBookVisitLead(lead); }}>
                        <Calendar className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-400 hover:text-gray-600" onClick={(e) => { e.stopPropagation(); }}>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>

      {/* Overlays */}
      <BookVisitModal 
        lead={bookVisitLead} 
        onClose={() => setBookVisitLead(null)}
        onSuccess={() => setBookVisitLead(null)}
      />

      {/* Recent Activity Log */}
      <div className="border-t border-gray-200 bg-white px-6 py-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Recent Activity Log</h3>
        <div className="space-y-2 max-h-40 overflow-y-auto text-sm">
            {queueState.recentOutcomes.length === 0 ? (
                <p className="text-gray-500 italic">No recent activity.</p>
            ) : (
                queueState.recentOutcomes.map((outcome, i) => (
                    <div key={i} className="flex items-center gap-2 text-gray-600">
                        <span className="text-xs text-gray-400 w-16">{outcome.time}</span>
                        <span className="font-medium text-gray-900">{outcome.name}</span>
                        <span className="text-gray-400">•</span>
                        <span>{outcome.outcome}</span>
                    </div>
                ))
            )}
        </div>
      </div>

      <Dialog open={isCreateLeadOpen} onOpenChange={setIsCreateLeadOpen}>
          <DialogHeader>
            <DialogTitle>Create Lead from Inbound Call</DialogTitle>
            <DialogDescription>
              Enter details for the caller from {selectedCall?.phone}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input 
                placeholder="Enter lead name" 
                value={newLeadName}
                onChange={(e) => setNewLeadName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={selectedCall?.phone || ''} disabled />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateLeadOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateLead} disabled={!newLeadName}>Create Lead</Button>
          </DialogFooter>
      </Dialog>
    </div>
  );
}
