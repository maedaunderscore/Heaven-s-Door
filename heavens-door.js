// ========================== Heaven's Door Library =========================== //
// このライブラリはKeySnailのプラグイン用のライブラリです。
// 
// このライブラリを使用する側は下記のコードを実行してください。
// userscript.require("heavens-door.js", this);
// 
// 本ライブラリを読み込むと、下記の関数が追加されます。これらの関数からプラグインを登録します。
// HeavensDoor  - プラグインの名前とプラグインを渡し、登録する
// HeavensDoors - 複数のプラグインを一括登録する
//
// プラグインは下記の関数を実装したオブジェクトです。
//  - plugin.index(completeIndex) : 索引を作成する関数。作成した索引はcompleteIndex関数に渡すこと
//  - plugin.view : エディタでコードを開くときに呼び出される関数
//
// プラグインのその他のオプションは下記の通り
//  - open : 候補を確定したときの動作。デフォルトは別のタブで開く
//  - flags : 候補表示設定。デフォルトでは１番目の列は表示しない(オープンするURLに使用されることを想定)
//  - style : 候補を表示するときのスタイル。prompt.selectorのオプション値
//  - width : 候補を表示するときの列幅。prompt.selectorのオプション値
//
// プラグインの中で使用可能な下記の関数を提供します。
//  - xpath  xpathで要素の取得をする
//  - openPage 指定されたURLのページを開く
//  - openWithEditor 指定されたファイルをテキストエディタで開く
//  - appendPath OSごとのファイル区切り文字を考慮してパス名の結合をする
// ========================================================================= //

const pluginPrefix = "HeavensDoor";

if(!plugins.heavens) {
    plugins.heavens={}

    ext.add("heavens-view", function(aEvent, aArg){
	for(var key in plugins.heavens){
	    var plugin = plugins.heavens[key];
	    if(plugin.view){
		if(plugin.view()){
		    return;
		}
	    }
	}
	display.echoStatusBar(M({
	    ja:"このページ用のプラグインは見つかりませんでした。", 
	    en:"No plugin for this page."}));
    }, M({
	ja : "現在表示しているドキュメントのコードをエディタで開く", 
	en: "open with editor" }));
}

function registerPlugin(pluginname, pl){
    const defaultPlugin = {
	flags : [IGNORE | HIDDEN, 0, 0, 0, 0],
	open : function(selected){
	    gBrowser.loadOneTab(selected[0], null, null, null, false);
	},
	xpath: function(el, xpath) {return content.document.evaluate(xpath, el, null, 7, null);},
	
	openPage : function(url, callback, charset) {
	    if(!charset) charset = "text/html; charset=utf-8";
	    var xhr = new XMLHttpRequest();
	    xhr.onload = function(){
		callback(xhr.responseText);	
	    };
	    xhr.onerror = function(){	// TODO: 読み込みに失敗してもこれが呼ばれない
		display.notify(M({
		    ja: url+"の取得に失敗しました。",
		    en: url+" not available."
		}));
	    };
	    xhr.open("get", url, true);
	    xhr.overrideMimeType(charset);
	    xhr.send(null);
	},
	openWithEditor : function(src){
	    if(src) window.KeySnail.modules.userscript.editFile(src)
	},
	appendPath : function(dir, path){
	    if(dir.substr(-1) != fileSeparator){
		dir = dir + fileSeparator;
	    }
	    return (dir + path).replace(/\/+/g, fileSeparator);
	}
    };
    const plugin = _.extend(defaultPlugin, pl);
    const fileSeparator = function(){		// TODO: セパレータの決定方法はこれでいい？
	if (Cc["@mozilla.org/xre/app-info;1"].getService(Ci.nsIXULRuntime).OS == "WinNT") { 
	    return '\\';
        }
        return '/';
    }();
    
    function completeIndex(index){
	if(index && index.length > 0){
	    persist.preserve(index, pluginPrefix + pluginname);
	    display.showPopup(M({
		ja:"インデックス作成完了", 
		en:"Complete Indexing"}));
	}else{
	    display.notify(M({
		ja:"インデックスの作成に失敗しました。", 
		en:"Indexing failed."}));
	}
    }
    function makeIndex(){
	plugin.index(completeIndex);
    }
    
    plugins.heavens[pluginname] = {
	reIndex : makeIndex,
	open : function(){
	    const index = persist.restore(pluginPrefix+pluginname);
	    if(index){
		prompt.selector(
		    { message		: pluginname,
		      collection	: index,
		      flags		: plugin.flags,
		      style		: plugin.style,
		      width		: plugin.width,
		      callback		: function(aIndex){
			  plugin.open(index[aIndex]);
		      }
		    })
	    }else{
		display.echoStatusBar(M({ja:"インデックス作成中...", en:"Start indexing..."}));
		makeIndex();
	    }
	},
	view : function(){
	    if(plugin.view){ 
		return function(){ return plugin.view() };
	    }else{
		return null;
	    }
	}()
    }
}

this.HeavensDoors = function(pluginParamName, pluginFactory){
    var options = plugins.options[pluginParamName];
    if(!options || options.length == 0){
	display.notify(M({
	    ja: "plugins.options[\""+pluginParamName+"\"]を設定してください",
	    en: "plugins.options[\""+pluginParamName+"\"] is needed to set",
	}));
    }else{
	_.each(options, function(option){
	    registerPlugin(option.name, pluginFactory(option.param));
	});
    }
};
this.HeavensDoor = registerPlugin;


