'use client';

import { getInitials, getAvatarColor, getStatusColor } from '@/lib/utils';

interface AvatarProps {
  name: string;
  avatar?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showStatus?: boolean;
  status?: string;
}

const sizeMap = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-base',
  xl: 'w-20 h-20 text-xl',
};

const statusSizeMap = {
  sm: 'w-2.5 h-2.5 border-[1.5px]',
  md: 'w-3 h-3 border-2',
  lg: 'w-3.5 h-3.5 border-2',
  xl: 'w-4 h-4 border-[2.5px]',
};

export function Avatar({ name, avatar, size = 'md', showStatus = false, status = 'Available' }: AvatarProps) {
  const initials = getInitials(name);
  const bgColor = getAvatarColor(name);
  const statusColor = getStatusColor(status);

  return (
    <div className="relative inline-flex shrink-0">
      {avatar ? (
        <img src={avatar} alt={name} className={`${sizeMap[size]} rounded-full object-cover`} />
      ) : (
        <div className={`${sizeMap[size]} rounded-full flex items-center justify-center font-bold text-white shadow-sm`}
          style={{ backgroundColor: bgColor }}>
          {initials}
        </div>
      )}
      {showStatus && (
        <span className={`absolute -bottom-0.5 -right-0.5 ${statusSizeMap[size]} rounded-full border-white pulse-dot`}
          style={{ backgroundColor: statusColor }} />
      )}
    </div>
  );
}
