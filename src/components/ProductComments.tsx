"use client";
import { useEffect, useState, useCallback } from "react";
import { useSession, signIn } from "next-auth/react";
import type { Session } from "next-auth";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Star } from "lucide-react";

interface ProductCommentsProps {
  productId: string;
}

interface Comment {
  id: string;
  text: string;
  createdAt: string;
  user: { id: string; name?: string | null; email?: string | null };
  rating?: number | null;
}

export default function ProductComments({ productId }: ProductCommentsProps) {
  const { data: session, status } = useSession();
  const userId = (session?.user as Session["user"])?.id;
  const isAuthenticated = status === "authenticated" && !!userId;

  const [comments, setComments] = useState<Comment[]>([]);
  const [average, setAverage] = useState<number | null>(null);
  const [text, setText] = useState("");
  const [rating, setRating] = useState<number>(5);
  const [loadingComment, setLoadingComment] = useState(false);
  const [loadingRating, setLoadingRating] = useState(false);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [ratingSelected, setRatingSelected] = useState(false);

  const fetchData = useCallback(() => {
    fetch(`/api/products/${productId}/comment`).then(res => res.json()).then(setComments);
    fetch(`/api/products/${productId}/rating`).then(res => res.json()).then(data => setAverage(data.average));
  }, [productId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setLoadingComment(true);
    await fetch(`/api/products/${productId}/comment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, text }),
    });
    setText("");
    fetchData();
    setLoadingComment(false);
  };

  const handleRatingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setLoadingRating(true);
    await fetch(`/api/products/${productId}/rating`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, value: rating }),
    });
    fetchData();
    setLoadingRating(false);
  };

  const handleStarClick = (value: number) => {
    setRating(value);
    setRatingSelected(true);
  };

  const handleStarMouseOver = (value: number) => {
    setHoverRating(value);
  };

  const handleStarMouseLeave = () => {
    setHoverRating(null);
  };

  return (
    <Card className="w-full max-w-8xl mx-auto  mb-12 ">
      <CardHeader>
        <CardTitle className="text-2xl">Product Reviews & Comments</CardTitle>
        <CardDescription className="text-base mt-2">Share your experience or see what others think about this product.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div>
          <div className="flex items-center gap-4 mb-4">
            <span className="font-semibold text-lg">Average Rating:</span>
            <span className="text-yellow-500 font-bold text-xl">{average ? average.toFixed(1) : "-"} / 5</span>
          </div>
          <form onSubmit={handleRatingSubmit} className="flex flex-col md:flex-row gap-4 items-center mb-6">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => {
                const filled = ratingSelected
                  ? (hoverRating ?? rating) >= star
                  : hoverRating ? hoverRating >= star : false;
                return (
                  <button
                    type="button"
                    key={star}
                    onClick={() => handleStarClick(star)}
                    onMouseOver={() => handleStarMouseOver(star)}
                    onFocus={() => handleStarMouseOver(star)}
                    onMouseLeave={handleStarMouseLeave}
                    onBlur={handleStarMouseLeave}
                    disabled={!isAuthenticated}
                    aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`w-8 h-8 ${filled ? 'fill-yellow-400 text-yellow-500' : 'text-gray-300'}`}
                      fill={filled ? 'currentColor' : 'none'}
                    />
                  </button>
                );
              })}
            </div>
            {ratingSelected && (
              <Button type="submit" disabled={loadingRating || !isAuthenticated} className="w-full md:w-auto">Submit Rating</Button>
            )}
          </form>
        </div>
        <Separator />
        <form onSubmit={handleCommentSubmit} className="space-y-3">
          <Label htmlFor="comment-text" className="text-base">Add a comment</Label>
          <Textarea
            id="comment-text"
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Write your comment..."
            required
            disabled={!isAuthenticated}
            className="min-h-[80px] text-base"
          />
          <Button type="submit" disabled={loadingComment || !text.trim() || !isAuthenticated} className="ml-auto">Submit Comment</Button>
        </form>
        {!isAuthenticated && (
          <div className="text-center text-muted-foreground mt-2">
            <Button variant="outline" onClick={() => signIn()}>Sign in to comment or rate</Button>
          </div>
        )}
        <Separator />
        <div className="space-y-4">
          {comments.length === 0 ? (
            <div className="text-muted-foreground text-center">No comments yet.</div>
          ) : (
            comments.map((c) => (
              <Card key={c.id} className="p-4 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-base">{c.user?.name || c.user?.email || "User"}</span>
                  {c.rating && (
                    <span className="text-yellow-500 text-sm">{c.rating} / 5</span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground mb-1">{new Date(c.createdAt).toLocaleString()}</div>
                <div className="text-base">{c.text}</div>
              </Card>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
} 