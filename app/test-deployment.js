const { exec } = require('child_process');
const path = require('path');

console.log('🔍 Comprehensive Chaincode Deployment Test');
console.log('==========================================\n');

async function runCommand(command, cwd = process.cwd()) {
    return new Promise((resolve, reject) => {
        exec(command, { cwd }, (error, stdout, stderr) => {
            if (error) {
                resolve({ success: false, error: error.message, stdout, stderr });
            } else {
                resolve({ success: true, stdout, stderr });
            }
        });
    });
}

async function testDeployment() {
    console.log('Step 1: Checking Docker containers...');
    const dockerCheck = await runCommand('docker ps');

    if (!dockerCheck.success) {
        console.log('❌ Docker is not running or accessible');
        console.log('Please make sure Docker Desktop is running');
        return;
    }

    const containers = dockerCheck.stdout;
    console.log('✅ Docker is running');

    if (containers.includes('peer0.org1.example.com') && containers.includes('peer0.org2.example.com')) {
        console.log('✅ Fabric network containers are running');
    } else {
        console.log('❌ Fabric network containers are not running');
        console.log('Please start the Fabric network first');
        return;
    }

    console.log('\nStep 2: Checking chaincode deployment...');
    const testNetworkPath = path.join(__dirname, 'blockchain', 'fabric-samples', 'test-network');

    const chaincodeCheck = await runCommand(
        'docker exec cli peer lifecycle chaincode querycommitted --channelID mychannel --name basic',
        testNetworkPath
    );

    if (chaincodeCheck.success && chaincodeCheck.stdout.includes('Version: 1.0')) {
        console.log('✅ Chaincode "basic" is deployed and committed');
        console.log('Chaincode details:', chaincodeCheck.stdout.trim());
    } else {
        console.log('❌ Chaincode "basic" is not properly deployed');
        console.log('Error:', chaincodeCheck.stderr || chaincodeCheck.error);

        console.log('\n🔧 Attempting to deploy chaincode...');

        // Try to deploy the chaincode
        const deployResult = await runCommand(
            './network.sh deployCC -ccn basic -ccp ../asset-transfer-basic/chaincode-typescript/ -ccl typescript',
            testNetworkPath
        );

        if (deployResult.success) {
            console.log('✅ Chaincode deployment successful!');
        } else {
            console.log('❌ Chaincode deployment failed:');
            console.log(deployResult.stderr || deployResult.error);
            return;
        }
    }

    console.log('\nStep 3: Testing chaincode functionality...');

    // Test basic chaincode function
    const basicTest = await runCommand(
        'docker exec cli peer chaincode query -C mychannel -n basic -c \'{"function":"GetAllAssets","Args":[]}\'',
        testNetworkPath
    );

    if (basicTest.success) {
        console.log('✅ Basic chaincode functions are working');
        console.log('Assets:', basicTest.stdout.trim());
    } else {
        console.log('❌ Basic chaincode test failed:', basicTest.stderr);
    }

    console.log('\nStep 4: Testing CredentialHashContract...');

    // Test CredentialHashContract function
    const credentialTest = await runCommand(
        'docker exec cli peer chaincode invoke -o orderer.example.com:7050 --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C mychannel -n basic --peerAddresses peer0.org1.example.com:7051 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt --peerAddresses peer0.org2.example.com:9051 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt -c \'{"function":"StoreCredentialHash","Args":["test-' + Date.now() + '","0x1234567890abcdef","student-wallet","university-wallet","' + new Date().toISOString() + '","issued"]}\'',
        testNetworkPath
    );

    if (credentialTest.success) {
        console.log('✅ SUCCESS: CredentialHashContract is working!');
        console.log('🎉 You can now create credentials through the web interface.');

        console.log('\n📋 Next Steps:');
        console.log('1. Start your backend server: cd backend && npm run dev');
        console.log('2. Start your frontend server: cd frontend && npm run dev');
        console.log('3. Try creating a credential in the web interface');

    } else {
        console.log('❌ CredentialHashContract test failed:');
        console.log('Error:', credentialTest.stderr || credentialTest.error);

        if (credentialTest.stderr && credentialTest.stderr.includes('unknown method')) {
            console.log('\n🔧 The CredentialHashContract is not properly included in the deployment.');
            console.log('This means the index.ts fix needs to be redeployed.');
        }
    }

    console.log('\n==========================================');
    console.log('Test completed!');
}

testDeployment().catch(console.error);
