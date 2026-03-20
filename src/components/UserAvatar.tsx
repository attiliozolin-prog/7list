import React from 'react';
import { Camera, Loader2 } from 'lucide-react';

interface UserAvatarProps {
  src?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isEditing?: boolean;
  uploading?: boolean;
  onUploadClick?: () => void;
  countryCode?: string;
  className?: string;
}

const sizeClasses = {
  sm: 'w-10 h-10 text-sm border-2',
  md: 'w-16 h-16 text-xl border-2',
  lg: 'w-20 h-20 text-2xl border-[3px]',
  xl: 'w-32 h-32 md:w-40 md:h-40 text-4xl md:text-5xl border-4',
};

const getInitials = (name: string) => {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const getColorFromName = (name: string) => {
  const colors = [
    'bg-brand-500', 'bg-amber-500', 'bg-blue-500', 'bg-emerald-500', 
    'bg-rose-500', 'bg-violet-500', 'bg-cyan-500', 'bg-orange-500'
  ];
  if (!name) return colors[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

const getFlagEmoji = (countryCode: string): string => {
    if (!countryCode || countryCode === 'OTHER') return '';
    const codePoints = countryCode
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
};

export const UserAvatar: React.FC<UserAvatarProps> = ({
  src,
  name = '',
  size = 'md',
  isEditing = false,
  uploading = false,
  onUploadClick,
  countryCode,
  className = '',
}) => {
  const initials = getInitials(name);
  const bgColor = getColorFromName(name);
  const isPlaceholder = !src || src.includes('via.placeholder.com') || src === '';

  return (
    <div className={`relative group inline-block ${className}`}>
      {/* Glow effect for XL size (Profile Header) */}
      {size === 'xl' && (
        <div className="absolute -inset-1 bg-gradient-to-tr from-brand-400 to-amber-400 rounded-full opacity-75 blur group-hover:opacity-100 transition duration-200"></div>
      )}
      
      <div className={`
        relative ${sizeClasses[size]} rounded-full border-white shadow-xl overflow-hidden bg-white flex items-center justify-center
      `}>
        {!isPlaceholder ? (
          <img src={src} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className={`w-full h-full flex items-center justify-center ${bgColor} text-white font-serif font-bold`}>
            {initials}
          </div>
        )}

        {isEditing && (
          <div
            onClick={onUploadClick}
            className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 hover:opacity-100 transition-opacity cursor-pointer z-10"
            title="Alterar foto"
          >
            {uploading ? <Loader2 className="animate-spin" size={size === 'xl' ? 32 : 20} /> : <Camera size={size === 'xl' ? 32 : 20} />}
          </div>
        )}
      </div>

      {countryCode && (
        <span className={`
          absolute -bottom-1 -right-1 leading-none
          ${size === 'xl' ? 'text-4xl md:text-5xl' : size === 'lg' ? 'text-2xl' : 'text-xl'}
        `}>
          {getFlagEmoji(countryCode)}
        </span>
      )}
    </div>
  );
};
