import React, { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Dialog, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Lead, MessageRecord } from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface WhatsAppModalProps {
  lead: Lead | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function WhatsAppModal({ lead, onClose, onSuccess }: WhatsAppModalProps) {
  const { whatsAppConfig, updateLead, projects } = useStore();
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [messageContent, setMessageContent] = useState('');

  const project = projects.find(p => p.id === lead?.projectId);

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplateId(templateId);
    const template = whatsAppConfig.templates.find(t => t.id === templateId);
    if (template && lead) {
      let content = template.content;
      // Simple variable replacement
      content = content.replace('{{name}}', lead.name);
      content = content.replace('{{project}}', project?.name || 'our project');
      content = content.replace('{{link}}', 'https://example.com/brochure'); // Mock link
      content = content.replace('{{time}}', 'tomorrow at 10 AM'); // Mock time
      setMessageContent(content);
    }
  };

  const handleSend = () => {
    if (!lead || !messageContent) return;

    const newMessage: MessageRecord = {
      id: uuidv4(),
      type: 'WhatsApp',
      sentAt: new Date().toISOString(),
      templateUsed: whatsAppConfig.templates.find(t => t.id === selectedTemplateId)?.name,
      content: messageContent
    };

    updateLead(lead.id, {
      messages: [...(lead.messages || []), newMessage]
    });

    onSuccess();
  };

  return (
    <Dialog open={!!lead} onOpenChange={(open) => !open && onClose()}>
      <DialogHeader>
        <DialogTitle>Send WhatsApp Message</DialogTitle>
        <DialogDescription>
          Send a template message to {lead?.name} ({lead?.phone}).
        </DialogDescription>
      </DialogHeader>
      
      <div className="grid gap-4 py-4">
        <div className="space-y-2">
          <Label>Select Template</Label>
          <select 
            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={selectedTemplateId}
            onChange={(e) => handleTemplateChange(e.target.value)}
          >
            <option value="" disabled>Select a template...</option>
            {whatsAppConfig.templates.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label>Message Preview</Label>
          <Textarea 
            value={messageContent} 
            onChange={(e) => setMessageContent(e.target.value)}
            className="min-h-[120px]"
          />
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSend} disabled={!messageContent} className="bg-[#25D366] hover:bg-[#128C7E]">
          Send WhatsApp
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
