import React from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { APP_NAME } from '../utils/constants';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div className="flex bg-gray-900 min-h-screen text-gray-100 font-sans selection:bg-green-500/30 selection:text-green-400">
            <Sidebar />
            <div className="flex-1 ml-64 flex flex-col">
                <Navbar />
                <main className="p-8 mt-20">
                    {/* Hero Section */}
                    <div className="relative rounded-3xl overflow-hidden mb-12 shadow-2xl border border-gray-800 bg-gray-800/50 backdrop-blur-sm">
                        <div className="absolute inset-0 bg-gradient-to-br from-green-900/40 to-transparent z-0"></div>
                        <div className="relative z-10 p-12 flex flex-col items-center text-center">
                            <span className="bg-green-500/10 text-green-400 text-xs font-bold px-4 py-2 rounded-full uppercase tracking-widest mb-6 border border-green-500/20">
                                Leading the Education Revolution
                            </span>
                            <h1 className="text-5xl font-extrabold mb-6 text-white tracking-tighter">
                                {APP_NAME}<span className="text-green-500">Setu</span>
                            </h1>
                            <p className="text-gray-400 text-xl max-w-2xl leading-relaxed font-light">
                                Empowering students through quality education and technology. We bring the best learning resources to your doorstep.
                            </p>
                        </div>
                    </div>

                    <div className="max-w-5xl mx-auto space-y-12 mb-20">
                        {/* Company Details */}
                        <div className="space-y-8">
                            <section className="bg-gray-800/30 border border-gray-700 rounded-3xl p-10 backdrop-blur-sm">
                                <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
                                    <span className="w-2 h-10 bg-green-500 rounded-full mr-4"></span>
                                    Our Mission & Vision
                                </h2>
                                <p className="text-gray-400 text-lg leading-relaxed mb-6 font-light">
                                    GaonSetu is dedicated to bridging the educational gap by providing state-of-the-art computer education and professional courses to every corner of the nation.
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800 group hover:border-green-500/30 transition-colors">
                                        <span className="material-symbols-outlined text-green-500 text-3xl mb-4">star</span>
                                        <h3 className="text-white font-bold text-xl mb-2">Quality First</h3>
                                        <p className="text-gray-500 text-sm font-light">We ensure the highest standards in education through curated content and expert mentors.</p>
                                    </div>
                                    <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800 group hover:border-green-500/30 transition-colors">
                                        <span className="material-symbols-outlined text-green-500 text-3xl mb-4">group</span>
                                        <h3 className="text-white font-bold text-xl mb-2">Accessible Learning</h3>
                                        <p className="text-gray-500 text-sm font-light">Our platform is designed to be easy to use and accessible from anywhere, anytime.</p>
                                    </div>
                                </div>
                            </section>

                            <section className="bg-gray-800/30 border border-gray-700 rounded-3xl p-10 backdrop-blur-sm">
                                <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
                                    <span className="w-2 h-10 bg-green-500 rounded-full mr-4"></span>
                                    What We Offer
                                </h2>
                                <div className="flex flex-wrap gap-3">
                                    {["O Level (NIELIT)", "ADCA", "DCA", "Tally Prime", "OMC"].map(tag => (
                                        <span key={tag} className="bg-gray-900 text-gray-400 border border-gray-700 px-6 py-3 rounded-2xl text-sm font-medium hover:border-green-500/50 hover:text-white transition-all">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </section>
                        </div>
                    </div>

                    {/* Why We Started Section */}
                    <div className="mt-20 mb-20">
                        <div className="text-center mb-12">
                            <h2 className="text-4xl font-bold text-white mb-4 tracking-tighter">
                                Why Did We Start <span className="text-green-500">{APP_NAME}Setu?</span>
                            </h2>
                            <p className="text-gray-400 text-lg font-light italic">Here are some key challenges predominantly experienced by the students.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 rounded-3xl overflow-hidden border border-dashed border-gray-700 bg-gray-900/40 backdrop-blur-sm">
                            {[
                                { title: "Lack of motivation", emoji: "🧐", text: "Staying engaged with learning can be tough, especially when tackling challenging concepts." },
                                { title: "Career clarity", emoji: "❌", text: "Many students feel uncertain about which area of education to focus on, leading to confusion and stalled progress." },
                                { title: "Always in doubt", emoji: "👩‍💻", text: "Students frequently wonder if they're good enough or if they'll ever master the skills needed in their field." },
                                { title: "Procrastination", emoji: "🤯", text: "Putting off assignments or projects creates unnecessary stress and impacts the learning journey." }
                            ].map((item, idx) => (
                                <div key={idx} className={`p-10 flex flex-col items-start ${idx !== 3 ? 'border-r border-dashed border-gray-700' : ''} hover:bg-white/5 transition-colors group`}>
                                    <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                                        {item.title} <span className="ml-2 text-3xl">{item.emoji}</span>
                                    </h3>
                                    <p className="text-gray-400 leading-relaxed text-lg font-light group-hover:text-gray-300 transition-colors">
                                        {item.text}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Mentors Section */}
                    <div className="mt-20 mb-20 text-center">
                        <h2 className="text-4xl font-bold text-white mb-12 tracking-tighter">Meet Our Expert Mentors</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-x-8 gap-y-12">
                            {[
                                { name: "Prerna Prem", role: "CEO @ GaonSetu", company: "GoanSetu", image: "https://media.licdn.com/dms/image/v2/D4E03AQFnBQYrtk6dyA/profile-displayphoto-scale_200_200/B4EZqvCL3AHgAY-/0/1763873178731?e=1772668800&v=beta&t=FPc1unJ7o58VgYRTbHJ4BYtVP9yAkYdcqZjxzJ5SthE" },
                                { name: "Ganesh Lokhande", role: "SDE @ GaonSetu", company: "GoanSetu", image: "https://media.licdn.com/dms/image/v2/D5603AQFiUytXp9704w/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1684919727537?e=1772668800&v=beta&t=L3y1_Z3KefFijmmC4mwgztvEaFrNHSLZ20liSFnUeLo" },
                                { name: "Scahin Singh", role: "Trainer", company: "GoanSetu", image: "https://media.licdn.com/dms/image/v2/D5603AQEDeC8bYbgHlw/profile-displayphoto-scale_200_200/B56ZwOFbc.JIAc-/0/1769762832076?e=1772668800&v=beta&t=v8_rQMiitmu5FRoimKi2CAFMr3GqZZzfWx0jElih_q4" },
                                { name: "Anshuman Varma", role: "Trainer", company: "GoanSetu", image: "https://avatars.githubusercontent.com/u/180281804?v=4" },
                                { name: "Tanvi Sharma", role: "Trainer", company: "GoanSetu", image: "https://www.shutterstock.com/image-photo/profile-picture-studio-headshot-business-260nw-2310388241.jpg" },
                                { name: "Aditi Shukla", role: "Trainer", company: "GoanSetu", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRP_139gKXq2t2wCfM4QPv4s-BjREMGhiK3lw&s" },
                            ].map((mentor, idx) => (
                                <div key={idx} className="flex flex-col items-center group">
                                    <div className="relative mb-4">
                                        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-800 group-hover:border-green-500 transition-colors shadow-2xl">
                                            <img src={mentor.image} alt={mentor.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        </div>
                                        <div className="absolute bottom-0 right-0 bg-white p-1 rounded-full shadow-lg w-10 h-10 flex items-center justify-center border border-gray-100 overflow-hidden text-[8px] font-black text-gray-900 group-hover:scale-110 transition-transform">
                                            {mentor.company}
                                        </div>
                                    </div>
                                    <h4 className="text-white font-bold text-lg mb-1">{mentor.name}</h4>
                                    <p className="text-gray-500 text-xs leading-none whitespace-pre-wrap max-w-[120px]">{mentor.role}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Explore and Grab Section */}
                    <div className="mt-32 mb-16 px-4">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl font-bold text-white mb-4 tracking-tighter">
                                A Lot to Explore and <span className="text-green-500">Grab</span>
                            </h2>
                            <p className="text-gray-400 text-xl font-light max-w-2xl mx-auto">
                                Get more than just courses! Explore our additional features to help you grow your career and learning experience.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {/* Progress Card */}
                            <div className="bg-gray-800/20 border border-dashed border-gray-700 rounded-[2.5rem] p-10 backdrop-blur-sm relative overflow-hidden group hover:border-green-500/50 transition-all duration-500 flex flex-col h-full">
                                <h3 className="text-3xl font-bold text-white mb-4 flex items-center">
                                    Track your Progress <span className="ml-3">📈</span>
                                </h3>
                                <p className="text-gray-400 text-lg mb-6 leading-relaxed flex-1">
                                    <span className="bg-orange-500/20 text-orange-400 px-1 rounded font-bold">Plan and track your learning</span> progress by keeping track of your skills and development.
                                </p>
                                <div className="grid grid-cols-8 gap-2 mt-4 p-4 bg-gray-900/50 rounded-2xl border border-gray-800 max-h-32 overflow-hidden">
                                    {Array.from({ length: 32 }).map((_, i) => (
                                        <div key={i} className={`h-4 rounded-sm ${Math.random() > 0.6 ? 'bg-orange-500' : 'bg-gray-800'}`}></div>
                                    ))}
                                </div>
                            </div>

                            {/* Community Card */}
                            <div className="bg-gray-800/20 border border-dashed border-gray-700 rounded-[2.5rem] p-10 backdrop-blur-sm relative group hover:border-green-500/50 transition-all duration-500 flex flex-col h-full">
                                <h3 className="text-3xl font-bold text-white mb-4 flex items-center">
                                    Join our Community! <span className="ml-3">💬</span>
                                </h3>
                                <p className="text-gray-400 text-lg mb-8 leading-relaxed flex-1">
                                    Where learning meets like-minded peers. Connect, collaborate, and stay updated on our latest offerings.
                                </p>
                                <div className="flex -space-x-4 mb-8">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <img key={i} src={`https://i.pravatar.cc/100?u=${i + 10}`} className="w-12 h-12 rounded-full border-4 border-gray-900 object-cover" alt="Community Member" />
                                    ))}
                                    <div className="w-12 h-12 rounded-full border-4 border-gray-900 bg-gray-800 flex items-center justify-center text-xs font-bold text-green-500">+1.2k</div>
                                </div>
                                <button className="w-full bg-green-600 hover:bg-green-700 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-green-900/20 flex items-center justify-center text-xl uppercase tracking-tighter cursor-pointer">
                                    Join Community <span className="material-symbols-outlined ml-2">group</span>
                                </button>
                            </div>

                            {/* Notes Card */}
                            <div className="bg-gray-800/20 border border-dashed border-gray-700 rounded-[2.5rem] p-10 backdrop-blur-sm relative group hover:border-green-500/50 transition-all duration-500 flex flex-col h-full">
                                <h3 className="text-3xl font-bold text-white mb-4 flex items-center">
                                    Take Effective Notes <span className="ml-3 text-orange-500">📝</span>
                                </h3>
                                <p className="text-gray-400 text-lg mb-6 leading-relaxed flex-1">
                                    <span className="bg-green-500/20 text-green-400 px-1 rounded font-bold">Enhance your learning experience</span> with the Notes feature. Your personalized study companion.
                                </p>
                                <div className="bg-gray-900 p-4 rounded-2xl border border-gray-800 shadow-xl border-b-0 rounded-b-none h-32 overflow-hidden">
                                    <div className="h-4 bg-gray-800 w-1/4 rounded mb-4"></div>
                                    <div className="space-y-2">
                                        <div className="h-2 bg-gray-800 w-full rounded"></div>
                                        <div className="h-2 bg-gray-800 w-5/6 rounded"></div>
                                        <div className="h-2 bg-gray-800 w-4/6 rounded"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Final CTA */}
                        <div className="mt-20 flex justify-center">
                            <Link
                                to="/courses"
                                className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-5 px-14 rounded-2xl transition-all shadow-xl shadow-orange-900/30 flex items-center text-xl uppercase tracking-wider hover:scale-105 active:scale-95 cursor-pointer no-underline"
                            >
                                Start Learning Now <span className="material-symbols-outlined ml-3 text-2xl">arrow_forward</span>
                            </Link>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Home;
