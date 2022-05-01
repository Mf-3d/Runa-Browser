////////////////////////////////////////////////////////////////////////////
//
//  このファイルはあまりプログラミングに自信がない方はいじらない方がいいかもしれません。
//
////////////////////////////////////////////////////////////////////////////


// モジュール読み込み

const Store = require('electron-store');
const electron = require("electron"); // ウィンドウ表示
const express = require("express"); // サーバー
const fs = require('fs'); // ファイル操作

//  変数 

const app = express();

let port;
let wins = {};
let wins_visible = {};

const store = new Store({
  name: 'config'
});

// ウィンドウイベント
// (win.onの部分)
function win_event(id) {
  // メインウィンドウだったら
  if(id == 'win'){
    wins[id].on('close', async () => {
      // store.set('config.port', PORT);
      // store.set('config.rss', RSS);
      // store.set('config.rss_elements.title', rss_title_element);
      // store.set('config.api.read_rss', api.read_rss);
    });
  }
  else{
    wins[id].on('close',() => {
      wins_visible[id] = false;
    });
  }
}

// 公開関数？
module.exports = {
  // サーバーを生成
  nserver: async (routes, PORT, static_routes) => {
    port = PORT;
    let server = app.listen(PORT, () => {
      console.log("Node.js is listening to PORT:" + server.address().port);
    });

    if(static_routes){
      static_routes.forEach(static_route => {
        app.use(static_route.path, express.static(static_route.static_path));
      });
    }

    routes.forEach(route => {
      if(route.method == 'post'){
        app.post(route.path, async (req, res) => {
          let result = await route.function();
          res.header('Content-Type', 'application/json; charset=utf-8');
          res.send(result);
        });
      }
      else if(route.method == 'get'){
        app.get(route.path, async (req, res) => {
          let result = await route.function();
          res.header('Content-Type', 'application/json; charset=utf-8');
          res.send(result);
        });
      }
    });
  },
  // ウィンドウ生成
  nw: async (win_settings, win_size, { Url }) => {
    wins[win_settings.name] = new electron.BrowserWindow(win_settings);
    wins_visible[win_settings.name] = true;
    wins[win_settings.name].webContents.loadURL(Url);
    wins[win_settings.name].webContents.reloadIgnoringCache();

    win_event(win_settings.name);
    // IDを返す(いらないけど)
    return win_settings.name;
  },
  close: (id) => {
    wins[id].close();
  },
  reload: (id) => {
    wins[id].webContents.reload();
  },
  send: (win_id, name, data) => {
    wins[win_id].webContents.send(name, data);
  },
  receive: (name, func) => {
    electron.ipcMain.handle(name, async (event, data) => {
      return await func(event, data);
    });
  }
}