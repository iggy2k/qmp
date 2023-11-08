import { join } from 'path'
import {
    BrowserWindow,
    app,
    ipcMain,
    IpcMainEvent,
    screen,
    dialog,
    Menu,
} from 'electron'
import isDev from 'electron-is-dev'
import * as mm from 'music-metadata'
import * as fs from 'fs'
// import path from 'path'
import Store from 'electron-store'

const WIN_HEIGHT = 450
const WIN_HEIGHT_MIN = 102
const WIN_HEIGHT_MAX = 600

const WIN_WIDTH_MIN = 800
const WIN_WIDTH_MAX = 800
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
] // Incomplete
var resized = true
var onTop = false
const store = new Store()

if ((store.get('all_dirs') as string[]).length < 1) {
    store.set('all_dirs', [])
}
console.log('\nUserdata: ' + app.getPath('userData') + '\n')

function checkExension(file: string) {
    return (
        HTML5_AUDIO.includes(file.split('.').pop()!) &&
        fs.statSync(file).isFile()
    )
}

function openFiles(files: string[]) {
    const promises = []
    for (let i = 0; i < files.length; i++) {
        // console.log('file: ' + files[i])
        promises.push(mm.parseFile(files[i]))
    }
    return Promise.all(promises)
        .then((results) => {
            const covers = results.map((md) =>
                mm.selectCover(md!.common.picture)
                    ? `data:image/jpeg;base64,${mm
                          .selectCover(md!.common.picture)
                          ?.data.toString('base64')}`
                    : null
            )
            return [results, covers]
        })
        .catch((e) => {
            console.log('openFiles: ' + e)
        })
}

function rreaddirSync(dir: string, allFiles: string[] = []) {
    let files = fs.readdirSync(dir).map((f) => join(dir, f))

    allFiles.push(...files)
    files.forEach((f) => {
        f && fs.statSync(f).isDirectory() && rreaddirSync(f, allFiles)
    })

    return allFiles
}

