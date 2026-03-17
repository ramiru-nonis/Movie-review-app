'use client';

import { Movie } from '../../lib/types';


import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import MovieCard from '../../components/MovieCard';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2, Trash2, ArrowLeft } from 'lucide-react';

export default function WatchlistPage() {
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [watchlistMovies, setWatchlistMovies] = useState<Movie[]>([]);
  const [isFetchingMovies, setIsFetchingMovies] = useState(false);

  useEffect(() => {
    if (user === null && localStorage.getItem('token') === null) {
      router.push('/login');
    }
  }, [user, router]);

  const { data: watchlistEntries, isLoading: isLoadingWatchlist } = useQuery({
    queryKey: ['watchlist'],
    queryFn: async () => {
      const res = await api.get('/watchlist');
      return res.data;
    },
    enabled: !!user,
  });

  const removeMutation = useMutation({
    mutationFn: async (movieId: number) => {
      return api.delete(`/watchlist/${movieId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
    },
    onError: (error) => {
      let errorMessage = 'Failed to remove from watchlist';
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { error?: string } } };
        errorMessage = axiosError.response?.data?.error || errorMessage;
      }
      alert(errorMessage);
    }
  });

  // Fetch full movie details for each watchlist entry
  useEffect(() => {
    const fetchMovies = async () => {
      if (watchlistEntries?.length > 0) {
        setIsFetchingMovies(true);
        try {
          const promises = watchlistEntries.map((entry: { movieId: number }) => 
            api.get(`/movies/${entry.movieId}`)
          );
          const results = await Promise.allSettled(promises);
          
          const successfulMovies = results
            .filter((result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled')
            .map((result) => result.value.data)
            .filter(Boolean);
            
          setWatchlistMovies(successfulMovies);
          
          if (successfulMovies.length < watchlistEntries.length) {
            console.warn("Some watchlist movies failed to load");
          }
        } catch (error) {
          console.error("Failed to load watchlist movies", error);
        } finally {
          setIsFetchingMovies(false);
        }
      } else {
        setWatchlistMovies([]);
      }
    };
    
    if (watchlistEntries) {
      fetchMovies();
    }
  }, [watchlistEntries]);

  if (!user) return null;

  const isLoading = isLoadingWatchlist || isFetchingMovies;

  return (
    <main className="min-h-screen pt-24 px-4 max-w-7xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <button 
            onClick={() => router.back()} 
            className="flex items-center gap-2 text-muted-foreground hover:text-white transition-colors mb-4 text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> Go Back
          </button>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            Your <span className="text-primary">Watchlist</span>
          </h1>
          <p className="text-muted-foreground mt-2">
            You have {watchlistMovies.length} movies saved to watch later.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {isLoading && watchlistMovies.length === 0 ? (
          [1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="glass aspect-[2/3] rounded-2xl animate-pulse bg-white/5" />
          ))
        ) : watchlistMovies.length > 0 ? (
          watchlistMovies.map((movie: Movie) => (
            <div key={movie.id} className="relative group animate-in fade-in slide-in-from-bottom-4 duration-500">
               <MovieCard movie={movie} />
               <button 
                disabled={removeMutation.isPending}
                className="absolute top-2 right-2 bg-black/60 hover:bg-destructive/90 text-white p-2.5 rounded-full opacity-0 group-hover:opacity-100 transition-all backdrop-blur-md border border-white/10 shadow-xl z-30 scale-90 group-hover:scale-100"
                onClick={(e) => {
                  e.preventDefault();
                  if (confirm(`Remove "${movie.title}" from watchlist?`)) {
                    removeMutation.mutate(movie.id);
                  }
                }}
                title="Remove from watchlist"
               >
                 {removeMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
               </button>
            </div>
          ))
        ) : !isLoading && (
          <div className="col-span-full py-32 text-center flex flex-col items-center glass rounded-3xl border-dashed border-2 border-white/5">
            <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6 text-5xl">
              🎬
            </div>
            <h3 className="text-2xl font-bold mb-3">Your watchlist is empty</h3>
            <p className="text-muted-foreground max-w-md mb-8 leading-relaxed">
              Explore our collection of cinematic masterpieces and save them here to watch later.
            </p>
            <button 
              onClick={() => router.push('/')} 
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3 rounded-xl transition-all font-bold shadow-lg shadow-primary/20 scale-100 hover:scale-105 active:scale-95"
            >
              Start Exploring
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
