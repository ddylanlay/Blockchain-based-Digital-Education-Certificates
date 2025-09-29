import { Hono } from 'hono';
import {
    getAllAssets,
    createAsset,
    readAsset,
    updateAsset,
    deleteAsset,
    updateAssetStatus,
    transferAsset,
    assetExists
} from '../fabric/fabric';
import { verifyWallet } from './auth';

const assets = new Hono();

assets.get('/', async (c) => {
    const allAssets = await getAllAssets();
    return c.json({ success: true, data: allAssets, count: allAssets.length });
});

assets.get('/:id', async (c) => {
    const id = c.req.param('id');
    const exists = await assetExists(id);
    if (!exists) return c.json({ success: false, error: 'Asset not found' }, 404);

    const asset = await readAsset(id);
    return c.json({ success: true, data: asset });
});

assets.get('/owner/:name', async (c) => {
    const owner = c.req.param('name').toLowerCase();
    const allAssets = await getAllAssets();
    console.log('All Assets:', allAssets);
    const ownerAssets = allAssets.filter((asset) => asset.Owner.toLowerCase() === owner);
    return c.json({ success: true, data: ownerAssets, count: ownerAssets.length });
});

assets.post('/', verifyWallet, async (c) => {
    const body = await c.req.json();
    const { id, owner, department, academicYear, startDate, endDate, certificateType } = body;

    if (!id || !owner || !department) return c.json({ success: false, error: 'Missing required fields' }, 400);

    const exists = await assetExists(id);
    if (exists) return c.json({ success: false, error: 'Asset already exists' }, 409);

    await createAsset(id, owner, department, academicYear, startDate, endDate, certificateType, '', 'draft', '0xfakehash');
    return c.json({ success: true, message: 'Asset created', id });
});

assets.put('/:id', verifyWallet, async (c) => {
    const id = c.req.param('id');
    const body = await c.req.json();
    const exists = await assetExists(id);
    if (!exists) return c.json({ success: false, error: 'Asset not found' }, 404);

    const {
        owner,
        department,
        academicYear,
        startDate,
        endDate,
        certificateType,
        issueDate,
        status,
        txHash
    } = body;

    await updateAsset(
        id,
        owner,
        department,
        academicYear,
        startDate,
        endDate,
        certificateType,
        issueDate,
        status,
        txHash
    );
    return c.json({ success: true, message: 'Asset updated', id });
});

assets.patch('/:id/status', verifyWallet, async (c) => {
    const id = c.req.param('id');
    const { status } = await c.req.json();
    const exists = await assetExists(id);
    if (!exists) return c.json({ success: false, error: 'Asset not found' }, 404);

    await updateAssetStatus(id, status);
    return c.json({ success: true, message: 'Asset status updated', id, status });
});

assets.post('/:id/transfer', verifyWallet, async (c) => {
    const id = c.req.param('id');
    const { newOwner } = await c.req.json();
    const exists = await assetExists(id);
    if (!exists) return c.json({ success: false, error: 'Asset not found' }, 404);

    await transferAsset(id, newOwner);
    return c.json({ success: true, message: 'Asset transferred', id, newOwner });
});

assets.delete('/:id', verifyWallet, async (c) => {
    const id = c.req.param('id');
    const exists = await assetExists(id);
    if (!exists) return c.json({ success: false, error: 'Asset not found' }, 404);

    await deleteAsset(id);
    return c.json({ success: true, message: 'Asset deleted', id });
});

export default assets;
