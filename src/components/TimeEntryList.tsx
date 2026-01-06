import { useState } from 'react';
import { TimeEntry } from '@/types/freelancer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Clock, Tag, Filter } from 'lucide-react';
import { decimalToHHMMSS } from '@/utils/timeUtils';
import { ConfirmDialog } from './ConfirmDialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TimeEntryListProps {
  entries: TimeEntry[];
  format?: string; // kept for compatibility but not used
  onRemove: (id: string) => void;
  tagFilter: string;
  onTagFilterChange: (value: string) => void;
}

export function TimeEntryList({ entries, onRemove, tagFilter, onTagFilterChange }: TimeEntryListProps) {
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; value: string } | null>(null);

  // Get unique tags from entries
  const uniqueTags = Array.from(new Set(entries.filter(e => e.tag).map(e => e.tag as string))).sort();

  // Filter entries by selected tag
  const filteredEntries = tagFilter === 'all' 
    ? entries 
    : tagFilter === 'untagged'
    ? entries.filter(e => !e.tag)
    : entries.filter(e => e.tag === tagFilter);

  const handleDeleteClick = (id: string, value: string) => {
    setDeleteTarget({ id, value });
  };

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      onRemove(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
        <Clock className="w-12 h-12 mb-3 opacity-50" />
        <p className="text-sm sm:text-base">No time entries yet</p>
        <p className="text-xs text-muted-foreground/70">Add your first entry above</p>
      </div>
    );
  }

  return (
    <>
      {/* Tag Filter */}
      {(uniqueTags.length > 0 || tagFilter !== 'all') && (
        <div className="mb-4">
          <Select value={tagFilter} onValueChange={onTagFilterChange}>
            <SelectTrigger className="w-full sm:w-52 h-9 text-sm">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <SelectValue placeholder="Filter by tag" />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-popover z-50">
              <SelectItem value="all">All entries ({entries.length})</SelectItem>
              <SelectItem value="untagged">Untagged ({entries.filter(e => !e.tag).length})</SelectItem>
              {uniqueTags.map((tag) => (
                <SelectItem key={tag} value={tag}>
                  {tag} ({entries.filter(e => e.tag === tag).length})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {filteredEntries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
          <Tag className="w-10 h-10 mb-2 opacity-50" />
          <p className="text-sm">No entries with this filter</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-72 overflow-y-auto">
          {filteredEntries.map((entry, index) => (
            <div
              key={entry.id}
              className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg group animate-scale-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <span className="text-muted-foreground text-sm font-mono w-6 flex-shrink-0 text-center">
                  #{filteredEntries.length - index}
                </span>
                <div className="flex flex-col min-w-0 gap-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-foreground text-sm sm:text-base font-mono">
                      {decimalToHHMMSS(entry.decimalHours)}
                    </span>
                    {entry.tag && (
                      <Badge variant="secondary" className="text-xs gap-1 py-0.5 px-2 h-5">
                        <Tag className="w-3 h-3" />
                        <span className="max-w-[80px] sm:max-w-[120px] truncate">{entry.tag}</span>
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground truncate">
                    {entry.createdAt.toLocaleDateString()} • {entry.value}
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDeleteClick(entry.id, entry.value)}
                className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive h-8 w-8 flex-shrink-0 ml-2"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Entry"
        description={`Are you sure you want to delete this time entry? This action cannot be undone.`}
        confirmText="Delete"
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
