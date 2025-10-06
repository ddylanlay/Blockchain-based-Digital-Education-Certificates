import { authenticateMSPUser, getMSPConfig, MSPUser, AuthResult } from '../fabric/mspAuth';

export interface LoginRequest {
    role: 'CA_ADMIN' | 'STUDENT';
    // For MSP-based auth, we don't need wallet signature
    // The authentication is handled through MSP certificates
}

export class MSPService {
    /**
     * Authenticate user using MSP identity
     */
    static async authenticateUser(loginData: LoginRequest): Promise<AuthResult> {
        try {
            const { role } = loginData;

            // Get MSP configuration for the role
            const mspConfig = getMSPConfig(role);

            // Authenticate using MSP identity
            const result = await authenticateMSPUser(
                mspConfig.certPath,
                mspConfig.keyPath,
                mspConfig.mspId
            );

            return result;
        } catch (error) {
            console.error('MSP authentication error:', error);
            return {
                success: false,
                error: 'MSP authentication failed'
            };
        }
    }

    /**
     * Get seed CA admin user info
     */
    static getSeedCAAdminInfo(): { role: string; name: string; email: string; mspId: string } {
        return {
            role: 'CA_ADMIN',
            name: 'University Administrator',
            email: 'admin@university-ca.example.com',
            mspId: 'UniversityCAMSP'
        };
    }

    /**
     * Get seed student user info
     */
    static getSeedStudentInfo(): { role: string; name: string; email: string; mspId: string } {
        return {
            role: 'STUDENT',
            name: 'Student User',
            email: 'student@student.example.com',
            mspId: 'StudentMSP'
        };
    }
}
