import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, User, Phone, Mail, ArrowLeft, ArrowRight, QrCode } from 'lucide-react';
import { BranchSelector } from '@/components/BranchSelector';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

// Demo data
const demoServices = [
  { id: '1', name: 'Routine Checkup', duration: '30 mins', price: '$120' },
  { id: '2', name: 'Teeth Cleaning', duration: '45 mins', price: '$150' },
  { id: '3', name: 'Dental Filling', duration: '60 mins', price: '$200' },
  { id: '4', name: 'Root Canal', duration: '90 mins', price: '$800' },
  { id: '5', name: 'Teeth Whitening', duration: '60 mins', price: '$300' }
];

const demoDentists = [
  { id: 'any', name: 'Any Available Dentist', specialty: 'First available slot' },
  { id: '1', name: 'Dr. Sarah Johnson', specialty: 'General Dentistry' },
  { id: '2', name: 'Dr. Michael Chen', specialty: 'Orthodontics' },
  { id: '3', name: 'Dr. Emily Davis', specialty: 'Endodontics' },
  { id: '4', name: 'Dr. James Wilson', specialty: 'Oral Surgery' }
];

const demoTimeSlots = [
  '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', 
  '11:30 AM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM'
];

function PatientBooking() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    branch: '',
    service: '',
    dentist: '',
    date: '',
    time: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    isNewPatient: false
  });

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = () => {
    // Simulate booking confirmation
    toast({
      title: "Appointment Booked Successfully!",
      description: "You'll receive a confirmation email shortly.",
    });
    
    // Navigate to confirmation page with booking details
    navigate('/booking-confirmation', { 
      state: { 
        bookingId: 'APT-2025-' + Math.floor(Math.random() * 10000),
        ...formData 
      } 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-soft-gray page-container">
      {/* Header */}
      <div className="bg-card/50 backdrop-blur-sm border-b border-border/50 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-medical-blue hover:text-medical-blue-dark smooth-transition">
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Home</span>
            </Link>
            <h1 className="text-xl font-bold text-foreground">Book Appointment</h1>
            <div className="w-24"></div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[1, 2, 3, 4].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium smooth-transition ${
                  step >= stepNumber 
                    ? 'bg-medical-blue text-white shadow-lg' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {stepNumber}
                </div>
                {stepNumber < 4 && (
                  <div className={`w-8 h-0.5 mx-2 smooth-transition ${
                    step > stepNumber ? 'bg-medical-blue' : 'bg-muted'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="max-w-2xl mx-auto">
          <Card className="card-3d bg-card/80 backdrop-blur-sm border-2 border-border/50">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-foreground">
                {step === 1 && "Select Location & Service"}
                {step === 2 && "Choose Dentist & Date"}
                {step === 3 && "Your Information"}
                {step === 4 && "Confirm Appointment"}
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Step 1: Location & Service */}
              {step === 1 && (
                <div className="space-y-6 card-stagger-1">
                  <BranchSelector 
                    selectedBranch={formData.branch}
                    onBranchSelect={(branch) => setFormData({...formData, branch})}
                  />
                  
                  <div>
                    <Label className="text-sm font-medium text-foreground mb-3 block">Treatment Type</Label>
                    <Select value={formData.service} onValueChange={(service) => setFormData({...formData, service})}>
                      <SelectTrigger className="btn-3d">
                        <SelectValue placeholder="Select treatment type" />
                      </SelectTrigger>
                      <SelectContent>
                        {demoServices.map((service) => (
                          <SelectItem key={service.id} value={service.id}>
                            <div className="flex justify-between items-center w-full">
                              <span className="font-medium">{service.name}</span>
                              <div className="text-sm text-muted-foreground ml-4">
                                {service.duration} • {service.price}
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Step 2: Dentist & Date */}
              {step === 2 && (
                <div className="space-y-6 card-stagger-2">
                  <div>
                    <Label className="text-sm font-medium text-foreground mb-3 block">Preferred Dentist</Label>
                    <Select value={formData.dentist} onValueChange={(dentist) => setFormData({...formData, dentist})}>
                      <SelectTrigger className="btn-3d">
                        <SelectValue placeholder="Choose your dentist" />
                      </SelectTrigger>
                      <SelectContent>
                        {demoDentists.map((dentist) => (
                          <SelectItem key={dentist.id} value={dentist.id}>
                            <div>
                              <p className="font-medium">{dentist.name}</p>
                              <p className="text-sm text-muted-foreground">{dentist.specialty}</p>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-foreground mb-3 block">Preferred Date</Label>
                      <Input 
                        type="date" 
                        value={formData.date}
                        onChange={(e) => setFormData({...formData, date: e.target.value})}
                        className="btn-3d"
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-foreground mb-3 block">Preferred Time</Label>
                      <Select value={formData.time} onValueChange={(time) => setFormData({...formData, time})}>
                        <SelectTrigger className="btn-3d">
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                        <SelectContent>
                          {demoTimeSlots.map((slot) => (
                            <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Patient Information */}
              {step === 3 && (
                <div className="space-y-6 card-stagger-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName" className="text-sm font-medium text-foreground">First Name</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                        className="btn-3d mt-2"
                        placeholder="Enter your first name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName" className="text-sm font-medium text-foreground">Last Name</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                        className="btn-3d mt-2"
                        placeholder="Enter your last name"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-sm font-medium text-foreground">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="btn-3d mt-2"
                      placeholder="your.email@example.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone" className="text-sm font-medium text-foreground">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="btn-3d mt-2"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>
              )}

              {/* Step 4: Confirmation */}
              {step === 4 && (
                <div className="space-y-6 card-stagger-4">
                  <div className="bg-muted/30 rounded-xl p-6 space-y-4">
                    <h3 className="font-semibold text-lg text-foreground mb-4">Appointment Summary</h3>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Patient:</span>
                        <span className="font-medium text-foreground">{formData.firstName} {formData.lastName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Service:</span>
                        <span className="font-medium text-foreground">
                          {demoServices.find(s => s.id === formData.service)?.name || 'Not selected'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Dentist:</span>
                        <span className="font-medium text-foreground">
                          {demoDentists.find(d => d.id === formData.dentist)?.name || 'Not selected'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Date & Time:</span>
                        <span className="font-medium text-foreground">{formData.date} at {formData.time}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Location:</span>
                        <span className="font-medium text-foreground">SwiftCare Downtown</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-dental-mint/10 rounded-xl p-4 border border-dental-mint/30">
                    <div className="flex items-start gap-3">
                      <QrCode className="w-5 h-5 text-dental-mint mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-foreground">Check-in Instructions</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          After booking, you'll receive a QR code for easy check-in at the clinic kiosk.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6 border-t border-border/30">
                {step > 1 && (
                  <Button 
                    variant="outline" 
                    onClick={handleBack}
                    className="btn-3d"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                )}
                
                {step < 4 ? (
                  <Button 
                    onClick={handleNext}
                    className="ml-auto btn-3d bg-medical-blue hover:bg-medical-blue-dark"
                    disabled={
                      (step === 1 && (!formData.branch || !formData.service)) ||
                      (step === 2 && (!formData.dentist || !formData.date || !formData.time)) ||
                      (step === 3 && (!formData.firstName || !formData.lastName || !formData.email || !formData.phone))
                    }
                  >
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button 
                    onClick={handleSubmit}
                    className="ml-auto btn-3d bg-success hover:bg-success/90"
                  >
                    Confirm Appointment
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default PatientBooking;