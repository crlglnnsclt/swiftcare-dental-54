import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Settings, 
  Stethoscope, 
  Users, 
  UserCheck,
  Crown,
  Building,
  User
} from 'lucide-react';

const roles = [
  {
    icon: Crown,
    title: 'Super Admin',
    description: 'Website creator with complete system control',
    color: 'from-purple-500 to-purple-600',
    features: [
      'Activate/deactivate features per branch',
      'Global system configuration',
      'Multi-branch oversight',
      'Revenue analytics across all branches',
      'User role management'
    ],
    badgeColor: 'bg-purple-100 text-purple-800'
  },
  {
    icon: Building,
    title: 'Branch Admin',
    description: 'Complete control over individual clinic operations',
    color: 'from-medical-blue to-medical-blue-light',
    features: [
      'Staff and dentist management',
      'Patient database control',
      'Branch-specific reports',
      'Queue system configuration',
      'Billing and invoicing'
    ],
    badgeColor: 'bg-blue-100 text-blue-800'
  },
  {
    icon: Stethoscope,
    title: 'Dentist',
    description: 'Patient care and treatment management',
    color: 'from-dental-mint to-dental-mint-light',
    features: [
      'Patient queue management',
      'Dental chart CRUD operations',
      'Treatment planning',
      'Appointment scheduling',
      'Patient history access'
    ],
    badgeColor: 'bg-teal-100 text-teal-800'
  },
  {
    icon: Users,
    title: 'Staff',
    description: 'Reception and administrative support',
    color: 'from-orange-500 to-orange-600',
    features: [
      'Patient check-in management',
      'Queue monitoring',
      'Appointment scheduling',
      'Basic patient information',
      'Internal messaging'
    ],
    badgeColor: 'bg-orange-100 text-orange-800'
  },
  {
    icon: User,
    title: 'Patient',
    description: 'Self-service portal for appointments and records',
    color: 'from-green-500 to-green-600',
    features: [
      'Online appointment booking',
      'QR code check-in',
      'Digital form completion',
      'Treatment history viewing',
      'Prescription access'
    ],
    badgeColor: 'bg-green-100 text-green-800'
  }
];

const UserRolesSection = () => {
  return (
    <section className="py-20 bg-soft-gray">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-medical-blue/10 text-medical-blue border-medical-blue/20">
            User Management
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-medical-blue to-professional-navy bg-clip-text text-transparent">
            Designed for Every Role
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Tailored interfaces and permissions for each user type, ensuring 
            everyone has exactly what they need to excel in their role.
          </p>
        </div>

        {/* Roles Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {roles.map((role, index) => {
            const Icon = role.icon;
            return (
              <Card 
                key={role.title}
                className="glass-card hover:shadow-xl smooth-transition group relative overflow-hidden animate-scale-in"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                {/* Background gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${role.color} opacity-5 group-hover:opacity-10 smooth-transition`}></div>
                
                <CardHeader className="relative">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-r ${role.color} p-3 mb-4 group-hover:scale-110 smooth-transition shadow-lg`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-foreground group-hover:text-medical-blue smooth-transition">
                    {role.title}
                  </CardTitle>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {role.description}
                  </p>
                </CardHeader>
                
                <CardContent className="relative">
                  <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Key Permissions
                  </h4>
                  <ul className="space-y-2">
                    {role.features.map((feature, featureIndex) => (
                      <li 
                        key={featureIndex}
                        className="flex items-start gap-2 text-sm text-muted-foreground"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-medical-blue mt-2 flex-shrink-0"></div>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Role Hierarchy Visual */}
        <div className="glass-card p-8 text-center max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-medical-blue to-dental-mint bg-clip-text text-transparent">
            Hierarchical Access Control
          </h3>
          <p className="text-muted-foreground mb-8">
            Secure, role-based permissions ensure data privacy and operational efficiency
          </p>
          
          {/* Visual Hierarchy */}
          <div className="flex flex-wrap justify-center items-center gap-4">
            {roles.map((role, index) => (
              <div key={role.title} className="flex items-center">
                <div className={`px-4 py-2 rounded-full ${role.badgeColor} font-medium text-sm`}>
                  {role.title}
                </div>
                {index < roles.length - 1 && (
                  <div className="mx-2 w-6 h-px bg-gradient-to-r from-medical-blue to-dental-mint"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default UserRolesSection;