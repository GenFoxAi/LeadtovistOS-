import React, { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Drawer } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Phone, MessageSquare, Calendar, MoreVertical, CheckCircle2, AlertCircle, Clock, FileText } from 'lucide-react';
import { formatDateTime, formatTimeAgo } from '@/lib/utils';
import { Lead } from '@/types';

interface LeadDrawerProps {
  leadId: string | null;
  onClose: () => void;
  onBookVisit: (lead: Lead) => void;
}

export function LeadDrawer({ leadId, onClose, onBookVisit }: LeadDrawerProps) {
  const { leads, projects, users } = useStore();
  const [activeTab, setActiveTab] = useState<'summary' | 'history' | 'tasks'>('summary');

  if (!leadId) return null;

  const lead = leads.find(l => l.id === leadId);
  if (!lead) return null;

  const project = projects.find(p => p.id === lead.projectId);
  const handoffTicket = lead.handoffTicketId ? useStore.getState().handoffTickets.find(t => t.id === lead.handoffTicketId) : null;

  return (
    <Drawer open={!!leadId} onOpenChange={(open) => !open && onClose()} className="w-full sm:w-[500px] max-w-full">
      {/* Header */}
      <div className="flex flex-col border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{lead.name}</h2>
            <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
              <span>{lead.phone}</span>
              <span>•</span>
              <span>{lead.source}</span>
              {lead.callHistory.length > 0 && (
                <>
                  <span>•</span>
                  <span className="text-blue-600 font-medium">{lead.callHistory.length} AI Attempts</span>
                </>
              )}
            </div>
          </div>
          <Badge variant={
            lead.stage === 'New (SLA)' ? 'destructive' : 
            lead.stage === 'Site Visit' ? 'success' : 
            lead.stage === 'Human Working' ? 'warning' : 'default'
          }>
            {lead.stage}
          </Badge>
        </div>

        {/* Action Bar */}
        <div className="mt-6 flex items-center gap-2">
          <Button className="flex-1 bg-green-600 hover:bg-green-700">
            <Phone className="mr-2 h-4 w-4" /> Call
          </Button>
          <Button className="flex-1 bg-[#25D366] hover:bg-[#128C7E] text-white">
            <MessageSquare className="mr-2 h-4 w-4" /> WhatsApp
          </Button>
          <Button variant="outline" className="flex-1" onClick={() => onBookVisit(lead)}>
            <Calendar className="mr-2 h-4 w-4" /> Book Visit
          </Button>
          <Button variant="outline" size="icon">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 px-6">
        <button
          className={`border-b-2 py-3 px-4 text-sm font-medium ${activeTab === 'summary' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('summary')}
        >
          Summary
        </button>
        <button
          className={`border-b-2 py-3 px-4 text-sm font-medium ${activeTab === 'history' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('history')}
        >
          History & Logs
        </button>
        <button
          className={`border-b-2 py-3 px-4 text-sm font-medium ${activeTab === 'tasks' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('tasks')}
        >
          Tasks
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
        {activeTab === 'summary' && (
          <div className="space-y-6">
            {/* Next Best Action */}
            <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
              <h3 className="text-sm font-semibold text-blue-900 flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4" /> Next Action & User Expectations
              </h3>
              <p className="text-sm text-blue-800 mb-3">
                {lead.stage === 'New (SLA)' ? 'SLA breach imminent. Call immediately to qualify.' :
                 lead.stage === 'Human Working' ? `Handoff requested: ${handoffTicket?.reason || 'Review transcript and call back.'}` :
                 lead.stage === 'Site Visit' ? 'Send a WhatsApp reminder with location pin.' :
                 'Follow up to check interest.'}
              </p>
              {lead.stage === 'Human Working' && (
                <div className="mt-2 p-2 bg-white rounded border border-blue-100">
                  <span className="text-xs font-bold text-blue-700 uppercase">Reason for Handoff:</span>
                  <p className="text-sm text-gray-800 mt-1">{handoffTicket?.reason || 'User requested human agent.'}</p>
                </div>
              )}
              {lead.stage === 'Human Working' && (
                <Button size="sm" className="w-full mt-3 bg-blue-600 hover:bg-blue-700">Claim Handoff Ticket</Button>
              )}
            </div>

            {/* Extracted Fields */}
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">My AI Insights</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-500">Project</div>
                  <div className="text-sm font-medium">{project?.name || 'Unknown'}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Language</div>
                  <div className="text-sm font-medium">{lead.languagePreference}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Budget</div>
                  <div className="text-sm font-medium">{lead.extracted.budgetBand || '-'}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">BHK Preference</div>
                  <div className="text-sm font-medium">{lead.extracted.bhk || '-'}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Timeline</div>
                  <div className="text-sm font-medium">{lead.extracted.timeline || '-'}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Loan Readiness</div>
                  <div className="text-sm font-medium">{lead.extracted.loanReadiness || '-'}</div>
                </div>
              </div>
              {lead.extracted.notes && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="text-xs text-gray-500 mb-1">AI Call Summary</div>
                  <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100">{lead.extracted.notes}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-6">
            {/* History Summary */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                <div className="text-xs text-gray-500 uppercase font-semibold">Total AI Attempts</div>
                <div className="text-2xl font-bold text-gray-900">{lead.callHistory.filter(c => c.type === 'AI').length}</div>
              </div>
              <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                <div className="text-xs text-gray-500 uppercase font-semibold">User Attended</div>
                <div className="text-2xl font-bold text-green-600">{lead.callHistory.filter(c => c.outcome === 'Connected').length}</div>
              </div>
            </div>

            <div className="relative border-l border-gray-200 ml-3 space-y-6">
              {lead.callHistory?.map((call, idx) => (
                <div key={call.id} className="relative pl-6">
                  <div className="absolute -left-1.5 top-1.5 h-3 w-3 rounded-full border-2 border-white bg-blue-500" />
                  <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{call.type} Call</Badge>
                        <span className="text-xs font-medium text-gray-900">{call.outcome}</span>
                      </div>
                      <span className="text-xs text-gray-500">{formatTimeAgo(call.startedAt)}</span>
                    </div>
                    <div className="text-xs text-gray-500 mb-2">Duration: {call.durationSec}s</div>
                    
                    {call.transcript && (
                      <div className="mt-3 space-y-2">
                        <div className="text-xs font-semibold text-gray-700">Transcript Snippet:</div>
                        <div className="rounded bg-gray-50 p-2 text-xs text-gray-700 italic border border-gray-100">
                          "{call.transcript}"
                        </div>
                      </div>
                    )}

                    {call.outcome === 'Connected' && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-3 bg-gray-50 rounded-full px-3 py-1.5 border border-gray-200 w-fit">
                          <div className="h-6 w-6 rounded-full bg-blue-600 flex items-center justify-center text-white cursor-pointer hover:bg-blue-700">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                              <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="h-1 w-24 bg-gray-300 rounded-full overflow-hidden">
                            <div className="h-full w-1/3 bg-blue-500 rounded-full" />
                          </div>
                          <span className="text-[10px] font-mono text-gray-500">00:12 / 01:45</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              <div className="relative pl-6">
                <div className="absolute -left-1.5 top-1.5 h-3 w-3 rounded-full border-2 border-white bg-gray-300" />
                <div className="text-sm text-gray-500">
                  Lead created via {lead.source} • {formatDateTime(lead.createdAt)}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="space-y-4">
            <Button variant="outline" className="w-full border-dashed">
              + Add Task
            </Button>
            {lead.tasks.length === 0 ? (
              <div className="text-center py-8 text-sm text-gray-500">No tasks pending.</div>
            ) : (
              lead.tasks?.map(task => (
                <div key={task.id} className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3">
                  <div className="flex items-center gap-3">
                    <div className="h-4 w-4 rounded-full border border-gray-300" />
                    <div>
                      <div className="text-sm font-medium">{task.title}</div>
                      <div className="text-xs text-gray-500">Due {formatTimeAgo(task.dueAt)}</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </Drawer>
  );
}
