# PowerShell script to deploy CredentialHashContract properly
Write-Host "🚀 Deploying CredentialHashContract" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green

$testNetworkPath = "C:\Users\Dylan\Desktop\FYP_Blockchain\Education-Credential-Verification\app\blockchain\fabric-samples\test-network"
$chaincodePath = "C:\Users\Dylan\Desktop\FYP_Blockchain\Education-Credential-Verification\app\blockchain\fabric-samples\asset-transfer-basic\chaincode-typescript"

# Step 1: Navigate to test-network
Write-Host "`nStep 1: Navigating to test-network..." -ForegroundColor Yellow
Set-Location $testNetworkPath

# Step 2: Check Docker containers
Write-Host "`nStep 2: Checking Docker containers..." -ForegroundColor Yellow
$containers = docker ps --format "table {{.Names}}\t{{.Status}}"
Write-Host $containers

if (-not ($containers -match "peer0.org1.example.com") -or -not ($containers -match "peer0.org2.example.com") -or -not ($containers -match "orderer.example.com")) {
    Write-Host "❌ Required containers are not running. Starting network..." -ForegroundColor Red
    docker-compose -f compose/compose-test-net.yaml down
    docker-compose -f compose/compose-test-net.yaml up -d

    # Wait for containers to start
    Start-Sleep -Seconds 10

    # Create channel
    Write-Host "Creating channel..." -ForegroundColor Yellow
    docker run --rm -v ${PWD}:/work -w /work --network fabric_test hyperledger/fabric-tools:latest configtxgen -profile ChannelUsingRaft -outputBlock ./channel-artifacts/mychannel.block -channelID mychannel

    # Create CLI container for channel operations
    docker run -d --name deployment-cli --network fabric_test -v ${PWD}:/opt/gopath/src/github.com/hyperledger/fabric/peer -v ${PWD}/../asset-transfer-basic/chaincode-typescript:/opt/gopath/src/github.com/chaincode/asset-transfer-basic/chaincode-typescript -v ${PWD}/organizations:/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ -w /opt/gopath/src/github.com/hyperledger/fabric/peer -e CORE_PEER_TLS_ENABLED=true -e CORE_PEER_TLS_CERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/server.crt -e CORE_PEER_TLS_KEY_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/server.key -e CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp -e CORE_PEER_ADDRESS=peer0.org1.example.com:7051 -e CORE_PEER_LOCALMSPID=Org1MSP hyperledger/fabric-tools:latest sleep 3600

    # Join channel
    docker exec deployment-cli peer channel join -b ./channel-artifacts/mychannel.block

    # Join Org2 to channel
    docker exec -e CORE_PEER_LOCALMSPID=Org2MSP -e CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer-crypto/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp -e CORE_PEER_ADDRESS=peer0.org2.example.com:9051 deployment-cli peer channel join -b ./channel-artifacts/mychannel.block
}

# Step 3: Create CLI container if it doesn't exist
if (-not (docker ps -q -f name=deployment-cli)) {
    Write-Host "`nStep 3: Creating CLI container..." -ForegroundColor Yellow
    docker run -d --name deployment-cli --network fabric_test -v ${PWD}:/opt/gopath/src/github.com/hyperledger/fabric/peer -v ${PWD}/../asset-transfer-basic/chaincode-typescript:/opt/gopath/src/github.com/chaincode/asset-transfer-basic/chaincode-typescript -v ${PWD}/organizations:/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ -w /opt/gopath/src/github.com/hyperledger/fabric/peer -e CORE_PEER_TLS_ENABLED=true -e CORE_PEER_TLS_CERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/server.crt -e CORE_PEER_TLS_KEY_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/server.key -e CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp -e CORE_PEER_ADDRESS=peer0.org1.example.com:7051 -e CORE_PEER_LOCALMSPID=Org1MSP hyperledger/fabric-tools:latest sleep 3600
}

# Step 4: Build chaincode
Write-Host "`nStep 4: Building chaincode..." -ForegroundColor Yellow
Set-Location $chaincodePath
npm run build
Set-Location $testNetworkPath

