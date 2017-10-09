'use strict';

const {app,shell, BrowserWindow} = require('electron')
const {Menu, Tray} = require('electron')
const path = require('path')
const url = require('url')
const {ipcMain} = require('electron')


let win

function createWindow () {

  win = new BrowserWindow({
    width: 1024, 
    height: 660,
    icon:'./Email_Chat.png',
    webPreferences:{
      javascript: true,
        plugins: true,
        nodeIntegration: false,
        webSecurity: false,
      preload:path.join(__dirname, './preload.js'),
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
    }
  )
  win.webContents.on('new-window', (event, url) => {
      event.preventDefault();
      shell.openExternal(url);
    });

}
function toggle(){
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
  appIcon = new Tray('./image/Email_Chat.png')
  const contextMenu = Menu.buildFromTemplate([
    {label: 'show',click:() => {toggle() }},
    {label: 'exit',click: () => { app.exit(0); }}
  ])
  appIcon.setContextMenu(contextMenu)
})
let lastcount='unhas';
ipcMain.on('has-un-count-tray',(event, arg) => {
  //console.log(arg)  // prints "ping"
  if(arg=='has'&&arg!=lastcount){
    appIcon.setImage('./image/Email_Chat_un.png')
    lastcount='has'
  }
  if(arg=='unhas'&& arg!=lastcount){
    appIcon.setImage('./image/Email_Chat.png')
    lastcount='unhas'
  }
})