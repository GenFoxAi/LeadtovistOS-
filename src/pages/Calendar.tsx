import React, { useState, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, Clock, MapPin, Phone, User, AlertCircle } from 'lucide-react';
import { formatDateTime, formatTimeAgo } from '@/lib/utils';
import { VisitOutcomeModal } from '@/components/calendar/VisitOutcomeModal';
import { Visit, hasRole } from '@/types';

export default function Calendar() {
  const { visits, leads, projects, currentUser } = useStore();
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  const [view, setView] = useState<'today' | 'week'>('today');

  const now = new Date();
  
  const upcomingVisits = useMemo(() => {
    if (!visits) return [];
    return visits
      .filter(v => v.status === 'Booked')
      .filter(v => {
        if (hasRole(currentUser, 'Coordinator') && !hasRole(currentUser, 'Admin')) {
          return v.coordinatorUserId === currentUser?.id || !v.coordinatorUserId;
        }
        return true;
      })
      .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
  }, [visits, currentUser]);

  const pendingOutcomes = useMemo(() => {
    return upcomingVisits.filter(v => new Date(v.scheduledAt).getTime() < now.getTime());
  }, [upcomingVisits, now]);

  return (
    <div className="flex h-full w-full flex-col bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Site Visits</h1>
          <p className="text-sm text-gray-500 mt-1">Manage site visits and outcomes</p>
        </div>
        <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
          <button 
            className={`px-4 py-1.5 text-sm font-medium rounded-md ${view === 'today' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setView('today')}
          >
            Today
          </button>
          <button 
            className={`px-4 py-1.5 text-sm font-medium rounded-md ${view === 'week' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setView('week')}
          >
            Week
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {pendingOutcomes.length > 0 && (
          <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 flex items-start gap-4">
            <div className="rounded-full bg-orange-100 p-2 text-orange-600">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-orange-900">Outcomes Pending</h3>
              <p className="text-sm text-orange-800 mt-1">
                {pendingOutcomes.length} visit(s) have passed their scheduled time. Please mark their outcomes.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-blue-600" />
              Upcoming Visits
            </h2>
            
            {upcomingVisits.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-gray-500">
                No upcoming visits scheduled.
              </div>
            ) : (
              upcomingVisits.map(visit => {
                const lead = leads.find(l => l.id === visit.leadId);
                const project = projects.find(p => p.id === visit.projectId);
                const isPast = new Date(visit.scheduledAt).getTime() < now.getTime();

                if (!lead || !project) return null;

                return (
                  <Card key={visit.id} className={`overflow-hidden transition-shadow hover:shadow-md ${isPast ? 'border-orange-200 bg-orange-50/30' : ''}`}>
                    <div className={`h-1 w-full ${isPast ? 'bg-orange-400' : 'bg-blue-500'}`} />
                    <CardContent className="p-5">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{lead.name}</h3>
                          <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                            <Phone className="h-3 w-3" /> {lead.phone}
                          </div>
                        </div>
                        <Badge variant={isPast ? "warning" : "default"}>
                          {isPast ? 'Pending Outcome' : 'Scheduled'}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="space-y-1">
                          <div className="text-xs text-gray-500 flex items-center gap-1"><Clock className="h-3 w-3" /> Time</div>
                          <div className="text-sm font-medium">{formatDateTime(visit.scheduledAt)}</div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-xs text-gray-500 flex items-center gap-1"><MapPin className="h-3 w-3" /> Project</div>
                          <div className="text-sm font-medium">{project.name}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                        {isPast ? (
                          hasRole(currentUser, 'Coordinator') ? (
                            <Button className="w-full bg-orange-600 hover:bg-orange-700" onClick={() => setSelectedVisit(visit)}>
                              Mark Outcome
                            </Button>
                          ) : (
                            <div className="w-full group relative">
                              <Button disabled className="w-full bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed hover:bg-gray-100">
                                Mark Outcome
                              </Button>
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                Coordinator only
                              </div>
                            </div>
                          )
                        ) : (
                          <>
                            <Button variant="outline" className="flex-1">Send Reminder</Button>
                            <Button variant="outline" className="flex-1" onClick={() => setSelectedVisit(visit)}>Reschedule</Button>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <User className="h-5 w-5 text-purple-600" />
              Recent Outcomes
            </h2>
            
            {visits?.filter(v => v.status !== 'Booked').slice(0, 5).map(visit => {
              const lead = leads?.find(l => l.id === visit.leadId);
              const project = projects?.find(p => p.id === visit.projectId);
              
              if (!lead || !project) return null;

              return (
                <div key={visit.id} className="rounded-xl border border-gray-200 bg-white p-4 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">{lead.name}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">{project.name} • {formatTimeAgo(visit.updatedAt)}</p>
                  </div>
                  <Badge variant={visit.status === 'Visited' ? 'success' : 'secondary'}>
                    {visit.status}
                  </Badge>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <VisitOutcomeModal 
        visit={selectedVisit} 
        onClose={() => setSelectedVisit(null)} 
        onSuccess={() => setSelectedVisit(null)} 
      />
    </div>
  );
}
