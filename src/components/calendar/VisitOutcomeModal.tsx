import React, { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Visit, Task } from '@/types';
import { Star, Check, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface VisitOutcomeModalProps {
  visit: Visit | null;
  onClose: () => void;
  onSuccess: () => void;
}

const LIKED_ASPECTS_OPTIONS = [
  'Location', 'Price', 'Floor Plan', 'Amenities', 'Builder Reputation', 'Construction Quality'
];

const OBJECTIONS_OPTIONS = [
  'Price too high', 'Location too far', 'Small rooms', 'Possession delay', 'Loan issues', 'Vaastu'
];

const NEXT_STEP_OPTIONS = [
  { value: 'FollowUpCall', label: 'Follow-up Call' },
  { value: 'SendBrochure', label: 'Send Brochure/Details' },
  { value: 'Negotiation', label: 'Negotiation Meeting' },
  { value: 'SecondVisit', label: 'Second Visit' },
  { value: 'CloseWon', label: 'Close Won (Booking)' },
  { value: 'CloseLost', label: 'Close Lost' },
];

export function VisitOutcomeModal({ visit, onClose, onSuccess }: VisitOutcomeModalProps) {
  const { updateVisit, updateLead } = useStore();
  
  // Form State
  const [showedUp, setShowedUp] = useState<boolean | null>(null); // null = not selected yet
  const [noShowReason, setNoShowReason] = useState('');
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  
  const [interestLevel, setInterestLevel] = useState<number>(0);
  const [likedAspects, setLikedAspects] = useState<string[]>([]);
  const [objections, setObjections] = useState<string[]>([]);
  const [nextStep, setNextStep] = useState<string>('');
  const [notes, setNotes] = useState('');

  if (!visit) return null;

  const toggleSelection = (item: string, current: string[], setter: (val: string[]) => void) => {
    if (current.includes(item)) {
      setter(current.filter(i => i !== item));
    } else {
      setter([...current, item]);
    }
  };

  const handleSave = () => {
    if (showedUp === null) return;

    const updates: Partial<Visit> = {
      notes,
      updatedAt: new Date().toISOString(),
    };

    let leadUpdates: any = {};
    let newTask: Task | null = null;

    if (showedUp) {
      updates.status = 'Visited';
      updates.interestLevel = interestLevel as any;
      updates.likedAspects = likedAspects;
      updates.objections = objections;
      updates.nextStep = nextStep as any;

      // Logic for lead stage based on outcome
      if (nextStep === 'CloseWon') {
        leadUpdates.stage = 'Site Visit';
        leadUpdates.disposition = 'ClosedWon';
      } else if (nextStep === 'CloseLost') {
        leadUpdates.stage = 'Connected';
        leadUpdates.disposition = 'ClosedLost';
      } else if (nextStep === 'Negotiation') {
        leadUpdates.stage = 'Human Working';
      } else {
        leadUpdates.stage = 'Site Visit';
      }

      // Create Task based on next step
      if (nextStep && nextStep !== 'CloseLost' && nextStep !== 'CloseWon') {
        const taskTitleMap: Record<string, string> = {
          'FollowUpCall': 'Follow-up Call',
          'SendBrochure': 'Send Brochure',
          'Negotiation': 'Negotiation Meeting',
          'SecondVisit': 'Coordinate Second Visit',
        };
        
        newTask = {
          id: uuidv4(),
          title: taskTitleMap[nextStep] || 'Follow up',
          dueAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Due in 24h default
          status: 'Pending'
        };
      }

    } else {
      // Did not show up
      if (isRescheduling && newDate && newTime) {
        updates.status = 'Rescheduled';
        updates.scheduledAt = new Date(`${newDate}T${newTime}`).toISOString();
        updates.rescheduledAt = new Date().toISOString();
        // Stage remains Site Visit
        leadUpdates.stage = 'Site Visit';
      } else {
        updates.status = 'NoShow';
        updates.outcomeReason = noShowReason;
        leadUpdates.stage = 'Connected';
        
        // Create a task to follow up on no-show
        newTask = {
          id: uuidv4(),
          title: 'Follow up on No-Show',
          dueAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          status: 'Pending'
        };
      }
    }

    // Apply updates
    updateVisit(visit.id, updates);
    
    // We need to fetch the current lead to append the task
    // Since we can't easily get the lead here without passing it or using store selector,
    // we'll assume updateLead handles merging or we use the store to get it.
    // However, updateLead in useStore takes partial updates.
    // But to append a task, we need the current tasks.
    // Let's modify useStore to handle task addition or just do it here if we had the lead.
    // Since we don't have the lead object here, we rely on the store.
    // Wait, useStore's updateLead merges updates. It doesn't support functional updates for deep properties easily unless we implemented it that way.
    // Let's look at useStore again.
    // updateLead: (id, updates) => set((state) => ({ leads: state.leads?.map(...) }))
    // So if I pass { tasks: [...] }, it will overwrite tasks.
    // I need to get the current lead first.
    
    // Accessing store state directly to get the lead
    const state = useStore.getState();
    const currentLead = state.leads.find(l => l.id === visit.leadId);
    
    if (currentLead) {
      const finalLeadUpdates = { ...leadUpdates };
      if (newTask) {
        finalLeadUpdates.tasks = [newTask, ...currentLead.tasks];
      }
      updateLead(visit.leadId, finalLeadUpdates);
    }

    onSuccess();
  };

  return (
    <Dialog open={!!visit} onOpenChange={(open) => !open && onClose()}>
      <DialogHeader>
        <DialogTitle>Mark Visit Outcome</DialogTitle>
        <DialogDescription>Record the outcome of the scheduled site visit.</DialogDescription>
      </DialogHeader>

      <div className="space-y-6 py-4 max-h-[70vh] overflow-y-auto px-1">
        
        {/* 1. Showed Up? */}
        <div className="space-y-3">
          <Label className="text-base font-medium">Did the customer show up?</Label>
          <div className="flex gap-4">
            <button
              onClick={() => { setShowedUp(true); setIsRescheduling(false); }}
              className={`flex-1 p-4 rounded-lg border-2 flex items-center justify-center gap-2 transition-all ${
                showedUp === true 
                  ? 'border-green-600 bg-green-50 text-green-700' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Check className="w-5 h-5" />
              <span className="font-medium">Yes, Visited</span>
            </button>
            <button
              onClick={() => setShowedUp(false)}
              className={`flex-1 p-4 rounded-lg border-2 flex items-center justify-center gap-2 transition-all ${
                showedUp === false 
                  ? 'border-red-600 bg-red-50 text-red-700' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <X className="w-5 h-5" />
              <span className="font-medium">No Show</span>
            </button>
          </div>
        </div>

        {/* 2. Logic for Visited */}
        {showedUp === true && (
          <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
            
            {/* Interest Level */}
            <div className="space-y-2">
              <Label>Interest Level</Label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((level) => (
                  <button
                    key={level}
                    onClick={() => setInterestLevel(level)}
                    className={`p-2 rounded-full transition-all ${
                      interestLevel >= level ? 'text-yellow-500 scale-110' : 'text-gray-300 hover:text-yellow-200'
                    }`}
                  >
                    <Star className="w-8 h-8 fill-current" />
                  </button>
                ))}
              </div>
            </div>

            {/* Liked Aspects */}
            <div className="space-y-2">
              <Label>What did they like?</Label>
              <div className="flex flex-wrap gap-2">
                {LIKED_ASPECTS_OPTIONS.map(option => (
                  <button
                    key={option}
                    onClick={() => toggleSelection(option, likedAspects, setLikedAspects)}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                      likedAspects.includes(option)
                        ? 'bg-blue-100 border-blue-200 text-blue-800'
                        : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {/* Objections */}
            <div className="space-y-2">
              <Label>Objections / Concerns</Label>
              <div className="flex flex-wrap gap-2">
                {OBJECTIONS_OPTIONS.map(option => (
                  <button
                    key={option}
                    onClick={() => toggleSelection(option, objections, setObjections)}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                      objections.includes(option)
                        ? 'bg-orange-100 border-orange-200 text-orange-800'
                        : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {/* Next Step */}
            <div className="space-y-2">
              <Label>Next Step</Label>
              <Select value={nextStep} onChange={(e) => setNextStep(e.target.value)}>
                <option value="">Select next step...</option>
                {NEXT_STEP_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </Select>
            </div>
          </div>
        )}

        {/* 3. Logic for No Show */}
        {showedUp === false && (
          <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="space-y-2">
              <Label>Reason for No-Show</Label>
              <Select value={noShowReason} onChange={(e) => setNoShowReason(e.target.value)}>
                <option value="">Select reason...</option>
                <option value="Forgot">Forgot</option>
                <option value="Emergency">Emergency / Busy</option>
                <option value="Not Interested Anymore">Not Interested Anymore</option>
                <option value="Weather">Weather</option>
                <option value="Other">Other</option>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="reschedule" 
                checked={isRescheduling} 
                onChange={(e) => setIsRescheduling(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <Label htmlFor="reschedule" className="cursor-pointer">Reschedule this visit?</Label>
            </div>

            {isRescheduling && (
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                <div className="space-y-2">
                  <Label>New Date</Label>
                  <Input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>New Time</Label>
                  <Input type="time" value={newTime} onChange={(e) => setNewTime(e.target.value)} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Common: Notes */}
        {showedUp !== null && (
          <div className="space-y-2">
            <Label>Notes</Label>
            <textarea 
              className="w-full min-h-[100px] rounded-md border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Add any relevant notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        )}

      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleSave} 
          disabled={showedUp === null || (showedUp === true && !nextStep) || (showedUp === false && !noShowReason && !isRescheduling)}
          className={showedUp === false ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
        >
          Save Outcome
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
