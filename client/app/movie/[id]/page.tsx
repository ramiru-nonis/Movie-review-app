'use client';

import { Review } from '../../../lib/types';


import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import api from '../../../services/api';
import { Star, Clock, Calendar, BookmarkPlus, BookmarkX, Loader2 } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useState } from 'react';
import { cn } from '../../../lib/utils';

import Image from 'next/image';

export default function MovieDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Review Form State
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(5);
  
  // Edit State
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);

  const { data: movie, isLoading } = useQuery({
    queryKey: ['movie', id],
    queryFn: async () => {
      const res = await api.get(`/movies/${id}`);
      return res.data;
    },
  });

  const { data: reviews } = useQuery({
    queryKey: ['reviews', id],
    queryFn: async () => {
      const res = await api.get(`/reviews/movie/${id}`);
      return res.data;
    },
  });

  const { data: watchlist } = useQuery({
    queryKey: ['watchlist'],
    queryFn: async () => {
      const res = await api.get('/watchlist');
      return res.data;
    },
    enabled: !!user,
  });

  const isInWatchlist = watchlist?.some((item: { movieId: number }) => item.movieId === Number(id));

  const watchlistMutation = useMutation({
    mutationFn: async () => {
      if (isInWatchlist) {
        return api.delete(`/watchlist/${id}`);
      } else {
        return api.post('/watchlist', { movieId: Number(id) });
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

  // Optimistic Review Mutation
  const reviewMutation = useMutation({
    mutationFn: async (newReview: { rating: number, reviewText: string, id?: string }) => {
      if (editingReviewId) {
        return api.put(`/reviews/${editingReviewId}`, { rating: newReview.rating, reviewText: newReview.reviewText });
      } else {
        return api.post('/reviews', { movieId: Number(id), rating: newReview.rating, reviewText: newReview.reviewText });
      }
    },
    onMutate: async (newReview) => {
      await queryClient.cancelQueries({ queryKey: ['reviews', id] });
      const previousReviews = queryClient.getQueryData(['reviews', id]);
      
      queryClient.setQueryData(['reviews', id], (old: Review[] | undefined) => {
        if (editingReviewId) {
          return old?.map((r) => r.id === editingReviewId ? { ...r, ...newReview } : r);
        }
        // Optimistic add
        const optimisticReview: Review = {
          id: 'temp-id-' + Date.now(),
          userId: user?.id || '',
          movieId: Number(id),
          rating: newReview.rating,
          reviewText: newReview.reviewText,
          createdAt: new Date().toISOString(),
          user: { username: user?.username || 'You' }
        };
        return [optimisticReview, ...(old || [])];
      });

      return { previousReviews };
    },
    onError: (err, newReview, context) => {
      queryClient.setQueryData(['reviews', id], context?.previousReviews);
      alert('Failed to save review');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', id] });
      setReviewText('');
      setRating(5);
      setEditingReviewId(null);
    },
  });

  const deleteReviewMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      return api.delete(`/reviews/${reviewId}`);
    },
    onMutate: async (reviewId) => {
      await queryClient.cancelQueries({ queryKey: ['reviews', id] });
      const previousReviews = queryClient.getQueryData(['reviews', id]);
      
      queryClient.setQueryData(['reviews', id], (old: Review[] | undefined) => 
        old?.filter((r) => r.id !== reviewId)
      );

      return { previousReviews };
    },
    onError: (err, reviewId, context) => {
      queryClient.setQueryData(['reviews', id], context?.previousReviews);
      alert('Failed to delete review');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', id] });
    }
  });

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return alert('Please login to submit a review');
    reviewMutation.mutate({ rating, reviewText });
  };

  const deleteReview = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    deleteReviewMutation.mutate(reviewId);
  };

  const startEditReview = (review: Review) => {
    setEditingReviewId(review.id);
    setRating(review.rating);
    setReviewText(review.reviewText);
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  const handleWatchlistToggle = async () => {
    if (!user) return alert('Please login to manage your watchlist');
    watchlistMutation.mutate();
  };

  if (isLoading) return <div className="min-h-screen pt-24 text-center flex items-center justify-center flex-col gap-4">
    <Loader2 className="w-12 h-12 animate-spin text-primary" />
    <p className="text-muted-foreground font-medium">Summoning your movie...</p>
  </div>;

  if (!movie) return <div className="min-h-screen pt-24 text-center text-destructive">Movie not found</div>;

  const backdropUrl = movie.backdrop_path 
    ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` 
    : '';

  const trailerNode = movie.videos?.results?.find((v: { type: string, site: string, key: string }) => v.type === 'Trailer' && v.site === 'YouTube');
  const userExistingReview = reviews?.find((r: { userId: string }) => r.userId === user?.id);

  return (
    <main className="min-h-screen pb-20">
      {/* Hero Section */}
      <div className="relative h-[70vh] w-full flex items-end">
        <div className="absolute inset-0 z-0">
          {backdropUrl && (
            <Image src={backdropUrl} alt={movie.title} width={1920} height={1080} className="w-full h-full object-cover opacity-40 scale-105 blur-[2px]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-background to-transparent" />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto w-full px-4 mb-10 flex flex-col md:flex-row gap-10 items-end">
          <div className="relative group shrink-0 hidden md:block">
            <Image 
              src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} 
              alt={movie.title}
              width={256}
              height={384}
              className="w-64 rounded-2xl shadow-2xl border border-white/10 transition-transform duration-500 group-hover:scale-[1.02]"
            />
          </div>
          <div className="flex-1 space-y-6">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight drop-shadow-2xl">{movie.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm font-bold">
              <span className="flex items-center gap-1.5 text-yellow-500 bg-muted/50 backdrop-blur-md px-4 py-1.5 rounded-full border border-border">
                <Star className="w-4 h-4 fill-current" />
                {movie.vote_average.toFixed(1)} / 10
              </span>
              <span className="flex items-center gap-1.5 text-foreground/80 bg-muted/50 backdrop-blur-md px-4 py-1.5 rounded-full border border-border">
                <Clock className="w-4 h-4 text-primary" />
                {movie.runtime} min
              </span>
              <span className="flex items-center gap-1.5 text-foreground/80 bg-muted/50 backdrop-blur-md px-4 py-1.5 rounded-full border border-border">
                <Calendar className="w-4 h-4 text-primary" />
                {new Date(movie.release_date).getFullYear()}
              </span>
              <button 
                onClick={handleWatchlistToggle}
                disabled={watchlistMutation.isPending}
                className={cn(
                  "flex items-center gap-2 px-6 py-2 rounded-full transition-all duration-300 font-bold ml-auto active:scale-95",
                  isInWatchlist 
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30" 
                    : "bg-muted/50 hover:bg-muted border border-border"
                )}
              >
                {watchlistMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isInWatchlist ? (
                  <><BookmarkX className="w-4 h-4" /> Remove</>
                ) : (
                  <><BookmarkPlus className="w-4 h-4" /> Watchlist</>
                )}
              </button>
            </div>
            <p className="text-xl text-foreground/80 max-w-4xl leading-relaxed font-medium">
              {movie.overview}
            </p>
            <div className="flex gap-2 pt-2">
              {movie.genres.map((g: { id: number, name: string }) => (
                <span key={g.id} className="px-3 py-1 bg-primary/20 text-primary border border-primary/30 rounded-full text-xs font-semibold">
                  {g.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="max-w-7xl mx-auto px-4 mt-16 grid grid-cols-1 md:grid-cols-3 gap-12">
        <div className="md:col-span-2 space-y-8">
          <h2 className="text-3xl font-bold flex items-center gap-2">
            User Reviews <span className="text-muted-foreground text-xl">({reviews?.length || 0})</span>
          </h2>

          {user && (!userExistingReview || editingReviewId) ? (
            <form onSubmit={submitReview} className="glass p-6 rounded-2xl border border-border space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-lg">{editingReviewId ? 'Edit Review' : 'Write a Review'}</h3>
                {editingReviewId && (
                  <button type="button" onClick={() => setEditingReviewId(null)} className="text-sm text-muted-foreground hover:text-foreground">Cancel</button>
                )}
              </div>
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium">Rating (1-5):</label>
                <input 
                  type="number" min="1" max="5" value={rating} 
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="bg-muted/30 border border-border rounded-lg px-3 py-1 w-20 outline-none focus:border-primary"
                />
              </div>
              <textarea 
                value={reviewText} onChange={(e) => setReviewText(e.target.value)}
                placeholder="Share your thoughts..." required
                className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3 outline-none focus:border-primary min-h-[100px]"
              />
              <button type="submit" className="bg-primary text-primary-foreground px-6 py-2 rounded-xl font-medium hover:bg-primary/90 transition-colors">
                {editingReviewId ? 'Update Review' : 'Submit Review'}
              </button>
            </form>
          ) : user && userExistingReview ? (
            <div className="glass p-6 rounded-2xl border border-primary/20 bg-primary/5 text-center">
              <p className="text-foreground/80 mb-3">You have already reviewed this movie.</p>
              <button onClick={() => startEditReview(userExistingReview)} className="bg-muted/50 hover:bg-muted px-4 py-2 rounded-lg transition-colors text-sm font-medium border border-border mr-3">Edit Review</button>
            </div>
          ) : null}

          <div className="space-y-4">
            {reviews?.map((review: Review) => (
              <div key={review.id} className="p-6 rounded-2xl bg-muted/10 border border-border space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                      {review.user.username[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold">{review.user.username}</div>
                      <div className="text-xs text-muted-foreground">{new Date(review.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded text-sm">
                      <Star className="w-4 h-4 fill-current" /> {review.rating}
                    </div>
                    {user?.id === review.userId && (
                       <div className="flex gap-2">
                         <button onClick={() => startEditReview(review)} className="text-xs text-blue-500 hover:text-blue-400 font-bold">Edit</button>
                         <button onClick={() => deleteReview(review.id)} className="text-xs text-destructive hover:text-destructive/80 font-bold">Delete</button>
                       </div>
                    )}
                  </div>
                </div>
                <p className="text-foreground/80 leading-relaxed">{review.reviewText}</p>
              </div>
            ))}
            {reviews?.length === 0 && <div className="text-muted-foreground py-8">No reviews yet. Be the first!</div>}
          </div>
        </div>

        {/* Cast Sidebar (Optional extra) */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold border-b border-white/10 pb-4">Top Cast</h2>
          <div className="flex flex-col gap-4">
            {movie.credits?.cast?.slice(0, 6).map((actor: { id: number, profile_path: string | null, name: string, character: string }) => (
              <div key={actor.id} className="flex items-center gap-4">
                {actor.profile_path ? (
                  <Image 
                    src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`} 
                    alt={actor.name} 
                    width={48} 
                    height={48} 
                    className="w-12 h-12 rounded-full object-cover" 
                  />
                ) : (
                   <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">?</div>
                )}
                <div>
                  <div className="font-semibold text-sm">{actor.name}</div>
                  <div className="text-xs text-muted-foreground">{actor.character}</div>
                </div>
              </div>
            ))}
          </div>

          {trailerNode && (
            <div className="pt-8">
              <h2 className="text-2xl font-bold border-b border-white/10 pb-4 mb-6">Trailer</h2>
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                 <iframe 
                   src={`https://www.youtube.com/embed/${trailerNode.key}`} 
                   title="Movie Trailer" 
                   frameBorder="0" 
                   allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                   allowFullScreen 
                   className="absolute inset-0 w-full h-full"
                 />
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
