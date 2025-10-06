import { ethers } from 'ethers';
import type { Context } from 'hono';

export const verifyWallet = async (c: Context, next: () => Promise<void>) => {
  try {
    const { signature, message, walletAddress } = await c.req.json();
    if (!signature || !message || !walletAddress) {
      return c.json({ success: false, error: 'Wallet signature, message, and address required' }, 400);
    }

    const recovered = ethers.verifyMessage(message, signature);
    if (recovered.toLowerCase() !== walletAddress.toLowerCase()) {
      return c.json({ success: false, error: 'Invalid wallet signature' }, 401);
    }

    c.set('walletAddress', walletAddress);
    await next();
  } catch (err) {
    console.error('Wallet verification failed', err);
    return c.json({ success: false, error: 'Wallet verification failed' }, 401);
  }
};
