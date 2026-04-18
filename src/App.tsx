import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router";
import { useEffect } from "react";
import SignIn from "./template/pages/AuthPages/SignIn";
import SignUp from "./template/pages/AuthPages/SignUp";
import NotFound from "./template/pages/OtherPage/NotFound";

import AppLayout from "./template/layout/AppLayout";
import { ScrollToTop } from "./template/components/common/ScrollToTop";
import HomeDashboard from "./features/dashboard/HomeDashboard";
import SubscriptionCalendar from "./features/calendar/SubscriptionCalendar";

// Financial AI Advisor feature imports
import { AuthProvider } from "./context/AuthContext";
import { FinancialProvider } from "./context/FinancialContext";
import StrategyDashboard from "./features/analysis/StrategyDashboard";
import ExpenseCharts from "./features/spending/ExpenseCharts";
import CreditCalculator from "./features/simulators/CreditCalculator";
import EducationHub from "./features/education/EducationHub";
import RecommendationsView from "./features/education/RecommendationsView";
import UserProfile from "./features/profile/UserProfile";
import RateDashboard from "./features/yield_radar/RateDashboard";
import { ProtectedRoute } from "./context/ProtectedRoute";

function RouteTitleUpdater() {
  const location = useLocation();

  useEffect(() => {
    const routeTitles: Record<string, string> = {
      "/": "Dashboard - Faid",
      "/strategy": "Plan Financiero - Faid",
      "/spending": "Seguimiento de Gastos - Faid",
      "/simulator": "Simulador de Deudas - Faid",
      "/calendar": "Suscripciones - Faid",
      "/education": "Educación - Faid",
      "/recommendations": "Recomendaciones - Faid",
      "/profile": "Mi Perfil - Faid",
      "/yield-radar": "Radar de Rendimientos - Faid",
      "/signin": "Iniciar Sesión - Faid",
      "/signup": "Registrarse - Faid",
    };

    document.title = routeTitles[location.pathname] || "Faid";
  }, [location.pathname]);

  return null;
}

export default function App() {
  return (
    <>
      <AuthProvider>
        <FinancialProvider>
          <Router>
            <RouteTitleUpdater />
            <ScrollToTop />
            <Routes>
              {/* Dashboard Layout */}
              <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                <Route index path="/" element={<HomeDashboard />} />
                
                {/* Financial AI Advisor Routes */}
                <Route path="/strategy" element={<StrategyDashboard />} />
                <Route path="/spending" element={<ExpenseCharts />} />
                <Route path="/simulator" element={<CreditCalculator />} />
                <Route path="/calendar" element={<SubscriptionCalendar />} />
                <Route path="/education" element={<EducationHub />} />
                <Route path="/recommendations" element={<RecommendationsView />} />
                <Route path="/profile" element={<UserProfile />} />
                <Route path="/yield-radar" element={<RateDashboard />} />

              </Route>

              {/* Auth Layout */}
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />

              {/* Fallback Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
        </FinancialProvider>
      </AuthProvider>
    </>
  );
}
// trigger hmr
