import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { MapPin, DollarSign, Calendar, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const PhotographerProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [photographer, setPhotographer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [bookingForm, setBookingForm] = useState({
    serviceType: "",
    preferredDate: "",
    message: "",
  });

  useEffect(() => {
    checkAuth();
    fetchPhotographer();
  }, [id]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }
    setCurrentUser(session.user);
  };

  const fetchPhotographer = async () => {
    try {
      const { data, error } = await supabase
        .from("photographer_profiles")
        .select(`
          *,
          profiles (
            id,
            full_name,
            email,
            avatar_url
          )
        `)
        .eq("user_id", id)
        .single();

      if (error) throw error;
      setPhotographer(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load photographer profile.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "Please sign in to book a photographer.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("bookings")
        .insert({
          client_id: currentUser.id,
          photographer_id: photographer.profiles.id,
          service_type: bookingForm.serviceType,
          preferred_date: bookingForm.preferredDate,
          message: bookingForm.message,
        });

      if (error) throw error;

      toast({
        title: "Booking request sent!",
        description: "The photographer will review your request soon.",
      });

      setBookingForm({ serviceType: "", preferredDate: "", message: "" });
      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send booking request.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!photographer) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Photographer not found</p>
          <Link to="/discover">
            <Button variant="outline">Back to Discover</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <Link to="/discover">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Discover
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-start gap-6">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={photographer.profiles?.avatar_url} />
                    <AvatarFallback className="text-2xl">
                      {photographer.profiles?.full_name?.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-3xl mb-2">
                      {photographer.profiles?.full_name}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 text-base mb-3">
                      <MapPin className="w-4 h-4" />
                      {photographer.city}, {photographer.location}
                    </CardDescription>
                    <div className="flex flex-wrap gap-2">
                      {photographer.specialty && (
                        <Badge className="text-sm">{photographer.specialty}</Badge>
                      )}
                      {photographer.years_experience && (
                        <Badge variant="outline" className="text-sm">
                          {photographer.years_experience} years experience
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <h3 className="font-semibold text-lg mb-3">About</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {photographer.bio || "No bio provided yet."}
                </p>

                {photographer.hourly_rate && (
                  <div className="mt-6 p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-2 text-lg font-semibold">
                      <DollarSign className="w-5 h-5 text-primary" />
                      <span className="text-primary">${photographer.hourly_rate}</span>
                      <span className="text-muted-foreground">/hour</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Booking Form */}
          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Book This Photographer</CardTitle>
                <CardDescription>
                  Send a booking request with your project details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleBooking} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="serviceType">Service Type</Label>
                    <Input
                      id="serviceType"
                      placeholder="e.g., Wedding, Portrait, Event"
                      value={bookingForm.serviceType}
                      onChange={(e) =>
                        setBookingForm({ ...bookingForm, serviceType: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="preferredDate">Preferred Date</Label>
                    <Input
                      id="preferredDate"
                      type="date"
                      value={bookingForm.preferredDate}
                      onChange={(e) =>
                        setBookingForm({ ...bookingForm, preferredDate: e.target.value })
                      }
                      min={new Date().toISOString().split("T")[0]}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Tell the photographer about your project..."
                      value={bookingForm.message}
                      onChange={(e) =>
                        setBookingForm({ ...bookingForm, message: e.target.value })
                      }
                      rows={4}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full">
                    <Calendar className="w-4 h-4 mr-2" />
                    Send Booking Request
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PhotographerProfile;
