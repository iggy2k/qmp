import { ipcRenderer, contextBridge } from 'electron';

declare global {
    interface Window {
        Main: typeof api;
        ipcRenderer: typeof ipcRenderer;
    }
}

const api = {
    sendMessage: (message: string) => {
        ipcRenderer.send('message', message);
    },
    on: (channel: string, callback: (data: any) => void) => {
        ipcRenderer.on(channel, (_, data) => callback(data));
    },
    Resize: () => {
        ipcRenderer.send('resize');
    },
    AlwaysOnTop: () => {
        ipcRenderer.send('always-on-top');
    },
};

contextBridge.exposeInMainWorld('Main', api);