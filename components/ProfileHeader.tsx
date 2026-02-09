import React from 'react';
import { Instagram, Camera } from 'lucide-react';
import { UserProfile } from '../types';

interface ProfileHeaderProps {
  profile: UserProfile;
  isEditing: boolean;
  onProfileUpdate: (updates: Partial<UserProfile>) => void;
}

// Custom Spotify Icon component for better brand recognition
const SpotifyIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className} 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 0C5.4 0 0 5.4 0 12C0 18.6 5.4 24 12 24C18.6 24 24 18.6 24 12C24 5.4 18.6 0 12 0ZM17.5 17.1C17.2 17.5 16.7 17.6 16.3 17.4C13.5 15.7 10 15.3 5.8 16.2C5.4 16.3 5 16 4.9 15.6C4.8 15.2 5.1 14.8 5.5 14.7C10.1 13.7 14 14.1 17.2 16C17.6 16.3 17.7 16.8 17.5 17.1ZM19 13.9C18.6 14.4 17.9 14.6 17.4 14.2C14.2 12.3 9.4 11.7 5.6 12.9C5.1 13 4.5 12.7 4.3 12.2C4.2 11.7 4.5 11.1 5 11C9.5 9.6 14.8 10.3 18.6 12.6C19 12.9 19.2 13.5 19 13.9ZM19.1 10.5C15.2 8.2 8.9 8 5.2 9.1C4.6 9.3 4 8.9 3.8 8.3C3.6 7.7 4 7.1 4.6 6.9C8.9 5.6 16 5.8 20.5 8.5C21 8.8 21.2 9.4 20.9 10C20.6 10.5 19.9 10.7 19.1 10.5Z"/>
  </svg>
);

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ 
  profile, 
  isEditing,
  onProfileUpdate,
}) => {
  
  const handleSocialClick = (platform: 'instagram' | 'spotify', currentUrl?: string) => {
    if (isEditing) {
      const promptText = platform === 'instagram' 
        ? "Cole a URL do seu perfil no Instagram:" 
        : "Cole a URL do seu perfil no Spotify:";
      
      const newUrl = prompt(promptText, currentUrl || "");
      if (newUrl !== null) {
        onProfileUpdate({ 
          [platform === 'instagram' ? 'instagramUrl' : 'spotifyUrl']: newUrl 
        });
      }
    } else if (currentUrl) {
      window.open(currentUrl, '_blank');
    }
  };

  return (
    <div className="flex flex-col items-center text-center pt-8 pb-2 md:pt-12 md:pb-4">
      
      {/* Avatar Ring with gradient */}
      <div className="relative mb-6 group">
        <div className="absolute -inset-1 bg-gradient-to-tr from-brand-400 to-amber-400 rounded-full opacity-75 blur group-hover:opacity-100 transition duration-200"></div>
        <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-xl overflow-hidden bg-white group">
          <img 
            src={profile.avatarUrl} 
            alt={profile.name} 
            className="w-full h-full object-cover"
          />
          {isEditing && (
            <button
                onClick={() => {
                    const url = prompt("Cole a URL da sua nova foto de perfil:", profile.avatarUrl);
                    if (url) onProfileUpdate({ avatarUrl: url });
                }}
                className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 hover:opacity-100 transition-opacity cursor-pointer group-hover:opacity-100"
                title="Alterar foto de perfil"
            >
                <Camera size={32} />
            </button>
          )}
        </div>
        {!isEditing && (
            <div className="absolute bottom-2 right-2 bg-green-500 border-2 border-white w-6 h-6 rounded-full shadow-sm" title="Perfil Verificado"></div>
        )}
      </div>

      {/* Name & Handle */}
      {isEditing ? (
        <input
            type="text"
            value={profile.name}
            onChange={(e) => onProfileUpdate({ name: e.target.value })}
            className="font-serif text-4xl md:text-5xl font-bold text-gray-900 mb-2 tracking-tight text-center bg-transparent border-b-2 border-brand-200 focus:border-brand-500 outline-none w-full max-w-md placeholder-gray-300"
            placeholder="Seu Nome"
        />
      ) : (
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-gray-900 mb-2 tracking-tight">
            {profile.name}
        </h1>
      )}

      <p className="text-brand-500 font-medium text-sm md:text-base tracking-wide uppercase mb-4">
        {profile.handle}
      </p>

      {/* Bio */}
      {isEditing ? (
        <textarea
            value={profile.bio}
            onChange={(e) => onProfileUpdate({ bio: e.target.value })}
            className="text-lg text-gray-600 w-full max-w-lg mx-auto mb-6 leading-relaxed px-4 text-center bg-brand-50/50 border border-brand-200 rounded-lg p-3 focus:border-brand-500 outline-none resize-none min-h-[100px]"
            placeholder="Escreva uma breve bio sobre você..."
        />
      ) : (
        <p className="text-lg text-gray-600 max-w-lg mx-auto mb-6 leading-relaxed px-4">
            {profile.bio}
        </p>
      )}

      {/* Social Actions Row */}
      <div className="flex items-center justify-center gap-4 mb-2">
        {/* Instagram */}
        {(isEditing || profile.instagramUrl) && (
          <button 
            onClick={() => handleSocialClick('instagram', profile.instagramUrl)}
            className={`
              p-3 rounded-full transition-all shadow-sm hover:scale-105 flex items-center justify-center
              ${isEditing 
                ? 'border-2 border-dashed border-brand-300 bg-brand-50 text-brand-500 hover:bg-brand-100' 
                : 'bg-white border border-gray-200 text-gray-600 hover:text-[#E1306C] hover:border-[#E1306C] hover:bg-pink-50'}
              ${!profile.instagramUrl && isEditing ? 'opacity-70' : ''}
            `}
            title={isEditing ? "Editar link do Instagram" : "Instagram"}
          >
            <Instagram size={24} />
          </button>
        )}
        
        {/* Spotify */}
        {(isEditing || profile.spotifyUrl) && (
          <button 
            onClick={() => handleSocialClick('spotify', profile.spotifyUrl)}
            className={`
              p-3 rounded-full transition-all shadow-sm hover:scale-105 flex items-center justify-center
              ${isEditing 
                ? 'border-2 border-dashed border-brand-300 bg-brand-50 text-brand-500 hover:bg-brand-100' 
                : 'bg-white border border-gray-200 text-gray-600 hover:text-[#1DB954] hover:border-[#1DB954] hover:bg-green-50'}
              ${!profile.spotifyUrl && isEditing ? 'opacity-70' : ''}
            `}
            title={isEditing ? "Editar link do Spotify" : "Spotify"}
          >
            <SpotifyIcon className="w-6 h-6" />
          </button>
        )}
      </div>
    </div>
  );
};
