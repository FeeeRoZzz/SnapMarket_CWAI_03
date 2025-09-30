import { Button } from "@/components/ui/button";
import { Camera, Wand2, Calendar, Star } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-image.jpg";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${heroImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/70 to-background" />
        </div>
        
        <div className="relative z-10 container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
            Edit. Book. <span className="text-primary">Earn.</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '0.1s' }}>
            The all-in-one marketplace connecting photographers and clients. 
            AI-powered editing, local bookings, and creative opportunities.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <Link to="/auth">
              <Button size="lg" className="text-lg px-8">
                Get Started
              </Button>
            </Link>
            <Link to="/discover">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Browse Photographers
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Everything You Need in One Place
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card rounded-xl p-8 hover:scale-105 transition-transform">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Wand2 className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">AI-Powered Editing</h3>
              <p className="text-muted-foreground">
                Quick edits with background removal, auto-tone, and color grading powered by AI technology
              </p>
            </div>

            <div className="bg-card rounded-xl p-8 hover:scale-105 transition-transform">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Easy Booking</h3>
              <p className="text-muted-foreground">
                Find and book local photographers for your events, portraits, or commercial projects
              </p>
            </div>

            <div className="bg-card rounded-xl p-8 hover:scale-105 transition-transform">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Camera className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Grow Your Business</h3>
              <p className="text-muted-foreground">
                Photographers can showcase portfolios, sell services, and connect with clients effortlessly
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-card">
        <div className="container mx-auto text-center">
          <Star className="w-16 h-16 text-primary mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform Your Photography Experience?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of photographers and clients already using SnapMarket
          </p>
          <Link to="/auth">
            <Button size="lg" className="text-lg px-8">
              Join SnapMarket Today
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>&copy; 2025 SnapMarket. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
