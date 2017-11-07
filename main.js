'use strict';

const {app, shell, BrowserWindow, globalShortcut} = require('electron')
const {Menu, Tray, nativeImage} = require('electron')
const path = require('path')
const {URL, URLSearchParams} = require('url');
const {ipcMain} = require('electron')
const mailNotify = require('./notify/notify.js')
const hash = require('js-hash-code');
const chooseWin = require('./choose/choose.js')

class MainApp {
  constructor() {
    this.initEvent();
    this.chooseWin = new chooseWin();
  }
  initEvent() {
    app.on('activate', () => {
      if (win === null) {
        this.chooseWin.show()
      }
    });
    app.on('ready', () => {
      console.log('ready');
      this.chooseWin.show();
      this.initTray();
    });
  };

  initTray() {
    this.appIcon = new Tray(nativeImage.createFromPath(
        path.join(__dirname, `./image/Email_Chat.png`)))
    const contextMenu = Menu.buildFromTemplate([
      {label : 'show', click : () => { this.chooseWin.show(); }},
      {label : 'exit', click : () => { app.exit(0); }},
      // {
      //     label: 'notify',
      //     click: () => {
      //         new mailNotify({ title: 'test333333', digest:
      //         'snlaalskjfklsjl', count: 100, accountName: 'name',
      //         account: 'aaa' })
      //             .click(function() { console.log('main.click')
      //             ;win.show()}) .timeout(function() {
      //             console.log('main.timeout') }, 1000 * 2) .show()
      //     }
      // },
    ]);
    this.appIcon.setContextMenu(contextMenu)
  }

  updateIcon(image) { this.appIcon.setImage(image) }
}
let main = new MainApp()

module.exports = {main};
