import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
}

const CAROUSEL_IMAGES = [
  '/auth_carousel_img1_1771828026470.png',
  '/auth_carousel_img2_1771828070241.png',
  '/auth_carousel_img3_1771828112006.png'
];

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title }) => {
  const { theme, toggleTheme } = useTheme();
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % CAROUSEL_IMAGES.length);
    }, 5000); // 5 second rotation
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen flex w-full flex-col lg:flex-row bg-transparent overflow-hidden">
      {/* Left Panel - Visuals/Carousel (Hidden on Mobile) */}
      <div className="hidden lg:block lg:w-1/2 relative">
        {CAROUSEL_IMAGES.map((img, idx) => (
          <div 
            key={idx}
            className={`absolute inset-0 transition-opacity duration-1000 ${currentImage === idx ? 'opacity-100' : 'opacity-0'}`}
          >
            <img src={img} alt="Medical Clinic" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/40 to-transparent"></div>
          </div>
        ))}

        <div className="absolute top-8 left-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 backdrop-blur-md rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">+</span>
            </div>
            <span className="text-white font-bold text-xl tracking-wide"></span>
          </div>
        </div>

      <Link
  to="/"
  // 1. Changed bg-white/10 to bg-black/40 for a dark background
  // 2. Changed border-white/20 to border-white/10 for a subtler border
  // 3. Added shadow-md for extra separation
  className="absolute top-8 left-8 flex items-center gap-2 px-4 py-2 bg-black/40 hover:bg-black/50 backdrop-blur-md rounded-full text-sm font-medium text-white transition-all border border-white/10 shadow-md"
>
  <ArrowLeft size={16} />
  <span>Back</span>
</Link>
        <div className="absolute bottom-16 left-12 right-12">
          
          <h2 className="text-2xl font-bold text-white mb-4 leading-tight">
            Barangay Iponan Health Clinic
          </h2>
          <h2 className="text-1xl text-white mb-4 leading-tight">
           Providing accessible and quality healthcare services for the community. Log in to manage your appointments and health records effortlessly.
          </h2>
          <div className="flex gap-2">
            {CAROUSEL_IMAGES.map((_, idx) => (
              <button 
                key={idx}
                onClick={() => setCurrentImage(idx)}
                className={`h-1.5 rounded-full transition-all ${currentImage === idx ? 'w-8 bg-white' : 'w-4 bg-white/40 hover:bg-white/60'}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Interactive Form */}
      <div className="w-full lg:w-1/2 flex flex-col h-screen overflow-y-auto relative">
        {/* Mobile Header (Hidden on Desktop) */}
        <div className="lg:hidden p-4 md:p-6 flex justify-between items-center border-b border-border dark:border-dark-border bg-white/50 backdrop-blur-md dark:bg-[#1E1E2D]/50">
           <span className="font-bold text-lg dark:text-white">BH Clinic</span>
           <div className="flex items-center gap-4">
             <button
               onClick={toggleTheme}
               className="p-1.5 rounded-full bg-gray-100 dark:bg-[#2A2A35] text-gray-600 dark:text-gray-300 transition-colors"
             >
               {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
             </button>
             <Link to="/" className="text-sm font-semibold text-text-muted hover:text-primary dark:text-gray-400">Back</Link>
           </div>
        </div>

        {/* Top Right Toggle (Desktop Only) */}
        <div className="hidden lg:flex w-full justify-end p-8 absolute top-0 right-0 z-10">
           <button
             onClick={toggleTheme}
             className="p-2.5 rounded-full bg-white dark:bg-[#2A2A35] text-gray-600 dark:text-gray-300 shadow-sm border border-gray-100 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
           >
             {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
           </button>
        </div>

        {/* Form Container */}
        <div className="flex-1 flex flex-col justify-center max-w-[480px] w-full mx-auto px-6 py-10 pb-12">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{title}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 max-w-sm">
            Please fill in your details to access the portal and manage your appointments.
          </p>
          
          <div className="w-full">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
