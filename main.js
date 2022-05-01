//////////////////////////////////////////////
//
//  このファイルで変数など従来より簡単にいじることができます。
//
//////////////////////////////////////////////


// モジュール読み込み

const Store = require('electron-store');
const main = require('./process');
const electron = require('electron');

///////////
//       //
//  変数  //
//       //
///////////


//  ウィンドウ関連


// ウィンドウの設定

// メインウィンドウ
let win = {
  name: 'win', // ここでウィンドウの名前を指定してください
  resizable: true,
  hasShadow:  true,
  width: 500,
  height: 400,
  transparent: false,
  frame: true,
  toolbar: false,
  alwaysOnTop: false,
  icon: `${__dirname}/icon.png`,
  webPreferences: {
    preload: `${__dirname}/src/preload/preload.js`
  }
}; 

// 設定ウィンドウ
let swin = {
  name: 'swin',
  resizable: true,
  hasShadow:  true,
  width: 500,
  height: 400,
  transparent: false,
  frame: true,
  toolbar: false,
  alwaysOnTop: false,
  icon: `${__dirname}/icon.png`,
  webPreferences: {
    preload: `${__dirname}/src/preload/preload.js`
  }
}; 

// ウィンドウが開いているかの変数
// ここでは全てfalseにしましょう
let win_visible = false; // メインウィンドウ
let swin_visible = false; // 設定ウィンドウ

// ウィンドウのサイズの変数
let win_size = false; // メインウィンドウ
let swin_size = false; // 設定ウィンドウ


//  設定関連


// 設定ファイル
// これはいじらないでおきましょう
const store = new Store({
  name: 'config'
});

// ポート設定
let PORT = store.get('config.port',1213);


//  API関連


// 静的ファイル設定
let static_route = [
  {
    path: '/',
    static_path: __dirname + '/src'
  },
  {
    path: '/three',
    static_path: __dirname + '/src/js/three'
  }
];

// APIルート設定
// 簡単に言うとどこに何を表示するのかを決めることだと思われる
let route = [
  {
    method: 'post', // method = 方法
    path: '/soleil_api/', // pathはどの場所にこの設定を適用するか、(未記入の場合は"/"になる)
    function: () => {
      return {
        "name": "terrescot",
        "api": "soleil_api",
        "api_version": "0.0.1",
        "result": {
          "status": 200,
          "message": "Success!"
        }
      }
    }
  },
  {
    method: 'get',
    path: '/soleil_api/',
    function: () => {
      return {
        "name": "terrescot",
        "api": "soleil_api",
        "api_version": "0.0.1",
        "result": {
          "status": 200,
          "message": "Success!"
        }
      }
    }
  }
];

electron.app.on('ready', async () => {
  main.nserver(route, PORT, static_route);

  setIPC();

  main.nw(win, win_size, {Url: `http://localhost:${store.get(`config.port`, PORT)}`});
  // swin_id = await main.nw(swin, swin_size, {Url: `http://localhost:${store.get(`config.port`)}/setting.html`});
  // mwin_id = await main.nw(mwin, mwin_size, {Url: `http://localhost:${store.get(`config.port`)}/memo.html`});
  // test_win_id = await main.nw(test_win, test_win_size, {Url: `http://localhost:${store.get(`config.port`)}/test.html`});
  // diary_win_id = await main.nw(diary_win, diary_win_size, {Url: `http://localhost:${store.get(`config.port`)}/diary.html`});
  // alarm_win_id = await main.nw(alarm_win, alarm_win_size, {Url: `http://localhost:${store.get(`config.port`)}/alarm.html`});
});


// IPC
function setIPC() {
  // main.receiveはipcMain.handleとほぼ構造は同じ
  // 設定ウィンドウの起動
  main.receive('toggle_settingvisiblity', (event, data) => {
    if(data.visible === true){
      // 表示させたいとき
      main.nw(swin, swin_size, {Url: `http://localhost:${store.get(`config.port`, PORT)}/setting.html`});
    }
    else if(data.visible === false){
      // 非表示にさせたいとき
      main.close(swin.name);
      swin_visible = false;
    }
    else{
      // 切替するとき
      if(swin_visible === false){
        main.nw(swin, swin_size, {Url: `http://localhost:${store.get(`config.port`, PORT)}/setting.html`});
      }
      else if(swin_visible === true){
        main.close(swin.name);
        swin_visible = false;
      }
    }
  });
  // 設定読み込み、保存用
  main.receive('setting', (event, data) => {
    console.debug(data);
    // 設定を保存するとき
    if(data !== undefined){
      store.set('config.port',data.port);
      store.set('config.rss',data.rss);
      store.set('config.rss_elements.title',data.rss_title_element);
      store.set('config.api.read_rss',data.api.read_rss);
      store.set('config.antialiasing',data.antialiasing);
      // 終了時に設定が戻されないように
      antialiasing = data.antialiasing;
      PORT = data.port;
      RSS = data.rss;
      rss_title_element = data.rss_title_element;
      api.read_rss = data.api.read_rss;
      console.debug(data);
    }
    // 設定を読み込むとき
    else{
      console.debug(antialiasing);
      return {
        port: store.get('config.port') || 1212,
        rss: store.get('config.rss') || 'https://nitter.net/ZIP_Muryobochi/rss',
        rss_title_element: store.get('config.rss_elements.title') || 'title',
        api: {
          read_rss: store.get('config.api.read_rss') || false
        },
        antialiasing: store.get('config.antialiasing') || antialiasing
      }
    }
  });
}
