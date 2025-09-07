'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Certificate, CreateCertificateRequest, UpdateCertificateRequest } from '@/lib/types';
import { useCreateCertificate, useUpdateCertificate } from '@/lib/hooks';


// ***Centralised UI for managing certificates, updating and creating new ones***


interface CertificateFormProps {
  certificate?: Certificate;
  onSuccess?: () => void;
  onCancel?: () => void;
  mode: 'create' | 'update';
}

const certificateTypes = [
  'Bachelor Degree',
  'Master Degree',
  'PhD Degree',
  'Diploma',
  'Certificate',
  'Transcript'
];

// Need to fix up the status options
const statusOptions = [
  'Active',
  'Inactive',
  'Suspended',
  'Expired',
  'Pending'
];

export function CertificateForm({ certificate, onSuccess, onCancel, mode }: CertificateFormProps) {
  const { createCertificate, loading: createLoading, error: createError } = useCreateCertificate();
  const { updateCertificate, loading: updateLoading, error: updateError } = useUpdateCertificate();

  const [formData, setFormData] = useState<CreateCertificateRequest>({
    id: '',
    owner: '',
    department: '',
    academicYear: '',
    joinDate: '',
    endDate: '',
    certificateType: '',
    issueDate: '',
    status: 'Active',
    txHash: ''
  });

  const loading = createLoading || updateLoading;
  const error = createError || updateError;

  useEffect(() => {
    if (certificate && mode === 'update') {
      setFormData({
        id: certificate.id,
        owner: certificate.owner,
        department: certificate.department,
        academicYear: certificate.academicYear,
        joinDate: certificate.joinDate,
        endDate: certificate.endDate,
        certificateType: certificate.certificateType,
        issueDate: certificate.issueDate,
        status: certificate.status,
        txHash: certificate.txHash
      });
    }
  }, [certificate, mode]);

  const handleInputChange = (field: keyof CreateCertificateRequest, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (mode === 'create') {
        await createCertificate(formData);
      } else {
        const { id, ...updateData } = formData;
        await updateCertificate(id, updateData as UpdateCertificateRequest);
      }

      onSuccess?.();
    } catch (err) {
      // Error is handled by the hook
      console.error('Form submission error:', err);
    }
  };

  const generateTxHash = () => {
    const hash = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    handleInputChange('txHash', `0x${hash}`);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{mode === 'create' ? 'Create New Certificate' : 'Update Certificate'}</CardTitle>
        <CardDescription>
          {mode === 'create'
            ? 'Fill in the details to create a new certificate on the blockchain'
            : 'Update the certificate information'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="id">Certificate ID</Label>
              <Input
                id="id"
                value={formData.id}
                onChange={(e) => handleInputChange('id', e.target.value)}
                placeholder="Enter certificate ID"
                required
                disabled={mode === 'update'}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="owner">Owner</Label>
              <Input
                id="owner"
                value={formData.owner}
                onChange={(e) => handleInputChange('owner', e.target.value)}
                placeholder="Enter owner name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) => handleInputChange('department', e.target.value)}
                placeholder="Enter department"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="academicYear">Academic Year</Label>
              <Input
                id="academicYear"
                value={formData.academicYear}
                onChange={(e) => handleInputChange('academicYear', e.target.value)}
                placeholder="e.g., 2023-2024"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="joinDate">Join Date</Label>
              <Input
                id="joinDate"
                type="date"
                value={formData.joinDate}
                onChange={(e) => handleInputChange('joinDate', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="certificateType">Certificate Type</Label>
              <Select value={formData.certificateType} onValueChange={(value) => handleInputChange('certificateType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select certificate type" />
                </SelectTrigger>
                <SelectContent>
                  {certificateTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="issueDate">Issue Date</Label>
              <Input
                id="issueDate"
                type="date"
                value={formData.issueDate}
                onChange={(e) => handleInputChange('issueDate', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="txHash">Transaction Hash</Label>
            <div className="flex gap-2">
              <Input
                id="txHash"
                value={formData.txHash}
                onChange={(e) => handleInputChange('txHash', e.target.value)}
                placeholder="Blockchain transaction hash"
                required
              />
              <Button
                type="button"
                variant="outline"
                onClick={generateTxHash}
                disabled={loading}
              >
                Generate
              </Button>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Processing...' : mode === 'create' ? 'Create Certificate' : 'Update Certificate'}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}