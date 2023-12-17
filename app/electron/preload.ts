import { ipcRenderer, contextBridge } from 'electron'

declare global {
    interface Window {
        Main: typeof api
        ipcRenderer: typeof ipcRenderer
    }
}

const api = {
    // meow vaga
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
    RemoveDir: (dir: string) => {
        ipcRenderer.send('remove-dir', dir)
    },
    setLastOpenDir: (dir: string) => {
        ipcRenderer.send('set-last-open-dir', dir)
    },
    setOldFile: (file: string) => {
        ipcRenderer.send('set-old-file', file)
    },
    setOldIndex: (idx: number) => {
        ipcRenderer.send('set-old-index', idx)
    },
    send: (channel: any, data: any) => {
        // whitelist channels
        let validChannels = [
            'open-settings-fm',
            'open-settings-tm',
            'get-height-from-main',
            'remove-dir',
            'get-old-idx-tm',
            'get-old-idx-fm',
            'set-old-file',
            'set-old-index',
            'set-last-open-dir',
            'restore-session-tm',
            'restore-session-fm',
            'add-dir-tm',
            'add-dir-fm',
            'add-dir-from-menu',
            'open-dir-tm',
            'open-dir-fm',
            'set-ui-colors-tm',
            'set-ui-colors-fm',
            'set-old-ui-colors-tm',
            'set-old-ui-colors-fm',
            'get-old-ui-colors-tm',
            'get-old-ui-colors-fm',
            'set-settings-tm',
            'set-settings-fm',
            'get-settings-tm',
            'get-settings-fm',
        ]
        if (validChannels.includes(channel)) {
            ipcRenderer.send(channel, data)
        }
    },
    receive: (channel: any, func: any) => {
        let validChannels = [
            'open-settings-fm',
            'open-settings-tm',
            'get-height-from-main',
            'remove-dir',
            'get-old-idx-tm',
            'get-old-idx-fm',
            'set-old-file',
            'set-old-index',
            'set-last-open-dir',
            'restore-session-tm',
            'restore-session-fm',
            'restore-session-fm',
            'add-dir-tm',
            'add-dir-fm',
            'add-dir-from-menu',
            'open-dir-tm',
            'open-dir-fm',
            'set-ui-colors-tm',
            'set-ui-colors-fm',
            'set-old-ui-colors-tm',
            'set-old-ui-colors-fm',
            'get-old-ui-colors-tm',
            'get-old-ui-colors-fm',
            'set-settings-tm',
            'set-settings-fm',
            'get-settings-tm',
            'get-settings-fm',
        ]
        if (validChannels.includes(channel)) {
            // Deliberately strip event as it includes `sender`
            ipcRenderer.on(channel, (_, ...args) => func(...args))
        }
    },
}

contextBridge.exposeInMainWorld('Main', api)
