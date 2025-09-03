import { useLocation, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Calendar, MapPin, Phone, QrCode, Download, ArrowLeft, Smartphone } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

function BookingConfirmation() {
  const location = useLocation();
  const bookingData = location.state || {};

  const qrData = JSON.stringify({
    bookingId: bookingData.bookingId,
    patientName: `${bookingData.firstName} ${bookingData.lastName}`,
    date: bookingData.date,
    time: bookingData.time
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-soft-gray page-container">
      {/* Header */}
      <div className="bg-card/50 backdrop-blur-sm border-b border-border/50">
        <div className="container mx-auto px-4 py-4">
          <Link to="/" className="flex items-center gap-2 text-medical-blue hover:text-medical-blue-dark smooth-transition">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Home</span>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto space-y-8">
          
          {/* Success Message */}
          <div className="text-center animate-scale-in">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-success/20 rounded-full mb-4">
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Appointment Confirmed!</h1>
            <p className="text-lg text-muted-foreground">
              Your appointment has been successfully booked.
            </p>
          </div>

          {/* Booking Details */}
          <Card className="card-3d bg-card/80 backdrop-blur-sm border-2 border-border/50 animate-fade-in-up">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-medical-blue" />
                Booking Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Booking ID</p>
                    <p className="font-mono font-semibold text-medical-blue">{bookingData.bookingId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Patient Name</p>
                    <p className="font-semibold text-foreground">{bookingData.firstName} {bookingData.lastName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date & Time</p>
                    <p className="font-semibold text-foreground">{bookingData.date} at {bookingData.time}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Contact</p>
                    <p className="font-semibold text-foreground">{bookingData.email}</p>
                    <p className="font-semibold text-foreground">{bookingData.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-semibold text-foreground">SwiftCare Downtown</p>
                    <p className="text-sm text-muted-foreground">123 Main St, Downtown</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* QR Code for Check-in */}
          <Card className="card-3d bg-card/80 backdrop-blur-sm border-2 border-border/50 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-dental-mint" />
                Quick Check-in QR Code
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="inline-block p-6 bg-white rounded-2xl shadow-lg mb-4">
                <QRCodeSVG 
                  value={qrData} 
                  size={200}
                  level="H"
                  includeMargin={true}
                />
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Scan this QR code at the clinic kiosk for instant check-in
              </p>
              <Button variant="outline" className="btn-3d">
                <Download className="w-4 h-4 mr-2" />
                Save QR Code
              </Button>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card className="card-3d bg-gradient-to-r from-medical-blue/10 to-dental-mint/10 border-2 border-border/50 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <CardContent className="pt-6">
              <h3 className="font-semibold text-foreground mb-4">What's Next?</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-medical-blue text-white rounded-full flex items-center justify-center text-xs font-semibold">1</div>
                  <p className="text-sm text-foreground">You'll receive a confirmation email with appointment details</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-medical-blue text-white rounded-full flex items-center justify-center text-xs font-semibold">2</div>
                  <p className="text-sm text-foreground">Get SMS reminders 24 hours and 1 hour before your appointment</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-medical-blue text-white rounded-full flex items-center justify-center text-xs font-semibold">3</div>
                  <p className="text-sm text-foreground">Use the QR code above to check-in at the clinic</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-medical-blue text-white rounded-full flex items-center justify-center text-xs font-semibold">4</div>
                  <p className="text-sm text-foreground">Download the SwiftCare patient app for queue updates</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            <Button asChild className="btn-3d bg-medical-blue hover:bg-medical-blue-dark flex-1">
              <Link to="/patient-app">
                <Smartphone className="w-4 h-4 mr-2" />
                Download Patient App
              </Link>
            </Button>
            <Button asChild variant="outline" className="btn-3d flex-1">
              <Link to="/patient-booking">
                <Calendar className="w-4 h-4 mr-2" />
                Book Another Appointment
              </Link>
            </Button>
          </div>

          {/* Contact Info */}
          <Card className="card-3d bg-muted/30 border-2 border-border/30 animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Need to make changes or have questions?</p>
                <div className="flex items-center justify-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Phone className="w-4 h-4 text-medical-blue" />
                    <span className="text-foreground">(555) 123-4567</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-medical-blue" />
                    <span className="text-foreground">123 Main St</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default BookingConfirmation;