const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

let win;

function createWindow() {
    win = new BrowserWindow({
        width: 375,
        height: 667,
        webPreferences: {
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'), // Use preload.js para isolar o contexto
        },
    });

    win.loadFile(path.join(__dirname, 'index.html')).catch(err => console.error(err));
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// Recebe tarefas para salvar
ipcMain.on('save-tasks', (event, tasks) => {
    const filePath = path.join(app.getPath('userData'), 'tasks.json'); // Salva no diretório do usuário
    fs.writeFile(filePath, JSON.stringify(tasks, null, 2), (err) => {
        if (err) {
            console.error('Erro ao salvar tarefas:', err);
        } else {
            console.log('Tarefas salvas com sucesso!');
        }
    });
});

// Carrega tarefas ao iniciar
ipcMain.on('load-tasks', (event) => {
    const filePath = path.join(app.getPath('userData'), 'tasks.json');
    if (fs.existsSync(filePath)) {
        fs.readFile(filePath, 'utf-8', (err, data) => {
            if (err) {
                console.error('Erro ao carregar tarefas:', err);
            } else {
                const tasks = JSON.parse(data);
                win.webContents.send('load-tasks', tasks); // Envia as tarefas carregadas para o renderer
            }
        });
    } else {
        // Se o arquivo não existe, envia listas vazias
        win.webContents.send('load-tasks', { pending: [], completed: [] });
    }
});
