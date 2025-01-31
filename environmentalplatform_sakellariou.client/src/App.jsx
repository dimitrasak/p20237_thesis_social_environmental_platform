import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'; // Import Routes instead of Switch
import './styles/main.css';  // Κοινό CSS

import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import NavigationBar from './components/NavigationBar';

function App() {
    return (
        <Router>
            <div>
                {/* Navigation Bar */}
                <NavigationBar />

                {/* Routes component to handle different pages */}
                <Routes>
                    {/* Use the element prop instead of component */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
