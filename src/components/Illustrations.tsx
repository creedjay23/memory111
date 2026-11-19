import React from 'react';

export function SeoulSkylineIllustration({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 430 92"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Distant soft city silhouette */}
      <rect x="26" y="34" width="20" height="44" rx="2" fill="#D7E6DF" />
      <rect x="50" y="24" width="24" height="54" rx="2" fill="#CBE0D5" />
      <rect x="78" y="40" width="18" height="38" rx="2" fill="#D7E6DF" />
      <rect x="104" y="28" width="22" height="50" rx="2" fill="#CBE0D5" />

      {/* Namsan Seoul Tower */}
      <rect x="159" y="6" width="2" height="18" fill="#B6CEC2" />
      <rect x="155" y="22" width="10" height="8" rx="2" fill="#B6CEC2" />
      <rect x="158" y="30" width="4" height="36" fill="#C4D9CE" />
      <ellipse cx="160" cy="64" rx="18" ry="6" fill="#D7E6DF" />

      {/* Right city skyline */}
      <rect x="278" y="30" width="22" height="48" rx="2" fill="#D7E6DF" />
      <rect x="304" y="18" width="26" height="60" rx="2" fill="#CBE0D5" />
      <rect x="334" y="36" width="20" height="42" rx="2" fill="#D7E6DF" />
      <rect x="358" y="26" width="24" height="52" rx="2" fill="#CBE0D5" />
      <rect x="386" y="42" width="18" height="36" rx="2" fill="#D7E6DF" />

      {/* Soft rolling green hills */}
      <path
        d="M0 74C58 58 112 62 172 70C234 78 298 54 366 62C394 65 414 68 430 72V92H0V74Z"
        fill="#DCF5CE"
      />
      <path
        d="M0 80C76 68 148 74 224 80C302 86 368 68 430 76V92H0V80Z"
        fill="#A7DF94"
      />

      {/* Left trees */}
      <rect x="36" y="62" width="4" height="16" rx="1" fill="#6D4C41" />
      <circle cx="38" cy="54" r="11" fill="#46A049" />
      <circle cx="32" cy="58" r="7" fill="#5CB85C" />
      <rect x="64" y="66" width="3" height="12" rx="1" fill="#6D4C41" />
      <circle cx="65.5" cy="59" r="8" fill="#5CB85C" />

      {/* Center-right trees */}
      <rect x="242" y="66" width="3.5" height="13" rx="1" fill="#6D4C41" />
      <circle cx="243.5" cy="59" r="9" fill="#46A049" />
      <rect x="368" y="60" width="4" height="17" rx="1" fill="#6D4C41" />
      <circle cx="370" cy="52" r="11" fill="#46A049" />
      <circle cx="378" cy="57" r="7.5" fill="#5CB85C" />
      <rect x="396" y="66" width="3" height="12" rx="1" fill="#6D4C41" />
      <circle cx="397.5" cy="59" r="8" fill="#5CB85C" />
    </svg>
  );
}

export function ExcavatorIllustration({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 96 76"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Ground mound */}
      <ellipse cx="48" cy="66" rx="38" ry="6" fill="#C6B18F" opacity="0.45" />
      {/* Tracks */}
      <rect x="14" y="52" width="38" height="12" rx="6" fill="#2A342E" />
      <circle cx="22" cy="58" r="3" fill="#6D7A72" />
      <circle cx="33" cy="58" r="3" fill="#6D7A72" />
      <circle cx="44" cy="58" r="3" fill="#6D7A72" />
      {/* Cabin body */}
      <rect x="16" y="42" width="32" height="12" rx="3" fill="#F59E0B" />
      <path d="M22 26C22 24.3431 23.3431 23 25 23H38L44 42H22V26Z" fill="#FBBF24" stroke="#17241C" strokeWidth="2" />
      <path d="M26 27H36L40 39H26V27Z" fill="#BAE6FD" />
      {/* Boom & Arm */}
      <path d="M44 44L59 18L73 34" stroke="#F59E0B" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M44 44L59 18L73 34" stroke="#FBBF24" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="59" cy="18" r="3" fill="#17241C" />
      <circle cx="44" cy="44" r="3" fill="#17241C" />
      {/* Bucket */}
      <path d="M70 32L82 36L78 48C72 49 67 45 67 39L70 32Z" fill="#374151" />
    </svg>
  );
}

