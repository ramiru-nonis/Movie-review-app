'use client';

import { Movie } from '../lib/types';


import { Search, Film, Loader2, SlidersHorizontal, X } from 'lucide-react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import api from '../services/api';
import MovieCard from '../components/MovieCard';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '../lib/utils';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const router = useRouter();

  // Filter states
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedRating, setSelectedRating] = useState('');

  const { data: genresData } = useQuery({
    queryKey: ['genres'],
    queryFn: async () => {
      const res = await api.get('/movies/genres');
      return res.data.genres;
    },
  });

  const isFiltering = !!(selectedGenre || selectedYear || selectedRating);

  const { 
    data, 
    isLoading, 
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteQuery({
    queryKey: ['homeMovies', isFiltering, selectedGenre, selectedYear, selectedRating],
    queryFn: async ({ pageParam = 1 }): Promise<{ results: Movie[], page: number, total_pages: number }> => {
      if (isFiltering) {
        const res = await api.get('/movies/discover', { 
          params: { 
            page: pageParam,
            with_genres: selectedGenre,
            primary_release_year: selectedYear,
            'vote_average.gte': selectedRating,
          } 
        });
        return res.data;
      } else {
        const res = await api.get('/movies/trending', { params: { page: pageParam } });
        return res.data;
      }
    },
    getNextPageParam: (lastPage: { page: number, total_pages: number }) => {
      if (lastPage.page < lastPage.total_pages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });

  const allMovies = data?.pages.flatMap((page: { results: Movie[] }) => page.results) || [];

  const clearFilters = () => {
    setSelectedGenre('');
    setSelectedYear('');
    setSelectedRating('');
    setShowFilters(false);
  };

  return (
    <main className="min-h-screen relative overflow-hidden flex flex-col items-center pt-24 px-4 pb-20">
      {/* Cinematic Background Blur */}
      <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[120%] bg-gradient-radial from-primary/10 via-background to-background rounded-full blur-[100px] -z-10" />

      <div className="max-w-4xl w-full text-center space-y-8 animate-fade-in text-balance">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight">
          Discover the <span className="text-primary italic">Magic</span> of Cinema
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Explore movies, read expert reviews, and curate your ultimate cinematic journey with our premium application.
        </p>

        <form 
          onSubmit={(e) => {
            e.preventDefault();
            if (searchQuery.trim()) {
              router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
            }
          }}
          className="glass p-2 rounded-2xl flex items-center max-w-xl mx-auto mt-12 transition-all duration-300 focus-within:ring-2 ring-primary shadow-2xl"
          role="search"
        >
          <Search className="w-6 h-6 text-muted-foreground ml-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for a movie..."
            className="flex-1 bg-transparent border-none outline-none px-4 py-3 text-lg placeholder:text-muted-foreground"
            aria-label="Search movies"
            suppressHydrationWarning
          />
          <button 
            type="submit" 
            className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold hover:bg-primary/90 transition-all active:scale-95 shadow-lg shadow-primary/20"
            aria-label="Execute search"
          >
            Search
          </button>
        </form>
      </div>

      {/* Discovery Section */}
      <div className="mt-32 w-full max-w-7xl animate-fade-in" style={{ animationDelay: '0.2s' }}>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="flex items-center justify-between flex-1">
            <h2 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
              <Film className="w-8 h-8 text-primary" />
              {isFiltering ? 'Discovery' : 'Trending Now'}
            </h2>
            
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all border",
                showFilters || isFiltering
                  ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
                  : "bg-muted/50 hover:bg-muted border-border"
              )}
            >
              <SlidersHorizontal className="w-5 h-5" />
              Filters {isFiltering && "•"}
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        {showFilters && (
          <div className="glass p-6 rounded-2xl mb-10 flex flex-wrap gap-6 animate-in slide-in-from-top-4 duration-300">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-bold mb-2 opacity-60 uppercase tracking-wider">Genre</label>
              <select 
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="w-full bg-muted/50 border border-border rounded-xl px-4 py-2.5 outline-none focus:border-primary transition-colors cursor-pointer"
              >
                <option value="">All Genres</option>
                {genresData?.map((g: { id: number, name: string }) => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>

            <div className="flex-1 min-w-[150px]">
              <label className="block text-sm font-bold mb-2 opacity-60 uppercase tracking-wider">Year</label>
              <select 
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full bg-muted/50 border border-border rounded-xl px-4 py-2.5 outline-none focus:border-primary transition-colors cursor-pointer"
              >
                <option value="">All Years</option>
                {Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div className="flex-1 min-w-[150px]">
              <label className="block text-sm font-bold mb-2 opacity-60 uppercase tracking-wider">Min Rating</label>
              <select 
                value={selectedRating}
                onChange={(e) => setSelectedRating(e.target.value)}
                className="w-full bg-muted/50 border border-border rounded-xl px-4 py-2.5 outline-none focus:border-primary transition-colors cursor-pointer"
              >
                <option value="">All Ratings</option>
                {[9, 8, 7, 6, 5, 4, 3, 2, 1].map(r => (
                  <option key={r} value={r}>{r}+ Stars</option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button 
                onClick={clearFilters}
                className="flex items-center gap-2 px-6 py-2.5 text-destructive hover:bg-destructive/10 rounded-xl transition-colors font-bold border border-destructive/20"
              >
                <X className="w-5 h-5" /> Clear
              </button>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-8">
          {isLoading && allMovies.length === 0 ? (
            /* Skeleton Loaders */
            [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
              <div key={i} className="glass aspect-[2/3] rounded-2xl animate-pulse bg-white/5 relative overflow-hidden group border border-white/5">
                 <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                    <div className="h-6 w-3/4 bg-white/10 rounded mb-2"></div>
                    <div className="flex gap-2 isolate">
                      <div className="h-4 w-12 bg-primary/20 rounded"></div>
                      <div className="h-4 w-1/4 bg-white/10 rounded"></div>
                    </div>
                 </div>
              </div>
            ))
          ) : error ? (
            <div className="col-span-full py-20 text-center glass rounded-3xl border-destructive/20 text-destructive font-bold">
              Failed to load discovery results.
            </div>
          ) : allMovies.length > 0 ? (
            <>
              {allMovies.map((movie: Movie, idx: number) => (
                <MovieCard key={`${movie.id}-${idx}`} movie={movie} className="animate-in fade-in zoom-in-95 duration-500" />
              ))}
              {hasNextPage && (
                <div className="col-span-full py-16 flex justify-center">
                  <button 
                    onClick={() => fetchNextPage()} 
                    disabled={isFetchingNextPage}
                    className="bg-muted/50 hover:bg-muted border border-border px-10 py-4 rounded-2xl font-bold transition-all flex items-center gap-3 backdrop-blur-md active:scale-95 disabled:opacity-50"
                  >
                    {isFetchingNextPage ? (
                      <><Loader2 className="w-6 h-6 animate-spin text-primary" /> Loading More...</>
                    ) : (
                      'Discover More'
                    )}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="col-span-full py-32 text-center glass rounded-3xl border-white/5 border-dashed border-2">
              <div className="text-6xl mb-6">🔍</div>
              <h3 className="text-2xl font-bold mb-3">No movies found</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                No movies match your current selection. Try broadening your discovery.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
