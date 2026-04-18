import { BrowserRouter as Router, Routes, Route } from "react-router";
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
import UserProfile from "./features/profile/UserProfile";
import { ProtectedRoute } from "./context/ProtectedRoute";

export default function App() {
  return (
    <>
      <AuthProvider>
        <FinancialProvider>
          <Router>
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
            <Route path="/profile" element={<UserProfile />} />

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
