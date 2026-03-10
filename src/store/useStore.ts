import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Lead, Project, User, Visit, HandoffTicket, QueueState, CallRecord, hasRole, RoutingConfig, WhatsAppConfig, WhatsAppTemplate, InboundCallRecord, OnboardingDraft } from '../types';
import { demoLeads, demoProjects, demoUsers, demoVisits, demoHandoffTickets } from './demoData';
import { v4 as uuidv4 } from 'uuid';

interface AppState {
  currentUser: User | null;
  users: User[];
  projects: Project[];
  leads: Lead[];
  visits: Visit[];
  handoffTickets: HandoffTicket[];
  inboundCalls: InboundCallRecord[];
  queueState: QueueState;
  routingConfig: RoutingConfig;
  activeProjectId: string; // 'all' or specific project ID
  whatsAppConfig: WhatsAppConfig;
  onboardingDraft: OnboardingDraft | null;
  
  // Actions
  setCurrentUser: (userId: string) => void;
  setActiveProjectId: (projectId: string) => void;
  resetDemoData: () => void;
  addLead: (lead: Lead) => void;
  updateLead: (id: string, updates: Partial<Lead>) => void;
  addVisit: (visit: Visit) => void;
  updateVisit: (id: string, updates: Partial<Visit>) => void;
  addHandoffTicket: (ticket: HandoffTicket) => void;
  updateHandoffTicket: (id: string, updates: Partial<HandoffTicket>) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  setWhatsAppConfig: (config: Partial<WhatsAppConfig>) => void;
  addInboundCall: (call: InboundCallRecord) => void;
  updateInboundCall: (id: string, updates: Partial<InboundCallRecord>) => void;
  
  // Onboarding Actions
  startProjectOnboarding: (existingProject?: Project) => void;
  updateOnboardingDraft: (updates: Partial<OnboardingDraft>) => void;
  resetOnboardingDraft: () => void;
  launchProjectFromDraft: () => void;

  // Queue Actions
  setQueueState: (updates: Partial<QueueState>) => void;
  startQueue: () => void;
  pauseQueue: () => void;
  processNextQueueItem: () => void;

  // Routing Actions
  setRoutingConfig: (updates: Partial<RoutingConfig>) => void;
}

const initialQueueState: QueueState = {
  isRunning: false,
  mode: 'Hybrid',
  buckets: { newSla: true, hot: true, attempting: true, dueNow: true },
  languageMode: 'Auto',
  retryPreset: 3,
  callingWindow: {
    daysOfWeek: [1, 2, 3, 4, 5], // Mon-Fri
    startTime: '09:00',
    endTime: '18:00'
  },
  handoffTriggers: { requestsHuman: true, siteVisitIntent: true, negotiation: true, asksExact: true },
  ringTime: 15,
  compliance: { recordingNotice: true, dndSkip: true },
  stats: { attempts: 0, connected: 0, qualified: 0, visitsBooked: 0 },
  currentLeadId: null,
  recentOutcomes: [],
  statusMessage: undefined,
};

const initialRoutingConfig: RoutingConfig = {
  strategy: 'RoundRobin',
  roundRobinIndexByProject: {},
};

