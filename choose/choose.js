/*
mail:181958825@qq.com
*/
'use strict';
const electron = require('electron')
const ipcMain = electron.ipcMain
const BrowserWindow = electron.BrowserWindow
const globalShortcut = electron.globalShortcut
const path = require('path')
const { qqMail, exMail } = require('../mail/mail.js')

class ChooseWin {
    constructor() {
        this.initEvent();
        this.width = 320;
        this.height = 160;
    }
    createWindow() {
        this.win = new BrowserWindow({
            icon: '../image/Email_Chat.png',
            width: this.width,
            height: this.height,
            alwaysOnTop: true,
            skipTaskbar: true,
            resizable: false,
            show: false,
            frame: false,
            transparent: false,
            acceptFirstMouse: true,
        });
        this.win.loadURL('file://' + path.join(__dirname, 'choose.html'));
        this.win.once('ready-to-show', () => {
            this.center();
            this.win.show();
            globalShortcut.register('CommandOrControl+Alt+c', () => { this.toggle() })
        });
        this.win.on('close', (e) => {
            if (this.win.isVisible()) {
                e.preventDefault();
                this.win.hide();
            }
        });
    }
    center() {
        let display = electron.screen.getPrimaryDisplay();
        let workArea = display.workArea;
        let width = workArea.width;
        let height = workArea.height;
        let left = workArea.x;
        let top = workArea.y;

        let x = left + width / 2 - this.width / 2;
        let y = top + height / 2 - this.height / 2;
        this.win.setPosition(x, y)
    }
    show() {
        if (this.win == null) {
            this.createWindow();
        } else {
            this.win.show()
        }
        return this
    }
    toggle() {
        if (this.win.isVisible()) {
            this.hide();
        } else {
            this.show();
        }
    }
    hide() {
        this.win.hide()
        // let display = electron.screen.getPrimaryDisplay();
        // let workArea = display.workArea;
        // let width = workArea.width;
        // let height = workArea.height;
        // let left = workArea.x;
        // let top = workArea.y;

        // let x = left+width-10;
        // let y = top + height / 2 - this.height / 2;
        // this.win.setPosition(x, y)
    }
    moveTray() { this.hide() }
    initEvent() {
        ipcMain.on('click-icon', (event, arg) => {
            if (arg == 'qqmail-show') {
                qqMail();
            }
            if (arg == 'exmail-show') {
                exMail()
            }
            this.moveTray()
        });
        
    }
}

module.exports = ChooseWin;