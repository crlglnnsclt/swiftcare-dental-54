import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, User, Calendar, Download, Search, Filter } from 'lucide-react';
import { toast } from 'sonner';

interface FormField {
  id: string;
  type: 'text' | 'textarea' | 'checkbox' | 'select' | 'signature';
  label: string;
  required: boolean;
  options?: string[];
}

interface DigitalForm {
  id: string;
  name: string;
  description?: string;
  form_fields: FormField[];
  requires_signature: boolean;
}

interface FormResponse {
  id: string;
  form_id: string;
  patient_id: string;
  responses: Record<string, any>;
  signature_data?: string;
  submitted_at: string;
  branch_id?: string;
  // Joined data
  form_name?: string;
  patient_name?: string;
  patient_email?: string;
}

export function FormResponses() {
  const { profile } = useAuth();
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [forms, setForms] = useState<DigitalForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedResponse, setSelectedResponse] = useState<FormResponse | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFormFilter, setSelectedFormFilter] = useState<string>('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch forms
      const { data: formsData, error: formsError } = await supabase
        .from('digital_forms')
        .select('*')
        .order('name');

      if (formsError) throw formsError;
      setForms((formsData || []).map(form => ({
        ...form,
        form_fields: form.form_fields as unknown as FormField[]
      })));

      // Fetch responses with patient information
      const { data: responsesData, error: responsesError } = await supabase
        .from('patient_form_responses')
        .select(`
          *,
          digital_forms!inner(name),
          profiles!inner(full_name, email)
        `)
        .order('submitted_at', { ascending: false });

      if (responsesError) throw responsesError;

      const formattedResponses = responsesData?.map(response => ({
        ...response,
        responses: response.responses as Record<string, any>,
        form_name: response.digital_forms?.name,
        patient_name: response.profiles?.full_name,
        patient_email: response.profiles?.email,
      })) || [];

      setResponses(formattedResponses);
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
        return '[Digital Signature]';
      default:
        return String(value);
    }
  };

  const exportResponse = async (response: FormResponse) => {
    const form = getFormById(response.form_id);
    if (!form) return;

    const exportData = {
      formName: form.name,
      patientName: response.patient_name,
      patientEmail: response.patient_email,
      submittedAt: new Date(response.submitted_at).toLocaleString(),
      responses: {},
    };

    // Format responses
    form.form_fields.forEach(field => {
      const value = response.responses[field.id];
      exportData.responses[field.label] = renderFieldValue(field, value);
    });

    // Create and download JSON file
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `form-response-${response.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Response exported successfully');
  };

  const filteredResponses = responses.filter(response => {
    const matchesSearch = !searchTerm || 
      response.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      response.patient_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      response.form_name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesForm = selectedFormFilter === 'all' || response.form_id === selectedFormFilter;

    return matchesSearch && matchesForm;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-pulse text-muted-foreground mb-4">Loading form responses...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Form Responses</h1>
          <p className="text-muted-foreground">View and manage patient form submissions</p>
        </div>
        <Badge variant="secondary" className="text-lg px-3 py-1">
          {filteredResponses.length} responses
        </Badge>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Label htmlFor="search" className="sr-only">Search</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Search by patient name, email, or form name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <Label htmlFor="formFilter" className="sr-only">Filter by form</Label>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <select
                id="formFilter"
                value={selectedFormFilter}
                onChange={(e) => setSelectedFormFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background text-foreground"
              >
                <option value="all">All Forms</option>
                {forms.map(form => (
                  <option key={form.id} value={form.id}>{form.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Responses Grid */}
      <div className="grid gap-4">
        {filteredResponses.map((response) => {
          const form = getFormById(response.form_id);
          
          return (
            <Card key={response.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-primary" />
                      {response.form_name}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4 mt-2">
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {response.patient_name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(response.submitted_at).toLocaleDateString()}
                      </span>
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedResponse(response)}
                        >
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>{response.form_name} - Response</DialogTitle>
                          <DialogDescription>
                            Submitted by {response.patient_name} on {new Date(response.submitted_at).toLocaleDateString()}
                          </DialogDescription>
                        </DialogHeader>
                        
                        {form && (
                          <div className="space-y-4">
                            {form.form_fields.map((field) => {
                              const value = response.responses[field.id];
                              
                              return (
                                <div key={field.id} className="space-y-2">
                                  <Label className="font-medium">{field.label}</Label>
                                  {field.type === 'signature' && value ? (
                                    <div className="border rounded-lg p-4 bg-white">
                                      <img 
                                        src={value} 
                                        alt="Digital Signature" 
                                        className="max-w-full h-auto border rounded"
                                      />
                                    </div>
                                  ) : (
                                    <div className="p-3 bg-muted rounded-md">
                                      {renderFieldValue(field, value)}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                            
                            {form.requires_signature && response.signature_data && (
                              <div className="space-y-2">
                                <Label className="font-medium">Form Signature</Label>
                                <div className="border rounded-lg p-4 bg-white">
                                  <img 
                                    src={response.signature_data} 
                                    alt="Form Signature" 
                                    className="max-w-full h-auto border rounded"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => exportResponse(response)}
                      className="flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  <p><strong>Patient Email:</strong> {response.patient_email}</p>
                  <p><strong>Fields Completed:</strong> {form ? form.form_fields.length : 'Unknown'}</p>
                  <p><strong>Signature:</strong> {response.signature_data ? 'Provided' : 'Not required'}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredResponses.length === 0 && (
        <Card className="text-center p-12">
          <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Form Responses</h3>
          <p className="text-muted-foreground">
            {searchTerm || selectedFormFilter !== 'all' 
              ? 'No responses match your current filters.' 
              : 'No patients have submitted forms yet.'
            }
          </p>
        </Card>
      )}
    </div>
  );
}