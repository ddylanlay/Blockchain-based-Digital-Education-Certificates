// Test script to verify the frontend-backend interface
// Run this with: node test-interface.js

const API_BASE_URL = 'http://localhost:4000/api';

async function testAPI() {
  console.log('🧪 Testing Frontend-Backend Interface...\n');

  try {
    // Test 1: Get all certificates
    console.log('1. Testing GET /api/assets...');
    const response1 = await fetch(`${API_BASE_URL}/assets`);
    if (response1.ok) {
      const certificates = await response1.json();
      console.log(`✅ Success! Found ${certificates.length} certificates`);
    } else {
      console.log(`❌ Failed with status: ${response1.status}`);
    }

    // Test 2: Check if a certificate exists
    console.log('\n2. Testing GET /api/assets/test/exists...');
    const response2 = await fetch(`${API_BASE_URL}/assets/test/exists`);
    if (response2.ok) {
      const result = await response2.json();
      console.log(`✅ Success! Certificate exists: ${result.exists}`);
    } else {
      console.log(`❌ Failed with status: ${response2.status}`);
    }

    // Test 3: Create a test certificate
    console.log('\n3. Testing POST /api/assets...');
    const testCertificate = {
      id: 'TEST001',
      owner: 'Test User',
      department: 'Test Department',
      academicYear: '2024-2025',
      joinDate: '2024-01-01',
      endDate: '2024-12-31',
      certificateType: 'Test Certificate',
      issueDate: '2024-01-15',
      status: 'Active',
      txHash: '0xtest123456789'
    };

    const response3 = await fetch(`${API_BASE_URL}/assets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testCertificate),
    });

    if (response3.ok) {
      console.log('✅ Success! Test certificate created');
    } else {
      const error = await response3.text();
      console.log(`❌ Failed with status: ${response3.status}`);
      console.log(`Error: ${error}`);
    }

    // Test 4: Get the created certificate
    console.log('\n4. Testing GET /api/assets/TEST001...');
    const response4 = await fetch(`${API_BASE_URL}/assets/TEST001`);
    if (response4.ok) {
      const certificate = await response4.json();
      console.log('✅ Success! Retrieved test certificate:');
      console.log(`   Owner: ${certificate.owner}`);
      console.log(`   Department: ${certificate.department}`);
      console.log(`   Status: ${certificate.status}`);
    } else {
      console.log(`❌ Failed with status: ${response4.status}`);
    }

    // Test 5: Update the certificate status
    console.log('\n5. Testing POST /api/assets/TEST001/status...');
    const response5 = await fetch(`${API_BASE_URL}/assets/TEST001/status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ newStatus: 'Inactive' }),
    });

    if (response5.ok) {
      console.log('✅ Success! Certificate status updated');
    } else {
      console.log(`❌ Failed with status: ${response5.status}`);
    }

    // Test 6: Delete the test certificate
    console.log('\n6. Testing DELETE /api/assets/TEST001...');
    const response6 = await fetch(`${API_BASE_URL}/assets/TEST001`, {
      method: 'DELETE',
    });

    if (response6.ok) {
      console.log('✅ Success! Test certificate deleted');
    } else {
      console.log(`❌ Failed with status: ${response6.status}`);
    }

    console.log('\n🎉 Interface test completed!');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    console.log('\n💡 Make sure the backend server is running on http://localhost:4000');
  }
}

// Run the test
testAPI();