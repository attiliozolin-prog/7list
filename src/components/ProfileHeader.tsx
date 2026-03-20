import React, { useState, useRef } from 'react';
import { Instagram, Camera, Loader2 } from 'lucide-react'; // Adicionei Loader2
import { UserAvatar } from './UserAvatar';
import { UserProfile } from '../types';
import { supabase } from '../lib/supabase'; // Importamos o Supabase para fazer o upload

interface ProfileHeaderProps {
  profile: UserProfile;
  isEditing: boolean;
  onProfileUpdate: (updates: Partial<UserProfile>) => void;
}

// Ícone do Spotify (mantido)
const SpotifyIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M12 0C5.4 0 0 5.4 0 12C0 18.6 5.4 24 12 24C18.6 24 24 18.6 24 12C24 5.4 18.6 0 12 0ZM17.5 17.1C17.2 17.5 16.7 17.6 16.3 17.4C13.5 15.7 10 15.3 5.8 16.2C5.4 16.3 5 16 4.9 15.6C4.8 15.2 5.1 14.8 5.5 14.7C10.1 13.7 14 14.1 17.2 16C17.6 16.3 17.7 16.8 17.5 17.1ZM19 13.9C18.6 14.4 17.9 14.6 17.4 14.2C14.2 12.3 9.4 11.7 5.6 12.9C5.1 13 4.5 12.7 4.3 12.2C4.2 11.7 4.5 11.1 5 11C9.5 9.6 14.8 10.3 18.6 12.6C19 12.9 19.2 13.5 19 13.9ZM19.1 10.5C15.2 8.2 8.9 8 5.2 9.1C4.6 9.3 4 8.9 3.8 8.3C3.6 7.7 4 7.1 4.6 6.9C8.9 5.6 16 5.8 20.5 8.5C21 8.8 21.2 9.4 20.9 10C20.6 10.5 19.9 10.7 19.1 10.5Z" />
  </svg>
);

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profile,
  isEditing,
  onProfileUpdate,
}) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Lógica de Upload de Foto
  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('Você deve selecionar uma imagem para upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      // 1. Upload para o Supabase Storage (Bucket 'avatars')
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // 2. Pegar a URL pública
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);

      // 3. Atualizar o perfil com a nova URL
      onProfileUpdate({ avatarUrl: data.publicUrl });

    } catch (error) {
      alert('Erro ao fazer upload da imagem. Verifique se criou o bucket "avatars" no Supabase.');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handleSocialClick = (platform: 'instagram' | 'spotify') => {
    if (isEditing) {
      const currentUrl = platform === 'instagram' ? profile.instagramUrl : profile.spotifyUrl;
      const promptText = platform === 'instagram'
        ? "Cole a URL do seu perfil no Instagram:"
        : "Cole a URL do seu perfil no Spotify:";

      const newUrl = prompt(promptText, currentUrl || "");
      if (newUrl !== null) {
        onProfileUpdate({
          [platform === 'instagram' ? 'instagramUrl' : 'spotifyUrl']: newUrl
        });
      }
    } else {
      const url = platform === 'instagram' ? profile.instagramUrl : profile.spotifyUrl;
      if (url) window.open(url, '_blank');
    }
  };

  const handleHandleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace('@', '').trim();
    onProfileUpdate({ handle: value });
  };

  return (
    <div className="flex flex-col items-center text-center pt-8 pb-2 md:pt-12 md:pb-4 space-y-6">

      {/* Avatar */}
      <UserAvatar
        src={profile.avatarUrl}
        name={profile.name}
        size="xl"
        isEditing={isEditing}
        uploading={uploading}
        onUploadClick={() => fileInputRef.current?.click()}
        countryCode={profile.country}
      />

      {/* Input de arquivo invisível */}
      {isEditing && (
        <input
          type="file"
          ref={fileInputRef}
          onChange={handlePhotoUpload}
          accept="image/*"
          className="hidden"
        />
      )}

      {/* Inputs de Texto */}
      <div className="w-full max-w-lg space-y-2">
        {/* Nome */}
        {isEditing ? (
          <input
            type="text"
            value={profile.name}
            onChange={(e) => onProfileUpdate({ name: e.target.value })}
            className="font-serif text-4xl md:text-5xl font-bold text-gray-900 tracking-tight text-center bg-transparent border-b-2 border-brand-200 focus:border-brand-500 outline-none w-full placeholder-gray-300 pb-1"
            placeholder="Seu Nome"
          />
        ) : (
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">
            {profile.name || 'Seu Nome'}
          </h1>
        )}

        {/* Handle (@usuario) */}
        <div className="flex items-center justify-center gap-0.5">
          <span className="text-xl md:text-2xl font-bold text-brand-500">@</span>
          {isEditing ? (
            <input
              type="text"
              value={profile.handle ? profile.handle.replace('@', '') : ''}
              onChange={handleHandleChange}
              className="font-sans text-xl md:text-2xl font-bold text-brand-600 bg-transparent border-b border-dashed border-brand-300 focus:border-brand-500 outline-none w-auto min-w-[100px] text-left placeholder-brand-200"
              placeholder="usuario"
            />
          ) : (
            <span className="font-sans text-xl md:text-2xl font-bold text-brand-500">
              {profile.handle ? profile.handle.replace('@', '') : 'usuario'}
            </span>
          )}
        </div>

        {/* Bio */}
        {isEditing ? (
          <textarea
            value={profile.bio}
            onChange={(e) => onProfileUpdate({ bio: e.target.value })}
            className="text-lg text-gray-600 w-full mt-4 leading-relaxed text-center bg-brand-50/50 border border-brand-200 rounded-lg p-3 focus:border-brand-500 outline-none resize-none min-h-[80px]"
            placeholder="Escreva uma breve bio sobre você..."
          />
        ) : (
          <p className="text-lg text-gray-600 mt-4 leading-relaxed px-4">
            {profile.bio || 'Adicione uma bio para seu perfil ficar completo.'}
          </p>
        )}

        {/* País (apenas em modo de edição) */}
        {isEditing && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
              🌍 Seu País
            </label>
            <select
              value={profile.country || ''}
              onChange={(e) => onProfileUpdate({ country: e.target.value })}
              className="w-full px-4 py-2 bg-white border border-brand-200 rounded-lg focus:border-brand-500 outline-none text-center text-gray-700 font-medium"
            >
              <option value="">Selecione seu país</option>
              <option value="BR">🇧🇷 Brasil</option>
              <option value="US">🇺🇸 Estados Unidos</option>
              <option value="PT">🇵🇹 Portugal</option>
              <option value="ES">🇪🇸 Espanha</option>
              <option value="FR">🇫🇷 França</option>
              <option value="IT">🇮🇹 Itália</option>
              <option value="DE">🇩🇪 Alemanha</option>
              <option value="GB">🇬🇧 Reino Unido</option>
              <option value="CA">🇨🇦 Canadá</option>
              <option value="MX">🇲🇽 México</option>
              <option value="AR">🇦🇷 Argentina</option>
              <option value="CL">🇨🇱 Chile</option>
              <option value="CO">🇨🇴 Colômbia</option>
              <option value="PE">🇵🇪 Peru</option>
              <option value="UY">🇺🇾 Uruguai</option>
              <option value="OTHER">🌎 Outro</option>
            </select>
          </div>
        )}
      </div>

      {/* Botões Sociais */}
      <div className="flex items-center justify-center gap-4 pt-2">
        {/* Instagram */}
        {(isEditing || profile.instagramUrl) && (
          <button
            onClick={() => handleSocialClick('instagram')}
            className={`
              p-3 rounded-full transition-all shadow-sm hover:scale-105 flex items-center justify-center
              ${isEditing
                ? 'border-2 border-dashed border-brand-300 bg-brand-50 text-brand-500 hover:bg-brand-100'
                : 'bg-white border border-gray-200 text-gray-600 hover:text-[#E1306C] hover:border-[#E1306C] hover:bg-pink-50'}
              ${!profile.instagramUrl && isEditing ? 'opacity-70' : ''}
            `}
            title={isEditing ? "Adicionar link do Instagram" : "Instagram"}
          >
            <Instagram size={24} />
          </button>
        )}

        {/* Spotify */}
        {(isEditing || profile.spotifyUrl) && (
          <button
            onClick={() => handleSocialClick('spotify')}
            className={`
              p-3 rounded-full transition-all shadow-sm hover:scale-105 flex items-center justify-center
              ${isEditing
                ? 'border-2 border-dashed border-brand-300 bg-brand-50 text-brand-500 hover:bg-brand-100'
                : 'bg-white border border-gray-200 text-gray-600 hover:text-[#1DB954] hover:border-[#1DB954] hover:bg-green-50'}
              ${!profile.spotifyUrl && isEditing ? 'opacity-70' : ''}
            `}
            title={isEditing ? "Adicionar link do Spotify" : "Spotify"}
          >
            <SpotifyIcon className="w-6 h-6" />
          </button>
        )}
      </div>

      {!isEditing && <div className="w-24 h-1 bg-brand-100 rounded-full mt-6 opacity-50" />}
    </div>
  );
};
