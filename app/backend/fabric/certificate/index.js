'use strict';

import { Contract } from 'fabric-contract-api';

class CertificateContract extends Contract {
  async initLedger(ctx) {
    console.log('Ledger initialized');
  }

  async issueCertificate(ctx, certId, studentDID, uni, degree, issuedDate) {
    const cert = {
      certId,
      studentDID,
      university: uni,
      degree,
      issuedDate,
      revoked: false,
    };
    await ctx.stub.putState(certId, Buffer.from(JSON.stringify(cert)));
    return JSON.stringify(cert);
  }

  async getCertificate(ctx, certId) {
    const certJSON = await ctx.stub.getState(certId);
    if (!certJSON || certJSON.length === 0) {
      throw new Error(`Certificate ${certId} does not exist`);
    }
    return certJSON.toString();
  }

  async revokeCertificate(ctx, certId) {
    const certJSON = await ctx.stub.getState(certId);
    if (!certJSON || certJSON.length === 0) {
      throw new Error(`Certificate ${certId} does not exist`);
    }

    const cert = JSON.parse(certJSON.toString());
    cert.revoked = true;

    await ctx.stub.putState(certId, Buffer.from(JSON.stringify(cert)));
    return certId;
  }
}

export default CertificateContract;