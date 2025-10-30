import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
  getDomain: (): Promise<string | undefined> => ipcRenderer.invoke('get-domain'),
  saveDomain: (domain: string): Promise<void> => ipcRenderer.invoke('set-domain', domain),
});