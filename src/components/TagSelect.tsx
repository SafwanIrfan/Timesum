import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Tag, Plus, X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TagSelectProps {
  value: string;
  onChange: (value: string) => void;
  tags: string[];
  onAddTag?: (tag: string) => void;
  placeholder?: string;
  className?: string;
}

export function TagSelect({
  value,
  onChange,
  tags,
  onAddTag,
  placeholder = "Add tag (optional)",
  className,
}: TagSelectProps) {
  const [open, setOpen] = useState(false);
  const [newTag, setNewTag] = useState('');

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      onAddTag?.(newTag.trim());
      onChange(newTag.trim());
      setNewTag('');
      setOpen(false);
    } else if (newTag.trim() && tags.includes(newTag.trim())) {
      onChange(newTag.trim());
      setNewTag('');
      setOpen(false);
    }
  };

  const handleSelect = (tag: string) => {
    onChange(tag);
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
          <Tag className="w-3.5 h-3.5" />
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
            <span className="text-muted-foreground">No tag</span>
            {!value && <Check className="w-3.5 h-3.5 ml-auto" />}
          </button>

          {/* Existing tags */}
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => handleSelect(tag)}
              className={cn(
                "w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-accent transition-colors",
                value === tag && "bg-accent"
              )}
            >
              <Tag className="w-3.5 h-3.5 text-primary" />
              <span className="truncate">{tag}</span>
              {value === tag && <Check className="w-3.5 h-3.5 ml-auto" />}
            </button>
          ))}

          {/* Add new tag */}
          {onAddTag && (
            <div className="pt-2 border-t border-border">
              <div className="flex gap-1.5">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="New tag..."
                  className="h-7 text-xs"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                />
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0"
                  onClick={handleAddTag}
                  disabled={!newTag.trim()}
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
