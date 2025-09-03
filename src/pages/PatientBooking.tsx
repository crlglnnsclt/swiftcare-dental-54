import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, Phone, Mail, ArrowLeft, ArrowRight, QrCode, Plus, UserPlus, CalendarPlus, Download, Users, Star, Shield, Heart } from 'lucide-react';
import { BranchSelector } from '@/components/BranchSelector';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { QRCodeSVG } from 'qrcode.react';

// Demo data - 2025 full year appointments for testing
const demoServices = [
  { id: '1', name: 'Routine Checkup & Cleaning', duration: '45 mins', price: '$180', category: 'Preventive' },
  { id: '2', name: 'Deep Cleaning (Scaling)', duration: '60 mins', price: '$250', category: 'Preventive' },
  { id: '3', name: 'Composite Filling', duration: '60 mins', price: '$280', category: 'Restorative' },
  { id: '4', name: 'Root Canal Treatment', duration: '90 mins', price: '$1200', category: 'Endodontic' },
  { id: '5', name: 'Professional Whitening', duration: '75 mins', price: '$450', category: 'Cosmetic' },
  { id: '6', name: 'Crown Placement', duration: '120 mins', price: '$1800', category: 'Restorative' },
  { id: '7', name: 'Tooth Extraction', duration: '30 mins', price: '$350', category: 'Surgical' },
  { id: '8', name: 'Dental Implant', duration: '150 mins', price: '$3500', category: 'Surgical' },
  { id: '9', name: 'Orthodontic Consultation', duration: '60 mins', price: '$200', category: 'Orthodontic' },
  { id: '10', name: 'Emergency Care', duration: '30 mins', price: '$150', category: 'Emergency' }
];

const demoDentists = [
  { 
    id: 'any', 
    name: 'Any Available Dentist', 
    specialty: 'First available slot',
    availableSlots: ['all'],
    rating: 4.9
  },
  { 
    id: '1', 
    name: 'Dr. Sarah Johnson', 
    specialty: 'General & Cosmetic Dentistry',
    availableSlots: ['morning', 'afternoon'],
    rating: 4.9,
    experience: '12 years'
  },
  { 
    id: '2', 
    name: 'Dr. Michael Chen', 
    specialty: 'Orthodontics & Pediatric',
    availableSlots: ['morning', 'evening'],
    rating: 4.8,
    experience: '8 years'
  },
  { 
    id: '3', 
    name: 'Dr. Emily Davis', 
    specialty: 'Endodontics & Root Canal',
    availableSlots: ['afternoon'],
    rating: 5.0,
    experience: '15 years'
  },
  { 
    id: '4', 
    name: 'Dr. James Wilson', 
    specialty: 'Oral Surgery & Implants',
    availableSlots: ['morning'],
    rating: 4.9,
    experience: '20 years'
  }
];

const demoTimeSlots = {
  morning: ['8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM'],
  afternoon: ['1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM'],
  evening: ['5:00 PM', '5:30 PM', '6:00 PM', '6:30 PM', '7:00 PM']
};

// Mock patient authentication
const mockPatient = {
  id: 'P001',
  firstName: 'John',
  lastName: 'Smith',
  email: 'john.smith@email.com',
  phone: '(555) 123-4567',
  isAuthenticated: false, // In real app, check auth state - Set to false to test login screen
  memberSince: '2023',
  upcomingAppointments: 2,
  familyMembers: [
    { id: 'F001', name: 'Jane Smith', relationship: 'Spouse', age: 34 },
    { id: 'F002', name: 'Tommy Smith', relationship: 'Son', age: 8 },
    { id: 'F003', name: 'Emma Smith', relationship: 'Daughter', age: 12 }
  ]
};

