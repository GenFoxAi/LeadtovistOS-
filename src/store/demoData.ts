import { Lead, Project, User, Visit, HandoffTicket } from '../types';
import { v4 as uuidv4 } from 'uuid';

export const demoProjects: Project[] = [
  {
    id: 'p1',
    name: 'OMR Campus',
    cityArea: 'OMR',
    visitAddress: '123 IT Expressway, OMR, Chennai',
    visitTimings: '9:00 AM - 6:00 PM',
    factsSheet: {
      priceBands: '₹65L - ₹1.2Cr',
      bhkOptions: '2 BHK, 3 BHK',
      localityCoverage: 'Close to SIPCOT, Sholinganallur',
      possession: 'Dec 2025',
      offersAllowed: 'No direct discounts. Free modular kitchen on spot booking.',
      loanPartners: 'SBI, HDFC, ICICI',
    },
    brochures: ['omr_brochure.pdf', 'omr_floorplans.pdf'],
    aiAgentConfig: {
      scriptBlocks: 'Hello, this is the AI assistant from OMR Campus. Are you looking for a 2BHK or 3BHK?',
      guardrails: {
        priceBandsOnly: true,
        noAvailabilityCommitments: true,
        escalationPhrasing: true,
      },
    },
  },
  {
    id: 'p2',
    name: 'ECR Beach House',
    cityArea: 'ECR',
    visitAddress: '45 Sea View Road, ECR, Chennai',
    visitTimings: '10:00 AM - 5:00 PM',
    factsSheet: {
      priceBands: '₹2.5Cr - ₹5Cr',
      bhkOptions: '3 BHK, 4 BHK Villas',
      localityCoverage: 'Near Muttukadu Boat House',
      possession: 'Ready to Move',
      offersAllowed: 'Custom interior package available.',
      loanPartners: 'HDFC, Axis',
    },
    brochures: ['ecr_villas.pdf'],
    aiAgentConfig: {
      scriptBlocks: 'Welcome to ECR Beach House. Are you interested in our luxury sea-facing villas?',
      guardrails: {
        priceBandsOnly: true,
        noAvailabilityCommitments: true,
        escalationPhrasing: true,
      },
    },
  },
  {
    id: 'p3',
    name: 'Porur Heights',
    cityArea: 'Porur',
    visitAddress: '78 Mount Poonamallee Road, Porur, Chennai',
    visitTimings: '9:30 AM - 6:30 PM',
    factsSheet: {
      priceBands: '₹45L - ₹85L',
      bhkOptions: '1 BHK, 2 BHK, 3 BHK',
      localityCoverage: 'Near DLF Cybercity',
      possession: 'June 2026',
      offersAllowed: 'Early bird pricing available.',
      loanPartners: 'SBI, LIC HFL',
    },
    brochures: ['porur_heights.pdf'],
    aiAgentConfig: {
      scriptBlocks: 'Hi, calling from Porur Heights. Are you looking for an investment or to move in?',
      guardrails: {
        priceBandsOnly: true,
        noAvailabilityCommitments: true,
        escalationPhrasing: true,
      },
    },
  },
];

export const demoUsers: User[] = [
  { id: 'u1', name: 'Admin Arun', email: 'arun@example.com', phone: '+91 98765 00001', roles: ['Admin'], languages: ['English', 'Tamil'], assignedProjectIds: ['p1', 'p2', 'p3'], onlineStatus: 'Online' },
  { id: 'u2', name: 'Agent Balaji', email: 'balaji@example.com', phone: '+91 98765 00002', roles: ['Agent'], languages: ['Tamil'], assignedProjectIds: ['p1', 'p3'], onlineStatus: 'Online' },
  { id: 'u3', name: 'Agent Chitra', email: 'chitra@example.com', phone: '+91 98765 00003', roles: ['Agent'], languages: ['English', 'Tamil'], assignedProjectIds: ['p2'], onlineStatus: 'Busy' },
  { id: 'u4', name: 'Agent Dinesh', email: 'dinesh@example.com', phone: '+91 98765 00004', roles: ['Agent'], languages: ['English'], assignedProjectIds: ['p1', 'p2', 'p3'], onlineStatus: 'Offline' },
  { id: 'u5', name: 'Coord Ezhil', email: 'ezhil@example.com', phone: '+91 98765 00005', roles: ['Coordinator'], languages: ['Tamil'], assignedProjectIds: ['p1'], onlineStatus: 'Online' },
  { id: 'u6', name: 'Coord Fathima', email: 'fathima@example.com', phone: '+91 98765 00006', roles: ['Coordinator'], languages: ['English', 'Tamil'], assignedProjectIds: ['p2', 'p3'], onlineStatus: 'Online' },
  { id: 'u7', name: 'Super User', email: 'super@example.com', phone: '+91 98765 00007', roles: ['Admin', 'Agent', 'Coordinator'], languages: ['English', 'Tamil'], assignedProjectIds: ['p1', 'p2', 'p3'], onlineStatus: 'Online' },
];

