const certificatesData = require("./data/certificates-data.json");
const dashboardCertificatesData = require("./data/dashboard-certificates-data.json");
  
export default class Certificate {
    static getAllAdminCertificates() {
        return certificatesData;
    }

    static getAllDashboardCertificates() {
        return dashboardCertificatesData;
    }

    static revokeCertificate(id) {
        const certificateIndex = certificatesData.findIndex(cert => cert.id === id);

        if (certificateIndex !== -1) {
            certificatesData[certificateIndex].status = "revoked";
            certificatesData[certificateIndex].revokedReason = "Revoked via API";
            return true;
        }

        return false;
    }
}