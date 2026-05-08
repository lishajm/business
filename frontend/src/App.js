import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Client
import ClientDashboard from './pages/client/ClientDashboard';
import CreateProposal from './pages/client/CreateProposal';
import MyProposals from './pages/client/MyProposals';
import ProposalStatus from './pages/client/ProposalStatus';
import ScheduleMeeting from './pages/client/ScheduleMeeting';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProposals from './pages/admin/AdminProposals';
import ProposalReview from './pages/admin/ProposalReview';
import MeetingManagement from './pages/admin/MeetingManagement';
import UserManagement from './pages/admin/UserManagement';
import DeveloperReports from './pages/admin/DeveloperReports';
import ActivityLogs from './pages/admin/ActivityLogs';

// Developer
import DeveloperDashboard from './pages/developer/DeveloperDashboard';
import AssignedWork from './pages/developer/AssignedWork';
import SubmitReport from './pages/developer/SubmitReport';
import MyReports from './pages/developer/MyReports';

function PrivateRoute({ children, role }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to={`/${user.role}`} replace />;
  return <Layout>{children}</Layout>;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to={`/${user.role}`} replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        <Routes>
          {/* Public */}
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Client */}
          <Route path="/client" element={<PrivateRoute role="client"><ClientDashboard /></PrivateRoute>} />
          <Route path="/client/proposals/new" element={<PrivateRoute role="client"><CreateProposal /></PrivateRoute>} />
          <Route path="/client/proposals" element={<PrivateRoute role="client"><MyProposals /></PrivateRoute>} />
          <Route path="/client/proposals/:id" element={<PrivateRoute role="client"><ProposalStatus /></PrivateRoute>} />
          <Route path="/client/meetings" element={<PrivateRoute role="client"><ScheduleMeeting /></PrivateRoute>} />

          {/* Admin */}
          <Route path="/admin" element={<PrivateRoute role="admin"><AdminDashboard /></PrivateRoute>} />
          <Route path="/admin/proposals" element={<PrivateRoute role="admin"><AdminProposals /></PrivateRoute>} />
          <Route path="/admin/proposals/:id" element={<PrivateRoute role="admin"><ProposalReview /></PrivateRoute>} />
          <Route path="/admin/meetings" element={<PrivateRoute role="admin"><MeetingManagement /></PrivateRoute>} />
          <Route path="/admin/users" element={<PrivateRoute role="admin"><UserManagement /></PrivateRoute>} />
          <Route path="/admin/reports" element={<PrivateRoute role="admin"><DeveloperReports /></PrivateRoute>} />
          <Route path="/admin/logs" element={<PrivateRoute role="admin"><ActivityLogs /></PrivateRoute>} />

          {/* Developer */}
          <Route path="/developer" element={<PrivateRoute role="developer"><DeveloperDashboard /></PrivateRoute>} />
          <Route path="/developer/work" element={<PrivateRoute role="developer"><AssignedWork /></PrivateRoute>} />
          <Route path="/developer/reports" element={<PrivateRoute role="developer"><SubmitReport /></PrivateRoute>} />
          <Route path="/developer/my-reports" element={<PrivateRoute role="developer"><MyReports /></PrivateRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
