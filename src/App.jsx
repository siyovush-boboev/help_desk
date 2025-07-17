import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from './components/pages/Dashboard';
import Login from './components/pages/Login';
import MainPage from './components/pages/MainPage';
import Orders from './components/pages/Orders';
import Users from './components/pages/Users';
import Collections from "./components/pages/Collections";
import Reports from "./components/pages/Reports";
import Settings from "./components/pages/Settings";
import ModalProvider from "./components/layout/ModalProvider";


function App() {
  return (
    <ModalProvider>
      <Router>
        <Routes>

          <Route path="/login" element={<Login />} />

          <Route path="/" element={<Dashboard />} >
            <Route path="main" index element={<MainPage />} />
            <Route path="order" element={<Orders />} />
            <Route path="user" element={<Users />} />
            <Route path="report" element={<Reports />} />
            <Route path="setting" element={<Settings />} />
            <Route path=":collectionName" element={<Collections />} />
          </Route>

        </Routes>
      </Router>
    </ModalProvider>
  );
}

export default App;
