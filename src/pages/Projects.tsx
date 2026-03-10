import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Building2, FileText, Bot, Upload, CheckCircle2, ArrowLeft, Database, Settings2, PhoneCall, MessageSquare, ShieldCheck, Users } from 'lucide-react';

export default function ProjectEdit() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { projects, updateProject } = useStore();
  const [activeTab, setActiveTab] = useState<'facts' | 'rag' | 'agent' | 'inventory' | 'config'>('facts');

  const project = projects.find(p => p.id === projectId);

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <h2 className="text-xl font-semibold text-gray-900">Project not found</h2>
        <Button variant="link" onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
      </div>
    );
  }

  const handleFactsChange = (field: keyof typeof project.factsSheet, value: string) => {
    updateProject(project.id, {
      factsSheet: { ...project.factsSheet, [field]: value }
    });
  };

  const handleInventoryUpdate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Simulate upload
      updateProject(project.id, {
        inventory: {
          fileName: file.name,
          lastUpdatedAt: new Date().toISOString(),
          rowCount: Math.floor(Math.random() * 100) + 50 // Mock row count
        }
      });
    }
  };

  const getInventoryFreshness = () => {
    if (!project.inventory?.lastUpdatedAt) return 'none';
    const days = Math.floor((new Date().getTime() - new Date(project.inventory.lastUpdatedAt).getTime()) / (1000 * 60 * 60 * 24));
    if (days > 7) return 'stale';
    return 'fresh';
  };

  const handleAiConfigChange = (field: keyof typeof project.aiAgentConfig.guardrails, value: boolean) => {
    updateProject(project.id, {
      aiAgentConfig: {
        ...project.aiAgentConfig,
        guardrails: { ...project.aiAgentConfig.guardrails, [field]: value }
      }
    });
  };

  return (
    <div className="flex h-full w-full bg-gray-50 flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-8 py-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
            <p className="text-sm text-gray-500 mt-1">{project.visitAddress}</p>
          </div>
          <div className="ml-auto">
             <Button>Save Changes</Button>
          </div>
        </div>
        
        <div className="flex gap-8 overflow-x-auto">
          <button
            className={`pb-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'facts' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
            onClick={() => setActiveTab('facts')}
          >
            <div className="flex items-center gap-2"><FileText className="h-4 w-4" /> Facts Sheet</div>
          </button>
          <button
            className={`pb-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'inventory' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
            onClick={() => setActiveTab('inventory')}
          >
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4" /> 
              Inventory
              {getInventoryFreshness() === 'stale' && (
                <span className="h-2 w-2 rounded-full bg-red-500" />
              )}
            </div>
          </button>
          <button
            className={`pb-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'rag' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
            onClick={() => setActiveTab('rag')}
          >
            <div className="flex items-center gap-2"><FileText className="h-4 w-4" /> RAG (Knowledge Base)</div>
          </button>
          <button
            className={`pb-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'agent' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
            onClick={() => setActiveTab('agent')}
          >
            <div className="flex items-center gap-2"><Bot className="h-4 w-4" /> Agent Configuration</div>
          </button>
          <button
            className={`pb-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'config' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
            onClick={() => setActiveTab('config')}
          >
            <div className="flex items-center gap-2"><Settings2 className="h-4 w-4" /> Settings</div>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        {activeTab === 'facts' && (
          <div className="max-w-3xl space-y-6 mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Project Truth Layer</CardTitle>
                <CardDescription>This information is used by the AI to answer lead queries accurately.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>RERA Number</Label>
                    <Input value={project.reraNumber || ''} onChange={(e) => updateProject(project.id, { reraNumber: e.target.value })} placeholder="e.g. TN/29/Building/0000/2024" />
                  </div>
                  <div className="space-y-2">
                    <Label>Possession Date</Label>
                    <Input value={project.factsSheet.possession} onChange={(e) => handleFactsChange('possession', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Price Bands</Label>
                    <Input value={project.factsSheet.priceBands} onChange={(e) => handleFactsChange('priceBands', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>BHK Options</Label>
                    <Input value={project.factsSheet.bhkOptions} onChange={(e) => handleFactsChange('bhkOptions', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Locality Coverage</Label>
                    <Input value={project.factsSheet.localityCoverage} onChange={(e) => handleFactsChange('localityCoverage', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Offers Allowed</Label>
                    <Input value={project.factsSheet.offersAllowed} onChange={(e) => handleFactsChange('offersAllowed', e.target.value)} />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label>Loan Partners</Label>
                    <Input value={project.factsSheet.loanPartners || ''} onChange={(e) => handleFactsChange('loanPartners', e.target.value)} />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label>USPs (Comma separated)</Label>
                    <Input 
                      value={project.usp?.join(', ') || ''} 
                      onChange={(e) => updateProject(project.id, { usp: e.target.value.split(',').map(s => s.trim()) })} 
                      placeholder="e.g. Lake View, Metro Access, Clubhouse"
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label>Amenities (Comma separated)</Label>
                    <Input 
                      value={project.amenities?.join(', ') || ''} 
                      onChange={(e) => updateProject(project.id, { amenities: e.target.value.split(',').map(s => s.trim()) })} 
                      placeholder="e.g. Gym, Pool, Park"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="max-w-3xl space-y-6 mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Inventory Management</CardTitle>
                <CardDescription>Upload your latest inventory sheet (Excel/CSV) to keep availability up to date.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {project.inventory?.lastUpdatedAt ? (
                  <div className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{project.inventory.fileName}</h4>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                          <span>{project.inventory.rowCount} units</span>
                          <span>•</span>
                          <span>Updated {new Date(project.inventory.lastUpdatedAt).toLocaleDateString()}</span>
                          {getInventoryFreshness() === 'stale' && (
                            <Badge variant="destructive" className="ml-2 text-[10px]">Update Required</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="relative">
                      Replace
                      <input 
                        type="file" 
                        className="absolute inset-0 opacity-0 cursor-pointer" 
                        accept=".csv,.xlsx,.xls"
                        onChange={handleInventoryUpdate}
                      />
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 flex flex-col items-center justify-center text-center bg-gray-50 hover:bg-gray-100 transition-colors relative">
                    <input 
                      type="file" 
                      className="absolute inset-0 opacity-0 cursor-pointer" 
                      accept=".csv,.xlsx,.xls"
                      onChange={handleInventoryUpdate}
                    />
                    <div className="rounded-full bg-blue-100 p-3 mb-4">
                      <Upload className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900">Upload Inventory Sheet</h3>
                    <p className="text-xs text-gray-500 mt-1">Excel or CSV files only</p>
                  </div>
                )}

                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-900 mb-2 flex items-center gap-2">
                    <Bot className="h-4 w-4" />
                    How AI uses this
                  </h4>
                  <p className="text-sm text-blue-800">
                    The AI will check this sheet to answer questions about specific unit availability (e.g., "Do you have any 3BHKs on the 5th floor?"). 
                    It will never commit a specific unit number, but will confirm general availability based on this data.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'rag' && (
          <div className="max-w-3xl space-y-6 mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>RAG Knowledge Base</CardTitle>
                <CardDescription>Upload brochures, floor plans, and other documents for the AI to reference.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 flex flex-col items-center justify-center text-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                  <div className="rounded-full bg-blue-100 p-3 mb-4">
                    <Upload className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900">Click to upload or drag and drop</h3>
                  <p className="text-xs text-gray-500 mt-1">PDF, JPG, PNG up to 10MB</p>
                </div>

                <div className="mt-6 space-y-3">
                  {project.brochures?.map((b, i) => (
                    <div key={i} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-white">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-blue-500" />
                        <span className="text-sm font-medium text-gray-700">{b}</span>
                      </div>
                      <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50">Remove</Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'agent' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>AI Script Blocks</CardTitle>
                  <CardDescription>Define the opening lines and key talking points for the AI.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label>Opening Script</Label>
                    <textarea 
                      className="w-full min-h-[150px] rounded-md border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={project.aiAgentConfig.scriptBlocks}
                      onChange={(e) => updateProject(project.id, { aiAgentConfig: { ...project.aiAgentConfig, scriptBlocks: e.target.value } })}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Guardrails</CardTitle>
                  <CardDescription>Strict rules the AI must follow during calls.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-white">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Price Bands Only</h4>
                      <p className="text-xs text-gray-500 mt-1">AI will never quote exact prices, only ranges.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={project.aiAgentConfig.guardrails.priceBandsOnly} onChange={(e) => handleAiConfigChange('priceBandsOnly', e.target.checked)} />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-white">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">No Availability Commitments</h4>
                      <p className="text-xs text-gray-500 mt-1">AI will not confirm exact unit availability.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={project.aiAgentConfig.guardrails.noAvailabilityCommitments} onChange={(e) => handleAiConfigChange('noAvailabilityCommitments', e.target.checked)} />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-white">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Escalation Phrasing</h4>
                      <p className="text-xs text-gray-500 mt-1">Use standard phrase: "I'll have my team confirm exact details on WhatsApp."</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={project.aiAgentConfig.guardrails.escalationPhrasing} onChange={(e) => handleAiConfigChange('escalationPhrasing', e.target.checked)} />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="bg-blue-50 border-blue-200 sticky top-6">
                <CardHeader>
                  <CardTitle className="text-blue-900 flex items-center gap-2"><Bot className="h-5 w-5" /> AI Preview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-white rounded-lg p-3 text-sm shadow-sm border border-blue-100">
                    <div className="font-semibold text-blue-800 mb-1">User asks:</div>
                    <div className="text-gray-700">"What is the exact price of a 3BHK on the 5th floor?"</div>
                  </div>
                  <div className="bg-blue-600 text-white rounded-lg p-3 text-sm shadow-sm">
                    <div className="font-semibold text-blue-200 mb-1">AI responds:</div>
                    <div>"Our 3BHKs range from {project.factsSheet.priceBands}. I'll have my team confirm exact details and availability on WhatsApp."</div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-blue-700 mt-4">
                    <CheckCircle2 className="h-4 w-4" /> Guardrails applied successfully
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'config' && (
          <div className="max-w-3xl space-y-6 mx-auto">
            {project.config ? (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">Project Configuration</h3>
                  <Button variant="outline" onClick={() => navigate(`/project-setup?projectId=${project.id}`)}>
                    <Settings2 className="mr-2 h-4 w-4" /> Edit Configuration
                  </Button>
                </div>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><PhoneCall className="h-5 w-5" /> Calling Configuration</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-gray-500">Calling Window</Label>
                        <p className="font-medium">{project.config.callingConfig.window.startTime} - {project.config.callingConfig.window.endTime}</p>
                      </div>
                      <div>
                        <Label className="text-gray-500">SLA Target</Label>
                        <p className="font-medium">{project.config.callingConfig.slaTargetMins} mins</p>
                      </div>
                      <div>
                        <Label className="text-gray-500">Max AI Attempts</Label>
                        <p className="font-medium">{project.config.callingConfig.maxAiAttempts}</p>
                      </div>
                      <div>
                        <Label className="text-gray-500">Ring Duration</Label>
                        <p className="font-medium">{project.config.callingConfig.ringDuration}s</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><MessageSquare className="h-5 w-5" /> WhatsApp Configuration</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center border-b pb-4">
                      <Label>Status</Label>
                      <Badge variant={project.config.whatsAppConfig.enabled ? 'default' : 'secondary'}>
                        {project.config.whatsAppConfig.enabled ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                    {project.config.whatsAppConfig.enabled && (
                      <div className="space-y-2">
                        <Label className="text-gray-500">Business Number</Label>
                        <p className="font-medium">{project.config.whatsAppConfig.businessNumber || 'Not configured'}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5" /> Compliance</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className={`h-4 w-4 ${project.config.complianceConfig.recordingNotice ? 'text-green-500' : 'text-gray-300'}`} />
                        <span className="text-sm">Recording Notice</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className={`h-4 w-4 ${project.config.complianceConfig.dndSkip ? 'text-green-500' : 'text-gray-300'}`} />
                        <span className="text-sm">Skip DND</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className={`h-4 w-4 ${project.config.complianceConfig.consentAware ? 'text-green-500' : 'text-gray-300'}`} />
                        <span className="text-sm">Consent Aware</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-xl border border-dashed">
                <Settings2 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-900">No Configuration Found</h3>
                <p className="text-gray-500 mb-4">This project was created before the new configuration system.</p>
                <Button variant="outline" onClick={() => navigate(`/project-setup?projectId=${project.id}`)}>Run Setup Wizard</Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