const now = new Date();
const minusMinutes = (mins: number) => new Date(now.getTime() - mins * 60000).toISOString();
const plusMinutes = (mins: number) => new Date(now.getTime() + mins * 60000).toISOString();
const minusDays = (days: number) => new Date(now.getTime() - days * 86400000).toISOString();
const plusDays = (days: number) => new Date(now.getTime() + days * 86400000).toISOString();

export const demoLeads: Lead[] = [
  {
    id: 'l1', name: 'Karthik S', phone: '+91 9876543210', source: 'Meta Ads', projectId: 'p1', languagePreference: 'Tamil',
    stage: 'New (SLA)', createdAt: minusMinutes(2), slaDueAt: plusMinutes(3), priorityScore: 90,
    extracted: { budgetBand: '₹70L-80L', bhk: '2 BHK' }, doNotCall: false, tasks: [], callHistory: [], messages: []
  },
  {
    id: 'l2', name: 'Priya R', phone: '+91 9876543211', source: 'Website Direct', projectId: 'p2', languagePreference: 'English',
    stage: 'New (SLA)', createdAt: minusMinutes(4), slaDueAt: plusMinutes(1), priorityScore: 95,
    extracted: { budgetBand: '₹3Cr+', timeline: 'Immediate' }, doNotCall: false, tasks: [], callHistory: [], messages: []
  },
  {
    id: 'l3', name: 'Manoj K', phone: '+91 9876543212', source: 'Housing.com', projectId: 'p3', languagePreference: 'Auto',
    stage: 'New (SLA)', createdAt: minusMinutes(10), slaDueAt: minusMinutes(5), priorityScore: 85, // Overdue
    extracted: { bhk: '3 BHK' }, doNotCall: false, tasks: [], callHistory: [], messages: []
  },
  {
    id: 'l4', name: 'Suresh V', phone: '+91 9876543213', source: 'Referral', projectId: 'p1', languagePreference: 'Tamil',
    stage: 'Human Working', createdAt: minusDays(1), slaDueAt: minusDays(1), priorityScore: 80,
    extracted: { budgetBand: '₹65L', bhk: '2 BHK', notes: 'Wants to negotiate price.' }, doNotCall: false, handoffTicketId: 'ht1',
    tasks: [], callHistory: [{
      id: 'c1', leadId: 'l4', type: 'AI', startedAt: minusDays(1), endedAt: minusDays(1), durationSec: 120, outcome: 'Connected',
      transcript: 'AI: Hello... User: Can I get a discount? AI: I will have my team confirm exact details on WhatsApp.',
      nextAction: 'Handoff'
    }], messages: []
  },
  {
    id: 'l5', name: 'Anitha M', phone: '+91 9876543214', source: 'Meta Ads', projectId: 'p3', languagePreference: 'Tamil',
    stage: 'Connected', disposition: 'NotInterested', createdAt: minusDays(2), slaDueAt: minusDays(2), priorityScore: 10,
    extracted: {}, doNotCall: true, optOutReason: 'Not looking anymore', tasks: [], callHistory: [], messages: []
  },
  {
    id: 'l6', name: 'Ramesh P', phone: '+91 9876543215', source: 'Website Direct', projectId: 'p1', languagePreference: 'English',
    stage: 'Site Visit', createdAt: minusDays(3), slaDueAt: minusDays(3), priorityScore: 100,
    extracted: { budgetBand: '₹1Cr', bhk: '3 BHK', timeline: '3 months', loanReadiness: 'Pre-approved' }, doNotCall: false,
    tasks: [], callHistory: [], messages: []
  },
  {
    id: 'l7', name: 'Deepa N', phone: '+91 9876543216', source: 'Housing.com', projectId: 'p2', languagePreference: 'Tamil',
    stage: 'Site Visit', createdAt: minusDays(4), slaDueAt: minusDays(4), priorityScore: 95,
    extracted: { budgetBand: '₹4Cr', bhk: '4 BHK Villa' }, doNotCall: false,
    tasks: [], callHistory: [], messages: []
  },
  {
    id: 'l8', name: 'Ganesh T', phone: '+91 9876543217', source: 'Missed Call', projectId: 'p3', languagePreference: 'Auto',
    stage: 'Attempting', createdAt: minusDays(1), slaDueAt: minusDays(1), priorityScore: 60,
    extracted: {}, doNotCall: false, tasks: [], callHistory: [{
      id: 'c2', leadId: 'l8', type: 'AI', startedAt: minusDays(1), endedAt: minusDays(1), durationSec: 15, outcome: 'NoAnswer', nextAction: 'CallLater'
    }], messages: []
  },
  {
    id: 'l9', name: 'Kavitha B', phone: '+91 9876543218', source: 'Meta Ads', projectId: 'p1', languagePreference: 'English',
    stage: 'Site Visit', createdAt: minusDays(5), slaDueAt: minusDays(5), priorityScore: 90,
    extracted: { bhk: '2 BHK', timeline: 'Immediate' }, doNotCall: false, tasks: [], callHistory: [], messages: []
  },
  {
    id: 'l10', name: 'Vignesh R', phone: '+91 9876543219', source: 'Referral', projectId: 'p2', languagePreference: 'Tamil',
    stage: 'Site Visit', createdAt: minusDays(6), slaDueAt: minusDays(6), priorityScore: 85,
    extracted: { budgetBand: '₹3.5Cr' }, doNotCall: false, tasks: [], callHistory: [], messages: []
  },
  {
    id: 'l11', name: 'Lakshmi S', phone: '+91 9876543220', source: 'Website Direct', projectId: 'p3', languagePreference: 'Auto',
    stage: 'Site Visit', createdAt: minusDays(7), slaDueAt: minusDays(7), priorityScore: 80,
    extracted: { bhk: '1 BHK' }, doNotCall: false, tasks: [], callHistory: [], messages: []
  },
  // Add more unreached and contacted leads to make it 25+
];

