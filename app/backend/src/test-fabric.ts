// test-fabric.ts
import {
    getAllAssets,
    createAsset,
    readAsset,
    updateAsset,
    deleteAsset,
    transferAsset,
    assetExists,
    updateAssetStatus
  } from './fabric';

  async function testFabricCalls() {
    console.log('🧪 Testing Fabric calls...\n');

    try {
      // Test 1: Get all assets
      console.log('1. Testing getAllAssets...');
      const allAssets = await getAllAssets();
      console.log('✅ getAllAssets successful:', allAssets.length, 'assets found\n');

      // Test 2: Create a test asset
      console.log('2. Testing createAsset...');
      const testId = 'TEST-' + Date.now();
      await createAsset(
        testId,
        'Test User',
        'Computer Science',
        '2023-2024',
        '2023-09-01',
        '2024-05-30',
        'Test Certificate',
        '2024-06-01',
        'issued',
        '0xtest123456789'
      );
      console.log('✅ createAsset successful\n');

      // Test 3: Read the created asset
      console.log('3. Testing readAsset...');
      const readResult = await readAsset(testId);
      console.log('✅ readAsset successful:', readResult.ID, readResult.Owner, '\n');

      // Test 4: Check if asset exists
      console.log('4. Testing assetExists...');
      const exists = await assetExists(testId);
      console.log('✅ assetExists successful:', exists, '\n');

      // Test 5: Update asset status
      console.log('5. Testing updateAssetStatus...');
      await updateAssetStatus(testId, 'verified');
      console.log('✅ updateAssetStatus successful\n');

      // Test 6: Transfer asset
      console.log('6. Testing transferAsset...');
      const oldOwner = await transferAsset(testId, 'New Owner');
      console.log('✅ transferAsset successful. Old owner:', oldOwner, '\n');

      // Test 7: Delete asset
      console.log('7. Testing deleteAsset...');
      await deleteAsset(testId);
      console.log('✅ deleteAsset successful\n');

      console.log('🎉 All tests passed!');

    } catch (error) {
      console.error('❌ Test failed:', error);
    }
  }

  testFabricCalls().catch(console.error);