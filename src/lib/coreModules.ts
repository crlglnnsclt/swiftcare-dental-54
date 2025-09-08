
// SwiftCare Core Modules - Always Running in Background
import { supabase } from '@/integrations/supabase/client';
import { AppointmentStatus, Appointment } from '@/types/swiftcare';

class CoreModuleManager {
  private static instance: CoreModuleManager;
  private modules: Map<string, CoreModule> = new Map();
  private isInitialized = false;

  private constructor() {}

  static getInstance(): CoreModuleManager {
    if (!CoreModuleManager.instance) {
      CoreModuleManager.instance = new CoreModuleManager();
    }
    return CoreModuleManager.instance;
  }

  async initialize() {
    if (this.isInitialized) return;

    // Initialize core modules - these always run regardless of UI visibility
    this.modules.set('appointment_management', new AppointmentManagementModule());
    this.modules.set('queueing_system', new QueueingSystemModule());
    this.modules.set('paperless_workflow', new PaperlessWorkflowModule());
    this.modules.set('analytics', new AnalyticsModule());

    // Start all modules
    for (const [name, module] of this.modules) {
      await module.start();
      console.log(`Core module ${name} started`);
    }

    this.isInitialized = true;
  }

  getModule(name: string): CoreModule | undefined {
    return this.modules.get(name);
  }

  // UI visibility doesn't affect background functionality
  setUIVisibility(moduleName: string, visible: boolean) {
    // This only affects UI display, modules keep running
    console.log(`Module ${moduleName} UI visibility set to ${visible}`);
  }
}

abstract class CoreModule {
  protected isRunning = false;
  
  abstract start(): Promise<void>;
  abstract stop(): Promise<void>;
  abstract getName(): string;
}

// 1️⃣ Appointment Management Module (Always Running)
class AppointmentManagementModule extends CoreModule {
  private noShowCheckInterval?: NodeJS.Timeout;

  getName(): string {
    return 'Appointment Management';
  }

  async start(): Promise<void> {
    if (this.isRunning) return;
    
    this.isRunning = true;
    
    // Check for no-shows every minute
    this.noShowCheckInterval = setInterval(() => {
      this.checkForNoShows();
    }, 60000); // 1 minute
  }

  async stop(): Promise<void> {
    if (this.noShowCheckInterval) {
      clearInterval(this.noShowCheckInterval);
    }
    this.isRunning = false;
  }

  // Handle appointment status transitions
  async updateAppointmentStatus(appointmentId: string, status: AppointmentStatus, userId?: string): Promise<boolean> {
    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString()
      };

      // Add timestamp fields based on status
      switch (status) {
        case 'checked_in':
          updateData.checked_in_at = new Date().toISOString();
          break;
        case 'in_procedure':
          updateData.procedure_started_at = new Date().toISOString();
          break;
        case 'completed':
          updateData.completed_at = new Date().toISOString();
          break;
        case 'cancelled':
          updateData.cancelled_at = new Date().toISOString();
          break;
      }

      const { error } = await supabase
        .from('appointments')
        .update(updateData)
        .eq('id', appointmentId);

      if (error) throw error;

      // Update queue if needed
      if (status === 'checked_in') {
        await this.addToQueue(appointmentId);
      }

      return true;
    } catch (error) {
      console.error('Error updating appointment status:', error);
      return false;
    }
  }

  // Check for no-shows (15-minute grace period)
  private async checkForNoShows() {
    try {
      const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
      
      const { data: appointments, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('status', 'scheduled')
        .lt('scheduled_time', fifteenMinutesAgo);

      if (error) throw error;

      for (const appointment of appointments || []) {
        await this.updateAppointmentStatus(appointment.id, 'cancelled');
        
        // Log as no-show
        await supabase
          .from('appointments')
          .update({
            cancellation_reason: 'No-show (15-minute grace period expired)',
            no_show_grace_period: true
          })
          .eq('id', appointment.id);
      }
    } catch (error) {
      console.error('Error checking for no-shows:', error);
    }
  }

  private async addToQueue(appointmentId: string) {
    try {
      const { data: appointment } = await supabase
        .from('appointments')
        .select('*')
        .eq('id', appointmentId)
        .single();

      if (appointment) {
        await supabase
          .from('queue')
          .insert({
            patient_id: appointment.patient_id,
            appointment_id: appointmentId,
            queue_type: 'appointment',
            priority: 'medium',
            status: 'waiting',
            checked_in_at: new Date().toISOString()
          });
      }
    } catch (error) {
      console.error('Error adding to queue:', error);
    }
  }
}

