@echo off
echo Direct Chaincode Deployment
echo ===========================

cd /d "C:\Users\Dylan\Desktop\FYP_Blockchain\Education-Credential-Verification\app\blockchain\fabric-samples\test-network"

echo Step 1: Building chaincode...
cd /d "C:\Users\Dylan\Desktop\FYP_Blockchain\Education-Credential-Verification\app\blockchain\fabric-samples\asset-transfer-basic\chaincode-typescript"
call npm run build

echo Step 2: Going back to test-network...
cd /d "C:\Users\Dylan\Desktop\FYP_Blockchain\Education-Credential-Verification\app\blockchain\fabric-samples\test-network"

echo Step 3: Creating CLI container...
docker run -d --name cli --network fabric_test -v %cd%:/opt/gopath/src/github.com/hyperledger/fabric/peer -v %cd%/../asset-transfer-basic/chaincode-typescript:/opt/gopath/src/github.com/chaincode/asset-transfer-basic/chaincode-typescript -v %cd%/organizations:/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ -w /opt/gopath/src/github.com/hyperledger/fabric/peer -e CORE_VM_ENDPOINT=unix:///host/var/run/docker.sock -e CORE_VM_DOCKER_HOSTCONFIG_NETWORKMODE=fabric_test -e FABRIC_LOGGING_SPEC=INFO -e CORE_PEER_TLS_ENABLED=true -e CORE_PEER_GOSSIP_USELEADERELECTION=true -e CORE_PEER_GOSSIP_ORGLEADER=false -e CORE_PEER_PROFILE_ENABLED=true -e CORE_PEER_TLS_CERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/server.crt -e CORE_PEER_TLS_KEY_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/server.key -e CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp -e CORE_PEER_ADDRESS=peer0.org1.example.com:7051 -e CORE_PEER_LOCALMSPID=Org1MSP hyperledger/fabric-tools:latest sleep 3600

echo Step 4: Package chaincode...
docker exec cli peer lifecycle chaincode package basic.tar.gz --path /opt/gopath/src/github.com/chaincode/asset-transfer-basic/chaincode-typescript --lang node --label basic_1.0

echo Step 5: Install on Org1...
docker exec cli peer lifecycle chaincode install basic.tar.gz

echo Step 6: Install on Org2...
docker exec -e CORE_PEER_LOCALMSPID=Org2MSP -e CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp -e CORE_PEER_ADDRESS=peer0.org2.example.com:9051 cli peer lifecycle chaincode install basic.tar.gz

echo Step 7: Get package ID...
docker exec cli peer lifecycle chaincode queryinstalled > package_id.txt
for /f "tokens=3 delims=: " %%a in ('findstr "basic_1.0" package_id.txt') do set PACKAGE_ID=%%a
set PACKAGE_ID=%PACKAGE_ID:,=%

echo Package ID: %PACKAGE_ID%

echo Step 8: Approve for Org1...
docker exec cli peer lifecycle chaincode approveformyorg -o orderer.example.com:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem --channelID mychannel --name basic --version 1.0 --package-id %PACKAGE_ID% --sequence 1

echo Step 9: Approve for Org2...
docker exec -e CORE_PEER_LOCALMSPID=Org2MSP -e CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp -e CORE_PEER_ADDRESS=peer0.org2.example.com:9051 cli peer lifecycle chaincode approveformyorg -o orderer.example.com:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem --channelID mychannel --name basic --version 1.0 --package-id %PACKAGE_ID% --sequence 1

echo Step 10: Commit chaincode...
docker exec cli peer lifecycle chaincode commit -o orderer.example.com:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem --channelID mychannel --name basic --version 1.0 --sequence 1 --peerAddresses peer0.org1.example.com:7051 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt --peerAddresses peer0.org2.example.com:9051 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt

echo Step 11: Test chaincode...
docker exec cli peer chaincode invoke -o orderer.example.com:7050 --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C mychannel -n basic --peerAddresses peer0.org1.example.com:7051 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt --peerAddresses peer0.org2.example.com:9051 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt -c "{\"function\":\"StoreCredentialHash\",\"Args\":[\"test-123\",\"0x1234567890abcdef\",\"student-wallet\",\"university-wallet\",\"2025-10-02T07:56:30.000Z\",\"issued\"]}"

echo.
echo ===========================
echo Deployment completed!
echo ===========================
pause
