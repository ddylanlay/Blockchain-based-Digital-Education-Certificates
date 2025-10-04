# PowerShell script for chaincode deployment
Write-Host "🚀 Quick Chaincode Deployment Script" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green

$testNetworkPath = "C:\Users\Dylan\Desktop\FYP_Blockchain\Education-Credential-Verification\app\blockchain\fabric-samples\test-network"
$chaincodePath = "C:\Users\Dylan\Desktop\FYP_Blockchain\Education-Credential-Verification\app\blockchain\fabric-samples\asset-transfer-basic\chaincode-typescript"

# Step 1: Build chaincode
Write-Host "`nStep 1: Building chaincode..." -ForegroundColor Yellow
Set-Location $chaincodePath
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to build chaincode" -ForegroundColor Red
    exit 1
}

# Step 2: Go to test-network
Write-Host "`nStep 2: Navigating to test-network..." -ForegroundColor Yellow
Set-Location $testNetworkPath

# Step 3: Stop existing network
Write-Host "`nStep 3: Stopping existing network..." -ForegroundColor Yellow
docker-compose -f compose/compose-test-net.yaml down

# Step 4: Start network with channel
Write-Host "`nStep 4: Starting network and creating channel..." -ForegroundColor Yellow
docker-compose -f compose/compose-test-net.yaml up -d

# Wait for containers to start
Start-Sleep -Seconds 10

# Step 5: Create channel using configtxgen
Write-Host "`nStep 5: Creating channel configuration..." -ForegroundColor Yellow

# Create channel-artifacts directory if it doesn't exist
if (!(Test-Path "channel-artifacts")) {
    New-Item -ItemType Directory -Path "channel-artifacts"
}

# Generate channel configuration
docker run --rm -v ${PWD}:/work -w /work hyperledger/fabric-tools:latest configtxgen -profile TwoOrgsChannel -outputCreateChannelTx ./channel-artifacts/mychannel.tx -channelID mychannel

# Step 6: Start CLI container
Write-Host "`nStep 6: Starting CLI container..." -ForegroundColor Yellow
$cliContainer = docker run -d --name cli --network fabric_test `
    -v ${PWD}:/opt/gopath/src/github.com/hyperledger/fabric/peer `
    -v ${PWD}/../asset-transfer-basic/chaincode-typescript:/opt/gopath/src/github.com/chaincode/asset-transfer-basic/chaincode-typescript `
    -v ${PWD}/organizations:/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ `
    -w /opt/gopath/src/github.com/hyperledger/fabric/peer `
    -e CORE_PEER_TLS_ENABLED=true `
    -e CORE_PEER_TLS_CERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/server.crt `
    -e CORE_PEER_TLS_KEY_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/server.key `
    -e CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt `
    -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp `
    -e CORE_PEER_ADDRESS=peer0.org1.example.com:7051 `
    -e CORE_PEER_LOCALMSPID=Org1MSP `
    hyperledger/fabric-tools:latest sleep 3600

Write-Host "CLI Container ID: $cliContainer" -ForegroundColor Green

# Step 7: Create and join channel
Write-Host "`nStep 7: Creating and joining channel..." -ForegroundColor Yellow
docker exec cli peer channel create -o orderer.example.com:7050 -c mychannel --ordererTLSHostnameOverride orderer.example.com --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -f ./channel-artifacts/mychannel.tx

docker exec cli peer channel join -b mychannel.block

# Join Org2 to channel
docker exec -e CORE_PEER_LOCALMSPID=Org2MSP -e CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp -e CORE_PEER_ADDRESS=peer0.org2.example.com:9051 cli peer channel join -b mychannel.block

# Step 8: Deploy chaincode
Write-Host "`nStep 8: Deploying chaincode..." -ForegroundColor Yellow

# Package chaincode
docker exec cli peer lifecycle chaincode package basic.tar.gz --path /opt/gopath/src/github.com/chaincode/asset-transfer-basic/chaincode-typescript --lang node --label basic_1.0

# Install on both peers
docker exec cli peer lifecycle chaincode install basic.tar.gz
docker exec -e CORE_PEER_LOCALMSPID=Org2MSP -e CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp -e CORE_PEER_ADDRESS=peer0.org2.example.com:9051 cli peer lifecycle chaincode install basic.tar.gz

# Get package ID
$packageInfo = docker exec cli peer lifecycle chaincode queryinstalled
$packageId = ($packageInfo | Select-String "basic_1.0:([a-f0-9]+)" | ForEach-Object { $_.Matches[0].Groups[1].Value })
$fullPackageId = "basic_1.0:$packageId"

Write-Host "Package ID: $fullPackageId" -ForegroundColor Green

# Approve for both orgs
docker exec cli peer lifecycle chaincode approveformyorg -o orderer.example.com:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem --channelID mychannel --name basic --version 1.0 --package-id $fullPackageId --sequence 1

docker exec -e CORE_PEER_LOCALMSPID=Org2MSP -e CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp -e CORE_PEER_ADDRESS=peer0.org2.example.com:9051 cli peer lifecycle chaincode approveformyorg -o orderer.example.com:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem --channelID mychannel --name basic --version 1.0 --package-id $fullPackageId --sequence 1

# Commit chaincode
docker exec cli peer lifecycle chaincode commit -o orderer.example.com:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem --channelID mychannel --name basic --version 1.0 --sequence 1 --peerAddresses peer0.org1.example.com:7051 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt --peerAddresses peer0.org2.example.com:9051 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt

# Step 9: Test the deployment
Write-Host "`nStep 9: Testing CredentialHashContract..." -ForegroundColor Yellow
$testResult = docker exec cli peer chaincode invoke -o orderer.example.com:7050 --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C mychannel -n basic --peerAddresses peer0.org1.example.com:7051 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt --peerAddresses peer0.org2.example.com:9051 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt -c '{\"function\":\"StoreCredentialHash\",\"Args\":[\"test-123\",\"0x1234567890abcdef\",\"student-wallet\",\"university-wallet\",\"2025-10-02T07:58:30.000Z\",\"issued\"]}'

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ SUCCESS: CredentialHashContract is working!" -ForegroundColor Green
    Write-Host "🎉 You can now create credentials through the web interface." -ForegroundColor Green
} else {
    Write-Host "`n❌ CredentialHashContract test failed" -ForegroundColor Red
    Write-Host "Error: $testResult" -ForegroundColor Red
}

Write-Host "`n====================================" -ForegroundColor Green
Write-Host "Deployment completed!" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green
