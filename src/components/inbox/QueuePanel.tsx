import React from 'react';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, Settings, PhoneCall, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export function QueuePanel() {
  const { queueState, startQueue, pauseQueue, setQueueState } = useStore();

  return (
    <Card className="w-80 shadow-lg border-gray-200 flex flex-col h-full rounded-none border-0 border-l">
      <CardHeader className="border-b bg-gray-50/50 py-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <PhoneCall className="h-4 w-4 text-blue-600" />
            AI Calling Queue
          </CardTitle>
          <Badge variant={queueState.isRunning ? "success" : "secondary"} className="uppercase text-[10px]">
            {queueState.isRunning ? 'Running' : 'Paused'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Controls */}
        <div className="flex gap-2">
          {!queueState.isRunning ? (
            <Button className="w-full bg-green-600 hover:bg-green-700" onClick={startQueue}>
              <Play className="mr-2 h-4 w-4" /> Start Queue
            </Button>
          ) : (
            <Button className="w-full" variant="destructive" onClick={pauseQueue}>
              <Pause className="mr-2 h-4 w-4" /> Pause
            </Button>
          )}
          <Button variant="outline" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </div>

        {/* Live Monitor */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Live Monitor</h4>
          <div className={cn(
            "rounded-lg border p-3 text-sm",
            queueState.isRunning ? "border-blue-200 bg-blue-50" : "border-gray-200 bg-gray-50"
          )}>
            {queueState.currentLeadId ? (
              <div className="flex items-center gap-3 animate-pulse">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                <span className="font-medium text-blue-900">Calling Lead...</span>
              </div>
            ) : queueState.isRunning ? (
              <div className="flex items-center gap-3 text-gray-500">
                <Clock className="h-4 w-4 animate-spin-slow" />
                <span>Waiting for next lead...</span>
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                <span className="text-gray-500">Queue is paused.</span>
                {queueState.statusMessage && (
                  <span className="text-xs text-amber-600 font-medium">{queueState.statusMessage}</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Today's Stats */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Today's Stats</h4>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border bg-white p-3">
              <div className="text-2xl font-bold text-gray-900">{queueState.stats.attempts}</div>
              <div className="text-xs text-gray-500">Attempts</div>
            </div>
            <div className="rounded-lg border bg-white p-3">
              <div className="text-2xl font-bold text-blue-600">{queueState.stats.connected}</div>
              <div className="text-xs text-gray-500">Connected</div>
            </div>
            <div className="rounded-lg border bg-white p-3">
              <div className="text-2xl font-bold text-purple-600">{queueState.stats.qualified}</div>
              <div className="text-xs text-gray-500">Qualified</div>
            </div>
            <div className="rounded-lg border bg-white p-3">
              <div className="text-2xl font-bold text-green-600">{queueState.stats.visitsBooked}</div>
              <div className="text-xs text-gray-500">Visits Booked</div>
            </div>
          </div>
        </div>

        {/* Settings Summary */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Configuration</h4>
          <div className="rounded-lg border bg-white p-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Mode</span>
              <span className="font-medium">{queueState.mode}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Language</span>
              <span className="font-medium">{queueState.languageMode}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Buckets</span>
              <span className="font-medium">New, Hot, Attempting</span>
            </div>
          </div>
        </div>

        {/* Recent Outcomes */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Recent Outcomes</h4>
          <div className="space-y-2">
            {queueState.recentOutcomes.length === 0 ? (
              <div className="text-sm text-gray-500 italic">No calls made yet.</div>
            ) : (
              queueState.recentOutcomes.map((outcome, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm border-b pb-2 last:border-0">
                  <div className="flex items-center gap-2">
                    {outcome.outcome === 'Connected' ? (
                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                    ) : (
                      <XCircle className="h-3 w-3 text-red-500" />
                    )}
                    <span className="font-medium truncate w-24">{outcome.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className={outcome.outcome === 'Connected' ? 'text-green-600' : 'text-gray-500'}>
                      {outcome.outcome}
                    </span>
                    <span className="text-gray-400">{outcome.time}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
