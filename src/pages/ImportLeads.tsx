import React, { useState } from 'react';
import { useStore } from '@/store/useStore';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Upload, FileText, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { Lead } from '@/types';

export default function ImportLeads() {
  const { projects, addLead } = useStore();
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [file, setFile] = useState<File | null>(null);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [isImporting, setIsImporting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setStep(2);
    }
  };

  const handleImport = () => {
    setIsImporting(true);
    
    // Simulate import process
    setTimeout(() => {
      const newLeadsCount = 5;
      const now = new Date();
      
      for (let i = 0; i < newLeadsCount; i++) {
        const lead: Lead = {
          id: uuidv4(),
          name: `Imported Lead ${i + 1}`,
          phone: `+91 900000000${i}`,
          source: 'CSV Import',
          projectId: selectedProject || projects[0].id,
          languagePreference: 'Auto',
          stage: 'New (SLA)',
          createdAt: now.toISOString(),
          slaDueAt: new Date(now.getTime() + 5 * 60000).toISOString(), // 5 mins SLA
          priorityScore: 70,
          extracted: {},
          doNotCall: false,
          tasks: [],
          callHistory: [],
          messages: []
        };
        addLead(lead);
      }
      
      setIsImporting(false);
      setStep(3);
    }, 2000);
  };

  return (
    <div className="flex h-full w-full flex-col bg-gray-50">
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Import Leads</h1>
        <p className="text-sm text-gray-500 mt-1">Upload CSV to add new leads to your queue</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 flex justify-center items-start pt-12">
        <div className="w-full max-w-2xl space-y-8">
          
          {/* Progress Bar */}
          <div className="flex justify-between items-center mb-8 px-12">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex flex-col items-center relative">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 z-10 bg-white ${step >= s ? 'border-blue-600 text-blue-600' : 'border-gray-300 text-gray-400'}`}>
                  {step > s ? <CheckCircle2 className="h-6 w-6" /> : <span className="font-semibold">{s}</span>}
                </div>
                <span className={`text-xs mt-2 font-medium ${step >= s ? 'text-blue-600' : 'text-gray-500'}`}>
                  {s === 1 ? 'Upload' : s === 2 ? 'Map Fields' : 'Complete'}
                </span>
                {s < 3 && (
                  <div className={`absolute top-5 left-10 w-[180px] h-0.5 -z-0 ${step > s ? 'bg-blue-600' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>

          <Card className="shadow-md">
            {step === 1 && (
              <>
                <CardHeader>
                  <CardTitle>Upload CSV File</CardTitle>
                  <CardDescription>Download our sample template to ensure correct formatting.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 flex flex-col items-center justify-center text-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer relative">
                    <input 
                      type="file" 
                      accept=".csv" 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={handleFileChange}
                    />
                    <div className="rounded-full bg-blue-100 p-4 mb-4">
                      <Upload className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Click to upload or drag and drop</h3>
                    <p className="text-sm text-gray-500 mt-2">CSV files only (max 5MB)</p>
                  </div>
                  <div className="mt-6 flex justify-center">
                    <Button variant="link" className="text-blue-600">
                      <FileText className="mr-2 h-4 w-4" /> Download Sample CSV
                    </Button>
                  </div>
                </CardContent>
              </>
            )}

            {step === 2 && (
              <>
                <CardHeader>
                  <CardTitle>Map Fields & Settings</CardTitle>
                  <CardDescription>Configure how your imported leads will be processed.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-4 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                    <FileText className="h-8 w-8 text-blue-600" />
                    <div>
                      <h4 className="font-semibold text-blue-900">{file?.name || 'leads.csv'}</h4>
                      <p className="text-sm text-blue-700">5 valid rows found. 1 duplicate skipped.</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Assign to Project</label>
                      <Select value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)}>
                        <option value="">Select a project...</option>
                        {projects?.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Default Language Preference</label>
                      <Select defaultValue="Auto">
                        <option value="Auto">Auto-detect (Tamil first)</option>
                        <option value="Tamil">Tamil</option>
                        <option value="English">English</option>
                      </Select>
                    </div>

                    <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg flex gap-3">
                      <AlertCircle className="h-5 w-5 text-orange-600 shrink-0" />
                      <div className="text-sm text-orange-800">
                        <span className="font-semibold">SLA Warning:</span> Imported leads will immediately enter the "New (SLA)" queue with a 5-minute SLA timer. Ensure your AI queue is ready or agents are available.
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between border-t border-gray-100 pt-6">
                  <Button variant="outline" onClick={() => setStep(1)} disabled={isImporting}>Back</Button>
                  <Button onClick={handleImport} disabled={!selectedProject || isImporting}>
                    {isImporting ? 'Importing...' : 'Start Import'}
                    {!isImporting && <ArrowRight className="ml-2 h-4 w-4" />}
                  </Button>
                </CardFooter>
              </>
            )}

            {step === 3 && (
              <>
                <CardContent className="pt-12 pb-8 flex flex-col items-center text-center space-y-4">
                  <div className="rounded-full bg-green-100 p-4">
                    <CheckCircle2 className="h-12 w-12 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Import Successful!</h2>
                  <p className="text-gray-500 max-w-md">
                    5 new leads have been added to your Inbox and are waiting in the New (SLA) queue.
                  </p>
                </CardContent>
                <CardFooter className="flex justify-center border-t border-gray-100 pt-6 pb-6">
                  <Button size="lg" onClick={() => navigate('/inbox')}>
                    Go to Inbox
                  </Button>
                </CardFooter>
              </>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
