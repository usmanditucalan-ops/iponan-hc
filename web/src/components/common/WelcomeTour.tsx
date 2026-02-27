import React, { useState, useEffect } from 'react';
import { X, ChevronRight, Check } from 'lucide-react';
import { Card } from '../ui/Card';

interface Step {
  title: string;
  description: string;
  image?: string;
}

const TOUR_STEPS: Step[] = [
  {
    title: "Welcome to Iponan Health Center",
    description: "We've upgraded your experience! managing your health records and appointments is now easier than ever."
  },
  {
    title: "Real-time Dashboard",
    description: "Get a quick overview of today's schedule, patient queues, and important announcements right here."
  },
  {
    title: "Smart Appointments",
    description: "Book, reschedule, or print appointment slips instantly. We'll remind you when it's time."
  },
  {
    title: "Secure Records",
    description: "Your medical history is safe with us. Access past prescriptions and consultation notes anytime."
  }
];

export const WelcomeTour = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Check if user has seen the tour
    const hasSeenTour = localStorage.getItem('hasSeenWelcomeTour_v1');
    if (!hasSeenTour) {
      // Small delay to allow dashboard to load
      const timer = setTimeout(() => setIsOpen(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handleClose = () => {
    localStorage.setItem('hasSeenWelcomeTour_v1', 'true');
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <Card className="w-full max-w-md p-0 overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 relative">
        <button 
          onClick={handleClose}
          className="absolute right-4 top-4 p-2 bg-black/10 hover:bg-black/20 rounded-full text-text-primary dark:text-dark-text-primary transition-colors z-10"
        >
          <X size={20} />
        </button>

        <div className="bg-gradient-to-br from-primary to-accent p-8 text-center text-white min-h-[160px] flex flex-col items-center justify-center">
          <h2 className="text-2xl font-bold mb-2">{TOUR_STEPS[currentStep].title}</h2>
          <div className="flex gap-2 mt-4">
            {TOUR_STEPS.map((_, idx) => (
              <div 
                key={idx} 
                className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentStep ? 'w-8 bg-white' : 'w-2 bg-white/40'}`}
              />
            ))}
          </div>
        </div>

        <div className="p-8 text-center bg-white dark:bg-dark-surface-secondary">
          <p className="text-text-muted dark:text-dark-text-muted-dark font-medium leading-relaxed mb-8 text-lg">
            {TOUR_STEPS[currentStep].description}
          </p>

          <div className="flex items-center gap-4">
            <button 
              onClick={handleClose}
              className="flex-1 py-3 text-text-muted hover:text-text-primary dark:text-dark-text-muted-dark dark:hover:text-dark-text-primary font-bold transition-colors"
            >
              Skip Tour
            </button>
            <button 
              onClick={handleNext}
              className="flex-1 py-3 bg-primary hover:bg-primary/90 text-white rounded-md font-bold shadow-lg shadow-primary/30 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              {currentStep === TOUR_STEPS.length - 1 ? (
                <>Get Started <Check size={18} /></>
              ) : (
                <>Next Step <ChevronRight size={18} /></>
              )}
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};
