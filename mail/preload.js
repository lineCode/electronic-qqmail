'use strict';

const { ipcRenderer , remote,BrowserWindow} = require('electron')
const path = require('path')
const hash = require('js-hash-code');
const HashSet = require('hashset');
const Entities = require('html-entities').AllHtmlEntities

let hashset = new HashSet();
const entities = new Entities();
const winId = remote.getCurrentWindow().id;
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
                ipcRenderer.send('has-un-count-tray'+winId, 'has')
            } else {
                ipcRenderer.send('has-un-count-tray'+winId, 'unhas')
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
                    let arg = {
                        title: titlestr,
                        digest: msg,
                        count: countstr,
                        account: accountstr,
                    }
                    new mailNotify(arg)
                        .click(function() {
                            document.querySelector('.newmailNotify').click()
                            BrowserWindow.fromId(winId).show()
                        })
                        .timeout(
                            function() {
                                hashset.remove(hash(arg.title + arg.digest));
                            },
                            1000 * 20)
                        .show()
                    hashset.add(hsahstr)
                }
            }
        }, 1000 * 2);
    }
}

new Injector().init()