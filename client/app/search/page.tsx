'use client';

import { Movie } from '../../lib/types';


import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Loader2, SlidersHorizontal, X } from 'lucide-react';
import api from '../../services/api';
import MovieCard from '../../components/MovieCard';
import { Suspense, useState } from 'react';
import { cn } from '../../lib/utils';

function SearchResults() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const query = searchParams.get('q');
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const selectedGenre = searchParams.get('genre') || '';
  const selectedYear = searchParams.get('year') || '';
  const selectedRating = searchParams.get('rating') || '';

  const { data: genresData } = useQuery({
    queryKey: ['genres'],
    queryFn: async () => {
      const res = await api.get('/movies/genres');
      return res.data.genres;
    },
  });

  const isDiscoverMode = !query && (selectedGenre || selectedYear || selectedRating);

  const { 
    data, 
    isLoading, 
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteQuery({
    queryKey: ['movies', query, selectedGenre, selectedYear, selectedRating],
    queryFn: async ({ pageParam = 1 }): Promise<{ results: Movie[], page: number, total_pages: number }> => {
      if (query) {
        const res = await api.get('/movies/search', { params: { query, page: pageParam } });
        return res.data;
      } else {
        const res = await api.get('/movies/discover', { 
          params: { 
            page: pageParam,
            with_genres: selectedGenre,
            primary_release_year: selectedYear,
            'vote_average.gte': selectedRating,
          } 
        });
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
    enabled: Boolean(!!query || isDiscoverMode || true), 
  });

  const allMovies = data?.pages.flatMap((page: { results: Movie[] }) => page.results) || [];

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push(pathname);
    setShowFilters(false);
  };

  return (
    <main className="min-h-screen pt-24 px-4 max-w-7xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
            {query ? (
              <>Search Results for <span className="text-primary">&quot;{query}&quot;</span></>
            ) : (
              <>Explore <span className="text-primary">Movies</span></>
            )}
          </h1>
          <p className="text-muted-foreground mt-2">
            Discover cinematic wonders across genres and eras.
          </p>
        </div>
        
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            "flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all border",
            showFilters || selectedGenre || selectedYear || selectedRating
              ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
              : "bg-muted/50 hover:bg-muted border-border"
          )}
        >
          <SlidersHorizontal className="w-5 h-5" />
          Filters {(selectedGenre || selectedYear || selectedRating) && "•"}
        </button>
      </div>

      {/* Filter Bar */}
      {showFilters && (
        <div className="glass p-6 rounded-2xl mb-10 flex flex-wrap gap-6 animate-in slide-in-from-top-4 duration-300">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-bold mb-2 opacity-60 uppercase tracking-wider">Genre</label>
            <select 
              value={selectedGenre}
              onChange={(e) => updateFilters('genre', e.target.value)}
              className="w-full bg-muted/50 border border-border rounded-xl px-4 py-2.5 outline-none focus:border-primary transition-colors cursor-pointer"
            >
              <option value="">All Genres</option>
              {genresData?.map((g: { id: number, name: string }) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>

          <div className="flex-1 min-w-[150px]">
            <label className="block text-sm font-bold mb-2 opacity-60 uppercase tracking-wider">Release Year</label>
            <select 
              value={selectedYear}
              onChange={(e) => updateFilters('year', e.target.value)}
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
              onChange={(e) => updateFilters('rating', e.target.value)}
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

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
        {isLoading && allMovies.length === 0 ? (
          [1, 2, 3, 4, 10].map((i) => (
            <div key={i} className="glass aspect-[2/3] rounded-2xl animate-pulse bg-white/5" />
          ))
        ) : error ? (
          <div className="col-span-full py-20 text-center glass rounded-3xl border-destructive/20 text-destructive font-bold">
            Failed to fetch movies. Please try again.
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
                  className="bg-white/5 hover:bg-white/10 border border-white/10 px-10 py-4 rounded-2xl font-bold transition-all flex items-center gap-3 backdrop-blur-md active:scale-95 disabled:opacity-50"
                >
                  {isFetchingNextPage ? (
                    <><Loader2 className="w-6 h-6 animate-spin text-primary" /> Loading More...</>
                  ) : (
                    'Show More Results'
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
              We couldn&apos;t find any results matching your criteria. Try adjusting your search or filters.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-24 text-center">Loading Search...</div>}>
      <SearchResults />
    </Suspense>
  );
}
