import { useState, useEffect, useMemo } from "react";
import { TimeFormat, TimeEntry, Currency, CURRENCIES } from "@/types/freelancer";
import { decimalToHHMMSS, formatDecimalHours, formatCurrency } from "@/utils/timeUtils";
import { TimeFormatToggle } from "./TimeFormatToggle";
import { TimeEntryInput } from "./TimeEntryInput";
import { TimeEntryList } from "./TimeEntryList";
import { CurrencySelect } from "./CurrencySelect";
import { HourlyRateInput } from "./HourlyRateInput";
import { SummaryCard } from "./SummaryCard";
import { InvoiceDownload } from "./InvoiceDownload";
import { MonthlyPeriodCard } from "./MonthlyPeriodCard";
import { CloseMonthDialog } from "./CloseMonthDialog";
import { ProjectFilter } from "./ProjectSelect";
import { TimerWidget } from "./TimerWidget";
import { Button } from "@/components/ui/button";
import { Clock, DollarSign, Calculator, Trash2, LogOut, Archive, History } from "lucide-react";
import logo from "@/assets/logo.png";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface MonthlyPeriod {
  id: string;
  name: string;
  month: number;
  year: number;
  isClosed: boolean;
}

export function FreelancerCalculator() {
  const { user, signOut } = useAuth();
  const [timeFormat, setTimeFormat] = useState<TimeFormat>("hh:mm:ss");
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [hourlyRate, setHourlyRate] = useState<string>("");
  const [currency, setCurrency] = useState<Currency>(CURRENCIES[0]);
  const [isLoading, setIsLoading] = useState(true);
  const [periods, setPeriods] = useState<MonthlyPeriod[]>([]);
  const [periodEntries, setPeriodEntries] = useState<Record<string, TimeEntry[]>>({});
  const [showCloseDialog, setShowCloseDialog] = useState(false);
  const [projects, setProjects] = useState<string[]>([]);
  const [projectFilter, setProjectFilter] = useState<string>('');

  // Load user's data from database
  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      // Load periods
      const { data: periodsData } = await supabase
        .from("monthly_periods")
        .select("*")
        .eq("user_id", user.id)
        .order("year", { ascending: false })
        .order("month", { ascending: false });

      if (periodsData) {
        setPeriods(
          periodsData.map((p) => ({
            id: p.id,
            name: p.name,
            month: p.month,
            year: p.year,
            isClosed: p.is_closed,
          })),
        );
      }

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
        // Separate current entries (no period) from period entries
        const current: TimeEntry[] = [];
        const byPeriod: Record<string, TimeEntry[]> = {};
        const allProjects = new Set<string>();

        entriesData.forEach((entry) => {
          const mappedEntry: TimeEntry = {
            id: entry.id,
            value: entry.value,
            decimalHours: Number(entry.decimal_hours),
            createdAt: new Date(entry.created_at),
            project: entry.project || undefined,
          };

          if (entry.project) {
            allProjects.add(entry.project);
          }

          if (entry.period_id) {
            if (!byPeriod[entry.period_id]) {
              byPeriod[entry.period_id] = [];
            }
            byPeriod[entry.period_id].push(mappedEntry);
          } else {
            current.push(mappedEntry);
          }
        });

        setEntries(current);
        setPeriodEntries(byPeriod);
        setProjects(Array.from(allProjects).sort());
      }
      setIsLoading(false);
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

  // Filtered entries for display
  const filteredEntries = useMemo(() => {
    if (!projectFilter) return entries;
    return entries.filter(e => e.project === projectFilter);
  }, [entries, projectFilter]);

  const totalDecimalHours = entries.reduce((sum, entry) => sum + entry.decimalHours, 0);
  const currentMonthEarnings = totalDecimalHours * (parseFloat(hourlyRate) || 0);

  // Calculate total earnings across all periods
  const allPeriodHours = Object.values(periodEntries)
    .flat()
    .reduce((sum, entry) => sum + entry.decimalHours, 0);
  const totalEarnings = (totalDecimalHours + allPeriodHours) * (parseFloat(hourlyRate) || 0);

  const handleAddProject = (project: string) => {
    if (!projects.includes(project)) {
      setProjects(prev => [...prev, project].sort());
    }
  };

  const handleAddEntry = async (value: string, decimalHours: number, project?: string) => {
    if (!user) return;

    const { data, error } = await supabase
      .from("time_entries")
      .insert({
        user_id: user.id,
        value,
        decimal_hours: decimalHours,
        project: project || null,
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
      project: data.project || undefined,
    };
    setEntries((prev) => [newEntry, ...prev]);
    
    if (project && !projects.includes(project)) {
      setProjects(prev => [...prev, project].sort());
    }
  };

  // Handler for timer widget - saves time and shows toast
  const handleTimerSave = async (decimalHours: number, displayValue: string, project?: string) => {
    await handleAddEntry(displayValue, decimalHours, project);
  };

  const handleAddEntryToPeriod = async (periodId: string, value: string, decimalHours: number) => {
    if (!user) return;

    const { data, error } = await supabase
      .from("time_entries")
      .insert({
        user_id: user.id,
        value,
        decimal_hours: decimalHours,
        period_id: periodId,
      })
      .select()
      .single();

    if (error) {
      toast({
        title: "Error adding entry",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    const newEntry: TimeEntry = {
      id: data.id,
      value: data.value,
      decimalHours: Number(data.decimal_hours),
      createdAt: new Date(data.created_at),
    };

    setPeriodEntries((prev) => ({
      ...prev,
      [periodId]: [newEntry, ...(prev[periodId] || [])],
    }));

    toast({
      title: "Entry added",
      description: `Added ${formatDecimalHours(decimalHours)} hours`,
    });
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

  const handleRemoveEntryFromPeriod = async (periodId: string, entryId: string) => {
    const { error } = await supabase.from("time_entries").delete().eq("id", entryId);

    if (error) {
      toast({
        title: "Error removing entry",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setPeriodEntries((prev) => ({
      ...prev,
      [periodId]: prev[periodId]?.filter((entry) => entry.id !== entryId) || [],
    }));
  };

  const handleClearAll = async () => {
    if (!user) return;

    const { error } = await supabase.from("time_entries").delete().eq("user_id", user.id).is("period_id", null);

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

  const handleCloseMonth = async (name: string, month: number, year: number) => {
    if (!user || entries.length === 0) {
      toast({
        title: "No entries to close",
        description: "Add some time entries before closing the month.",
        variant: "destructive",
      });
      return;
    }

    // Create the period
    const { data: periodData, error: periodError } = await supabase
      .from("monthly_periods")
      .insert({
        user_id: user.id,
        name,
        month,
        year,
        is_closed: true,
        closed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (periodError) {
      toast({
        title: "Error closing month",
        description: periodError.message,
        variant: "destructive",
      });
      return;
    }

    // Move current entries to the period
    const entryIds = entries.map((e) => e.id);
    const { error: updateError } = await supabase
      .from("time_entries")
      .update({ period_id: periodData.id })
      .in("id", entryIds);

    if (updateError) {
      toast({
        title: "Error moving entries",
        description: updateError.message,
        variant: "destructive",
      });
      return;
    }

    // Update local state
    const newPeriod: MonthlyPeriod = {
      id: periodData.id,
      name: periodData.name,
      month: periodData.month,
      year: periodData.year,
      isClosed: periodData.is_closed,
    };

    setPeriods((prev) => [newPeriod, ...prev]);
    setPeriodEntries((prev) => ({
      ...prev,
      [periodData.id]: entries,
    }));
    setEntries([]);

    toast({
      title: "Month closed",
      description: `${name} has been saved with ${entryIds.length} entries.`,
    });
  };

  const handleDeletePeriod = async (periodId: string) => {
    const { error } = await supabase.from("monthly_periods").delete().eq("id", periodId);

    if (error) {
      toast({
        title: "Error deleting period",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setPeriods((prev) => prev.filter((p) => p.id !== periodId));
    setPeriodEntries((prev) => {
      const updated = { ...prev };
      delete updated[periodId];
      return updated;
    });

    toast({
      title: "Period deleted",
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
                  totalDecimalHours={totalDecimalHours}
                  totalEarnings={totalEarnings}
                  userName={user?.user_metadata?.full_name}
                />
              </div>
              <TimeFormatToggle value={timeFormat} onChange={setTimeFormat} />
              <Button variant="ghost" size="icon" onClick={handleSignOut} title="Sign out" className="h-8 w-8 sm:h-9 sm:w-9">
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
              totalDecimalHours={totalDecimalHours}
              totalEarnings={totalEarnings}
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
              title="Current Month Hours"
              value={decimalToHHMMSS(totalDecimalHours)}
              subtitle={`${formatDecimalHours(totalDecimalHours)} decimal hours`}
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
              title="Current Month Earnings"
              value={formatCurrency(currentMonthEarnings, currency.symbol)}
              subtitle={`${entries.length} entries logged`}
              icon={<Calculator className="w-6 h-6" />}
              variant="default"
            />
            <SummaryCard
              title="Total Earnings"
              value={formatCurrency(totalEarnings, currency.symbol)}
              subtitle={`(${periods.length + 1} months)`}
              icon={<Calculator className="w-6 h-6" />}
              variant="primary"
            />
          </div>

          {/* Timer Widget - Main Feature */}
          <div className="animate-slide-up" style={{ animationDelay: "100ms" }}>
            <h2 className="text-base sm:text-lg font-display font-semibold text-foreground mb-3 flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Track Your Time
            </h2>
            <TimerWidget
              onSaveTime={handleTimerSave}
              projects={projects}
              onAddProject={handleAddProject}
            />
          </div>

          {/* Input Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Time Entries Card */}
            <div
              className="bg-card rounded-xl border border-border p-4 sm:p-6 shadow-sm animate-slide-up"
              style={{ animationDelay: "200ms" }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 mb-4">
                <h2 className="text-base sm:text-lg font-display font-semibold text-foreground">Current Month Entries</h2>
                <div className="flex items-center gap-2">
                  {entries.length > 0 && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowCloseDialog(true)}
                        className="text-primary border-primary/50 hover:bg-primary/10 text-xs sm:text-sm"
                      >
                        <Archive className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
                        <span className="hidden xs:inline">Close Month</span>
                        <span className="xs:hidden">Close</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClearAll}
                        className="text-muted-foreground hover:text-destructive text-xs sm:text-sm"
                      >
                        <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
                        Clear
                      </Button>
                    </>
                  )}
                </div>
              </div>
              <div className="space-y-4">
                <TimeEntryInput 
                  format={timeFormat} 
                  onAdd={async (value, decimalHours, project) => {
                    await handleAddEntry(value, decimalHours, project);
                    toast({
                      title: "Entry added",
                      description: `Added ${formatDecimalHours(decimalHours)} hours${project ? ` to ${project}` : ''}`,
                    });
                  }}
                  projects={projects}
                  onAddProject={handleAddProject}
                  showProjectSelect={true}
                />
                {projects.length > 0 && (
                  <div className="pt-1">
                    <ProjectFilter 
                      value={projectFilter} 
                      onChange={setProjectFilter} 
                      projects={projects} 
                    />
                  </div>
                )}
                <TimeEntryList entries={filteredEntries} format={timeFormat} onRemove={handleRemoveEntry} />
              </div>
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
                        <span className="font-medium">{formatDecimalHours(totalDecimalHours)} hrs</span>
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

          {/* Monthly History */}
          {periods.length > 0 && (
            <div className="animate-slide-up" style={{ animationDelay: "400ms" }}>
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <History className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                <h2 className="text-base sm:text-lg font-display font-semibold text-foreground">Monthly History</h2>
              </div>
              <div className="space-y-3">
                {periods.map((period) => (
                  <MonthlyPeriodCard
                    key={period.id}
                    period={period}
                    entries={periodEntries[period.id] || []}
                    hourlyRate={hourlyRate}
                    currency={currency}
                    timeFormat={timeFormat}
                    onAddEntry={(value, hours) => handleAddEntryToPeriod(period.id, value, hours)}
                    onRemoveEntry={(entryId) => handleRemoveEntryFromPeriod(period.id, entryId)}
                    onDeletePeriod={handleDeletePeriod}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 mt-auto py-4 sm:py-6">
        <div className="container mx-auto px-3 sm:px-4 text-center text-xs sm:text-sm text-muted-foreground">
          <p>Track your freelance hours and calculate earnings effortlessly</p>
        </div>
      </footer>

      {/* Close Month Dialog */}
      <CloseMonthDialog open={showCloseDialog} onOpenChange={setShowCloseDialog} onConfirm={handleCloseMonth} />
    </div>
  );
}
