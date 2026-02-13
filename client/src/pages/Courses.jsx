import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

const Courses = () => {
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [activeVideo, setActiveVideo] = useState(null);

    const courseList = [
        {
            id: 1,
            title: "HTML & CSS - Full Course",
            thumbnail: "https://i.ytimg.com/vi/luAkR9VaLcw/hqdefault.jpg?sqp=-oaymwEnCNACELwBSFryq4qpAxkIARUAAIhCGAHYAQHiAQoIGBACGAY4AUAB&rs=AOn4CLDnUWiDQRlAJmkKDzhZ7o32IG7v4g",
            category: "Certification",
            videoCount: 12,
            duration: "8.5 hours",
            instructor: {
                name: "Anshuman Varma",
                role: "Lead Instructor",
                avatar: "https://avatars.githubusercontent.com/u/180281804?v=4"
            },
            syllabus: [
                {
                    chapter: "1 - Introduction to IT Tools",
                    lectures: [
                        { title: "Conceptualizing Computer System", duration: "12 min", url: "https://www.youtube.com/watch?v=z6rY5yO-XF8" },
                        { title: "Basics of Operating Systems", duration: "15 min", url: "https://www.youtube.com/watch?v=26QPDBe-NB8" }
                    ]
                },
                {
                    chapter: "2 - Web Designing",
                    lectures: [
                        { title: "HTML Basics", duration: "18 min", url: "https://www.youtube.com/watch?v=ok-plXXHlWw" },
                        { title: "CSS Styling", duration: "22 min", url: "https://www.youtube.com/watch?v=yfoY53QXEnI" }
                    ]
                }
            ]
        },
        {
            id: 2,
            title: "ADCA: Master Computer Applications",
            thumbnail: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTz6z6z6z6z6z6z6z6z6z6z6z6z6z6z6z6z6z6&s",
            category: "Diploma",
            videoCount: 8,
            duration: "12.2 hours",
            instructor: {
                name: "Prerna Prem",
                role: "Senior Mentor",
                avatar: "https://media.licdn.com/dms/image/v2/D4E03AQFnBQYrtk6dyA/profile-displayphoto-scale_200_200/B4EZqvCL3AHgAY-/0/1763873178731?e=1772668800&v=beta&t=FPc1unJ7o58VgYRTbHJ4BYtVP9yAkYdcqZjxzJ5SthE"
            },
            syllabus: [
                {
                    chapter: "1 - Advance Office Automation",
                    lectures: [
                        { title: "Expert Level Excel", duration: "25 min", url: "https://www.youtube.com/watch?v=0_vP8KskD_k" },
                        { title: "Advanced PowerPoint Designs", duration: "20 min", url: "https://www.youtube.com/watch?v=u7Tku3_RGPs" }
                    ]
                }
            ]
        },
        {
            id: 3,
            title: "Tally Prime with GST: Pro Accounting",
            thumbnail: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR_x_x_x_x_x_x_x_x_x_x_x_x_x_x_x_x_x_x&s",
            category: "Professional",
            videoCount: 15,
            duration: "6.0 hours",
            instructor: {
                name: "Ganesh Lokhande",
                role: "Accounts Specialist",
                avatar: "https://media.licdn.com/dms/image/v2/D5603AQFiUytXp9704w/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1684919727537?e=1772668800&v=beta&t=L3y1_Z3KefFijmmC4mwgztvEaFrNHSLZ20liSFnUeLo"
            },
            syllabus: [
                {
                    chapter: "1 - Fundamentals of Accounting",
                    lectures: [
                        { title: "Introduction to Tally Prime", duration: "12 min", url: "https://www.youtube.com/watch?v=R9N3HREpW_8" },
                        { title: "GST Setup in Tally", duration: "18 min", url: "https://www.youtube.com/watch?v=9_i1X_W5U0U" }
                    ]
                }
            ]
        }
    ];

    const getYouTubeId = (url) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const handleCourseClick = (course) => {
        setSelectedCourse(course);
        if (course.syllabus && course.syllabus.length > 0) {
            setActiveVideo(course.syllabus[0].lectures[0]);
        }
    };

    if (selectedCourse) {
        return (
            <div className="min-h-screen bg-[#0f1115] text-gray-100 flex">
                <Sidebar />
                <div className="flex-1 ml-64 flex flex-col">
                    <Navbar />
                    <main className="flex-1 mt-20 p-0 flex h-[calc(100vh-5rem)]">
                        {/* Player Section */}
                        <div className="flex-1 p-8 overflow-y-auto bg-gray-900 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                            <style>{`
                                .scrollbar-hide::-webkit-scrollbar {
                                    display: none;
                                }
                            `}</style>
                            {/* Breadcrumb */}
                            <button
                                onClick={() => setSelectedCourse(null)}
                                className="flex items-center gap-2 text-gray-400 hover:text-green-500 mb-6 transition-colors group"
                            >
                                <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span>
                                <span className="text-sm font-medium uppercase tracking-widest">Back to Courses</span>
                            </button>

                            {/* Video Container */}
                            <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-3xl bg-black border border-gray-800">
                                {activeVideo ? (
                                    <iframe
                                        width="100%"
                                        height="100%"
                                        src={`https://www.youtube.com/embed/${getYouTubeId(activeVideo.url)}?autoplay=1&rel=0`}
                                        title={activeVideo.title}
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    ></iframe>
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-600">
                                        <span className="material-symbols-outlined text-6xl">play_circle</span>
                                    </div>
                                )}
                            </div>

                            {/* Info Section */}
                            <div className="mt-8 flex justify-between items-start">
                                <div>
                                    <h1 className="text-2xl font-bold text-white mb-2">{activeVideo?.title}</h1>
                                    <p className="text-gray-400 flex items-center gap-2">
                                        Course: <span className="text-green-500 font-bold">{selectedCourse.title}</span>
                                    </p>
                                </div>
                                <button className="bg-green-600 hover:bg-green-700 text-white font-bold px-8 py-3 rounded-xl transition-all shadow-xl shadow-green-900/20 uppercase tracking-wider text-sm">
                                    Enroll Now
                                </button>
                            </div>

                            <div className="mt-10 pt-10 border-t border-gray-800 flex items-center gap-4">
                                <img src={selectedCourse.instructor.avatar} alt={selectedCourse.instructor.name} className="w-12 h-12 rounded-full border border-gray-700" />
                                <div>
                                    <p className="text-white font-bold">{selectedCourse.instructor.name}</p>
                                    <p className="text-gray-500 text-xs">Instructor</p>
                                </div>
                            </div>
                        </div>

                        {/* Syllabus Sidebar */}
                        <div className="w-96 bg-[#15171c] border-l border-gray-800 overflow-y-auto scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                            <div className="p-6 border-b border-gray-800">
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Course Syllabus</h3>
                                <p className="text-white font-bold line-clamp-1">{selectedCourse.title}</p>
                            </div>

                            <div className="divide-y divide-gray-800/50">
                                {selectedCourse.syllabus.map((chapter, cIdx) => (
                                    <div key={cIdx} className="bg-gray-800/20">
                                        <div className="p-4 flex items-center justify-between text-gray-400">
                                            <span className="text-xs font-bold uppercase tracking-tight line-clamp-1">{chapter.chapter}</span>
                                            <span className="material-symbols-outlined text-sm">keyboard_arrow_down</span>
                                        </div>
                                        <div className="space-y-1 pb-2">
                                            {chapter.lectures.map((lecture, lIdx) => (
                                                <button
                                                    key={lIdx}
                                                    onClick={() => setActiveVideo(lecture)}
                                                    className={`w-full p-4 flex items-start gap-4 transition-all hover:bg-gray-800/50 relative ${activeVideo?.title === lecture.title ? 'bg-gray-800 border-l-4 border-green-500' : ''}`}
                                                >
                                                    <div className={`p-2 rounded-lg flex items-center justify-center ${activeVideo?.title === lecture.title ? 'bg-green-500/10 text-green-500' : 'bg-gray-700/30 text-gray-500'}`}>
                                                        <span className="material-symbols-outlined text-base">
                                                            {activeVideo?.title === lecture.title ? 'play_arrow' : 'lock_open'}
                                                        </span>
                                                    </div>
                                                    <div className="text-left flex-1">
                                                        <p className={`text-sm font-bold leading-snug ${activeVideo?.title === lecture.title ? 'text-white' : 'text-gray-400'}`}>
                                                            {lecture.title}
                                                        </p>
                                                        <p className="text-[10px] text-gray-500 mt-1 flex items-center gap-1">
                                                            <span className="material-symbols-outlined text-[12px]">schedule</span>
                                                            {lecture.duration}
                                                        </p>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0f1115] text-gray-100 flex">
            <Sidebar />
            <div className="flex-1 ml-64 flex flex-col">
                <Navbar />
                <main className="p-8 mt-20">
                    <header className="mb-10 flex justify-between items-center">
                        <h2 className="text-3xl font-bold text-white tracking-tight">
                            Recommended <span className="text-green-500">Courses</span>
                        </h2>
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {courseList.map((course, index) => (
                            <div
                                key={index}
                                onClick={() => handleCourseClick(course)}
                                className="bg-[#15171c] rounded-2xl overflow-hidden shadow-2xl border border-gray-800/50 group hover:scale-[1.02] transition-all duration-300 cursor-pointer"
                            >
                                {/* Thumbnail Section */}
                                <div className="relative h-44 w-full overflow-hidden">
                                    <img
                                        src={course.thumbnail}
                                        alt={course.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        onError={(e) => {
                                            e.target.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60';
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent"></div>
                                    <div className="absolute bottom-4 left-4">
                                        <h4 className="text-white font-bold text-lg leading-tight line-clamp-2 drop-shadow-lg">
                                            {course.title.split(':')[0]}
                                        </h4>
                                    </div>
                                </div>

                                {/* Content Section */}
                                <div className="p-5 flex flex-col gap-4">
                                    <div>
                                        <span className="bg-[#24272e] text-[#b0b3b8] text-[10px] font-bold px-3 py-1 rounded-md uppercase tracking-wider">
                                            {course.category}
                                        </span>
                                        <h3 className="text-white font-bold text-base mt-2 line-clamp-2 transition-colors">
                                            {course.title}
                                        </h3>
                                    </div>

                                    <div className="space-y-1">
                                        <p className="text-gray-400 text-xs font-medium">
                                            No. of videos: <span className="text-gray-200">{course.videoCount}</span>
                                        </p>
                                        <p className="text-gray-400 text-xs font-medium">
                                            Course time: <span className="text-gray-200">{course.duration}</span>
                                        </p>
                                    </div>

                                    {/* Instructor Section */}
                                    <div className="flex items-center gap-3 mt-2 pt-4 border-t border-gray-800/50">
                                        <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-700">
                                            <img
                                                src={course.instructor.avatar}
                                                alt={course.instructor.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div>
                                            <p className="text-white text-xs font-bold leading-none">{course.instructor.name}</p>
                                            <p className="text-gray-500 text-[10px] mt-1">{course.instructor.role}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                </main>
            </div>
        </div>
    );
};

export default Courses;
