'use strict';

const {ipcRenderer} = require('electron')
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
        var titlestr = document.querySelector('.notify_title').innerHTML
        var msg = document.querySelector('.notify_digest').innerHTML
        var countstr =
            document
                .querySelector(
                    '#webpushtip1 > div > div.notify_type > label > em')
                .innerHTML
        var accountstr =
            document
                .querySelector(
                    '#webpushtip1 > div > div.notify_content > p.notify_account')
                .innerHTML
        titlestr = entities.decode(titlestr);
        msg = entities.decode(msg);
        var hsahstr = hash(titlestr + msg)
        if (!hashset.contains(hsahstr)) {
          console.log('new email' + titlestr)
          ipcRenderer.send('newEMail_notify', {
            title : titlestr,
            digest : msg,
            count : countstr,
            account : accountstr,
          })
          console.log('new email end' + titlestr)
          hashset.add(hsahstr)
        }
      }
    }, 1000 * 2);
    console.log('preload init success')
  }
}

ipcRenderer.once('click_notify_main', function(e, arg) {
  console.log('click_preload.js')
  document.querySelector('.newmailNotify').click()
})
ipcRenderer.once('timeout_notify_main', function(e, arg) {
  console.log('timeout_preload.js')
  hashset.remove(arg.hsahstr);
});
new Injector().init()
