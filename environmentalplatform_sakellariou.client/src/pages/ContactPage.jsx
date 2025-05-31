import React from 'react';
import '../styles/AboutContactPage.css';  

function ContactPage() {
    return (
        <div className="about-page">
            <div className="dashboard-container flex bg-gradient-to-b from-gray-100 to-gray-200 min-h-screen font-sans">
                <div className="main-content flex-1 p-6 md:p-12 lg:p-16" style={{ paddingTop: '60px' }}>
                    <div className="bg-white rounded-2xl shadow-lg p-8 max-w-4xl mx-auto">
                        <div className="bg-green-600 text-white py-2 px-6 rounded-lg mb-8 shadow">
                            <h2 className="text-xl font-bold text-center">
                                Contact Us
                            </h2>
                        </div>

                        <div className="text-gray-800 leading-relaxed text-base space-y-6">
                            <p>
                                We'd love to hear from you! Whether you have questions, feedback, or want to
                                learn more about joining our eco-action community, reach out to us any time.
                            </p>

                            <section>
                                <h3 className="text-lg font-semibold text-green-700 mb-2">Phone</h3>
                                <p>+30 698 098 4080</p>
                            </section>

                            <section>
                                <h3 className="text-lg font-semibold text-green-700 mb-2">Email</h3>
                                <p>contact@econnect.com</p>
                                <p>dimitrasak02@gmail.com</p>
                            </section>

                            <section>
                                <h3 className="text-lg font-semibold text-green-700 mb-2">Address</h3>
                                <p>123 Green Street, Athens, Greece</p>
                            </section>

                            <section>
                                <h3 className="text-lg font-semibold text-green-700 mb-2">Working Hours</h3>
                                <p>Monday to Friday: 9:00 AM - 6:00 PM</p>
                                <p>Saturday & Sunday: Closed</p>
                            </section>

                            <section>
                                <h3 className="text-lg font-semibold text-green-700 mb-2">Get in Touch</h3>
                                <p>
                                    Want to join the movement or collaborate? Please fill out the registration form
                                    on the <a href="/register" className="inline-block text-green-600 hover:underline">Join the Movement</a> page.
                                </p>
                            </section>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ContactPage;
