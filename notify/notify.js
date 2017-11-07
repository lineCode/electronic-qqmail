'use strict';

const {BrowserWindow, ipcMain} = require('electron');
const path = require('path')
const electron = require('electron')

class Notify {

  constructor(message) {
    this.msg = message;
    this.width = 321;
    this.height = 80;
    this.createWindow();
    console.log('init Notify');
  }
  createWindow() {
    this.win = new BrowserWindow({
      width : this.width,
      height : this.height,
      alwaysOnTop : true,
      skipTaskbar : true,
      resizable : false,
      show : false,
      frame : false,
      transparent : true,
      acceptFirstMouse : true,
      webPreferences : {
        plugins : true,
        preload : path.join(__dirname, 'preload.js'),
        allowDisplayingInsecureContent : true
      }
    });
  }
  show() {
    this.win.loadURL('file://' + path.join(__dirname, 'notify.html'));
    this.win.once('ready-to-show', () => {
      let position = this.getPosition();
      this.win.setPosition(position.x, position.y);
      this.initContent();
      this.initEvent();
      this.win.show()
    });
    return this;
  }
  click(callback) {
    ipcMain.once('click-notify', function(event, data) {
      console.log('click-notify.js');
      callback()
    })
    return this;
  }
  timeout(callback, time) {

    setTimeout(() => {
      if (!this.win.isDestroyed()) {
        callback();
      }
      this.close();
    }, time);
    return this;
  }
  initContent() { this.win.webContents.send('initContent', this.msg); }
  timeoutClose() {
    setTimeout(() => { this.close(); }, 1000 * 5);
  }
  close() {
    if (!this.win.isDestroyed()) {
      this.win.hide();
      this.win.close();
      this.win == null;
    }
  }

  getPosition() {
    let display = electron.screen.getPrimaryDisplay();
    let workArea = display.workArea;
    let left = workArea.x;
    let top = workArea.y;
    let width = workArea.width;
    let height = workArea.height;
    let x, y;
    let winWidth = this.width;
    let winHeight = this.height;

    x = left + width - winWidth - 20;
    y = top + 20;

    return {x : x, y : y};
  };

  initEvent() { ipcMain.once('close-notify', (event, arg) => {this.close()}) }
}

module.exports = Notify;
