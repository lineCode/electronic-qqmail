'use strict';

const {app, shell, BrowserWindow, globalShortcut} = require('electron')
const {Menu, Tray, nativeImage} = require('electron')
const path = require('path')
const {URL, URLSearchParams} = require('url');
const {ipcMain} = require('electron')
const mailNotify = require('./notify/notify.js')
const hash = require('js-hash-code');
const {download} = require('electron-dl');

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
    show : false,
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
  win.once('ready-to-show', () => {win.show()})
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
          return;
        }
      }
      if (pathname == '/cgi-bin/readmail' || pathname == '/cgi-bin/download') {
        event.preventDefault();
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
  {label : 'show', click : () => { win.show(); }}, {
    label : 'exit',
    click : () => {
      win.webContents.session.clearCache(
          function() { console.log('clearCache') });
      win.webContents.session.clearStorageData(
          function() { console.log('clearStorageData'); });
      app.exit(0);
    }
  },
  // {
  //     label: 'notify',
  //     click: () => {
  //         new mailNotify({ title: 'test333333', digest: 'snlaalskjfklsjl',
  //         count: 100, accountName: 'name', account: 'aaa' })
  //             .click(function() { console.log('main.click') ;win.show()})
  //             .timeout(function() { console.log('main.timeout') }, 1000 * 2)
  //             .show()
  //     }
  // },
])
appIcon.setContextMenu(contextMenu)
globalShortcut.register('Esc', () => {win.hide()})
    globalShortcut.register('CommandOrControl+Alt+q', () => {
        toggle()
    })
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
    ipcMain.on('newEMail_notify', function(event, arg) {
      console.log('newEMail_notify start' + arg);
      new mailNotify(arg)
          .click(function() {
            console.log('click-main');
            event.sender.send('click_notify_main')
            win.show()
          })
          .timeout(
              function() {
                event.sender.send('timeout_notify_main',
                                  hash(arg.title + arg.digest))
              },
              1000 * 10)
          .show()
      console.log('newEMail_notify end')
    })
