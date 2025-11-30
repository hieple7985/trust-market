import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1890FF 0%, #096DD9 100%)',
          borderRadius: '8px',
        }}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Chart Line */}
          <path
            d="M 4 32 L 12 24 L 20 28 L 28 16 L 36 20"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          {/* Data Points */}
          <circle cx="4" cy="32" r="2.5" fill="#52C41A" />
          <circle cx="12" cy="24" r="2.5" fill="#52C41A" />
          <circle cx="20" cy="28" r="2.5" fill="#FAAD14" />
          <circle cx="28" cy="16" r="2.5" fill="#52C41A" />
          <circle cx="36" cy="20" r="2.5" fill="#52C41A" />
          {/* AI Sparkle */}
          <path
            d="M 32 4 L 33 7 L 36 8 L 33 9 L 32 12 L 31 9 L 28 8 L 31 7 Z"
            fill="#FFD700"
            opacity="0.9"
          />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
