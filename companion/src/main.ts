import { app, BrowserWindow } from 'electron';
import path from 'path';
import { startServer } from './index';
import os from 'os';

let mainWindow: BrowserWindow | null = null;

function getNetworkIPs() {
    const interfaces = os.networkInterfaces();
    const addresses: string[] = [];
    for (const k in interfaces) {
        for (const k2 in interfaces[k]!) {
            const address = interfaces[k]![k2];
            if (address.family === 'IPv4' && !address.internal) { addresses.push(address.address); }
        }
    }
    return addresses;
}

async function createWindow() {
    mainWindow = new BrowserWindow({
        width: 600, height: 850, title: "OBS Orchestra - Dashboard",
        backgroundColor: '#000000', webPreferences: { nodeIntegration: true, contextIsolation: false },
        autoHideMenuBar: true, resizable: false
    });

    const port = 17800;
    const appPath = app.getAppPath();
    const isPackaged = app.isPackaged;

    const pwaPath = isPackaged ? path.join(appPath, 'pwa_dist') : path.join(appPath, '../pwa_dist');

    try { await startServer(port, pwaPath); } catch (e) { console.error(e); }

    const ips = getNetworkIPs();
    const baseUrl = `http://${ips[0] || 'localhost'}:${port}`;
    const dashboardPath = isPackaged ? path.join(appPath, 'dashboard/index.html') : path.join(appPath, '../dashboard/index.html');

    mainWindow.loadFile(dashboardPath, { query: { url: baseUrl, ips: ips.join(','), port: port.toString() } });
    mainWindow.on('closed', () => { mainWindow = null; app.quit(); });

}

app.on('ready', createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') { app.quit(); } });
