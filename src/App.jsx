import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useLocation,
  Navigate
} from "react-router-dom";
import { AuthProvider } from "./lib/contexts/AuthContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute";

import Dashboard from "./components/pages/Dashboard";
import Login from "./components/pages/Login";
import MainPage from "./components/pages/MainPage";
import Orders from "./components/pages/Orders";
import Users from "./components/pages/Users";
import Collections from "./components/pages/Collections";
import Reports from "./components/pages/Reports";
import Settings from "./components/pages/Settings";
import ModalProvider from "./components/layout/ModalProvider";
import { useContext, useEffect } from "react";
import { AuthContext } from "./lib/contexts/authContext";

import "./index.css";

function AuthRedirectGate() {
  const { loading, authFailed } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && authFailed && location.pathname !== "/login") {
      navigate("/login");
    }
  }, [loading, authFailed, location.pathname, navigate]);

  return null;
}

function AppRoutes() {
  return (
    <>
      <AuthRedirectGate />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Dashboard />}>
            <Route index element={<Navigate to="main" replace />} />
            <Route path="main" element={<MainPage />} />
            <Route path="order" element={<Orders />} />
            <Route path="user" element={<Users />} />
            <Route path="report" element={<Reports />} />
            <Route path="setting" element={<Settings />} />
            <Route path=":collectionName" element={<Collections />} />
          </Route>
        </Route>
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <ModalProvider>
          <AppRoutes />
        </ModalProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
