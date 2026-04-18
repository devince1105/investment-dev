'use client';

import React, { useState, useEffect } from 'react';

interface DigitalClockProps {
  className?: string;
}

export default function DigitalClock({ className }: DigitalClockProps) {
  const [time, setTime] = useState<string>('');
  const [date, setDate] = useState<string>('');

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('zh-TW', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
      );
      setDate(
        now.toLocaleDateString('zh-TW', {
          month: '2-digit',
          day: '2-digit',
          weekday: 'short',
        })
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className={`flex flex-col items-end ${className ?? ''}`}>
      <div className="text-sm font-black tracking-widest tabular-nums text-slate-300 font-mono">
        {time || '--:--:--'}
      </div>
      <div className="text-xs font-bold tracking-widest uppercase text-slate-600">
        {date || 'TWN / TWSE'}
      </div>
    </div>
  );
}
