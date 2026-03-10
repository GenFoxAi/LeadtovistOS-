import React, { useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Clock, Users, CheckCircle2, Calendar as CalendarIcon, TrendingUp, AlertCircle, Phone } from 'lucide-react';
import { formatTimeAgo } from '@/lib/utils';

export default function Dashboard() {
  const { leads, visits, queueState, activeProjectId } = useStore();

  const filteredLeads = useMemo(() => {
    if (activeProjectId === 'all') return leads;
    return leads.filter(l => l.projectId === activeProjectId);
  }, [leads, activeProjectId]);

  const filteredVisits = useMemo(() => {
    if (activeProjectId === 'all') return visits;
    return visits.filter(v => v.projectId === activeProjectId);
  }, [visits, activeProjectId]);

  const stats = useMemo(() => {
    const totalLeads = filteredLeads.length;
    const slaBreached = filteredLeads.filter(l => l.stage === 'New (SLA)' && new Date(l.slaDueAt).getTime() < Date.now()).length;
    const slaMetPercent = totalLeads > 0 ? Math.round(((totalLeads - slaBreached) / totalLeads) * 100) : 100;

    const contactedLeads = filteredLeads.filter(l => l.callHistory.some(c => c.outcome === 'Connected')).length;
    const contactRate = totalLeads > 0 ? Math.round((contactedLeads / totalLeads) * 100) : 0;

    const qualifiedLeads = filteredLeads.filter(l => l.extracted.budgetBand || l.extracted.bhk).length;
    const qualifiedRate = contactedLeads > 0 ? Math.round((qualifiedLeads / contactedLeads) * 100) : 0;

    const totalVisits = filteredVisits.length;
    const showedUpVisits = filteredVisits.filter(v => v.status === 'Visited').length;
    const showUpRate = totalVisits > 0 ? Math.round((showedUpVisits / totalVisits) * 100) : 0;

    return { slaMetPercent, contactRate, qualifiedRate, totalVisits, showUpRate, slaBreached };
  }, [filteredLeads, filteredVisits]);

  const chartData = [
    { name: 'Mon', leads: 12, visits: 2 },
    { name: 'Tue', leads: 19, visits: 4 },
    { name: 'Wed', leads: 15, visits: 3 },
    { name: 'Thu', leads: 22, visits: 6 },
    { name: 'Fri', leads: 28, visits: 8 },
    { name: 'Sat', leads: 35, visits: 12 },
    { name: 'Sun', leads: 42, visits: 15 },
  ];

  return (
    <div className="flex h-full w-full flex-col bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Manager Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Overview of your team's performance</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">Estimated Cost</div>
            <div className="text-lg font-bold text-gray-900">₹4,250</div>
          </div>
          <div className="h-10 w-px bg-gray-200" />
          <div className="text-right">
            <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">Cost per Visit</div>
            <div className="text-lg font-bold text-blue-600">₹{stats.totalVisits > 0 ? Math.round(4250 / stats.totalVisits) : 0}</div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        
        {/* KPI Tiles */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-5 flex flex-col justify-between h-full">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-medium text-gray-500">SLA Met</div>
                <Clock className={`h-5 w-5 ${stats.slaMetPercent < 90 ? 'text-red-500' : 'text-green-500'}`} />
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">{stats.slaMetPercent}%</div>
                <div className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  {stats.slaBreached > 0 && <><AlertCircle className="h-3 w-3" /> {stats.slaBreached} breached</>}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 flex flex-col justify-between h-full">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-medium text-gray-500">Contact Rate</div>
                <Users className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">{stats.contactRate}%</div>
                <div className="text-xs text-gray-500 mt-1">+5% from last week</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 flex flex-col justify-between h-full">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-medium text-gray-500">Qualified Rate</div>
                <CheckCircle2 className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">{stats.qualifiedRate}%</div>
                <div className="text-xs text-gray-500 mt-1">Of contacted leads</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 flex flex-col justify-between h-full">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-medium text-gray-500">Visits Booked</div>
                <CalendarIcon className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">{stats.totalVisits}</div>
                <div className="text-xs text-gray-500 mt-1">This month</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 flex flex-col justify-between h-full">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-medium text-gray-500">Show-up Rate</div>
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">{stats.showUpRate}%</div>
                <div className="text-xs text-gray-500 mt-1">Of scheduled visits</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Lead Volume vs Visits Booked</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                  <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="leads" fill="#3b82f6" radius={[4, 4, 0, 0]} name="New Leads" />
                  <Bar dataKey="visits" fill="#f97316" radius={[4, 4, 0, 0]} name="Visits Booked" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>AI Calling Performance</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                  <Tooltip cursor={{ stroke: '#9ca3af', strokeWidth: 1, strokeDasharray: '3 3' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Line type="monotone" dataKey="leads" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} name="AI Attempts" />
                  <Line type="monotone" dataKey="visits" stroke="#10b981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} name="AI Connected" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {queueState?.recentOutcomes?.slice(0, 5).map((outcome, idx) => (
                <div key={idx} className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center gap-4">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${outcome.outcome === 'Connected' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
                      {outcome.outcome === 'Connected' ? <Phone className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">AI called {outcome.name}</p>
                      <p className="text-xs text-gray-500">Outcome: {outcome.outcome}</p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">{outcome.time}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
