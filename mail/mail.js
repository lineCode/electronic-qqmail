'user strict';

const {shell, BrowserWindow, globalShortcut} = require('electron')
const {nativeImage} = require('electron')
const path = require('path')
const {URL, URLSearchParams} = require('url');
const {ipcMain} = require('electron')
const mailNotify = require('../notify/notify.js')
const hash = require('js-hash-code');

let trayIcon =
    nativeImage.createFromPath(path.join(__dirname, `./image/Email_Chat.png`));
let trayIconUnread = nativeImage.createFromPath(
    path.join(__dirname, './image/Email_Chat_un.png'));
let qqmailUrl = 'https://mail.qq.com/cgi-bin/loginpage';
let exmailUrl = 'https://exmail.qq.com/cgi-bin/loginpage'

function qqMail() { new MailWin(qqmailUrl) }
function exMail() { new MailWin(exmailUrl) }

class MailWin {
  constructor(url) {
    this.createWindow();
    this.loadURL(url);
    this.initEvent();
    this.initIpc();
    this.globalShortcut();
    this.mainApp = MainApp;
  }

  createWindow() {
    this.win = new BrowserWindow({
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
    });
  }
  loadURL(url) { this.win.loadURL(url); }
  globalShortcut() {
    globalShortcut.register('Esc', () => {win.hide()})
    globalShortcut.register('CommandOrControl+Alt+q', () => {toggle()})
  }
  initEvent() {
    this.win.on('close', (e) => {
      if (this.win.isVisible()) {
        e.preventDefault();
        this.win.hide();
      }
    });
    this.win.once('ready-to-show', () => {win.show()});
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
  show() { this.win.show() }
  hide() { this.win.hide() }
  initIpc() {
    let lastcount = 'unhas';
    ipcMain.on('has-un-count-tray', (event, arg) => {
      // console.log(arg)  // prints "ping"
      if (arg == 'has' && arg != lastcount) {
        this.mainApp.updateIcon(trayIconUnread)
        lastcount = 'has'
      }
      if (arg == 'unhas' && arg != lastcount) {
        this.mainApp.updateIcon(trayIcon)
        lastcount = 'unhas'
      }
    });
    ipcMain.on('newEMail_notify', function(event, arg) {
      console.log('newEMail_notify start' + arg);
      new mailNotify(arg)
          .click(function() {
            console.log('click-main');
            event.sender.send('click_notify_main');
            this.win.show()
          })
          .timeout(
              function() {
                event.sender.send('timeout_notify_main',
                                  hash(arg.title + arg.digest))
              },
              1000 * 20)
          .show()
      console.log('newEMail_notify end')
    })
  }
}

module.exports = MailWin;
module.exports = qqMail;
module.exports = exMail;