function createWindow() {
    const window = new BrowserWindow({
        height: 1,
        width: 1,
        frame: false,
        show: false,
        resizable: true,
        fullscreenable: true,
        title: 'qmp',
        icon: '/Users/iggy/Documents/GitHub/qmp/app/public/drawing.png',
        minWidth: WIN_WIDTH_MIN,
        minHeight: WIN_HEIGHT_MIN,
        maxWidth: WIN_WIDTH_MAX,
        maxHeight: WIN_HEIGHT_MAX,
        vibrancy: 'dark',
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
        fullscreenable: true,
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
        let bounds = screen.getPrimaryDisplay().bounds
        let x = bounds.x + (bounds.width - WIN_WIDTH_MIN) / 2
        let y = bounds.y + (bounds.height - WIN_HEIGHT) / 2
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
        if (onTop) {
            window?.setAlwaysOnTop(false)
        } else {
            window?.setAlwaysOnTop(true)
        }
        onTop = !onTop
    })

    ipcMain.on('toMain', (_, files: string[]) => {
        if (files[0] == undefined) {
            return
        }
        openFiles(files).then((data) => {
            // console.log(data);
            window.webContents.send('fromMain', data, files)
        })
    })

    ipcMain.on('get-files-to-main', (_, path: string) => {
        let lsdir = rreaddirSync(path, [])
        lsdir = lsdir.filter(checkExension)
        // console.log(lsdir)
        window.webContents.send('get-files-from-main', lsdir, path)
    })

    ipcMain.on('set-old-idx', (_, index: number) => {
        store.set('last_idx', index)
        console.log('last_idx = ' + index)
    })

    ipcMain.on('get-old-idx-tm', (_) => {
        window.webContents.send('get-old-idx-fm', store.get('last_idx') || 0)
        console.log('last_idx = ' + store.get('last_idx') || 0)
    })

    ipcMain.on('remove-last-open-dir', (_) => {
        store.delete('last_open_dir')
    })

    ipcMain.on('open-folder-tm', (_, openDefault: boolean) => {
        try {
            if (openDefault) {
                let dir = store.get('last_open_dir')

                store.set('last_open_dir', dir)

                let obj = store.get('all_dirs') as string[]

                if (obj && typeof dir == 'string' && !obj.includes(dir)) {
                    store.set('all_dirs', obj.concat([dir]))
                } else {
                    return
                }
                window.webContents.send('open-folder-fm', dir)
            } else {
                let dirpath = dialog.showOpenDialogSync(window, {
                    properties: ['openDirectory'],
                    defaultPath: '',
                })

                let dir = dirpath?.pop()
                window.webContents.send('open-folder-fm', dir)
                store.set('last_open_dir', dir)

                let obj = store.get('all_dirs') as string[]

                if (obj && typeof dir == 'string' && !obj.includes(dir)) {
                    store.set('all_dirs', obj.concat([dir]))
                } else {
                    store.set('all_dirs', [dir])
                }
            }
            console.log(store.get('all_dirs') as string[])
        } catch (error) {
            console.error(error)
        }
    })

    ipcMain.on('open-settings-tm', (_) => {
        console.log('opening settings at ' + url + '/settings')
        if (isDev) {
            settings?.loadURL(url + '/settings')
        } else {
            settings?.loadFile(url + '/settings')
        }
        settings?.show()
    })

    ipcMain.on('save-cover', (_, data: any, name: string) => {
        console.log('saving cover ' + data)
        let split = data.split(';base64')
        let file = dialog.showSaveDialogSync(window, {
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

    ipcMain.on('get-old-dirs', () => {
        let dirs = store.get('all_dirs') as string[]
        console.log('all_dirs ' + dirs)
        window.webContents.send('get-old-dirs-from-main', dirs)
    })

    ipcMain.on('remove-dir', (_, dir: string) => {
        let obj = store.get('all_dirs') as string[]

        console.log(`before removing ${dir} = ${obj}`)

        var filteredArray = obj.filter(function (e) {
            return e !== dir
        })

        console.log(`after removing ${dir} = ${filteredArray}`)

        store.set('all_dirs', filteredArray)
    })

    window.on('will-resize', () => {
        // console.log('resize')
        window.webContents.send(
            'get-height-from-main',
            window.getBounds().height
        )
    })

    // window.on('resized', () => {
    //     // console.log('resize')
    //     window.webContents.send(
    //         'get-height-from-main',
    //         window.getBounds().height
    //     )
    // })

    window.on('blur', () => {
        window.setOpacity(0.85)
    })

    window.on('focus', () => {
        window.setOpacity(1)
    })

    settings?.on('close', function (evt) {
        evt.preventDefault()
        settings?.hide()
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

ipcMain.on('message', (event: IpcMainEvent, message: any) => {
    setTimeout(
        () => event.sender.send('message', `electron received ${message}`),
        500
    )
})

const isMac = process.platform === 'darwin'

const template = [
    // { role: 'appMenu' }
    ...(isMac
        ? [
              {
                  label: app.name,
                  submenu: [
                      { role: 'about' },
                      { type: 'separator' },
                      { role: 'services' },
                      { type: 'separator' },
                      { role: 'hide' },
                      { role: 'hideOthers' },
                      { role: 'unhide' },
                      { type: 'separator' },
                      { role: 'quit' },
                  ],
              },
          ]
        : []),
    // { role: 'fileMenu' }
    {
        label: 'File',
        submenu: [isMac ? { role: 'close' } : { role: 'quit' }],
    },
    // { role: 'editMenu' }
    {
        label: 'Edit',
        submenu: [
            { role: 'undo' },
            { role: 'redo' },
            { type: 'separator' },
            { role: 'cut' },
            { role: 'copy' },
            { role: 'paste' },
            ...(isMac
                ? [
                      { role: 'pasteAndMatchStyle' },
                      { role: 'delete' },
                      { role: 'selectAll' },
                      { type: 'separator' },
                      {
                          label: 'Speech',
                          submenu: [
                              { role: 'startSpeaking' },
                              { role: 'stopSpeaking' },
                          ],
                      },
                  ]
                : [
                      { role: 'delete' },
                      { type: 'separator' },
                      { role: 'selectAll' },
                  ]),
        ],
    },
    // { role: 'viewMenu' }
    {
        label: 'View',
        submenu: [
            { role: 'reload' },
            { role: 'forceReload' },
            { role: 'toggleDevTools' },
            { type: 'separator' },
            { role: 'resetZoom' },
            // { role: 'zoomIn' },
            // { role: 'zoomOut' },
            { type: 'separator' },
            { role: 'togglefullscreen' },
        ],
    },
    // { role: 'windowMenu' }
    {
        label: 'Window',
        submenu: [
            { role: 'minimize' },
            { role: 'zoom' },
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
    {
        role: 'help',
        submenu: [
            {
                label: 'Learn More',
                click: async () => {
                    const { shell } = require('electron')
                    await shell.openExternal('https://electronjs.org')
                },
            },
        ],
    },
] as Electron.MenuItemConstructorOptions[]
