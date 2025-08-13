import React from 'react';
 
 
import { Users, FileText, Play, CheckCircle, Sparkles, BarChart3, MoreHorizontal, Eye, HistoryIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';

const DashboardPage = () => {
  const stats = [
    {
      title: "Students at exams",
      value: "432",
      icon: Users,
      color: "text-blue-600 dark:text-blue-400"
    },
    {
      title: "Scheduled Exams",
      value: "12",
      icon: FileText,
      color: "text-green-600 dark:text-green-400"
    },
    {
      title: "On Going Exams",
      value: "10",
      icon: Play,
      color: "text-purple-600 dark:text-purple-400"
    },
    {
      title: "Completed Exams",
      value: "86%",
      icon: CheckCircle,
      color: "text-orange-600 dark:text-orange-400"
    },
     {
      title: "Recent Timetables",
      value: "12",
      icon: HistoryIcon,
      color: "text-orange-600 dark:text-orange-400"
    }
  ];

  const examHistory = [
    {
      title: "Basic Program...",
      class: "TECH-3A",
      code: "zHPxTaVu",
      participants: 34,
      submit: "23/34",
      schedule: "14 March 2024\n17 March 2024",
      status: "Running"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Overview of your exam, students and and other resources</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <Card key={index} className="border-0 shadow-sm bg-white dark:bg-gray-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {stat.title}
                      </p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                        {stat.value}
                      </p>
                    </div>
                    <div className={`p-3 rounded-full bg-gray-100 dark:bg-gray-700 ${stat.color}`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Tools Section */}
        <div className="space-y-4">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Let's get started with these useful tools
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Explore our tools that you can use to generate exam, analyze result and more
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Start New Exam */}
            <Card className="border-0 shadow-sm bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900 dark:text-gray-100">Start a new Exam</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Create exam so easily with ai, only enter a prompt and voila!
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full justify-center bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Get Started - Generate
                </Button>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 min-h-[80px] border-l-4 border-l-blue-500">
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-2/3"></div>
                  </div>
                </div>
                <Button variant="ghost" className="w-full justify-center text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                  <Eye className="w-4 h-4 mr-2" />
                  Start Create Exam
                </Button>
              </CardContent>
            </Card>

            {/* Analysis Tool */}
            <Card className="border-0 shadow-sm bg-white dark:bg-gray-800">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg text-gray-900 dark:text-gray-100">Analysist Exam Result</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Analyze exam result to get more data and stats answer
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-0">
                  New Feature
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 min-h-[100px] flex items-center justify-center">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                      <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Scanning</div>
                    <div className="p-2 bg-gray-200 dark:bg-gray-600 rounded-lg">
                      <FileText className="w-6 h-6 text-gray-500" />
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Result</div>
                  </div>
                </div>
                <Button variant="ghost" className="w-full justify-center text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                  <Eye className="w-4 h-4 mr-2" />
                  Start Analyze Result
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Exam History */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Exam History</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Explore our tools that you can use to generate blog posts, analyze SERP and more
              </p>
            </div>
            <Button variant="ghost" className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
              See All
            </Button>
          </div>

          <Card className="border-0 shadow-sm bg-white dark:bg-gray-800">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left p-4 text-sm font-medium text-gray-700 dark:text-gray-300">Title</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-700 dark:text-gray-300">Class</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-700 dark:text-gray-300">Code</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-700 dark:text-gray-300">Participants</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-700 dark:text-gray-300">Submit</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-700 dark:text-gray-300">Schedule</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-700 dark:text-gray-300">Status</th>
                      <th className="w-12"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {examHistory.map((exam, index) => (
                      <tr key={index} className="border-b border-gray-100 dark:border-gray-700 last:border-0">
                        <td className="p-4 text-sm text-gray-900 dark:text-gray-100">{exam.title}</td>
                        <td className="p-4 text-sm text-gray-600 dark:text-gray-400">{exam.class}</td>
                        <td className="p-4 text-sm text-gray-600 dark:text-gray-400">{exam.code}</td>
                        <td className="p-4 text-sm text-blue-600 dark:text-blue-400 font-medium">{exam.participants}</td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">{exam.submit}</span>
                            <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div className="w-2/3 h-full bg-blue-500 rounded-full"></div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-gray-600 dark:text-gray-400">
                          <div className="whitespace-pre-line">{exam.schedule}</div>
                        </td>
                        <td className="p-4">
                          <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-0">
                            {exam.status}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <Button variant="ghost" size="sm" className="w-8 h-8 p-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
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