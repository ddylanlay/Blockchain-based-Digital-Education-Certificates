@echo off
echo Deploying Hyperledger Fabric Chaincode on Windows
echo ================================================

REM Navigate to the test-network directory
cd /d "C:\Users\Dylan\Desktop\FYP_Blockchain\Education-Credential-Verification\app\blockchain\fabric-samples\test-network"

echo.
echo Step 1: Building the chaincode...
cd /d "C:\Users\Dylan\Desktop\FYP_Blockchain\Education-Credential-Verification\app\blockchain\fabric-samples\asset-transfer-basic\chaincode-typescript"
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Failed to build chaincode
    pause
    exit /b 1
)

echo.
echo Step 2: Going back to test-network directory...
cd /d "C:\Users\Dylan\Desktop\FYP_Blockchain\Education-Credential-Verification\app\blockchain\fabric-samples\test-network"

echo.
echo Step 3: Bringing down any existing network...
call bash network.sh down

echo.
echo Step 4: Starting the network...
call bash network.sh up

echo.
echo Step 5: Creating the channel...
call bash network.sh createChannel

echo.
echo Step 6: Deploying the chaincode...
call bash network.sh deployCC -ccn basic -ccp ../asset-transfer-basic/chaincode-typescript/ -ccl typescript

if %errorlevel% neq 0 (
    echo ERROR: Failed to deploy chaincode
    pause
    exit /b 1
)

echo.
echo ================================================
echo SUCCESS: Chaincode deployed successfully!
echo The CredentialHashContract is now available on the blockchain.
echo You can now try creating credentials again.
echo ================================================
pause
