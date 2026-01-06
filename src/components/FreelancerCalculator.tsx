import { useState, useEffect, useMemo } from "react";
import { TimeFormat, TimeEntry, Currency, CURRENCIES } from "@/types/freelancer";
import { decimalToHHMMSS, formatCurrency } from "@/utils/timeUtils";

import { TimeEntryList } from "./TimeEntryList";
import { CurrencySelect } from "./CurrencySelect";
import { HourlyRateInput } from "./HourlyRateInput";
import { SummaryCard } from "./SummaryCard";
import { InvoiceDownload } from "./InvoiceDownload";
import { TimerWidget } from "./TimerWidget";
import { ConfirmDialog } from "./ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Clock, DollarSign, Calculator, Trash2, LogOut } from "lucide-react";
import logo from "@/assets/logo.png";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export function FreelancerCalculator() {
  const { user, signOut } = useAuth();
  const [timeFormat, setTimeFormat] = useState<TimeFormat>("hh:mm:ss");
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [hourlyRate, setHourlyRate] = useState<string>("");
  const [currency, setCurrency] = useState<Currency>(CURRENCIES[0]);
  const [isLoading, setIsLoading] = useState(true);
  const [showClearAllDialog, setShowClearAllDialog] = useState(false);
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagFilter, setTagFilter] = useState<string>('all');

  // Load user's data from database
  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      try {
        // Load all time entries
        const { data: entriesData, error } = await supabase
          .from("time_entries")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error loading entries:", error);
          toast({
            title: "Error loading entries",
            description: error.message,
            variant: "destructive",
          });
        } else if (entriesData) {
          const allTags = new Set<string>();

          const mappedEntries: TimeEntry[] = entriesData.map((entry) => {
            if (entry.tag) {
              allTags.add(entry.tag);
            }

            return {
              id: entry.id,
              value: entry.value,
              decimalHours: Number(entry.decimal_hours),
              createdAt: new Date(entry.created_at),
              tag: entry.tag || undefined,
            };
          });

          setEntries(mappedEntries);
          setTags(Array.from(allTags).sort());
        }
      } catch (err) {
        console.error("Error in loadData:", err);
      } finally {
        setIsLoading(false);
      }
    };

    const loadProfile = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("default_currency_code, default_hourly_rate")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data) {
        if (data.default_currency_code) {
          const savedCurrency = CURRENCIES.find((c) => c.code === data.default_currency_code);
          if (savedCurrency) setCurrency(savedCurrency);
        }
        if (data.default_hourly_rate) {
          setHourlyRate(String(data.default_hourly_rate));
        }
      }
    };

    loadData();
    loadProfile();
  }, [user]);

  // Save currency and rate to profile when changed
  useEffect(() => {
    if (!user || isLoading) return;

    const saveProfile = async () => {
      await supabase
        .from("profiles")
        .update({
          default_currency_code: currency.code,
          default_hourly_rate: hourlyRate ? parseFloat(hourlyRate) : null,
        })
        .eq("user_id", user.id);
    };

    const debounce = setTimeout(saveProfile, 500);
    return () => clearTimeout(debounce);
  }, [currency, hourlyRate, user, isLoading]);

  // Filter entries by tag
  const filteredEntries = tagFilter === 'all' 
    ? entries 
    : tagFilter === 'untagged'
    ? entries.filter(e => !e.tag)
    : entries.filter(e => e.tag === tagFilter);

  const totalDecimalHours = filteredEntries.reduce((sum, entry) => sum + entry.decimalHours, 0);
  const totalEarnings = totalDecimalHours * (parseFloat(hourlyRate) || 0);

  const handleAddTag = (tag: string) => {
    if (!tags.includes(tag)) {
      setTags((prev) => [...prev, tag].sort());
    }
  };

  const handleAddEntry = async (value: string, decimalHours: number, tag?: string) => {
    if (!user) return;

    const { data, error } = await supabase
      .from("time_entries")
      .insert({
        user_id: user.id,
        value,
        decimal_hours: decimalHours,
        tag: tag || null,
      })
      .select()
      .single();

    if (error) {
      toast({
        title: "Error adding entry",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }

    const newEntry: TimeEntry = {
      id: data.id,
      value: data.value,
      decimalHours: Number(data.decimal_hours),
      createdAt: new Date(data.created_at),
      tag: data.tag || undefined,
    };
    setEntries((prev) => [newEntry, ...prev]);

    if (tag && !tags.includes(tag)) {
      setTags((prev) => [...prev, tag].sort());
    }
  };

  // Handler for timer widget - saves time and shows toast
  const handleTimerSave = async (decimalHours: number, displayValue: string, tag?: string) => {
    await handleAddEntry(displayValue, decimalHours, tag);
  };

  const handleRemoveEntry = async (id: string) => {
    const { error } = await supabase.from("time_entries").delete().eq("id", id);

    if (error) {
      toast({
        title: "Error removing entry",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setEntries((prev) => prev.filter((entry) => entry.id !== id));
  };

  const handleClearAll = async () => {
    if (!user) return;

    const { error } = await supabase.from("time_entries").delete().eq("user_id", user.id);

    if (error) {
      toast({
        title: "Error clearing entries",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setEntries([]);
    toast({
      title: "All entries cleared",
    });
  };

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed out",
      description: "You have been signed out successfully.",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            <img src={logo} alt="Timesum" className="h-10 sm:h-12 md:h-16 w-auto" />
            <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
              <div className="hidden sm:block">
                <InvoiceDownload
                  entries={entries}
                  hourlyRate={hourlyRate}
                  currency={currency}
                  userName={user?.user_metadata?.full_name}
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSignOutDialog(true)}
                title="Sign out"
                className="h-8 w-8 sm:h-9 sm:w-9"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
          {/* Mobile Invoice Download */}
          <div className="sm:hidden mt-2">
            <InvoiceDownload
              entries={entries}
              hourlyRate={hourlyRate}
              currency={currency}
              userName={user?.user_metadata?.full_name}
            />
          </div>
        </div>
      </header>

      {/* Hero Greeting */}
      <div className="container mx-auto px-3 sm:px-4 pt-4 sm:pt-6 md:pt-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold">
          <span className="text-foreground">Hey </span>
          <span className="text-primary">
            {user?.user_metadata?.full_name?.split(" ")[0] || user?.email?.split("@")[0]}
          </span>
        </h1>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 md:space-y-8">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 animate-fade-in">
            <SummaryCard
              title="Total Hours"
              value={decimalToHHMMSS(totalDecimalHours)}
              subtitle={tagFilter === 'all' ? `${entries.length} entries logged` : `${filteredEntries.length} of ${entries.length} entries`}
              icon={<Clock className="w-6 h-6" />}
              variant="default"
            />
            <SummaryCard
              title="Hourly Rate"
              value={hourlyRate ? formatCurrency(parseFloat(hourlyRate), currency.symbol) : "—"}
              subtitle={`per hour in ${currency.code}`}
              icon={<DollarSign className="w-6 h-6" />}
              variant="default"
            />
            <SummaryCard
              title="Total Earning"
              value={formatCurrency(totalEarnings, currency.symbol)}
              subtitle={tagFilter === 'all' ? `${entries.length} entries logged` : `${filteredEntries.length} of ${entries.length} entries`}
              icon={<Calculator className="w-6 h-6" />}
              variant="default"
            />
          </div>

          {/* Timer Widget - Main Feature */}
          <div className="animate-slide-up" style={{ animationDelay: "100ms" }}>
            <h2 className="text-base sm:text-lg font-display font-semibold text-foreground mb-3 flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Track Your Time
            </h2>
            <TimerWidget onSaveTime={handleTimerSave} tags={tags} onAddTag={handleAddTag} />
          </div>

          {/* Input Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Time Entries Card */}
            <div
              className="bg-card rounded-xl border border-border p-4 sm:p-6 shadow-sm animate-slide-up"
              style={{ animationDelay: "200ms" }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 mb-4">
                <h2 className="text-base sm:text-lg font-display font-semibold text-foreground">Time Entries</h2>
                <div className="flex items-center gap-2">
                  {entries.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowClearAllDialog(true)}
                      className="text-muted-foreground hover:text-destructive text-xs sm:text-sm"
                    >
                      <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
                      Clear All
                    </Button>
                  )}
                </div>
              </div>
              <TimeEntryList 
                entries={entries} 
                format={timeFormat} 
                onRemove={handleRemoveEntry}
                tagFilter={tagFilter}
                onTagFilterChange={setTagFilter}
              />
            </div>

            {/* Rate & Currency Card */}
            <div
              className="bg-card rounded-xl border border-border p-4 sm:p-6 shadow-sm animate-slide-up"
              style={{ animationDelay: "300ms" }}
            >
              <h2 className="text-base sm:text-lg font-display font-semibold text-foreground mb-4">Rate & Currency</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Hourly Rate</label>
                  <HourlyRateInput value={hourlyRate} onChange={setHourlyRate} currency={currency} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Currency</label>
                  <CurrencySelect value={currency} onChange={setCurrency} />
                </div>

                {/* Quick calculation breakdown */}
                {totalDecimalHours > 0 && hourlyRate && (
                  <div className="mt-6 p-4 bg-accent/50 rounded-lg border border-accent animate-scale-in">
                    <h3 className="text-sm font-medium text-foreground mb-3">Calculation Breakdown</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Hours worked</span>
                        <span className="font-medium">{decimalToHHMMSS(totalDecimalHours)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Rate</span>
                        <span className="font-medium">
                          {formatCurrency(parseFloat(hourlyRate), currency.symbol)}/hr
                        </span>
                      </div>
                      <div className="border-t border-border pt-2 mt-2">
                        <div className="flex justify-between">
                          <span className="font-medium text-foreground">Total</span>
                          <span className="font-bold text-primary">
                            {formatCurrency(totalEarnings, currency.symbol)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 mt-auto py-4 sm:py-6">
        <div className="container mx-auto px-3 sm:px-4 text-center text-xs sm:text-sm text-muted-foreground">
          <p>Track your freelance hours and calculate earnings effortlessly</p>
        </div>
      </footer>

      {/* Clear All Confirmation */}
      <ConfirmDialog
        open={showClearAllDialog}
        onOpenChange={setShowClearAllDialog}
        title="Clear All Entries"
        description={`Are you sure you want to clear all ${entries.length} entries? This action cannot be undone.`}
        confirmText="Clear All"
        onConfirm={() => {
          handleClearAll();
          setShowClearAllDialog(false);
        }}
      />

      {/* Sign Out Confirmation */}
      <ConfirmDialog
        open={showSignOutDialog}
        onOpenChange={setShowSignOutDialog}
        title="Sign Out"
        description="Are you sure you want to sign out?"
        confirmText="Sign Out"
        onConfirm={() => {
          handleSignOut();
          setShowSignOutDialog(false);
        }}
        variant="default"
      />
    </div>
  );
}
