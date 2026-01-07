import { useEffect, useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { ToastAction } from '@/components/ui/toast';

// Milestones for entries: 10, 50, 100, 200, 500, 1000...
const ENTRY_MILESTONES = [10, 50, 100, 200, 500, 1000];
// Milestones for tags: 2, 5, 10, 20...
const TAG_MILESTONES = [2, 5, 10, 20];

const STORAGE_KEY = 'timesum_shown_milestones';

interface ShownMilestones {
  entries: number[];
  tags: number[];
}

export function useSupportReminder(userId: string | undefined, entriesCount: number, tagsCount: number) {
  const [shownMilestones, setShownMilestones] = useState<ShownMilestones>({ entries: [], tags: [] });
  const navigate = useNavigate();

  // Load shown milestones from localStorage
  useEffect(() => {
    if (!userId) return;
    
    const stored = localStorage.getItem(`${STORAGE_KEY}_${userId}`);
    if (stored) {
      try {
        setShownMilestones(JSON.parse(stored));
      } catch {
        setShownMilestones({ entries: [], tags: [] });
      }
    }
  }, [userId]);

  // Check for entry milestones
  useEffect(() => {
    if (!userId || entriesCount === 0) return;

    const milestone = ENTRY_MILESTONES.find(
      (m) => entriesCount >= m && !shownMilestones.entries.includes(m)
    );

    if (milestone) {
      // Show appreciation toast
      setTimeout(() => {
        toast({
          title: `🎉 ${milestone} entries logged!`,
          description: "Thanks for sticking with us! Consider supporting the project if it's helping you.",
          duration: 8000,
          action: <ToastAction altText="Support" onClick={() => navigate('/support')}>Support</ToastAction>,
        });
      }, 1000);

      // Mark as shown
      const updated = {
        ...shownMilestones,
        entries: [...shownMilestones.entries, milestone],
      };
      setShownMilestones(updated);
      localStorage.setItem(`${STORAGE_KEY}_${userId}`, JSON.stringify(updated));
    }
  }, [entriesCount, userId, shownMilestones, navigate]);

  // Check for tag milestones
  useEffect(() => {
    if (!userId || tagsCount === 0) return;

    const milestone = TAG_MILESTONES.find(
      (m) => tagsCount >= m && !shownMilestones.tags.includes(m)
    );

    if (milestone) {
      setTimeout(() => {
        toast({
          title: `✨ ${milestone} tags created!`,
          description: "You're getting organized! Love using Timesum? Consider supporting its development.",
          duration: 8000,
          action: <ToastAction altText="Support" onClick={() => navigate('/support')}>Support</ToastAction>,
        });
      }, 1500);

      const updated = {
        ...shownMilestones,
        tags: [...shownMilestones.tags, milestone],
      };
      setShownMilestones(updated);
      localStorage.setItem(`${STORAGE_KEY}_${userId}`, JSON.stringify(updated));
    }
  }, [tagsCount, userId, shownMilestones, navigate]);
}
