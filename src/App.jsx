import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from './components/pages/Dashboard/index.jsx';
import Login from './components/pages/Login/index.jsx';


function App() {
  return (
    <Router>
      <Routes>

        <Route path="/login" element={<Login />} />

        <Route path="/" element={<Dashboard />} >
          {/* <Route index element={<HomePage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="settings" element={<SettingsPage />} /> */}
        </Route>

      </Routes>
    </Router>
  );
}

export default App;
