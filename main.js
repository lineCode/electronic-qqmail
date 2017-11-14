'use strict';

const {app} = require('electron')
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