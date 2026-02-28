import { Routes, Route } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import AdminDashboard from "../pages/AdminDashboard";
import Schools from "../pages/Schools";
import Orders from "../pages/Orders";
import Reports from "../pages/Reports";
import Payments from "../pages/Payments";
import PortalSelection from "../pages/PortalSelection"; 

export default function AdminRoutes() {
  return (
    <Routes>
      <Route index element={<PortalSelection />} />

      <Route path="id-card" element={<AdminLayout mode="id-card" />}>
        <Route index element={<AdminDashboard />} />
        <Route path="schools" element={<Schools />} />
        <Route path="orders" element={<Orders />} />
        <Route path="reports" element={<Reports />} />
        <Route path="payments" element={<Payments />} />
      </Route>

      <Route path="marketing" element={<AdminLayout mode="marketing" />}>
        <Route index element={<div>Marketing Content Coming Soon</div>} />
      </Route>
    </Routes>
  );
}