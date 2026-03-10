import React, { useState, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Filter, Phone, Calendar, User as UserIcon } from 'lucide-react';
import { Stage } from '@/types';

export default function Leads() {
  const navigate = useNavigate();
  const { leads, projects, activeProjectId } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<Stage | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'dnd' | 'optout'>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      // Project Scope
      if (activeProjectId !== 'all' && lead.projectId !== activeProjectId) {
        return false;
      }
      if (activeProjectId === 'all' && projectFilter !== 'all' && lead.projectId !== projectFilter) {
        return false;
      }

      // Search
      const query = searchQuery.toLowerCase();
      if (query && !lead.name.toLowerCase().includes(query) && !lead.phone.includes(query)) {
        return false;
      }

      // Stage
      if (stageFilter !== 'all' && lead.stage !== stageFilter) {
        return false;
      }

      // Status (DND/OptOut)
      if (statusFilter === 'active') {
        if (lead.doNotCall || lead.optOutReason) return false;
      } else if (statusFilter === 'dnd') {
        if (!lead.doNotCall) return false;
      } else if (statusFilter === 'optout') {
        if (!lead.optOutReason) return false;
      }

      return true;
    });
  }, [leads, activeProjectId, searchQuery, stageFilter, statusFilter, projectFilter]);

  const getProjectName = (id: string) => {
    return projects.find((p) => p.id === id)?.name || id;
  };

  const getStageColor = (stage: Stage) => {
    switch (stage) {
      case 'New (SLA)': return 'bg-blue-100 text-blue-800';
      case 'Attempting': return 'bg-yellow-100 text-yellow-800';
      case 'Connected': return 'bg-purple-100 text-purple-800';
      case 'Site Visit': return 'bg-green-100 text-green-800';
      case 'Human Working': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="border-b bg-white px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
          <div className="text-sm text-gray-500">
            Showing {filteredLeads.length} leads
          </div>
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search name or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>

          <Select 
            value={stageFilter} 
            onChange={(e) => setStageFilter(e.target.value as Stage | 'all')}
            className="w-[180px]"
          >
            <option value="all">All Stages</option>
            <option value="New (SLA)">New (SLA)</option>
            <option value="Attempting">Attempting</option>
            <option value="Connected">Connected</option>
            <option value="Human Working">Human Working</option>
            <option value="Site Visit">Site Visit</option>
          </Select>

          <Select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="w-[180px]"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="dnd">Do Not Call</option>
            <option value="optout">Opted Out</option>
          </Select>

          {activeProjectId === 'all' && (
            <Select 
              value={projectFilter} 
              onChange={(e) => setProjectFilter(e.target.value)}
              className="w-[180px]"
            >
              <option value="all">All Projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </Select>
          )}

          <Button 
            variant="outline" 
            onClick={() => {
              setSearchQuery('');
              setStageFilter('all');
              setStatusFilter('all');
              setProjectFilter('all');
            }}
            className="ml-auto"
          >
            Clear Filters
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 font-medium border-b">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Stage</th>
                <th className="px-4 py-3">Status</th>
                {activeProjectId === 'all' && <th className="px-4 py-3">Project</th>}
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    No leads found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">{lead.name}</span>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Phone className="h-3 w-3" />
                          {lead.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={getStageColor(lead.stage)} variant="secondary">
                        {lead.stage}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      {lead.doNotCall ? (
                        <Badge variant="destructive" className="text-[10px]">DND</Badge>
                      ) : lead.optOutReason ? (
                        <Badge variant="outline" className="text-gray-500 text-[10px]">OptOut</Badge>
                      ) : (
                        <span className="text-green-600 text-xs font-medium">Active</span>
                      )}
                    </td>
                    {activeProjectId === 'all' && (
                      <td className="px-4 py-3 text-gray-600">
                        {getProjectName(lead.projectId)}
                      </td>
                    )}
                    <td className="px-4 py-3 text-gray-600">{lead.source}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => navigate(`/leads/${lead.id}`)}
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
