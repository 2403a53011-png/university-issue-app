import React, { useState } from 'react';
import { Star } from 'lucide-react';

export default function StarRating({ value = 0, onChange, readOnly = false, size = 20 }) {
  const [hoverValue, setHoverValue] = useState(0);

  const displayRating = hoverValue || value;

  const labels = {
    1: 'Poor / Unsatisfied',
    2: 'Fair / Below Expectation',
    3: 'Average / Resolved',
    4: 'Good / Prompt Service',
    5: 'Excellent / Highly Satisfied'
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = star <= displayRating;
          return (
            <button
              key={star}
              type="button"
              disabled={readOnly}
              onClick={() => onChange && onChange(star)}
              onMouseEnter={() => !readOnly && setHoverValue(star)}
              onMouseLeave={() => !readOnly && setHoverValue(0)}
              className={`p-0.5 transition-all duration-150 ${
                readOnly 
                  ? 'cursor-default' 
                  : 'cursor-pointer hover:scale-115 focus:outline-none'
              }`}
            >
              <Star
                size={size}
                className={`${
                  filled 
                    ? 'text-amber-400 fill-amber-400 drop-shadow-sm' 
                    : 'text-slate-300 fill-transparent'
                } transition-colors`}
              />
            </button>
          );
        })}
        {value > 0 && (
          <span className="ml-2 text-xs font-semibold text-slate-700">
            {value} / 5
          </span>
        )}
      </div>
      {!readOnly && displayRating > 0 && (
        <span className="text-xs font-medium text-amber-600 animate-fadeIn">
          {labels[displayRating]}
        </span>
      )}
    </div>
  );
}
