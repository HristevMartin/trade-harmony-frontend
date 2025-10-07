import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Star,
  MessageCircle,
  MapPin,
  Briefcase,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Loader2,
  X
} from "lucide-react";

interface TraderDetails {
  name: string;
  primaryTrade: string;
  city: string;
  email: string;
  phone: string | null;
}

interface JobDetails {
  job_title: string;
  job_description: string;
  budget: string;
  urgency: string;
  location: string;
}

interface LastMessage {
  body: string;
  sender_id: string;
  created_at: string;
}

interface TraderConversation {
  conversation_id: string;
  job_id: string;
  trader_id: string;
  status: string;
  message_count: string;
  last_message_at: string;
  created_at: string;
  trader_details: TraderDetails;
  job_details: JobDetails;
  last_message: LastMessage;
}

const RateTraders = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;

  const [traders, setTraders] = useState<TraderConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTrader, setSelectedTrader] = useState<TraderConversation | null>(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchTraders = async () => {
      if (!jobId) {
        setError("No job ID provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`${apiUrl}/api/jobs/${jobId}/rate-options`, {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Traders data:", data);

        // Handle array response
        if (Array.isArray(data)) {
          setTraders(data);

          // Auto-open modal if only one trader
          if (data.length === 1) {
            setSelectedTrader(data[0]);
            setShowRatingModal(true);
          }
        } else {
          setError("Invalid response format");
        }
      } catch (err) {
        console.error("Error fetching traders:", err);
        setError("Failed to load traders. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchTraders();
  }, [jobId, apiUrl]);

  const handleSelectTrader = (trader: TraderConversation) => {
    setSelectedTrader(trader);
    setShowRatingModal(true);
  };

  const handleCloseModal = () => {
    setShowRatingModal(false);
    setSelectedTrader(null);
    setRating(0);
    setHoveredRating(0);
    setComment("");
  };

  const handleSubmitRating = () => {
    if (!selectedTrader || rating === 0) return;

    setSubmitting(true);

    const ratingPayload = {
      trader_id: selectedTrader.trader_id,
      job_id: selectedTrader.job_id,
      conversation_id: selectedTrader.conversation_id,
      rating: rating,
      comment: comment.trim() || null,
      trader_name: selectedTrader.trader_details.name,
      trader_trade: selectedTrader.trader_details.primaryTrade,
      job_title: selectedTrader.job_details.job_title,
      rated_at: new Date().toISOString(),
    };

    console.log("Rating Payload:", ratingPayload);

    // Simulate API call
    setTimeout(() => {
      setSubmitting(false);
      handleCloseModal();
      // Show success message (you can add a toast here)
      alert(`Successfully rated ${selectedTrader.trader_details.name}!`);
    }, 1000);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) return "just now";
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString("en-GB", { month: "short", day: "numeric" });
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
            <div className="text-center space-y-2">
              <h2 className="text-xl font-semibold text-foreground">Loading Traders</h2>
              <p className="text-sm text-muted-foreground">Please wait while we fetch the traders...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-6 hover:bg-muted"
            aria-label="Go back"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <Card className="border-destructive/20">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-destructive/10 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-destructive" />
              </div>
              <h2 className="text-xl font-semibold text-destructive mb-3">Something went wrong</h2>
              <p className="text-muted-foreground mb-6">{error}</p>
              <Button onClick={() => window.location.reload()} variant="outline">
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Empty State
  if (traders.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-6 hover:bg-muted"
            aria-label="Go back"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <Card>
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-muted/50 rounded-full flex items-center justify-center">
                <MessageCircle className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-semibold mb-3 text-foreground">No connected traders to rate</h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                You haven't had any conversations with traders for this job yet.
              </p>
              <Button onClick={() => navigate(-1)} variant="outline">
                Go Back
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4 hover:bg-muted -ml-2"
            aria-label="Go back"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Rate Your Trader
          </h1>
          <p className="text-muted-foreground">
            Select the trader who completed your job to leave a rating
          </p>
        </div>

        {/* Job Info (from first trader's job_details) */}
        {traders.length > 0 && traders[0].job_details && (
          <Card className="mb-6 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="p-4">
              <h3 className="font-semibold text-foreground mb-1">
                {traders[0].job_details.job_title}
              </h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-3 h-3" />
                <span>{traders[0].job_details.location}</span>
                <span className="text-muted-foreground/50">•</span>
                <span>{traders[0].job_details.budget}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Traders List */}
        <div className="space-y-4">
          {traders.map((trader) => (
            <Card
              key={trader.conversation_id}
              className="group hover:shadow-md transition-all duration-200 cursor-pointer border-border hover:border-primary/30"
              onClick={() => handleSelectTrader(trader)}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <Avatar className="h-14 w-14 border-2 border-background shadow-sm">
                    <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground text-lg font-bold">
                      {trader.trader_details.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <h3 className="font-semibold text-lg text-foreground mb-1">
                          {trader.trader_details.name}
                        </h3>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="secondary" className="text-xs">
                            <Briefcase className="w-3 h-3 mr-1" />
                            {trader.trader_details.primaryTrade}
                          </Badge>
                          <span className="text-sm text-muted-foreground flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {trader.trader_details.city}
                          </span>
                        </div>
                      </div>

                      {/* Message Count Badge */}
                      <div className="flex items-center gap-1 bg-muted/50 px-3 py-1 rounded-full">
                        <MessageCircle className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs font-medium text-muted-foreground">
                          {trader.message_count}
                        </span>
                      </div>
                    </div>

                    {/* Last Message */}
                    {trader.last_message && (
                      <div className="bg-muted/30 rounded-lg p-3 mt-3">
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-1">
                          {trader.last_message.body}
                        </p>
                        <span className="text-xs text-muted-foreground/70">
                          {formatTimeAgo(trader.last_message.created_at)}
                        </span>
                      </div>
                    )}

                    {/* Select Button */}
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectTrader(trader);
                      }}
                      className="mt-4 w-full md:w-auto bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      <Star className="w-4 h-4 mr-2" />
                      Rate This Trader
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Rating Modal */}
      {showRatingModal && selectedTrader && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-in fade-in-0 duration-200"
          onClick={handleCloseModal}
        >
          <div
            className="bg-background rounded-2xl shadow-2xl max-w-lg w-full mx-4 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-foreground">Rate Your Experience</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCloseModal}
                  className="h-8 w-8 p-0 hover:bg-muted rounded-full"
                  aria-label="Close modal"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Trader Info */}
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl">
                <Avatar className="h-16 w-16 border-2 border-background shadow-sm">
                  <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground text-xl font-bold">
                    {selectedTrader.trader_details.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg text-foreground">
                    {selectedTrader.trader_details.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedTrader.trader_details.primaryTrade} • {selectedTrader.trader_details.city}
                  </p>
                </div>
              </div>

              {/* Job Title */}
              <div>
                <p className="text-sm text-muted-foreground mb-1">Job completed:</p>
                <p className="font-medium text-foreground">{selectedTrader.job_details.job_title}</p>
              </div>

              {/* Star Rating */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-3">
                  Your Rating <span className="text-destructive">*</span>
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-full p-1"
                      aria-label={`Rate ${star} stars`}
                    >
                      <Star
                        className={`w-10 h-10 transition-colors ${
                          star <= (hoveredRating || rating)
                            ? "text-[#FACC15] fill-[#FACC15]"
                            : "text-muted-foreground"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                {rating > 0 && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {rating === 5 && "Excellent! ⭐"}
                    {rating === 4 && "Very Good! 👍"}
                    {rating === 3 && "Good"}
                    {rating === 2 && "Fair"}
                    {rating === 1 && "Poor"}
                  </p>
                )}
              </div>

              {/* Comment */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Comment (Optional)
                </label>
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your experience with this trader..."
                  className="min-h-[100px] resize-none"
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground mt-1 text-right">
                  {comment.length}/500
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-border flex gap-3 justify-end">
              <Button variant="outline" onClick={handleCloseModal} disabled={submitting}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmitRating}
                disabled={rating === 0 || submitting}
                className="bg-primary hover:bg-primary/90 text-primary-foreground min-w-[120px]"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Submit Rating
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RateTraders;

