'use client';

import { Movie } from '../lib/types';

import Link from 'next/link';
import { Star, Heart, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

import Image from 'next/image';

interface MovieCardProps {
  movie: Movie;
  className?: string;
}

export default function MovieCard({ movie, className }: MovieCardProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const imageUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : `https://via.placeholder.com/500x750?text=No+Poster`;

  // Fetch watchlist to check if this movie is in it
  const { data: watchlist } = useQuery({
    queryKey: ['watchlist'],
    queryFn: async () => {
      const res = await api.get('/watchlist');
      return res.data;
    },
    enabled: !!user,
  });

  const isInWatchlist = watchlist?.some((item: { movieId: number }) => item.movieId === movie.id);

  const mutation = useMutation({
    mutationFn: async () => {
      if (isInWatchlist) {
        return api.delete(`/watchlist/${movie.id}`);
      } else {
        return api.post('/watchlist', { movieId: movie.id });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
    },
    onError: (error) => {
      let errorMessage = 'Failed to update watchlist';
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { error?: string } } };
        errorMessage = axiosError.response?.data?.error || errorMessage;
      }
      alert(errorMessage);
    }
  });

  const handleWatchlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      alert('Please login to manage your watchlist');
      return;
    }
    mutation.mutate();
  };

  return (
    <Link href={`/movie/${movie.id}`} className={cn("block group relative", className)}>
      <div className="glass aspect-[2/3] rounded-2xl relative overflow-hidden border border-border group-hover:border-primary/50 transition-all duration-300">
        <Image
          src={imageUrl}
          alt={movie.title}
          width={500}
          height={750}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Watchlist Toggle */}
        <button
          onClick={handleWatchlistToggle}
          disabled={mutation.isPending}
          className={cn(
            "absolute top-3 right-3 p-2 rounded-full backdrop-blur-md border border-border transition-all z-20 hover:scale-110 active:scale-95",
            isInWatchlist 
              ? "bg-primary text-primary-foreground shadow-[0_0_15px_rgba(var(--primary),0.5)]" 
              : "bg-background/40 text-foreground hover:bg-background/60"
          )}
          aria-label={isInWatchlist ? "Remove from watchlist" : "Add to watchlist"}
        >
          {mutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Heart className={cn("w-4 h-4", isInWatchlist && "fill-current")} />
          )}
        </button>

        <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-background via-background/80 to-transparent translate-y-2 group-hover:translate-y-0 transition-transform">
          <h3 className="text-lg font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
            {movie.title}
          </h3>
          <div className="flex items-center gap-3 mt-1">
            <div className="flex items-center gap-1 text-yellow-500 text-sm font-medium bg-background/50 px-2 py-0.5 rounded-md backdrop-blur-md border border-border">
              <Star className="w-3.5 h-3.5 fill-current" />
              {movie.vote_average ? movie.vote_average.toFixed(1) : 'NR'}
            </div>
            <span className="text-xs text-muted-foreground font-medium">
              {movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
