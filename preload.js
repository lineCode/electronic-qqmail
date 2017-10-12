'use strict';

const {ipcRenderer} = require('electron')
const notifier = require('node-notifier');
const path = require('path')
const hash = require('js-hash-code');
const HashSet = require('hashset');
const Entities = require('html-entities').AllHtmlEntities

let hashset = new HashSet();
const entities = new Entities();

class Injector {
  init() {
    // console.log('console.log(preload.js);'+new Date().getTime());
    setInterval(function() {
      // console.log('console.log(setInterval);'+new Date().getTime());
      var tobj = window.document.evaluate(
          '//li[@class="fs"]//a | //li[@class="fn"]//a', document.body, null,
          XPathResult.ANY_TYPE, null)
      var list = [];
      var tmp = tobj.iterateNext();
      while (tmp) {
        // console.log();
        var text = tmp.textContent
        if (text.indexOf('(') > -1 && text.indexOf('我的文件夹') < 0 &&
            text.indexOf('草稿箱') < 0) {
          list.push(text)
        }
        tmp = tobj.iterateNext()
      }
      // console.log(list);
      if (list.length > 0) {
        ipcRenderer.send('has-un-count-tray', 'has')
      } else {
        ipcRenderer.send('has-un-count-tray', 'unhas')
      }
    }, 1000 * 2);
    setInterval(function() {
      var notify_content =
          document.querySelector('#webpushtip1 > div > div.notify_content')
              .innerHTML
      if (notify_content) {
        // console.log(notify_content);
        var title = document.querySelector('.notify_title').innerHTML
        var msg = document.querySelector('.notify_digest').innerHTML
        var hsahstr = hash(title + msg)
        if (!hashset.contains(hsahstr)) {
          // console.log(entities.decode(title));
          notifier.notify({
            title : entities.decode(title),
            message : entities.decode(msg).substr(0, 20) + '...',
            icon : path.join(
                __dirname,
                './image/new2.png'), // Absolute path (doesn't work on balloons)
            // sound: true, // Only Notification Center or Windows Toasters
            wait : true // Wait with callback, until user action is taken
                        // against notification
          });

          notifier.on('click', function(notifierObject, options) {
            // Triggers if `wait: true` and user clicks notification
            console.log('click' + notifierObject + options);
          });

          notifier.on('timeout', function(notifierObject, options) {
            // Triggers if `wait: true` and notification closes
            console.log('timeout' + notifierObject + options);
            hashset.remove(hsahstr)
          });
          hashset.add(hsahstr)
        }
      }
    }, 1000 * 2);
  }
}

new Injector().init()