function PatientBooking() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isBookingForFamily, setIsBookingForFamily] = useState(false);
  const [selectedFamilyMember, setSelectedFamilyMember] = useState('');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    branch: '',
    service: '',
    dentist: '',
    date: '',
    time: '',
    timeSlot: 'morning',
    firstName: mockPatient.firstName,
    lastName: mockPatient.lastName,
    email: mockPatient.email,
    phone: mockPatient.phone,
    isNewPatient: false,
    patientType: 'self', // 'self' or 'family'
    familyMemberId: ''
  });

  // Auto-populate authenticated patient data
  useEffect(() => {
    if (mockPatient.isAuthenticated && !isBookingForFamily) {
      setFormData(prev => ({
        ...prev,
        firstName: mockPatient.firstName,
        lastName: mockPatient.lastName,
        email: mockPatient.email,
        phone: mockPatient.phone
      }));
    }
  }, [isBookingForFamily]);

  // Update available time slots based on selected dentist
  useEffect(() => {
    if (formData.dentist) {
      const selectedDentist = demoDentists.find(d => d.id === formData.dentist);
      if (selectedDentist) {
        if (selectedDentist.id === 'any') {
          // All slots available for "Any Available"
          setAvailableSlots([
            ...demoTimeSlots.morning,
            ...demoTimeSlots.afternoon,
            ...demoTimeSlots.evening
          ]);
        } else {
          // Filter slots based on dentist availability
          const slots: string[] = [];
          selectedDentist.availableSlots.forEach((period: string) => {
            if (period in demoTimeSlots) {
              slots.push(...demoTimeSlots[period as keyof typeof demoTimeSlots]);
            }
          });
          setAvailableSlots(slots);
        }
      }
    }
  }, [formData.dentist]);

  const handleNext = () => {
    if (step < 5) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleFamilyMemberSelect = (memberId: string) => {
    const member = mockPatient.familyMembers.find(m => m.id === memberId);
    if (member) {
      setFormData(prev => ({
        ...prev,
        firstName: member.name.split(' ')[0],
        lastName: member.name.split(' ')[1] || '',
        familyMemberId: memberId,
        patientType: 'family'
      }));
    }
  };

  const generateQRCode = () => {
    const bookingId = 'APT-2025-' + Math.floor(Math.random() * 10000);
    const qrData = {
      bookingId,
      patientId: mockPatient.id,
      appointmentDate: formData.date,
      appointmentTime: formData.time,
      clinicId: 'SWIFT-001',
      checkInUrl: `https://swiftcare.app/checkin/${bookingId}`
    };
    return JSON.stringify(qrData);
  };

  const generateCalendarEvent = () => {
    const service = demoServices.find(s => s.id === formData.service);
    const dentist = demoDentists.find(d => d.id === formData.dentist);
    
    const startDate = new Date(`${formData.date} ${formData.time}`);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour default
    
    const calendarUrl = `data:text/calendar;charset=utf8,BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//SwiftCare//Dental Appointment//EN
BEGIN:VEVENT
DTSTART:${startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTEND:${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z
SUMMARY:Dental Appointment - ${service?.name}
DESCRIPTION:Appointment with ${dentist?.name} at SwiftCare Dental
LOCATION:SwiftCare Downtown Clinic
END:VEVENT
END:VCALENDAR`;

    const link = document.createElement('a');
    link.href = calendarUrl;
    link.download = 'appointment.ics';
    link.click();
  };

  const handleSubmit = () => {
    // Simulate booking confirmation
    toast({
      title: "Appointment Booked Successfully! 🎉",
      description: "Your QR code has been generated for easy check-in.",
    });
    
    // Navigate to confirmation page with booking details
    navigate('/booking-confirmation', { 
      state: { 
        bookingId: 'APT-2025-' + Math.floor(Math.random() * 10000),
        qrCode: generateQRCode(),
        ...formData 
      } 
    });
  };

  // Check authentication - redirect if not logged in
  if (!mockPatient.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-soft-gray page-container flex items-center justify-center">
        <Card className="card-3d bg-card/80 backdrop-blur-sm border-2 border-border/50 max-w-md mx-auto">
          <CardHeader className="text-center">
            <Shield className="w-16 h-16 mx-auto text-medical-blue mb-4 float-gentle" />
            <CardTitle className="text-2xl font-bold text-foreground">Login Required</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground text-center">
              Please log in to your SwiftCare account to book appointments.
            </p>
            <div className="space-y-3">
              <Button className="w-full btn-3d medical-gradient" onClick={() => navigate('/auth')}>
                Login to SwiftCare
              </Button>
              <Button variant="outline" className="w-full btn-3d" onClick={() => navigate('/')}>
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 page-container">
      {/* Enhanced Header with Patient Info */}
      <div className="bg-card/60 backdrop-blur-md border-b border-border/40 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-medical-blue hover:text-medical-blue-dark smooth-transition">
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Home</span>
            </Link>
            
            <div className="text-center">
              <h1 className="text-xl font-bold text-foreground">Book Appointment</h1>
              <div className="flex items-center gap-2 justify-center mt-1">
                <Heart className="w-4 h-4 text-medical-blue" />
                <span className="text-sm text-muted-foreground">
                  Welcome, {mockPatient.firstName}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                Member since {mockPatient.memberSince}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Enhanced Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-2 md:space-x-4">
            {[
              { num: 1, label: 'Service' },
              { num: 2, label: 'Doctor' },
              { num: 3, label: 'Patient' },
              { num: 4, label: 'Confirm' },
              { num: 5, label: 'Complete' }
            ].map((stepInfo) => (
              <div key={stepInfo.num} className="flex items-center">
                <div className="text-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium smooth-transition ${
                    step >= stepInfo.num 
                      ? 'bg-medical-blue text-white shadow-lg glow-effect' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {stepInfo.num}
                  </div>
                  <span className="text-xs text-muted-foreground mt-1 hidden sm:block">{stepInfo.label}</span>
                </div>
                {stepInfo.num < 5 && (
                  <div className={`w-6 md:w-8 h-0.5 mx-2 smooth-transition ${
                    step > stepInfo.num ? 'bg-medical-blue' : 'bg-muted'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="max-w-2xl mx-auto">
          <Card className="card-3d bg-card/90 backdrop-blur-sm border-2 border-border/40 shadow-lg">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl font-bold text-foreground">
                {step === 1 && "Select Location & Service"}
                {step === 2 && "Choose Doctor & Schedule"}
                {step === 3 && "Patient Information"}
                {step === 4 && "Review Appointment"}
                {step === 5 && "Booking Confirmed"}
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
                      <SelectTrigger className="btn-3d h-auto min-h-[50px]">
                        <SelectValue placeholder="Select treatment type" />
                      </SelectTrigger>
                      <SelectContent className="z-50">
                        {demoServices.map((service) => (
                          <SelectItem key={service.id} value={service.id} className="p-3">
                            <div className="flex justify-between items-center w-full">
                              <div className="flex flex-col items-start">
                                <span className="font-medium">{service.name}</span>
                                <span className="text-xs text-muted-foreground">{service.category}</span>
                              </div>
                              <div className="text-sm text-muted-foreground ml-4">
                                <div>{service.duration}</div>
                                <div className="font-semibold text-medical-blue">{service.price}</div>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Family Booking Toggle */}
                  <div className="bg-dental-mint/10 rounded-xl p-4 border border-dental-mint/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Users className="w-5 h-5 text-dental-mint" />
                        <div>
                          <p className="font-medium text-foreground">Booking for family?</p>
                          <p className="text-sm text-muted-foreground">Book for yourself or a family member</p>
                        </div>
                      </div>
                      <Switch
                        checked={isBookingForFamily}
                        onCheckedChange={setIsBookingForFamily}
                      />
                    </div>
                    
                    {isBookingForFamily && (
                      <div className="mt-4 pt-4 border-t border-dental-mint/20">
                        <Label className="text-sm font-medium text-foreground mb-3 block">Select Family Member</Label>
                        <Select value={selectedFamilyMember} onValueChange={(value) => {
                          setSelectedFamilyMember(value);
                          handleFamilyMemberSelect(value);
                        }}>
                          <SelectTrigger className="btn-3d">
                            <SelectValue placeholder="Choose family member" />
                          </SelectTrigger>
                          <SelectContent className="z-50">
                            {mockPatient.familyMembers.map((member) => (
                              <SelectItem key={member.id} value={member.id}>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{member.name}</span>
                                  <Badge variant="outline" className="text-xs">{member.relationship}</Badge>
                                  <span className="text-xs text-muted-foreground">Age {member.age}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 2: Enhanced Dentist & Date */}
              {step === 2 && (
                <div className="space-y-6 card-stagger-2">
                  <div>
                    <Label className="text-sm font-medium text-foreground mb-3 block">Choose Your Doctor</Label>
                    <Select value={formData.dentist} onValueChange={(dentist) => setFormData({...formData, dentist})}>
                      <SelectTrigger className="btn-3d h-auto min-h-[50px]">
                        <SelectValue placeholder="Select dentist" />
                      </SelectTrigger>
                      <SelectContent className="z-50">
                        {demoDentists.map((dentist) => (
                          <SelectItem key={dentist.id} value={dentist.id} className="p-3">
                            <div className="flex justify-between items-center w-full">
                              <div>
                                <p className="font-medium">{dentist.name}</p>
                                <p className="text-sm text-muted-foreground">{dentist.specialty}</p>
                                {dentist.experience && (
                                  <p className="text-xs text-muted-foreground">{dentist.experience} experience</p>
                                )}
                              </div>
                              <div className="flex items-center gap-1 text-yellow-500">
                                <Star className="w-4 h-4 fill-current" />
                                <span className="text-sm font-medium">{dentist.rating}</span>
                              </div>
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
                      <Label className="text-sm font-medium text-foreground mb-3 block">Available Times</Label>
                      <Select value={formData.time} onValueChange={(time) => setFormData({...formData, time})}>
                        <SelectTrigger className="btn-3d">
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                        <SelectContent className="z-50">
                          {availableSlots.map((slot) => (
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
                  <div className="bg-muted/20 rounded-xl p-4 border border-border/30">
                    <p className="text-sm text-muted-foreground text-center">
                      {isBookingForFamily ? 
                        `Booking for: ${formData.firstName} ${formData.lastName}` : 
                        'Booking for yourself'
                      }
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName" className="text-sm font-medium text-foreground">First Name</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                        className="btn-3d mt-2"
                        placeholder="First name"
                        disabled={!isBookingForFamily}
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName" className="text-sm font-medium text-foreground">Last Name</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                        className="btn-3d mt-2"
                        placeholder="Last name"
                        disabled={!isBookingForFamily}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-sm font-medium text-foreground">Contact Email</Label>
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

              {/* Step 4: Enhanced Confirmation */}
              {step === 4 && (
                <div className="space-y-6 card-stagger-4">
                  <div className="bg-gradient-to-br from-muted/20 to-muted/40 rounded-2xl p-6 space-y-4">
                    <h3 className="font-semibold text-xl text-foreground mb-6 text-center">Appointment Summary</h3>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Patient:</span>
                        <span className="font-medium text-foreground">{formData.firstName} {formData.lastName}</span>
                      </div>
                      <Separator />
                      
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Treatment:</span>
                        <div className="text-right">
                          <div className="font-medium text-foreground">
                            {demoServices.find(s => s.id === formData.service)?.name}
                          </div>
                          <div className="text-sm text-medical-blue font-semibold">
                            {demoServices.find(s => s.id === formData.service)?.price}
                          </div>
                        </div>
                      </div>
                      <Separator />
                      
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Doctor:</span>
                        <div className="text-right">
                          <div className="font-medium text-foreground">
                            {demoDentists.find(d => d.id === formData.dentist)?.name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {demoDentists.find(d => d.id === formData.dentist)?.specialty}
                          </div>
                        </div>
                      </div>
                      <Separator />
                      
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Date & Time:</span>
                        <div className="text-right">
                          <div className="font-medium text-foreground">{formData.date}</div>
                          <div className="text-sm text-medical-blue font-semibold">{formData.time}</div>
                        </div>
                      </div>
                      <Separator />
                      
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Location:</span>
                        <span className="font-medium text-foreground">SwiftCare Downtown</span>
                      </div>
                    </div>
                  </div>

                  {/* QR Code Preview */}
                  <div className="bg-gradient-to-br from-dental-mint/10 to-dental-mint/20 rounded-xl p-6 border border-dental-mint/30">
                    <div className="text-center">
                      <div className="bg-white p-4 rounded-lg inline-block mb-4">
                        <QRCodeSVG 
                          value={generateQRCode()} 
                          size={120}
                          level="M"
                          includeMargin={false}
                        />
                      </div>
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <QrCode className="w-5 h-5 text-dental-mint" />
                        <p className="font-medium text-foreground">Your Check-in QR Code</p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Scan this code at our kiosk for instant check-in
                      </p>
                    </div>
                  </div>

                  {/* Calendar Integration */}
                  <Button 
                    variant="outline" 
                    className="w-full btn-3d" 
                    onClick={generateCalendarEvent}
                  >
                    <CalendarPlus className="w-4 h-4 mr-2" />
                    Add to Calendar
                  </Button>
                </div>
              )}

              {/* Step 5: Booking Complete */}
              {step === 5 && (
                <div className="space-y-6 card-stagger-1 text-center">
                  <div className="w-20 h-20 bg-success rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-foreground">Appointment Booked! 🎉</h3>
                  <p className="text-muted-foreground">
                    Your appointment has been confirmed. You'll receive an email confirmation shortly.
                  </p>

                  <div className="space-y-3">
                    <Button className="w-full btn-3d medical-gradient" onClick={() => navigate('/patient-dashboard')}>
                      View My Dashboard
                    </Button>
                    <Button variant="outline" className="w-full btn-3d" onClick={() => navigate('/')}>
                      Back to Home
                    </Button>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              {step < 5 && (
                <div className="flex justify-between pt-6 border-t border-border/20">
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
                      className="ml-auto btn-3d medical-gradient"
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
                      className="ml-auto btn-3d bg-success hover:bg-success/90 text-white"
                    >
                      Confirm Appointment
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default PatientBooking;