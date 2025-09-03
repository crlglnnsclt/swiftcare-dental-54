import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  Calendar, 
  FileText, 
  QrCode, 
  Download, 
  Users, 
  Phone,
  MapPin,
  CheckCircle,
  AlertTriangle,
  Receipt
} from 'lucide-react';

// Demo data for patient dashboard
const demoPatientData = {
  name: "Sarah Johnson",
  email: "sarah.johnson@email.com",
  phone: "(555) 123-4567",
  currentQueue: {
    position: 3,
    estimatedWait: "25 mins",
    status: "checked-in",
    appointmentTime: "2:30 PM"
  },
  upcomingAppointments: [
    {
      id: '1',
      date: '2025-01-15',
      time: '2:30 PM',
      dentist: 'Dr. Sarah Johnson',
      service: 'Routine Checkup',
      location: 'SwiftCare Downtown',
      status: 'confirmed'
    },
    {
      id: '2', 
      date: '2025-02-20',
      time: '10:00 AM',
      dentist: 'Dr. Michael Chen',
      service: 'Teeth Cleaning',
      location: 'SwiftCare Downtown',
      status: 'confirmed'
    }
  ],
  pastAppointments: [
    {
      id: '3',
      date: '2024-12-10',
      time: '11:00 AM',
      dentist: 'Dr. Emily Davis',
      service: 'Dental Filling',
      location: 'SwiftCare Downtown',
      status: 'completed',
      invoice: '$200.00'
    }
  ],
  documents: [
    {
      id: '1',
      name: 'Medical History Form',
      type: 'form',
      signed: true,
      date: '2024-12-10'
    },
    {
      id: '2',
      name: 'Treatment Consent',
      type: 'consent',
      signed: true,
      date: '2024-12-10'
    },
    {
      id: '3',
      name: 'Insurance Card',
      type: 'insurance',
      signed: false,
      date: '2024-12-10'
    }
  ]
};

function PatientApp() {
  const [activeTab, setActiveTab] = useState('queue');

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-soft-gray">
      {/* Header */}
      <div className="bg-card/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-foreground">SwiftCare Patient</h1>
              <p className="text-sm text-muted-foreground">Welcome back, {demoPatientData.name}</p>
            </div>
            <Button variant="outline" className="btn-3d">
              <QrCode className="w-4 h-4 mr-2" />
              Check-in QR
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          
          {/* Tab Navigation */}
          <TabsList className="grid w-full grid-cols-4 mb-6 bg-card/50 backdrop-blur-sm">
            <TabsTrigger value="queue" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span className="hidden sm:inline">My Queue</span>
            </TabsTrigger>
            <TabsTrigger value="appointments" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Appointments</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <Receipt className="w-4 h-4" />
              <span className="hidden sm:inline">History</span>
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Documents</span>
            </TabsTrigger>
          </TabsList>

          {/* Queue Tab */}
          <TabsContent value="queue" className="space-y-6">
            {demoPatientData.currentQueue.status === 'checked-in' ? (
              <Card className="card-3d bg-gradient-to-r from-medical-blue/10 to-dental-mint/10 border-2 border-medical-blue/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-medical-blue">
                    <Clock className="w-5 h-5" />
                    You're in the Queue!
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-medical-blue mb-2">
                        #{demoPatientData.currentQueue.position}
                      </div>
                      <p className="text-sm text-muted-foreground">Position in Queue</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-dental-mint mb-2">
                        {demoPatientData.currentQueue.estimatedWait}
                      </div>
                      <p className="text-sm text-muted-foreground">Estimated Wait</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-foreground mb-2">
                        {demoPatientData.currentQueue.appointmentTime}
                      </div>
                      <p className="text-sm text-muted-foreground">Appointment Time</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="card-3d bg-muted/30 border-2 border-border/30">
                <CardContent className="text-center py-12">
                  <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">Not Currently in Queue</h3>
                  <p className="text-muted-foreground mb-6">Check-in at the clinic to join the queue</p>
                  <Button className="btn-3d bg-medical-blue hover:bg-medical-blue-dark">
                    <QrCode className="w-4 h-4 mr-2" />
                    Show Check-in QR Code
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Queue Status Board */}
            <Card className="card-3d bg-card/80 backdrop-blur-sm border-2 border-border/50">
              <CardHeader>
                <CardTitle>Current Queue Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-success/10 border border-success/20">
                    <span className="font-medium text-success">Now Serving</span>
                    <span className="text-foreground">Patient #1</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-warning/10 border border-warning/20">
                    <span className="font-medium text-warning">On Deck</span>
                    <span className="text-foreground">Patient #2</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-medical-blue/10 border border-medical-blue/20">
                    <span className="font-medium text-medical-blue">That's You!</span>
                    <span className="text-foreground">Patient #3 - {demoPatientData.name}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appointments Tab */}
          <TabsContent value="appointments" className="space-y-6">
            <Card className="card-3d bg-card/80 backdrop-blur-sm border-2 border-border/50">
              <CardHeader>
                <CardTitle>Upcoming Appointments</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {demoPatientData.upcomingAppointments.map((appointment) => (
                  <div key={appointment.id} className="p-4 rounded-lg border border-border/50 hover:bg-muted/30 smooth-transition">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-foreground">{appointment.service}</h4>
                        <p className="text-sm text-muted-foreground">{appointment.dentist}</p>
                      </div>
                      <Badge variant={appointment.status === 'confirmed' ? 'default' : 'secondary'}>
                        {appointment.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-medical-blue" />
                        <span>{appointment.date} at {appointment.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-medical-blue" />
                        <span>{appointment.location}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            <Card className="card-3d bg-card/80 backdrop-blur-sm border-2 border-border/50">
              <CardHeader>
                <CardTitle>Treatment History</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {demoPatientData.pastAppointments.map((appointment) => (
                  <div key={appointment.id} className="p-4 rounded-lg border border-border/50">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-foreground">{appointment.service}</h4>
                        <p className="text-sm text-muted-foreground">{appointment.dentist}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="mb-2">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          {appointment.status}
                        </Badge>
                        <p className="text-sm font-semibold text-foreground">{appointment.invoice}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>{appointment.date} at {appointment.time}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-6">
            <Card className="card-3d bg-card/80 backdrop-blur-sm border-2 border-border/50">
              <CardHeader>
                <CardTitle>My Documents</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {demoPatientData.documents.map((document) => (
                  <div key={document.id} className="p-4 rounded-lg border border-border/50 hover:bg-muted/30 smooth-transition">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-medical-blue" />
                        <div>
                          <h4 className="font-semibold text-foreground">{document.name}</h4>
                          <p className="text-sm text-muted-foreground">Uploaded on {document.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {document.signed ? (
                          <Badge className="bg-success/20 text-success border-success/30">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Signed
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-warning text-warning">
                            Pending
                          </Badge>
                        )}
                        <Button variant="outline" size="sm" className="btn-3d">
                          <Download className="w-3 h-3 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default PatientApp;