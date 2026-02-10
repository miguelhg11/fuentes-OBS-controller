// @ts-nocheck
import OBSWebSocket from 'obs-websocket-js';
import dotenv from 'dotenv';

dotenv.config();

export class OBSClient {
  private obs: OBSWebSocket;
  private connected: boolean = false;

  constructor() {
    this.obs = new OBSWebSocket();
  }

  async connect() {
    try {
      await this.obs.connect(process.env.OBS_WS_URL || 'ws://127.0.0.1:4455', process.env.OBS_WS_PASSWORD);
      this.connected = true;
      console.log('[OBS] Conectado exitosamente');
    } catch (error) {
      console.error('[OBS] Error de conexión:', error);
      this.connected = false;
    }
  }

  async getScenes() {
    console.log('[OBS] Solicitando lista de escenas...');
    if (!this.connected) await this.connect();
    const result = await this.obs.call('GetSceneList');
    console.log(`[OBS] Recibidas ${result.scenes.length} escenas`);
    return result;
  }

  async getSceneItems(sceneName: string) {
    console.log(`[OBS] Solicitando items para escena: ${sceneName}`);
    if (!this.connected) await this.connect();
    const result = await this.obs.call('GetSceneItemList', { sceneName });
    console.log(`[OBS] Recibidos ${result.sceneItems.length} items`);
    return result;
  }

  async setCurrentScene(sceneName: string) {
    if (!this.connected) await this.connect();
    return await this.obs.call('SetCurrentProgramScene', { sceneName });
  }

  async setSceneItemEnabled(sceneName: string, sceneItemId: number, sceneItemEnabled: boolean) {
    if (!this.connected) await this.connect();
    return await this.obs.call('SetSceneItemEnabled', { sceneName, sceneItemId, sceneItemEnabled });
  }

  on(event: string, callback: any) {
    this.obs.on(event as any, callback);
  }
}

export const obsClient = new OBSClient();