# Step 5: Package chaincode
Write-Host "`nStep 5: Packaging chaincode..." -ForegroundColor Yellow
docker exec deployment-cli peer lifecycle chaincode package basic.tar.gz --path /opt/gopath/src/github.com/chaincode/asset-transfer-basic/chaincode-typescript --lang node --label basic_1.1

# Step 6: Install on both peers
Write-Host "`nStep 6: Installing chaincode on peers..." -ForegroundColor Yellow
$installResult1 = docker exec deployment-cli peer lifecycle chaincode install basic.tar.gz
$installResult1

$installResult2 = docker exec -e CORE_PEER_LOCALMSPID=Org2MSP -e CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp -e CORE_PEER_ADDRESS=peer0.org2.example.com:9051 deployment-cli peer lifecycle chaincode install basic.tar.gz
$installResult2

# Step 7: Get package ID
Write-Host "`nStep 7: Getting package ID..." -ForegroundColor Yellow
$packageInfo = docker exec deployment-cli peer lifecycle chaincode queryinstalled
Write-Host "Package info:"
Write-Host $packageInfo

# Extract package ID from the output
$packageId = ($packageInfo | Select-String "basic_1.1:([a-f0-9]+)" | ForEach-Object { $_.Matches[0].Groups[1].Value })
$fullPackageId = "basic_1.1:$packageId"

if ([string]::IsNullOrEmpty($fullPackageId) -or $fullPackageId -eq "basic_1.1:") {
    Write-Host "❌ Failed to extract package ID" -ForegroundColor Red
    exit 1
}

Write-Host "Full Package ID: $fullPackageId" -ForegroundColor Green

# Step 8: Approve for Org1
Write-Host "`nStep 8: Approving chaincode for Org1..." -ForegroundColor Yellow
$approve1 = docker exec deployment-cli peer lifecycle chaincode approveformyorg -o orderer.example.com:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem --channelID mychannel --name basic --version 1.1 --package-id $fullPackageId --sequence 2
Write-Host $approve1

# Step 9: Approve for Org2
Write-Host "`nStep 9: Approving chaincode for Org2..." -ForegroundColor Yellow
$approve2 = docker exec -e CORE_PEER_LOCALMSPID=Org2MSP -e CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp -e CORE_PEER_ADDRESS=peer0.org2.example.com:9051 deployment-cli peer lifecycle chaincode approveformyorg -o orderer.example.com:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem --channelID mychannel --name basic --version 1.1 --package-id $fullPackageId --sequence 2
Write-Host $approve2

# Step 10: Commit chaincode
Write-Host "`nStep 10: Committing chaincode..." -ForegroundColor Yellow
$commit = docker exec deployment-cli peer lifecycle chaincode commit -o orderer.example.com:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem --channelID mychannel --name basic --version 1.1 --sequence 2 --peerAddresses peer0.org1.example.com:7051 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt --peerAddresses peer0.org2.example.com:9051 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt
Write-Host $commit

# Step 11: Test CredentialHashContract
Write-Host "`nStep 11: Testing CredentialHashContract..." -ForegroundColor Yellow
$testResult = docker exec deployment-cli peer chaincode invoke -o orderer.example.com:7050 --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C mychannel -n basic --peerAddresses peer0.org1.example.com:7051 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/peers/peer0.org1.example.net/tls/ca.crt --peerAddresses peer0.org2.example.com:9051 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt -c '{\"function\":\"StoreCredentialHash\",\"Args\":[\"test-cred\",\"0x1234567890abcdef\",\"student-wallet\",\"university-wallet\",\"' + (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss.fffZ") + '\",\"issued\"]}'

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ SUCCESS: CredentialHashContract is working!" -ForegroundColor Green
    Write-Host "🎉 You can now use the proper credential contract!" -ForegroundColor Green
} else {
    Write-Host "`n❌ CredentialHashContract test failed" -ForegroundColor Red
    Write-Host "Test result: $testResult" -ForegroundColor Red
}

# Cleanup
docker rm -f deployment-cli

Write-Host "`n====================================" -ForegroundColor Green
Write-Host "Deployment completed!" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green

Write-Host "`nNow remove the workaround from your backend and test credential creation!" -ForegroundColor Cyan
