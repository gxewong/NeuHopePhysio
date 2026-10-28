import { useState, type ImgHTMLAttributes } from 'react';
import { LogoMark } from './Logo';

/**
 * Image with an intentional, on-brand fallback if the file fails to load,
 * so visitors never see a broken-image icon.
 */
export default function SmartImage({ className = '', alt, ...props }: ImgHTMLAttributes<HTMLImageElement>) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`${className} relative grid place-items-center overflow-hidden bg-gradient-to-br from-brand-sage to-white`}
      >
        <svg aria-hidden="true" viewBox="0 0 400 400" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice">
          <path d="M-20 300C80 280 160 210 200 140S300 40 420 30" fill="none" stroke="#255957" strokeOpacity=".12" strokeWidth="26" strokeLinecap="round" />
          <path d="M-20 360C90 340 190 280 240 200S330 100 420 96" fill="none" stroke="#F4C542" strokeOpacity=".55" strokeWidth="10" strokeLinecap="round" />
        </svg>
        <LogoMark className="relative h-16 w-16 opacity-90" />
      </div>
    );
  }

  return <img {...props} alt={alt} decoding="async" className={className} onError={() => setFailed(true)} />;
}
