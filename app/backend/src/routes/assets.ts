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
import type { Asset } from '../fabric/types';
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

assets.post('/', verifyWallet, async (c) => {
  const body = await c.req.json();
  const { id, owner, department, academicYear, startDate, endDate, certificateType } = body;

  if (!id || !owner || !department) return c.json({ success: false, error: 'Missing required fields' }, 400);

  const exists = await assetExists(id);
  if (exists) return c.json({ success: false, error: 'Asset already exists' }, 409);

  await createAsset(id, owner, department, academicYear, startDate, endDate, certificateType, '', 'draft', '0xfakehash');
  return c.json({ success: true, message: 'Asset created', id });
});

// Similarly add PUT / PATCH / DELETE / TRANSFER routes
export default assets;
