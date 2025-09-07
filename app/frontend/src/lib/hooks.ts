import { useState, useEffect, useCallback } from 'react';
import { certificateApi, ApiError } from './api';
import {
  Certificate,
  CreateCertificateRequest,
  UpdateCertificateRequest,
  UpdateStatusRequest
} from './types';

// Hook for fetching all certificates
export function useCertificates() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCertificates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await certificateApi.getAllCertificates();
      setCertificates(data);
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to fetch certificates';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCertificates();
  }, [fetchCertificates]);

  return { certificates, loading, error, refetch: fetchCertificates };
}

// Hook for fetching a single certificate
export function useCertificate(id: string) {
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCertificate = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      const data = await certificateApi.getCertificate(id);
      setCertificate(data);
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to fetch certificate';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCertificate();
  }, [fetchCertificate]);

  return { certificate, loading, error, refetch: fetchCertificate };
}

// Hook for creating a certificate
export function useCreateCertificate() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCertificate = useCallback(async (certificate: CreateCertificateRequest) => {
    try {
      setLoading(true);
      setError(null);
      const result = await certificateApi.createCertificate(certificate);
      return result;
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to create certificate';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createCertificate, loading, error };
}

// Hook for updating a certificate
export function useUpdateCertificate() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateCertificate = useCallback(async (id: string, certificate: UpdateCertificateRequest) => {
    try {
      setLoading(true);
      setError(null);
      const result = await certificateApi.updateCertificate(id, certificate);
      return result;
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to update certificate';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { updateCertificate, loading, error };
}

// Hook for deleting a certificate
export function useDeleteCertificate() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteCertificate = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await certificateApi.deleteCertificate(id);
      return result;
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to delete certificate';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { deleteCertificate, loading, error };
}

// Hook for transferring a certificate
export function useTransferCertificate() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const transferCertificate = useCallback(async (id: string, transferData: TransferCertificateRequest) => {
    try {
      setLoading(true);
      setError(null);
      const result = await certificateApi.transferCertificate(id, transferData);
      return result;
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to transfer certificate';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { transferCertificate, loading, error };
}

// Hook for updating certificate status
export function useUpdateCertificateStatus() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateCertificateStatus = useCallback(async (id: string, statusData: UpdateStatusRequest) => {
    try {
      setLoading(true);
      setError(null);
      const result = await certificateApi.updateCertificateStatus(id, statusData);
      return result;
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to update certificate status';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { updateCertificateStatus, loading, error };
}

// Hook for checking if certificate exists
export function useCertificateExists() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkCertificateExists = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await certificateApi.certificateExists(id);
      return result.exists;
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to check certificate existence';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { checkCertificateExists, loading, error };
}