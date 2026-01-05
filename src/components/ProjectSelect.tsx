import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { FolderOpen, Plus, X, Check, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProjectSelectProps {
  value: string;
  onChange: (value: string) => void;
  projects: string[];
  onAddProject?: (project: string) => void;
  placeholder?: string;
  className?: string;
}

export function ProjectSelect({
  value,
  onChange,
  projects,
  onAddProject,
  placeholder = "No project",
  className,
}: ProjectSelectProps) {
  const [open, setOpen] = useState(false);
  const [newProject, setNewProject] = useState('');

  const handleAddProject = () => {
    if (newProject.trim() && !projects.includes(newProject.trim())) {
      onAddProject?.(newProject.trim());
      onChange(newProject.trim());
      setNewProject('');
      setOpen(false);
    }
  };

  const handleSelect = (project: string) => {
    onChange(project);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "h-8 gap-1.5 text-xs font-normal border-dashed",
            value ? "border-primary/50 text-primary" : "text-muted-foreground",
            className
          )}
        >
          <FolderOpen className="w-3.5 h-3.5" />
          {value || placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2" align="start">
        <div className="space-y-2">
          {/* Clear selection */}
          <button
            onClick={() => handleSelect('')}
            className={cn(
              "w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-accent transition-colors",
              !value && "bg-accent"
            )}
          >
            <X className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">No project</span>
            {!value && <Check className="w-3.5 h-3.5 ml-auto" />}
          </button>

          {/* Existing projects */}
          {projects.map((project) => (
            <button
              key={project}
              onClick={() => handleSelect(project)}
              className={cn(
                "w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-accent transition-colors",
                value === project && "bg-accent"
              )}
            >
              <FolderOpen className="w-3.5 h-3.5 text-primary" />
              <span className="truncate">{project}</span>
              {value === project && <Check className="w-3.5 h-3.5 ml-auto" />}
            </button>
          ))}

          {/* Add new project */}
          {onAddProject && (
            <div className="pt-2 border-t border-border">
              <div className="flex gap-1.5">
                <Input
                  value={newProject}
                  onChange={(e) => setNewProject(e.target.value)}
                  placeholder="New project..."
                  className="h-7 text-xs"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddProject()}
                />
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0"
                  onClick={handleAddProject}
                  disabled={!newProject.trim()}
                >
                  <Plus className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

interface ProjectFilterProps {
  value: string;
  onChange: (value: string) => void;
  projects: string[];
  onDeleteProject?: (project: string) => void;
}

export function ProjectFilter({ value, onChange, projects, onDeleteProject }: ProjectFilterProps) {
  if (projects.length === 0) return null;

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <Badge
        variant={value === '' ? 'default' : 'outline'}
        className="cursor-pointer text-xs"
        onClick={() => onChange('')}
      >
        All
      </Badge>
      {projects.map((project) => (
        <Badge
          key={project}
          variant={value === project ? 'default' : 'outline'}
          className="cursor-pointer text-xs group relative pr-6"
          onClick={() => onChange(project)}
        >
          {project}
          {onDeleteProject && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteProject(project);
              }}
              className="absolute right-1 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100 hover:text-destructive transition-opacity"
              title={`Delete ${project}`}
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </Badge>
      ))}
    </div>
  );
}
