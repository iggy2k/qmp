import { ipcRenderer, contextBridge } from 'electron'

declare global {
    interface Window {
        Main: typeof api
        ipcRenderer: typeof ipcRenderer
    }
}

const validChannels = [
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
    'open-url',
    'set-audio-output-tm',
    'set-audio-output-fm',
    'get-audio-output-tm',
    'get-audio-output-fm',
    'reorder-playlist',
    'add-playlist-tm',
    'add-playlist-fm',
    'add-tracks-to-playlist-tm',
    'add-tracks-to-playlist-fm',
    'remove-track-from-playlist-tm',
    'remove-track-from-playlist-fm',
    'get-full-cover-tm',
    'get-full-cover-fm',
]

const api = {
    // meow vaga
    sendMessage: (message: string) => {
        ipcRenderer.send('message', message)
    },
    on: (channel: string, callback: (data: unknown) => void) => {
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
    SaveCover: (data: unknown, name: string) => {
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
    removeAllListeners: () => {
        for (const channel of validChannels) {
            ipcRenderer.removeAllListeners(channel)
        }
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    send: (channel: string, data: any) => {
        // whitelist channels
        if (validChannels.includes(channel)) {
            ipcRenderer.send(channel, data)
        }
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    receive: (channel: string, func: (...args: any[]) => void) => {
        if (validChannels.includes(channel)) {
            // Deliberately strip event as it includes `sender`
            ipcRenderer.on(channel, (_, ...args) => func(...args))
        }
    },
}

contextBridge.exposeInMainWorld('Main', api)
