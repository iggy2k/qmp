import { join } from 'path'
import {
    BrowserWindow,
    app,
    ipcMain,
    IpcMainEvent,
    screen,
    dialog,
    Menu,
    shell,
    nativeImage,
} from 'electron'
import isDev from 'electron-is-dev'
import * as mm from 'music-metadata'
import * as fs from 'fs'
import Store from 'electron-store'

import sharp from 'sharp'
import { IAudioMetadata } from 'music-metadata'

export interface Settings {
    useCover: boolean
    movingColors: boolean
    downloadCover: boolean
    transparentInactive: boolean
    bottomBar: boolean
    framelessWindow: boolean
}

interface Playlist {
    name: string
    tracks: string[]
}

const WIN_HEIGHT = 450
const WIN_HEIGHT_MAX = 600

const WIN_WIDTH_MIN = 450
// const WIN_WIDTH_MAX = 800
// const WIN_WIDTH_MIN = 800
const WIN_WIDTH_MAX = 1200

const HTML5_AUDIO = [
    'wav',
    'mpeg',
    'aac',
    'aacp',
    'caf',
    'mp3',
    'mp4',
    'flac',
    'webm',
    'ogg',
] // Incomplete, still covers 99.9% use cases
let resized = true
const store = new Store()

const DEBUG = true

if (
    !store.get('playlists') ||
    (store.get('playlists') as Playlist[]).length < 1
) {
    store.set('playlists', [])
}

if (!store.get('settings')) {
    store.set('settings', {
        useCover: false,
        movingColors: false,
        downloadCover: true,
        transparentInactive: false,
        bottomBar: true,
        framelessWindow: true,
    })
}

if (!store.get('old_ui_colors')) {
    store.set('old_ui_colors', {
        background: '#333333',
        accent: '#333333',
        text: '#333333',
        altText: '#333333',
    })
}

DEBUG && console.log('\nUserdata: ' + app.getPath('userData') + '\n')

function checkExension(file: string) {
    return (
        HTML5_AUDIO.includes(file.split('.').pop()!) &&
        fs.statSync(file).isFile()
    )
}

async function processAsync(md: IAudioMetadata) {
    let data
    if (mm.selectCover(md!.common.picture)) {
        data = mm.selectCover(md!.common.picture)?.data
    } else {
        data = null
    }
    if (!data) {
        return null
    }
    return sharp(data)
        .resize(48, 48)
        .toFormat('jpeg')
        .jpeg({
            quality: 100,
            chromaSubsampling: '4:4:4',
            force: true, // <----- add this parameter
        })
        .toBuffer()
        .then((res) => {
            // console.log(`data:image/jpeg;base64,${res}`)
            return `data:image/jpeg;base64,${res.toString('base64')}`
        })
}

async function openFiles(files: string[]) {
    const promises = []
    for (let i = 0; i < files.length; i++) {
        promises.push(mm.parseFile(files[i]))
    }

    const res1 = await Promise.all(promises)

    const res2 = res1.map((i) => processAsync(i))

    const res3 = await Promise.all(res2)

    return [res1, res3]
}

async function getFullRezCover(file: string) {
    const fileMetaData = await mm.parseFile(file)
    let cover = ''

    if (mm.selectCover(fileMetaData.common.picture)) {
        cover =
            mm
                .selectCover(fileMetaData.common.picture)
                ?.data.toString('base64') || ''
    }
    if (!cover) {
        return ''
    }
    return `data:image/jpeg;base64,${cover}`
}

function rreaddirSync(dir: string, allFiles: string[] = []) {
    const files = fs.readdirSync(dir).map((f) => join(dir, f))

    allFiles.push(...files)
    files.forEach((f) => {
        f && fs.statSync(f).isDirectory() && rreaddirSync(f, allFiles)
    })

    return allFiles
}

