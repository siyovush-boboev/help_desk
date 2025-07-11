import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from './components/pages/Dashboard/index.jsx';
import Login from './components/pages/Login/index.jsx';
import MainPage from './components/pages/MainPage/index.jsx';
import Orders from './components/pages/Orders/index.jsx';
import Users from './components/pages/Users/index.jsx';
import Collections from "./components/pages/Collections/index.jsx";
import Reports from "./components/pages/Reports/index.jsx";
import Settings from "./components/pages/Settings/index.jsx";


function App() {
  return (
    <Router>
      <Routes>

        <Route path="/login" element={<Login />} />

        <Route path="/" element={<Dashboard />} >
          <Route index element={<MainPage />} />
          <Route path="orders" element={<Orders />} />
          <Route path="users" element={<Users />} />
          <Route path="collections" element={<Collections />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
        </Route>

      </Routes>
    </Router>
  );
}

export default App;
