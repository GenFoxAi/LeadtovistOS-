export type Role = 'Admin' | 'Agent' | 'Coordinator';

export type Stage = 'New (SLA)' | 'Attempting' | 'Connected' | 'Human Working' | 'Site Visit';

export type LanguagePreference = 'Auto' | 'Tamil' | 'English';

export type RoutingStrategy = 'RoundRobin';

export interface RoutingConfig {
  strategy: RoutingStrategy;
  roundRobinIndexByProject: Record<string, number>;
}

export interface Task {
  id: string;
  title: string;
  dueAt: string;
  status: 'Pending' | 'Completed' | 'Snoozed';
}

export interface CallRecord {
  id: string;
  leadId: string;
  type: 'AI' | 'Human';
  startedAt: string;
  endedAt: string;
  durationSec: number;
  outcome: 'Connected' | 'NoAnswer' | 'Busy' | 'SwitchedOff' | 'Invalid' | 'DND' | 'OptOut';
  recordingUrl?: string;
  transcript?: string;
  aiSummary?: string;
  extractedFieldsDelta?: Partial<Lead['extracted']>;
  nextAction?: 'CallLater' | 'SendBrochure' | 'BookVisit' | 'Handoff' | 'MarkNotInterested';
  retryScheduledAt?: string;
}

export interface MessageRecord {
  id: string;
  type: 'WhatsApp' | 'SMS' | 'Email';
  sentAt: string;
  templateUsed?: string;
  content: string;
}

export interface WhatsAppTemplate {
  id: string;
  name: string;
  content: string;
}

export interface WhatsAppConfig {
  businessNumber: string;
  templates: WhatsAppTemplate[];
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  altPhone?: string;
  source: string;
  projectId: string;
  languagePreference: LanguagePreference;
  stage: Stage;
  disposition?: 'NotInterested' | 'OptOut' | 'Invalid' | 'ClosedLost' | 'ClosedWon';
  createdAt: string;
  lastContactAt?: string;
  slaDueAt: string;
  priorityScore: number;
  extracted: {
    budgetBand?: string;
    locality?: string;
    bhk?: string;
    timeline?: string;
    loanReadiness?: string;
    notes?: string;
  };
  doNotCall: boolean;
  optOutReason?: string;
  tasks: Task[];
  callHistory: CallRecord[];
  messages: MessageRecord[];
  handoffTicketId?: string;
}

export interface HandoffTicket {
  id: string;
  leadId: string;
  reason: string;
  createdAt: string;
  status: 'Open' | 'Claimed' | 'Closed';
  assignedToUserId?: string;
  ringStartAt?: string;
  ringEndAt?: string;
  slaDueAt: string;
}

export interface Visit {
  id: string;
  leadId: string;
  projectId: string;
  scheduledAt: string;
  coordinatorUserId?: string;
  status: 'Booked' | 'Visited' | 'NoShow' | 'Rescheduled';
  outcomeReason?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  // Outcome fields
  interestLevel?: 1 | 2 | 3 | 4 | 5;
  likedAspects?: string[];
  objections?: string[];
  nextStep?: 'FollowUpCall' | 'SendBrochure' | 'Negotiation' | 'SecondVisit' | 'CloseLost' | 'CloseWon';
  rescheduledAt?: string;
}

export interface InboundCallRecord {
  id: string;
  phone: string;
  receivedAt: string;
  projectId: string;
  matchedLeadId?: string;
  status: 'New' | 'CallbackQueued' | 'Closed';
}

export interface ProjectConfig {
  leadSources: string[];
  callingConfig: {
    window: CallingWindow;
    slaTargetMins: number;
    retryPreset: number;
    maxAiAttempts: number;
    ringDuration: number;
  };
  complianceConfig: {
    recordingNotice: boolean;
    dndSkip: boolean;
    consentAware: boolean;
    skipBlocked: boolean;
  };
  whatsAppConfig: {
    enabled: boolean;
    businessNumber?: string;
    templates: {
      brochure: boolean;
      visitConfirmation: boolean;
      visitReminder: boolean;
      missedVisit: boolean;
    };
  };
  inboundConfig: {
    enabled: boolean;
    callbackSlaMins: number;
    unknownNumberBehavior: 'CreateLead' | 'CallbackQueue';
  };
}

export interface Project {
  id: string;
  name: string;
  cityArea: string;
  visitAddress: string;
  visitTimings: string;
  reraNumber?: string;
  usp?: string[];
  amenities?: string[];
  inventory?: {
    lastUpdatedAt?: string;
    rowCount?: number;
    fileName?: string;
  };
  factsSheet: {
    priceBands: string;
    bhkOptions: string;
    localityCoverage: string;
    possession: string;
    offersAllowed: string;
    loanPartners?: string;
  };
  brochures: string[];
  aiAgentConfig: {
    scriptBlocks: string;
    guardrails: {
      priceBandsOnly: boolean;
      noAvailabilityCommitments: boolean;
      escalationPhrasing: boolean;
    };
  };
  config?: ProjectConfig;
}

export interface OnboardingDraft {
  step: number;
  project: Partial<Project>;
  teamMembers: {
    name: string;
    email: string;
    phone: string;
    roles: Role[];
    dailyLimit?: number;
  }[];
  routingStrategy: 'RoundRobin';
  config: ProjectConfig;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  roles: Role[];
  languages: string[];
  assignedProjectIds: string[];
  onlineStatus: 'Online' | 'Offline' | 'Busy';
  dailyLeadLimit?: number;
}

export const hasRole = (user: User | null | undefined, role: Role): boolean => {
  if (!user || !user.roles) return false;
  return user.roles.includes(role);
};

export const hasAnyRole = (user: User | null | undefined, roles: Role[]): boolean => {
  if (!user || !user.roles) return false;
  return roles.some(r => user.roles.includes(r));
};

export interface CallingWindow {
  daysOfWeek: number[]; // 0=Sun, 1=Mon, ..., 6=Sat
  startTime: string; // HH:MM
  endTime: string; // HH:MM
}

export interface QueueState {
  isRunning: boolean;
  mode: 'AI' | 'Hybrid' | 'Manual';
  buckets: {
    newSla: boolean;
    hot: boolean;
    attempting: boolean;
    dueNow: boolean;
  };
  languageMode: 'Auto' | 'Tamil' | 'English';
  retryPreset: number;
  callingWindow: CallingWindow;
  handoffTriggers: {
    requestsHuman: boolean;
    siteVisitIntent: boolean;
    negotiation: boolean;
    asksExact: boolean;
  };
  ringTime: number;
  compliance: {
    recordingNotice: boolean;
    dndSkip: boolean;
  };
  stats: {
    attempts: number;
    connected: number;
    qualified: number;
    visitsBooked: number;
  };
  currentLeadId: string | null;
  recentOutcomes: { leadId: string; name: string; outcome: string; time: string }[];
  statusMessage?: string;
}
