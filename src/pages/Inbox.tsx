import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { BookVisitModal } from '@/components/inbox/BookVisitModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Phone, MessageSquare, Calendar, MoreHorizontal, AlertCircle, Clock, Inbox as InboxIcon, User } from 'lucide-react';
import { Lead, hasRole } from '@/types';
import { formatTimeAgo } from '@/lib/utils';
import { cn } from '@/lib/utils';

export default function Inbox() {
  const navigate = useNavigate();
  const { leads, projects, currentUser, handoffTickets, users, activeProjectId, setActiveProjectId } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [bookVisitLead, setBookVisitLead] = useState<Lead | null>(null);

  const filteredLeads = useMemo(() => {
    if (!leads) return [];
    return leads.filter(lead => {
      // Only show Human Working leads in the Human Inbox
      if (lead.stage !== 'Human Working') return false;

      // Role-based filtering (Agents only see their assigned projects)
      if (hasRole(currentUser, 'Agent') && !hasRole(currentUser, 'Admin') && !currentUser?.assignedProjectIds?.includes(lead.projectId)) {
        return false;
      }
      
      const matchesSearch = lead.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            lead.phone.includes(searchQuery);
      const matchesProject = activeProjectId === 'all' || lead.projectId === activeProjectId;
      
      return matchesSearch && matchesProject;
    }).sort((a, b) => {
      // Prioritize leads assigned to current user
      const ticketA = a.handoffTicketId ? handoffTickets.find(t => t.id === a.handoffTicketId) : null;
      const ticketB = b.handoffTicketId ? handoffTickets.find(t => t.id === b.handoffTicketId) : null;
      const assignedToMeA = ticketA?.assignedToUserId === currentUser?.id;
      const assignedToMeB = ticketB?.assignedToUserId === currentUser?.id;
      
      if (assignedToMeA && !assignedToMeB) return -1;
      if (!assignedToMeA && assignedToMeB) return 1;
      
      return b.priorityScore - a.priorityScore;
    });
  }, [leads, searchQuery, activeProjectId, currentUser, handoffTickets]);

  return (
    <div className="flex h-full w-full overflow-hidden bg-white">
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between bg-white z-10">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">My Leads</h1>
            <p className="text-sm text-gray-500 mt-1">Leads escalated from AI requiring your attention</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Search leads..." 
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
            <Button variant="outline" size="sm" className="h-9">
              <Filter className="h-4 w-4 mr-2" /> Filter
            </Button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30">
          {filteredLeads.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-4">
              <div className="rounded-full bg-gray-100 p-4">
                <InboxIcon className="h-8 w-8 text-gray-400" />
              </div>
              <p>No leads requiring human attention right now.</p>
            </div>
          ) : (
            <div className="space-y-3 max-w-5xl mx-auto">
              {filteredLeads.map(lead => {
                const project = projects.find(p => p.id === lead.projectId);
                const ticket = lead.handoffTicketId ? handoffTickets.find(t => t.id === lead.handoffTicketId) : null;
                const assignedUser = ticket?.assignedToUserId ? users.find(u => u.id === ticket.assignedToUserId) : null;
                const isAssignedToMe = assignedUser?.id === currentUser?.id;
                
                return (
                  <div 
                    key={lead.id}
                    onClick={() => navigate(`/leads/${lead.id}`)}
                    className={cn(
                      "group relative flex items-center justify-between rounded-xl border p-4 shadow-sm transition-all hover:shadow-md cursor-pointer",
                      isAssignedToMe 
                        ? "border-blue-200 bg-blue-50/30 hover:border-blue-300" 
                        : "border-orange-200 bg-orange-50/30 hover:border-orange-300"
                    )}
                  >
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className={cn(
                        "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full font-semibold",
                        isAssignedToMe ? "bg-blue-100 text-blue-600" : "bg-orange-100 text-orange-600"
                      )}>
                        {lead.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-semibold text-gray-900 truncate">{lead.name}</h3>
                          <span className="text-[10px] px-1.5 py-0.5 rounded border border-orange-200 bg-orange-50 text-orange-700 font-medium flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" /> Human Working
                          </span>
                          {isAssignedToMe && (
                             <span className="text-[10px] px-1.5 py-0.5 rounded border border-blue-200 bg-blue-50 text-blue-700 font-medium flex items-center gap-1">
                                <User className="h-3 w-3" /> Assigned to You
                             </span>
                          )}
                          {!isAssignedToMe && assignedUser && (
                             <span className="text-[10px] px-1.5 py-0.5 rounded border border-gray-200 bg-gray-50 text-gray-600 font-medium flex items-center gap-1">
                                <User className="h-3 w-3" /> {assignedUser.name}
                             </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                          <span>{lead.phone}</span>
                          <span>•</span>
                          <span className="truncate max-w-[120px]">{project?.name}</span>
                          <span>•</span>
                          <span>Escalated {formatTimeAgo(lead.updatedAt || lead.createdAt)}</span>
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
          )}
        </div>
      </div>

      {/* Overlays */}
      <BookVisitModal 
        lead={bookVisitLead} 
        onClose={() => setBookVisitLead(null)}
        onSuccess={() => setBookVisitLead(null)}
      />
    </div>
  );
}
