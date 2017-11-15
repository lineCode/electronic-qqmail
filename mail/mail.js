'user strict';

const { shell, BrowserWindow, Tray, globalShortcut } = require('electron')
const { Menu, nativeImage } = require('electron')
const path = require('path')
const { URL, URLSearchParams } = require('url');
const { ipcMain } = require('electron')
const hash = require('js-hash-code');
const mailNotify = require('../notify/notify.js')
const {download} = require('electron-dl');
const electronLocalshortcut = require('electron-localshortcut');

let config = {
    exmail: {
        icon: nativeImage.createFromPath(path.join(__dirname, `../image/Email_Chat.png`)),
        unIcon: nativeImage.createFromPath(
            path.join(__dirname, '../image/Email_Chat_un.png')),
        shortcut: "CommandOrControl+Alt+e",
        url: "https://exmail.qq.com/cgi-bin/loginpage",
        current:{},
    },
    qqmail: {
        icon: nativeImage.createFromPath(path.join(__dirname, `../image/QQ_Email_Chat.png`)),
        unIcon: nativeImage.createFromPath(
            path.join(__dirname, '../image/QQ_Email_Chat_un.png')),
        shortcut: "CommandOrControl+Alt+q",
        url: "https://mail.qq.com/cgi-bin/loginpage",
        current:{},
    }
}

let qq = null;
let qqMail = function() {
    // if (qq == null) {
        qq = new MailWin(config.qqmail)
    // } else {
    //     qq.show()
    // }
};
let ex = null;
let exMail =
    function() {
        // if (ex == null) {
            ex = new MailWin(config.exmail)
        // } else {
            // ex.show()
        // }
    }

class MailWin {
    constructor(option) {
        if (option == null) {
            return;
        }
        this.option = option;
        this.createWindow();
        this.loadURL(this.option.url);
        this.initEvent();
        this.initIpc();
        this.initTray()
        this.shortcut();
    }

    createWindow() {
        this.win = new BrowserWindow({
            width: 1024,
            height: 660,
            icon: this.option.icon,
            show: false,
            webPreferences: {
                javascript: true,
                plugins: true,
                nodeIntegration: false,
                webSecurity: false,
                preload: path.join(__dirname, './preload.js'),
            },
        });
    }
    loadURL(url) { this.win.loadURL(url); }
    shortcut() {
        globalShortcut.register(this.option.shortcut, () => { this.toggle() })
        electronLocalshortcut.register(this.win, 'Esc', () => {
            this.hide();
          });
    }
    initEvent() {
        this.win.on('close', (e) => {
            if (this.win.isVisible()) {
                e.preventDefault();
                this.win.hide();
            }
        });
        this.win.once('ready-to-show', () => { this.show() });
        this.win.webContents.on('new-window', (event, url) => {
            console.log(url);
            let myURL = new URL(url);
            let hostname = myURL.hostname
            if (hostname.endsWith('mail.qq.com')) {
                let pathname = myURL.pathname
                if (pathname == '/cgi-bin/mail_spam') {
                    let action = myURL.searchParams.get('action')
                    let targetUrl = myURL.searchParams.get('url')
                    if (action == 'check_link') {
                        console.log(targetUrl);
                        event.preventDefault();
                        shell.openExternal(targetUrl);
                        return;
                    }
                }
                if (pathname == '/cgi-bin/readmail' ||
                    pathname == '/cgi-bin/download') {
                    download(BrowserWindow.getFocusedWindow(), url,
                         {openFolderWhenDone : true})
                    .then(dl => console.log(dl.getSavePath()))
                    .catch(console.error);
                    return;
                }
            }

            event.preventDefault();
            shell.openExternal(url);
        });
    }
    initTray() {
        this.appIcon = new Tray(this.option.icon)
        const contextMenu = Menu.buildFromTemplate([
            { label: 'show', click: () => { this.show(); } },
            { label: 'exit', click: () => { this.destroy() } },
            // {label:'notify',click:()=>{new mailNotify({title:'test'}).click(()=>{}).show()}}
        ]);
        this.appIcon.setContextMenu(contextMenu)
    }

    updateIcon(image) { this.appIcon.setImage(image) }
    toggle() {
        if (this.win.isVisible()) {
            this.win.hide();
        } else {
            this.win.show();
        }
    }
    clear() {
        this.win.webContents.session.clearCache(
            function() { console.log('clearCache') });
        this.win.webContents.session.clearStorageData(
            function() { console.log('clearStorageData'); });
    }
    destroy() {
        this.win.destroy();
        this.win==null;
        this.appIcon.destroy();
    }
    show() { this.win.show(); }
    hide() { this.win.hide() }
    initIpc() {
        ipcMain.on('has-un-count-tray' + this.win.id, (event, arg) => {
            if (arg == 'has') {
                console.log('mainhas,' + this.win.id + '')
                this.updateIcon(this.option.unIcon)
            }
            if (arg == 'unhas') {
                console.log('mainunhas,' + this.win.id + '')
                this.updateIcon(this.option.icon)
            }
        });
        ipcMain.on('new-email-notify' + this.win.id, (event, arg) => {
            new mailNotify(arg)
                .click(() => {
                    event.sender.send('new-email-notify-click' + this.win.id)
                    this.show()
                })
                .timeout(
                    () =>{
                        event.sender.send('new-email-notify-click' + this.win.id, hash(arg.title + arg.digest))
                    },
                    1000 * 45)
                .show()
        })
    }
}

module.exports = {
    MailWin,
    exMail,
    qqMail
};