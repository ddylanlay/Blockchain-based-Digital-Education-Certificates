import { Router } from 'express';
const router = Router();
import { getAllAdminCertificates, getAllDashboardCertificates, revokeCertificate } from '../controllers/certficateController.js';

router.get('/admin/certificates', getAllAdminCertificates);
router.get('/dashboard/certificates', getAllDashboardCertificates);
router.post('/admin/certificates/:id/revoke', revokeCertificate);

const fabricService = require('../fabric/fabricService');

router.post('/issue', async (req, res) => {
  try {
    const { studentDID, uni, degree, issuedDate } = req.body;
    const txId = await fabricService.issueNewCertificate(studentDID, uni, degree, issuedDate);
    res.status(201).json({ message: 'Certificate issued successfully', transactionId: txId });
  } catch (error) {
    console.error('Failed to issue certificate:', error);
    res.status(500).json({ error: 'Failed to issue certificate' });
  }
});

router.get('/:certId', async (req, res) => {
  try {
    const certificate = await fabricService.getExistingCertificate(req.params.certId);
    res.status(200).json(certificate);
  } catch (error) {
    console.error('Failed to get certificate:', error);
    res.status(404).json({ error: 'Certificate not found' });
  }
});

module.exports = router;

export default router;