for (let i = 12; i <= 26; i++) {
  demoLeads.push({
    id: `l${i}`, name: `Lead ${i}`, phone: `+91 98765432${i}`, source: 'Meta Ads', projectId: i % 2 === 0 ? 'p1' : 'p3', languagePreference: 'Auto',
    stage: i % 3 === 0 ? 'Attempting' : 'Connected', createdAt: minusDays(i % 5), slaDueAt: minusDays(i % 5), priorityScore: 50 + i,
    extracted: {}, doNotCall: false, tasks: [], callHistory: [], messages: []
  });
}

export const demoHandoffTickets: HandoffTicket[] = [
  { id: 'ht1', leadId: 'l4', reason: 'Negotiation', createdAt: minusDays(1), status: 'Open', slaDueAt: plusMinutes(10) }
];

export const demoVisits: Visit[] = [
  { id: 'v1', leadId: 'l6', projectId: 'p1', scheduledAt: plusDays(1), coordinatorUserId: 'u5', status: 'Booked', createdAt: minusDays(3), updatedAt: minusDays(3) },
  { id: 'v2', leadId: 'l7', projectId: 'p2', scheduledAt: plusDays(2), coordinatorUserId: 'u6', status: 'Booked', createdAt: minusDays(4), updatedAt: minusDays(4) },
  { id: 'v3', leadId: 'l9', projectId: 'p1', scheduledAt: minusMinutes(30), coordinatorUserId: 'u5', status: 'Booked', createdAt: minusDays(5), updatedAt: minusDays(5) }, // Past visit, needs outcome
  { id: 'v4', leadId: 'l10', projectId: 'p2', scheduledAt: plusMinutes(120), coordinatorUserId: 'u6', status: 'Booked', createdAt: minusDays(6), updatedAt: minusDays(6) },
  { id: 'v5', leadId: 'l11', projectId: 'p3', scheduledAt: plusDays(3), coordinatorUserId: 'u6', status: 'Booked', createdAt: minusDays(7), updatedAt: minusDays(7) },
];
