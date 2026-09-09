import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

// Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// Pages
import Login from './pages/Login';
import Notifications from './pages/Notifications';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import RaiseIssue from './pages/student/RaiseIssue';
import MyIssues from './pages/student/MyIssues';
import IssueDetails from './pages/student/IssueDetails';
import StudentProfile from './pages/student/StudentProfile';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminIssues from './pages/admin/AdminIssues';
import AdminIssueDetails from './pages/admin/AdminIssueDetails';
import AdminProfile from './pages/admin/AdminProfile';

// App Layout with Navbar & Sidebar
function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

// Protected Route Guard
function ProtectedRoute({ requiredRole }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-500">Loading university portal...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'} replace />;
  }

  return <AppLayout />;
}

// Index Redirector
function IndexRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <Routes>
            {/* Public Route */}
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<IndexRedirect />} />

            {/* Student Protected Routes */}
            <Route element={<ProtectedRoute requiredRole="student" />}>
              <Route path="/student/dashboard" element={<StudentDashboard />} />
              <Route path="/student/raise-issue" element={<RaiseIssue />} />
              <Route path="/student/my-issues" element={<MyIssues />} />
              <Route path="/student/issues/:id" element={<IssueDetails />} />
              <Route path="/student/profile" element={<StudentProfile />} />
              <Route path="/notifications" element={<Notifications />} />
            </Route>

            {/* Admin Protected Routes */}
            <Route element={<ProtectedRoute requiredRole="admin" />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/issues" element={<AdminIssues />} />
              <Route path="/admin/issues/:id" element={<AdminIssueDetails />} />
              <Route path="/admin/profile" element={<AdminProfile />} />
            </Route>

            {/* Catch-all fallback */}
            <Route path="*" element={<IndexRedirect />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
