import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play, 
  Square, 
  Clock, 
  Timer, 
  Trash2,
  Plus,
} from 'lucide-react';
import { useTimer, formatTimerDisplay, secondsToDecimalHours } from '@/hooks/useTimer';
import { ProjectSelect } from './ProjectSelect';
import { toast } from '@/hooks/use-toast';
import { decimalToHHMMSS, formatDecimalHours } from '@/utils/timeUtils';
import { cn } from '@/lib/utils';

interface TimerWidgetProps {
  onSaveTime: (decimalHours: number, displayValue: string, project?: string) => Promise<void>;
  projects: string[];
  onAddProject: (project: string) => void;
}

export function TimerWidget({ onSaveTime, projects, onAddProject }: TimerWidgetProps) {
  const timer = useTimer();
  const [selectedProject, setSelectedProject] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  // Manual time entry state
  const [manualStartTime, setManualStartTime] = useState('');
  const [manualEndTime, setManualEndTime] = useState('');
  const [manualProject, setManualProject] = useState('');

  const handleStartTimer = () => {
    timer.start(selectedProject);
    toast({
      title: 'Timer started',
      description: selectedProject ? `Tracking time for ${selectedProject}` : 'Time tracking started',
    });
  };

  const handleStopTimer = async () => {
    const result = timer.stop();
    if (!result) return;

    // Minimum 1 second to save
    if (result.elapsedSeconds < 1) {
      toast({
        title: 'Timer too short',
        description: 'Please work for at least 1 second',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      const displayValue = formatTimerDisplay(result.elapsedSeconds);
      await onSaveTime(result.decimalHours, displayValue, result.projectLabel || undefined);
      toast({
        title: 'Time saved',
        description: `Added ${formatDecimalHours(result.decimalHours)} hours${result.projectLabel ? ` to ${result.projectLabel}` : ''}`,
      });
    } catch (error) {
      toast({
        title: 'Error saving time',
        description: 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscardTimer = () => {
    timer.discard();
    toast({
      title: 'Timer discarded',
      description: 'Time was not saved',
    });
  };

  const handleProjectChange = (project: string) => {
    setSelectedProject(project);
    if (timer.isRunning) {
      timer.setProjectLabel(project);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!manualStartTime || !manualEndTime) {
      toast({
        title: 'Please fill in both times',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Parse times as today's date
      const today = new Date().toISOString().split('T')[0];
      const startDate = new Date(`${today}T${manualStartTime}`);
      const endDate = new Date(`${today}T${manualEndTime}`);

      // Handle overnight shifts
      if (endDate <= startDate) {
        endDate.setDate(endDate.getDate() + 1);
      }

      const diffMs = endDate.getTime() - startDate.getTime();
      const diffSeconds = Math.floor(diffMs / 1000);
      
      if (diffSeconds < 1) {
        toast({
          title: 'Invalid time range',
          description: 'End time must be after start time',
          variant: 'destructive',
        });
        return;
      }

      const decimalHours = secondsToDecimalHours(diffSeconds);
      const displayValue = `${manualStartTime} - ${manualEndTime}`;

      setIsSaving(true);
      await onSaveTime(decimalHours, displayValue, manualProject || undefined);
      
      toast({
        title: 'Time saved',
        description: `Added ${formatDecimalHours(decimalHours)} hours${manualProject ? ` to ${manualProject}` : ''}`,
      });

      // Reset form
      setManualStartTime('');
      setManualEndTime('');
      setManualProject('');
    } catch (error) {
      toast({
        title: 'Error saving time',
        description: 'Please check your input and try again',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="p-4 sm:p-6 border-primary/20 bg-gradient-to-br from-card to-primary/5">
      <Tabs defaultValue="auto" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="auto" className="gap-2">
            <Timer className="w-4 h-4" />
            <span className="hidden sm:inline">Auto Timer</span>
            <span className="sm:hidden">Auto</span>
          </TabsTrigger>
          <TabsTrigger value="manual" className="gap-2">
            <Clock className="w-4 h-4" />
            <span className="hidden sm:inline">Manual Entry</span>
            <span className="sm:hidden">Manual</span>
          </TabsTrigger>
        </TabsList>

        {/* Auto Timer Tab */}
        <TabsContent value="auto" className="space-y-4 mt-0">
          {/* Timer Display */}
          <div className={cn(
            "text-center py-4 sm:py-6 rounded-lg transition-all",
            timer.isRunning 
              ? "bg-primary/10 border border-primary/30 animate-pulse" 
              : "bg-accent/50"
          )}>
            <div className={cn(
              "font-mono text-3xl sm:text-4xl md:text-5xl font-bold tracking-wider",
              timer.isRunning ? "text-primary" : "text-muted-foreground"
            )}>
              {timer.displayTime}
            </div>
            {timer.isRunning && (
              <p className="text-sm text-muted-foreground mt-2">
                {formatDecimalHours(timer.decimalHours)} hours
                {timer.projectLabel && (
                  <span className="text-primary"> • {timer.projectLabel}</span>
                )}
              </p>
            )}
          </div>

          {/* Project Selection */}
          <div className="flex items-center justify-center">
            <ProjectSelect
              value={timer.isRunning ? timer.projectLabel : selectedProject}
              onChange={handleProjectChange}
              projects={projects}
              onAddProject={onAddProject}
              placeholder="Select project (optional)"
              className="w-auto"
            />
          </div>

          {/* Timer Controls */}
          <div className="flex items-center justify-center gap-3">
            {!timer.isRunning ? (
              <Button
                onClick={handleStartTimer}
                variant="gradient"
                size="lg"
                className="gap-2 px-8"
                disabled={isSaving}
              >
                <Play className="w-5 h-5" />
                Start Working
              </Button>
            ) : (
              <>
                <Button
                  onClick={handleStopTimer}
                  variant="success"
                  size="lg"
                  className="gap-2 px-6"
                  disabled={isSaving}
                >
                  <Square className="w-5 h-5" />
                  Stop & Save
                </Button>
                <Button
                  onClick={handleDiscardTimer}
                  variant="ghost"
                  size="lg"
                  className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                  disabled={isSaving}
                >
                  <Trash2 className="w-4 h-4" />
                  Discard
                </Button>
              </>
            )}
          </div>

          {timer.isRunning && (
            <p className="text-xs text-center text-muted-foreground">
              Timer will continue even if you close this tab
            </p>
          )}
        </TabsContent>

        {/* Manual Entry Tab */}
        <TabsContent value="manual" className="space-y-4 mt-0">
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                  Start Time
                </label>
                <Input
                  type="time"
                  value={manualStartTime}
                  onChange={(e) => setManualStartTime(e.target.value)}
                  className="bg-background"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                  End Time
                </label>
                <Input
                  type="time"
                  value={manualEndTime}
                  onChange={(e) => setManualEndTime(e.target.value)}
                  className="bg-background"
                />
              </div>
            </div>

            {/* Calculated Duration Preview */}
            {manualStartTime && manualEndTime && (
              <div className="p-3 rounded-lg bg-accent/50 text-center">
                <span className="text-sm text-muted-foreground">Duration: </span>
                <span className="font-mono font-semibold text-primary">
                  {(() => {
                    const today = new Date().toISOString().split('T')[0];
                    const startDate = new Date(`${today}T${manualStartTime}`);
                    const endDate = new Date(`${today}T${manualEndTime}`);
                    if (endDate <= startDate) {
                      endDate.setDate(endDate.getDate() + 1);
                    }
                    const diffSeconds = Math.floor((endDate.getTime() - startDate.getTime()) / 1000);
                    return `${formatTimerDisplay(diffSeconds)} (${formatDecimalHours(secondsToDecimalHours(diffSeconds))} hrs)`;
                  })()}
                </span>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                Project (optional)
              </label>
              <ProjectSelect
                value={manualProject}
                onChange={setManualProject}
                projects={projects}
                onAddProject={onAddProject}
                className="w-full justify-start"
              />
            </div>

            <Button
              type="submit"
              variant="gradient"
              className="w-full gap-2"
              disabled={isSaving || !manualStartTime || !manualEndTime}
            >
              <Plus className="w-4 h-4" />
              Add Time Entry
            </Button>
          </form>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
