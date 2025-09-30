import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { User, Settings, Calendar, ArrowLeft } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [photographerProfile, setPhotographerProfile] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [photographerForm, setPhotographerForm] = useState({
    bio: "",
    location: "",
    city: "",
    specialty: "",
    hourly_rate: "",
    years_experience: "",
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }
    setCurrentUser(session.user);
    await fetchProfile(session.user.id);
    await fetchBookings(session.user.id);
  };

  const fetchProfile = async (userId: string) => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      if (profileData.role === "photographer") {
        const { data: photoData } = await supabase
          .from("photographer_profiles")
          .select("*")
          .eq("user_id", userId)
          .maybeSingle();

        if (photoData) {
          setPhotographerProfile(photoData);
          setPhotographerForm({
            bio: photoData.bio || "",
            location: photoData.location || "",
            city: photoData.city || "",
            specialty: photoData.specialty || "",
            hourly_rate: photoData.hourly_rate?.toString() || "",
            years_experience: photoData.years_experience?.toString() || "",
          });
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load profile.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          *,
          client:profiles!bookings_client_id_fkey(full_name),
          photographer:profiles!bookings_photographer_id_fkey(full_name)
        `)
        .or(`client_id.eq.${userId},photographer_id.eq.${userId}`)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load bookings.",
        variant: "destructive",
      });
    }
  };

  const handlePhotographerProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const profileData = {
        user_id: currentUser.id,
        bio: photographerForm.bio,
        location: photographerForm.location,
        city: photographerForm.city,
        specialty: photographerForm.specialty,
        hourly_rate: photographerForm.hourly_rate ? parseInt(photographerForm.hourly_rate) : null,
        years_experience: photographerForm.years_experience
          ? parseInt(photographerForm.years_experience)
          : null,
      };

      if (photographerProfile) {
        const { error } = await supabase
          .from("photographer_profiles")
          .update(profileData)
          .eq("user_id", currentUser.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("photographer_profiles")
          .insert(profileData);
        if (error) throw error;
      }

      toast({
        title: "Success!",
        description: "Your photographer profile has been updated.",
      });
      await fetchProfile(currentUser.id);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile.",
        variant: "destructive",
      });
    }
  };

  const handleBookingStatusUpdate = async (bookingId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("bookings")
        .update({ status: newStatus })
        .eq("id", bookingId);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Booking status updated.",
      });
      await fetchBookings(currentUser.id);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update booking status.",
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

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <Link to="/discover">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Discover
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="bookings" className="space-y-6">
          <TabsList>
            <TabsTrigger value="bookings">
              <Calendar className="w-4 h-4 mr-2" />
              Bookings
            </TabsTrigger>
            {profile?.role === "photographer" && (
              <TabsTrigger value="profile">
                <Settings className="w-4 h-4 mr-2" />
                Profile Setup
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="bookings">
            <Card>
              <CardHeader>
                <CardTitle>Your Bookings</CardTitle>
                <CardDescription>
                  {profile?.role === "photographer"
                    ? "Manage booking requests from clients"
                    : "View your booking requests"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {bookings.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No bookings yet.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <Card key={booking.id}>
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-lg">
                                {booking.service_type}
                              </CardTitle>
                              <CardDescription>
                                {profile?.role === "photographer"
                                  ? `Client: ${booking.client?.full_name}`
                                  : `Photographer: ${booking.photographer?.full_name}`}
                              </CardDescription>
                            </div>
                            <Badge
                              variant={
                                booking.status === "accepted"
                                  ? "default"
                                  : booking.status === "pending"
                                  ? "secondary"
                                  : "destructive"
                              }
                            >
                              {booking.status}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-2">
                            Preferred Date:{" "}
                            {new Date(booking.preferred_date).toLocaleDateString()}
                          </p>
                          <p className="text-sm mb-4">{booking.message}</p>
                          {profile?.role === "photographer" &&
                            booking.status === "pending" && (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    handleBookingStatusUpdate(booking.id, "accepted")
                                  }
                                >
                                  Accept
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    handleBookingStatusUpdate(booking.id, "declined")
                                  }
                                >
                                  Decline
                                </Button>
                              </div>
                            )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {profile?.role === "photographer" && (
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Photographer Profile</CardTitle>
                  <CardDescription>
                    Set up your profile to appear in the marketplace
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePhotographerProfileUpdate} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          placeholder="New York"
                          value={photographerForm.city}
                          onChange={(e) =>
                            setPhotographerForm({ ...photographerForm, city: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="location">Location/Region</Label>
                        <Input
                          id="location"
                          placeholder="NY"
                          value={photographerForm.location}
                          onChange={(e) =>
                            setPhotographerForm({ ...photographerForm, location: e.target.value })
                          }
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="specialty">Specialty</Label>
                      <Input
                        id="specialty"
                        placeholder="e.g., Wedding, Portrait, Event"
                        value={photographerForm.specialty}
                        onChange={(e) =>
                          setPhotographerForm({ ...photographerForm, specialty: e.target.value })
                        }
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="hourly_rate">Hourly Rate ($)</Label>
                        <Input
                          id="hourly_rate"
                          type="number"
                          placeholder="100"
                          value={photographerForm.hourly_rate}
                          onChange={(e) =>
                            setPhotographerForm({
                              ...photographerForm,
                              hourly_rate: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="years_experience">Years of Experience</Label>
                        <Input
                          id="years_experience"
                          type="number"
                          placeholder="5"
                          value={photographerForm.years_experience}
                          onChange={(e) =>
                            setPhotographerForm({
                              ...photographerForm,
                              years_experience: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        placeholder="Tell clients about yourself and your experience..."
                        value={photographerForm.bio}
                        onChange={(e) =>
                          setPhotographerForm({ ...photographerForm, bio: e.target.value })
                        }
                        rows={5}
                        required
                      />
                    </div>

                    <Button type="submit">Save Profile</Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