const initialWhatsAppConfig: WhatsAppConfig = {
  businessNumber: '+91 98765 43210',
  templates: [
    { id: '1', name: 'Welcome', content: 'Hi {{name}}, thanks for your interest in {{project}}. Can we schedule a quick call?' },
    { id: '2', name: 'Brochure', content: 'Here is the brochure for {{project}} you requested: {{link}}' },
    { id: '3', name: 'Visit Confirmation', content: 'Your visit to {{project}} is confirmed for {{time}}. See you there!' },
  ]
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUser: demoUsers[0], // Default to Admin
      users: demoUsers,
      projects: demoProjects,
      leads: demoLeads,
      visits: demoVisits,
      handoffTickets: demoHandoffTickets,
      inboundCalls: [],
      queueState: initialQueueState,
      routingConfig: initialRoutingConfig,
      activeProjectId: '',
      whatsAppConfig: initialWhatsAppConfig,

      setCurrentUser: (userId) => set((state) => ({ currentUser: state.users?.find(u => u.id === userId) || null })),
      setActiveProjectId: (id) => {
        const state = get();
        const project = state.projects.find(p => p.id === id);
        
        // Update global configs to match the selected project if it has config
        if (project && project.config) {
          set((s) => ({
            activeProjectId: id,
            queueState: {
              ...s.queueState,
              callingWindow: project.config!.callingConfig.window,
              compliance: {
                recordingNotice: project.config!.complianceConfig.recordingNotice,
                dndSkip: project.config!.complianceConfig.dndSkip
              },
              retryPreset: project.config!.callingConfig.retryPreset,
              ringTime: project.config!.callingConfig.ringDuration
            },
            whatsAppConfig: {
              ...s.whatsAppConfig,
              businessNumber: project.config!.whatsAppConfig.businessNumber
            }
          }));
        } else {
          set({ activeProjectId: id });
        }
      },
      setWhatsAppConfig: (config) => set((state) => ({ whatsAppConfig: { ...state.whatsAppConfig, ...config } })),
      
      onboardingDraft: null,

      startProjectOnboarding: (existingProject?: Project) => {
        if (existingProject) {
          // Edit Mode
          set({
            onboardingDraft: {
              step: 2, // Skip Welcome
              project: { ...existingProject },
              teamMembers: [], // In a real app, we'd map existing users to this structure
              routingStrategy: 'RoundRobin',
              config: existingProject.config || {
                leadSources: ['Website', 'Ads', 'Referrals'],
                callingConfig: {
                  window: { daysOfWeek: [1,2,3,4,5], startTime: '09:00', endTime: '18:00' },
                  slaTargetMins: 10,
                  retryPreset: 3,
                  maxAiAttempts: 5,
                  ringDuration: 20
                },
                complianceConfig: {
                  recordingNotice: true,
                  dndSkip: true,
                  consentAware: true,
                  skipBlocked: true
                },
                whatsAppConfig: {
                  enabled: true,
                  templates: { brochure: true, visitConfirmation: true, visitReminder: true, missedVisit: true }
                },
                inboundConfig: {
                  enabled: true,
                  callbackSlaMins: 30,
                  unknownNumberBehavior: 'CreateLead'
                }
              }
            }
          });
        } else {
          // New Project Mode
          set({
            onboardingDraft: {
              step: 1,
              project: {
                id: uuidv4(),
                name: '',
                cityArea: '',
                visitAddress: '',
                visitTimings: '10:00 AM - 06:00 PM',
                factsSheet: {
                  priceBands: '',
                  bhkOptions: '',
                  localityCoverage: '',
                  possession: '',
                  offersAllowed: '',
                },
                aiAgentConfig: {
                  scriptBlocks: '',
                  guardrails: {
                    priceBandsOnly: true,
                    noAvailabilityCommitments: true,
                    escalationPhrasing: true,
                  }
                },
                brochures: [],
              },
              teamMembers: [],
              routingStrategy: 'RoundRobin',
              config: {
                leadSources: ['Website', 'Ads', 'Referrals'],
                callingConfig: {
                  window: { daysOfWeek: [1,2,3,4,5], startTime: '09:00', endTime: '18:00' },
                  slaTargetMins: 10,
                  retryPreset: 3,
                  maxAiAttempts: 5,
                  ringDuration: 20
                },
                complianceConfig: {
                  recordingNotice: true,
                  dndSkip: true,
                  consentAware: true,
                  skipBlocked: true
                },
                whatsAppConfig: {
                  enabled: true,
                  templates: { brochure: true, visitConfirmation: true, visitReminder: true, missedVisit: true }
                },
                inboundConfig: {
                  enabled: true,
                  callbackSlaMins: 30,
                  unknownNumberBehavior: 'CreateLead'
                }
              }
            }
          });
        }
      },

      updateOnboardingDraft: (updates) => set((state) => ({
        onboardingDraft: state.onboardingDraft ? { ...state.onboardingDraft, ...updates } : null
      })),

      resetOnboardingDraft: () => set({ onboardingDraft: null }),

      launchProjectFromDraft: () => {
        const state = get();
        const draft = state.onboardingDraft;
        if (!draft || !draft.project.name) return;

        const projectData = draft.project as Project;
        projectData.config = draft.config;

        const existingProjectIndex = state.projects.findIndex(p => p.id === projectData.id);

        if (existingProjectIndex >= 0) {
          // Update Existing
          get().updateProject(projectData.id, projectData);
        } else {
          // Add New
          get().addProject(projectData);
          
          // Update Users (Add new users or update existing roles/assignments)
          const state = get();
          const currentUsers = [...state.users];
          
          draft.teamMembers.forEach(member => {
            const existingUserIndex = currentUsers.findIndex(u => u.email === member.email);
            
            if (existingUserIndex >= 0) {
              // Update existing user
              const user = currentUsers[existingUserIndex];
              const updatedRoles = Array.from(new Set([...user.roles, ...member.roles]));
              const updatedProjects = Array.from(new Set([...user.assignedProjectIds, projectData.id]));
              
              currentUsers[existingUserIndex] = {
                ...user,
                roles: updatedRoles,
                assignedProjectIds: updatedProjects,
                phone: member.phone || user.phone // Update phone if provided
              };
            } else {
              // Create new user
              currentUsers.push({
                id: uuidv4(),
                name: member.name,
                email: member.email,
                phone: member.phone,
                roles: member.roles,
                languages: ['English'], // Default language
                assignedProjectIds: [projectData.id],
                onlineStatus: 'Offline',
                dailyLeadLimit: member.dailyLimit
              });
            }
          });

          // Ensure current user is assigned if not already (fallback)
          const currentUserIndex = currentUsers.findIndex(u => u.id === state.currentUser?.id);
          if (currentUserIndex >= 0) {
             const user = currentUsers[currentUserIndex];
             if (!user.assignedProjectIds.includes(projectData.id)) {
               currentUsers[currentUserIndex] = {
                 ...user,
                 assignedProjectIds: [...user.assignedProjectIds, projectData.id]
               };
             }
          }
          
          set({ users: currentUsers });
          
          // Update currentUser reference if it changed
          const newCurrentUser = currentUsers.find(u => u.id === state.currentUser?.id);
          if (newCurrentUser) {
            set({ currentUser: newCurrentUser });
          }
        }

        // Set Active
        get().setActiveProjectId(projectData.id);

        set({ onboardingDraft: null });
      },

      resetDemoData: () => set({
        users: demoUsers,
        projects: demoProjects,
        leads: demoLeads,
        visits: demoVisits,
        handoffTickets: demoHandoffTickets,
        inboundCalls: [],
        queueState: initialQueueState,
        routingConfig: initialRoutingConfig,
        whatsAppConfig: initialWhatsAppConfig,
      }),

      addLead: (lead) => set((state) => ({ leads: [lead, ...(state.leads || [])] })),
      updateLead: (id, updates) => set((state) => ({
        leads: state.leads?.map(l => l.id === id ? { ...l, ...updates } : l) || []
      })),

      addVisit: (visit) => set((state) => ({ visits: [...(state.visits || []), visit] })),
      updateVisit: (id, updates) => set((state) => ({
        visits: state.visits?.map(v => v.id === id ? { ...v, ...updates, updatedAt: new Date().toISOString() } : v) || []
      })),

      addHandoffTicket: (ticket) => set((state) => ({ handoffTickets: [...(state.handoffTickets || []), ticket] })),
      updateHandoffTicket: (id, updates) => set((state) => ({
        handoffTickets: state.handoffTickets?.map(t => t.id === id ? { ...t, ...updates } : t) || []
      })),

      addInboundCall: (call) => set((state) => ({ inboundCalls: [call, ...(state.inboundCalls || [])] })),
      updateInboundCall: (id, updates) => set((state) => ({
        inboundCalls: state.inboundCalls?.map(c => c.id === id ? { ...c, ...updates } : c) || []
      })),

      addProject: (project) => set((state) => ({ projects: [...(state.projects || []), project] })),

      updateProject: (id, updates) => set((state) => ({
        projects: state.projects?.map(p => p.id === id ? { ...p, ...updates } : p) || []
      })),

      updateUser: (id, updates) => set((state) => ({
        users: state.users?.map(u => u.id === id ? { ...u, ...updates } : u) || []
      })),

      setQueueState: (updates) => set((state) => ({ queueState: { ...state.queueState, ...updates } })),
      
      startQueue: () => set((state) => ({ queueState: { ...state.queueState, isRunning: true, statusMessage: undefined } })),
      pauseQueue: () => set((state) => ({ queueState: { ...state.queueState, isRunning: false, currentLeadId: null, statusMessage: undefined } })),
      
      setRoutingConfig: (updates) => set((state) => ({ routingConfig: { ...state.routingConfig, ...updates } })),

      processNextQueueItem: () => {
        const state = get();
        if (!state.queueState.isRunning) return;

        // Check Calling Window
        const now = new Date();
        const { callingWindow } = state.queueState;
        
        // Days Check
        if (callingWindow && callingWindow.daysOfWeek && !callingWindow.daysOfWeek.includes(now.getDay())) {
          set((s) => ({ queueState: { ...s.queueState, isRunning: false, currentLeadId: null, statusMessage: 'Paused: Outside calling days.' } }));
          return;
        }

        // Time Check
        if (callingWindow && callingWindow.startTime && callingWindow.endTime) {
          const currentMinutes = now.getHours() * 60 + now.getMinutes();
          const [startH, startM] = callingWindow.startTime.split(':').map(Number);
          const [endH, endM] = callingWindow.endTime.split(':').map(Number);
          const startMinutes = startH * 60 + startM;
          const endMinutes = endH * 60 + endM;

          if (currentMinutes < startMinutes || currentMinutes > endMinutes) {
             set((s) => ({ queueState: { ...s.queueState, isRunning: false, currentLeadId: null, statusMessage: `Paused: Outside calling hours (${callingWindow.startTime} - ${callingWindow.endTime}).` } }));
             return;
          }
        }

        // Find next lead based on buckets
        const { buckets, compliance } = state.queueState;
        let eligibleLeads = (state.leads || []).filter(l => !l.doNotCall || !compliance.dndSkip);
        
        // Very simplified selection logic for demo
        const nextLead = eligibleLeads.find(l => {
          if (buckets.newSla && l.stage === 'New (SLA)') return true;
          if (buckets.attempting && l.stage === 'Attempting') return true;
          return false;
        });

        if (!nextLead) {
          // Pause if no leads
          set((s) => ({ queueState: { ...s.queueState, isRunning: false, currentLeadId: null, statusMessage: 'Paused: No eligible leads in queue.' } }));
          return;
        }

        set((s) => ({ queueState: { ...s.queueState, currentLeadId: nextLead.id, statusMessage: undefined } }));

        // Simulate call duration
        setTimeout(() => {
          const currentState = get();
          if (!currentState.queueState.isRunning) return; // Was paused

          // Simulate outcome
          const isConnected = Math.random() > 0.3; // 70% connect rate for demo
          const isQualified = isConnected && Math.random() > 0.5;
          const isVisitBooked = isQualified && Math.random() > 0.5;
          const isHandoff = isConnected && !isVisitBooked && Math.random() > 0.5;

          let newStage = nextLead.stage;
          let outcomeStr = 'No Answer';
          let nextAction: CallRecord['nextAction'] = 'CallLater';
          let transcript = '';

          if (isConnected) {
            outcomeStr = 'Connected';
            if (isVisitBooked) {
              newStage = 'Site Visit';
              nextAction = 'BookVisit';
              transcript = 'AI: ... Great, I have booked your visit for tomorrow. User: Thanks.';
            } else if (isHandoff) {
              newStage = 'Human Working';
              nextAction = 'Handoff';
              transcript = 'User: Can you give me a discount? AI: I will have my team confirm exact details on WhatsApp.';
            } else {
              newStage = 'Connected';
              nextAction = 'CallLater';
              transcript = 'AI: ... User: Call me later.';
            }
          }

          const callRecord: CallRecord = {
            id: uuidv4(),
            leadId: nextLead.id,
            type: 'AI',
            startedAt: new Date(now.getTime() - 60000).toISOString(), // 1 min ago
            endedAt: new Date().toISOString(),
            durationSec: isConnected ? 60 : 15,
            outcome: isConnected ? 'Connected' : 'NoAnswer',
            transcript,
            nextAction,
          };

          const updates: Partial<Lead> = {
            stage: newStage,
            lastContactAt: new Date().toISOString(),
            callHistory: [...nextLead.callHistory, callRecord]
          };

          if (isVisitBooked) {
             const visit: Visit = {
               id: uuidv4(),
               leadId: nextLead.id,
               projectId: nextLead.projectId,
               scheduledAt: new Date(now.getTime() + 86400000).toISOString(), // Tomorrow
               status: 'Booked',
               createdAt: new Date().toISOString(),
               updatedAt: new Date().toISOString()
             };
             get().addVisit(visit);
          } else if (isHandoff) {
             // Find eligible agent
             const state = get();
             const todayStart = new Date();
             todayStart.setHours(0,0,0,0);
             
             const eligibleAgents = state.users.filter(u => {
               if (!hasRole(u, 'Agent')) return false;
               if (!u.assignedProjectIds?.includes(nextLead.projectId)) return false;
               
               if (u.dailyLeadLimit) {
                 const assignedToday = state.handoffTickets.filter(t => 
                   t.assignedToUserId === u.id && 
                   new Date(t.createdAt) >= todayStart
                 ).length;
                 if (assignedToday >= u.dailyLeadLimit) return false;
               }
               return true;
             });

             let assignedAgent: User | undefined;
             const projectId = nextLead.projectId;
             
             if (eligibleAgents.length > 0) {
               const currentConfig = state.routingConfig;
               const currentIndex = currentConfig.roundRobinIndexByProject?.[projectId] || 0;
               const effectiveIndex = currentIndex % eligibleAgents.length;
               
               assignedAgent = eligibleAgents[effectiveIndex];
               
               const nextIndex = (effectiveIndex + 1) % eligibleAgents.length;
               
               set((s) => ({
                 routingConfig: {
                   ...s.routingConfig,
                   roundRobinIndexByProject: {
                     ...s.routingConfig.roundRobinIndexByProject,
                     [projectId]: nextIndex
                   }
                 }
               }));
             }

             const ticket: HandoffTicket = {
               id: uuidv4(),
               leadId: nextLead.id,
               reason: 'Negotiation / Exact details requested',
               createdAt: new Date().toISOString(),
               status: 'Open',
               assignedToUserId: assignedAgent?.id,
               slaDueAt: new Date(now.getTime() + 15 * 60000).toISOString() // 15 mins
             };
             get().addHandoffTicket(ticket);
             updates.handoffTicketId = ticket.id;
          }

          get().updateLead(nextLead.id, updates);

          // Update stats
          set((s) => ({
            queueState: {
              ...s.queueState,
              currentLeadId: null,
              stats: {
                attempts: s.queueState.stats.attempts + 1,
                connected: s.queueState.stats.connected + (isConnected ? 1 : 0),
                qualified: s.queueState.stats.qualified + (isQualified ? 1 : 0),
                visitsBooked: s.queueState.stats.visitsBooked + (isVisitBooked ? 1 : 0),
              },
              recentOutcomes: [
                { leadId: nextLead.id, name: nextLead.name, outcome: outcomeStr, time: new Date().toLocaleTimeString() },
                ...s.queueState.recentOutcomes
              ].slice(0, 10)
            }
          }));

          // Process next after a short delay
          setTimeout(() => {
            get().processNextQueueItem();
          }, 2000);

        }, 3000); // 3s simulation time
      }
    }),
    {
      name: 'lead-os-storage',
      partialize: (state) => ({
        currentUser: state.currentUser,
        leads: state.leads,
        visits: state.visits,
        handoffTickets: state.handoffTickets,
        projects: state.projects,
        queueState: state.queueState,
        routingConfig: state.routingConfig,
        activeProjectId: state.activeProjectId,
      }),
    }
  )
);
