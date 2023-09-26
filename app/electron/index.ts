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
import path from 'path'
import Store from 'electron-store'

const WIN_HEIGHT = 450
const WIN_WIDTH = 470
const HTML5_AUDIO = ['wav', 'mp3', 'mp4', 'flac', 'webm', 'ogg'] // Incomplete
var resized = true
var onTop = false
const store = new Store()

function openFiles(files: string[]) {
    const promises = []
    for (let i = 0; i < files.length; i++) {
        console.log('file: ' + files[i])
        promises.push(mm.parseFile(files[i]))
    }
    return Promise.all(promises)
        .then((results) => {
            const covers = results.map(
                (md) =>
                    mm.selectCover(md!.common.picture)?.data.toString('base64')
            )
            return [results, covers]
        })
        .catch((e) => {
            console.log('openFiles: ' + e)
        })
}

async function openDir(dir: string) {
    let paths: string[] = []

    const fileNames = await fs.promises.readdir(dir)
    for (let file of fileNames) {
        if (!HTML5_AUDIO.includes(file.split('.').pop()!)) {
            // Assume never undefined
            continue
        }
        const absolutePath = path.join(dir, file)
        paths.push(absolutePath)
        // const data = await fs.promises.readFile(absolutePath);
    }
    return paths
}

function createWindow() {
    const window = new BrowserWindow({
        height: 1,
        width: 1,
        frame: false,
        show: false,
        resizable: true,
        fullscreenable: true,
        //opacity: 0.5,
        vibrancy: 'dark',
        webPreferences: {
            webSecurity: false,
            nodeIntegration: true,
            preload: join(__dirname, 'preload.js'),
        },
    })

    var splash = new BrowserWindow({
        width: 200,
        height: 200,
        transparent: true,
        frame: false,
        alwaysOnTop: true,
    })

    const settings = new BrowserWindow({
        height: 480,
        width: 450,
        frame: true,
        show: false,
        resizable: false,
        fullscreenable: true,
        vibrancy: 'dark',
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

    splash?.loadURL(`file://${__dirname}/../src/splash.html`)

    setTimeout(function () {
        splash.close()
        window.show()
        let bounds = screen.getPrimaryDisplay().bounds
        let x = bounds.x + (bounds.width - WIN_WIDTH) / 2
        let y = bounds.y + (bounds.height - WIN_HEIGHT) / 2
        window.setPosition(x, y)
        window?.setSize(WIN_WIDTH, WIN_HEIGHT, true)
        // window?.webContents.openDevTools()
    }, 500)

    ipcMain.on('resize', () => {
        if (resized) {
            window?.setSize(WIN_WIDTH, 120, true)
        } else {
            window?.setSize(WIN_WIDTH, WIN_HEIGHT, true)
        }
        resized = !resized
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
        openFiles(files).then((data) => {
            // console.log(data);
            window.webContents.send('fromMain', data)
        })
    })

    ipcMain.on('get-files-to-main', (_, path: string) => {
        let lsdir = openDir(path)
        lsdir.then((data) => {
            if (data !== undefined) {
                // console.log("Cover: " + cover);
                // const resultStr = cover.toString('base64');
                // console.log("Cover: " + resultStr);
                window.webContents.send('get-files-from-main', data)
            }
        })
        lsdir.catch((err) => {
            console.log(err)
        })
    })

    ipcMain.on('open-folder-tm', (_, openDefault: boolean) => {
        if (openDefault) {
            let dir = store.get('last_open_dir')
            window.webContents.send('open-folder-fm', dir)
            store.set('last_open_dir', dir)
        } else {
            let dirpath = dialog.showOpenDialogSync(window, {
                properties: ['openDirectory'],
            })
            let dir = dirpath?.pop()
            window.webContents.send('open-folder-fm', dir)
            store.set('last_open_dir', dir)
            console.log(store.get('last_open_dir'))
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
