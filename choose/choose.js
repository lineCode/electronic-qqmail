/*
mail:181958825@qq.com
*/
'use strict';
const {BrowserWindow, ipcMain} = require('electron')
const path = require('path')
const {qqMail, exMail} = require('../mail/mail.js')
const {electron} = require('electron')

class ChooseWin {
  constructor() {
    this.initEvent();
    this.width = 320;
    this.height = 160;
  }
  createWindow() {
    this.win = new BrowserWindow({
      width : this.width,
      height : this.height,
      alwaysOnTop : true,
      skipTaskbar : true,
      resizable : true,
      show : false,
      frame : true,
      transparent : false,
      acceptFirstMouse : true,
    });
    this.win.loadURL('file://' + path.join(__dirname, 'choose.html'));
    this.win.once('ready-to-show', () => {
      this.center();
      this.win.show();
    });
  }
  center() {
    let display = electron.screen.getPrimaryDisplay();
    let workArea = display.workArea;
    let width = workArea.width;
    let height = workArea.height;
    let left = workArea.x;
    let top = workArea.y;

    let x = left / 2 + this.width / 2;
    let y = top / 2 + this.height / 2;
    this.win.setPosition(x, y)
  }
  show() { this.createWindow(); }
  hide() { this.win.hide() }
  choseQQMail() { qqMail() }
  chooseEXMail() { exMail() }
  initEvent() {
    let that = this;
    ipcMain.on('qqmail-show', function() { that.chooseQQMail() });
    ipcMain.on('exmail-show', function() { that.chooseEXMail() });
  }
}

module.exports = ChooseWin;
