import React from 'react';
import {
    FaLeaf,
    FaUsers,
    FaHandshake,
    FaGlobe,
    FaSeedling,
    FaCheck,
} from 'react-icons/fa';
import '../styles/AboutPage.css';

function AboutPage() {
    return (
        <div className="about-page">
            <div className="dashboard-container flex bg-gradient-to-b from-gray-100 to-gray-200 min-h-screen font-sans">
                <div className="main-content flex-1 p-6 md:p-12 lg:p-16" style={{ paddingTop: '60px' }}>
                    <div className="bg-white rounded-2xl shadow-lg p-8 max-w-4xl mx-auto">
                        <div className="bg-green-600 text-white py-8 px-6 rounded-lg mb-10 shadow">
                            <h2 className="text-3xl font-bold text-center">
                                About EConnect
                            </h2>
                        </div>

                        <div className="text-gray-800 leading-relaxed text-base space-y-6">
                            <p>
                                The escalating environmental crisis demands more than just awareness —
                                it requires active participation and a unified front. Recognizing this
                                critical need, we've built a social platform designed to be the central
                                nervous system for environmental action.
                            </p>

                            {/* Interactive Cards */}
                            <div className="interactive-card">
                                <section>
                                    <h3 className="text-xl font-semibold text-green-700 flex items-center gap-2 border-t pt-6">
                                        <FaLeaf /> Our Mission is Clear:
                                    </h3>
                                    <p>
                                        To empower individuals and organizations to collaboratively combat
                                        the effects of the environmental crisis by fostering direct engagement
                                        and amplifying impactful initiatives.
                                    </p>
                                </section>
                            </div>

                            <div className="interactive-card">
                                <section>
                                    <h3 className="text-xl font-semibold text-green-700 flex items-center gap-2 border-t pt-6">
                                        <FaHandshake /> How We Connect Action:
                                    </h3>
                                    <p>
                                        We provide a dynamic space where environmental organizations — from
                                        grassroots movements to established nonprofits — can seamlessly post
                                        their events. Whether it's a local tree planting, a global awareness
                                        campaign, a scientific webinar, or a community cleanup, this platform
                                        makes these opportunities easily discoverable.
                                    </p>
                                </section>
                            </div>

                            <div className="interactive-card">
                                <section>
                                    <h3 className="text-xl font-semibold text-green-700 flex items-center gap-2 border-t pt-6">
                                        <FaUsers /> For Individuals:
                                    </h3>
                                    <p>
                                        Passionate about creating a healthier planet? Our user-friendly interface
                                        allows you to explore and <strong>interact</strong> with these events.
                                        Imagine effortlessly finding opportunities to contribute your time, skills,
                                        and energy to causes you care about, right in your community or even
                                        virtually across the globe.
                                    </p>
                                </section>
                            </div>

                            <div className="interactive-card">
                                <section>
                                    <h3 className="text-xl font-semibold text-green-700 flex items-center gap-2 border-t pt-6">
                                        <FaGlobe /> Our Vision for a Sustainable Future:
                                    </h3>
                                    <blockquote className="border-l-4 border-green-500 pl-4 italic text-gray-600 my-4">
                                        "We envision a world where environmental action is accessible, collaborative, and impactful."
                                    </blockquote>
                                    <p>
                                        By connecting those who are driven to make a difference with the organizations
                                        leading the charge, we aim to build a powerful network of change-makers. Through
                                        collective <strong>interaction</strong>, we believe we can drive meaningful
                                        progress toward a sustainable future for all.
                                    </p>
                                </section>
                            </div>

                            <div className="interactive-card">
                                <section>
                                    <h3 className="text-xl font-semibold text-green-700 flex items-center gap-2 border-t pt-6">
                                        <FaSeedling /> Join Our Growing Community:
                                    </h3>
                                    <p>
                                        Whether you're an individual eager to get involved or an organization seeking
                                        to mobilize greater support, we invite you to join our platform. Together, we
                                        can turn awareness into action and build a brighter, greener tomorrow.
                                    </p>
                                </section>
                            </div>

                            {/* Improvements Section */}
                            <div className="interactive-card">
                                <section>
                                    <h3 className="text-xl font-semibold text-green-700 border-t pt-6 mb-4">
                                        Key Improvements in this Version:
                                    </h3>
                                    <ul className="space-y-2">
                                        <li className="flex items-start gap-2">
                                            <FaCheck className="text-green-500 mt-1" />
                                            <span><strong>Stronger Opening:</strong> Immediately addresses the urgency of the environmental crisis.</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <FaCheck className="text-green-500 mt-1" />
                                            <span><strong>Clearer Structure:</strong> Uses headings and bullet points to organize information logically.</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <FaCheck className="text-green-500 mt-1" />
                                            <span><strong>Reinforces the Core Functionality:</strong> Explains how organizations post and users engage.</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <FaCheck className="text-green-500 mt-1" />
                                            <span><strong>Highlights Benefits:</strong> Speaks directly to both individuals and organizations.</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <FaCheck className="text-green-500 mt-1" />
                                            <span><strong>Vision-Focused:</strong> Paints a compelling picture of long-term impact.</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <FaCheck className="text-green-500 mt-1" />
                                            <span><strong>Clear Call to Action:</strong> Encourages users to join the movement.</span>
                                        </li>
                                    </ul>
                                </section>
                            </div>

                            <div className="text-center mt-12 mb-10">
                                <a
                                    href="/register"
                                    className="inline-block bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-full shadow-lg transition duration-300"
                                >
                                    Join the Movement
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AboutPage;
