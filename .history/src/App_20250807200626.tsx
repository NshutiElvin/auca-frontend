import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ErrorContextProvider } from "./contexts/ErrorContext";
import { ToastProvider } from "./contexts/ToastContext";
import { AuthProvider } from "./contexts/userSessionContext";
import { SocketProvider } from "./contexts/SocketContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import LoginRequiredLayout from "./Layouts/LoginRequiredLayout";
import RefreshLayout from "./Layouts/RefreshLayout";
import Logout from "./Layouts/LogoutLayout";
import HomePage from "./pages/home";
import LoginPage from "./pages/login";
import AdminPage from "./pages/admin";
import { CoursesPage } from "./pages/courses";
import { DepartmentsPage } from "./pages/departments";
import { ExamsPage } from "./pages/exams";
import { SchedulesPage } from "./pages/schedules";
import { SemestersPage } from "./pages/semesters";
import { AdminsPage } from "./pages/admins";
import { StudentsPage } from "./pages/students";
import { AllocationsPage } from "./pages/allocations";
import { OccupanciesPage } from "./pages/occupancies";
import { Toaster } from "./components/ui/toaster";
import { ExamscheduleProvider } from "./contexts/ExamSchedulesContexts";
import ExamsScheduleLayout from "./Layouts/ExamsSchedulesLayout";
import StudentPortal from "./pages/student";
import InstructorPortal from "./pages/instructor";
import UnauthorizedPage from "./Layouts/unauthorized";
import AdminRequiredLayout from "./Layouts/AdminRequiredLayout";
import StudentRequiredLayout from "./Layouts/StudentRequiredLayout";
import InstructorRequiredLayout from "./Layouts/InstructorRequiredLayout";
import StudentExamsPage from "./pages/StudentExamsPage";
import { EnrollmentsPage } from "./pages/studentEnrollments";
import InstructorExamScannerPage from "./pages/InstructorExamScannerPage";
import ManualTimeTable from "./pages/manualTimeTable";
import ServerLoader from "./components/ui/server-loading";
import RoomsOccupancies from "./pages/RoomsOccupancies";
import NotificationLayout from "./Layouts/NotificationLayout";

const App = () => {
  return (
    <BrowserRouter>
      <ErrorContextProvider>
        <ToastProvider>
          <Toaster />
          <ServerLoader />
          <AuthProvider>
            <ExamscheduleProvider>
              <NotificationProvider>
                <SocketProvider>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<LoginPage />} />

                    <Route element={<RefreshLayout />}>
                      <Route element={<LoginRequiredLayout />}>
                        <Route element={<NotificationLayout />}>
                          <Route element={<AdminRequiredLayout />}>
                            <Route path="/admin" element={<AdminPage />}>
                              <Route element={<CoursesPage />} index />
                              <Route path="courses" element={<CoursesPage />} />
                              <Route
                                path="departments"
                                element={<DepartmentsPage />}
                              />
                              <Route
                                path="allocations"
                                element={<AllocationsPage />}
                              />
                              <Route element={<ExamsScheduleLayout />}>
                                <Route element={<SchedulesPage />} index />
                                <Route
                                  path="schedules"
                                  element={<SchedulesPage />}
                                />
                                <Route
                                  path="manual"
                                  element={<ManualTimeTable />}
                                />
                              </Route>
                              <Route path="exams" element={<ExamsPage />} />
                              <Route
                                path="occupancies"
                                element={<RoomsOccupancies />}
                              />
                              <Route
                                path="semesters"
                                element={<SemestersPage />}
                              />
                              <Route path="admins" element={<AdminsPage />} />
                              <Route
                                path="students"
                                element={<StudentsPage />}
                              />

                              <Route
                                path="messages/:id"
                                element={<h1>Message</h1>}
                              />
                            </Route>
                          </Route>

                          <Route element={<StudentRequiredLayout />}>
                            <Route path="/student" element={<StudentPortal />}>
                              <Route element={<StudentExamsPage/>} index />
                              <Route
                                path="enrollments"
                                element={<EnrollmentsPage />}
                              />

                              <Route
                                path="exams"
                                element={<StudentExamsPage />}
                              />
                            </Route>
                          </Route>
                          <Route element={<InstructorRequiredLayout />}>
                            <Route
                              path="/instructor"
                              element={<InstructorPortal />}
                            >
                              <Route element={<ExamsPage />} index />
                              <Route path="courses" element={<AllocationsPage/>} />
                          
                              <Route
                                path="allocations"
                                element={<AllocationsPage />}
                              />
                             
                              <Route path="exams" element={<ExamsPage />} />
                              
                            
                           
                              <Route
                                path="exam-verification"
                                element={<InstructorExamScannerPage />}
                              />
                              <Route
                                path="messages/:id"
                                element={<h1>Message</h1>}
                              />
                            </Route>
                          </Route>

                          <Route
                            path="/unauthorized"
                            element={<UnauthorizedPage />}
                          />
                        </Route>
                      </Route>

                      <Route path="/logout" element={<Logout />} />
                    </Route>
                    <Route path="*" element={<h1>Not Found</h1>} />
                  </Routes>
                </SocketProvider>
              </NotificationProvider>
            </ExamscheduleProvider>
          </AuthProvider>
        </ToastProvider>
      </ErrorContextProvider>
    </BrowserRouter>
  );
};

export default App;
