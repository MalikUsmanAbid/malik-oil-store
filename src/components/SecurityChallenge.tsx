import React, { useEffect, useRef } from 'react';
export default function SecurityChallenge({ onToken, resetKey = 0 }: { onToken: (token: string) => void; resetKey?: number }) {
  const container = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const sitekey = import.meta.env.VITE_TURNSTILE_SITE_KEY;
    if (!sitekey) return;
    let widget: string | undefined;
    let disposed = false;
    const render = () => {
      const turnstile = (window as any).turnstile;
      if (disposed || !turnstile || !container.current || widget) return;
      widget = turnstile.render(container.current, { sitekey, callback: onToken, 'expired-callback': () => onToken(''), 'error-callback': () => onToken('') });
    };
    let script = document.querySelector<HTMLScriptElement>('script[data-turnstile]');
    if (!script) {
      script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.dataset.turnstile = 'true';
      script.async = true;
      document.head.append(script);
    }
    script.addEventListener('load', render);
    render();
    return () => { disposed = true; script?.removeEventListener('load', render); if (widget) (window as any).turnstile?.remove(widget); };
  }, [onToken, resetKey]);
  return <div ref={container}>{!import.meta.env.VITE_TURNSTILE_SITE_KEY && <p className="text-sm text-amber-800">Secure checkout setup pending. Please contact the shop to order.</p>}</div>;
}
