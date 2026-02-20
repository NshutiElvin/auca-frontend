import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Clock, Calendar, Users, Building, Plus, Trash2, 
  AlertCircle, FileText, ArrowUp, ArrowDown
} from 'lucide-react';
import useUserAxios from '../hooks/useUserAxios';

interface ConfigProps {
    onConfigChange?: (config: any) => void;
}

const ConstraintsConfig = ({ onConfigChange }: ConfigProps) => {
  const axios = useUserAxios();
  const [config, setConfig] = useState<any | null>(null);

  const getConfig = async () => {
    const resp = await axios.get('/api/config/');
    setConfig(resp.data);
  };

  // ── Time Slots ─────────────────────────────────────────────────────────────
  const updateTimeSlot = (index: number, field: string, value: number | string) => {
    const newSlots = [...config.time_constraints.time_slots];
    newSlots[index] = { ...newSlots[index], [field]: value };
    setConfig({
      ...config,
      time_constraints: { ...config.time_constraints, time_slots: newSlots }
    });
  };

  const addTimeSlot = () => {
    setConfig({
      ...config,
      time_constraints: {
        ...config.time_constraints,
        time_slots: [
          ...config.time_constraints.time_slots,
          { name: "New Slot", start_time: "09:00", end_time: "12:00", priority: config.time_constraints.time_slots.length + 1 }
        ]
      }
    });
  };

  const removeTimeSlot = (index: number) => {
    const newSlots = config.time_constraints.time_slots.filter((_: any, i: number) => i !== index);
    setConfig({
      ...config,
      time_constraints: { ...config.time_constraints, time_slots: newSlots }
    });
  };

  // ── Generic section field update ───────────────────────────────────────────
  const updateConstraint = (section: string, field: string, value: any) => {
    setConfig({
      ...config,
      [section]: { ...config[section as keyof typeof config], [field]: value }
    });
  };

  // ── No Exam Days toggle ────────────────────────────────────────────────────
  const toggleNoExamDay = (day: string) => {
    const current: string[] = config.time_constraints.day_restrictions.no_exam_days;
    const updated = current.includes(day)
      ? current.filter((d: string) => d !== day)
      : [...current, day];
    setConfig({
      ...config,
      time_constraints: {
        ...config.time_constraints,
        day_restrictions: { ...config.time_constraints.day_restrictions, no_exam_days: updated }
      }
    });
  };

  // ── Special rules allowed slots toggle ────────────────────────────────────
  const toggleAllowedSlot = (day: string, slotName: string) => {
    const rule = config.time_constraints.day_restrictions.special_rules[day] || {};
    const allowed: string[] = rule.allowed_slots || [];
    const updated = allowed.includes(slotName)
      ? allowed.filter((s: string) => s !== slotName)
      : [...allowed, slotName];
    setConfig({
      ...config,
      time_constraints: {
        ...config.time_constraints,
        day_restrictions: {
          ...config.time_constraints.day_restrictions,
          special_rules: {
            ...config.time_constraints.day_restrictions.special_rules,
            [day]: { allowed_slots: updated }
          }
        }
      }
    });
  };

  // ── Holidays ───────────────────────────────────────────────────────────────
  const addHoliday = (date: string) => {
    const updated = [...config.time_constraints.day_restrictions.holidays, date];
    setConfig({
      ...config,
      time_constraints: {
        ...config.time_constraints,
        day_restrictions: { ...config.time_constraints.day_restrictions, holidays: updated }
      }
    });
  };

  const removeHoliday = (index: number) => {
    const updated = config.time_constraints.day_restrictions.holidays.filter((_: any, i: number) => i !== index);
    setConfig({
      ...config,
      time_constraints: {
        ...config.time_constraints,
        day_restrictions: { ...config.time_constraints.day_restrictions, holidays: updated }
      }
    });
  };

  // ── Group preferences ──────────────────────────────────────────────────────
  const moveSlot = (group: string, fromIdx: number, toIdx: number) => {
    const order = [...config.group_preferences[group].slots_order];
    const [moved] = order.splice(fromIdx, 1);
    order.splice(toIdx, 0, moved);
    setConfig({
      ...config,
      group_preferences: {
        ...config.group_preferences,
        [group]: { ...config.group_preferences[group], slots_order: order }
      }
    });
  };

  const updateGroupPriority = (group: string, value: number) => {
    setConfig({
      ...config,
      group_preferences: {
        ...config.group_preferences,
        [group]: { ...config.group_preferences[group], priority: value }
      }
    });
  };

  useEffect(() => { getConfig(); }, []);
  useEffect(() => {
    if (onConfigChange) onConfigChange(config);
  }, [config]);

  const LoadingCard = () => (
    <Card className="border-2">
      <CardContent className="pt-6">
        <p className="text-center text-muted-foreground">Loading configuration...</p>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-4xl font-bold tracking-tight bg-clip-text">
                Constraints Configuration
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Only settings enforced by the scheduling algorithm are shown.
              </p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="time" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 h-auto gap-1 bg-muted/50 p-1">
            <TabsTrigger value="time" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Clock className="w-4 h-4" />
              <span className="hidden sm:inline">Time</span>
            </TabsTrigger>
            <TabsTrigger value="students" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Students</span>
            </TabsTrigger>
            <TabsTrigger value="rooms" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Building className="w-4 h-4" />
              <span className="hidden sm:inline">Rooms</span>
            </TabsTrigger>
            <TabsTrigger value="groups" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Groups</span>
            </TabsTrigger>
          </TabsList>

          {/* ── TIME TAB ───────────────────────────────────────────────────── */}
          <TabsContent value="time" className="space-y-6">
            {config === null ? <LoadingCard /> : (
              <>
                {/* Time Slots */}
                {/* <Card className="border-2">
                  <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-primary" />
                      Time Slots Configuration
                    </CardTitle>
                    <CardDescription>
                      Define available exam time slots. These provide the slot names used throughout
                      scheduling, the actual start/end times saved on each exam, and the default
                      slot ordering when no group preference applies. Priority: lower = tried first.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-4">
                    {config.time_constraints.time_slots.map((slot: any, index: number) => (
                      <Card key={index} className="border-2 border-primary/20 hover:border-primary/40 transition-colors">
                        <CardContent className="pt-6">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="space-y-2">
                              <Label>Slot Name</Label>
                              <Input
                                value={slot.name}
                                onChange={(e: { target: { value: string; }; }) => updateTimeSlot(index, 'name', e.target.value)}
                                placeholder="e.g., Morning"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Start Time</Label>
                              <Input
                                type="time"
                                value={slot.start_time}
                                onChange={(e: { target: { value: string; }; }) => updateTimeSlot(index, 'start_time', e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>End Time</Label>
                              <Input
                                type="time"
                                value={slot.end_time}
                                onChange={(e: { target: { value: string; }; }) => updateTimeSlot(index, 'end_time', e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Priority (1 = highest)</Label>
                              <div className="flex gap-2">
                                <Input
                                  type="number"
                                  value={slot.priority}
                                  onChange={(e: { target: { value: string; }; }) => updateTimeSlot(index, 'priority', parseInt(e.target.value))}
                                  min="1"
                                  className="flex-1"
                                />
                                <Button
                                  variant="destructive"
                                  size="icon"
                                  onClick={() => removeTimeSlot(index)}
                                  disabled={config.time_constraints.time_slots.length === 1}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    <Button onClick={addTimeSlot} variant="outline" className="w-full border-dashed border-2">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Time Slot
                    </Button>
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-sm">
                        Slot names here must exactly match the names used in Group Preferences (e.g. "Morning", "Afternoon", "Evening").
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card> */}

                {/* Day Restrictions */}
                <Card className="border-2">
                  <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-primary" />
                      Day Restrictions
                    </CardTitle>
                    <CardDescription>Configure which days are blocked and special per-day slot rules</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-6">

                    {/* No Exam Days */}
                    <div className="space-y-3">
                      <Label className="text-base font-semibold">No Exam Days</Label>
                      <p className="text-sm text-muted-foreground">
                        Dates falling on these weekdays are completely excluded from scheduling.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"].map((day) => (
                          <Badge
                            key={day}
                            variant={config.time_constraints.day_restrictions.no_exam_days.includes(day) ? "default" : "outline"}
                            className="cursor-pointer select-none"
                            onClick={() => toggleNoExamDay(day)}
                          >
                            {day}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    {/* Holidays */}
                    <div className="space-y-3">
                      <Label className="text-base font-semibold">Holidays</Label>
                      <p className="text-sm text-muted-foreground">
                        Specific dates excluded from scheduling regardless of weekday.
                      </p>
                      <div className="flex flex-wrap gap-2 items-center">
                        {config.time_constraints.day_restrictions.holidays.map((h: string, i: number) => (
                          <Badge key={i} variant="secondary" className="flex items-center gap-1">
                            {h}
                            <button
                              className="ml-1 hover:text-destructive font-bold"
                              onClick={() => removeHoliday(i)}
                            >×</button>
                          </Badge>
                        ))}
                        <HolidayAdder onAdd={addHoliday} />
                      </div>
                    </div>

                    <Separator />

                    {/* Special Rules */}
                    <div className="space-y-3">
                      <Label className="text-base font-semibold">Special Day Rules</Label>
                      <p className="text-sm text-muted-foreground">
                        Restrict which slots are allowed on specific weekdays.
                        Click a slot badge to toggle whether it's permitted on that day.
                      </p>
                      {Object.entries(config.time_constraints.day_restrictions.special_rules).map(([day, rule]: [string, any]) => (
                        <div key={day} className="p-4 border rounded-lg space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{day}</span>
                            <Badge variant="secondary">Active</Badge>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {config.time_constraints.time_slots.map((s: any) => {
                              const allowed: string[] = rule.allowed_slots || [];
                              const isAllowed = allowed.includes(s.name);
                              return (
                                <Badge
                                  key={s.name}
                                  variant={isAllowed ? "default" : "outline"}
                                  className="cursor-pointer select-none"
                                  onClick={() => toggleAllowedSlot(day, s.name)}
                                >
                                  {s.name}
                                </Badge>
                              );
                            })}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Highlighted slots are allowed on {day}. Others will be skipped by the scheduler.
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* ── STUDENTS TAB ───────────────────────────────────────────────── */}
          <TabsContent value="students" className="space-y-6">
            {config === null ? <LoadingCard /> : (
              <Card className="border-2">
                <CardHeader className="bg-gradient-to-r from-blue-500/5 to-transparent">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    Student Scheduling Constraints
                  </CardTitle>
                  <CardDescription>
                    All three settings below are actively enforced during scheduling.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    <div className="space-y-2">
                      <Label htmlFor="max-per-day" className="flex items-center gap-2">
                        Max Exams Per Day
                        <Badge variant="destructive" className="text-xs">Enforced</Badge>
                      </Label>
                      <Input
                        id="max-per-day"
                        type="number"
                        value={config.student_constraints.max_exams_per_day}
                        onChange={(e: { target: { value: string; }; }) => updateConstraint('student_constraints', 'max_exams_per_day', parseInt(e.target.value))}
                        min="1"
                        max="3"
                      />
                      <p className="text-xs text-muted-foreground">
                        A student already at this limit on a given day blocks that day from being used for scheduling.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="max-per-slot" className="flex items-center gap-2">
                        Max Exams Per Slot
                        <Badge variant="destructive" className="text-xs">Enforced</Badge>
                      </Label>
                      <Input
                        id="max-per-slot"
                        type="number"
                        value={config.student_constraints.max_exams_per_slot}
                        onChange={(e: { target: { value: string; }; }) => updateConstraint('student_constraints', 'max_exams_per_slot', parseInt(e.target.value))}
                        min="1"
                        max="2"
                      />
                      <p className="text-xs text-muted-foreground">
                        Set to 1 to prevent a student from sitting two exams in the same time slot.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="min-gap" className="flex items-center gap-2">
                        Min Gap Between Exams (days)
                        <Badge variant="destructive" className="text-xs">Enforced</Badge>
                      </Label>
                      <Input
                        id="min-gap"
                        type="number"
                        value={config.student_constraints.min_gap_between_exams_days}
                        onChange={(e: { target: { value: string; }; }) => updateConstraint('student_constraints', 'min_gap_between_exams_days', parseInt(e.target.value))}
                        min="0"
                        max="7"
                      />
                      <p className="text-xs text-muted-foreground">
                        Minimum calendar days between any two exams for the same student. Set to 0 to disable.
                      </p>
                    </div>
                  </div>

                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      These are the only student constraint fields read by the scheduling function.
                      Other fields (max_total_exams, allow_consecutive_exams, verify_conflicts_before_scheduling,
                      enforce_enrollment_status) are stored in config but not currently enforced during scheduling.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* ── ROOMS TAB ──────────────────────────────────────────────────── */}
          <TabsContent value="rooms" className="space-y-6">
            {config === null ? <LoadingCard /> : (
              <Card className="border-2">
                <CardHeader className="bg-gradient-to-r from-green-500/5 to-transparent">
                  <CardTitle className="flex items-center gap-2">
                    <Building className="w-5 h-5 text-green-600" />
                    Room Capacity
                  </CardTitle>
                  <CardDescription>
                    Only the capacity buffer is enforced during scheduling. All other room settings
                    apply only during the room-allocation phase that runs after scheduling completes.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <div className="max-w-xs space-y-2">
                    <Label htmlFor="capacity-buffer" className="flex items-center gap-2">
                      Capacity Buffer (%)
                      <Badge variant="destructive" className="text-xs">Enforced</Badge>
                    </Label>
                    <Input
                      id="capacity-buffer"
                      type="number"
                      value={config.room_constraints.capacity_buffer_percent}
                      onChange={(e: { target: { value: string; }; }) => updateConstraint('room_constraints', 'capacity_buffer_percent', parseInt(e.target.value))}
                      min="0"
                      max="100"
                    />
                    <p className="text-xs text-muted-foreground">
                      Reduces effective seat count. E.g. 10% on 100 seats = 90 usable seats.
                      Set to 0 to use full capacity.
                    </p>
                  </div>

                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      Settings like allow_room_sharing, prefer_large_rooms_for_large_groups,
                      enable_proportional_distribution, enable_cross_room_exam_split,
                      max_exams_per_room_per_slot, and room_utilization_threshold are stored
                      but not read by the scheduling function.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* ── GROUPS TAB ─────────────────────────────────────────────────── */}
           
        </Tabs>
      </div>
    </div>
  );
};

// ── Inline holiday date adder ──────────────────────────────────────────────
const HolidayAdder = ({ onAdd }: { onAdd: (date: string) => void }) => {
  const [val, setVal] = useState('');
  return (
    <div className="flex items-center gap-2">
      <Input
        type="date"
        value={val}
        onChange={(e: any) => setVal(e.target.value)}
        className="h-7 text-xs w-36"
      />
      <Button
        size="sm"
        variant="outline"
        className="h-7 text-xs"
        disabled={!val}
        onClick={() => { if (val) { onAdd(val); setVal(''); } }}
      >
        <Plus className="w-3 h-3 mr-1" /> Add
      </Button>
    </div>
  );
};

export default ConstraintsConfig;