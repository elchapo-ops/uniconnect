import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// Student Pages
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentProfile from "./pages/student/StudentProfile";
import StudentJobs from "./pages/student/StudentJobs";
import StudentApplications from "./pages/student/StudentApplications";
import StudentNotifications from "./pages/student/StudentNotifications";

// Employer Pages
import EmployerDashboard from "./pages/employer/EmployerDashboard";
import EmployerProfile from "./pages/employer/EmployerProfile";
import EmployerJobs from "./pages/employer/EmployerJobs";
import EmployerCandidates from "./pages/employer/EmployerCandidates";
import EmployerApplications from "./pages/employer/EmployerApplications";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminStudents from "./pages/admin/AdminStudents";
import AdminEmployers from "./pages/admin/AdminEmployers";
import AdminJobs from "./pages/admin/AdminJobs";
import AdminAnalytics from "./pages/admin/AdminAnalytics";

const queryClient = new QueryClient();

// Protected Route Component
function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) {
  const { isAuthenticated, user, isLoading } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Student Routes */}
      <Route
        path="/student/dashboard"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/profile"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/jobs"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentJobs />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/applications"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentApplications />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/notifications"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentNotifications />
          </ProtectedRoute>
        }
      />

      {/* Employer Routes */}
      <Route
        path="/employer/dashboard"
        element={
          <ProtectedRoute allowedRoles={['employer']}>
            <EmployerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employer/profile"
        element={
          <ProtectedRoute allowedRoles={['employer']}>
            <EmployerProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employer/jobs"
        element={
          <ProtectedRoute allowedRoles={['employer']}>
            <EmployerJobs />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employer/candidates"
        element={
          <ProtectedRoute allowedRoles={['employer']}>
            <EmployerCandidates />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employer/applications"
        element={
          <ProtectedRoute allowedRoles={['employer']}>
            <EmployerApplications />
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/students"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminStudents />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/employers"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminEmployers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/jobs"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminJobs />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/analytics"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminAnalytics />
          </ProtectedRoute>
        }
      />

      {/* Catch-all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
