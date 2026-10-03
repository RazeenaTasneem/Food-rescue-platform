import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import DonorDashboard from "./pages/DonorDashboard";
import CreateDonation from "./pages/CreateDonation";
import NgoDashboard from "./pages/NgoDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import MobileNav from "./components/MobileNav";

function App() {
  return (
    <div className="app">

      <Navbar />

      <Routes>

        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route path="/donor" element={<DonorDashboard />} />

        <Route path="/create-donation" element={<CreateDonation />} />

        <Route path="/ngo" element={<NgoDashboard />} />

        <Route path="/admin" element={<AdminDashboard />} />

      </Routes>

      <MobileNav />

    </div>
  );
}

export default App;