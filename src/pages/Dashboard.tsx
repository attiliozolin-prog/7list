import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Session } from '@supabase/supabase-js';
import { ShelfData, Category, Item, SearchResult, UserProfile } from '../types';
import { ShelfSection } from '../components/ShelfSection';
import { SearchModal } from '../components/SearchModal';
import { AnalysisModal } from '../components/AnalysisModal';
import { ProfileHeader } from '../components/ProfileHeader';
import { generateAffiliateLink, generateCulturalPersona } from '../services/apiService';
import { Edit2, Eye, LogOut, Loader2, Sparkles, Copy, Check } from 'lucide-react';

const INITIAL_SHELF: ShelfData = {
    movies: Array(7).fill(null),
    books: Array(7).fill(null),
    music: Array(7).fill(null),
};

interface DashboardProps {
    session: Session;
    onLogout: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ session, onLogout }) => {
    const [shelf, setShelf] = useState<ShelfData>(INITIAL_SHELF);
    const [profile, setProfile] = useState<UserProfile>({
        name: '', handle: '', bio: '', avatarUrl: '', instagramUrl: '', spotifyUrl: ''
    });
    const [isEditing, setIsEditing] = useState(false);
    const [dataLoading, setDataLoading] = useState(false);
    const [linkCopied, setLinkCopied] = useState(false);

    // Search & Modals
    const [searchState, setSearchState] = useState<{ isOpen: boolean; category: Category; slotIndex: number }>({
        isOpen: false, category: 'movies', slotIndex: -1
    });
    const [analysisState, setAnalysisState] = useState<{ isOpen: boolean; isLoading: boolean; text: string }>({
        isOpen: false, isLoading: false, text: ''
    });

    useEffect(() => {
        if (session) loadUserData(session.user.id);
    }, [session]);

    const loadUserData = async (userId: string) => {
        setDataLoading(true);
        const { data: profileData } = await supabase.from('profiles').select('*').eq('id', userId).single();
        if (profileData) {
            setProfile({
                name: profileData.full_name || '',
                handle: profileData.username || '',
                bio: profileData.bio || '',
                avatarUrl: profileData.avatar_url || '',
                instagramUrl: profileData.instagram_url,
                spotifyUrl: profileData.spotify_url
            });
        }
        const { data: shelfData } = await supabase.from('shelves').select('*').eq('user_id', userId).single();
        if (shelfData) {
            const sanitize = (arr: any[]) => [...(Array.isArray(arr) ? arr : []), ...Array(7).fill(null)].slice(0, 7);
            setShelf({ movies: sanitize(shelfData.movies), books: sanitize(shelfData.books), music: sanitize(shelfData.music) });
        }
        setDataLoading(false);
    };

    const saveShelf = async (newShelf: ShelfData) => {
        setShelf(newShelf);
        await supabase.from('shelves').update({
            movies: newShelf.movies, books: newShelf.books, music: newShelf.music, updated_at: new Date()
        }).eq('user_id', session.user.id);
    };

    const saveProfile = async (updates: Partial<UserProfile>) => {
        setProfile(prev => ({ ...prev, ...updates }));
        const dbUpdates: any = {};
        if (updates.name !== undefined) dbUpdates.full_name = updates.name;
        if (updates.bio !== undefined) dbUpdates.bio = updates.bio;
        if (updates.handle !== undefined) dbUpdates.username = updates.handle.replace('@', ''); // Salva sem @
        if (updates.avatarUrl !== undefined) dbUpdates.avatar_url = updates.avatarUrl;
        if (updates.instagramUrl !== undefined) dbUpdates.instagram_url = updates.instagramUrl;
        if (updates.spotifyUrl !== undefined) dbUpdates.spotify_url = updates.spotifyUrl;

        await supabase.from('profiles').update(dbUpdates).eq('id', session.user.id);
    };

    const handleSelectItem = (result: SearchResult) => {
        const { category, slotIndex } = searchState;
        const newItem: Item = {
            id: Math.random().toString(36).substr(2, 9),
            title: result.title, subtitle: result.subtitle, imageUrl: result.imageUrl,
            category: category, affiliateLink: generateAffiliateLink(result, category),
        };
        const newShelf = { ...shelf };
        newShelf[category][slotIndex] = newItem;
        saveShelf(newShelf);
        setSearchState(prev => ({ ...prev, isOpen: false }));
    };

    const handleCopyLink = () => {
        // Se o usuário não tiver handle, usa o ID ou avisa
        const handle = profile.handle || session.user.id;
        const url = `${window.location.origin}/${handle}`;
        navigator.clipboard.writeText(url);
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000);
    };

    return (
        <div className="min-h-screen flex flex-col font-sans text-gray-900 bg-brand-50/30">
            <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <span className="font-serif font-bold text-3xl text-brand-500 tracking-tight">7list</span>
                    <div className="flex items-center gap-2 md:gap-4">
                        {/* Botão de Copiar Link Público */}
                        <button
                            onClick={handleCopyLink}
                            className="hidden md:flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-600 rounded-full text-sm font-bold hover:bg-gray-200 transition-colors"
                            title="Copiar link do meu perfil"
                        >
                            {linkCopied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                            {linkCopied ? 'Copiado!' : 'Meu Link'}
                        </button>

                        <button
                            onClick={async () => {
                                setAnalysisState({ isOpen: true, isLoading: true, text: '' });
                                const text = await generateCulturalPersona(shelf);
                                setAnalysisState({ isOpen: true, isLoading: false, text });
                            }}
                            className="group flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-brand-600 to-brand-500 text-white rounded-full text-xs md:text-sm font-bold shadow-md hover:shadow-lg transition-all"
                        >
                            <Sparkles className="text-amber-200" size={16} />
                            <span className="hidden sm:inline">Análise IA</span>
                        </button>

                        <button onClick={() => setIsEditing(!isEditing)} className={`p-2 rounded-full transition-all ${isEditing ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-700'}`}>
                            {isEditing ? <Eye size={20} /> : <Edit2 size={20} />}
                        </button>
                        <button onClick={onLogout} className="p-2 rounded-full bg-gray-100 text-gray-600 hover:text-red-500"><LogOut size={20} /></button>
                    </div>
                </div>
            </header>

            <main className="flex-1 pb-20 container mx-auto px-4 max-w-4xl mt-6">
                {dataLoading ? <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-brand-300" /></div> : (
                    <>
                        {/* Aviso se não tiver Username */}
                        {!profile.handle && (
                            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm flex items-center gap-2">
                                ⚠️ <strong>Atenção:</strong> Edite seu perfil e crie um @usuario para ter seu link público!
                            </div>
                        )}

                        <ProfileHeader profile={profile} isEditing={isEditing} onProfileUpdate={saveProfile} />
                        <div className="space-y-4 mt-8">
                            <ShelfSection title="Filmes" category="movies" items={shelf.movies} isEditing={isEditing} onSlotClick={(idx) => setSearchState({ isOpen: true, category: 'movies', slotIndex: idx })} onRemoveItem={(idx) => { const ns = { ...shelf }; ns.movies[idx] = null; saveShelf(ns) }} />
                            <ShelfSection title="Livros" category="books" items={shelf.books} isEditing={isEditing} onSlotClick={(idx) => setSearchState({ isOpen: true, category: 'books', slotIndex: idx })} onRemoveItem={(idx) => { const ns = { ...shelf }; ns.books[idx] = null; saveShelf(ns) }} />
                            <ShelfSection title="Músicas" category="music" items={shelf.music} isEditing={isEditing} onSlotClick={(idx) => setSearchState({ isOpen: true, category: 'music', slotIndex: idx })} onRemoveItem={(idx) => { const ns = { ...shelf }; ns.music[idx] = null; saveShelf(ns) }} />
                        </div>
                    </>
                )}
            </main>

            <SearchModal isOpen={searchState.isOpen} category={searchState.category} onClose={() => setSearchState(prev => ({ ...prev, isOpen: false }))} onSelect={handleSelectItem} />
            <AnalysisModal isOpen={analysisState.isOpen} isLoading={analysisState.isLoading} analysis={analysisState.text} onClose={() => setAnalysisState(prev => ({ ...prev, isOpen: false }))} />
        </div>
    );
};
