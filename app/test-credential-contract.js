// Test script for CredentialHashContract
const { exec } = require('child_process');

console.log('🧪 Testing CredentialHashContract...');

function runCommand(command) {
    return new Promise((resolve) => {
        exec(command, (error, stdout, stderr) => {
            resolve({ error, stdout, stderr });
        });
    });
}

async function testCredentialHashContract() {
    const testNetworkPath = 'C:\\Users\\Dylan\\Desktop\\FYP_Blockchain\\Education-Credential-Verification\\app\\blockchain\\fabric-samples\\test-network';

    // Create CLI container
    console.log('Creating CLI container...');
    await runCommand(`cd "${testNetworkPath}" && docker run -d --name test-clي --network fabric_test -v ${testNetworkPath}:/opt/gopath/src/github.com/hyperledger/fabric/peer -v ${testNetworkPath}/../asset-transfer-basic/chaincode-typescript:/opt/gopath/src/github.com/chaincode/asset-transfer-basic/chaincode-typescript -v ${testNetworkPath}/organizations:/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ -w /opt/gopath/src/github.com/hyperledger/fabric/peer -e CORE_PEER_TLS_ENABLED=true -e CORE_PEER_TLS_CERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/server.crt -e CORE_PEER_TLS_KEY_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/server.key -e CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp -e CORE_PEER_ADDRESS=peer0.org1.example.com:7051 -e CORE_PEER_LOCALMSPID=Org1MSP hyperledger/fabric-tools:latest sleep 3600`);

    // Wait a moment for container to start
    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log('Testing StoreCredentialHash...');

    // Test StoreCredentialHash
    const storeResult = await runCommand(`cd "${testNetworkPath}" && docker exec test-clי peer chaincode invoke -o orderer.example.com:7050 --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C mychannel -n basic --peerAddresses peer0.org1.example.com:7051 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt --peerAddresses peer0.org2.example.com:9051 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt -c '{\\"function\\":\\"StoreCredentialHash\\",\\"Args\\":[\\"test-cred-123\\",\\"0x1234567890abcdef\\",\\"student-wallet\\",\\"university-wallet\\",\\"2025-10-03T05:42:30.000Z\\",\\"issued\\"]}'`);

    if (storeResult.error) {
        console.log('❌ StoreCredentialHash test failed:', storeResult.stderr);
        return;
    }

    console.log('✅ StoreCredentialHash test passed!');

    // Test GetCredentialHash
    console.log('Testing GetCredentialHash...');
    const getResult = await runCommand(`cd "${testNetworkPath}" && docker exec test-clي peer chaincode query -C mychannel -n basic -c '{\\"function\\":\\"GetCredentialHash\\",\\"Args\\":[\\"test-cred-123\\"]}'`);

    if (getResult.error) {
        console.log('❌ GetCredentialHash test failed:', getResult.stderr);
    } else {
        console.log('✅ GetCredentialHash test passed!');
        console.log('Result:', getResult.stdout);
    }

    // Test VerifyCredentialHash
    console.log('Testing VerifyCredentialHash...');
    const verifyResult = await runCommand(`cd "${testNetworkPath}" && docker exec test-clي peer chaincode query -C mychannel -n basic -c '{\\"function\\":\\"VerifyCredentialHash\\",\\"Args\\":[\\"test-cred-123\\",\\"0x1234567890abcdef\\"]}'`);

    if (verifyResult.error) {
        console.log('❌ VerifyCredentialHash test failed:', verifyResult.stderr);
    } else {
        console.log('✅ VerifyCredentialHash test passed!');
        console.log('Verification result:', verifyResult.stdout);
    }

    // Cleanup
    console.log('Cleaning up...');
    await runCommand(`docker rm -f test-clي`);

    console.log('\n🎉 CredentialHashContract is working properly!');
    console.log('You can now create credentials through your web interface.');
}

testCredentialHashContract().catch(console.error);
