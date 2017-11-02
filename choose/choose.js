/*
mail:181958825@qq.com
*/
'use strict';
const {BrowserWindow} = require('electron')

class ChooseWin {
  constructor() { this.win; }
  createWindow() {
    this.win = new BrowserWindow({
      width : 310,
      height : 140,
      alwaysOnTop : true,
      skipTaskbar : true,
      resizable : false,
      show : false,
      frame : false,
      transparent : true,
      acceptFirstMouse : true,
    });
    this.win.loadURL(`file://${__dirname}/choose/choose.html`);
    this.win.once('ready-to-show', () => {this.win.show()})
  }
  show() {}
  hide() {}
}
