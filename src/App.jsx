import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./auth/AuthContext";
import { ToastProvider } from "./components/common/Toast";

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider> 
          <AppRoutes /> 
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}