import React, { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Lead, Visit, hasRole } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { Calendar as CalendarIcon, Clock, MapPin } from 'lucide-react';

interface BookVisitModalProps {
  lead: Lead | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function BookVisitModal({ lead, onClose, onSuccess }: BookVisitModalProps) {
  const { projects, users, addVisit, updateLead } = useStore();
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [coordinatorId, setCoordinatorId] = useState('');

  if (!lead) return null;

  const project = projects.find(p => p.id === lead.projectId);
  const coordinators = users.filter(u => hasRole(u, 'Coordinator') && u.assignedProjectIds?.includes(lead.projectId));

  const handleBook = () => {
    if (!date || !time) return;

    const scheduledAt = new Date(`${date}T${time}`).toISOString();
    
    const visit: Visit = {
      id: uuidv4(),
      leadId: lead.id,
      projectId: lead.projectId,
      scheduledAt,
      coordinatorUserId: coordinatorId || undefined,
      status: 'Booked',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    addVisit(visit);
    updateLead(lead.id, { stage: 'Site Visit' });
    onSuccess();
  };

  return (
    <Dialog open={!!lead} onOpenChange={(open) => !open && onClose()}>
      <DialogHeader>
        <DialogTitle>Book Site Visit</DialogTitle>
        <DialogDescription>Schedule a visit for {lead.name} at {project?.name}.</DialogDescription>
      </DialogHeader>

      <div className="space-y-6 py-4">
        <div className="rounded-lg bg-gray-50 p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <MapPin className="h-4 w-4 text-gray-500" />
            <span>{project?.visitAddress}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Clock className="h-4 w-4 text-gray-500" />
            <span>Timings: {project?.visitTimings}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
              <Input 
                id="date" 
                type="date" 
                className="pl-9" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="time">Time</Label>
            <div className="relative">
              <Clock className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
              <Input 
                id="time" 
                type="time" 
                className="pl-9"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="coordinator">Assign Coordinator (Optional)</Label>
          <Select 
            id="coordinator" 
            value={coordinatorId}
            onChange={(e) => setCoordinatorId(e.target.value)}
          >
            <option value="">Auto-assign later</option>
            {coordinators?.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Quick Slots</Label>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="cursor-pointer hover:bg-gray-100" onClick={() => {
              const tomorrow = new Date();
              tomorrow.setDate(tomorrow.getDate() + 1);
              setDate(tomorrow.toISOString().split('T')[0]);
              setTime('10:00');
            }}>Tomorrow Morning</Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-gray-100" onClick={() => {
              const saturday = new Date();
              saturday.setDate(saturday.getDate() + (6 - saturday.getDay()));
              setDate(saturday.toISOString().split('T')[0]);
              setTime('11:00');
            }}>This Saturday</Badge>
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={handleBook} disabled={!date || !time}>Confirm Booking</Button>
      </DialogFooter>
    </Dialog>
  );
}
