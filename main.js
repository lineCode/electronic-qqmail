'use strict';

const {app, shell, BrowserWindow} = require('electron')
const {Menu, Tray, nativeImage} = require('electron')
const path = require('path')
const {URL, URLSearchParams} = require('url');
const {ipcMain} = require('electron')

let trayIcon =
    nativeImage.createFromPath(path.join(__dirname, `./image/Email_Chat.png`));
let trayIconUnread = nativeImage.createFromPath(
    path.join(__dirname, './image/Email_Chat_un.png'));
let win

function createWindow() {
  win = new BrowserWindow({
    width : 1024,
    height : 660,
    icon : './Email_Chat.png',
    webPreferences : {
      javascript : true,
      plugins : true,
      nodeIntegration : false,
      webSecurity : false,
      preload : path.join(__dirname, './preload.js'),
    },
  })
  win.loadURL('https://exmail.qq.com/cgi-bin/loginpage')
  win.center()
  win.on('close', (e) => {
    // win.hide();
    if (win.isVisible()) {
      e.preventDefault();
      win.hide();
    }
  })
  win.webContents.on('new-window', (event, url) => {

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
        }
      }
    }
    else {
      event.preventDefault();
      shell.openExternal(targetUrl);
    }
  });
}
function toggle() {
  if (win.isVisible()) {
    win.hide();
  } else {
    win.show();
  }
}
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (win === null) {
    createWindow()
  }
})
let appIcon = null
app.on('ready', () => {
  createWindow()
appIcon = new Tray(trayIcon)
const contextMenu = Menu.buildFromTemplate([
  {label : 'show', click : () => { win.show(); }},
  {label : 'exit', click : () => { app.exit(0); }}
])
  appIcon.setContextMenu(contextMenu)
})
  let lastcount = 'unhas';
  ipcMain.on('has-un-count-tray', (event, arg) => {
    // console.log(arg)  // prints "ping"
    if (arg == 'has' && arg != lastcount) {
      appIcon.setImage(trayIconUnread)
      lastcount = 'has'
    }
    if (arg == 'unhas' && arg != lastcount) {
      appIcon.setImage(trayIcon)
      lastcount = 'unhas'
    }
  })
  ipcMain.on('tips', (event, arg) => {appIcon.setToolTip(arg)})
