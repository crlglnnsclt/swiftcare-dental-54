import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { 
  Heart, 
  Smile, 
  Shield, 
  Sparkles, 
  Users, 
  Clock,
  Award,
  Stethoscope
} from 'lucide-react';

const services = [
  {
    icon: Smile,
    title: 'General Dentistry',
    description: 'Comprehensive oral health care including cleanings, fillings, and preventive treatments to maintain your dental health.',
    features: ['Dental Cleanings', 'Fillings', 'Oral Exams', 'X-Rays'],
    gradient: 'from-medical-blue to-medical-blue-light'
  },
  {
    icon: Sparkles,
    title: 'Cosmetic Dentistry',
    description: 'Transform your smile with our aesthetic treatments designed to enhance the beauty and confidence of your teeth.',
    features: ['Teeth Whitening', 'Veneers', 'Bonding', 'Smile Makeovers'],
    gradient: 'from-dental-mint to-dental-mint-light'
  },
  {
    icon: Stethoscope,
    title: 'Restorative Dentistry',
    description: 'Restore function and appearance to damaged teeth with our comprehensive restorative treatment options.',
    features: ['Crowns & Bridges', 'Dental Implants', 'Root Canals', 'Dentures'],
    gradient: 'from-professional-navy to-medical-blue'
  },
  {
    icon: Shield,
    title: 'Preventive Care',
    description: 'Proactive treatments to prevent dental problems before they start, keeping your smile healthy for life.',
    features: ['Fluoride Treatments', 'Sealants', 'Gum Disease Prevention', 'Oral Cancer Screening'],
    gradient: 'from-success to-dental-mint'
  },
  {
    icon: Users,
    title: 'Family Dentistry',
    description: 'Comprehensive dental care for patients of all ages, from children to seniors, in a family-friendly environment.',
    features: ['Pediatric Care', 'Teen Orthodontics', 'Adult Treatments', 'Senior Care'],
    gradient: 'from-medical-blue to-dental-mint'
  },
  {
    icon: Clock,
    title: 'Emergency Dental Care',
    description: 'Urgent dental care when you need it most. We provide same-day emergency appointments for dental emergencies.',
    features: ['24/7 Emergency Line', 'Same-Day Appointments', 'Pain Relief', 'Urgent Repairs'],
    gradient: 'from-dental-mint to-professional-navy'
  }
];

const FeaturesSection = () => {
  return (
    <section id="services" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-medical-blue to-dental-mint bg-clip-text text-transparent">
            Comprehensive Dental Services
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            From routine cleanings to complex restorative procedures, we provide complete dental care 
            in a comfortable, modern environment with the latest technology.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <Card 
                key={service.title}
                className="glass-card hover:shadow-lg smooth-transition group animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${service.gradient} p-3 mb-4 group-hover:scale-110 smooth-transition`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-foreground group-hover:text-medical-blue smooth-transition">
                    {service.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    {service.description}
                  </p>
                  <ul className="space-y-2">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-sm text-muted-foreground">
                        <div className="w-1.5 h-1.5 bg-dental-mint rounded-full mr-3 flex-shrink-0"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Why Choose Us Section */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-medical-blue to-dental-mint bg-clip-text text-transparent">
              Why Choose Swift Care Dental?
            </h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We combine advanced technology with compassionate care to deliver exceptional dental experiences.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gradient-to-r from-medical-blue to-dental-mint rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h4 className="font-semibold text-lg mb-2">Award-Winning Care</h4>
              <p className="text-sm text-muted-foreground">Recognized for excellence in patient care and clinical outcomes.</p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gradient-to-r from-dental-mint to-medical-blue rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h4 className="font-semibold text-lg mb-2">Latest Technology</h4>
              <p className="text-sm text-muted-foreground">State-of-the-art equipment for precise, comfortable treatments.</p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gradient-to-r from-professional-navy to-dental-mint rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h4 className="font-semibold text-lg mb-2">Compassionate Team</h4>
              <p className="text-sm text-muted-foreground">Caring professionals dedicated to your comfort and well-being.</p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gradient-to-r from-dental-mint to-professional-navy rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h4 className="font-semibold text-lg mb-2">Safe Environment</h4>
              <p className="text-sm text-muted-foreground">Strict sterilization protocols and infection control measures.</p>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="glass-card p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-medical-blue to-dental-mint bg-clip-text text-transparent">
              Ready to Experience the Swift Care Difference?
            </h3>
            <p className="text-muted-foreground mb-6">
              Schedule your appointment today and discover why thousands of patients trust us with their dental care.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/patient-booking" className="px-8 py-3 bg-gradient-to-r from-medical-blue to-dental-mint text-white rounded-xl btn-3d font-medium hover:shadow-lg smooth-transition">
                Book Your Appointment
              </Link>
              <a 
                href="tel:+1234567890"
                className="px-8 py-3 border border-medical-blue text-medical-blue rounded-xl hover:bg-medical-blue/10 smooth-transition font-medium"
              >
                Call (123) 456-7890
              </a>
            </div>
            <div className="mt-4 text-sm text-muted-foreground">
              <p>New patients welcome • Insurance accepted • Flexible payment plans available</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;