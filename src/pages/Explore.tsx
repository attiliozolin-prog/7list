import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Search, Users, ArrowLeft, Loader2 } from 'lucide-react';
import logo from '../assets/logo.png';

interface UserCard {
    id: string;
    username: string;
    full_name: string;
    bio: string;
    avatar_url: string;
    country?: string;
}

export const Explore: React.FC = () => {
    const [users, setUsers] = useState<UserCard[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<UserCard[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedCountry, setSelectedCountry] = useState<string>('all');

    useEffect(() => {
        loadUsers();
    }, []);

    useEffect(() => {
        filterUsers();
    }, [searchQuery, selectedCountry, users]);

    const loadUsers = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('profiles')
            .select('id, username, full_name, bio, avatar_url, country')
            .not('username', 'is', null)
            .order('created_at', { ascending: false });

        if (data && !error) {
            setUsers(data);
            setFilteredUsers(data);
        }
        setLoading(false);
    };

    const filterUsers = () => {
        let filtered = users;

        // Filtro por país
        if (selectedCountry !== 'all') {
            filtered = filtered.filter(user => user.country === selectedCountry);
        }

        // Filtro por busca
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(user =>
                user.username?.toLowerCase().includes(query) ||
                user.full_name?.toLowerCase().includes(query) ||
                user.bio?.toLowerCase().includes(query)
            );
        }

        setFilteredUsers(filtered);
    };

    const countries = Array.from(new Set(users.map(u => u.country).filter(Boolean)));

    return (
        <div className="min-h-screen flex flex-col font-sans text-gray-900 bg-brand-50/30">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 text-gray-500 hover:text-brand-600 transition-colors">
                        <ArrowLeft size={20} />
                        <span className="text-sm font-bold">Voltar</span>
                    </Link>
                    <img src={logo} alt="7list" className="h-8 w-auto" />
                    <div className="w-20"></div>
                </div>
            </header>

            <main className="container mx-auto px-4 max-w-5xl mt-8 pb-20">
                {/* Título */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-3 mb-3">
                        <Users className="text-brand-600" size={32} />
                        <h1 className="text-3xl md:text-4xl font-serif font-bold text-gray-800">Explorar</h1>
                    </div>
                    <p className="text-gray-500">Descubra outros curadores e suas listas incríveis</p>
                </div>

                {/* Barra de Busca */}
                <div className="mb-6 space-y-4">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar por nome, @usuario ou bio..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                        />
                    </div>

                    {/* Filtro de País */}
                    {countries.length > 0 && (
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm text-gray-600 font-medium">País:</span>
                            <button
                                onClick={() => setSelectedCountry('all')}
                                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${selectedCountry === 'all'
                                        ? 'bg-brand-600 text-white'
                                        : 'bg-white text-gray-600 border border-gray-200 hover:border-brand-300'
                                    }`}
                            >
                                Todos
                            </button>
                            {countries.map(country => (
                                <button
                                    key={country}
                                    onClick={() => setSelectedCountry(country!)}
                                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${selectedCountry === country
                                            ? 'bg-brand-600 text-white'
                                            : 'bg-white text-gray-600 border border-gray-200 hover:border-brand-300'
                                        }`}
                                >
                                    {country}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Contador de Resultados */}
                <div className="mb-4 text-sm text-gray-500">
                    {loading ? (
                        <span>Carregando...</span>
                    ) : (
                        <span>
                            {filteredUsers.length} {filteredUsers.length === 1 ? 'usuário encontrado' : 'usuários encontrados'}
                        </span>
                    )}
                </div>

                {/* Grid de Usuários */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="animate-spin text-brand-500" size={40} />
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="text-center py-20">
                        <Users className="mx-auto mb-4 text-gray-300" size={64} />
                        <h3 className="text-xl font-bold text-gray-700 mb-2">Nenhum usuário encontrado</h3>
                        <p className="text-gray-500">Tente ajustar sua busca ou filtros</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredUsers.map(user => (
                            <Link
                                key={user.id}
                                to={`/${user.username}`}
                                className="group bg-white rounded-2xl p-6 border border-gray-200 hover:border-brand-300 hover:shadow-lg transition-all duration-300"
                            >
                                {/* Avatar */}
                                <div className="flex flex-col items-center text-center">
                                    <div className="relative mb-4">
                                        <img
                                            src={user.avatar_url || 'https://via.placeholder.com/150'}
                                            alt={user.full_name}
                                            className="w-20 h-20 rounded-full object-cover border-4 border-gray-100 group-hover:border-brand-100 transition-all"
                                        />
                                        {user.country && (
                                            <span className="absolute -bottom-1 -right-1 text-2xl">{getFlagEmoji(user.country)}</span>
                                        )}
                                    </div>

                                    {/* Nome e Username */}
                                    <h3 className="font-bold text-gray-800 text-lg mb-1 group-hover:text-brand-600 transition-colors">
                                        {user.full_name || 'Sem nome'}
                                    </h3>
                                    <p className="text-sm text-brand-600 font-medium mb-3">@{user.username}</p>

                                    {/* Bio */}
                                    {user.bio && (
                                        <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
                                            {user.bio}
                                        </p>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

// Helper para converter código de país em emoji de bandeira
function getFlagEmoji(countryCode: string): string {
    const codePoints = countryCode
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
}