export function ParkTreesIllustration({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 96 76"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Meadow */}
      <ellipse cx="48" cy="65" rx="36" ry="7" fill="#A7DF94" />
      {/* Back tree */}
      <rect x="58" y="42" width="5" height="22" rx="2" fill="#78553A" />
      <circle cx="60.5" cy="34" r="14" fill="#65B741" />
      <circle cx="68" cy="39" r="9" fill="#74C652" />
      {/* Front main tree */}
      <rect x="33" y="38" width="6" height="26" rx="2" fill="#6D4C41" />
      <circle cx="36" cy="24" r="13" fill="#16783A" />
      <circle cx="27" cy="34" r="11" fill="#2E944B" />
      <circle cx="45" cy="34" r="11" fill="#2E944B" />
      {/* Small sprout */}
      <path d="M74 62V54" stroke="#16783A" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M74 56C74 52 79 51 81 53C79 56 76 57 74 56Z" fill="#2E944B" />
      <path d="M74 56C74 52 69 51 67 53C69 56 72 57 74 56Z" fill="#46A049" />
    </svg>
  );
}

export function IdeaMeadowIllustration({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 280 90"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Soft clouds */}
      <ellipse cx="44" cy="24" rx="16" ry="7" fill="#E6F6FC" />
      <ellipse cx="236" cy="22" rx="18" ry="8" fill="#E6F6FC" />
      {/* Light rays */}
      <line x1="140" y1="6" x2="140" y2="14" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" />
      <line x1="112" y1="14" x2="118" y2="20" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" />
      <line x1="168" y1="14" x2="162" y2="20" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" />
      <line x1="102" y1="34" x2="110" y2="34" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" />
      <line x1="178" y1="34" x2="170" y2="34" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" />
      {/* Lightbulb */}
      <path
        d="M140 18C129.507 18 121 26.5066 121 37C121 43.8281 124.602 49.8147 130.008 53.1645C131.651 54.1828 132.75 55.9083 133.108 57.8102L133.5 59.8889H146.5L146.892 57.8102C147.25 55.9083 148.349 54.1828 149.992 53.1645C155.398 49.8147 159 43.8281 159 37C159 26.5066 150.493 18 140 18Z"
        fill="#FDE047"
        stroke="#D97706"
        strokeWidth="2.5"
      />
      <rect x="134" y="60" width="12" height="5" rx="2" fill="#9CA3AF" />
      <rect x="136" y="66" width="8" height="3.5" rx="1.5" fill="#6B7280" />
      {/* Rolling meadow */}
      <path d="M12 84C54 66 108 72 140 74C178 76 226 64 268 84H12Z" fill="#DCF5CE" />
      <rect x="46" y="64" width="3.5" height="14" rx="1" fill="#6D4C41" />
      <circle cx="47.5" cy="57" r="9" fill="#46A049" />
      <rect x="228" y="62" width="3.5" height="16" rx="1" fill="#6D4C41" />
      <circle cx="229.5" cy="54" r="10" fill="#16783A" />
    </svg>
  );
}

export function ExcavatorBadgeIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <rect x="3" y="16.5" width="11.5" height="4" rx="2" fill="#1E293B" />
      <rect x="4" y="12.5" width="9.5" height="4" rx="1.5" fill="#F59E0B" />
      <path d="M5.5 7.5C5.5 6.95 5.95 6.5 6.5 6.5H10L11.8 12.5H5.5V7.5Z" fill="#FBBF24" stroke="#17241C" strokeWidth="1.2" />
      <path d="M12.5 13L16.5 5.5L20 10.5" stroke="#D97706" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18.8 10L22 11.4L20.5 14.8C19 15 17.8 13.8 18.2 12L18.8 10Z" fill="#374151" />
    </svg>
  );
}

