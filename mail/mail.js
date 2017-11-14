'user strict';

const {shell, BrowserWindow,Tray, globalShortcut} = require('electron')
const {Menu,  nativeImage} = require('electron')
const path = require('path')
const {URL, URLSearchParams} = require('url');
const {ipcMain, ipcRenderer} = require('electron')
const mailNotify = require('../notify/notify.js')
const hash = require('js-hash-code');

let trayIcon =
    nativeImage.createFromPath(path.join(__dirname, `../image/Email_Chat.png`));
let trayIconUnread = nativeImage.createFromPath(
    path.join(__dirname, '../image/Email_Chat_un.png'));
let qqmailUrl = 'https://mail.qq.com/cgi-bin/loginpage';
let exmailUrl = 'https://exmail.qq.com/cgi-bin/loginpage'
let qq = null;
let qqMail = function() {
  if (qq == null) {
    qq = new MailWin(qqmailUrl)
  } else {
    qq.show()
  }
};
let ex = null;
let exMail =
    function() {
  if (ex == null) {
    ex = new MailWin(exmailUrl)
  } else {
    ex.show()
  }
}

class MailWin {
  constructor(url) {
    this.createWindow();
    this.loadURL(url);
    this.initEvent();
    this.initIpc();
    this.initTray()
    this.globalShortcut();
  }

  createWindow() {
    this.win = new BrowserWindow({
      width : 1024,
      height : 660,
      icon : '../image/Email_Chat.png',
      show : false,
      webPreferences : {
        javascript : true,
        plugins : true,
        nodeIntegration : false,
        webSecurity : false,
        preload : path.join(__dirname, './preload.js'),
      },
    });
  }
  loadURL(url) { this.win.loadURL(url); }
  globalShortcut() {
    globalShortcut.register('CommandOrControl+Alt+q', () => {this.toggle()})
  }
  initEvent() {
    this.win.on('close', (e) => {
      if (this.win.isVisible()) {
        e.preventDefault();
        this.win.hide();
      }
    });
    this.win.once('ready-to-show', () => {this.show()});
    this.win.webContents.on('new-window', (event, url) => {
      console.log(url);
      let myURL = new URL(url);
      let hostname = myURL.hostname
      if (hostname == 'exmail.qq.com') {
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
          return;
        }
      }

      event.preventDefault();
      shell.openExternal(url);
    });
  }
  initTray() {
    this.appIcon = new Tray(trayIcon)
    const contextMenu = Menu.buildFromTemplate([
      {label : 'show', click : () => { this.show(); }},
      {label : 'exit', click : () => { this.destroy() }},
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
  destroy(){this.win.destroy();this.appIcon.setContextMenu(null)}
  show() { this.win.show();}
  hide() { this.win.hide() }
  initIpc() {
    let lastcount = 'unhas';
    ipcMain.on('has-un-count-tray'+this.win.id, (event, arg) => {
      // console.log(arg)  // prints "ping"
      if (arg == 'has' && arg != lastcount) {
        this.updateIcon(trayIconUnread)
        lastcount = 'has'
      }
      if (arg == 'unhas' && arg != lastcount) {
        this.updateIcon(trayIcon)
        lastcount = 'unhas'
      }
    });
  }
}

module.exports = {
  MailWin,
  exMail,
  qqMail
};
