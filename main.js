'use strict';

const {app, shell, BrowserWindow, globalShortcut} = require('electron')

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
    });
  };
}

let main = new MainApp()
