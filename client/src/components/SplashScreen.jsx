import React, { useEffect, useState } from 'react';
import { APP_NAME } from '../utils/constants';

const SplashScreen = ({ onFinish }) => {
    const [opacity, setOpacity] = useState(1);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const DURATION = 2000; // 2 seconds
        const INTERVAL = 100; // Update every 100ms
        const STEPS = DURATION / INTERVAL;

        let currentStep = 0;

        const timer = setInterval(() => {
            currentStep++;
            const newProgress = Math.min((currentStep / STEPS) * 100, 100);
            setProgress(newProgress);

            if (currentStep >= STEPS) {
                clearInterval(timer);
                setOpacity(0);
                setTimeout(onFinish, 500);
            }
        }, INTERVAL);

        return () => clearInterval(timer);
    }, [onFinish]);

    return (
        <div
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gray-900 transition-opacity duration-500 ease-in-out"
            style={{ opacity: opacity }}
        >
            <div className="text-center flex flex-col items-center w-full max-w-md px-4">
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-green-600 mb-4 tracking-tight drop-shadow-sm filter">
                        {APP_NAME}<span className="text-white">Setu</span>
                    </h1>
                    <div className="h-1 w-24 bg-green-600 mx-auto rounded-full mb-4"></div>
                    <p className="text-gray-300 text-lg font-light tracking-wide">
                        Online Learning Platform for Urban Students
                    </p>
                    {/* <p className="text-xl text-gray-100 font-semibold mt-2 tracking-wide">
                        Advance Computer Career Institute
                    </p> */}
                </div>

                {/* Progress Bar Container */}
                <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden relative mb-4">
                    {/* Animated Progress Bar */}
                    <div
                        className="absolute top-0 left-0 h-full bg-green-600 transition-all duration-100 ease-linear shadow-[0_0_10px_rgba(220,38,38,0.7)]"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>

                <div className="flex justify-between w-full text-xs text-gray-500 font-mono tracking-widest uppercase">
                    <span className="animate-pulse">Loading System...</span>
                    <span>{Math.round(progress)}%</span>
                </div>
            </div>
        </div>
    );
};

export default SplashScreen;
