import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, CheckCircle2, ArrowRight } from 'lucide-react';

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    else navigate('/dashboard');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl space-y-8">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="rounded-full bg-blue-100 p-3 mb-4">
            <Building2 className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            Welcome to Lead-to-Visit OS
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Let's set up your workspace in 3 simple steps.
          </p>
        </div>

        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${step >= s ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300 text-gray-500'}`}>
                  {step > s ? <CheckCircle2 className="h-5 w-5" /> : s}
                </div>
                {s < 3 && <div className={`h-1 w-12 mx-2 ${step > s ? 'bg-blue-600' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{step === 1 ? 'Company Details' : step === 2 ? 'First Project' : 'Invite Team'}</CardTitle>
            <CardDescription>
              {step === 1 ? 'Tell us about your real estate business.' : step === 2 ? 'Add your first project to start receiving leads.' : 'Invite your sales agents and site coordinators.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {step === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input id="companyName" placeholder="e.g. Chennai Builders" defaultValue="Chennai Builders" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input id="website" placeholder="e.g. www.chennaibuilders.com" defaultValue="www.chennaibuilders.com" />
                </div>
                <div className="space-y-2">
                  <Label>Calling Hours</Label>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Label htmlFor="startTime" className="text-xs text-gray-500">Start</Label>
                      <Input id="startTime" type="time" defaultValue="09:00" />
                    </div>
                    <div className="flex-1">
                      <Label htmlFor="endTime" className="text-xs text-gray-500">End</Label>
                      <Input id="endTime" type="time" defaultValue="18:00" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">AI will only make calls during these hours.</p>
                </div>
              </div>
            )}
            {step === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="projectName">Project Name</Label>
                  <Input id="projectName" placeholder="e.g. OMR Campus" defaultValue="OMR Campus" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cityArea">City Area</Label>
                  <Input id="cityArea" placeholder="e.g. OMR, Chennai" defaultValue="OMR" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priceBands">Price Bands</Label>
                  <Input id="priceBands" placeholder="e.g. ₹65L - ₹1.2Cr" defaultValue="₹65L - ₹1.2Cr" />
                </div>
              </div>
            )}
            {step === 3 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email1">Agent Email</Label>
                  <Input id="email1" placeholder="agent@example.com" defaultValue="agent@chennaibuilders.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email2">Coordinator Email</Label>
                  <Input id="email2" placeholder="coord@example.com" defaultValue="coord@chennaibuilders.com" />
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1}>
              Back
            </Button>
            <Button onClick={handleNext}>
              {step === 3 ? 'Go to Dashboard' : 'Next'}
              {step < 3 && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
