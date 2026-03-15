import { useState, useEffect } from 'react';

export default function SplashScreen({ onDone }) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer1 = setTimeout(() => setFadeOut(true), 2000);
    const timer2 = setTimeout(() => onDone(), 2500);
    return () => { clearTimeout(timer1); clearTimeout(timer2); };
  }, [onDone]);

  return (
    <div className={`splash-screen ${fadeOut ? 'splash-fadeout' : ''}`}>
      <div className="splash-content">
        <div className="splash-photo">
          <img src="/family.jpg" alt="Familia" />
        </div>
        <h1 className="splash-title">FamiliApp</h1>
        <p className="splash-subtitle">Tu familia, organizada</p>
        <div className="splash-loader">
          <div className="splash-loader-bar" />
        </div>
      </div>
    </div>
  );
}
