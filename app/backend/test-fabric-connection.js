// Test fabric connection directly
const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Fabric connection...');

async function testFabric() {
  try {
    console.log('📁 Checking connection file...');
    const connectionPath = path.join(__dirname, 'connection-org1.json');
    console.log('Connection file path:', connectionPath);

    if (fs.existsSync(connectionPath)) {
      console.log('✅ Connection file exists');
      const connectionData = JSON.parse(fs.readFileSync(connectionPath, 'utf8'));
      console.log('📊 Connection config:', {
        name: connectionData.name,
        version: connectionData.version,
        sslTargetNameOverride: connectionData.peers['peer0.org1.example.com'].url
      });
    } else {
      console.log('❌ Connection file not found');
    }

    console.log('📁 Checking fabric.ts...');
    const fabricPath = path.join(__dirname, 'src', 'fabric.ts');
    console.log('Fabric file path:', fabricPath);

    if (fs.existsSync(fabricPath)) {
      console.log('✅ Fabric file exists');
    } else {
      console.log('❌ Fabric file not found');
    }

    // Try to import the fabric module
    console.log('🔄 Trying to import fabric module...');
    const fabricModule = require('./dist/fabric.js');
    console.log('✅ Fabric module imported successfully');

    console.log('📦 Checking fabric-gateway dependency...');
    try {
      const fabricGateway = require('fabric-gateway');
      console.log('✅ fabric-gateway installed');
    } catch (error) {
      console.log('❌ fabric-gateway not installed:', error.message);
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testFabric();
