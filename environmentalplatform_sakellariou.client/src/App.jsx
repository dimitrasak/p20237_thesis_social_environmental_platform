// App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './styles/main.css';

import NavigationBar from './components/NavigationBar';
import AppLayout from './components/AppLayout';

import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import RegUserDashboard from './pages/reg-user-dashboard';
import OrganizationDashboard from './pages/organization-dashboard';
import AdminDashboard from './pages/admin-dashboard';
import Profile from './pages/profile';
import EditProfile from './pages/EditProfile';
import InfoProfile from './pages/InfoProfile';
import Event from './pages/events/events';
import AddEvent from './pages/events/AddEvent';
import EditEvent from './pages/events/EditEvent';
import OrganizationEvents from './pages/events/OrganizationEvents';
import EventDetails from './pages/events/EventDetails';
import Categories from './pages/categories/categories';
import AddCategoryForm from './pages/categories/AddCategoryForm';
import Messages from './pages/messages/messages';
import Reviews from './pages/reviews/reviews';

function App() {
    return (
        <Router>
            {/* Navigation bar always visible */}
            <NavigationBar />

            <Routes>
                {/* Routes WITHOUT sidebar */}
                <Route path="/" element={<HomePage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/login" element={<LoginPage />} />

                {/* Routes WITH sidebar (wrapped in AppLayout) */}
                <Route element={<AppLayout />}>
                    <Route path="/reg-user-dashboard" element={<RegUserDashboard />} />
                    <Route path="/organization-dashboard" element={<OrganizationDashboard />} />
                    <Route path="/admin-dashboard" element={<AdminDashboard />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/edit-profile" element={<EditProfile />} />
                    <Route path="/info-profile" element={<InfoProfile />} />
                    <Route path="/events" element={<Event />} />
                    <Route path="/add-event" element={<AddEvent />} />
                    <Route path="/edit-event/:id" element={<EditEvent />} />
                    <Route path="/organization-events" element={<OrganizationEvents />} />
                    <Route path="/event-details/:eventId" element={<EventDetails />} />
                    <Route path="/categories" element={<Categories />} />
                    <Route path="/add-category" element={<AddCategoryForm />} />
                    <Route path="/add-category/:id" element={<AddCategoryForm />} />
                    <Route path="/messages" element={<Messages />} />
                    <Route path="/reviews" element={<Reviews />} />
                </Route>
            </Routes>
        </Router>
    );
}

export default App;
