import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, DollarSign, LogOut, User as UserIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PhotographerProfile {
  id: string;
  user_id: string;
  bio: string;
  location: string;
  city: string;
  specialty: string;
  hourly_rate: number;
  years_experience: number;
  profiles: {
    full_name: string;
    avatar_url: string;
  };
}

const Discover = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [photographers, setPhotographers] = useState<PhotographerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    checkAuth();
    fetchPhotographers();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }
    setCurrentUser(session.user);
  };

  const fetchPhotographers = async () => {
    try {
      const { data, error } = await supabase
        .from("photographer_profiles")
        .select(`
          *,
          profiles (
            full_name,
            avatar_url
          )
        `)
        .eq("available", true);

      if (error) throw error;
      setPhotographers(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load photographers. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const filteredPhotographers = photographers.filter((photographer) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      photographer.profiles?.full_name?.toLowerCase().includes(searchLower) ||
      photographer.specialty?.toLowerCase().includes(searchLower) ||
      photographer.city?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold">
            SnapMarket
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm">
                <UserIcon className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Discover Photographers</h1>
          <p className="text-muted-foreground mb-6">
            Find talented photographers for your next project
          </p>

          {/* Search */}
          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by name, specialty, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading photographers...</p>
          </div>
        ) : filteredPhotographers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No photographers found.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPhotographers.map((photographer) => (
              <Link
                key={photographer.id}
                to={`/photographer/${photographer.user_id}`}
                className="block"
              >
                <Card className="hover:scale-105 transition-transform h-full">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={photographer.profiles?.avatar_url} />
                        <AvatarFallback>
                          {photographer.profiles?.full_name?.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-xl truncate">
                          {photographer.profiles?.full_name}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3" />
                          {photographer.city}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {photographer.bio}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {photographer.specialty && (
                        <Badge variant="secondary">{photographer.specialty}</Badge>
                      )}
                      {photographer.years_experience && (
                        <Badge variant="outline">
                          {photographer.years_experience}+ years
                        </Badge>
                      )}
                    </div>
                    {photographer.hourly_rate && (
                      <div className="flex items-center text-sm text-primary font-semibold">
                        <DollarSign className="w-4 h-4" />
                        {photographer.hourly_rate}/hour
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Discover;
