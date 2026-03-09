import React, { useContext, useEffect, useState, useTransition } from "react";

import {
  Users,
  FileText,
  Play,
  CheckCircle,
  BarChart3,
  Clock,
  Clock12,
  Loader2,
  CalendarCheck,
  CalendarClock,
  TrendingUp,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from "recharts";
import useUserAxios from "../hooks/useUserAxios";
import useToast from "../hooks/useToast";
import { ListBulletIcon, LockClosedIcon } from "@radix-ui/react-icons";

import { Link, useNavigate } from "react-router-dom";
import { StatusButton } from "../components/ui/status-button";
import { format } from "date-fns";
import LocationContext from "../contexts/LocationContext";

// ─────────────────────────────────────────────────────────────────────────────
// Custom Tooltip
// ─────────────────────────────────────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const dayData = payload[0].payload;
    const totalSubmissions = dayData.submissionsTotal;
    const exams = dayData.originalData.submissions;

    return (
      <div className="bg-background border border-border p-3 rounded-lg shadow-lg min-w-[180px]">
        <p className="font-semibold text-foreground text-sm mb-1">{label}</p>
        <p className="text-xs text-muted-foreground mb-2">
          Total:{" "}
          <span className="text-foreground font-medium">{totalSubmissions}</span>
        </p>
        <div className="max-h-48 overflow-y-auto space-y-0.5">
          {exams.map((exam: any, index: number) => (
            <div key={index} className="flex justify-between items-center gap-3 text-xs">
              <span className="text-muted-foreground truncate max-w-[150px]">{exam.name}</span>
              <span className="text-foreground font-medium flex-shrink-0">{exam.student_count}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

// ─────────────────────────────────────────────────────────────────────────────
// Stat card accent config — uses CSS variables + opacity so they work dark/light
// ─────────────────────────────────────────────────────────────────────────────

const STAT_ACCENT = [
  // bg tint class,  icon color class,  ring color class
  "hsl(var(--foreground) / 0.06)",  // Today Exams
  "hsl(38 95% 50% / 0.12)",         // Upcoming
  "hsl(142 71% 45% / 0.12)",        // Ongoing
  "hsl(48 96% 53% / 0.12)",         // Students now
  "hsl(0 84% 60% / 0.12)",          // Completed today
  "hsl(217 91% 60% / 0.12)",        // Expected
  "hsl(262 83% 58% / 0.12)",        // Scheduled
  "hsl(142 71% 45% / 0.12)",        // Completed %
] as const;

const ICON_COLOR = [
  "text-foreground",
  "text-amber-500",
  "text-emerald-500",
  "text-yellow-500",
  "text-red-500",
  "text-blue-500",
  "text-violet-500",
  "text-emerald-500",
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

const DashboardPage = () => {
  const [dashboardData, setDashboardData] = useState({
    today_students: 0,
    total_exams: 0,
    ongoing_exams: 0,
    completed_exams: 0,
    completed_percentage: 0,
    scheduled_percentage: 0,
    cancelled_percentage: 0,
    today_exams: 0,
    ongoing_percentage: 0,
    weekly_exams_by_day: [],
    exams_with_most_students: [],
    recent_exams: [],
    recent_expected_exams: 0,
    recent_completed_exams: 0,
    upcoming_exams: 0,
  });
  const [isGettingDashboard, startGettingDashboardTransition] = useTransition();
  const { setToastMessage } = useToast();
  const axios = useUserAxios();
  const { selectedLocation } = useContext(LocationContext);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [cardData, setCardData] = useState([]);
  const [isLoadingCard, setIsLoadingCard] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const getDashboard = () => {
    startGettingDashboardTransition(async () => {
      try {
        const response = selectedLocation
          ? await axios.get(`/api/schedules/dashboard?location=${selectedLocation?.id}`)
          : await axios.get(`/api/schedules/dashboard/`);
        setDashboardData(response.data.data);
      } catch (err: any) {
        setToastMessage({ message: err?.message || "Failed to load dashboard data", variant: "danger" });
      }
    });
  };

  const handleCardClick = async (cardType: string) => {
    setSelectedCard(cardType);
    setIsLoadingCard(true);
    setDialogOpen(true);
    try {
      const endpointMap: any = {
        "today-exams": "/api/schedules/today-exams/",
        "ongoing-exams": "/api/schedules/ongoing-exams/",
        "completed-exams": "/api/schedules/completed-exams/",
        "scheduled-exams": "/api/schedules/scheduled-exams/",
        "popular-exams": "/api/schedules/popular-exams/",
        "today-students": "/api/schedules/today-students/",
      };
      const endpoint = endpointMap[cardType];
      if (!endpoint) {
        setToastMessage({ message: "This feature is not available yet", variant: "warning" });
        setDialogOpen(false);
        return;
      }
      const response = await axios.get(endpoint);
      setCardData(response.data.data || []);
    } catch (err: any) {
      setToastMessage({ message: err?.message || `Failed to load ${cardType} data`, variant: "danger" });
      setDialogOpen(false);
    } finally {
      setIsLoadingCard(false);
    }
  };

  const getCardTitle = (cardType: string) => ({
    "today-exams": "Today's Exams",
    "ongoing-exams": "Ongoing Exams",
    "completed-exams": "Completed Exams",
    "scheduled-exams": "Scheduled Exams",
    "popular-exams": "Popular Exams",
    "today-students": "Students Taking Exams Today",
    "upcoming-exams": "Upcoming Exams",
    "recent-completed-exams": "Today's Completed Exams",
    "recent-expected-exams": "Today's Expected Exams",
  } as any)[cardType] ?? "Data";

  const stats = [
    { title: "Today Exams",            value: dashboardData.today_exams.toString(),           icon: ListBulletIcon, cardType: "today-exams" },
    { title: "Upcoming Exams",         value: dashboardData.upcoming_exams.toString(),         icon: Clock12,        cardType: "upcoming-exams" },
    { title: "On Going Exams",         value: dashboardData.ongoing_exams.toString(),          icon: Play,           cardType: "ongoing-exams" },
    { title: "Students at Exams Now",  value: dashboardData.today_students.toString(),         icon: Users,          cardType: "today-students" },
    { title: "Today's Completed",      value: dashboardData.recent_completed_exams.toString(), icon: LockClosedIcon, cardType: "recent-completed-exams" },
    { title: "Today's Expected",       value: dashboardData.recent_expected_exams.toString(),  icon: Clock,          cardType: "recent-expected-exams" },
    { title: "Scheduled Exams",        value: dashboardData.total_exams.toString(),            icon: FileText,       cardType: "scheduled-exams" },
    { title: "Completion Rate",        value: `${dashboardData.completed_percentage}%`,        icon: CheckCircle,    cardType: "completed-exams" },
  ];

  // Chart data
  const barChartData =
    dashboardData.exams_with_most_students?.map((exam: any) => ({
      range: exam.name,
      students: exam?.student_count,
    })) || [];

  const areaData =
    (dashboardData.weekly_exams_by_day as any[])?.map((dayData: any) => ({
      day: dayData.day,
      submissionsTotal: (dayData.exams ?? []).reduce(
        (sum: number, exam: any) => sum + exam.student_count, 0
      ),
      originalData: dayData,
    })) || [];

  const pieData = [
    { name: "Completed",  value: dashboardData.completed_percentage  },
    { name: "Ongoing",    value: dashboardData.ongoing_percentage    },
    { name: "Scheduled",  value: dashboardData.scheduled_percentage  },
    { name: "Cancelled",  value: dashboardData.cancelled_percentage  },
  ];

  const PIE_COLORS = [
    "hsl(var(--primary))",
    "hsl(var(--primary) / 0.65)",
    "hsl(var(--primary) / 0.35)",
    "hsl(var(--muted-foreground) / 0.5)",
  ];

  const getStatusStyles = (status: string) => {
    switch (status?.toLowerCase()) {
      case "scheduled":   return "bg-primary/10 text-primary border border-primary/20";
      case "pending":
      case "waiting":     return "bg-muted text-muted-foreground border border-border";
      case "cancelled":
      case "failed":      return "bg-destructive/10 text-destructive border border-destructive/20";
      case "completed":
      case "finished":    return "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20";
      default:            return "bg-muted text-muted-foreground border border-border";
    }
  };

  useEffect(() => { getDashboard(); }, []);
  useEffect(() => { getDashboard(); }, [selectedLocation]);

  if (isGettingDashboard) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Loading…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full space-y-8">

        {/* ── Header ── */}
        <div className="px-6 pt-6">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Overview of exams, students, and resources
          </p>
        </div>

        {/* ── Stat cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-6">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon as any;
            const iconColor = ICON_COLOR[index];
            const bgTint = STAT_ACCENT[index];

            return (
              <button
                key={index}
                onClick={() => handleCardClick(stat.cardType)}
                className="group relative overflow-hidden rounded-xl border border-border bg-card text-left
                           transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 hover:border-border/80
                           focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div
                  className="absolute inset-0 opacity-100 transition-opacity duration-200"
                  style={{ background: bgTint }}
                />
                <div className="relative p-5 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide leading-none mb-2">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold text-foreground tabular-nums">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`flex-shrink-0 p-2.5 rounded-xl bg-background/60 ring-1 ring-border/50 group-hover:bg-background/80 transition-colors ${iconColor}`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                </div>
                {/* Bottom accent line */}
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-current opacity-0 group-hover:opacity-20 transition-opacity" />
              </button>
            );
          })}
        </div>

        {/* ── Dialog ── */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="min-w-[680px] max-h-[80vh] p-0 flex flex-col overflow-hidden">
            <DialogHeader className="px-6 py-4 border-b flex-shrink-0">
              <DialogTitle className="text-base font-semibold text-foreground">
                {selectedCard ? getCardTitle(selectedCard) : "Details"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                {isLoadingCard ? "Loading…" : `${cardData.length} item${cardData.length !== 1 ? "s" : ""}`}
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto min-h-0">
              {isLoadingCard ? (
                <div className="flex items-center justify-center py-16 gap-2 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="text-sm">Loading…</span>
                </div>
              ) : cardData.length > 0 ? (
                <table className="w-full">
                  <thead className="sticky top-0 bg-muted/60 backdrop-blur border-b z-10">
                    <tr>
                      {["Code", "Title", "Day", "Time", "Status"].map((h) => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {cardData.map((item: any, index: number) => (
                      <tr key={index} className="border-b last:border-0 hover:bg-muted/40 transition-colors">
                        <td className="px-4 py-3 text-sm font-semibold text-foreground whitespace-nowrap">
                          {item.group?.course?.code || item.exam_name || item.title || `${index + 1}`}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground max-w-[200px]">
                          <div className="line-clamp-2">
                            {item.group?.course?.title || item.exam_name || item.title || "—"}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
                          {item.date ? format(new Date(item.date), "eeee") : "—"}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground font-medium whitespace-nowrap">
                          {item.slot_name || "—"}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyles(item.status)}`}>
                            {item.status || "Unknown"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <div className="w-14 h-14 rounded-full border-2 border-dashed border-border flex items-center justify-center">
                    <FileText className="w-5 h-5 text-muted-foreground/50" />
                  </div>
                  <p className="text-sm text-muted-foreground">No data available</p>
                  <p className="text-xs text-muted-foreground/60">Try refreshing or check back later</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* ── Analytics ── */}
        <div className="space-y-4 px-6">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Analytics Overview</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Visual insights into exam performance and student activity
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pie chart */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-foreground">Exam Status Distribution</CardTitle>
                <CardDescription className="text-xs">Current breakdown of exam statuses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-60 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90}
                        paddingAngle={4} dataKey="value">
                        {pieData.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--background))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                          color: "hsl(var(--foreground))",
                          fontSize: "12px",
                        }}
                      />
                      <Legend
                        verticalAlign="bottom"
                        height={32}
                        wrapperStyle={{ fontSize: "11px", color: "hsl(var(--muted-foreground))" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Bar chart */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-foreground">Top 5 Exams by Enrollment</CardTitle>
                <CardDescription className="text-xs">Exams with the most student registrations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-60 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barChartData} margin={{ top: 4, right: 8, left: -10, bottom: 4 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                      <XAxis dataKey="range" axisLine={false} tickLine={false}
                        tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                      <YAxis axisLine={false} tickLine={false}
                        tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--background))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                          color: "hsl(var(--foreground))",
                          fontSize: "12px",
                        }}
                      />
                      <Bar dataKey="students" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Students" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Area chart */}
            <Card className="lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-foreground">Weekly Activity</CardTitle>
                <CardDescription className="text-xs">Exam submissions throughout the week</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={areaData} margin={{ top: 4, right: 16, left: -10, bottom: 4 }}>
                      <defs>
                        <linearGradient id="colorSubmissions" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}   />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                      <XAxis dataKey="day" axisLine={false} tickLine={false}
                        tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                      <YAxis axisLine={false} tickLine={false}
                        tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="submissionsTotal"
                        stroke="hsl(var(--primary))" strokeWidth={2}
                        fill="url(#colorSubmissions)" name="Submissions" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* ── Recent Timetables ── */}
        <div className="space-y-4 px-6 pb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Recent Timetables</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                Latest generated exam timetables
              </p>
            </div>
            <Link to="/admin/timetables/"
              className="text-xs font-medium text-primary hover:text-primary/80 transition-colors">
              See all →
            </Link>
          </div>

          <div className="rounded-xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/40 border-b border-border">
                    {["Year", "Start date", "End date", "Generated by", "Generated on", "Status", ""].map((h, i) => (
                      <th key={i} className={`px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide ${i === 6 ? 'w-10' : ''}`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.recent_exams.length > 0 ? (
                    dashboardData.recent_exams.map((exam: any, index) => (
                      <tr key={index} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 text-sm font-medium text-foreground">{exam.academic_year}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
                          {format(exam.start_date, "MMM d, yyyy")}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
                          {format(exam.end_date, "MMM d, yyyy")}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {exam.generated_by.email}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
                          {format(new Date(exam.generated_at), "MMM d, yyyy · h:mm a")}
                        </td>
                        <td className="px-4 py-3">
                          <StatusButton status={exam.status} />
                        </td>
                        <td className="px-4 py-3">
                          <Link to={`/admin/exams?id=${exam.id}`}
                            className="text-xs font-medium text-primary hover:text-primary/80 transition-colors whitespace-nowrap">
                            View →
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center text-sm text-muted-foreground">
                        No timetables found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DashboardPage;