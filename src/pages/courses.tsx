import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { ArrowUpDown, ChevronDown, Loader2, Scissors, Plus, Trash2, GripVertical, Users, Clock, User } from "lucide-react";

import { Button } from "../components/ui/button";
import { Checkbox } from "../components/ui/checkbox";
import { Label } from "../components/ui/label";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { Input } from "../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import useUserAxios from "../hooks/useUserAxios";
import TableSkeleton from "../components/TableSkeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import useToast from "../hooks/useToast";
import { Badge } from "../components/ui/badge";

// ─── Types ────────────────────────────────────────────────────────────────────

export type Course = {
  id?: number;
  code: string;
  title: string;
  description: string;
  credits: string;
  instructor: string;
  semester: any;
  start_date: Date;
  end_date: Date;
  enrollment_limit: number;
  prerequisites: any[];
  schedules: any[];
};

type UpdatingMap = Record<number, boolean>;

interface SplitSection {
  id: string;
  label: string;
  time: string;
  instructorId: string;
  groups: any[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TIME_SLOTS = ["Morning", "Afternoon", "Evening"];

const SLOT_COLORS: Record<string, string> = {
  Morning: "bg-amber-50 border-amber-200 text-amber-800",
  Afternoon: "bg-sky-50 border-sky-200 text-sky-800",
  Evening: "bg-violet-50 border-violet-200 text-violet-800",
};

const SLOT_BADGE: Record<string, string> = {
  Morning: "bg-amber-100 text-amber-700 border-amber-300",
  Afternoon: "bg-sky-100 text-sky-700 border-sky-300",
  Evening: "bg-violet-100 text-violet-700 border-violet-300",
};

const uid = () => Math.random().toString(36).slice(2, 8);

function buildProportionalSections(groups: any[], n: number): SplitSection[] {
  const chunkSize = Math.ceil(groups.length / n);
  return Array.from({ length: n }, (_, i) => {
    const slot = TIME_SLOTS[i % TIME_SLOTS.length];
    const chunk = groups.slice(i * chunkSize, i * chunkSize + chunkSize);
    return {
      id: uid(),
      label: `Section ${i + 1}`,
      time: slot,
      instructorId: chunk[0]?.instructor?.id?.toString() ?? "",
      groups: chunk,
    };
  });
}

// ─── Columns ──────────────────────────────────────────────────────────────────

export const columns: ColumnDef<Course>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "code",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Code <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="capitalize">{row.getValue("code")}</div>,
  },
  {
    accessorKey: "title",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Title <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="capitalize">{row.getValue("title")}</div>,
  },
  {
    accessorKey: "credits",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Credits <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div>{row.getValue("credits")}</div>,
  },
  {
    accessorKey: "department",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Department <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div>{row.getValue("department")}</div>,
  },
  {
    accessorKey: "campus",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Campus <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div>{row.getValue("campus")}</div>,
  },
  {
    accessorKey: "semester",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Semester <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div>{row.getValue("semester")}</div>,
  },
  {
    accessorKey: "enrollments",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Enrollments <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div>{row.getValue("enrollments")}</div>,
  },
];

// ─── Main Page ────────────────────────────────────────────────────────────────

