import { useState, useEffect } from 'react';

const SaleCountdown = ({ endDate }) => {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft());

  function getTimeLeft() {
    const now = new Date().getTime();
    const end = endDate ? new Date(endDate).getTime() : now + 3 * 24 * 60 * 60 * 1000; // default 3 days
    const diff = Math.max(0, end - now);
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((diff % (1000 * 60)) / 1000),
      expired: diff <= 0,
    };
  }

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(getTimeLeft()), 1000);
    return () => clearInterval(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endDate]);

  if (timeLeft.expired) return null;

  return (
    <div className="flex items-center gap-1.5 text-[10px]">
      <span className="text-red-600 font-semibold">Sale ends:</span>
      <div className="flex gap-1">
        {timeLeft.days > 0 && (
          <span className="countdown-digit">{timeLeft.days}d</span>
        )}
        <span className="countdown-digit">{String(timeLeft.hours).padStart(2, '0')}h</span>
        <span className="countdown-digit">{String(timeLeft.minutes).padStart(2, '0')}m</span>
        <span className="countdown-digit">{String(timeLeft.seconds).padStart(2, '0')}s</span>
      </div>
    </div>
  );
};

export default SaleCountdown;
