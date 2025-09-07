'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Certificate } from './types';

// State interface
interface CertificateState {
  certificates: Certificate[];
  selectedCertificate: Certificate | null;
  loading: boolean;
  error: string | null;
}

// Action types
type CertificateAction =
  | { type: 'SET_CERTIFICATES'; payload: Certificate[] }
  | { type: 'ADD_CERTIFICATE'; payload: Certificate }
  | { type: 'UPDATE_CERTIFICATE'; payload: Certificate }
  | { type: 'DELETE_CERTIFICATE'; payload: string }
  | { type: 'SET_SELECTED_CERTIFICATE'; payload: Certificate | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_ERROR' };

// Initial state
const initialState: CertificateState = {
  certificates: [],
  selectedCertificate: null,
  loading: false,
  error: null,
};

// Reducer function 
function certificateReducer(state: CertificateState, action: CertificateAction): CertificateState {
  switch (action.type) {
    case 'SET_CERTIFICATES':
      return {
        ...state,
        certificates: action.payload,
        loading: false,
        error: null,
      };

    case 'ADD_CERTIFICATE':
      return {
        ...state,
        certificates: [...state.certificates, action.payload],
        error: null,
      };

    case 'UPDATE_CERTIFICATE':
      return {
        ...state,
        certificates: state.certificates.map(cert =>
          cert.id === action.payload.id ? action.payload : cert
        ),
        selectedCertificate: state.selectedCertificate?.id === action.payload.id
          ? action.payload
          : state.selectedCertificate,
        error: null,
      };

    case 'DELETE_CERTIFICATE':
      return {
        ...state,
        certificates: state.certificates.filter(cert => cert.id !== action.payload),
        selectedCertificate: state.selectedCertificate?.id === action.payload
          ? null
          : state.selectedCertificate,
        error: null,
      };

    case 'SET_SELECTED_CERTIFICATE':
      return {
        ...state,
        selectedCertificate: action.payload,
      };

    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false,
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
}

// Context interface
interface CertificateContextType {
  state: CertificateState;
  dispatch: React.Dispatch<CertificateAction>;
  // Convenience methods
  setCertificates: (certificates: Certificate[]) => void;
  addCertificate: (certificate: Certificate) => void;
  updateCertificate: (certificate: Certificate) => void;
  deleteCertificate: (id: string) => void;
  setSelectedCertificate: (certificate: Certificate | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

// Create context
const CertificateContext = createContext<CertificateContextType | undefined>(undefined);

// Provider component
interface CertificateProviderProps {
  children: ReactNode;
}


// Shares certificate related state and actions across app

// Holds the official record of certificates and status

// Offers official functions like "add a certificate" or "show an error"

// Allows any room (component) to ask for data or trigger updates
export function CertificateProvider({ children }: CertificateProviderProps) {
  const [state, dispatch] = useReducer(certificateReducer, initialState);

  // Convenience methods
  const setCertificates = (certificates: Certificate[]) => {
    dispatch({ type: 'SET_CERTIFICATES', payload: certificates });
  };

  const addCertificate = (certificate: Certificate) => {
    dispatch({ type: 'ADD_CERTIFICATE', payload: certificate });
  };

  const updateCertificate = (certificate: Certificate) => {
    dispatch({ type: 'UPDATE_CERTIFICATE', payload: certificate });
  };

  const deleteCertificate = (id: string) => {
    dispatch({ type: 'DELETE_CERTIFICATE', payload: id });
  };

  const setSelectedCertificate = (certificate: Certificate | null) => {
    dispatch({ type: 'SET_SELECTED_CERTIFICATE', payload: certificate });
  };

  const setLoading = (loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  };

  const setError = (error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value: CertificateContextType = {
    state,
    dispatch,
    setCertificates,
    addCertificate,
    updateCertificate,
    deleteCertificate,
    setSelectedCertificate,
    setLoading,
    setError,
    clearError,
  };

  return (
    <CertificateContext.Provider value={value}>
      {children}
    </CertificateContext.Provider>
  );
}

// Custom hook to use the context
export function useCertificateContext() {
  const context = useContext(CertificateContext);
  if (context === undefined) {
    throw new Error('useCertificateContext must be used within a CertificateProvider');
  }
  return context;
}