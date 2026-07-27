import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import VerifyOTP from "./pages/VerifyOTP";
import Dashboard from "./pages/Dashboard";
import Contacts from "./pages/Contacts";
import Journey from "./pages/Journey";
import JourneyHistory from "./pages/JourneyHistory";
import SOS from "./pages/SOS";
import SafePlaces from "./pages/SafePlaces";
import Report from "./pages/Report";

function App() {

    return (

        <Routes>

            <Route path="/" element={<Home />} />

            <Route path="/login" element={<Login />} />

            <Route path="/signup" element={<Signup />} />

            <Route path="/verify-email" element={<VerifyOTP />} />

            <Route path="/dashboard" element={<Dashboard />} />

            <Route path="/contacts" element={<Contacts />} />

            <Route path="/journey" element={<Journey />} />

            <Route path="/history" element={<JourneyHistory />} />

            <Route path="/sos" element={<SOS />} />

            <Route path="/safe-places" element={<SafePlaces />} />

            <Route path="/report" element={<Report />} />

        </Routes>

    );

}

export default App;