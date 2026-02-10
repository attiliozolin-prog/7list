import React, { useState, useEffect } from 'react';
import { Instagram, Music, Camera, Link as LinkIcon, Upload } from 'lucide-react';
import { UserProfile } from '../types';

interface ProfileHeaderProps {
  profile: UserProfile;
  isEditing: boolean;
  onProfileUpdate?: (updates: Partial<UserProfile>) => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ profile, isEditing, onProfileUpdate }) => {
  const [localProfile, setLocalProfile] = useState(profile);

  // Sincroniza o estado local quando o perfil muda no banco
  useEffect(() => {
    setLocalProfile(profile);
  }, [profile]);

  const handleChange = (field: keyof UserProfile, value: string) => {
    setLocalProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleBlur = (field: keyof UserProfile) => {
    if (onProfileUpdate) {
      // Se for o handle, garante que não tenha @ e seja minúsculo
      if (field === 'handle') {
         const cleanHandle = localProfile.handle.replace('@', '').toLowerCase().trim();
         onProfileUpdate({ handle: cleanHandle });
         setLocalProfile(prev => ({ ...prev, handle: cleanHandle }));
      } else {
         onProfileUpdate({ [field]: localProfile[field] });
      }
    }
  };

  return (
    <div className="flex flex-col items-center text-center space-y-6 animate-in fade-in duration-700">
      
      {/* Avatar */}
      <div className="relative group">
        <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-tr from-brand-200 to-rose-200 p-1 shadow-xl shadow-brand-500/20">
          <div className="w-full h-full rounded-full bg-white overflow-hidden relative">
            {localProfile.avatarUrl ? (
              <img src={localProfile.avatarUrl} alt={localProfile.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-300">
                <Camera size={40} />
              </div>
            )}
          </div>
        </div>
        
        {isEditing && (
          <div className="absolute inset-0 flex items-center justify-center">
            <input 
              type="text" 
              placeholder="URL da Foto"
              className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-48 text-xs p-2 border rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
              value={localProfile.avatarUrl}
              onChange={(e) => handleChange('avatarUrl', e.target.value)}
              onBlur={() => handleBlur('avatarUrl')}
            />
            <button className="absolute bottom-0 right-0 p-2 bg-brand-500 text-white rounded-full shadow-lg hover:bg-brand-600 transition-colors">
              <Upload size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Inputs ou Textos */}
      <div className="space-y-3 max-w-lg w-full">
        {isEditing ? (
          <>
            <input
              type="text"
              className="w-full text-center font-serif text-4xl font-bold bg-transparent border-b-2 border-brand-200 focus:border-brand-500 focus:outline-none placeholder-gray-300"
              placeholder="Seu Nome"
              value={localProfile.name}
              onChange={(e) => handleChange('name', e.target.value)}
              onBlur={() => handleBlur('name')}
            />
            <div className="flex items-center justify-center gap-1">
              <span className="text-2xl font-bold text-brand-400">@</span>
              <input
                type="text"
                className="w-1/2 text-left font-sans text-2xl font-bold text-brand-600 bg-transparent border-b border-dashed border-brand-200 focus:border-brand-500 focus:outline-none placeholder-brand-200/50"
                placeholder="usuario"
                value={localProfile.handle.replace('@', '')}
                onChange={(e) => handleChange('handle', e.target.value)}
                onBlur={() => handleBlur('handle')}
              />
            </div>
            <textarea
              className="w-full text-center text-gray-600 bg-transparent border border-transparent hover:border-gray-200 focus:border-brand-200 rounded-lg p-2 focus:outline-none resize-none"
              placeholder="Sua bio curta..."
              rows={2}
              value={localProfile.bio}
              onChange={(e) => handleChange('bio', e.target.value)}
              onBlur={() => handleBlur('bio')}
            />
            
            <div className="flex gap-2 justify-center pt-2">
               <input 
                  className="text-xs border rounded p-1 w-32" 
                  placeholder="Link Instagram"
                  value={localProfile.instagramUrl || ''}
                  onChange={(e) => handleChange('instagramUrl', e.target.value)}
                  onBlur={() => handleBlur('instagramUrl')}
               />
               <input 
                  className="text-xs border rounded p-1 w-32" 
                  placeholder="Link Spotify"
                  value={localProfile.spotifyUrl || ''}
                  onChange={(e) => handleChange('spotifyUrl', e.target.value)}
                  onBlur={() => handleBlur('spotifyUrl')}
               />
            </div>
          </>
        ) : (
          <>
            <h1 className="font-serif text-4xl font-bold text-gray-900 tracking-tight">
              {localProfile.name || 'Seu Nome'}
            </h1>
            {localProfile.handle && (
              <p className="text-xl font-bold text-brand-500 opacity-90">@{localProfile.handle}</p>
            )}
            <p className="text-gray-600 text-lg leading-relaxed max-w-md mx-auto">
              {localProfile.bio || 'Adicione uma bio...'}
            </p>
            
            <div className="flex items-center justify-center gap-4 pt-2">
              {localProfile.instagramUrl && (
                <a href={localProfile.instagramUrl} target="_blank" rel="noreferrer" className="p-2 bg-white text-pink-600 rounded-full shadow-sm hover:shadow-md hover:scale-110 transition-all">
                  <Instagram size={20} />
                </a>
              )}
              {localProfile.spotifyUrl && (
                <a href={localProfile.spotifyUrl} target="_blank" rel="noreferrer" className="p-2 bg-white text-green-600 rounded-full shadow-sm hover:shadow-md hover:scale-110 transition-all">
                  <Music size={20} />
                </a>
              )}
            </div>
          </>
        )}
      </div>
      
      {!isEditing && <div className="w-24 h-1 bg-brand-200 rounded-full opacity-50" />}
    </div>
  );
};
