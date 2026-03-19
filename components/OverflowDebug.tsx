'use client';
import { useEffect, useState } from 'react';

export default function OverflowDebug() {
  const [offenders, setOffenders] = useState<string[]>([]);

  useEffect(() => {
    const results: string[] = [];
    document.querySelectorAll('*').forEach(e => {
      const el = e as HTMLElement;
      if (el.offsetWidth > document.documentElement.offsetWidth) {
        results.push(
          `${el.tagName} | ${el.className.toString().slice(0, 60)} | ${el.offsetWidth}px`
        );
      }
    });
    setOffenders(results);
  }, []);

  if (offenders.length === 0) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 99999,
      background: 'red', color: 'white', fontSize: '11px',
      padding: '8px', maxHeight: '200px', overflowY: 'auto'
    }}>
      <strong>OVERFLOW OFFENDERS:</strong>
      {offenders.map((o, i) => <div key={i}>{o}</div>)}
    </div>
  );
}