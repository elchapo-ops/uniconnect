import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SplashScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/login');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center">
      <div className="text-center animate-fade-in">
        <div className="relative">
          <h1 className="text-5xl md:text-7xl font-bold text-primary-foreground mb-4 tracking-tight">
            UniConnect
          </h1>
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-primary-foreground/30 rounded-full animate-pulse-slow" />
        </div>
        <p className="text-lg md:text-xl text-primary-foreground/80 mt-6 animate-pulse-slow">
          Smart Job & Internship Placement Portal
        </p>
        <div className="flex justify-center gap-1.5 mt-12">
          <span className="w-2 h-2 bg-primary-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 bg-primary-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 bg-primary-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}
