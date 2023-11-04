import { ipcRenderer, contextBridge } from 'electron'

declare global {
    interface Window {
        Main: typeof api
        ipcRenderer: typeof ipcRenderer
    }
}

const api = {
    sendMessage: (message: string) => {
        ipcRenderer.send('message', message)
    },
    on: (channel: string, callback: (data: any) => void) => {
        ipcRenderer.on(channel, (_, data) => callback(data))
    },
    Resize: () => {
        ipcRenderer.send('resize')
    },
    Minimize: () => {
        ipcRenderer.send('minimize')
    },
    Close: () => {
        ipcRenderer.send('close')
    },
    AlwaysOnTop: () => {
        ipcRenderer.send('always-on-top')
    },
    ReadInBlob: (path: string) => {
        ipcRenderer.send('read-in-blob', path)
    },
    SaveCover: (data: any, name: string) => {
        ipcRenderer.send('save-cover', data, name)
    },
    GetHeight: () => {
        ipcRenderer.send('get-height')
    },
    GetOldDirs: () => {
        ipcRenderer.send('get-old-dirs')
    },
    RemoveDir: (dir: string) => {
        ipcRenderer.send('remove-dir', dir)
    },
    send: (channel: any, data: any) => {
        // whitelist channels
        let validChannels = [
            'toMain',
            'fromMain',
            'get-files-from-main',
            'get-files-to-main',
            'open-folder-fm',
            'open-folder-tm',
            'open-settings-fm',
            'open-settings-tm',
            'get-height-from-main',
            'get-old-dirs-from-main',
            'remove-dir',
        ]
        if (validChannels.includes(channel)) {
            ipcRenderer.send(channel, data)
        }
    },
    receive: (channel: any, func: any) => {
        let validChannels = [
            'toMain',
            'fromMain',
            'get-files-from-main',
            'get-files-to-main',
            'open-folder-fm',
            'open-folder-tm',
            'open-settings-fm',
            'open-settings-tm',
            'get-height-from-main',
            'get-old-dirs-from-main',
            'remove-dir',
        ]
        if (validChannels.includes(channel)) {
            // Deliberately strip event as it includes `sender`
            ipcRenderer.on(channel, (_, ...args) => func(...args))
        }
    },
}

contextBridge.exposeInMainWorld('Main', api)
