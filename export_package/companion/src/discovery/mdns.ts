// @ts-nocheck
import Bonjour from 'bonjour-service';
import dotenv from 'dotenv';

dotenv.config();

const bonjour = new Bonjour();
const serviceName = process.env.MDNS_NAME || 'obs-companion';
const port = parseInt(process.env.PORT || '17800');

export const startDiscovery = () => {
    console.log(`[mDNS] Anunciando servicio: ${serviceName} en puerto ${port}`);

    const service = bonjour.publish({
        name: serviceName,
        type: 'obs-companion',
        protocol: 'tcp',
        port: port,
        txt: { version: '1.0.0' }
    });

    service.on('up', () => {
        console.log(`[mDNS] Servicio ${serviceName} está en línea.`);
    });
};

export const stopDiscovery = () => {
    bonjour.unpublishAll();
};
