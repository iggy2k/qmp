import { join } from 'path';
import { BrowserWindow, app, ipcMain, IpcMainEvent, screen } from 'electron';
import isDev from 'electron-is-dev';
import * as mm from 'music-metadata';
import * as fs from 'fs';
import path from 'path';

const WIN_HEIGHT = 450;
const WIN_WIDTH = 450;
const HTML5_AUDIO = ['wav', 'mp3', 'mp4', 'flac', 'webm', 'ogg']; // Incomplete
var resized = true;
var onTop = false;

async function openFile(file: string) {
    const metadata = await mm.parseFile(file);
    //console.log(metadata);
    return [metadata, mm.selectCover(metadata.common.picture)?.data.toString('base64')]; // pick the cover image
}

async function openDir(dir: string) {
    let paths: string[] = [];


    const fileNames = await fs.promises.readdir(dir);
    for (let file of fileNames) {
        if (!HTML5_AUDIO.includes(file.split('.').pop()!)) { // Assume never undefined
            continue;
        }
        const absolutePath = path.join(dir, file);
        paths.push(absolutePath);
        // const data = await fs.promises.readFile(absolutePath);
    }
    return paths;
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
            preload: join(__dirname, 'preload.js')
        }
    });

    var splash = new BrowserWindow({
        width: 200,
        height: 200,
        transparent: true,
        frame: false,
        alwaysOnTop: true
    });

    const port = process.env.PORT || 3000;
    const url = isDev ? `http://localhost:${port}?viewA` : join(__dirname, '../src/out/index.html');

    if (isDev) {
        window?.loadURL(url);
    } else {
        window?.loadFile(url);
    }

    splash?.loadURL(`file://${__dirname}/../src/splash.html`);

    setTimeout(function () {
        splash.close();
        window.show();
        let bounds = screen.getPrimaryDisplay().bounds;
        let x = bounds.x + ((bounds.width - WIN_WIDTH) / 2);
        let y = bounds.y + ((bounds.height - WIN_HEIGHT) / 2);
        window.setPosition(x, y);
        window?.setSize(WIN_WIDTH, WIN_HEIGHT, true);
        // window?.webContents.openDevTools()
    }, 1000);

    ipcMain.on('resize', () => {

        if (resized) {
            window?.setSize(WIN_WIDTH, 120, true);
        } else {
            window?.setSize(WIN_WIDTH, WIN_HEIGHT, true);
        }
        resized = !resized;

    });

    ipcMain.on('always-on-top', () => {

        if (onTop) {
            window?.setAlwaysOnTop(false);
        } else {
            window?.setAlwaysOnTop(true);
        }
        onTop = !onTop;

    });

    ipcMain.on("toMain", (_, file: string) => {
        let prom = openFile(file);
        prom.then(data => {
            if (data !== undefined) {
                // console.log("Cover: " + cover);
                // const resultStr = cover.toString('base64');
                // console.log("Cover: " + resultStr);
                window.webContents.send("fromMain", data);
            }
        });
    });

    ipcMain.on("get-files-to-main", () => {
        let lsdir = openDir("/Users/iggy/Music/Test/");
        lsdir.then(data => {
            if (data !== undefined) {
                // console.log("Cover: " + cover);
                // const resultStr = cover.toString('base64');
                // console.log("Cover: " + resultStr);
                window.webContents.send("get-files-from-main", data);
            }
        });
    });
}

app.whenReady().then(() => {
    createWindow();
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

ipcMain.on('message', (event: IpcMainEvent, message: any) => {
    setTimeout(() => event.sender.send('message', `electron received ${message}`), 500);
});