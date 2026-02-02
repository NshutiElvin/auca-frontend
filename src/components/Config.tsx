import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Clock, Calendar, Users, Building, Settings, CheckCircle2, Plus, Trash2, 
  AlertCircle, MapPin, BarChart3, RefreshCw, FileText 
} from 'lucide-react';
import useUserAxios from '../hooks/useUserAxios';

interface ConfigProps {
    onConfigChange?: (config: any) => void;
}

const ConstraintsConfig= ({onConfigChange}: ConfigProps) => {
    const axios = useUserAxios()
   
  const [config, setConfig] = useState<any|null>(null);
  const getConfig= async()=>{
        const resp=await axios.get('/api/config/')
        setConfig(resp.data)

    }
  // Update functions
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
        time_slots: [...config.time_constraints.time_slots, 
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

  const updateConstraint = (section: string, field: string, value: any) => {
    setConfig({
      ...config,
      [section]: { ...config[section as keyof typeof config], [field]: value }
    });
  };

 

  useEffect(()=>{
    getConfig()
  },[])

  useEffect(() => {
    if (onConfigChange) {
      onConfigChange(config);
    }
  }, [config]);

  return (
    <div className=" p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            
            <div>
              <h1 className="text-4xl font-bold tracking-tight bg-clip-text ">
                Constraints Configuration
              </h1>
             
            </div>
          </div>
          
          
        </div>

        <Tabs defaultValue="time" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-9 h-auto gap-1 bg-muted/50 p-1">
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
            <TabsTrigger value="courses" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Courses</span>
            </TabsTrigger>
            <TabsTrigger value="strategy" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Strategy</span>
            </TabsTrigger>
             
            <TabsTrigger value="validation" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <CheckCircle2 className="w-4 h-4" />
              <span className="hidden sm:inline">Validation</span>
            </TabsTrigger>
          
          </TabsList>

          {/* Time Constraints Tab */}
          <TabsContent value="time" className="space-y-6">
            {config === null ? (
              <Card className="border-2">
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">Loading configuration...</p>
                </CardContent>
              </Card>
            ) : (
              <>
            <Card className="border-2">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  Time Slots Configuration
                </CardTitle>
                <CardDescription>Define available exam time slots with priorities (lower number = higher priority)</CardDescription>
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
                          <Label>Priority (1=highest)</Label>
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
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Day Restrictions
                </CardTitle>
                <CardDescription>Configure which days are blocked and special rules</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="space-y-3">
                  <Label className="text-base font-semibold">No Exam Days</Label>
                  <div className="flex flex-wrap gap-2">
                    {["Saturday", "Sunday"].map((day) => (
                      <Badge 
                        key={day} 
                        variant={config.time_constraints.day_restrictions.no_exam_days.includes(day) ? "default" : "outline"}
                        className="cursor-pointer"
                      >
                        {day}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">Default: Saturday is blocked</p>
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-semibold">Friday Special Rule</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Evening slot disabled on Fridays (Only Morning & Afternoon allowed)
                      </p>
                    </div>
                    <Badge variant="secondary">Active</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
              </>
            )}
          </TabsContent>

          {/* Student Constraints Tab */}
          <TabsContent value="students" className="space-y-6">
            {config === null ? (
              <Card className="border-2">
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">Loading configuration...</p>
                </CardContent>
              </Card>
            ) : (
              <>
            <Card className="border-2">
              <CardHeader className="bg-gradient-to-r from-blue-500/5 to-transparent">
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  Student Scheduling Constraints
                </CardTitle>
                <CardDescription>Define limits and rules to protect student wellbeing and prevent conflicts</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="max-per-day" className="flex items-center gap-2">
                      Max Exams Per Day
                      <Badge variant="outline" className="text-xs">Critical</Badge>
                    </Label>
                    <Input
                      id="max-per-day"
                      type="number"
                      value={config.student_constraints.max_exams_per_day}
                      onChange={(e: { target: { value: string; }; }) => updateConstraint('student_constraints', 'max_exams_per_day', parseInt(e.target.value))}
                      min="1"
                      max="3"
                    />
                    <p className="text-xs text-muted-foreground">Recommended: 2 (prevents student overload)</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="max-per-slot" className="flex items-center gap-2">
                      Max Exams Per Slot
                      <Badge variant="outline" className="text-xs">Critical</Badge>
                    </Label>
                    <Input
                      id="max-per-slot"
                      type="number"
                      value={config.student_constraints.max_exams_per_slot}
                      onChange={(e: { target: { value: string; }; }) => updateConstraint('student_constraints', 'max_exams_per_slot', parseInt(e.target.value))}
                      min="1"
                      max="2"
                    />
                    <p className="text-xs text-muted-foreground">Typically: 1 (prevents time conflicts)</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="min-gap">Min Gap Between Exams (days)</Label>
                    <Input
                      id="min-gap"
                      type="number"
                      value={config.student_constraints.min_gap_between_exams_days}
                      onChange={(e: { target: { value: string; }; }) => updateConstraint('student_constraints', 'min_gap_between_exams_days', parseInt(e.target.value))}
                      min="0"
                      max="7"
                    />
                    <p className="text-xs text-muted-foreground">Minimum days between consecutive exams for study time</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="max-total">Max Total Exams</Label>
                    <Input
                      id="max-total"
                      type="number"
                      value={config.student_constraints.max_total_exams}
                      onChange={(e: { target: { value: string; }; }) => updateConstraint('student_constraints', 'max_total_exams', parseInt(e.target.value))}
                      min="1"
                    />
                    <p className="text-xs text-muted-foreground">Total number of exams per student for entire period</p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <Label className="text-base font-semibold">Advanced Student Protection</Label>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex-1">
                      <Label htmlFor="consecutive" className="cursor-pointer font-medium">
                        Allow Consecutive Exams
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Permit back-to-back exams on the same day (not recommended)
                      </p>
                    </div>
                    <Switch
                      id="consecutive"
                      checked={config.student_constraints.allow_consecutive_exams}
                      onCheckedChange={(checked: any) => updateConstraint('student_constraints', 'allow_consecutive_exams', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex-1">
                      <Label htmlFor="verify-conflicts" className="cursor-pointer font-medium">
                        Verify Conflicts Before Scheduling
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Check for student conflicts before confirming schedule
                      </p>
                    </div>
                    <Switch
                      id="verify-conflicts"
                      checked={config.student_constraints.verify_conflicts_before_scheduling}
                      onCheckedChange={(checked: any) => updateConstraint('student_constraints', 'verify_conflicts_before_scheduling', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex-1">
                      <Label htmlFor="enrollment-status" className="cursor-pointer font-medium">
                        Enforce Enrollment Status
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Only schedule exams for students with "enrolled" status
                      </p>
                    </div>
                    <Switch
                      id="enrollment-status"
                      checked={config.student_constraints.enforce_enrollment_status}
                      onCheckedChange={(checked: any) => updateConstraint('student_constraints', 'enforce_enrollment_status', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
              </>
            )}
          </TabsContent>

          {/* Room Constraints Tab */}
          <TabsContent value="rooms" className="space-y-6">
            {config === null ? (
              <Card className="border-2">
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">Loading configuration...</p>
                </CardContent>
              </Card>
            ) : (
              <>
            <Card className="border-2">
              <CardHeader className="bg-gradient-to-r from-green-500/5 to-transparent">
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5 text-green-600" />
                  Room Allocation & Capacity
                </CardTitle>
                <CardDescription>Configure how rooms are allocated and shared across exams</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="capacity-buffer">Capacity Buffer (%)</Label>
                    <Input
                      id="capacity-buffer"
                      type="number"
                      value={config.room_constraints.capacity_buffer_percent}
                      onChange={(e: { target: { value: string; }; }) => updateConstraint('room_constraints', 'capacity_buffer_percent', parseInt(e.target.value))}
                      min="0"
                      max="100"
                    />
                    <p className="text-xs text-muted-foreground">Reserve extra capacity (0 = use full capacity)</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="max-per-room-slot">Max Exams Per Room Per Slot</Label>
                    <Input
                      id="max-per-room-slot"
                      type="number"
                      value={config.room_constraints.max_exams_per_room_per_slot}
                      onChange={(e: { target: { value: string; }; }) => updateConstraint('room_constraints', 'max_exams_per_room_per_slot', parseInt(e.target.value))}
                      min="1"
                    />
                    <p className="text-xs text-muted-foreground">999 = unlimited (allows full room sharing)</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="utilization">Room Utilization Threshold</Label>
                    <Input
                      id="utilization"
                      type="number"
                      step="0.1"
                      value={config.room_constraints.room_utilization_threshold}
                      onChange={(e: { target: { value: string; }; }) => updateConstraint('room_constraints', 'room_utilization_threshold', parseFloat(e.target.value))}
                      min="0"
                      max="1"
                    />
                    <p className="text-xs text-muted-foreground">Maximum capacity usage (1.0 = 100%)</p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <Label className="text-base font-semibold">Room Allocation Strategy</Label>

                  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex-1">
                      <Label htmlFor="room-sharing" className="cursor-pointer font-medium">
                        Allow Room Sharing
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Multiple exams can share the same room in the same time slot
                      </p>
                    </div>
                    <Switch
                      id="room-sharing"
                      checked={config.room_constraints.allow_room_sharing}
                      onCheckedChange={(checked: any) => updateConstraint('room_constraints', 'allow_room_sharing', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex-1">
                      <Label htmlFor="prefer-large" className="cursor-pointer font-medium">
                        Prefer Large Rooms for Large Groups
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Prioritize larger rooms for courses with more students
                      </p>
                    </div>
                    <Switch
                      id="prefer-large"
                      checked={config.room_constraints.prefer_large_rooms_for_large_groups}
                      onCheckedChange={(checked: any) => updateConstraint('room_constraints', 'prefer_large_rooms_for_large_groups', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex-1">
                      <Label htmlFor="proportional" className="cursor-pointer font-medium">
                        Enable Proportional Distribution
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Distribute students proportionally across available rooms
                      </p>
                    </div>
                    <Switch
                      id="proportional"
                      checked={config.room_constraints.enable_proportional_distribution}
                      onCheckedChange={(checked: any) => updateConstraint('room_constraints', 'enable_proportional_distribution', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex-1">
                      <Label htmlFor="cross-room" className="cursor-pointer font-medium">
                        Enable Cross-Room Exam Split
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Allow single exam to span multiple rooms when needed
                      </p>
                    </div>
                    <Switch
                      id="cross-room"
                      checked={config.room_constraints.enable_cross_room_exam_split}
                      onCheckedChange={(checked: any) => updateConstraint('room_constraints', 'enable_cross_room_exam_split', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
              </>
            )}
          </TabsContent>

          {/* Group Preferences Tab */}
          <TabsContent value="groups" className="space-y-6">
            {config === null ? (
              <Card className="border-2">
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">Loading configuration...</p>
                </CardContent>
              </Card>
            ) : (
              <>
            <Card className="border-2">
              <CardHeader className="bg-gradient-to-r from-purple-500/5 to-transparent">
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-600" />
                  Group Time Preferences
                </CardTitle>
                <CardDescription>Configure preferred time slots for different student groups (A-F)</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                {Object.entries(config.group_preferences).map(([group, prefs]: [string, any]) => (
                  <Card key={group} className="border-2 hover:border-purple-300 transition-colors">
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                              <span className="text-xl font-bold text-purple-600">  {group}</span>
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold">Group {group}</h3>
                              <p className="text-sm text-muted-foreground capitalize">{prefs.preferred_time}</p>
                            </div>
                          </div>
                          <Badge variant="secondary">Priority: {prefs.priority}</Badge>
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Slot Preference Order</Label>
                          <div className="flex gap-2">
                            {prefs.slots_order.map((slot:any, idx:number) => (
                              <Badge key={idx} variant={idx === 0 ? "default" : "outline"}>
                                {idx + 1}. {slot}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                <Alert className="border-purple-200 bg-purple-50 dark:bg-purple-950/20">
                  <AlertCircle className="h-4 w-4 text-purple-600" />
                  <AlertDescription className="text-sm text-purple-900 dark:text-purple-100">
                    Groups A & B prefer morning slots, C & D are flexible (mixed), E & F prefer evening slots
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
              </>
            )}
          </TabsContent>

          {/* Course Constraints Tab */}
          <TabsContent value="courses" className="space-y-6">
            {config === null ? (
              <Card className="border-2">
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">Loading configuration...</p>
                </CardContent>
              </Card>
            ) : (
              <>
            <Card className="border-2">
              <CardHeader className="bg-gradient-to-r from-orange-500/5 to-transparent">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-orange-600" />
                  Course & Compatibility Constraints
                </CardTitle>
                <CardDescription>Configure how courses are analyzed for compatibility and scheduled</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="space-y-4">
                  <Label className="text-base font-semibold">Conflict Detection & Resolution</Label>

                  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex-1">
                      <Label htmlFor="prioritize-large" className="cursor-pointer font-medium">
                        Prioritize Large Courses
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Schedule courses with more students first for better room allocation
                      </p>
                    </div>
                    <Switch
                      id="prioritize-large"
                      checked={config.course_constraints.prioritize_large_courses}
                      onCheckedChange={(checked: any) => updateConstraint('course_constraints', 'prioritize_large_courses', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex-1">
                      <Label htmlFor="split-groups" className="cursor-pointer font-medium">
                        Allow Split Groups
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Groups within a course can be scheduled at different times
                      </p>
                    </div>
                    <Switch
                      id="split-groups"
                      checked={config.course_constraints.allow_split_groups}
                      onCheckedChange={(checked: any) => updateConstraint('course_constraints', 'allow_split_groups', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex-1">
                      <Label htmlFor="group-combinations" className="cursor-pointer font-medium">
                        Allow Course-Group Combinations
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Groups without student overlap can share the same time slot
                      </p>
                    </div>
                    <Switch
                      id="group-combinations"
                      checked={config.course_constraints.allow_course_group_combinations}
                      onCheckedChange={(checked: any) => updateConstraint('course_constraints', 'allow_course_group_combinations', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex-1">
                      <Label htmlFor="auto-detect" className="cursor-pointer font-medium">
                        Detect Student Conflicts Automatically
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Build conflict matrix based on student enrollments
                      </p>
                    </div>
                    <Switch
                      id="auto-detect"
                      checked={config.course_constraints.detect_student_conflicts_automatically}
                      onCheckedChange={(checked: any) => updateConstraint('course_constraints', 'detect_student_conflicts_automatically', checked)}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <Label className="text-base font-semibold">Algorithm Configuration</Label>

                  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex-1">
                      <Label htmlFor="compatibility-graph" className="cursor-pointer font-medium">
                        Build Compatibility Graph
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Create graph of courses that can be scheduled together
                      </p>
                    </div>
                    <Switch
                      id="compatibility-graph"
                      checked={config.course_constraints.build_compatibility_graph}
                      onCheckedChange={(checked: any) => updateConstraint('course_constraints', 'build_compatibility_graph', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex-1">
                      <Label htmlFor="greedy-coloring" className="cursor-pointer font-medium">
                        Use Greedy Coloring Algorithm
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Apply graph coloring for optimal timeslot assignment
                      </p>
                    </div>
                    <Switch
                      id="greedy-coloring"
                      checked={config.course_constraints.use_greedy_coloring_algorithm}
                      onCheckedChange={(checked: any) => updateConstraint('course_constraints', 'use_greedy_coloring_algorithm', checked)}
                    />
                  </div>
                </div>

                <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-sm text-orange-900 dark:text-orange-100">
                    The system uses compatibility graphs and greedy coloring to minimize conflicts while maximizing room utilization
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
              </>
            )}
          </TabsContent>

          {/* Scheduling Strategy Tab */}
          <TabsContent value="strategy" className="space-y-6">
            {config === null ? (
              <Card className="border-2">
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">Loading configuration...</p>
                </CardContent>
              </Card>
            ) : (
              <>
            <Card className="border-2">
              <CardHeader className="bg-gradient-to-r from-indigo-500/5 to-transparent">
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-indigo-600" />
                  Scheduling Strategy & Optimization
                </CardTitle>
                <CardDescription>Configure the scheduling algorithm behavior and optimization goals</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="optimization-goal">Optimization Goal</Label>
                    <Select
                      value={config.scheduling_strategy.optimization_goal}
                      onValueChange={(value: any) => updateConstraint('scheduling_strategy', 'optimization_goal', value)}
                    >
                      <SelectTrigger id="optimization-goal">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="minimize_student_conflicts">Minimize Student Conflicts</SelectItem>
                        <SelectItem value="maximize_room_utilization">Maximize Room Utilization</SelectItem>
                        <SelectItem value="balance_workload">Balance Workload</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sorting-strategy">Course Sorting Strategy</Label>
                    <Select
                      value={config.scheduling_strategy.sorting_strategy}
                      onValueChange={(value: any) => updateConstraint('scheduling_strategy', 'sorting_strategy', value)}
                    >
                      <SelectTrigger id="sorting-strategy">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="size_and_conflicts">Size & Conflicts (Descending)</SelectItem>
                        <SelectItem value="size_only">Size Only</SelectItem>
                        <SelectItem value="conflicts_only">Conflicts Only</SelectItem>
                        <SelectItem value="random">Random</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="max-attempts">Max Scheduling Attempts</Label>
                    <Input
                      id="max-attempts"
                      type="number"
                      value={config.scheduling_strategy.max_scheduling_attempts}
                      onChange={(e: { target: { value: string; }; }) => updateConstraint('scheduling_strategy', 'max_scheduling_attempts', parseInt(e.target.value))}
                      min="1"
                      max="10"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="search-range">Search Range (days)</Label>
                    <Input
                      id="search-range"
                      type="number"
                      value={config.scheduling_strategy.search_range_days}
                      onChange={(e: { target: { value: string; }; }) => updateConstraint('scheduling_strategy', 'search_range_days', parseInt(e.target.value))}
                      min="7"
                      max="30"
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <Label className="text-base font-semibold">Scheduling Behavior</Label>

                  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex-1">
                      <Label htmlFor="backtracking" className="cursor-pointer font-medium">
                        Enable Backtracking
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Allow algorithm to backtrack and try alternative solutions
                      </p>
                    </div>
                    <Switch
                      id="backtracking"
                      checked={config.scheduling_strategy.backtracking_enabled}
                      onCheckedChange={(checked: any) => updateConstraint('scheduling_strategy', 'backtracking_enabled', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex-1">
                      <Label htmlFor="prefer-slot-order" className="cursor-pointer font-medium">
                        Prefer Slot Order (Group Preferences)
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Respect group preferences when selecting time slots
                      </p>
                    </div>
                    <Switch
                      id="prefer-slot-order"
                      checked={config.scheduling_strategy.prefer_slot_order}
                      onCheckedChange={(checked: any) => updateConstraint('scheduling_strategy', 'prefer_slot_order', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex-1">
                      <Label htmlFor="spread-evenly" className="cursor-pointer font-medium">
                        Spread Exams Evenly
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Distribute exams evenly across available dates
                      </p>
                    </div>
                    <Switch
                      id="spread-evenly"
                      checked={config.scheduling_strategy.spread_exams_evenly}
                      onCheckedChange={(checked: any) => updateConstraint('scheduling_strategy', 'spread_exams_evenly', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex-1">
                      <Label htmlFor="same-date-first" className="cursor-pointer font-medium">
                        Try Same Date First
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Attempt to schedule on suggested date before searching alternatives
                      </p>
                    </div>
                    <Switch
                      id="same-date-first"
                      checked={config.scheduling_strategy.try_same_date_first}
                      onCheckedChange={(checked: any) => updateConstraint('scheduling_strategy', 'try_same_date_first', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex-1">
                      <Label htmlFor="adjacency-opt" className="cursor-pointer font-medium">
                        Enable Adjacency Optimization
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Keep split courses in adjacent timeslots when possible
                      </p>
                    </div>
                    <Switch
                      id="adjacency-opt"
                      checked={config.scheduling_strategy.enable_adjacency_optimization}
                      onCheckedChange={(checked: any) => updateConstraint('scheduling_strategy', 'enable_adjacency_optimization', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
              </>
            )}
          </TabsContent>

          

          {/* Validation Constraints Tab */}
          <TabsContent value="validation" className="space-y-6">
            {config === null ? (
              <Card className="border-2">
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">Loading configuration...</p>
                </CardContent>
              </Card>
            ) : (
              <>
            <Card className="border-2">
              <CardHeader className="bg-gradient-to-r from-emerald-500/5 to-transparent">
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  Validation & Verification
                </CardTitle>
                <CardDescription>Configure schedule validation rules and quality checks</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex-1">
                    <Label htmlFor="verify-student-conflicts" className="cursor-pointer font-medium">
                      Verify No Student Conflicts
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Check that no student has multiple exams at the same time
                    </p>
                  </div>
                  <Switch
                    id="verify-student-conflicts"
                    checked={config.validation_constraints.verify_no_student_conflicts}
                    onCheckedChange={(checked: any) => updateConstraint('validation_constraints', 'verify_no_student_conflicts', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex-1">
                    <Label htmlFor="verify-room-capacity" className="cursor-pointer font-medium">
                      Verify Room Capacity
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Ensure no room is over-allocated beyond its capacity
                    </p>
                  </div>
                  <Switch
                    id="verify-room-capacity"
                    checked={config.validation_constraints.verify_room_capacity}
                    onCheckedChange={(checked: any) => updateConstraint('validation_constraints', 'verify_room_capacity', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex-1">
                    <Label htmlFor="verify-day-off" className="cursor-pointer font-medium">
                      Verify Day Off Constraints
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Check minimum gap requirements between student exams
                    </p>
                  </div>
                  <Switch
                    id="verify-day-off"
                    checked={config.validation_constraints.verify_day_off_constraints}
                    onCheckedChange={(checked: any) => updateConstraint('validation_constraints', 'verify_day_off_constraints', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex-1">
                    <Label htmlFor="check-semester" className="cursor-pointer font-medium">
                      Check Semester Compatibility
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Verify semesters have required gaps ({'>'}2 semesters apart)
                    </p>
                  </div>
                  <Switch
                    id="check-semester"
                    checked={config.validation_constraints.check_semester_compatibility}
                    onCheckedChange={(checked: any) => updateConstraint('validation_constraints', 'check_semester_compatibility', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex-1">
                    <Label htmlFor="verify-after-creation" className="cursor-pointer font-medium">
                      Verify Schedule After Creation
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Run full validation suite after generating schedule
                    </p>
                  </div>
                  <Switch
                    id="verify-after-creation"
                    checked={config.validation_constraints.verify_schedule_after_creation}
                    onCheckedChange={(checked: any) => updateConstraint('validation_constraints', 'verify_schedule_after_creation', checked)}
                  />
                </div>

                <Alert className="border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <AlertDescription className="text-sm text-emerald-900 dark:text-emerald-100">
                    Validation checks ensure schedule quality and catch potential issues before deployment
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
              </>
            )}
          </TabsContent>

          
        </Tabs>

        
      </div>
    </div>
  );
};

export default ConstraintsConfig;