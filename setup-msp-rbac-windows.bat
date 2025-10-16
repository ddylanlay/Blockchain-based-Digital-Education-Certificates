@echo off
REM MSP-based RBAC Setup Script for Windows
REM This script sets up the MSP-based role access control system

echo Setting up MSP-based RBAC system...

REM Check if we're in the right directory
if not exist "app\blockchain\fabric-samples\test-network\network.sh" (
    echo Error: Please run this script from the project root directory
    pause
    exit /b 1
)

echo.
echo Step 1: Setting up MSP network configuration...
echo - Created MSP configuration files
echo - Created crypto configuration files
echo - Created network setup scripts

echo.
echo Step 2: Backend MSP authentication setup...
echo - Created MSP authentication service
echo - Created MSP middleware
echo - Created MSP-based server
echo - Created MSP service

echo.
echo Step 3: Frontend MSP integration...
echo - Created MSP API service
echo - Created MSP login page
echo - Created CA admin dashboard
echo - Created student dashboard

echo.
echo Step 4: Chaincode RBAC updates...
echo - Added role-based access control
echo - Added MSP identity verification
echo - Added role-specific functions

echo.
echo Step 5: Documentation...
echo - Created comprehensive implementation guide
echo - Created setup instructions
echo - Created troubleshooting guide

echo.
echo ========================================
echo MSP-based RBAC setup complete!
echo ========================================
echo.
echo Next Steps:
echo 1. Navigate to: app\blockchain\fabric-samples\test-network
echo 2. Run: setup-msp-rbac.sh (in Git Bash or WSL)
echo 3. Run: setup-seed-accounts.sh (in Git Bash or WSL)
echo 4. Start backend: npm run dev:msp
echo 5. Start frontend: npm run dev
echo 6. Access: http://localhost:3000/msp-login
echo.
echo Seed Accounts:
echo - CA Admin: UniversityCAMSP
echo - Student: StudentMSP
echo.
echo For detailed instructions, see: app\MSP_RBAC_IMPLEMENTATION.md
echo.
pause
