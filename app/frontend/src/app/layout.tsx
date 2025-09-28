import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Credential Wallet Manager',
  description: 'Manage blockchain credentials with in-wallet approach on Hyperledger Fabric',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}