

import React, { useContext, useEffect, useState, useTransition } from "react";

import {
  Users,
  FileText,
  Play,
  CheckCircle,
  Sparkles,
  BarChart3,
  MoreHorizontal,
  Eye,
  HistoryIcon,
  Clock1,
  Clock12,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import useUserAxios from "../hooks/useUserAxios";
import useToast from "../hooks/useToast";
import { ListBulletIcon, LockClosedIcon } from "@radix-ui/react-icons";

import { Link, useNavigate } from "react-router-dom";
import { StatusButton } from "../components/ui/status-button";
import { format } from "date-fns";
import LocationContext from "../contexts/LocationContext";

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const dayData = payload[0].payload; // Get the full data object for this day
    const totalSubmissions = dayData.submissionsTotal;
    const exams = dayData.originalData.submissions; // Access the original exam array

    return (
      <div className="bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-700">
        <p className="font-bold text-purple-400">{label}</p>
        <p className="text-sm text-white">
          Total Submissions:{" "}
          <span className="text-purple-300">{totalSubmissions}</span>
        </p>

        <div className="mt-2 max-h-60 overflow-y-auto">
          <p className="text-xs font-semibold text-gray-400 mb-1">Exams:</p>
          <ul className="text-xs space-y-1">
            {exams.map((exam: any, index: number) => (
              <li key={index} className="flex justify-between">
                <span className="text-gray-300 truncate max-w-[180px]">
                  {exam.name}
                </span>
                <span className="text-purple-300 ml-2">
                  {exam.student_count}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  return null;
};

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

  const navigate = useNavigate(); // Add navigate hook
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
        let response = null;
        if (selectedLocation)
          response = await axios.get(
            `/api/schedules/dashboard?location=${selectedLocation?.id}`
          );
        else {
          response = await axios.get(`/api/schedules/dashboard/`);
        }
        setDashboardData(response.data.data);
      } catch (err: any) {
        setToastMessage({
          message: err?.message || "Failed to load dashboard data",
          variant: "danger",
        });
      }
    });
  };

  const colors = [
    "#8b5cf6",
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#06b6d4",
  ];
  const barChartData =
    dashboardData.exams_with_most_students?.map((exam: any, index) => ({
      range: exam.name,
      students: exam?.student_count,
      fill: colors[index % colors.length],
    })) || [];

  const areaChartData =
    dashboardData.weekly_exams_by_day?.map((dayData: any) => ({
      day: dayData.day,

      submissions: dayData.exams,
    })) || [];

  const areaData = areaChartData.map((dayData) => ({
    day: dayData.day,
    submissionsTotal: dayData.submissions.reduce(
      (sum: any, exam: any) => sum + exam.student_count,
      0
    ),
    originalData: dayData,
  }));

  const stats = [
    {
      title: "Today Exams",
      value: dashboardData.today_exams.toString(),
      icon: ListBulletIcon,
      color: "text-yellow-600 dark:text-yellow-400",
    },
    {
      title: "Upcoming Exams",
      value: dashboardData.upcoming_exams.toString(),
      icon: Clock12,
      color: "text-green-600 dark:text-yellow-400",
    },
    {
      title: "On Going Exams",
      value: dashboardData.ongoing_exams.toString(),
      icon: Play,
      color: "text-purple-600 dark:text-purple-400",
    },
    {
      title: "Students at exams Now",
      value: dashboardData.today_students.toString(),
      icon: Users,
      color: "text-blue-600 dark:text-blue-400",
    },
    {
      title: "Today's Completed Exams",
      value: dashboardData.recent_completed_exams.toString(),
      icon: LockClosedIcon,
      color: "text-red-600 dark:text-blue-400",
    },
    {
      title: "Today's Expected Exams",
      value: dashboardData.recent_expected_exams.toString(),
      icon: Clock1,
      color: "text-orange-600 dark:text-blue-400",
    },
    {
      title: "Scheduled Exams",
      value: dashboardData.total_exams.toString(),
      icon: FileText,
      color: "text-green-600 dark:text-green-400",
    },

    {
      title: "Completed Exams",
      value: `${dashboardData.completed_percentage}%`,
      icon: CheckCircle,
      color: "text-orange-600 dark:text-orange-400",
    },
  ];

  const handleCardClick = async (cardType: string) => {
    setSelectedCard(cardType);
    setIsLoadingCard(true);
    setDialogOpen(true);

    try {
      let endpoint = "";

      if (selectedLocation) {
        selectedLocation.id = selectedLocation.id;
      }

      // Map card types to endpoints
      const endpointMap: any = {
        "today-exams": "/api/schedules/today-exams/",
        "ongoing-exams": "/api/schedules/ongoing-exams/",
        "completed-exams": "/api/schedules/completed-exams/",
        "scheduled-exams": "/api/schedules/scheduled-exams/",
        "popular-exams": "/api/schedules/popular-exams/",
        "today-students": "/api/schedules/today-students/",
      };

      endpoint = endpointMap[cardType];

      if (!endpoint) {
        setToastMessage({
          message: "This feature is not available yet",
          variant: "warning",
        });
        setDialogOpen(false);
        return;
      }

      const response = await axios.get(endpoint);
      setCardData(response.data.data || []);
    } catch (err: any) {
      setToastMessage({
        message: err?.message || `Failed to load ${cardType} data`,
        variant: "danger",
      });
      setDialogOpen(false);
    } finally {
      setIsLoadingCard(false);
    }
  };

  const getCardTitle = (cardType: string) => {
    const titleMap: any = {
      "today-exams": "Today's Exams",
      "ongoing-exams": "Ongoing Exams",
      "completed-exams": "Completed Exams",
      "scheduled-exams": "Scheduled Exams",
      "popular-exams": "Popular Exams",
      "today-students": "Students Taking Exams Today",
      "upcoming-exams": "Upcoming Exams",
      "recent-completed-exams": "Today's Completed Exams",
      "recent-expected-exams": "Today's Expected Exams",
    };
    return titleMap[cardType] || "Data";
  };

  const renderStatCard = (stat: any, index: any) => {
    const IconComponent = stat.icon;
    const cardTypeMap: any = {
      "Today Exams": "today-exams",
      "Upcoming Exams": "upcoming-exams",
      "On Going Exams": "ongoing-exams",
      "Students at exams Now": "today-students",
      "Today's Completed Exams": "recent-completed-exams",
      "Today's Expected Exams": "recent-expected-exams",
      "Scheduled Exams": "scheduled-exams",
      "Completed Exams": "completed-exams",
    };

    const cardType = cardTypeMap[stat.title];

    // Enhanced color mapping with proper gradients and hover states
    const getCardTheme = (title: string) => {
      const themes: {
        [key: string]: {
          gradient: string;
          iconBg: string;
          hover: string;
          textAccent: string;
        };
      } = {
        "Today Exams": {
          gradient: "from-blue-50 via-blue-50/50 to-transparent",
          iconBg: "bg-gradient-to-br from-blue-500 to-blue-600",
          hover:
            "hover:from-blue-100 hover:via-blue-100/60 hover:to-blue-50/30",
          textAccent: "text-blue-700",
        },
        "Upcoming Exams": {
          gradient: "from-amber-50 via-amber-50/50 to-transparent",
          iconBg: "bg-gradient-to-br from-amber-500 to-amber-600",
          hover:
            "hover:from-amber-100 hover:via-amber-100/60 hover:to-amber-50/30",
          textAccent: "text-amber-700",
        },
        "On Going Exams": {
          gradient: "from-emerald-50 via-emerald-50/50 to-transparent",
          iconBg: "bg-gradient-to-br from-emerald-500 to-emerald-600",
          hover:
            "hover:from-emerald-100 hover:via-emerald-100/60 hover:to-emerald-50/30",
          textAccent: "text-emerald-700",
        },
        "Students at exams Now": {
          gradient: "from-purple-50 via-purple-50/50 to-transparent",
          iconBg: "bg-gradient-to-br from-purple-500 to-purple-600",
          hover:
            "hover:from-purple-100 hover:via-purple-100/60 hover:to-purple-50/30",
          textAccent: "text-purple-700",
        },
        "Today's Completed Exams": {
          gradient: "from-teal-50 via-teal-50/50 to-transparent",
          iconBg: "bg-gradient-to-br from-teal-500 to-teal-600",
          hover:
            "hover:from-teal-100 hover:via-teal-100/60 hover:to-teal-50/30",
          textAccent: "text-teal-700",
        },
        "Today's Expected Exams": {
          gradient: "from-indigo-50 via-indigo-50/50 to-transparent",
          iconBg: "bg-gradient-to-br from-indigo-500 to-indigo-600",
          hover:
            "hover:from-indigo-100 hover:via-indigo-100/60 hover:to-indigo-50/30",
          textAccent: "text-indigo-700",
        },
        "Scheduled Exams": {
          gradient: "from-cyan-50 via-cyan-50/50 to-transparent",
          iconBg: "bg-gradient-to-br from-cyan-500 to-cyan-600",
          hover:
            "hover:from-cyan-100 hover:via-cyan-100/60 hover:to-cyan-50/30",
          textAccent: "text-cyan-700",
        },
        "Completed Exams": {
          gradient: "from-green-50 via-green-50/50 to-transparent",
          iconBg: "bg-gradient-to-br from-green-500 to-green-600",
          hover:
            "hover:from-green-100 hover:via-green-100/60 hover:to-green-50/30",
          textAccent: "text-green-700",
        },
      };

      return (
        themes[title] || {
          gradient: "from-gray-50 via-gray-50/50 to-transparent",
          iconBg: "bg-gradient-to-br from-gray-500 to-gray-600",
          hover:
            "hover:from-gray-100 hover:via-gray-100/60 hover:to-gray-50/30",
          textAccent: "text-gray-700",
        }
      );
    };

    const theme = getCardTheme(stat.title);

    return (
      <Card
        key={index}
        className={`
        group relative overflow-hidden cursor-pointer transition-all duration-300 ease-in-out
        bg-gradient-to-br ${theme.gradient} ${theme.hover}
        border border-gray-200/60 hover:border-gray-300/80
        shadow-sm hover:shadow-lg hover:shadow-gray-200/50
        hover:-translate-y-1 hover:scale-[1.02]
        dark:bg-gradient-to-br dark:from-gray-800/50 dark:via-gray-800/30 dark:to-transparent
        dark:border-gray-700/60 dark:hover:border-gray-600/80
        dark:hover:shadow-gray-900/20
      `}
        onClick={() => handleCardClick(cardType)}
      >
        <CardContent className="p-6 relative">
          {/* Subtle background pattern */}
          <div className="absolute inset-0 opacity-[0.02] group-hover:opacity-[0.04] transition-opacity">
            <div className="w-full h-full bg-[radial-gradient(circle_at_50%_50%,currentColor_1px,transparent_1px)] bg-[length:20px_20px]"></div>
          </div>

          <div className="flex items-start justify-between relative z-10">
            <div className="space-y-3 flex-1 min-w-0">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 leading-tight">
                  {stat.title}
                </p>
                <div className="flex items-baseline space-x-2">
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                    {stat.value}
                  </p>
                  {/* Optional: Add trend indicator */}
                  {stat.trend && (
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full ${
                        stat.trend > 0
                          ? "text-emerald-700 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/30"
                          : "text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/30"
                      }`}
                    >
                      {stat.trend > 0 ? "+" : ""}
                      {stat.trend}%
                    </span>
                  )}
                </div>
              </div>

              {/* Optional: Add subtitle or description */}
              {stat.subtitle && (
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  {stat.subtitle}
                </p>
              )}
            </div>

            {/* Enhanced icon container */}
            <div
              className={`
            relative p-3 rounded-2xl shadow-sm
            ${theme.iconBg}
            group-hover:shadow-md group-hover:scale-110
            transition-all duration-300 ease-in-out
          `}
            >
              {/* Icon glow effect */}
              <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              <IconComponent className="w-6 h-6 text-white relative z-10" />

              {/* Subtle pulse animation on hover */}
              <div className="absolute inset-0 rounded-2xl bg-white/10 scale-0 group-hover:scale-100 group-hover:animate-ping transition-transform duration-300"></div>
            </div>
          </div>

          {/* Bottom accent line */}
          <div
            className={`
          absolute bottom-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100
          ${theme.iconBg} transition-opacity duration-300
        `}
          ></div>
        </CardContent>
      </Card>
    );
  };

  const renderCardDataItem = (item: any, index: number) => {
    console.log(item);

    return (
      <tr
        key={index}
        className="border-b hover:cursor-pointer hover:bg-muted/50 transition-colors duration-200"
      >
        {/* Course Code - Fixed width for consistency */}
        <td className="p-4 w-24 align-top">
          <div className="text-sm font-semibold text-foreground whitespace-nowrap">
            {item.group?.course?.code ||
              item.exam_name ||
              item.title ||
              `${index + 1}`}
          </div>
        </td>

        {/* Course Title - Flexible width with proper text handling */}
        <td className="p-4 min-w-0 align-top">
          <div className="text-sm text-muted-foreground leading-tight">
            <div className="line-clamp-2 break-words">
              {item.group?.course?.title || item.exam_name || item.title || "-"}
            </div>
          </div>
        </td>

        {/* Day - Fixed width */}
        <td className="p-4 w-28 align-top">
          <div className="text-sm text-muted-foreground whitespace-nowrap">
            {item.date ? format(new Date(item.date), "eeee") : "-"}
          </div>
        </td>

        {/* Time Slot - Fixed width */}
        <td className="p-4 w-32 align-top">
          <div className="text-sm text-muted-foreground font-medium whitespace-nowrap">
            {item.slot_name || "-"}
          </div>
        </td>

        {/* Status - Fixed width */}
        <td className="p-4 w-32 align-top">
          <span
            className={`
          inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap
          ${getStatusStyles(item.status)}
        `}
          >
            {item.status || "Unknown"}
          </span>
        </td>
      </tr>
    );
  };

  // Helper function for status styling
  const getStatusStyles = (status: string) => {
    switch (status?.toLowerCase()) {
      case "scheduled":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "pending":
      case "waiting":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "cancelled":
      case "failed":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "completed":
      case "finished":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  useEffect(() => {
    getDashboard();
  }, []);

  useEffect(() => {
    getDashboard();
  }, [selectedLocation]);

  if (isGettingDashboard) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Loading dashboard data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Overview of your exam, students and other resources
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => renderStatCard(stat, index))}
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="min-w-[700px]  p-0">
            <div className="flex flex-col h-full">
              <DialogHeader className="px-6 py-4 border-b bg-muted/30">
                <DialogTitle className="text-xl font-semibold">
                  {selectedCard ? getCardTitle(selectedCard) : "Details"}
                </DialogTitle>
                <DialogDescription className="text-sm mt-1">
                  {isLoadingCard
                    ? "Loading data..."
                    : `Showing ${cardData.length} items`}
                </DialogDescription>
              </DialogHeader>

              <div className="flex-1 overflow-hidden">
                {isLoadingCard ? (
                  <div className="flex flex-col items-center justify-center py-12 space-y-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <p className="text-muted-foreground">Loading data...</p>
                  </div>
                ) : cardData.length > 0 ? (
                  <div className="overflow-y-auto h-full">
                    <table className="w-full">
                      <thead className="sticky top-0 bg-background border-b z-10">
                        <tr>
                          <th className="text-left p-4 text-sm font-medium text-muted-foreground w-24">
                            Code
                          </th>
                          <th className="text-left p-4 text-sm font-medium text-muted-foreground min-w-0">
                            Title
                          </th>
                          <th className="text-left p-4 text-sm font-medium text-muted-foreground w-28">
                            Day
                          </th>
                          <th className="text-left p-4 text-sm font-medium text-muted-foreground w-32">
                            Time
                          </th>
                          <th className="text-left p-4 text-sm font-medium text-muted-foreground w-32">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {cardData.map((item: any, index: number) =>
                          renderCardDataItem(item, index)
                        )}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 space-y-3">
                    <div className="w-16 h-16 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
                      <FileText className="w-6 h-6 text-muted-foreground/50" />
                    </div>
                    <p className="text-muted-foreground">No data available</p>
                    <p className="text-xs text-muted-foreground/70">
                      Try refreshing or check back later
                    </p>
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Analytics Section */}
        <div className="space-y-4">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Exam Analytics Overview</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Visual insights into exam performance and student progress
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Exam Distribution Chart */}
            <Card className="border shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">
                  Exam Status Distribution
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Current breakdown of exam statuses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          {
                            name: "Completed",
                            value: dashboardData.completed_percentage,
                            fill: "#10b981",
                          },
                          {
                            name: "Ongoing",
                            value: dashboardData.ongoing_percentage,
                            fill: "#3b82f6",
                          },
                          {
                            name: "Scheduled",
                            value: dashboardData.scheduled_percentage,
                            fill: "#f59e0b",
                          },
                          {
                            name: "Cancelled",
                            value: dashboardData.cancelled_percentage,
                            fill: "#6b7280",
                          },
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      ></Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgb(31 41 55)",
                          border: "none",
                          borderRadius: "8px",
                          color: "white",
                        }}
                      />
                      <Legend
                        verticalAlign="bottom"
                        height={36}
                        wrapperStyle={{
                          paddingTop: "20px",
                          fontSize: "12px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Score Distribution */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">
                  5 Exams with Most Enrollments
                </CardTitle>
                <CardDescription>
                  Top exams by student enrollment numbers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barChartData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="opacity-30"
                      />
                      <XAxis
                        dataKey="range"
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgb(31 41 55)",
                          border: "none",
                          borderRadius: "8px",
                          color: "white",
                        }}
                      />
                      <Bar
                        dataKey="students"
                        radius={[4, 4, 0, 0]}
                        name="Students"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Weekly Activity */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Weekly Activity</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Exam submissions throughout the week
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={areaData}
                      width={500}
                      height={300}
                      margin={{
                        top: 10,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <defs>
                        <linearGradient
                          id="colorSubmissions"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#8b5cf6"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor="#8b5cf6"
                            stopOpacity={0.1}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="opacity-30"
                      />
                      <XAxis dataKey="day" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} />
                      <Tooltip
                        content={<CustomTooltip />}
                        contentStyle={{
                          backgroundColor: "rgb(31 41 55)",
                          border: "none",
                          borderRadius: "8px",
                          color: "white",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="submissionsTotal"
                        stroke="#8b5cf6"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorSubmissions)"
                        name="Exam Submissions"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Recent Timetables</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Explore our tools that you can use to generate blog posts,
                analyze SERP and more
              </p>
            </div>
            <Link to={`/admin/timetables/`} className="text-blue-600 underline">
              See all
            </Link>
          </div>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4 text-sm font-medium">
                        Year
                      </th>
                      <th className="text-left p-4 text-sm font-medium">
                        Start date
                      </th>
                      <th className="text-left p-4 text-sm font-medium">
                        End date
                      </th>
                      <th className="text-left p-4 text-sm font-medium">
                        Generate by
                      </th>

                      <th className="text-left p-4 text-sm font-medium">
                        Generated on
                      </th>
                      <th className="text-left p-4 text-sm font-medium">
                        Status
                      </th>
                      <th className="w-12"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.recent_exams.map((exam: any, index) => (
                      <tr key={index} className="border-b last:border-0">
                        <td className="p-4 text-sm">{exam.academic_year}</td>
                        <td className="p-4 text-sm">
                          {format(exam.start_date, "MMMM d, yyyy")}
                        </td>
                        <td className="p-4 text-sm">
                          {format(exam.end_date, "MMMM d, yyyy")}
                        </td>
                        <td className="p-4 text-sm font-medium">
                          {exam.generated_by.email}
                        </td>

                        <td className="p-4 text-sm font-medium">
                          {format(
                            new Date(exam.generated_at),
                            "MMMM d, yyyy · h:mm a"
                          )}
                        </td>
                        <td className="p-4">
                          <StatusButton status={exam.status} />
                        </td>

                        <td className="p-4">
                          <Link
                            to={`/admin/exams?id=${exam.id}`}
                            className="text-blue-600 underline"
                          >
                            View Exams
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
