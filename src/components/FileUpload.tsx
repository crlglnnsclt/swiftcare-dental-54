import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Upload, X, File, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';

interface FileUploadProps {
  onUploadComplete?: (fileUrl: string, fileName: string) => void;
  acceptedTypes?: string[];
  maxSize?: number; // in MB
  className?: string;
}

interface UploadFile {
  file: File;
  id: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  url?: string;
  error?: string;
}

export function FileUpload({ 
  onUploadComplete, 
  acceptedTypes = ['image/*', 'application/pdf', '.doc', '.docx'],
  maxSize = 50,
  className = ""
}: FileUploadProps) {
  const { user } = useAuth();
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      return `File size must be less than ${maxSize}MB`;
    }

    // Check file type
    const fileType = file.type;
    const fileName = file.name.toLowerCase();
    
    const isValidType = acceptedTypes.some(type => {
      if (type.startsWith('.')) {
        return fileName.endsWith(type);
      }
      if (type.endsWith('/*')) {
        return fileType.startsWith(type.replace('/*', '/'));
      }
      return fileType === type;
    });

    if (!isValidType) {
      return `File type not supported. Accepted types: ${acceptedTypes.join(', ')}`;
    }

    return null;
  };

  const uploadFileToStorage = async (file: File): Promise<{ url: string; path: string } | null> => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    const fileId = `${user.id}/${Date.now()}-${file.name}`;
    
    const { data, error } = await supabase.storage
      .from('patient-documents')
      .upload(fileId, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      throw error;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('patient-documents')
      .getPublicUrl(data.path);

    return { url: publicUrl, path: data.path };
  };

  const handleFiles = useCallback(async (files: FileList) => {
    const newFiles: UploadFile[] = Array.from(files).map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      progress: 0,
      status: 'uploading' as const
    }));

    setUploadFiles(prev => [...prev, ...newFiles]);

    for (const uploadFile of newFiles) {
      const validation = validateFile(uploadFile.file);
      
      if (validation) {
        setUploadFiles(prev => prev.map(f => 
          f.id === uploadFile.id 
            ? { ...f, status: 'error' as const, error: validation }
            : f
        ));
        continue;
      }

      try {
        // Simulate progress
        const progressInterval = setInterval(() => {
          setUploadFiles(prev => prev.map(f => 
            f.id === uploadFile.id && f.progress < 90
              ? { ...f, progress: f.progress + 10 }
              : f
          ));
        }, 200);

        const result = await uploadFileToStorage(uploadFile.file);
        clearInterval(progressInterval);

        if (result) {
          setUploadFiles(prev => prev.map(f => 
            f.id === uploadFile.id 
              ? { ...f, progress: 100, status: 'completed' as const, url: result.url }
              : f
          ));

          onUploadComplete?.(result.url, uploadFile.file.name);
          toast.success(`${uploadFile.file.name} uploaded successfully`);
        }
      } catch (error) {
        setUploadFiles(prev => prev.map(f => 
          f.id === uploadFile.id 
            ? { ...f, status: 'error' as const, error: error instanceof Error ? error.message : 'Upload failed' }
            : f
        ));
        toast.error(`Failed to upload ${uploadFile.file.name}`);
      }
    }
  }, [onUploadComplete, maxSize, acceptedTypes, user]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFiles(files);
    }
  }, [handleFiles]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      handleFiles(files);
    }
  }, [handleFiles]);

  const removeFile = (id: string) => {
    setUploadFiles(prev => prev.filter(f => f.id !== id));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${isDragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
          hover:border-primary hover:bg-primary/5 cursor-pointer
        `}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-medium mb-2">Upload Documents</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Drag and drop files here, or click to browse
        </p>
        <p className="text-xs text-muted-foreground">
          Supported formats: {acceptedTypes.join(', ')} • Max size: {maxSize}MB
        </p>
        
        <Input
          id="file-input"
          type="file"
          multiple
          className="hidden"
          accept={acceptedTypes.join(',')}
          onChange={handleFileInput}
        />
      </div>

      {/* File List */}
      {uploadFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium">Upload Progress</h4>
          {uploadFiles.map((uploadFile) => (
            <div key={uploadFile.id} className="border rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <File className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{uploadFile.file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(uploadFile.file.size)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {uploadFile.status === 'completed' && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                  {uploadFile.status === 'error' && (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(uploadFile.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              {uploadFile.status === 'uploading' && (
                <Progress value={uploadFile.progress} className="h-2" />
              )}
              
              {uploadFile.status === 'error' && (
                <p className="text-sm text-red-500">{uploadFile.error}</p>
              )}
              
              {uploadFile.status === 'completed' && uploadFile.url && (
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(uploadFile.url, '_blank')}
                  >
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = uploadFile.url!;
                      link.download = uploadFile.file.name;
                      link.click();
                    }}
                  >
                    Download
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}