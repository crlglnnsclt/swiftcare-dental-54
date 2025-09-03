import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  Users, 
  Calendar, 
  Clock,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Activity
} from 'lucide-react';

const DashboardPreview = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-dental-mint/10 text-dental-mint border-dental-mint/20">
            Real-time Analytics
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-dental-mint to-medical-blue bg-clip-text text-transparent">
            Powerful Dashboards
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Get instant insights into your practice performance with real-time 
            analytics and comprehensive reporting tools.
          </p>
        </div>

        {/* Dashboard Mock-ups */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {/* Admin Dashboard */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-medical-blue" />
                    Revenue Overview
                  </CardTitle>
                  <Badge className="bg-success/10 text-success">
                    +12.5% vs last month
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 rounded-xl bg-medical-blue/10">
                    <div className="text-2xl font-bold text-medical-blue">$24,650</div>
                    <div className="text-sm text-muted-foreground">This Month</div>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-dental-mint/10">
                    <div className="text-2xl font-bold text-dental-mint">$21,940</div>
                    <div className="text-sm text-muted-foreground">Last Month</div>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-success/10">
                    <div className="text-2xl font-bold text-success">+$2,710</div>
                    <div className="text-sm text-muted-foreground">Growth</div>
                  </div>
                </div>
                
                {/* Mock Chart */}
                <div className="h-32 bg-gradient-to-r from-medical-blue/10 to-dental-mint/10 rounded-xl flex items-end justify-between p-4">
                  <div className="w-8 bg-medical-blue rounded-t h-16"></div>
                  <div className="w-8 bg-medical-blue-light rounded-t h-20"></div>
                  <div className="w-8 bg-dental-mint rounded-t h-24"></div>
                  <div className="w-8 bg-dental-mint-light rounded-t h-28"></div>
                  <div className="w-8 bg-medical-blue rounded-t h-22"></div>
                  <div className="w-8 bg-dental-mint rounded-t h-32"></div>
                  <div className="w-8 bg-medical-blue-light rounded-t h-20"></div>
                </div>
              </CardContent>
            </Card>

            {/* Queue Status */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-dental-mint" />
                    Queue Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-warning"></div>
                      Waiting
                    </span>
                    <Badge variant="outline">8 patients</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-medical-blue"></div>
                      In Progress
                    </span>
                    <Badge variant="outline">3 patients</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-success"></div>
                      Completed
                    </span>
                    <Badge variant="outline">15 patients</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-professional-navy" />
                    Today's Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Appointments</span>
                    <span className="font-semibold">26</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Walk-ins</span>
                    <span className="font-semibold">8</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Emergencies</span>
                    <span className="font-semibold text-warning">2</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>No-shows</span>
                    <span className="font-semibold text-destructive">1</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Sidebar Widgets */}
          <div className="space-y-6">
            {/* Next Patient */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="w-5 h-5 text-dental-mint" />
                  Next Patient
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-medical-blue to-dental-mint flex items-center justify-center text-white font-semibold">
                    MJ
                  </div>
                  <div>
                    <p className="font-semibold">Michael Johnson</p>
                    <p className="text-sm text-muted-foreground">Scheduled: 2:30 PM</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Treatment:</span>
                    <span className="font-medium">Cleaning</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <span className="font-medium">30 min</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <Badge className="bg-success/10 text-success text-xs">Checked In</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="w-5 h-5 text-medical-blue" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-success" />
                    <span className="text-sm">Completion Rate</span>
                  </div>
                  <span className="font-semibold text-success">96%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-dental-mint" />
                    <span className="text-sm">Avg Wait Time</span>
                  </div>
                  <span className="font-semibold">12 min</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-warning" />
                    <span className="text-sm">No-show Rate</span>
                  </div>
                  <span className="font-semibold text-warning">3%</span>
                </div>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg">Recent Alerts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-warning mt-2"></div>
                  <div>
                    <p className="text-sm font-medium">Equipment maintenance</p>
                    <p className="text-xs text-muted-foreground">Chair 3 needs service</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-medical-blue mt-2"></div>
                  <div>
                    <p className="text-sm font-medium">New appointment</p>
                    <p className="text-xs text-muted-foreground">Walk-in patient added</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-success mt-2"></div>
                  <div>
                    <p className="text-sm font-medium">Payment received</p>
                    <p className="text-xs text-muted-foreground">Invoice #1247 paid</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DashboardPreview;