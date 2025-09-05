import { Button } from '@/components/ui/button';
import { ArrowRight, Phone, MapPin, Clock, Star, Award, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import heroImage from '@/assets/dental-hero.jpg';

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background with gradient overlay */}
      <div className="absolute inset-0 hero-gradient opacity-90"></div>
      
      {/* Hero Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImage} 
          alt="Swift Care Dental Clinic - Modern dental office"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-medical-blue/80 via-dental-mint/60 to-professional-navy/80"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Column - Main Content */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 mb-6 animate-fade-in-up">
              <span className="text-white/90 text-sm font-medium">🦷 Your Smile is Our Priority</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              Swift Care
              <span className="block bg-gradient-to-r from-dental-mint-light to-white bg-clip-text text-transparent">
                Dental Clinic
              </span>
            </h1>

            <p className="text-xl text-white/90 mb-8 leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              Experience exceptional dental care with our state-of-the-art facility and compassionate team. 
              We provide comprehensive dental services to keep your smile healthy and bright.
            </p>

            {/* Trust Indicators */}
            <div className="flex flex-wrap gap-3 mb-8 justify-center lg:justify-start animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30">
                <Star className="w-4 h-4 text-dental-mint-light" />
                <span className="text-white/90 text-sm font-medium">5-Star Rated</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30">
                <Award className="w-4 h-4 text-dental-mint-light" />
                <span className="text-white/90 text-sm font-medium">Award Winning</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30">
                <Shield className="w-4 h-4 text-dental-mint-light" />
                <span className="text-white/90 text-sm font-medium">Safe & Sterile</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <Button asChild size="lg" className="bg-white text-medical-blue hover:bg-white/90 btn-3d text-lg px-8 py-6">
                <Link to="/patient-booking">
                  Book Appointment
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button asChild size="lg" className="bg-dental-mint text-white hover:bg-dental-mint/90 btn-3d text-lg px-8 py-6">
                <a href="tel:+1234567890">
                  <Phone className="mr-2 w-5 h-5" />
                  Call Now
                </a>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm btn-3d text-lg px-8 py-6"
                onClick={() => {
                  const servicesSection = document.getElementById('services');
                  servicesSection?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Our Services
              </Button>
            </div>
          </div>

          {/* Right Column - Clinic Info Cards */}
          <div className="relative hidden lg:block animate-slide-in-right">
            {/* Hours Card */}
            <div className="glass-card p-6 max-w-sm ml-auto mb-8 animate-float">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">Office Hours</h3>
                <Clock className="w-5 h-5 text-medical-blue" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Monday - Friday</span>
                  <span className="text-sm font-medium">8:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Saturday</span>
                  <span className="text-sm font-medium">9:00 AM - 4:00 PM</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Sunday</span>
                  <span className="text-sm font-medium">Emergency Only</span>
                </div>
                <div className="mt-4 p-3 bg-medical-blue/10 rounded-lg">
                  <p className="text-xs text-medical-blue font-medium">
                    Emergency appointments available 24/7
                  </p>
                </div>
              </div>
            </div>

            {/* Location Card */}
            <div className="glass-card p-6 max-w-sm animate-float" style={{ animationDelay: '1s' }}>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-medical-blue to-dental-mint flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Visit Us Today</p>
                  <p className="text-sm text-muted-foreground">Downtown Location</p>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                <p>123 Main Street</p>
                <p>Downtown District</p>
                <p>City, State 12345</p>
              </div>
              <div className="mt-4">
                <Button variant="outline" size="sm" className="w-full">
                  Get Directions
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent"></div>
    </section>
  );
};

export default HeroSection;