import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Eye, Download, Search, FileText, Clock, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface FormField {
  id: string;
  type: 'text' | 'textarea' | 'checkbox' | 'radio' | 'select' | 'signature';
  label: string;
  required: boolean;
  options?: string[];
  placeholder?: string;
}

interface DigitalForm {
  id: string;
  name: string;
  description?: string;
  form_fields: FormField[];
  is_active: boolean;
  requires_signature: boolean;
  created_at: string;
  updated_at: string;
}

interface FormResponse {
  id: string;
  form_id: string;
  patient_id: string;
  submitted_at: string;
  responses: Record<string, any>;
  form_name: string;
  patient_name: string;
  patient_email: string;
  signature_data?: string;
}

const FormResponses = () => {
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [forms, setForms] = useState<DigitalForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFormFilter, setSelectedFormFilter] = useState<string>('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Mock implementation since the actual tables don't exist in the current schema
      // In a real implementation, you would fetch from digital_forms and patient_form_responses tables
      
      // Mock forms data
      const mockForms: DigitalForm[] = [
        {
          id: '1',
          name: 'Patient Consent Form',
          description: 'Standard consent form for dental procedures',
          form_fields: [
            { id: '1', type: 'text', label: 'Full Name', required: true },
            { id: '2', type: 'checkbox', label: 'I consent to the dental procedure', required: true }
          ],
          is_active: true,
          requires_signature: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Medical History Form',
          description: 'Patient medical history questionnaire',
          form_fields: [
            { id: '3', type: 'text', label: 'Allergies', required: false },
            { id: '4', type: 'textarea', label: 'Current Medications', required: false }
          ],
          is_active: true,
          requires_signature: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      // Mock responses data
      const mockResponses: FormResponse[] = [
        {
          id: '1',
          form_id: '1',
          patient_id: '1',
          submitted_at: new Date().toISOString(),
          responses: {
            'Full Name': 'John Doe',
            'I consent to the dental procedure': true
          },
          form_name: 'Patient Consent Form',
          patient_name: 'John Doe',
          patient_email: 'john.doe@email.com',
          signature_data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=='
        },
        {
          id: '2',
          form_id: '2',
          patient_id: '2',
          submitted_at: new Date(Date.now() - 86400000).toISOString(), // Yesterday
          responses: {
            'Allergies': 'Penicillin',
            'Current Medications': 'Blood pressure medication'
          },
          form_name: 'Medical History Form',
          patient_name: 'Jane Smith',
          patient_email: 'jane.smith@email.com'
        }
      ];

      setForms(mockForms);
      setResponses(mockResponses);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load form responses');
    } finally {
      setLoading(false);
    }
  };

  const getFormById = (formId: string): DigitalForm | undefined => {
    return forms.find(form => form.id === formId);
  };

  const renderFieldValue = (field: FormField, value: any): string => {
    if (value === null || value === undefined) return 'Not provided';
    
    switch (field.type) {
      case 'checkbox':
        return value ? 'Yes' : 'No';
      case 'signature':
        return value ? 'Signed' : 'Not signed';
      default:
        return String(value);
    }
  };

  const exportResponse = (response: FormResponse) => {
    const form = getFormById(response.form_id);
    const exportData = {
      patient: {
        name: response.patient_name,
        email: response.patient_email
      },
      form: {
        name: response.form_name,
        submitted_at: response.submitted_at
      },
      responses: response.responses,
      ...(response.signature_data && { signature: response.signature_data })
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `form-response-${response.patient_name}-${new Date(response.submitted_at).toLocaleDateString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Response exported successfully');
  };

  const filteredResponses = responses.filter(response => {
    const matchesSearch = response.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         response.form_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         response.patient_email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesForm = selectedFormFilter === 'all' || response.form_id === selectedFormFilter;
    
    return matchesSearch && matchesForm;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-medical-blue"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary-600">Form Responses</h1>
          <p className="text-muted-foreground">View and manage submitted digital form responses</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search by patient name, email, or form name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <Select value={selectedFormFilter} onValueChange={setSelectedFormFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by form" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Forms</SelectItem>
                  {forms.map((form) => (
                    <SelectItem key={form.id} value={form.id}>
                      {form.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Responses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResponses.map((response) => {
          const form = getFormById(response.form_id);
          return (
            <Card key={response.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{response.form_name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {response.patient_name}
                    </p>
                  </div>
                  <Badge variant="outline">
                    {new Date(response.submitted_at).toLocaleDateString()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <User className="w-4 h-4 mr-2" />
                    {response.patient_email}
                  </div>
                  
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="w-4 h-4 mr-2" />
                    {new Date(response.submitted_at).toLocaleString()}
                  </div>
                  
                  {response.signature_data && (
                    <div className="flex items-center text-sm text-success">
                      <FileText className="w-4 h-4 mr-2" />
                      Digitally signed
                    </div>
                  )}
                  
                  <div className="flex space-x-2 pt-4">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Eye className="w-4 h-4 mr-1" />
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Form Response Details</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-6">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-medium">Patient Information</h4>
                              <p className="text-sm text-muted-foreground">Name: {response.patient_name}</p>
                              <p className="text-sm text-muted-foreground">Email: {response.patient_email}</p>
                            </div>
                            <div>
                              <h4 className="font-medium">Form Information</h4>
                              <p className="text-sm text-muted-foreground">Form: {response.form_name}</p>
                              <p className="text-sm text-muted-foreground">
                                Submitted: {new Date(response.submitted_at).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-medium mb-3">Responses</h4>
                            <div className="space-y-3">
                              {form?.form_fields.map((field) => (
                                <div key={field.id} className="border rounded-lg p-3">
                                  <div className="flex justify-between items-start mb-2">
                                    <label className="font-medium text-sm">{field.label}</label>
                                    {field.required && (
                                      <Badge variant="secondary" className="text-xs">Required</Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    {renderFieldValue(field, response.responses[field.label])}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          {response.signature_data && (
                            <div>
                              <h4 className="font-medium mb-3">Digital Signature</h4>
                              <div className="border rounded-lg p-4 bg-muted/50">
                                <img 
                                  src={response.signature_data} 
                                  alt="Patient signature" 
                                  className="max-w-full h-20 object-contain"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => exportResponse(response)}
                      className="flex-1"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredResponses.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground mb-2">
            {searchTerm || selectedFormFilter !== 'all' ? 'No matching responses found' : 'No responses yet'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {searchTerm || selectedFormFilter !== 'all' 
              ? 'Try adjusting your search filters' 
              : 'Form responses will appear here once patients start submitting forms'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default FormResponses;