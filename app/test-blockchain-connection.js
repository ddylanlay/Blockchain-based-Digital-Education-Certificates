// Test blockchain connection
const { exec } = require('child_process');

console.log('🧪 Testing blockchain connection...');

async function testConnection() {
    const testNetworkPath = 'C:\\Users\\Dylan\\Desktop\\FYP_Blockchain\\Education-Credential-Verification\\app\\blockchain\\fabric-samples\\test-network';

    console.log('Creating test CLI container...');

    // Create CLI container
    const createCommand = `cd "${testNetworkPath}" && docker run -d --name test-cli-connector --network fabric_test -v "${testNetworkPath}:/opt/gopath/src/github.com/hyperledger/fabric/peer" -v "${testNetworkPath}/organizations:/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/" -w /opt/gopath/src/github.com/hyperledger/fabric/peer -e CORE_PEER_TLS_ENABLED=true -e CORE_PEER_TLS_CERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/server.crt -e CORE_PEER_TLS_KEY_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/server.key -e CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp -e CORE_PEER_ADDRESS=peer0.org1.example.com:7051 -e CORE_PEER_LOCALMSPID=Org1MSP hyperledger/fabric-tools:latest sleep 3600`;

    exec(createCommand, (error, stdout, stderr) => {
        if (error) {
            console.log('❌ Error creating CLI container:', error);
            return;
        }

        const containerId = stdout.trim();
        console.log('✅ CLI container created:', containerId);

        // Wait for container to be ready
        setTimeout(() => {
            console.log('Testing chaincode query...');

            // Test basic chaincode query
            const testCommand = `cd "${testNetworkPath}" && docker exec test-cli-connector peer chaincode query -C mychannel -n basic -c '{\\"function\\":\\"StoreCredentialHash\\",\""Args\\":[\\"test-id\\",\\"0x123\\",\\"0x31078896C920EA1d5aADd8270D44F6e46AF1a426\\",\\"university-wallet\\",\\"2025-10-03T05:54:00.000Z\\",\\"issued\\"]}'`;

            exec(testCommand, (error, stdout, stderr) => {
                if (error) {
                    console.log('❌ Chaincode test failed:', stderr);
                } else {
                    console.log('✅ Chaincode test passed!');
                    console.log('Output:', stdout);
                }

                // Cleanup
                exec('docker rm -f test-cli-connector', () => {
                    console.log('🧹 Cleaned up test container');
                });
            });
        }, 3000);
    });
}

testConnection().catch(console.error);
