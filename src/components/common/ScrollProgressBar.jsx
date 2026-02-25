import React, { useState, useEffect, useRef } from 'react';

const ScrollProgressBar = () => {
  const scrollTrackRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (!isDragging) {
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(progress);
        
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isDragging]);

  const handleDrag = (e) => {
    if (scrollTrackRef.current) {
      const track = scrollTrackRef.current.getBoundingClientRect();
      const clickY = e.clientY - track.top;
      let percentage = (clickY / track.height) * 100;
      percentage = Math.max(0, Math.min(100, percentage));
      setScrollProgress(percentage);
      const totalScrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      window.scrollTo(0, (percentage / 100) * totalScrollHeight);
    }
  };

  useEffect(() => {
    const handleMouseMove = (e) => { if (isDragging) handleDrag(e); };
    const handleMouseUp = () => { setIsDragging(false); };
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <>
      {/* INTERACTIVE SLIDE BAR */}
      <div 
        ref={scrollTrackRef} 
        onMouseDown={() => setIsDragging(true)} 
        className="fixed right-2 top-4 bottom-4 w-3 bg-slate-100/50 backdrop-blur-sm rounded-full z-[150] border border-slate-200 shadow-inner cursor-pointer hidden md:block"
      >
        <div 
          className="absolute w-full bg-gradient-to-b from-red-500 via-red-700 to-[#4a0404] rounded-full shadow-lg transition-all duration-100" 
          style={{ height: '40px', top: `calc(${scrollProgress}% - ${scrollProgress * 0.4}px)` }}
        >
          <div className="w-1/2 h-0.5 bg-white/30 mx-auto mt-4 rounded-full"></div>
          <div className="w-1/2 h-0.5 bg-white/30 mx-auto mt-1 rounded-full"></div>
        </div>
      </div>
    </>
  );
};

export default ScrollProgressBar;