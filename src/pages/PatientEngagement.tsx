import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Gift, MessageSquare, Bell, Star, Users, Heart, Calendar, Phone } from "lucide-react";

export default function PatientEngagement() {
  const [searchTerm, setSearchTerm] = useState("");

  // TODO: Replace with actual data fetching
  const loyaltyMembers: any[] = [];

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Gold': return 'bg-yellow-100 text-yellow-800';
      case 'Silver': return 'bg-gray-100 text-gray-800';
      case 'Bronze': return 'bg-orange-100 text-orange-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Patient Engagement</h1>
          <p className="text-muted-foreground">Enhance patient experience and retention</p>
        </div>
        <Button className="medical-gradient text-white">
          <MessageSquare className="w-4 h-4 mr-2" />
          Send Broadcast
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Loyalty Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-medical-blue">0</div>
            <p className="text-xs text-muted-foreground">+0% from last month</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Points Redeemed</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-medical-blue">0</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-medical-blue">0%</div>
            <p className="text-xs text-muted-foreground">+0% from last month</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Retention Rate</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-medical-blue">0%</div>
            <p className="text-xs text-muted-foreground">+0% from last month</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="loyalty" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="loyalty">Loyalty Program</TabsTrigger>
          <TabsTrigger value="reminders">Automated Reminders</TabsTrigger>
          <TabsTrigger value="education">Educational Content</TabsTrigger>
          <TabsTrigger value="telemedicine">Tele-dentistry</TabsTrigger>
        </TabsList>

        <TabsContent value="loyalty" className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Loyalty & Rewards Program</CardTitle>
                  <CardDescription>Manage patient rewards and point system</CardDescription>
                </div>
                <Button className="medical-gradient text-white">
                  <Gift className="w-4 h-4 mr-2" />
                  Add Reward
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card className="p-4 bg-gradient-to-r from-yellow-400/10 to-yellow-600/10">
                  <div className="flex items-center gap-3">
                    <Star className="h-8 w-8 text-yellow-600" />
                    <div>
                      <h3 className="font-medium">Gold Tier</h3>
                      <p className="text-sm text-muted-foreground">2000+ points</p>
                      <p className="text-xs text-muted-foreground">20% discount on services</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4 bg-gradient-to-r from-gray-400/10 to-gray-600/10">
                  <div className="flex items-center gap-3">
                    <Star className="h-8 w-8 text-gray-600" />
                    <div>
                      <h3 className="font-medium">Silver Tier</h3>
                      <p className="text-sm text-muted-foreground">1000-1999 points</p>
                      <p className="text-xs text-muted-foreground">15% discount on services</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4 bg-gradient-to-r from-orange-400/10 to-orange-600/10">
                  <div className="flex items-center gap-3">
                    <Star className="h-8 w-8 text-orange-600" />
                    <div>
                      <h3 className="font-medium">Bronze Tier</h3>
                      <p className="text-sm text-muted-foreground">500-999 points</p>
                      <p className="text-xs text-muted-foreground">10% discount on services</p>
                    </div>
                  </div>
                </Card>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Recent Member Activity</h4>
                {loyaltyMembers.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No loyalty members yet. Start building your rewards program!</p>
                  </div>
                ) : (
                  loyaltyMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-muted-foreground">ID: {member.id}</p>
                        </div>
                        <Badge className={getTierColor(member.tier)}>
                          {member.tier}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="font-bold text-medical-blue">{member.points.toLocaleString()} pts</p>
                          <p className="text-xs text-muted-foreground">{member.visits} visits</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm">Last visit</p>
                          <p className="text-xs text-muted-foreground">{member.lastVisit}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reminders" className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Automated Reminders</CardTitle>
              <CardDescription>Configure SMS, Email, and WhatsApp notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <MessageSquare className="h-8 w-8 text-medical-blue" />
                    <div>
                      <h3 className="font-medium">SMS Reminders</h3>
                      <p className="text-sm text-muted-foreground">Text message notifications</p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full">Configure SMS</Button>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Bell className="h-8 w-8 text-medical-blue" />
                    <div>
                      <h3 className="font-medium">Email Alerts</h3>
                      <p className="text-sm text-muted-foreground">Email notifications</p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full">Configure Email</Button>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Phone className="h-8 w-8 text-medical-blue" />
                    <div>
                      <h3 className="font-medium">WhatsApp</h3>
                      <p className="text-sm text-muted-foreground">WhatsApp messages</p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full">Configure WhatsApp</Button>
                </Card>
              </div>

              <div className="border-t pt-6">
                <h4 className="font-medium mb-4">Reminder Templates</h4>
                <div className="space-y-3">
                  <div className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h5 className="font-medium">Appointment Reminder</h5>
                        <p className="text-sm text-muted-foreground">Sent 24 hours before appointment</p>
                        <p className="text-sm mt-2">"Hello {'{'}name{'}'}, your appointment is tomorrow at {'{'}time{'}'}. Please arrive 15 minutes early."</p>
                      </div>
                      <Button variant="outline" size="sm">Edit</Button>
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h5 className="font-medium">Payment Reminder</h5>
                        <p className="text-sm text-muted-foreground">Sent for pending payments</p>
                        <p className="text-sm mt-2">"Hi {'{'}name{'}'}, you have a pending payment of ${'{'}amount{'}'}. Please settle at your earliest convenience."</p>
                      </div>
                      <Button variant="outline" size="sm">Edit</Button>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h5 className="font-medium">Follow-up Care</h5>
                        <p className="text-sm text-muted-foreground">Sent after treatment</p>
                        <p className="text-sm mt-2">"Thank you for visiting us! Please follow the post-treatment instructions and schedule your next check-up."</p>
                      </div>
                      <Button variant="outline" size="sm">Edit</Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="education" className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Educational Content</CardTitle>
              <CardDescription>Share dental health tips and educational materials</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Star className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Educational Resources</h3>
                <p className="text-muted-foreground mb-6">
                  Create and share educational content, dental health tips, and interactive guides for patients.
                </p>
                <Button className="medical-gradient text-white">
                  Create Content
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="telemedicine" className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Tele-dentistry Consultations</CardTitle>
              <CardDescription>Manage virtual consultations and video calls</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Phone className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Virtual Consultations</h3>
                <p className="text-muted-foreground mb-6">
                  Enable patients to book virtual consultations and conduct video calls with dentists.
                </p>
                <Button className="medical-gradient text-white">
                  Setup Telemedicine
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}