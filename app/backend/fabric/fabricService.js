'use strict';

const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');

const CHANNEL_NAME = 'mychannel'; // Update as needed
const CHAINCODE_NAME = 'certificateContract'; // Your chaincode name

// Adjust this path to your connection profile
const ccpPath = path.resolve(__dirname, '..', 'connection-profile', 'connection.json');
const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

// Adjust this path to your wallet
const walletPath = path.join(__dirname, '..', 'wallet');

async function getContract() {
  const wallet = await Wallets.newFileSystemWallet(walletPath);

  const gateway = new Gateway();
  await gateway.connect(ccp, {
    wallet,
    identity: 'admin', // or your enrolled user
    discovery: { enabled: true, asLocalhost: true },
  });

  const network = await gateway.getNetwork(CHANNEL_NAME);
  const contract = network.getContract(CHAINCODE_NAME);

  return { contract, gateway };
}

module.exports = {
  async issueNewCertificate(studentDID, uni, degree, issuedDate) {
    const certId = `CERT-${Date.now()}`; // generate a simple unique ID
    const { contract, gateway } = await getContract();

    await contract.submitTransaction('issueCertificate', certId, studentDID, uni, degree, issuedDate);

    await gateway.disconnect();
    return certId;
  },

  async getExistingCertificate(certId) {
    const { contract, gateway } = await getContract();

    const result = await contract.evaluateTransaction('getCertificate', certId);

    await gateway.disconnect();
    return JSON.parse(result.toString());
  },

  async revokeCertificate(certId) {
    const { contract, gateway } = await getContract();

    await contract.submitTransaction('revokeCertificate', certId);

    await gateway.disconnect();
    return certId;
  },
};