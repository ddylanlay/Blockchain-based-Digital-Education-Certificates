const Certificate = require('../models/certificate.model.js');

const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');

exports.issueCertificate = async function (certData) {
  const ccpPath = path.resolve(__dirname, '../../network/connection-profile.json');
  const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

  const wallet = await Wallets.newFileSystemWallet('./wallet');
  const gateway = new Gateway();
  await gateway.connect(ccp, {
    wallet,
    identity: 'universityAdmin',
    discovery: { enabled: true, asLocalhost: true },
  });

  const network = await gateway.getNetwork('mychannel');
  const contract = network.getContract('certificate');

  const result = await contract.submitTransaction(
    'issueCertificate',
    certData.certId,
    certData.studentDID,
    certData.uni,
    certData.degree,
    certData.issuedDate
  );

  await gateway.disconnect();
  return JSON.parse(result.toString());
};

exports.getAllAdminCertificates = function (req, res) {
  const certificates = Certificate.getAllAdminCertificates();
  res.json(certificates);
};

exports.getAllDashboardCertificates = function (req, res) {
  const certificates = Certificate.getAllDashboardCertificates();
  res.json(certificates);
};

exports.revokeCertificate = function (req, res) {
  const { id } = req.params;
  const isRevoked = Certificate.revokeCertificate(id);

  if (isRevoked) {
    res.json({ message: `Certificate with ID ${id} has been revoked.` });
  } else {
    res.status(404).json({ message: `Certificate with ID ${id} not found.` });
  }
};

