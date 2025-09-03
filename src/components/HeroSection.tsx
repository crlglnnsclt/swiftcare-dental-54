import { Button } from '@/components/ui/button';
import { ArrowRight, Play, Smartphone, Users, Calendar, BarChart3 } from 'lucide-react';
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
          alt="Modern dental clinic"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-medical-blue/80 via-dental-mint/60 to-professional-navy/80"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Column - Text Content */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 mb-6 animate-fade-in-up">
              <span className="text-white/90 text-sm font-medium">🦷 Next-Gen Dental Management</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              SwiftCare
              <span className="block bg-gradient-to-r from-dental-mint-light to-white bg-clip-text text-transparent">
                Dental Management
              </span>
            </h1>

            <p className="text-xl text-white/90 mb-8 leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              Paperless, AI-assisted dental clinic management system. Multi-branch support, 
              intelligent queueing, e-signature forms, and comprehensive patient care workflows.
            </p>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-3 mb-8 justify-center lg:justify-start animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30">
                <Smartphone className="w-4 h-4 text-dental-mint-light" />
                <span className="text-white/90 text-sm font-medium">Mobile-First</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30">
                <Users className="w-4 h-4 text-dental-mint-light" />
                <span className="text-white/90 text-sm font-medium">Multi-Branch</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30">
                <Calendar className="w-4 h-4 text-dental-mint-light" />
                <span className="text-white/90 text-sm font-medium">Smart Queue</span>
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
                <Link to="/auth">
                  Staff Login
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm btn-3d text-lg px-8 py-6"
                onClick={() => {
                  const featuresSection = document.getElementById('features');
                  featuresSection?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <Play className="mr-2 w-5 h-5" />
                About Clinic
              </Button>
            </div>
          </div>

          {/* Right Column - Floating Cards */}
          <div className="relative hidden lg:block animate-slide-in-right">
            {/* Dashboard Card */}
            <div className="glass-card p-6 max-w-sm ml-auto mb-8 animate-float">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">Today's Queue</h3>
                <BarChart3 className="w-5 h-5 text-medical-blue" />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Waiting</span>
                  <span className="px-2 py-1 rounded-full bg-warning/20 text-warning text-xs font-medium">12</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">In Progress</span>
                  <span className="px-2 py-1 rounded-full bg-medical-blue/20 text-medical-blue text-xs font-medium">3</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Completed</span>
                  <span className="px-2 py-1 rounded-full bg-success/20 text-success text-xs font-medium">28</span>
                </div>
              </div>
            </div>

            {/* Patient Card */}
            <div className="glass-card p-6 max-w-sm animate-float" style={{ animationDelay: '1s' }}>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-medical-blue to-dental-mint"></div>
                <div>
                  <p className="font-medium text-foreground">Sarah Johnson</p>
                  <p className="text-sm text-muted-foreground">Routine Checkup</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Next in queue</span>
                <span className="px-2 py-1 rounded-full bg-success/20 text-success text-xs font-medium">Ready</span>
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