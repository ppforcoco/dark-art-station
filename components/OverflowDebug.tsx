'use client';
import { useEffect, useState } from 'react';

export default function OverflowDebug() {
  const [offenders, setOffenders] = useState<string[]>([]);

  useEffect(() => {
    const check = () => {
      const results: string[] = [];
      document.querySelectorAll('*').forEach(e => {
        const el = e as HTMLElement;
        if (el.offsetWidth > document.documentElement.offsetWidth) {
          results.push(
            `${el.tagName} | ${el.className.toString().slice(0, 80)} | ${el.offsetWidth}px`
          );
        }
      });
      setOffenders(results);
    };

    // Check immediately, then again after everything loads
    check();
    setTimeout(check, 500);
    setTimeout(check, 1500);
    setTimeout(check, 3000);

    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 99999,
      background: offenders.length > 0 ? 'red' : 'green', color: 'white',
      fontSize: '11px', padding: '8px', maxHeight: '200px', overflowY: 'auto'
    }}>
      {offenders.length === 0
        ? 'NO OVERFLOW — page width OK'
        : <><strong>OVERFLOW:</strong>{offenders.map((o, i) => <div key={i}>{o}</div>)}</>
      }
    </div>
  );
}