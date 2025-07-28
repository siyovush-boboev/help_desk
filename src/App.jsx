import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
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

import "./index.css";

function App() {
  return (
    <AuthProvider>
      <ModalProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route element={<ProtectedRoute />}>

              <Route path="/" element={<Dashboard />}>
                <Route path="main" index element={<MainPage />} />
                <Route path="orders" element={<Orders />} />
                <Route path="users" element={<Users />} />
                <Route path="report" element={<Reports />} />
                <Route path="setting" element={<Settings />} />
                <Route path=":collectionName" element={<Collections />} />
              </Route>
            </Route>
          </Routes>
        </Router>
      </ModalProvider>
    </AuthProvider>
  );
}

export default App;
