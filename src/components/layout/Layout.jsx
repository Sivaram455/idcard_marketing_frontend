import Header from "./Header";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom"; 

export default function Layout() { 
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 bg-gray-100 p-8">
        <Outlet /> 
      </div>
    </div>
  );
}