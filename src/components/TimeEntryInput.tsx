import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TimeFormat } from '@/types/freelancer';
import { isValidHHMMSS, isValidDecimal, parseHHMMSS, parseDecimal } from '@/utils/timeUtils';
import { Plus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { ProjectSelect } from './ProjectSelect';

interface TimeEntryInputProps {
  format: TimeFormat;
  onAdd: (value: string, decimalHours: number, project?: string) => void;
  projects?: string[];
  onAddProject?: (project: string) => void;
  showProjectSelect?: boolean;
}

export function TimeEntryInput({ 
  format, 
  onAdd, 
  projects = [], 
  onAddProject,
  showProjectSelect = true 
}: TimeEntryInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [selectedProject, setSelectedProject] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim()) {
      toast({
        title: "Please enter a value",
        variant: "destructive",
      });
      return;
    }

    if (format === 'hh:mm:ss') {
      if (!isValidHHMMSS(inputValue)) {
        toast({
          title: "Invalid format",
          description: "Please use hh:mm:ss, hh:mm, or just hours",
          variant: "destructive",
        });
        return;
      }
      const decimalHours = parseHHMMSS(inputValue);
      onAdd(inputValue, decimalHours, selectedProject || undefined);
    } else {
      if (!isValidDecimal(inputValue)) {
        toast({
          title: "Invalid format",
          description: "Please enter a valid decimal number",
          variant: "destructive",
        });
        return;
      }
      const decimalHours = parseDecimal(inputValue);
      onAdd(inputValue, decimalHours, selectedProject || undefined);
    }
    
    setInputValue('');
  };

  return (
    <div className="space-y-2">
      <form onSubmit={handleSubmit} className="flex gap-2 sm:gap-3">
        <Input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={format === 'hh:mm:ss' ? 'e.g., 2:30:00' : 'e.g., 2.5'}
          className="flex-1 bg-card border-border h-10 sm:h-12 text-sm sm:text-base"
        />
        <Button type="submit" variant="gradient" size="lg" className="gap-1.5 sm:gap-2 h-10 sm:h-12 px-3 sm:px-4">
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="hidden xs:inline">Add</span>
        </Button>
      </form>
      {showProjectSelect && (
        <ProjectSelect
          value={selectedProject}
          onChange={setSelectedProject}
          projects={projects}
          onAddProject={onAddProject}
        />
      )}
    </div>
  );
}
