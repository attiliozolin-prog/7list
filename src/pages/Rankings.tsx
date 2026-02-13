import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Trophy, ArrowLeft, Loader2 } from 'lucide-react';
import { Category } from '../types';
import logo from '../assets/logo.png';

interface RankingItem {
    item_id: string;
    item_title: string;
    item_subtitle: string;
    item_image_url?: string;
    category: Category;
    country: string;
    count: number;
}

export const Rankings: React.FC = () => {
    const [rankings, setRankings] = useState<RankingItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<Category>('movies');
    const [selectedCountry, setSelectedCountry] = useState<string>('BR');
    const [availableCountries, setAvailableCountries] = useState<string[]>([]);

    useEffect(() => {
        loadAvailableCountries();
    }, []);

    useEffect(() => {
        loadRankings();
    }, [selectedCategory, selectedCountry]);

    const loadAvailableCountries = async () => {
        const { data } = await supabase
            .from('profiles')
            .select('country')
            .not('country', 'is', null);

        if (data) {
            const countries = Array.from(new Set(data.map(p => p.country).filter(Boolean)));
            setAvailableCountries(countries as string[]);

            // Se BR não estiver disponível, usa o primeiro país disponível
            if (!countries.includes('BR') && countries.length > 0) {
                setSelectedCountry(countries[0] as string);
            }
        }
    };

    const loadRankings = async () => {
        setLoading(true);

        // Buscar todas as estantes de usuários do país selecionado
        const { data: profiles } = await supabase
            .from('profiles')
            .select('id')
            .eq('country', selectedCountry);

        if (!profiles || profiles.length === 0) {
            setRankings([]);
            setLoading(false);
            return;
        }

        const userIds = profiles.map(p => p.id);

        // Buscar estantes desses usuários
        const { data: shelves } = await supabase
            .from('shelves')
            .select('*')
            .in('user_id', userIds);

        if (!shelves) {
            setRankings([]);
            setLoading(false);
            return;
        }

        // Processar e contar itens
        const itemCounts = new Map<string, { item: any; count: number }>();

        shelves.forEach(shelf => {
            const items = shelf[selectedCategory] || [];
            items.forEach((item: any) => {
                if (item && item.title) {
                    const key = `${item.title}-${item.subtitle}`;
                    if (itemCounts.has(key)) {
                        itemCounts.get(key)!.count++;
                    } else {
                        itemCounts.set(key, { item, count: 1 });
                    }
                }
            });
        });

        // Converter para array e ordenar
        const rankingArray: RankingItem[] = Array.from(itemCounts.values())
            .map(({ item, count }) => ({
                item_id: item.id || '',
                item_title: item.title,
                item_subtitle: item.subtitle,
                item_image_url: item.imageUrl,
                category: selectedCategory,
                country: selectedCountry,
                count
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 20); // Top 20

        setRankings(rankingArray);
        setLoading(false);
    };

    const getCategoryLabel = (category: Category) => {
        const labels = { movies: 'Filmes', books: 'Livros', music: 'Músicas' };
        return labels[category];
    };

    const getCategoryEmoji = (category: Category) => {
        const emojis = { movies: '🎬', books: '📚', music: '🎵' };
        return emojis[category];
    };

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

            <main className="container mx-auto px-4 max-w-4xl mt-8 pb-20">
                {/* Título */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-3 mb-3">
                        <Trophy className="text-amber-500" size={32} />
                        <h1 className="text-3xl md:text-4xl font-serif font-bold text-gray-800">Rankings</h1>
                    </div>
                    <p className="text-gray-500">Os favoritos mais populares por país</p>
                </div>

                {/* Filtros */}
                <div className="mb-8 space-y-4">
                    {/* Seletor de País */}
                    <div className="flex items-center justify-center gap-2 flex-wrap">
                        <span className="text-sm text-gray-600 font-medium">País:</span>
                        {availableCountries.length === 0 ? (
                            <span className="text-sm text-gray-400">Nenhum país disponível</span>
                        ) : (
                            availableCountries.map(country => (
                                <button
                                    key={country}
                                    onClick={() => setSelectedCountry(country)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedCountry === country
                                            ? 'bg-brand-600 text-white shadow-md'
                                            : 'bg-white text-gray-600 border border-gray-200 hover:border-brand-300'
                                        }`}
                                >
                                    {getFlagEmoji(country)} {country}
                                </button>
                            ))
                        )}
                    </div>

                    {/* Seletor de Categoria */}
                    <div className="flex items-center justify-center gap-2 flex-wrap">
                        {(['movies', 'books', 'music'] as Category[]).map(category => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${selectedCategory === category
                                        ? 'bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-lg'
                                        : 'bg-white text-gray-600 border border-gray-200 hover:border-brand-300'
                                    }`}
                            >
                                {getCategoryEmoji(category)} {getCategoryLabel(category)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Lista de Rankings */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="animate-spin text-brand-500" size={40} />
                    </div>
                ) : rankings.length === 0 ? (
                    <div className="text-center py-20">
                        <Trophy className="mx-auto mb-4 text-gray-300" size={64} />
                        <h3 className="text-xl font-bold text-gray-700 mb-2">Ainda não há rankings</h3>
                        <p className="text-gray-500">Seja o primeiro a adicionar {getCategoryLabel(selectedCategory).toLowerCase()} à sua lista!</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                        {rankings.map((item, index) => (
                            <div
                                key={`${item.item_id}-${index}`}
                                className="flex items-center gap-4 p-4 border-b border-gray-100 last:border-b-0 hover:bg-brand-50/30 transition-colors"
                            >
                                {/* Posição */}
                                <div className="flex-shrink-0 w-12 text-center">
                                    {index < 3 ? (
                                        <span className="text-3xl">
                                            {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                                        </span>
                                    ) : (
                                        <span className="text-xl font-bold text-gray-400">#{index + 1}</span>
                                    )}
                                </div>

                                {/* Imagem */}
                                {item.item_image_url && (
                                    <img
                                        src={item.item_image_url}
                                        alt={item.item_title}
                                        className="w-16 h-16 object-cover rounded-lg shadow-sm"
                                    />
                                )}

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-gray-800 truncate">{item.item_title}</h3>
                                    <p className="text-sm text-gray-500 truncate">{item.item_subtitle}</p>
                                </div>

                                {/* Contagem */}
                                <div className="flex-shrink-0 text-right">
                                    <div className="text-2xl font-bold text-brand-600">{item.count}</div>
                                    <div className="text-xs text-gray-500">
                                        {item.count === 1 ? 'lista' : 'listas'}
                                    </div>
                                </div>
                            </div>
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
