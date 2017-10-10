'use strict';

const {ipcRenderer} = require('electron')

class Injector{
  init(){
    //console.log('console.log(preload.js);'+new Date().getTime());
    setInterval(function(){
      //console.log('console.log(setInterval);'+new Date().getTime());
        var tobj = window.document.evaluate('//li[@class="fs"]//a | //li[@class="fn"]//a',document.body, null, XPathResult.ANY_TYPE,null)
        var list=[];
        var tmp = tobj.iterateNext();
        while(tmp)
        {
              //console.log();
              var text = tmp.textContent
              if(text.indexOf('(')>-1&&text.indexOf('我的文件夹')<0&&text.indexOf('草稿箱')<0){
                list.push(text)
              }
              tmp= tobj.iterateNext()
        }
        //console.log(list);
        if(list.length>0){
          ipcRenderer.send('has-un-count-tray','has')
        }else{
          ipcRenderer.send('has-un-count-tray','unhas')
        }
    }, 1000*2);  
    setInterval(function(){
      var notify_content = document.querySelector('#webpushtip1 > div > div.notify_content').innerHTML
          if(notify_content){
              console.log(notify_content);
          }
    },1000*2);
  }
}

new Injector().init()