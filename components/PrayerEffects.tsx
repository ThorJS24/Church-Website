'use client';

interface PrayerEffectsProps {
  isActive?: boolean;
  intensity?: 'low' | 'medium' | 'high';
}

export default function PrayerEffects({ isActive = true }: PrayerEffectsProps) {
  if (!isActive) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div className="absolute inset-0 bg-gradient-radial from-yellow-200/5 via-transparent to-transparent" />
    </div>
  );
}