import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { APP_NAME } from '../utils/constants';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for Leaflet default icon issue in React/Vite
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const About = () => {
    const navigate = useNavigate();
    const position = [31.2559, 75.7051]; // Lovely Professional University coordinates

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col">
            <Sidebar />
            <nav className="bg-gray-800 shadow-lg px-8 py-5 flex justify-between items-center fixed top-0 left-0 right-0 z-50 h-20 text-white mb-8 border-b border-gray-700 ml-64">
                <div className="flex items-center space-x-6">
                    <h1 className="text-2xl font-bold text-white tracking-tight">About शिक्षा Setu</h1>
                </div>
                <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white transition-colors font-medium border border-gray-600/50 px-4 py-2 rounded-lg hover:bg-gray-700/50 cursor-pointer">
                    Back
                </button>
            </nav>

            <div className="flex-1 ml-64 mt-20 p-8">
                <div className="w-full bg-gray-800 rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-700 backdrop-blur-sm">
                    {/* Hero Section */}
                    <div className="relative h-72 bg-gradient-to-br from-green-900 via-gray-900 to-black flex items-center justify-center overflow-hidden">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-30"></div>
                        <div className="absolute inset-0 bg-green-500/10 mix-blend-overlay"></div>
                        <div className="relative z-10 text-center px-6">
                            <span className="bg-green-500/20 text-green-400 text-xs font-bold px-4 py-2 rounded-full uppercase tracking-widest mb-4 inline-block border border-green-500/20">
                                Since 2024
                            </span>
                            <h1 className="text-5xl font-extrabold text-white mb-2 tracking-tight">
                                {APP_NAME}<span className="text-green-500">Setu</span>
                            </h1>
                            <p className="text-gray-400 text-lg font-light max-w-lg mx-auto">Empowering the next generation of IT professionals through accessible education.</p>
                        </div>
                    </div>

                    <div className="p-10 space-y-12">
                        {/* Mission & Vision */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <section className="bg-gray-900/40 p-8 rounded-3xl border border-dashed border-gray-700 hover:border-green-500/50 transition-all group">
                                <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined text-green-500 text-3xl">rocket_launch</span>
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-4 tracking-tight">Our Mission</h2>
                                <p className="text-gray-400 leading-relaxed font-light">
                                    GaonSetu is dedicated to bridging the educational gap by providing state-of-the-art computer education and professional courses to every corner of the nation, especially targeting students who lack access to premium resources.
                                </p>
                            </section>

                            <section className="bg-gray-900/40 p-8 rounded-3xl border border-dashed border-gray-700 hover:border-green-500/50 transition-all group">
                                <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined text-orange-500 text-3xl">visibility</span>
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-4 tracking-tight">Our Vision</h2>
                                <p className="text-gray-400 leading-relaxed font-light">
                                    To become the leading platform for community-driven learning, where quality education is not a luxury but a right. We aim to nurture 1 million skilled professionals by 2030.
                                </p>
                            </section>
                        </div>

                        {/* Courses Section */}
                        <section className="bg-gray-900/40 p-8 rounded-3xl border border-gray-700">
                            <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                                <span className="w-1.5 h-8 bg-green-500 rounded-full"></span>
                                Programs we specialize in
                            </h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {["O Level (NIELIT)", "ADCA", "DCA", "Tally Prime", "OMC", "CCC"].map(tag => (
                                    <div key={tag} className="bg-gray-800 border border-gray-700 px-6 py-4 rounded-2xl text-sm font-medium hover:border-green-500/50 text-gray-400 hover:text-white transition-all flex items-center gap-2">
                                        <span className="material-symbols-outlined text-green-500 text-xl">check_circle</span>
                                        {tag}
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Contact & Location Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Detailed Contact Card */}
                            <div className="bg-gray-900/40 rounded-3xl p-8 shadow-2xl shadow-green-900/20 text-white relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform">
                                    <span className="material-symbols-outlined text-8xl">contact_support</span>
                                </div>
                                <h3 className="text-2xl font-black mb-4 uppercase tracking-tighter">Get In Touch</h3>
                                <p className="text-green-100 mb-8 font-light">Have questions about our courses or platform? We are here to help!</p>
                                <div className="space-y-6 flex flex-col items-center">
                                    <div className="flex items-center space-x-4 w-full">
                                        <span className="material-symbols-outlined bg-white/20 p-2 rounded-lg">person</span>
                                        <div>
                                            <p className="text-xs text-green-200 uppercase font-bold tracking-widest">Manager</p>
                                            <p className="font-bold text-lg">Anshuman Varma</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-4 w-full">
                                        <span className="material-symbols-outlined bg-white/20 p-2 rounded-lg">phone</span>
                                        <div>
                                            <p className="text-xs text-green-200 uppercase font-bold tracking-widest">Call Us</p>
                                            <p className="font-bold text-lg">+91 8924943256</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Location Card */}
                            <div className="bg-gray-900/40 border border-gray-700 rounded-3xl p-8 backdrop-blur-sm">
                                <h3 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-green-500">location_on</span>
                                    Our Location
                                </h3>
                                <div className="aspect-video rounded-2xl overflow-hidden border border-gray-700 group hover:border-green-500/30 transition-colors shadow-inner bg-gray-900 relative z-0">
                                    <MapContainer center={position} zoom={15} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                                        <TileLayer
                                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        />
                                        <Marker position={position}>
                                            <Popup>
                                                Lovely Professional University <br /> Phagwara, Punjab
                                            </Popup>
                                        </Marker>
                                    </MapContainer>
                                </div>
                                <div className="mt-4 flex items-start gap-3">
                                    <span className="material-symbols-outlined text-gray-500 text-sm mt-1">navigation</span>
                                    <p className="text-sm font-light text-gray-400">
                                        Lovely Professional University, <br />
                                        Phagwara, Punjab, India - 144411
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Feedback Section (Moved here for better flow) */}
                        <section className="bg-gray-900/40 rounded-3xl p-10 flex flex-col items-center justify-center text-center group transition-all border border-gray-700 hover:border-green-500/30 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:rotate-12 transition-transform">
                                <span className="material-symbols-outlined text-9xl">chat</span>
                            </div>
                            <h3 className="text-3xl font-black text-white mb-4 uppercase tracking-tighter">We Value Your Opinion</h3>
                            <p className="text-gray-400 mb-8 font-light max-w-md">Your feedback helps us grow and improve the learning experience for everyone in our community.</p>
                            <Link to="/feedback" className="bg-green-600 text-white font-black py-4 px-12 rounded-2xl hover:bg-green-500 hover:scale-110 active:scale-95 transition-all shadow-xl shadow-green-900/20 inline-flex items-center gap-2 uppercase tracking-wider cursor-pointer">
                                Share Feedback
                                <span className="material-symbols-outlined">send</span>
                            </Link>
                        </section>
                    </div>

                    {/* Developer Info */}
                    <div className="bg-gray-800/80 p-8 text-center border-t border-gray-700 flex flex-col items-center justify-center space-y-4">
                        <p className="text-gray-500 text-sm italic">"Education is the most powerful weapon which you can use to change the world."</p>
                        <div className="flex items-center space-x-3 bg-gray-900/50 px-6 py-3 rounded-full border border-gray-700">
                            <span className="material-symbols-outlined text-green-500 animate-pulse">code</span>
                            <span className="text-gray-300 font-semibold tracking-wide uppercase text-xs">GaonSetu Dev Team</span>
                        </div>
                    </div>

                    <div className="bg-gray-900/50 p-6 text-center border-t border-gray-800 text-xs text-gray-600">
                        &copy; {new Date().getFullYear()} GaonSetu. All Rights Reserved.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default About;
