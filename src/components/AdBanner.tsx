import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

type AdBannerProps = {
  slot?: string;
  format?: 'auto' | 'horizontal' | 'rectangle';
  className?: string;
};

const ADSENSE_CLIENT = process.env.REACT_APP_ADSENSE_CLIENT;

export function AdBanner({ slot, format = 'auto', className = '' }: AdBannerProps) {
  const adRef = useRef<HTMLModElement>(null);
  const hasRequestedRef = useRef(false);

  const currentSlot = slot || process.env.REACT_APP_ADSENSE_DEFAULT_SLOT;

  useEffect(() => {
    if (!ADSENSE_CLIENT || !currentSlot || !adRef.current || hasRequestedRef.current) {
      return;
    }

    try {
      if (!document.querySelector(`script[data-adsense-client="${ADSENSE_CLIENT}"]`)) {
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`;
        script.crossOrigin = 'anonymous';
        script.dataset.adsenseClient = ADSENSE_CLIENT;
        document.head.appendChild(script);
      }

      window.adsbygoogle = window.adsbygoogle || [];
      window.adsbygoogle.push({});
      hasRequestedRef.current = true;
    } catch (error) {
      console.error('Unable to initialize ad banner', error);
    }
  }, [currentSlot]);

  if (!ADSENSE_CLIENT || !currentSlot) {
    return null;
  }

  return (
    <div className={`rounded-2xl border border-white/10 bg-black/25 p-2 ${className}`}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={currentSlot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
