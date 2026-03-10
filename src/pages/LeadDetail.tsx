import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Phone, MessageSquare, Calendar, MoreVertical, AlertCircle, ArrowLeft, Clock } from 'lucide-react';
import { formatDateTime, formatTimeAgo } from '@/lib/utils';
import { Lead } from '@/types';
import { BookVisitModal } from '@/components/inbox/BookVisitModal';
import { WhatsAppModal } from '@/components/inbox/WhatsAppModal';

export default function LeadDetail() {
  const { leadId } = useParams<{ leadId: string }>();
  const navigate = useNavigate();
  const { leads, projects, handoffTickets } = useStore();
  const [activeTab, setActiveTab] = useState<'summary' | 'history' | 'tasks'>('summary');
  const [bookVisitLead, setBookVisitLead] = useState<Lead | null>(null);
  const [whatsAppLead, setWhatsAppLead] = useState<Lead | null>(null);

  const lead = leads?.find(l => l.id === leadId);
  
  if (!lead) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <h2 className="text-xl font-bold text-gray-900">Lead not found</h2>
        <Button variant="link" onClick={() => navigate(-1)}>Go back</Button>
      </div>
    );
  }

  const project = projects?.find(p => p.id === lead.projectId);
  const handoffTicket = lead.handoffTicketId ? handoffTickets.find(t => t.id === lead.handoffTicketId) : null;

  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5 text-gray-500" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{lead.name}</h1>
            <div className="flex items-center gap-2 text-sm text-gray-500">
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
          <div className="ml-auto flex items-center gap-3">
             <Badge variant={
              lead.stage === 'New (SLA)' ? 'destructive' : 
              lead.stage === 'Site Visit' ? 'success' : 
              lead.stage === 'Human Working' ? 'warning' : 'default'
            } className="text-sm px-3 py-1">
              {lead.stage}
            </Badge>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center gap-3">
          <Button className="flex-1 bg-green-600 hover:bg-green-700">
            <Phone className="mr-2 h-4 w-4" /> Call
          </Button>
          <Button 
            className="flex-1 bg-[#25D366] hover:bg-[#128C7E] text-white"
            onClick={() => setWhatsAppLead(lead)}
          >
            <MessageSquare className="mr-2 h-4 w-4" /> WhatsApp
          </Button>
          <Button variant="outline" className="flex-1" onClick={() => setBookVisitLead(lead)}>
            <Calendar className="mr-2 h-4 w-4" /> Book Visit
          </Button>
          <Button variant="outline" size="icon">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-white px-6">
        <button
          className={`border-b-2 py-3 px-4 text-sm font-medium transition-colors ${activeTab === 'summary' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('summary')}
        >
          Summary
        </button>
        <button
          className={`border-b-2 py-3 px-4 text-sm font-medium transition-colors ${activeTab === 'history' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('history')}
        >
          History & Logs
        </button>
        <button
          className={`border-b-2 py-3 px-4 text-sm font-medium transition-colors ${activeTab === 'tasks' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('tasks')}
        >
          Tasks
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
          {activeTab === 'summary' && (
            <div className="space-y-6">
              {/* Next Best Action */}
              <div className="rounded-xl border border-blue-100 bg-blue-50 p-6">
                <h3 className="text-lg font-semibold text-blue-900 flex items-center gap-2 mb-3">
                  <AlertCircle className="h-5 w-5" /> Next Action & User Expectations
                </h3>
                <p className="text-base text-blue-800 mb-4">
                  {lead.stage === 'New (SLA)' ? 'SLA breach imminent. Call immediately to qualify.' :
                   lead.stage === 'Human Working' ? `Handoff requested: ${handoffTicket?.reason || 'Review transcript and call back.'}` :
                   lead.stage === 'Site Visit' ? 'Send a WhatsApp reminder with location pin.' :
                   'Follow up to check interest.'}
                </p>
                {lead.stage === 'Human Working' && (
                  <div className="mt-2 p-3 bg-white rounded-lg border border-blue-100 mb-4">
                    <span className="text-xs font-bold text-blue-700 uppercase">Reason for Handoff:</span>
                    <p className="text-sm text-gray-800 mt-1">{handoffTicket?.reason || 'User requested human agent.'}</p>
                  </div>
                )}
                {lead.stage === 'Human Working' && (
                  <Button className="bg-blue-600 hover:bg-blue-700">Claim Handoff Ticket</Button>
                )}
              </div>

              {/* Extracted Fields */}
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">My AI Insights</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <div className="text-xs text-gray-500 uppercase font-medium mb-1">Project</div>
                    <div className="text-base font-medium text-gray-900">{project?.name || 'Unknown'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase font-medium mb-1">Language</div>
                    <div className="text-base font-medium text-gray-900">{lead.languagePreference}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase font-medium mb-1">Budget</div>
                    <div className="text-base font-medium text-gray-900">{lead.extracted.budgetBand || '-'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase font-medium mb-1">BHK Preference</div>
                    <div className="text-base font-medium text-gray-900">{lead.extracted.bhk || '-'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase font-medium mb-1">Timeline</div>
                    <div className="text-base font-medium text-gray-900">{lead.extracted.timeline || '-'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase font-medium mb-1">Loan Readiness</div>
                    <div className="text-base font-medium text-gray-900">{lead.extracted.loanReadiness || '-'}</div>
                  </div>
                </div>
                {lead.extracted.notes && (
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <div className="text-xs text-gray-500 uppercase font-medium mb-2">AI Call Summary</div>
                    <div className="text-sm text-gray-700 bg-gray-50 p-4 rounded-lg border border-gray-100 leading-relaxed">{lead.extracted.notes}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-6">
              {/* History Summary */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                  <div className="text-xs text-gray-500 uppercase font-bold mb-1">Total AI Attempts</div>
                  <div className="text-3xl font-bold text-gray-900">{lead.callHistory.filter(c => c.type === 'AI').length}</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                  <div className="text-xs text-gray-500 uppercase font-bold mb-1">User Attended</div>
                  <div className="text-3xl font-bold text-green-600">{lead.callHistory.filter(c => c.outcome === 'Connected').length}</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                  <div className="text-xs text-gray-500 uppercase font-bold mb-1">Messages Sent</div>
                  <div className="text-3xl font-bold text-blue-600">{lead.messages?.length || 0}</div>
                </div>
              </div>

              <div className="relative border-l-2 border-gray-200 ml-3 space-y-8 pb-8">
                {[
                  ...(lead.callHistory || []).map(c => ({ ...c, _type: 'call' as const, date: c.startedAt })),
                  ...(lead.messages || []).map(m => ({ ...m, _type: 'message' as const, date: m.sentAt }))
                ]
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((item, idx) => (
                  <div key={item.id} className="relative pl-8">
                    {item._type === 'call' ? (
                      <>
                        <div className="absolute -left-2.5 top-1.5 h-5 w-5 rounded-full border-4 border-white bg-blue-500 shadow-sm" />
                        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <Badge variant="outline" className="text-xs font-medium">{item.type} Call</Badge>
                              <span className="text-sm font-semibold text-gray-900">{item.outcome}</span>
                            </div>
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatTimeAgo(item.startedAt)}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 mb-3">Duration: {item.durationSec}s</div>
                          
                          {item.transcript && (
                            <div className="mt-3 space-y-2">
                              <div className="text-xs font-semibold text-gray-700 uppercase">Transcript Snippet</div>
                              <div className="rounded-lg bg-gray-50 p-3 text-sm text-gray-700 italic border border-gray-100">
                                "{item.transcript}"
                              </div>
                            </div>
                          )}

                          {item.outcome === 'Connected' && (
                            <div className="mt-4 pt-4 border-t border-gray-100">
                              <div className="flex items-center gap-3 bg-gray-50 rounded-full px-4 py-2 border border-gray-200 w-fit">
                                <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white cursor-pointer hover:bg-blue-700 transition-colors">
                                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                    <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                                  </svg>
                                </div>
                                <div className="h-1.5 w-32 bg-gray-300 rounded-full overflow-hidden">
                                  <div className="h-full w-1/3 bg-blue-500 rounded-full" />
                                </div>
                                <span className="text-xs font-mono text-gray-500">00:12 / 01:45</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="absolute -left-2.5 top-1.5 h-5 w-5 rounded-full border-4 border-white bg-[#25D366] shadow-sm" />
                        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <Badge variant="outline" className="text-xs font-medium bg-green-50 text-green-700 border-green-200">WhatsApp</Badge>
                              <span className="text-sm font-semibold text-gray-900">Sent</span>
                            </div>
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatTimeAgo(item.sentAt)}
                            </span>
                          </div>
                          
                          <div className="mt-2 space-y-2">
                            {item.templateUsed && (
                              <div className="text-xs text-gray-500">Template: {item.templateUsed}</div>
                            )}
                            <div className="rounded-lg bg-green-50 p-3 text-sm text-gray-800 border border-green-100 whitespace-pre-wrap">
                              {item.content}
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))}
                
                <div className="relative pl-8">
                  <div className="absolute -left-2.5 top-1.5 h-5 w-5 rounded-full border-4 border-white bg-gray-300" />
                  <div className="text-sm text-gray-500 font-medium">
                    Lead created via {lead.source} • {formatDateTime(lead.createdAt)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Tasks</h3>
                <Button variant="outline" className="border-dashed">
                  + Add Task
                </Button>
              </div>
              {lead.tasks.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-200 border-dashed">
                  <div className="mx-auto h-12 w-12 text-gray-300 mb-3">
                    <Calendar className="h-full w-full" />
                  </div>
                  <h3 className="text-sm font-medium text-gray-900">No tasks pending</h3>
                  <p className="text-sm text-gray-500 mt-1">Add a task to follow up with this lead.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {lead.tasks?.map(task => (
                    <div key={task.id} className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-4">
                        <div className="h-5 w-5 rounded-full border-2 border-gray-300 cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors" />
                        <div>
                          <div className="text-base font-medium text-gray-900">{task.title}</div>
                          <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                            <Clock className="h-3 w-3" />
                            Due {formatTimeAgo(task.dueAt)}
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">Edit</Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <BookVisitModal 
        lead={bookVisitLead} 
        onClose={() => setBookVisitLead(null)}
        onSuccess={() => setBookVisitLead(null)}
      />

      {whatsAppLead && (
        <WhatsAppModal 
          lead={whatsAppLead} 
          onClose={() => setWhatsAppLead(null)}
          onSuccess={() => setWhatsAppLead(null)}
        />
      )}
    </div>
  );
}
