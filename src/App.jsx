import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from './components/pages/Dashboard/index.jsx';
import Login from './components/pages/Login/index.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import { AuthProvider } from "./lib/contexts/AuthContext";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
