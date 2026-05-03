import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import DepositoPage from "@/pages/DepositoPage";
import VentasPage from "@/pages/VentasPage";
import ComprasPage from "@/pages/ComprasPage";
import AdminPage from "@/pages/AdminPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/deposito" element={<ProtectedRoute allowedRoles={["DEPOSITO", "OPERADOR"]}><DepositoPage /></ProtectedRoute>} />
            <Route path="/ventas" element={<ProtectedRoute allowedRoles={["CAJA", "VENTA"]}><VentasPage /></ProtectedRoute>} />
            <Route path="/compras" element={<ProtectedRoute allowedRoles={["ABASTECIMIENTO", "COMPRA"]}><ComprasPage /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute allowedRoles={["ADMIN"]}><AdminPage /></ProtectedRoute>} />
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