export function CoursesPage() {
  const axios = useUserAxios();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [isLoading, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);
  const [data, setData] = React.useState<Course[]>([]);
  const [departments, setDepartments] = React.useState<string[]>([]);
  const [campuses, setCampuses] = React.useState<string[]>([]);
  const { setToastMessage } = useToast();
  const [instructors, setInstructors] = React.useState<any[]>([]);

  // ── Manage dialog state ──
  const [isGroupsDialogOpen, setIsGroupsDialogOpen] = React.useState(false);
  const [isGettingGroups, setIsGettingGroups] = React.useState(false);
  const [selectedCourse, setSelectedCourse] = React.useState<Course | null>(null);
  const [selectedCourseGroups, setSelectedCourseGroups] = React.useState<any[]>([]);
  const [updatingGroups, setUpdatingGroups] = React.useState<UpdatingMap>({});
  const [bulkTime, setBulkTime] = React.useState<string>("__keep__");
  const [bulkInstructor, setBulkInstructor] = React.useState<string>("__keep__");
  const [isBulkUpdating, setIsBulkUpdating] = React.useState(false);

  // ── Split dialog state ──
  const [isSplitDialogOpen, setIsSplitDialogOpen] = React.useState(false);
  const [splitSections, setSplitSections] = React.useState<SplitSection[]>([]);
  const [splitUnassigned, setSplitUnassigned] = React.useState<any[]>([]);
  const [isSplitSaving, setIsSplitSaving] = React.useState(false);
  const dragRef = React.useRef<{ groupId: number; fromSectionId: string | null } | null>(null);
  const [dragOverSectionId, setDragOverSectionId] = React.useState<string | null>(null);
  const [dragOverUnassigned, setDragOverUnassigned] = React.useState(false);

  const timeMap: Record<string, { start_time: string; end_time: string }> = {
    Morning: { start_time: "08:00:00", end_time: "11:00:00" },
    Afternoon: { start_time: "13:00:00", end_time: "16:00:00" },
    Evening: { start_time: "17:00:00", end_time: "20:00:00" },
  };

  // ── API ──

  const getInstructors = async () => {
    try {
      const resp = await axios.get("/api/users/instructors");
      if (resp.data.success) setInstructors(resp.data.data);
    } catch {}
  };

  const getCourseGroups = async (courseId: number) => {
    setIsGettingGroups(true);
    try {
      const resp = await axios.get(`/api/courses/${courseId}/course-groups/`);
      setSelectedCourseGroups(resp.data.data);
    } catch (error) {
      console.error("Error fetching course groups:", error);
    } finally {
      setIsGettingGroups(false);
    }
  };

  const updateCourseGroupTimes = async (
    groupId: number,
    courseId: number,
    time: string,
    instructorId: any,
  ) => {
    setUpdatingGroups((prev) => ({ ...prev, [groupId]: true }));
    try {
      await axios.put(
        `/api/courses/update-course-group-times/${courseId}/${groupId}/`,
        { dayTime: time, instructor: instructorId },
      );
      setToastMessage({ variant: "success", message: "Course information updated successfully." });
      await getCourseGroups(courseId);
    } catch {
      setToastMessage({ message: "Failed to update the course information. Please try again.", variant: "danger" });
    } finally {
      setUpdatingGroups((prev) => ({ ...prev, [groupId]: false }));
    }
  };

  // ── Manage dialog handlers ──

  const handleOpenManageDialog = (course: Course) => {
    setSelectedCourse(course);
    setSelectedCourseGroups([]);
    setIsGroupsDialogOpen(true);
    setBulkTime("__keep__");
    setBulkInstructor("__keep__");
    getCourseGroups(Number(course.id));
  };

  const handleCloseManageDialog = () => {
    setIsGroupsDialogOpen(false);
    setSelectedCourse(null);
    setSelectedCourseGroups([]);
    setUpdatingGroups({});
    setBulkTime("__keep__");
    setBulkInstructor("__keep__");
  };

  const handleSelectAll = async () => {
    if (!selectedCourse || selectedCourseGroups.length === 0) return;
    setIsBulkUpdating(true);
    try {
      await Promise.all(
        selectedCourseGroups.map((group) => {
          const currentTime =
            Object.keys(timeMap).find((key) => timeMap[key].start_time === group.start_time) ?? "Morning";
          return axios.put(
            `/api/courses/update-course-group-times/${selectedCourse.id}/${group.id}/`,
            {
              dayTime: bulkTime !== "__keep__" ? bulkTime : currentTime,
              instructor: bulkInstructor !== "__keep__" ? bulkInstructor : (group.instructor?.id ?? null),
            },
          );
        }),
      );
      setToastMessage({ variant: "success", message: "All groups updated successfully." });
      await getCourseGroups(Number(selectedCourse.id));
    } catch {
      setToastMessage({ message: "Failed to update some groups.", variant: "danger" });
    } finally {
      setIsBulkUpdating(false);
    }
  };

  // ── Split dialog handlers ──

  const handleOpenSplitDialog = () => {
    setSplitSections(buildProportionalSections(selectedCourseGroups, 2));
    setSplitUnassigned([]);
    setIsSplitDialogOpen(true);
  };

  const handleCloseSplitDialog = () => {
    setIsSplitDialogOpen(false);
    setSplitSections([]);
    setSplitUnassigned([]);
  };

  const addSplitSection = () => {
    setSplitSections((prev) => [
      ...prev,
      { id: uid(), label: `Section ${prev.length + 1}`, time: TIME_SLOTS[prev.length % TIME_SLOTS.length], instructorId: "", groups: [] },
    ]);
  };

  const removeSplitSection = (sectionId: string) => {
    const section = splitSections.find((s) => s.id === sectionId);
    if (section) setSplitUnassigned((prev) => [...prev, ...section.groups]);
    setSplitSections((prev) => prev.filter((s) => s.id !== sectionId));
  };

  const updateSplitSection = (sectionId: string, patch: Partial<Omit<SplitSection, "id" | "groups">>) => {
    setSplitSections((prev) => prev.map((s) => (s.id === sectionId ? { ...s, ...patch } : s)));
  };

  const splitByInstructor = () => {
    const instructorMap: Record<string, any[]> = {};
    const noInstructor: any[] = [];
    selectedCourseGroups.forEach((g) => {
      if (g.instructor) {
        const key = String(g.instructor.id);
        instructorMap[key] = [...(instructorMap[key] || []), g];
      } else {
        noInstructor.push(g);
      }
    });
    const newSections: SplitSection[] = Object.entries(instructorMap).map(([instId, groups], i) => {
      const inst = instructors.find((ins) => String(ins.id) === instId);
      const currentTime = Object.keys(timeMap).find((k) => timeMap[k].start_time === groups[0]?.start_time) ?? TIME_SLOTS[i % TIME_SLOTS.length];
      return {
        id: uid(),
        label: inst ? `${inst.first_name} ${inst.last_name}` : `Section ${i + 1}`,
        time: currentTime,
        instructorId: instId,
        groups,
      };
    });
    setSplitSections(newSections);
    setSplitUnassigned(noInstructor);
  };

  // ── Drag & drop ──

  const onDragStart = (groupId: number, fromSectionId: string | null) => {
    dragRef.current = { groupId, fromSectionId };
  };

  const onDropToSection = (toSectionId: string) => {
    const drag = dragRef.current;
    if (!drag || drag.fromSectionId === toSectionId) return;
    const group =
      drag.fromSectionId === null
        ? splitUnassigned.find((g) => g.id === drag.groupId)
        : splitSections.find((s) => s.id === drag.fromSectionId)?.groups.find((g) => g.id === drag.groupId);
    if (!group) return;
    if (drag.fromSectionId === null) {
      setSplitUnassigned((prev) => prev.filter((g) => g.id !== drag.groupId));
    } else {
      setSplitSections((prev) =>
        prev.map((s) => s.id === drag.fromSectionId ? { ...s, groups: s.groups.filter((g) => g.id !== drag.groupId) } : s)
      );
    }
    setSplitSections((prev) =>
      prev.map((s) => s.id === toSectionId ? { ...s, groups: [...s.groups, group] } : s)
    );
    dragRef.current = null;
    setDragOverSectionId(null);
  };

  const onDropToUnassigned = () => {
    const drag = dragRef.current;
    if (!drag || drag.fromSectionId === null) return;
    const group = splitSections.find((s) => s.id === drag.fromSectionId)?.groups.find((g) => g.id === drag.groupId);
    if (!group) return;
    setSplitSections((prev) =>
      prev.map((s) => s.id === drag.fromSectionId ? { ...s, groups: s.groups.filter((g) => g.id !== drag.groupId) } : s)
    );
    setSplitUnassigned((prev) => [...prev, group]);
    dragRef.current = null;
    setDragOverUnassigned(false);
  };

  const handleSplitSave = async () => {
    if (splitUnassigned.length > 0) {
      setToastMessage({ message: `${splitUnassigned.length} group(s) still unassigned.`, variant: "danger" });
      return;
    }
    setIsSplitSaving(true);
    try {
      await Promise.all(
        splitSections.flatMap((s) =>
          s.groups.map((g) =>
            axios.put(
              `/api/courses/update-course-group-times/${selectedCourse!.id}/${g.id}/`,
              { dayTime: s.time, instructor: s.instructorId || null },
            )
          )
        )
      );
      setToastMessage({ variant: "success", message: "Groups split and saved successfully." });
      await getCourseGroups(Number(selectedCourse!.id));
      handleCloseSplitDialog();
    } catch {
      setToastMessage({ message: "Failed to save split. Please try again.", variant: "danger" });
    } finally {
      setIsSplitSaving(false);
    }
  };

  // ── Group card (used inside split dialog) ──

  const GroupCard = ({ group, fromSectionId }: { group: any; fromSectionId: string | null }) => (
    <div
      draggable
      onDragStart={() => onDragStart(group.id, fromSectionId)}
      onDragEnd={() => { dragRef.current = null; setDragOverSectionId(null); setDragOverUnassigned(false); }}
      className="flex items-center gap-2 px-3 py-2 bg-white border rounded-md shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow select-none"
    >
      <GripVertical className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{group.group_name}</p>
        {group.instructor && (
          <p className="text-xs text-muted-foreground truncate">
            {group.instructor.first_name} {group.instructor.last_name}
          </p>
        )}
      </div>
    </div>
  );

  // ── Courses fetch ──

  const fetchCourses = () => {
    startTransition(async () => {
      setError(null);
      try {
        const resp = await axios.get("/api/courses/");
        const coursesData = resp.data.data.map((d: any) => ({
          ...d,
          department: d.department.name,
          enrollments: d.students_enrolled,
          semester: d.semester.name,
          campus: d.department?.location?.name || "Unknown Campus",
        }));
        setData(coursesData);
        setDepartments([...new Set(coursesData.map((c: any) => c.department))].filter(Boolean) as string[]);
        setCampuses([...new Set(coursesData.map((c: any) => c.campus))].filter(Boolean) as string[]);
      } catch {
        setError("Failed to fetch courses");
      }
    });
  };

  React.useEffect(() => {
    fetchCourses();
    getInstructors();
  }, []);

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: { sorting, columnFilters, columnVisibility, rowSelection },
  });

  const departmentFilterValue = (table.getColumn("department")?.getFilterValue() as string) || "all";
  const campusFilterValue = (table.getColumn("campus")?.getFilterValue() as string) || "all";

  // ── Render ──

  return isLoading ? (
    <TableSkeleton />
  ) : error ? (
    <div className="flex flex-col items-center justify-center h-64 w-full">
      <div className="text-red-500 mb-4">{error}</div>
      <Button variant="outline" onClick={fetchCourses}>Retry</Button>
    </div>
  ) : (
    <div className="p-4">

      {/* ════════════════════════════════════════
          Manage Groups Dialog
      ════════════════════════════════════════ */}
      <Dialog open={isGroupsDialogOpen} onOpenChange={(open) => { if (!open) handleCloseManageDialog(); }}>
        <DialogContent className="min-w-[60vw] h-[80vh] flex flex-col overflow-hidden">
          <DialogHeader className="shrink-0">
            <DialogTitle>Manage Groups & Instructors for {selectedCourse?.title}</DialogTitle>
          </DialogHeader>

          {/* Bulk Actions Panel */}
          <div className="shrink-0 border rounded-md p-3 bg-muted/40 space-y-3">
            {/* SELECT ALL */}
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">
                Select All — apply to every group
              </p>
              <div className="flex flex-wrap items-end gap-3">
                <div className="flex flex-col gap-1">
                  <span className="text-xs">Time Slot</span>
                  <select
                    value={bulkTime}
                    onChange={(e) => setBulkTime(e.target.value)}
                    className="p-2 border rounded-md text-sm"
                  >
                    <option value="__keep__">Keep existing</option>
                    {TIME_SLOTS.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs">Instructor</span>
                  <select
                    value={bulkInstructor}
                    onChange={(e) => setBulkInstructor(e.target.value)}
                    className="p-2 border rounded-md text-sm"
                  >
                    <option value="__keep__">Keep existing</option>
                    {instructors.map((ins) => (
                      <option key={ins.id} value={ins.id}>{ins.first_name} {ins.last_name}</option>
                    ))}
                  </select>
                </div>
                <Button
                  size="sm"
                  disabled={isBulkUpdating || isGettingGroups || (bulkTime === "__keep__" && bulkInstructor === "__keep__")}
                  onClick={handleSelectAll}
                >
                  {isBulkUpdating && <Loader2 className="animate-spin w-4 h-4 mr-1" />}
                  Apply to All
                </Button>
              </div>
            </div>

            <div className="border-t" />

            {/* SPLIT */}
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">Split Groups</p>
              <div className="flex items-center gap-3">
                <p className="text-sm text-muted-foreground flex-1">
                  Drag & drop groups into custom sections, split by instructor, or use equal presets.
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isGettingGroups || selectedCourseGroups.length < 2}
                  onClick={handleOpenSplitDialog}
                >
                  <Scissors className="w-3.5 h-3.5 mr-1.5" />
                  Open Split Tool
                </Button>
              </div>
            </div>
          </div>

          {/* Groups list */}
          <div className="flex-1 overflow-y-auto mt-2 pr-1">
            {isGettingGroups ? (
              <div className="flex items-center justify-center h-32"><Loader2 className="animate-spin" /></div>
            ) : selectedCourseGroups.length > 0 ? (
              <ul className="space-y-2">
                {selectedCourseGroups.map((group, idx) => (
                  <li key={group.id} className="p-4 border rounded-md">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <span className="text-sm text-muted-foreground">Group #{idx + 1}</span>
                        <h3 className="text-lg font-semibold">{group.group_name}</h3>
                        {group.instructor && (
                          <Badge>{group.instructor.first_name} {group.instructor.last_name}</Badge>
                        )}
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm">Instructor</span>
                        <select
                          defaultValue={group.instructor?.id ?? ""}
                          onChange={(e) =>
                            updateCourseGroupTimes(
                              group.id, Number(selectedCourse?.id),
                              Object.keys(timeMap).find((key) => timeMap[key].start_time === group.start_time) ?? "Morning",
                              e.target.value,
                            )
                          }
                          className="p-2 border rounded-md"
                        >
                          <option value="" disabled>Select Instructor</option>
                          {instructors.map((ins) => (
                            <option value={ins.id} key={ins.id}>{ins.first_name} {ins.last_name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm">Time Slot</span>
                        <select
                          defaultValue={Object.keys(timeMap).find((key) => timeMap[key].start_time === group.start_time) ?? "Morning"}
                          onChange={(e) =>
                            updateCourseGroupTimes(group.id, Number(selectedCourse?.id), e.target.value, group.instructor?.id ?? null)
                          }
                          className="p-2 border rounded-md"
                        >
                          <option disabled>Select Time</option>
                          {TIME_SLOTS.map((time) => <option key={time} value={time}>{time}</option>)}
                        </select>
                      </div>
                      <div className="w-5">
                        {updatingGroups[group.id] && <Loader2 className="animate-spin w-4 h-4" />}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center text-muted-foreground py-8">No groups found for this course.</div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* ════════════════════════════════════════
          Split Groups Dialog (drag & drop)
      ════════════════════════════════════════ */}
      <Dialog open={isSplitDialogOpen} onOpenChange={(open) => { if (!open) handleCloseSplitDialog(); }}>
        <DialogContent className="min-w-[80vw] lg:max-w-[1100px] h-[90vh] flex flex-col overflow-hidden p-0">
          {/* Header */}
          <DialogHeader className="px-6 py-4 border-b shrink-0">
            <DialogTitle className="text-lg">
              Split Groups — <span className="text-muted-foreground font-normal">{selectedCourse?.title}</span>
            </DialogTitle>
            <p className="text-sm text-muted-foreground mt-0.5">
              Drag groups between sections. Each section gets its own time slot and instructor.
            </p>
          </DialogHeader>

          {/* Toolbar */}
          <div className="px-6 py-3 border-b bg-muted/30 shrink-0 flex flex-wrap items-center gap-2">
            <Button size="sm" variant="outline" onClick={addSplitSection}>
              <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Section
            </Button>
            <Button size="sm" variant="outline" onClick={splitByInstructor}>
              <User className="w-3.5 h-3.5 mr-1.5" /> Split by Instructor
            </Button>
            <div className="flex gap-1.5 ml-1">
              {[2, 3, 4].map((n) => (
                <Button
                  key={n} size="sm" variant="ghost" className="h-7 px-2 text-xs"
                  onClick={() => { setSplitSections(buildProportionalSections(selectedCourseGroups, n)); setSplitUnassigned([]); }}
                >
                  {n} equal
                </Button>
              ))}
            </div>
            <div className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              {selectedCourseGroups.length} total · {splitSections.length} section{splitSections.length !== 1 ? "s" : ""}
              {splitUnassigned.length > 0 && (
                <span className="text-red-500 font-medium">· {splitUnassigned.length} unassigned</span>
              )}
            </div>
          </div>

          {/* Canvas */}
          <div className="flex-1  flex flex-wrap">
            {/* Sections */}
            <div className="flex-1 flex-wrap">
              <div
                className="flex gap-4 p-4 h-full flex-wrap"
                style={{ minWidth: `${Math.max(splitSections.length, 1) * 260}px` }}
              >
                {splitSections.map((section) => (
                  <div
                    key={section.id}
                    className="flex flex-col w-60 shrink-0"
                    onDragOver={(e) => { e.preventDefault(); setDragOverSectionId(section.id); }}
                    onDragLeave={() => setDragOverSectionId(null)}
                    onDrop={() => onDropToSection(section.id)}
                  >
                    {/* Section header */}
                    <div className={`rounded-t-lg border-2 p-3 transition-colors ${dragOverSectionId === section.id ? "border-primary bg-primary/5" : SLOT_COLORS[section.time] || "bg-gray-50 border-gray-200"}`}>
                      <input
                        value={section.label}
                        onChange={(e) => updateSplitSection(section.id, { label: e.target.value })}
                        className="w-full bg-transparent font-semibold text-sm mb-2 outline-none border-b border-transparent focus:border-current"
                      />
                      <div className="flex items-center gap-1 mb-1.5">
                        <Clock className="w-3 h-3 shrink-0 opacity-60" />
                        <select
                          value={section.time}
                          onChange={(e) => updateSplitSection(section.id, { time: e.target.value })}
                          className="flex-1 text-xs bg-transparent outline-none cursor-pointer"
                        >
                          {TIME_SLOTS.map((t) => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3 shrink-0 opacity-60" />
                        <select
                          value={section.instructorId}
                          onChange={(e) => updateSplitSection(section.id, { instructorId: e.target.value })}
                          className="flex-1 text-xs bg-transparent outline-none cursor-pointer truncate"
                        >
                          <option value="">No instructor</option>
                          {instructors.map((ins) => (
                            <option key={ins.id} value={String(ins.id)}>{ins.first_name} {ins.last_name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Groups */}
                    <div className={`flex-1 border-2 border-t-0 rounded-b-lg p-2 space-y-1.5 overflow-y-auto min-h-[120px] transition-colors ${dragOverSectionId === section.id ? "border-primary bg-primary/5" : "border-gray-200 bg-gray-50/50"}`}>
                      {section.groups.length === 0 ? (
                        <div className="flex items-center justify-center h-16 text-xs text-muted-foreground border border-dashed rounded-md">
                          Drop groups here
                        </div>
                      ) : (
                        section.groups.map((g) => <GroupCard key={g.id} group={g} fromSectionId={section.id} />)
                      )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-xs text-muted-foreground">{section.groups.length} group{section.groups.length !== 1 ? "s" : ""}</span>
                      <button onClick={() => removeSplitSection(section.id)} className="text-xs text-red-400 hover:text-red-600 flex items-center gap-0.5 transition-colors">
                        <Trash2 className="w-3 h-3" /> Remove
                      </button>
                    </div>
                  </div>
                ))}

                {splitSections.length === 0 && (
                  <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
                    No sections yet. Click "Add Section" or choose a preset split.
                  </div>
                )}
              </div>
            </div>

            {/* Unassigned sidebar */}
            <div
              className={`w-52 shrink-0 border-l flex flex-col transition-colors ${dragOverUnassigned ? "bg-red-50 border-red-200" : "bg-muted/20"}`}
              onDragOver={(e) => { e.preventDefault(); setDragOverUnassigned(true); }}
              onDragLeave={() => setDragOverUnassigned(false)}
              onDrop={onDropToUnassigned}
            >
              <div className="px-3 py-2.5 border-b shrink-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Unassigned</p>
                <p className="text-xs text-muted-foreground mt-0.5">{splitUnassigned.length} group{splitUnassigned.length !== 1 ? "s" : ""}</p>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
                {splitUnassigned.length === 0 ? (
                  <div className="flex items-center justify-center h-16 text-xs text-muted-foreground border border-dashed rounded-md mt-1">
                    All assigned ✓
                  </div>
                ) : (
                  splitUnassigned.map((g) => <GroupCard key={g.id} group={g} fromSectionId={null} />)
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t shrink-0 flex items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {splitSections.map((s) => (
                <span key={s.id} className={`text-xs px-2 py-0.5 rounded border font-medium ${SLOT_BADGE[s.time] || "bg-gray-100 text-gray-600 border-gray-300"}`}>
                  {s.label}: {s.groups.length}g · {s.time}
                </span>
              ))}
            </div>
            <div className="flex gap-2 ml-4 shrink-0">
              <Button variant="outline" onClick={handleCloseSplitDialog} disabled={isSplitSaving}>Cancel</Button>
              <Button onClick={handleSplitSave} disabled={isSplitSaving || splitUnassigned.length > 0}>
                {isSplitSaving && <Loader2 className="animate-spin w-4 h-4 mr-1.5" />}
                Save {splitSections.length} Section{splitSections.length !== 1 ? "s" : ""}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ════════════════════════════════════════
          Filters
      ════════════════════════════════════════ */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 p-4">
        <div className="flex flex-col gap-1">
          <Label>Title</Label>
          <Input
            placeholder="Filter titles..."
            value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
            onChange={(e) => table.getColumn("title")?.setFilterValue(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label>Code</Label>
          <Input
            placeholder="Filter codes..."
            value={(table.getColumn("code")?.getFilterValue() as string) ?? ""}
            onChange={(e) => table.getColumn("code")?.setFilterValue(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label>Department</Label>
          <Select
            value={departmentFilterValue}
            onValueChange={(value) => table.getColumn("department")?.setFilterValue(value === "all" ? "" : value)}
          >
            <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map((dept) => <SelectItem key={dept} value={dept}>{dept}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1">
          <Label>Campus</Label>
          <Select
            value={campusFilterValue}
            onValueChange={(value) => table.getColumn("campus")?.setFilterValue(value === "all" ? "" : value)}
          >
            <SelectTrigger><SelectValue placeholder="Select campus" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Campuses</SelectItem>
              {campuses.map((campus) => <SelectItem key={campus} value={campus}>{campus}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table Controls */}
      <div className="flex items-center gap-4 mb-4">
        <Input
          placeholder="Search all columns..."
          onChange={(e) => table.setGlobalFilter(e.target.value)}
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">Columns <ChevronDown className="ml-2 h-4 w-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table.getAllColumns().filter((c) => c.getCanHide()).map((column) => (
              <DropdownMenuCheckboxItem
                key={column.id} className="capitalize"
                checked={column.getIsVisible()}
                onCheckedChange={(value) => column.toggleVisibility(!!value)}
              >
                {column.id}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
                <TableHead />
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                  <TableCell>
                    <Button variant="outline" onClick={() => handleOpenManageDialog(row.original)}>Manage</Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length + 1} className="h-24 text-center">No results found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col md:flex-row items-center justify-between py-4 gap-4">
        <div className="text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="flex items-center space-x-2">
          <div className="text-sm text-muted-foreground">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </div>
          <Button variant="outline" size="sm" onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}>First</Button>
          <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Previous</Button>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Next</Button>
          <Button variant="outline" size="sm" onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()}>Last</Button>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm">Rows per page:</span>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => table.setPageSize(Number(value))}
          >
            <SelectTrigger className="w-20"><SelectValue /></SelectTrigger>
            <SelectContent>
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>{pageSize}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}