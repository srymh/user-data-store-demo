import {app, BrowserWindow, ipcMain} from 'electron';
import path from 'path';
import isDev from 'electron-is-dev';
import {UserDataStore} from 'user-data-store';
import {
  ElectronStoreDriver,
  ElectronStoreDriverOptions,
} from 'user-data-store/dist-cjs/drivers/ElectronStoreDriver';

// Example
type Student = {
  name: string;
  checked: boolean;
};

const userDataStore = new UserDataStore<
  Student,
  ElectronStoreDriverOptions<Student>
>({
  driver: ElectronStoreDriver,
  driverOptions: {
    // cwd: "path/to/your/data",
    // fileExtension: "jsn", // ただの例
  },
  name: 'School',
  storeName: 'Student',
  provideKey: (x) => x.name,
  downloadJsonFile: (_name, _text) => {},
});

let win: BrowserWindow | null = null;

function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      // To use ipcRenderer in a project generated by create-react-app
      // https://github.com/electron/electron/issues/9920
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  if (isDev) {
    win.loadURL('http://localhost:3000/index.html');
  } else {
    // 'build/index.html'
    win.loadURL(`file://${__dirname}/../index.html`);
  }

  win.on('closed', () => (win = null));

  // Hot Reloading
  if (isDev) {
    // 'node_modules/.bin/electronPath'
    require('electron-reload')(__dirname, {
      electron: path.join(
        __dirname,
        '..',
        '..',
        'node_modules',
        '.bin',
        'electron'
      ),
      forceHardReset: true,
      hardResetMethod: 'exit',
    });
  }
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (win === null) {
    createWindow();
  }
});

ipcMain.handle('APP_SetItem', async (_event, message) => {
  if (message.key !== undefined) {
    const result = await userDataStore.setItem(message.value, message.key);
    return result;
  } else {
    const result = await userDataStore.setItem(message.value);
    return result;
  }
});

ipcMain.handle('APP_GetItem', async (_event, message) => {
  const result = await userDataStore.getItem(message.key);
  return result;
});

ipcMain.handle('APP_GetItems', async (_event, _message) => {
  const result = await userDataStore.getItems();
  return result;
});

ipcMain.handle('APP_RemoveItem', async (_event, message) => {
  const result = await userDataStore.removeItem(message.key);
  return result;
});

ipcMain.handle('APP_ExportAsJson', async (_event, _message) => {
  const result = await userDataStore.exportAsJson();
  return result;
});

ipcMain.handle('APP_ExportAsJsonFile', async (_event, _message) => {
  const result = await userDataStore.exportAsJsonFile();
  return result;
});

ipcMain.handle('APP_ImportJson', async (_event, message) => {
  const result = await userDataStore.importJson(message.json);
  return result;
});
