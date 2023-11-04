import { join } from 'path'
import {
    BrowserWindow,
    app,
    ipcMain,
    IpcMainEvent,
    screen,
    dialog,
} from 'electron'
import isDev from 'electron-is-dev'
import * as mm from 'music-metadata'
import * as fs from 'fs'
// import path from 'path'
import Store from 'electron-store'

const WIN_HEIGHT = 450
const WIN_HEIGHT_MIN = 102
const WIN_HEIGHT_MAX = 600

const WIN_WIDTH_MIN = 470
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
        height: 480,
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
            window.webContents.send('fromMain', data)
        })
    })

    ipcMain.on('get-files-to-main', (_, path: string) => {
        let lsdir = rreaddirSync(path, [])
        lsdir = lsdir.filter(checkExension)
        // console.log(lsdir)
        window.webContents.send('get-files-from-main', lsdir)
    })

    ipcMain.on('open-folder-tm', (_, openDefault: boolean) => {
        try {
            if (openDefault) {
                let dir = store.get('last_open_dir')
                window.webContents.send('open-folder-fm', dir)
                store.set('last_open_dir', dir)

                let obj = store.get('all_dirs') as string[]

                if (obj && typeof dir == 'string' && !obj.includes(dir)) {
                    store.set('all_dirs', obj.concat([dir]))
                }
            } else {
                let dirpath = dialog.showOpenDialogSync(window, {
                    properties: ['openDirectory'],
                    defaultPath: '',
                })

                let dir = dirpath?.pop()
                window.webContents.send('open-folder-fm', dir)
                store.set('last_open_dir', dir)

                let obj = store.get('all_dirs') as string[]

                if (obj && typeof dir == 'string') {
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

    window.on('blur', () => {
        window.setOpacity(0.7)
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
