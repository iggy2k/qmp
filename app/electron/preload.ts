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
    ReadInBlob: (path: string) => {
        ipcRenderer.send('read-in-blob', path);
    },
    send: (channel: any, data: any) => {
        // whitelist channels
        let validChannels = ["toMain", "fromMain"];
        if (validChannels.includes(channel)) {
            ipcRenderer.send(channel, data);
        }
    },
    receive: (channel: any, func: any) => {
        let validChannels = ["toMain", "fromMain"];
        if (validChannels.includes(channel)) {
            // Deliberately strip event as it includes `sender` 
            ipcRenderer.on(channel, (_, ...args) => func(...args));
        }
    }
};

contextBridge.exposeInMainWorld('Main', api);