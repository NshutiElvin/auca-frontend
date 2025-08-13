import React, { useEffect, useState, useTransition } from "react";

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
 
import { Link } from "react-router-dom";
import { StatusButton } from "../components/ui/status-button"
import { format } from "date-fns";

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
    recent_expected_exams:0,
    recent_completed_exams:0,
    upcoming_exams:0

  });
  const [isGettingDashboard, startGettingDashboardTransition] = useTransition();
  const { setToastMessage } = useToast();
  const axios = useUserAxios();
  const getDashboard = () => {
    startGettingDashboardTransition(async () => {
      try {
        const response = await axios.get("/api/schedules/dashboard/");
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

 

  useEffect(() => {
    getDashboard();
  }, []);
  return isGettingDashboard ? (
    <div className="min-h-screen bg-background   p-6 flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-600 dark:text-gray-400">
          Loading dashboard data...
        </p>
      </div>
    </div>
  ) : (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold ">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Overview of your exam, students and and other resources
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <Card
                key={index}
                className="border-0 shadow-sm  border"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <p className="text-sm font-medium  ">
                        {stat.title}
                      </p>
                      <p className="text-3xl font-bold  ">
                        {stat.value}
                      </p>
                    </div>
                    <div
                      className={`p-3 rounded-full   ${stat.color}`}
                    >
                      <IconComponent className="w-6 h-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Analytics Section */}
        <div className="space-y-4">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Exam Analytics Overview
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Visual insights into exam performance and student progress
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Exam Distribution Chart */}
            <Card className="border-0 shadow-sm bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900 dark:text-gray-100">
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
            <Card className="border-0 shadow-sm bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900 dark:text-gray-100">
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
                        className="text-xs fill-gray-600 dark:fill-gray-400"
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        className="text-xs fill-gray-600 dark:fill-gray-400"
                      />
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
            <Card className="border-0 shadow-sm bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900 dark:text-gray-100">
                  Weekly Activity
                </CardTitle>
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
                      <XAxis
                        dataKey="day"
                        axisLine={false}
                        tickLine={false}
                        className="text-xs fill-gray-600 dark:fill-gray-400"
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        className="text-xs fill-gray-600 dark:fill-gray-400"
                      />
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
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Recent Timetables
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Explore our tools that you can use to generate blog posts,
                analyze SERP and more
              </p>
            </div>
            <Link to={`/admin/timetables/`} className="text-blue-600 underline">
              See all
            </Link>
          </div>

          <Card className="border-0 shadow-sm bg-white dark:bg-gray-800">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left p-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Year
                      </th>
                      <th className="text-left p-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Start date
                      </th>
                      <th className="text-left p-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                        End date
                      </th>
                      <th className="text-left p-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Generate by
                      </th>

                      <th className="text-left p-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Generated on
                      </th>
                      <th className="text-left p-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Status
                      </th>
                      <th className="w-12"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.recent_exams.map((exam: any, index) => (
                      <tr
                        key={index}
                        className="border-b border-gray-100 dark:border-gray-700 last:border-0"
                      >
                        <td className="p-4 text-sm text-gray-900 dark:text-gray-100">
                          {exam.academic_year}
                        </td>
                        <td className="p-4 text-sm text-gray-600 dark:text-gray-400">
                          {format(exam.start_date , 'MMMM d, yyyy')}
                        </td>
                        <td className="p-4 text-sm text-gray-600 dark:text-gray-400">
                          {format(exam.end_date , 'MMMM d, yyyy')}
                        </td>
                        <td className="p-4 text-sm text-gray-600 dark:text-gray-400 font-medium">
                          {exam.generated_by.email}
                        </td>

                        <td className="p-4 text-sm text-gray-600 dark:text-gray-400 font-medium">
                          
                         { format(new Date(exam.generated_at), 'MMMM d, yyyy · h:mm a')}
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
