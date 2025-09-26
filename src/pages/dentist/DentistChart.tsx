'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { DashboardLayout } from '@/components/DashboardLayout'
import InteractiveDentalChart from '@/components/InteractiveDentalChart'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import {
  Activity,
  FileText,
  Calendar,
  User,
  Phone,
  Mail,
  MapPin,
  Clock,
  Plus,
  Edit,
  Save,
  X,
  AlertTriangle,
  CheckCircle2,
  Camera,
  Stethoscope,
  Heart,
  Shield,
  TrendingUp,
  Target,
  Search,
  Filter
} from 'lucide-react'

interface Patient {
  id: string
  patientNumber: string
  user: {
    firstName: string
    lastName: string
    email: string
    phone?: string
  }
  dateOfBirth: string
  gender?: string
  address?: string
  allergies?: string
  medicalHistory?: string
  insuranceProvider?: string
}

interface DentalRecord {
  id: string
  recordDate: string
  chiefComplaint?: string
  diagnosis?: string
  recommendedTreatment?: string
  notes?: string
  patient: Patient
  dentist?: {
    user: {
      firstName: string
      lastName: string
    }
  }
}

export default function DentistChart() {
  const [searchParams] = useSearchParams()
  const patientId = searchParams.get('patientId') || 'P-2024-0001' // Default patient for demo
  const { toast } = useToast()

  // State
  const [patient, setPatient] = useState<Patient | null>(null)
  const [dentalRecord, setDentalRecord] = useState<DentalRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCreateRecordDialog, setShowCreateRecordDialog] = useState(false)
  const [editMode, setEditMode] = useState(false)

  // Form state for dental record
  const [recordForm, setRecordForm] = useState({
    chiefComplaint: '',
    historyOfPresentIllness: '',
    medicalHistory: '',
    dentalHistory: '',
    socialHistory: '',
    extraOralExam: '',
    intraOralExam: '',
    diagnosis: '',
    prognosis: '',
    recommendedTreatment: '',
    notes: ''
  })

  // Load patient and dental record
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Create mock patient data for demonstration
        const isAliceJohnson = patientId === 'P-2024-0001'
        const mockPatient = {
          id: patientId,
          patientNumber: isAliceJohnson ? 'P-2024-0001' : `PAT-${patientId.slice(-6)}`,
          dateOfBirth: isAliceJohnson ? '1990-03-15' : '1985-06-15',
          gender: isAliceJohnson ? 'Female' : 'Male',
          address: isAliceJohnson ? '456 Oak Avenue, Makati City' : '123 Main Street',
          city: 'Metro Manila',
          allergies: isAliceJohnson ? 'Latex, Aspirin' : 'Penicillin',
          medicalHistory: isAliceJohnson ? 'Asthma, well controlled' : 'Hypertension, controlled with medication',
          insuranceProvider: 'PhilHealth',
          user: {
            firstName: isAliceJohnson ? 'Alice' : 'John',
            lastName: isAliceJohnson ? 'Johnson' : 'Doe',
            email: isAliceJohnson ? 'alice.johnson@email.com' : 'john.doe@email.com',
            phone: isAliceJohnson ? '+63 917 555 0123' : '+63 912 345 6789'
          }
        }
        
        // Set patient data
        setPatient(mockPatient)

        // Create mock dental record with the patient data
        const mockRecord = {
          id: `mock-record-${patientId}`,
          patientId,
          recordDate: new Date().toISOString(),
          chiefComplaint: isAliceJohnson ? "Lower left molar pain when chewing" : "Routine checkup and cleaning",
          historyOfPresentIllness: isAliceJohnson ? "Pain started 3 days ago, worse with cold drinks" : "No current issues",
          medicalHistory: isAliceJohnson ? "Asthma, well controlled with inhaler" : "Hypertension, controlled with medication",
          dentalHistory: isAliceJohnson ? "Last cleaning 8 months ago, no previous major dental work" : "Regular cleanings, one filling 2 years ago",
          socialHistory: isAliceJohnson ? "Non-smoker, occasional wine" : "Non-smoker, social drinker",
          extraOralExam: isAliceJohnson ? "No lymphadenopathy, TMJ normal" : "Normal extraoral examination",
          intraOralExam: isAliceJohnson ? "Generalized plaque buildup, inflammation around #19" : "Good oral hygiene, minor plaque",
          diagnosis: isAliceJohnson ? "Acute pulpitis, tooth #19; Gingivitis (localized)" : "Good oral health, minor plaque buildup",
          prognosis: isAliceJohnson ? "Good with prompt treatment" : "Excellent with continued care",
          recommendedTreatment: isAliceJohnson ? "Root canal therapy #19, professional cleaning, oral hygiene instruction" : "Professional cleaning, continue regular oral hygiene",
          notes: isAliceJohnson ? "Patient reports severe pain #19, requires urgent treatment. Consider antibiotic pre-medication due to asthma." : "Patient reports no pain or sensitivity. Last cleaning 6 months ago.",
          patient: mockPatient,
          dentist: {
            user: {
              firstName: "Dr. Sarah",
              lastName: "Smith"
            }
          }
        }

        // Set dental record and form data
        setDentalRecord(mockRecord)
        setRecordForm({
          chiefComplaint: mockRecord.chiefComplaint || '',
          historyOfPresentIllness: mockRecord.historyOfPresentIllness || '',
          medicalHistory: mockRecord.medicalHistory || '',
          dentalHistory: mockRecord.dentalHistory || '',
          socialHistory: mockRecord.socialHistory || '',
          extraOralExam: mockRecord.extraOralExam || '',
          intraOralExam: mockRecord.intraOralExam || '',
          diagnosis: mockRecord.diagnosis || '',
          prognosis: mockRecord.prognosis || '',
          recommendedTreatment: mockRecord.recommendedTreatment || '',
          notes: mockRecord.notes || ''
        })
        
      } catch (error) {
        console.error('Error fetching patient data:', error)
        toast({
          title: "Error",
          description: "Failed to load patient data",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [patientId, toast])

  // Create new dental record
  const handleCreateRecord = async () => {
    try {
      // Mock creation for demo
      const newRecord = {
        id: `new-record-${Date.now()}`,
        patientId,
        recordDate: new Date().toISOString(),
        patient: patient!,
        dentist: {
          user: {
            firstName: "Dr. Sarah",
            lastName: "Smith"
          }
        },
        ...recordForm
      }

      setDentalRecord(newRecord)
      setShowCreateRecordDialog(false)
      toast({
        title: "Success",
        description: "Dental record created successfully"
      })
    } catch (error) {
      console.error('Error creating dental record:', error)
      toast({
        title: "Error",
        description: "Failed to create dental record",
        variant: "destructive"
      })
    }
  }

  // Update dental record
  const handleUpdateRecord = async () => {
    if (!dentalRecord) return

    try {
      // Mock update for demo
      const updatedRecord = {
        ...dentalRecord,
        ...recordForm
      }
      
      setDentalRecord(updatedRecord)
      setEditMode(false)
      toast({
        title: "Success",
        description: "Dental record updated successfully"
      })
    } catch (error) {
      console.error('Error updating dental record:', error)
      toast({
        title: "Error",
        description: "Failed to update dental record",
        variant: "destructive"
      })
    }
  }

  // Handle procedure addition
  const handleProcedureAdd = (toothNumber: string) => {
    toast({
      title: "Add Procedure",
      description: `Adding procedure for tooth #${toothNumber}`,
    })
  }

  if (loading) {
    return (
      <DashboardLayout title="Dental Chart" showStats={false}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Dental Chart" showStats={false}>
      <div className="space-y-6">
        {/* Patient Header */}
        {patient && (
          <Card>
            <CardHeader>
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">
                      {patient.user.firstName} {patient.user.lastName}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Patient #{patient.patientNumber} • DOB: {new Date(patient.dateOfBirth).toLocaleDateString()}
                    </CardDescription>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                      {patient.user.phone && (
                        <div className="flex items-center space-x-1">
                          <Phone className="w-4 h-4" />
                          <span>{patient.user.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-1">
                        <Mail className="w-4 h-4" />
                        <span>{patient.user.email}</span>
                      </div>
                      {patient.gender && (
                        <Badge variant="outline">{patient.gender}</Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule
                  </Button>
                  <Button variant="outline" size="sm">
                    <Camera className="w-4 h-4 mr-2" />
                    Images
                  </Button>
                  <Button variant="outline" size="sm">
                    <FileText className="w-4 h-4 mr-2" />
                    Reports
                  </Button>
                </div>
              </div>
            </CardHeader>

            {/* Patient Medical Info */}
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <Heart className="w-4 h-4 text-red-500" />
                  <div>
                    <p className="text-sm font-medium">Allergies</p>
                    <p className="text-xs text-muted-foreground">{patient.allergies || 'None reported'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Stethoscope className="w-4 h-4 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium">Medical History</p>
                    <p className="text-xs text-muted-foreground">{patient.medicalHistory || 'None reported'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-green-500" />
                  <div>
                    <p className="text-sm font-medium">Insurance</p>
                    <p className="text-xs text-muted-foreground">{patient.insuranceProvider || 'None'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        <Tabs defaultValue="chart" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="chart">Dental Chart</TabsTrigger>
            <TabsTrigger value="clinical">Clinical Notes</TabsTrigger>
            <TabsTrigger value="treatment">Treatment Plans</TabsTrigger>
            <TabsTrigger value="procedures">Procedures</TabsTrigger>
            <TabsTrigger value="images">Images & X-rays</TabsTrigger>
          </TabsList>

          {/* Dental Chart Tab */}
          <TabsContent value="chart" className="space-y-6">
            {dentalRecord && (
              <InteractiveDentalChart />
            )}
          </TabsContent>

          {/* Clinical Notes Tab */}
          <TabsContent value="clinical" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="w-5 h-5" />
                    <span>Clinical Documentation</span>
                  </CardTitle>
                  {dentalRecord && !editMode && (
                    <Button onClick={() => setEditMode(true)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  )}
                  {editMode && (
                    <div className="flex items-center space-x-2">
                      <Button onClick={handleUpdateRecord}>
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                      <Button variant="outline" onClick={() => setEditMode(false)}>
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {dentalRecord ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="chiefComplaint">Chief Complaint</Label>
                        {editMode ? (
                          <Textarea
                            id="chiefComplaint"
                            value={recordForm.chiefComplaint}
                            onChange={(e) => setRecordForm(prev => ({ ...prev, chiefComplaint: e.target.value }))}
                            placeholder="Patient's primary concern..."
                            rows={3}
                          />
                        ) : (
                          <p className="text-foreground bg-muted/50 p-3 rounded border">
                            {dentalRecord.chiefComplaint || 'Not documented'}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="diagnosis">Diagnosis</Label>
                        {editMode ? (
                          <Textarea
                            id="diagnosis"
                            value={recordForm.diagnosis}
                            onChange={(e) => setRecordForm(prev => ({ ...prev, diagnosis: e.target.value }))}
                            placeholder="Clinical diagnosis..."
                            rows={3}
                          />
                        ) : (
                          <p className="text-foreground bg-muted/50 p-3 rounded border">
                            {dentalRecord.diagnosis || 'Not documented'}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="extraOralExam">Extra-oral Examination</Label>
                        {editMode ? (
                          <Textarea
                            id="extraOralExam"
                            value={recordForm.extraOralExam}
                            onChange={(e) => setRecordForm(prev => ({ ...prev, extraOralExam: e.target.value }))}
                            placeholder="Extra-oral findings..."
                            rows={3}
                          />
                        ) : (
                          <p className="text-foreground bg-muted/50 p-3 rounded border">
                            {recordForm.extraOralExam || 'Not documented'}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="recommendedTreatment">Recommended Treatment</Label>
                        {editMode ? (
                          <Textarea
                            id="recommendedTreatment"
                            value={recordForm.recommendedTreatment}
                            onChange={(e) => setRecordForm(prev => ({ ...prev, recommendedTreatment: e.target.value }))}
                            placeholder="Treatment recommendations..."
                            rows={3}
                          />
                        ) : (
                          <p className="text-foreground bg-muted/50 p-3 rounded border">
                            {dentalRecord.recommendedTreatment || 'Not documented'}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="prognosis">Prognosis</Label>
                        {editMode ? (
                          <Textarea
                            id="prognosis"
                            value={recordForm.prognosis}
                            onChange={(e) => setRecordForm(prev => ({ ...prev, prognosis: e.target.value }))}
                            placeholder="Treatment prognosis..."
                            rows={3}
                          />
                        ) : (
                          <p className="text-foreground bg-muted/50 p-3 rounded border">
                            {recordForm.prognosis || 'Not documented'}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="intraOralExam">Intra-oral Examination</Label>
                        {editMode ? (
                          <Textarea
                            id="intraOralExam"
                            value={recordForm.intraOralExam}
                            onChange={(e) => setRecordForm(prev => ({ ...prev, intraOralExam: e.target.value }))}
                            placeholder="Intra-oral findings..."
                            rows={3}
                          />
                        ) : (
                          <p className="text-foreground bg-muted/50 p-3 rounded border">
                            {recordForm.intraOralExam || 'Not documented'}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="lg:col-span-2">
                      <div>
                        <Label htmlFor="notes">Additional Notes</Label>
                        {editMode ? (
                          <Textarea
                            id="notes"
                            value={recordForm.notes}
                            onChange={(e) => setRecordForm(prev => ({ ...prev, notes: e.target.value }))}
                            placeholder="Additional clinical notes..."
                            rows={4}
                          />
                        ) : (
                          <p className="text-foreground bg-muted/50 p-3 rounded border">
                            {dentalRecord.notes || 'No additional notes'}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">No Clinical Record</h3>
                    <p className="text-muted-foreground mb-4">Create a dental record to start documenting clinical findings.</p>
                    <Button onClick={() => setShowCreateRecordDialog(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Record
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Treatment Plans Tab */}
          <TabsContent value="treatment" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="w-5 h-5" />
                  <span>Treatment Plans</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">Treatment Plan Management</h3>
                  <p className="text-muted-foreground">Comprehensive treatment planning system coming soon.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Procedures Tab */}
          <TabsContent value="procedures" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="w-5 h-5" />
                  <span>Procedure History</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">Procedure Management</h3>
                  <p className="text-muted-foreground">Detailed procedure tracking and management coming soon.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Images Tab */}
          <TabsContent value="images" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Camera className="w-5 h-5" />
                  <span>Images & X-rays</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Camera className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">Image Management</h3>
                  <p className="text-muted-foreground">Digital image and X-ray management system coming soon.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Record Dialog */}
      <Dialog open={showCreateRecordDialog} onOpenChange={setShowCreateRecordDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Dental Record</DialogTitle>
            <DialogDescription>
              Create a new dental record for {patient?.user.firstName} {patient?.user.lastName}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="chiefComplaint">Chief Complaint</Label>
              <Textarea
                id="chiefComplaint"
                value={recordForm.chiefComplaint}
                onChange={(e) => setRecordForm(prev => ({ ...prev, chiefComplaint: e.target.value }))}
                placeholder="Patient's primary concern..."
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="diagnosis">Initial Diagnosis</Label>
              <Textarea
                id="diagnosis"
                value={recordForm.diagnosis}
                onChange={(e) => setRecordForm(prev => ({ ...prev, diagnosis: e.target.value }))}
                placeholder="Clinical diagnosis..."
                rows={3}
              />
            </div>
            <div className="lg:col-span-2">
              <Label htmlFor="recommendedTreatment">Recommended Treatment</Label>
              <Textarea
                id="recommendedTreatment"
                value={recordForm.recommendedTreatment}
                onChange={(e) => setRecordForm(prev => ({ ...prev, recommendedTreatment: e.target.value }))}
                placeholder="Treatment recommendations..."
                rows={3}
              />
            </div>
            <div className="lg:col-span-2">
              <Label htmlFor="notes">Initial Notes</Label>
              <Textarea
                id="notes"
                value={recordForm.notes}
                onChange={(e) => setRecordForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Initial clinical notes..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateRecordDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateRecord}>
              Create Record
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}