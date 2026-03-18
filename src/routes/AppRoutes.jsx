import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import CreateOrder from "../pages/CreateOrder";
import OrderHistory from "../pages/OrderHistory";
import TrackOrder from "../pages/TrackOrder";
import MakePayment from "../pages/MakePayment";
import ProtectedRoute from "./ProtectedRoute";
import Layout from "../components/layout/Layout";

import MarketingLayout from "../pages/marketing/MarketingLayout";
import MarketingDashboard from "../pages/marketing/MarketingDashboard";
import FollowUps from "../pages/marketing/FollowUps";
import SchoolVisits from "../pages/marketing/Visits";
import Messages from "../pages/marketing/Messages";
import Profile from "../pages/marketing/profile";
import AddLead from "../pages/marketing/AddLead";
import MarketingLeads from "../pages/marketing/MarketingLeads";
import SchoolDetail from "../pages/marketing/SchoolDetail";
import AssignLeads from "../pages/marketing/AssignLeads";

import AdminPortal from "../pages/AdminPortal";

// Admin Management
import AdminManageLayout from "../pages/admin/AdminManageLayout";
import AdminOverview from "../pages/admin/AdminOverview";
import TenantsPage from "../pages/admin/TenantsPage";
import UsersPage from "../pages/admin/UsersPage";

// ID Card module
import IDCardLayout from "../pages/idcard/IDCardLayout";
import IDCardDashboard from "../pages/idcard/IDCardDashboard";
import RequestList from "../pages/idcard/RequestList";
import RequestDetail from "../pages/idcard/RequestDetail";
import CreateRequest from "../pages/idcard/CreateRequest";
import StudentsPage from "../pages/idcard/StudentsPage";

// Ticketing module
import TicketingLayout from "../pages/ticketing/TicketingLayout";
import TicketingDashboard from "../pages/ticketing/TicketingDashboard";
import CreateTicket from "../pages/ticketing/CreateTicket";
import TicketDetails from "../pages/ticketing/TicketDetails";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />

      {/* School Admin routes — old role 'school' kept for backward compat */}
      <Route element={<ProtectedRoute allowedRoles={["school", "SCHOOL_ADMIN"]} />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/create-order" element={<CreateOrder />} />
          <Route path="/orders" element={<OrderHistory />} />
          <Route path="/track" element={<TrackOrder />} />
          <Route path="/payments" element={<MakePayment />} />
        </Route>
      </Route>

      {/* Marketing routes */}
      <Route element={<ProtectedRoute allowedRoles={["marketer", "agent", "admin", "GMMC_ADMIN"]} />}>
        <Route element={<MarketingLayout />}>
          <Route path="/marketing" element={<MarketingDashboard />} />
          <Route path="/marketing/leads" element={<MarketingLeads />} />
          <Route path="/marketing/add" element={<AddLead />} />
          <Route path="/marketing/schools/:id" element={<SchoolDetail />} />
          <Route path="/marketing/assign" element={<AssignLeads />} />
          <Route path="/marketing/visits" element={<SchoolVisits />} />
          <Route path="/marketing/followups" element={<FollowUps />} />
          <Route path="/marketing/messages" element={<Messages />} />
          <Route path="/marketing/profile" element={<Profile />} />
        </Route>
      </Route>

      {/* Admin Portal selector */}
      <Route element={<ProtectedRoute allowedRoles={["admin", "GMMC_ADMIN"]} />}>
        <Route path="/admin-portal" element={<AdminPortal />} />
      </Route>

      {/* Admin Management pages */}
      <Route element={<ProtectedRoute allowedRoles={["admin", "GMMC_ADMIN"]} />}>
        <Route element={<AdminManageLayout />}>
          <Route path="/admin/overview" element={<AdminOverview />} />
          <Route path="/admin/tenants" element={<TenantsPage />} />
          <Route path="/admin/users" element={<UsersPage />} />
        </Route>
      </Route>

      {/* ID Card Module — all staff roles */}
      <Route element={<ProtectedRoute allowedRoles={["school", "SCHOOL_ADMIN", "admin", "GMMC_ADMIN", "printer", "PRINTER"]} />}>
        <Route element={<IDCardLayout />}>
          <Route path="/idcard/dashboard" element={<IDCardDashboard />} />
          <Route path="/idcard/requests" element={<RequestList />} />
          <Route path="/idcard/requests/:id" element={<RequestDetail />} />
          <Route path="/idcard/requests/:requestId/students" element={<StudentsPage />} />
          <Route path="/idcard/create-request" element={<CreateRequest />} />
        </Route>
      </Route>

      {/* Ticketing Portal — all roles can create, technical roles manage */}
      <Route element={<ProtectedRoute allowedRoles={["school", "SCHOOL_ADMIN", "admin", "GMMC_ADMIN", "SUPPORT", "DEVELOPER"]} />}>
        <Route element={<TicketingLayout />}>
          <Route path="/ticketing" element={<TicketingDashboard />} />
          <Route path="/ticketing/list" element={<TicketingDashboard />} />
          <Route path="/ticketing/new" element={<CreateTicket />} />
          <Route path="/ticketing/:id" element={<TicketDetails />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
