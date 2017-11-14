'use strict';

const { ipcRenderer, remote, BrowserWindow } = require('electron')
const path = require('path')
const hash = require('js-hash-code');
const HashSet = require('hashset');
const Entities = require('html-entities').AllHtmlEntities
const mailNotify = require('../notify/notify.js')

let hashset = new HashSet();
const entities = new Entities();
const winId = remote.getCurrentWindow().id;
let lastcount = 'unhas';
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
            if (list.length > 0 && lastcount == 'unhas') {
                console.log(winId + ',has');
                ipcRenderer.send('has-un-count-tray' + winId, 'has')
                lastcount = 'has'
            }
            if (list.length == 0 && lastcount == 'has') {
                console.log(winId + ',unhas');
                ipcRenderer.send('has-un-count-tray' + winId, 'unhas')
                lastcount = 'unhas'
            }
        }, 1000 * 2);
        setInterval(function() {
            if (document.querySelector('#webpushtip1 > div > div.notify_content') == null) {
                return;
            }
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
                    let arg = {
                        title: titlestr,
                        digest: msg,
                        count: countstr,
                        account: accountstr,
                    }
                    ipcRenderer.send('new-email-notify' + winId, arg)

                    hashset.add(hsahstr)
                }
            }
        }, 1000 * 2);

        ipcRenderer.on('new-email-notify-click'+winId, (event, arg) => {
            document.querySelector('.newmailNotify').click()
        })
        ipcRenderer.on('new-email-notify-timeout'+winId, (event, arg) => {
            hashset.remove(arg)
        })
    }
}

new Injector().init()