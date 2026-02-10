// @ts-nocheck
import OBSWebSocket from 'obs-websocket-js';
import dotenv from 'dotenv';

dotenv.config();

export class OBSClient {
  private obs: OBSWebSocket;
  private connected: boolean = false;
  private currentUrl: string = process.env.OBS_WS_URL || 'ws://127.0.0.1:4455';
  private currentPassword: string = process.env.OBS_WS_PASSWORD || '';

  constructor() {
    this.obs = new OBSWebSocket();
  }

  async connect(url?: string, password?: string) {
    if (url) this.currentUrl = url;
    if (password !== undefined) this.currentPassword = password;

    try {
      if (this.connected) {
        await this.obs.disconnect();
      }

      await this.obs.connect(this.currentUrl, this.currentPassword);
      this.connected = true;
      console.log(`[OBS] Conectado exitosamente a ${this.currentUrl}`);
      return { status: 'ok' };
    } catch (error) {
      console.error('[OBS] Error de conexión:', error);
      this.connected = false;
      throw error;
    }
  }

  async getAudioSources() {
    if (!this.connected) await this.connect();

    // Obtenemos todas las fuentes de entrada de audio
    const inputs = await this.obs.call('GetInputList', { inputKind: 'wasapi_input_capture' });
    const outputs = await this.obs.call('GetInputList', { inputKind: 'wasapi_output_capture' });

    // Combinar y obtener estados de mute
    const allInputs = [...inputs.inputs, ...outputs.inputs];
    const sourcesWithStatus = await Promise.all(allInputs.map(async (input) => {
      const muteStatus = await this.obs.call('GetInputMute', { inputName: input.inputName });
      return {
        name: input.inputName,
        kind: input.inputKind,
        muted: muteStatus.inputMuted
      };
    }));

    return sourcesWithStatus;
  }

  async setMute(inputName: string, inputMuted: boolean) {
    if (!this.connected) await this.connect();
    return await this.obs.call('SetInputMute', { inputName, inputMuted });
  }

  async getScenes() {
    if (!this.connected) await this.connect();
    return await this.obs.call('GetSceneList');
  }

  async setCurrentScene(sceneName: string) {
    if (!this.connected) await this.connect();
    return await this.obs.call('SetCurrentProgramScene', { sceneName });
  }

  on(event: string, callback: any) {
    this.obs.on(event as any, callback);
  }

  isConnected() {
    return this.connected;
  }
}

export const obsClient = new OBSClient();
