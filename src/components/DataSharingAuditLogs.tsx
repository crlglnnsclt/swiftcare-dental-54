import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';
import { 
  Shield, 
  Filter, 
  Download,
  Eye,
  Edit,
  Plus,
  Trash2,
  AlertTriangle,
  FileText,
  Calendar,
  User,
  Building2
} from 'lucide-react';

interface AuditLog {
  id: string;
  user_id?: string;
  source_branch_id: string;
  target_branch_id: string;
  data_type: string;
  data_id?: string;
  action_type: string;
  sharing_group_id?: string;
  ip_address?: string | null;
  user_agent?: string;
  created_at: string;
  users?: {
    full_name: string;
    email: string;
  };
  source_clinic?: {
    clinic_name: string;
  };
  target_clinic?: {
    clinic_name: string;
  };
}

export function DataSharingAuditLogs() {
  const { profile } = useAuth();
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    dataType: 'all',
    actionType: 'all',
    dateFrom: '',
    dateTo: '',
    searchUser: ''
  });

  const fetchAuditLogs = async () => {
    if (!profile) return;

    try {
      let query = supabase
        .from('data_sharing_audit')
        .select(`
          *,
          source_clinic:clinics!source_branch_id (
            clinic_name
          ),
          target_clinic:clinics!target_branch_id (
            clinic_name
          )
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      // Apply filters
      if (filters.dataType && filters.dataType !== 'all') {
        query = query.eq('data_type', filters.dataType);
      }
      if (filters.actionType && filters.actionType !== 'all') {
        query = query.eq('action_type', filters.actionType);
      }
      if (filters.dateFrom) {
        query = query.gte('created_at', filters.dateFrom);
      }
      if (filters.dateTo) {
        query = query.lte('created_at', filters.dateTo + 'T23:59:59');
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching audit logs:', error);
        return;
      }

      let filteredData = data || [];

      // Apply user search filter (search by user_id since we don't have user data)
      if (filters.searchUser) {
        filteredData = filteredData.filter(log =>
          log.user_id?.toLowerCase().includes(filters.searchUser.toLowerCase())
        );
      }

      setAuditLogs(filteredData as AuditLog[]);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile?.role === 'clinic_admin' || profile?.role === 'super_admin') {
      fetchAuditLogs();
    } else {
      setLoading(false);
    }
  }, [profile, filters]);

  const exportAuditLogs = () => {
    const csvContent = [
      ['Date', 'User', 'Source Branch', 'Target Branch', 'Data Type', 'Action', 'IP Address'].join(','),
      ...auditLogs.map(log => [
        new Date(log.created_at).toLocaleString(),
        log.user_id || 'Unknown',
        log.source_clinic?.clinic_name || 'Unknown',
        log.target_clinic?.clinic_name || 'Unknown',
        log.data_type,
        log.action_type,
        log.ip_address || 'N/A'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `data-sharing-audit-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'view': return <Eye className="w-4 h-4" />;
      case 'create': return <Plus className="w-4 h-4" />;
      case 'update': return <Edit className="w-4 h-4" />;
      case 'delete': return <Trash2 className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'view': return 'default';
      case 'create': return 'default';
      case 'update': return 'secondary';
      case 'delete': return 'destructive';
      default: return 'outline';
    }
  };

  if (profile?.role !== 'clinic_admin' && profile?.role !== 'super_admin') {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Only clinic administrators and super administrators can view data sharing audit logs.
        </AlertDescription>
      </Alert>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading audit logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Data Sharing Audit Logs</h1>
          <p className="text-muted-foreground">
            Monitor and track all data sharing activities across clinic branches
          </p>
        </div>
        <Button onClick={exportAuditLogs} disabled={auditLogs.length === 0}>
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
          <CardDescription>
            Filter audit logs by data type, action, date range, and user
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="dataType">Data Type</Label>
              <Select value={filters.dataType} onValueChange={(value) => setFilters(prev => ({ ...prev, dataType: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="patient">Patient</SelectItem>
                  <SelectItem value="appointment">Appointment</SelectItem>
                  <SelectItem value="invoice">Invoice</SelectItem>
                  <SelectItem value="inventory">Inventory</SelectItem>
                  <SelectItem value="treatment">Treatment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="actionType">Action Type</Label>
              <Select value={filters.actionType} onValueChange={(value) => setFilters(prev => ({ ...prev, actionType: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All actions</SelectItem>
                  <SelectItem value="view">View</SelectItem>
                  <SelectItem value="create">Create</SelectItem>
                  <SelectItem value="update">Update</SelectItem>
                  <SelectItem value="delete">Delete</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="dateFrom">From Date</Label>
              <Input
                id="dateFrom"
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="dateTo">To Date</Label>
              <Input
                id="dateTo"
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="searchUser">Search User ID</Label>
              <Input
                id="searchUser"
                placeholder="Search by user ID"
                value={filters.searchUser}
                onChange={(e) => setFilters(prev => ({ ...prev, searchUser: e.target.value }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Audit Trail ({auditLogs.length} records)
          </CardTitle>
          <CardDescription>
            Recent data sharing activities across your clinic network
          </CardDescription>
        </CardHeader>
        <CardContent>
          {auditLogs.length === 0 ? (
            <div className="text-center py-8">
              <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No audit logs found matching your criteria.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {auditLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {getActionIcon(log.action_type)}
                      <Badge variant={getActionColor(log.action_type) as any}>
                        {log.action_type.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{log.user_id || 'Unknown User'}</span>
                        <span className="text-sm text-muted-foreground">
                          accessed {log.data_type} data
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          <span>From: {log.source_clinic?.clinic_name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          <span>To: {log.target_clinic?.clinic_name}</span>
                        </div>
                        {log.ip_address && (
                          <span>IP: {log.ip_address}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(log.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}