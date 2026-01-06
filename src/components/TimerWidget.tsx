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
import { TagSelect } from './TagSelect';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface TimerWidgetProps {
  onSaveTime: (decimalHours: number, displayValue: string, tag?: string) => Promise<void>;
  tags: string[];
  onAddTag: (tag: string) => void;
  onDeleteTag: (tag: string) => void;
}

export function TimerWidget({ onSaveTime, tags, onAddTag, onDeleteTag }: TimerWidgetProps) {
  const timer = useTimer();
  const [selectedTag, setSelectedTag] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  // Manual time entry state
  const [manualStartTime, setManualStartTime] = useState('');
  const [manualEndTime, setManualEndTime] = useState('');
  const [manualTag, setManualTag] = useState('');

  const handleStartTimer = () => {
    timer.start(selectedTag);
    toast({
      title: 'Timer started',
      description: selectedTag ? `Tracking time with tag "${selectedTag}"` : 'Time tracking started',
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
        description: `Added ${formatTimerDisplay(result.elapsedSeconds)}${result.projectLabel ? ` with tag "${result.projectLabel}"` : ''}`,
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

  const handleTagChange = (tag: string) => {
    setSelectedTag(tag);
    if (timer.isRunning) {
      timer.setProjectLabel(tag);
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
      await onSaveTime(decimalHours, displayValue, manualTag || undefined);
      
      toast({
        title: 'Time saved',
        description: `Added ${formatTimerDisplay(diffSeconds)}${manualTag ? ` with tag "${manualTag}"` : ''}`,
      });

      // Reset form
      setManualStartTime('');
      setManualEndTime('');
      setManualTag('');
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
    <Card className="p-5 sm:p-6 border-primary/20 bg-gradient-to-br from-card to-primary/5">
      <Tabs defaultValue="auto" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-5">
          <TabsTrigger value="auto" className="gap-2 text-sm">
            <Timer className="w-4 h-4" />
            Auto Timer
          </TabsTrigger>
          <TabsTrigger value="manual" className="gap-2 text-sm">
            <Clock className="w-4 h-4" />
            Manual Entry
          </TabsTrigger>
        </TabsList>

        {/* Auto Timer Tab */}
        <TabsContent value="auto" className="space-y-5 mt-0">
          {/* Timer Display */}
          <div className={cn(
            "text-center py-6 sm:py-8 rounded-lg transition-all",
            timer.isRunning 
              ? "bg-primary/10 border border-primary/30 animate-pulse" 
              : "bg-accent/50"
          )}>
            <div className={cn(
              "font-mono text-4xl sm:text-5xl font-bold tracking-wider",
              timer.isRunning ? "text-primary" : "text-muted-foreground"
            )}>
              {timer.displayTime}
            </div>
            {timer.isRunning && timer.projectLabel && (
              <p className="text-sm text-muted-foreground mt-3">
                <span className="text-primary">Tag: {timer.projectLabel}</span>
              </p>
            )}
          </div>

          {/* Tag Selection */}
          <div className="flex items-center justify-center px-4">
            <TagSelect
              value={timer.isRunning ? timer.projectLabel : selectedTag}
              onChange={handleTagChange}
              tags={tags}
              onAddTag={onAddTag}
              onDeleteTag={onDeleteTag}
              placeholder="Add tag (optional)"
              className="w-auto max-w-full"
            />
          </div>

          {/* Timer Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 px-4">
            {!timer.isRunning ? (
              <Button
                onClick={handleStartTimer}
                variant="gradient"
                size="lg"
                className="gap-2 px-8 w-full sm:w-auto"
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
                  className="gap-2 px-6 w-full sm:w-auto"
                  disabled={isSaving}
                >
                  <Square className="w-5 h-5" />
                  Stop & Save
                </Button>
                <Button
                  onClick={handleDiscardTimer}
                  variant="ghost"
                  size="lg"
                  className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10 w-full sm:w-auto"
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
        <TabsContent value="manual" className="space-y-5 mt-0">
          <form onSubmit={handleManualSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Start Time
                </label>
                <Input
                  type="time"
                  value={manualStartTime}
                  onChange={(e) => setManualStartTime(e.target.value)}
                  className="bg-background h-10"
                  placeholder="09:00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  End Time
                </label>
                <Input
                  type="time"
                  value={manualEndTime}
                  onChange={(e) => setManualEndTime(e.target.value)}
                  className="bg-background h-10"
                  placeholder="17:00"
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
                    return formatTimerDisplay(diffSeconds);
                  })()}
                </span>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Tag (optional)
              </label>
              <TagSelect
                value={manualTag}
                onChange={setManualTag}
                tags={tags}
                onAddTag={onAddTag}
                onDeleteTag={onDeleteTag}
                className="w-full justify-start"
              />
            </div>

            <Button
              type="submit"
              variant="gradient"
              className="w-full gap-2 h-10"
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
