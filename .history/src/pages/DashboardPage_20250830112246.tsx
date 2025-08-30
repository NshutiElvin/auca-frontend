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
    const dayData = payload[0].payload;
    const totalSubmissions = dayData.submissionsTotal;
    const exams = dayData.originalData.submissions;

    return (
      <div className="bg-background border border-border p-4 rounded-lg shadow-lg">
        <p className="font-bold text-primary">{label}</p>
        <p className="text-sm text-foreground">
          Total Submissions:{" "}
          <span className="text-primary">{totalSubmissions}</span>
        </p>

        <div className="mt-2 max-h-60 overflow-y-auto">
          <p className="text-xs font-semibold text-muted-foreground mb-1">Exams:</p>
          <ul className="text-xs space-y-1">
            {exams.map((exam: any, index: number) => (
              <li key={index} className="flex justify-between">
                <span className="text-foreground truncate max-w-[180px]">
                  {exam.name}
                </span>
                <span className="text-primary ml-2">
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

  const navigate = useNavigate();
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
    "hsl(var(--primary))",
    "hsl(var(--primary) / 0.8)",
    "hsl(var(--primary) / 0.6)",
    "hsl(var(--primary) / 0.4)",
    "hsl(var(--primary) / 0.2)",
    "hsl(var(--primary) / 0.1)",
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
    },
    {
      title: "Upcoming Exams",
      value: dashboardData.upcoming_exams.toString(),
      icon: Clock12,
    },
    {
      title: "On Going Exams",
      value: dashboardData.ongoing_exams.toString(),
      icon: Play,
    },
    {
      title: "Students at exams Now",
      value: dashboardData.today_students.toString(),
      icon: Users,
    },
    {
      title: "Today's Completed Exams",
      value: dashboardData.recent_completed_exams.toString(),
      icon: LockClosedIcon,
    },
    {
      title: "Today's Expected Exams",
      value: dashboardData.recent_expected_exams.toString(),
      icon: Clock1,
    },
    {
      title: "Scheduled Exams",
      value: dashboardData.total_exams.toString(),
      icon: FileText,
    },
    {
      title: "Completed Exams",
      value: `${dashboardData.completed_percentage}%`,
      icon: CheckCircle,
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

    return (
      <Card
        key={index}
        className="group relative overflow-hidden cursor-pointer transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1 hover:scale-[1.02] border"
        onClick={() => handleCardClick(cardType)}
      >
        <CardContent className="p-6 relative">
          <div className="flex items-start justify-between relative z-10">
            <div className="space-y-3 flex-1 min-w-0">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground leading-tight">
                  {stat.title}
                </p>
                <div className="flex items-baseline space-x-2">
                  <p className="text-3xl font-bold text-foreground tracking-tight">
                    {stat.value}
                  </p>
                </div>
              </div>
            </div>

            <div className="relative p-3 rounded-2xl bg-primary/10 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300 ease-in-out">
              <IconComponent className="w-6 h-6 text-primary" />
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 bg-primary transition-opacity duration-300"></div>
        </CardContent>
      </Card>
    );
  };

  const renderCardDataItem = (item: any, index: number) => {
    return (
      <tr
        key={index}
        className="border-b hover:cursor-pointer hover:bg-muted/50 transition-colors duration-200"
      >
        <td className="p-4 w-24 align-top">
          <div className="text-sm font-semibold text-foreground whitespace-nowrap">
            {item.group?.course?.code ||
              item.exam_name ||
              item.title ||
              `${index + 1}`}
          </div>
        </td>

        <td className="p-4 min-w-0 align-top">
          <div className="text-sm text-muted-foreground leading-tight">
            <div className="line-clamp-2 break-words">
              {item.group?.course?.title || item.exam_name || item.title || "-"}
            </div>
          </div>
        </td>

        <td className="p-4 w-28 align-top">
          <div className="text-sm text-muted-foreground whitespace-nowrap">
            {item.date ? format(new Date(item.date), "eeee") : "-"}
          </div>
        </td>

        <td className="p-4 w-32 align-top">
          <div className="text-sm text-muted-foreground font-medium whitespace-nowrap">
            {item.slot_name || "-"}
          </div>
        </td>

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

  const getStatusStyles = (status: string) => {
    switch (status?.toLowerCase()) {
      case "scheduled":
        return "bg-primary/10 text-primary border border-primary/20";
      case "pending":
      case "waiting":
        return "bg-muted text-muted-foreground border border-border";
      case "cancelled":
      case "failed":
        return "bg-destructive/10 text-destructive border border-destructive/20";
      case "completed":
      case "finished":
        return "bg-primary/10 text-primary border border-primary/20";
      default:
        return "bg-muted text-muted-foreground border border-border";
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">
            Loading dashboard data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full space-y-8">
        {/* Header */}
        <div className="space-y-2 px-6 pt-6">
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your exam, students and other resources
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-6">
          {stats.map((stat, index) => renderStatCard(stat, index))}
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="min-w-[700px] p-0">
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
        <div className="space-y-4 px-6">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">Exam Analytics Overview</h2>
            <p className="text-muted-foreground">
              Visual insights into exam performance and student progress
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Exam Distribution Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Exam Status Distribution
                </CardTitle>
                <CardDescription>
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
                            fill: "hsl(var(--primary))",
                          },
                          {
                            name: "Ongoing",
                            value: dashboardData.ongoing_percentage,
                            fill: "hsl(var(--primary) / 0.7)",
                          },
                          {
                            name: "Scheduled",
                            value: dashboardData.scheduled_percentage,
                            fill: "hsl(var(--primary) / 0.4)",
                          },
                          {
                            name: "Cancelled",
                            value: dashboardData.cancelled_percentage,
                            fill: "hsl(var(--muted-foreground))",
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
                          backgroundColor: "hsl(var(--background))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                          color: "hsl(var(--foreground))",
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
            <Card>
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
                        stroke="hsl(var(--border))"
                        className="opacity-30"
                      />
                      <XAxis
                        dataKey="range"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "hsl(var(--muted-foreground))" }}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false}
                        tick={{ fill: "hsl(var(--muted-foreground))" }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--background))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                          color: "hsl(var(--foreground))",
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
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Weekly Activity</CardTitle>
                <CardDescription>
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
                            stopColor="hsl(var(--primary))"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor="hsl(var(--primary))"
                            stopOpacity={0.1}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="hsl(var(--border))"
                        className="opacity-30"
                      />
                      <XAxis 
                        dataKey="day" 
                        axisLine={false} 
                        tickLine={false}
                        tick={{ fill: "hsl(var(--muted-foreground))" }}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false}
                        tick={{ fill: "hsl(var(--muted-foreground))" }}
                      />
                      <Tooltip
                        content={<CustomTooltip />}
                        contentStyle={{
                          backgroundColor: "hsl(var(--background))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                          color: "hsl(var(--foreground))",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="submissionsTotal"
                        stroke="hsl(var(--primary))"
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

        <div className="space-y-4 px-6 pb-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">Recent Timetables</h2>
              <p className="text-muted-foreground">
                Explore our tools that you can use to generate blog posts,
                analyze SERP and more
              </p>
            </div>
            <Link to={`/admin/timetables/`} className="text-primary underline hover:text-primary/80">
              See all
            </Link>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                        Year
                      </th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                        Start date
                      </th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                        End date
                      </th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                        Generate by
                      </th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                        Generated on
                      </th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                        Status
                      </th>
                      <th className="w-12"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.recent_exams.map((exam: any, index) => (
                      <tr key={index} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                        <td className="p-4 text-sm text-foreground">{exam.academic_year}</td>
                        <td className="p-4 text-sm text-foreground">
                          {format(exam.start_date, "MMMM d, yyyy")}
                        </td>
                        <td className="p-4 text-sm text-foreground">
                          {format(exam.end_date, "MMMM d, yyyy")}
                        </td>
                        <td className="p-4 text-sm font-medium text-foreground">
                          {exam.generated_by.email}
                        </td>
                        <td className="p-4 text-sm font-medium text-foreground">
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
                            className="text-primary underline hover:text-primary/80"
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