// 2️⃣ Queueing System Module (Always Running)
class QueueingSystemModule extends CoreModule {
  private queueUpdateInterval?: NodeJS.Timeout;

  getName(): string {
    return 'Queueing System';
  }

  async start(): Promise<void> {
    if (this.isRunning) return;
    
    this.isRunning = true;
    
    // Update queue positions and wait times every 30 seconds
    this.queueUpdateInterval = setInterval(() => {
      this.updateQueuePositions();
    }, 30000);
  }

  async stop(): Promise<void> {
    if (this.queueUpdateInterval) {
      clearInterval(this.queueUpdateInterval);
    }
    this.isRunning = false;
  }

  async addWalkIn(walkInData: any): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('queue')
        .insert({
          patient_id: walkInData.patient_id || null,
          queue_type: 'walk_in',
          priority: walkInData.priority || 'medium',
          status: 'waiting',
          checked_in_at: new Date().toISOString(),
          notes: walkInData.reason
        })
        .select()
        .single();

      if (error) throw error;
      
      return data.id;
    } catch (error) {
      console.error('Error adding walk-in:', error);
      return null;
    }
  }

  private async updateQueuePositions() {
    try {
      const { data: queueEntries } = await supabase
        .from('queue')
        .select('*')
        .eq('status', 'waiting')
        .order('checked_in_at');

      // Update positions and estimated wait times
      for (let i = 0; i < (queueEntries?.length || 0); i++) {
        const entry = queueEntries![i];
        const position = i + 1;
        const estimatedWait = position * 30; // 30 minutes per patient estimate

        await supabase
          .from('queue')
          .update({
            queue_position: position,
            estimated_wait_time: estimatedWait
          })
          .eq('id', entry.id);
      }
    } catch (error) {
      console.error('Error updating queue positions:', error);
    }
  }
}

// 3️⃣ Paperless Workflow Module (Always Running)
class PaperlessWorkflowModule extends CoreModule {
  getName(): string {
    return 'Paperless Workflow';
  }

  async start(): Promise<void> {
    this.isRunning = true;
  }

  async stop(): Promise<void> {
    this.isRunning = false;
  }

  async createDigitalForm(formData: any): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('digital_forms')
        .insert(formData)
        .select()
        .single();

      if (error) throw error;
      return data.id;
    } catch (error) {
      console.error('Error creating digital form:', error);
      return null;
    }
  }

  async signDocument(documentId: string, signatureData: any): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('signed_documents')
        .update({
          ...signatureData,
          signed_at: new Date().toISOString()
        })
        .eq('id', documentId);

      if (error) throw error;

      // Log audit trail
      await this.logDocumentAction(documentId, 'signed', signatureData.signer_id);
      
      return true;
    } catch (error) {
      console.error('Error signing document:', error);
      return false;
    }
  }

  private async logDocumentAction(documentId: string, action: string, userId: string) {
    try {
      await supabase
        .from('document_audit_log')
        .insert({
          document_id: documentId,
          action,
          user_id: userId,
          timestamp: new Date().toISOString(),
          device_info: navigator.userAgent,
        });
    } catch (error) {
      console.error('Error logging document action:', error);
    }
  }
}

// 4️⃣ Analytics Module (Always Running)
class AnalyticsModule extends CoreModule {
  private analyticsUpdateInterval?: NodeJS.Timeout;

  getName(): string {
    return 'Analytics';
  }

  async start(): Promise<void> {
    if (this.isRunning) return;
    
    this.isRunning = true;
    
    // Update analytics every 5 minutes
    this.analyticsUpdateInterval = setInterval(() => {
      this.updateAnalytics();
    }, 5 * 60 * 1000);
  }

  async stop(): Promise<void> {
    if (this.analyticsUpdateInterval) {
      clearInterval(this.analyticsUpdateInterval);
    }
    this.isRunning = false;
  }

  private async updateAnalytics() {
    try {
      // Update revenue analytics
      await this.updateRevenueAnalytics();
      
      // Update inventory analytics
      await this.updateInventoryAnalytics();
      
      // Update performance analytics
      await this.updatePerformanceAnalytics();
      
    } catch (error) {
      console.error('Error updating analytics:', error);
    }
  }

  private async updateRevenueAnalytics() {
    // Implementation for revenue analytics
    console.log('Updating revenue analytics...');
  }

  private async updateInventoryAnalytics() {
    // Implementation for inventory analytics
    console.log('Updating inventory analytics...');
  }

  private async updatePerformanceAnalytics() {
    // Implementation for performance analytics
    console.log('Updating performance analytics...');
  }
}

// Initialize core modules on app start
export const coreModules = CoreModuleManager.getInstance();

// Export for use in components
export { CoreModuleManager };
