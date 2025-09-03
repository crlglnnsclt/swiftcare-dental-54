import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { 
  Users, 
  FileText, 
  Clock, 
  Smartphone, 
  BarChart3, 
  Shield,
  QrCode,
  Stethoscope,
  Calendar,
  Settings
} from 'lucide-react';

const features = [
  {
    icon: Users,
    title: 'Multi-Branch Management',
    description: 'Centralized control with branch-specific customization. Each location can have unique branding and feature sets.',
    gradient: 'from-medical-blue to-medical-blue-light'
  },
  {
    icon: FileText,
    title: 'Paperless Operations',
    description: 'Digital forms, electronic signatures, and comprehensive record keeping. Eliminate paper waste and improve efficiency.',
    gradient: 'from-dental-mint to-dental-mint-light'
  },
  {
    icon: Clock,
    title: 'Intelligent Queueing',
    description: 'Smart priority system with Emergency > Scheduled > Walk-in. Automatic rescheduling with patient notifications.',
    gradient: 'from-professional-navy to-medical-blue'
  },
  {
    icon: QrCode,
    title: 'QR Check-in System',
    description: 'Contactless patient check-ins with automatic queue entry. Staff backup for non-tech-savvy patients.',
    gradient: 'from-success to-dental-mint'
  },
  {
    icon: Stethoscope,
    title: 'Digital Dental Charts',
    description: 'Complete odontogram with 32-tooth visualization. Full CRUD operations with comprehensive audit trails.',
    gradient: 'from-medical-blue to-dental-mint'
  },
  {
    icon: Smartphone,
    title: 'Mobile-First Design',
    description: '3D interface optimized for mobile devices. Works seamlessly across phones, tablets, and desktops.',
    gradient: 'from-dental-mint to-professional-navy'
  },
  {
    icon: BarChart3,
    title: 'Advanced Analytics',
    description: 'Real-time dashboards for revenue tracking, utilization metrics, and performance insights.',
    gradient: 'from-professional-navy to-medical-blue-light'
  },
  {
    icon: Calendar,
    title: 'Appointment Management',
    description: 'Smart scheduling with conflict resolution. Grace periods and automatic slot management.',
    gradient: 'from-medical-blue-light to-dental-mint'
  },
  {
    icon: Shield,
    title: 'Role-Based Access',
    description: 'Granular permissions for Super Admin, Admin, Dentist, Staff, and Patient roles with secure authentication.',
    gradient: 'from-dental-mint-light to-professional-navy'
  },
  {
    icon: Settings,
    title: 'Customizable Features',
    description: 'Enable or disable features per branch. Flexible configuration to match your clinic\'s workflow.',
    gradient: 'from-professional-navy to-medical-blue'
  }
];

const FeaturesSection = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-medical-blue to-dental-mint bg-clip-text text-transparent">
            Powerful Features for Modern Dental Practices
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Everything you need to run a successful multi-branch dental practice with 
            cutting-edge technology and seamless patient experience.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={feature.title}
                className="glass-card hover:shadow-lg smooth-transition group animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.gradient} p-3 mb-4 group-hover:scale-110 smooth-transition`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-foreground group-hover:text-medical-blue smooth-transition">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="glass-card p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-medical-blue to-dental-mint bg-clip-text text-transparent">
              Ready to Transform Your Practice?
            </h3>
            <p className="text-muted-foreground mb-6">
              Join hundreds of dental practices already using SwiftCare to streamline operations and improve patient care.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth" className="px-8 py-3 bg-gradient-to-r from-medical-blue to-dental-mint text-white rounded-xl btn-3d font-medium hover:shadow-lg smooth-transition">
                Start Free Trial
              </Link>
              <button 
                onClick={() => {
                  const contactSection = document.getElementById('contact');
                  contactSection?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-8 py-3 border border-medical-blue text-medical-blue rounded-xl hover:bg-medical-blue/10 smooth-transition font-medium"
              >
                Schedule Demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;