function createWindow() {
    const oldSettings = store.get('settings') as {
        useCover: boolean
        movingColors: boolean
        downloadCover: boolean
        transparentInactive: boolean
        bottomBar: boolean
        framelessWindow: boolean
    }
    const WIN_HEIGHT_MIN = 85 + (!oldSettings.framelessWindow ? 30 : 0)
    const appIcon = nativeImage.createFromPath(
        join(__dirname, '../public/icon.png')
    )
    app.dock.setIcon(appIcon)
    const window = new BrowserWindow({
        height: 1,
        width: 1,
        frame: !oldSettings.framelessWindow,
        show: false,
        resizable: true,
        fullscreenable: false,
        title: 'qmp',
        icon: appIcon,
        minWidth: WIN_WIDTH_MIN,
        minHeight: WIN_HEIGHT_MIN,
        maxWidth: WIN_WIDTH_MAX,
        maxHeight: WIN_HEIGHT_MAX,
        vibrancy: 'appearance-based',
        backgroundMaterial: 'auto',
        webPreferences: {
            webSecurity: false,
            nodeIntegration: true,
            preload: join(__dirname, 'preload.js'),
        },
    })

    const settings = new BrowserWindow({
        height: 300,
        width: 450,
        frame: true,
        show: false,
        resizable: false,
        fullscreenable: false,
        webPreferences: {
            webSecurity: false,
            nodeIntegration: true,
            preload: join(__dirname, 'preload.js'),
        },
    })

    const port = process.env.PORT || 3000
    const url = isDev
        ? `http://localhost:${port}`
        : join(__dirname, '../src/out/index.html')

    if (isDev) {
        window?.loadURL(url)
    } else {
        window?.loadFile(url)
    }

    setTimeout(function () {
        window.show()
        const bounds = screen.getPrimaryDisplay().bounds
        const x = bounds.x + (bounds.width - WIN_WIDTH_MIN) / 2
        const y = bounds.y + (bounds.height - WIN_HEIGHT) / 2
        window.setPosition(x, y)
        window?.setSize(WIN_WIDTH_MIN, WIN_HEIGHT, true)
        window?.webContents.openDevTools()
    }, 100)

    ipcMain.on('resize', () => {
        if (resized) {
            window.setMaximumSize(WIN_WIDTH_MAX, WIN_HEIGHT_MIN)
            window?.setSize(window?.getSize()[0], WIN_HEIGHT_MIN, true)
            window.webContents.send('get-height-from-main', WIN_HEIGHT_MIN)
        } else {
            window.setMaximumSize(WIN_WIDTH_MAX, WIN_HEIGHT_MAX)
            window?.setSize(window?.getSize()[0], WIN_HEIGHT, true)
            window.webContents.send('get-height-from-main', WIN_HEIGHT)
        }
        resized = !resized
    })

    ipcMain.on('minimize', () => {
        window?.minimize()
    })

    ipcMain.on('close', () => {
        window?.close()
        app?.exit()
    })

    ipcMain.on('always-on-top', () => {
        if (window.isAlwaysOnTop()) {
            window?.setAlwaysOnTop(false)
        } else {
            window?.setAlwaysOnTop(true)
        }
    })

    ipcMain.on(
        'set-ui-colors-tm',
        (
            _,
            UIColors: {
                background: string
                accent: string
                text: string
                altText: string
            }
        ) => {
            DEBUG && console.log('set-ui-colors-tm ' + JSON.stringify(UIColors))
            window.webContents.send('set-ui-colors-fm', UIColors)
        }
    )

    ipcMain.on(
        'set-old-ui-colors-tm',
        (
            _,
            UIColors: {
                background: string
                accent: string
                text: string
                altText: string
            }
        ) => {
            DEBUG &&
                console.log('set-old-ui-colors-tm ' + JSON.stringify(UIColors))
            store.set('old_ui_colors', UIColors)
        }
    )

    ipcMain.on('get-old-ui-colors-tm', () => {
        const UIColors = store.get('old_ui_colors')
        DEBUG && console.log('get-old-ui-colors-tm ' + JSON.stringify(UIColors))
        window.webContents.send('get-old-ui-colors-fm', UIColors)
        settings.webContents.send('get-old-ui-colors-fm', UIColors)
    })

    ipcMain.on('set-settings-tm', (_, settings: Settings) => {
        DEBUG && console.log('set-settings-tm ' + JSON.stringify(settings))
        store.set('settings', settings)
        window.webContents.send('set-settings-fm', settings)
    })

    ipcMain.on('get-settings-tm', () => {
        const oldSettings = store.get('settings')
        DEBUG && console.log('get-settings-tm ' + JSON.stringify(oldSettings))
        window.webContents.send('get-settings-fm', oldSettings)
        settings.webContents.send('get-settings-fm', oldSettings)
    })

    // Restore colors when closing settings
    settings?.on('close', () => {
        const UIColors = store.get('old_ui_colors')
        DEBUG && console.log('get-old-ui-colors-tm ' + JSON.stringify(UIColors))
        window.webContents.send('get-old-ui-colors-fm', UIColors)
    })

    ipcMain.on('get-full-cover-tm', (_, file: string) => {
        getFullRezCover(file).then((cover: string) => {
            window.webContents.send('get-full-cover-fm', cover)
        })
    })

    ipcMain.on('open-dir-tm', (_, args: unknown[]) => {
        DEBUG && console.log('open-dir-tm ' + args)
        const dir = args[0]
        const changeIndex = args[1]

        // let file_list = rreaddirSync(dir, [])
        // file_list = file_list.filter(checkExension)

        const playlists = store.get('playlists') as Playlist[]

        if (!playlists) {
            return
        }

        const playlist = playlists.filter((e: Playlist) => e.name === dir)[0]

        if (!playlist) {
            return
        }

        const tracks = playlist.tracks

        if (!tracks) {
            return
        }

        openFiles(tracks).then((files_data_array) => {
            window.webContents.send(
                'open-dir-fm',
                dir,
                files_data_array,
                tracks,
                changeIndex
            )
        })
    })

    ipcMain.on('set-audio-output-tm', (_, deviceId: string) => {
        window.webContents.send('set-audio-output-fm', deviceId)
    })

    ipcMain.on('get-audio-output-tm', (_, sinkId: string) => {
        settings.webContents.send('get-audio-output-fm', sinkId)
    })

    ipcMain.on('set-old-file', (_, file: string) => {
        DEBUG && console.log('set-old-file ' + file)
        file ? store.set('last_file', file) : store.delete('last_file')
    })

    ipcMain.on('set-old-index', (_, index: number) => {
        DEBUG && console.log('set-old-index ' + index)
        index ? store.set('last_index', index) : store.delete('last_index')
    })

    ipcMain.on('set-last-open-dir', (_, dir: string) => {
        DEBUG && console.log('set-last-open-dir ' + dir)
        dir !== ''
            ? store.set('last_open_dir', dir)
            : store.delete('last_open_dir')
    })

    ipcMain.on('add-dir-tm', () => {
        DEBUG && console.log('add-dir-tm')
        const dirpath = dialog.showOpenDialogSync(window, {
            properties: ['openDirectory'],
            defaultPath: '',
        })

        const dir = dirpath?.pop()

        if (!dir) {
            return
        }

        let file_list = rreaddirSync(dir, [])
        file_list = file_list.filter(checkExension)

        if (file_list.length < 1) {
            return
        }

        openFiles(file_list)
            .then((files_data_array) => {
                window.webContents.send(
                    'add-dir-fm',
                    dir,
                    files_data_array,
                    file_list
                )

                const playlists = store.get('playlists') as Playlist[]

                if (playlists) {
                    if (!playlists.map((e: Playlist) => e.name).includes(dir)) {
                        store.set(
                            'playlists',
                            playlists.concat([{ name: dir, tracks: file_list }])
                        )
                    }
                } else {
                    store.set('playlists', [{ name: dir, tracks: file_list }])
                }
            })
            .catch((e: Error) => {
                console.log(e)
            })
    })

    ipcMain.on('add-playlist-tm', () => {
        const playlists = store.get('playlists') as Playlist[]

        const playlist = playlists.length.toString()

        if (playlists) {
            if (!playlists.map((e: Playlist) => e.name).includes(playlist)) {
                store.set(
                    'playlists',
                    playlists.concat([{ name: playlist, tracks: [] }])
                )
            }
        } else {
            store.set('playlists', [{ name: playlist, tracks: [] }])
        }
        window.webContents.send('add-playlist-fm', playlist, [], [])
    })

    ipcMain.on(
        'remove-track-from-playlist-tm',
        (_, args: { track_file: string; playlist: string }) => {
            const playlists = store.get('playlists') as Playlist[]

            const this_playlist_idx = playlists.findIndex((e: Playlist) => {
                return e.name === args.playlist
            })

            if (!this_playlist_idx) {
                return
            }

            const this_playlist = playlists[this_playlist_idx]

            console.log(this_playlist)

            this_playlist.tracks = this_playlist.tracks.filter(
                (e: string) => e !== args.track_file
            )

            playlists[this_playlist_idx] = this_playlist

            store.set('playlists', playlists)

            console.log(this_playlist)

            window.webContents.send('add-tracks-to-playlist-fm', args.playlist)
        }
    )

    ipcMain.on(
        'add-tracks-to-playlist-tm',
        (
            event,
            args: {
                playlist: string
                paths: string[]
            }
        ) => {
            console.log('Dropped File(s):', args.paths)

            const paths_filtered = args.paths.filter((e) =>
                HTML5_AUDIO.includes(e.split('.').pop()!)
            )

            if (paths_filtered.length === 0) {
                return
            }

            event.returnValue = `Received ${paths_filtered} paths.`

            const playlists = store.get('playlists') as Playlist[]

            const this_playlist_idx = playlists.findIndex((e: Playlist) => {
                return e.name === args.playlist
            })

            if (!this_playlist_idx) {
                return
            }

            const this_playlist = playlists[this_playlist_idx]

            this_playlist.tracks = this_playlist.tracks.concat(paths_filtered)

            playlists[this_playlist_idx] = this_playlist

            store.set('playlists', playlists)

            console.log(this_playlist)

            window.webContents.send('add-tracks-to-playlist-fm', args.playlist)
        }
    )

    ipcMain.on('open-settings-tm', () => {
        DEBUG && console.log('opening settings at ' + url + '/settings')
        if (isDev) {
            settings?.loadURL(url + '#/settings')
        } else {
            // This works
            settings.loadURL(`file://${url}#/settings`)
            // This doesn't
            // settings?.loadFile(url + '#/settings')
        }
        // settings?.webContents.openDevTools()
        settings?.show()
    })

    ipcMain.on('save-cover', (_, data: string, name: string) => {
        const split = data.split(';base64')
        const file = dialog.showSaveDialogSync(window, {
            defaultPath:
                name +
                '.' +
                split[0].substring('data:image/'.length, split[0].length),
        })
        file &&
            fs.writeFileSync(file, split[1], {
                encoding: 'base64',
            })
    })

    ipcMain.on('restore-session-tm', () => {
        const last_open_dir = store.get('last_open_dir')
        const last_file = store.get('last_file')
        const last_index = store.get('last_index') || 0
        if (!last_open_dir || !last_file) {
            return
        }
        const past_playlists = store.get('playlists') as Playlist[]

        const past_dirs = past_playlists.map((pl: Playlist) => pl.name)

        DEBUG &&
            console.log(
                `last_open_dir = ${last_open_dir} \n last_file = ${last_file} \n past_dirs = ${past_dirs} \n last_index = ${last_index}`
            )

        window.webContents.send(
            'restore-session-fm',
            last_open_dir,
            last_file,
            past_dirs,
            last_index
        )
    })

    ipcMain.on(
        'reorder-playlist',
        (_, data: { new_playlist: string[]; playlist_name: string }) => {
            console.log(data)

            const playlists = store.get('playlists') as Playlist[]

            const filteredPlaylists = playlists.map(function (e: Playlist) {
                if (e.name === data.playlist_name) {
                    e.tracks = data.new_playlist
                    return e
                } else {
                    return e
                }
            })

            store.set('playlists', filteredPlaylists)
        }
    )

    ipcMain.on('remove-dir', (_, dir: string) => {
        const playlists = store.get('playlists') as Playlist[]

        const filteredPlaylists = playlists.filter(function (e: Playlist) {
            return e.name !== dir
        })

        store.set('playlists', filteredPlaylists)
    })

    window.on('resize', () => {
        window.webContents.send(
            'get-height-from-main',
            window.getBounds().height
        )
    })

    window.on('resized', () => {
        window.webContents.send(
            'get-height-from-main',
            window.getBounds().height
        )
    })

    window.on('blur', () => {
        if (oldSettings.framelessWindow) {
            window.setOpacity(0.85)
        }
    })

    window.on('focus', () => {
        window.setOpacity(1)
    })

    settings?.on('close', function (evt) {
        evt.preventDefault()
        settings?.hide()
    })

    ipcMain.on('open-url', (_, url: string) => {
        shell.openExternal(url)
    })
}

app.whenReady().then(() => {
    const menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)
    createWindow()
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})

ipcMain.on('message', (event: IpcMainEvent, message: string) => {
    setTimeout(
        () => event.sender.send('message', `electron received ${message}`),
        500
    )
})

const isMac = process.platform === 'darwin'

const template = [
    ...(isMac
        ? [
              {
                  label: app.name,
                  submenu: [
                      { role: 'hide' },
                      { role: 'hideOthers' },
                      { role: 'unhide' },
                      { type: 'separator' },
                      { role: 'quit' },
                  ],
              },
          ]
        : []),
    {
        label: 'Folder',
        submenu: [
            {
                label: 'Add a folder',
                click: () => {
                    const focusedWindow = BrowserWindow.getFocusedWindow()
                    focusedWindow?.webContents.send('add-dir-from-menu', null)
                },
            },
        ],
    },
    {
        label: 'Window',
        submenu: [
            { role: 'minimize' },
            ...(isMac
                ? [
                      { type: 'separator' },
                      { role: 'front' },
                      { type: 'separator' },
                      { role: 'window' },
                  ]
                : [{ role: 'close' }]),
        ],
    },
] as Electron.MenuItemConstructorOptions[]
