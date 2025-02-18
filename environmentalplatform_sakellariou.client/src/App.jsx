import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'; // Import Routes instead of Switch
import './styles/main.css';  

import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import RegisterPage from './pages/RegisterPage';
import NavigationBar from './components/NavigationBar';
import LoginPage from './pages/LoginPage';
import RegUserDashboard from './pages/reg-user-dashboard';
import OrganizationDashboard from './pages/organization-dashboard';
import Profile from './pages/profile';
import EditProfile from './pages/EditProfile';
import InfoProfile from './pages/InfoProfile';
import Event from './pages/events/events';
import AddEvent from './pages/events/AddEvent';

function App() {
    return (
        <Router>
            <div>
                {/* Navigation Bar */}
                <NavigationBar />

                {/* Routes component to handle different pages */}
                <div className="content">
                <Routes>
                    {/* Use the element prop instead of component */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/login" element={<LoginPage />} />
                        <Route path="/reg-user-dashboard" element={<RegUserDashboard />} />
                        <Route path="/organization-dashboard" element={<OrganizationDashboard />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/edit-profile" element={<EditProfile />} />
                        <Route path="/info-profile" element={<InfoProfile />} />
                        <Route path="/events" element={<Event />} />
                        <Route path="/add-event" element={<AddEvent />} />




                </Routes>
                </div>
            </div>
        </Router>
    );
}

export default App;
