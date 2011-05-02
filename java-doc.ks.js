// PLUGIN INFO: {{{
var PLUGIN_INFO =
<KeySnailPlugin>
    <name>Heavens Door for Java</name>
    <description>Search JavaDoc and open the code with editor</description>
    <description lang="ja">JavaDocの検索支援とコードをエディタで開く</description>
    <version>0.0.1</version>
    <updateURL>http://github.com/maeda-/Heaven-s-Door/raw/master/java-doc.ks.js</updateURL>
    <iconURL>http://github.com/</iconURL>
    <author mail="clouds.across.the.moon@gmail.com" twitter="maeda_" homepage="http://d.hatena.ne.jp/clouds-across-the-moon//">maeda_</author>
    <license>The MIT License</license>
    <license lang="ja">MIT ライセンス</license>
    <minVersion>1.5.6</minVersion>
    <include>main</include>
    <provides>
        <ext>heavens-view</ext>
    </provides>
    <require>
     <script>http://github.com/maeda-/Heaven-s-Door/raw/master/heavens-door.js</script>
    </require>
    <options>
        <option>
            <name>heaven.java.references</name>
            <type>object</type>
            <description>Path for JavaDoc, etc...</description>
            <description lang="ja">JavaDocへのパス等の設定</description>
        </option>
    </options>
    <detail lang="ja"><![CDATA[
.keysnail.jsのPRESERVE領域内に記述を追加してください。(パスは環境に応じて適切に設定してください)
>|javascript|
plugins.options["heaven.java.references"] = [
    { name : "java",
      param : {
	  rootDocUrl : "file:///where/your/java/doc/ja/api/",						// JavaDocのallclasses-frame.htmlがあるディレクトリ
	  rootSourceDir:"/where/your/java/code/j2se/src/share/classes/"					// ローカルのコードの配置ディレクトリ
      }
    },
    { name : "commons-collection",
      param : {
	  rootDocUrl : "http://commons.apache.org/collections/api-release/"
      }
    }
];
||<

.keysnailに下記のようなキーバインドを設定します。
>|javascript|
key.setViewKey(['C-c', 'd', 'j'], function(ev, arg){
    plugins.heavens.scala.open();
}, 'Java Docを開く');
key.setViewKey(['C-c', 's'], function(ev, arg){
    ext.exec("heavens-view",arg);
}, 'コードをエディタで開く');
||<

上記のような設定により C-c d j でclass/interfaceのJavaDocの検索が可能になります。
初回実行時はインデックスの作成が実行されます。右上にインデックス作成完了のメッセージが表示された後、再度 C-c d jを実行してください。
また、JavaDocを表示中に、C-c s で、今表示しているclass/interfaceのコードをテキストエディタで開きます。
]]></detail>
</KeySnailPlugin>;
// }}}

// ChangeLog : {{{
//
// ==== 0.0.1 (2011 05/01) ====
//
// * Created
//
// }}}

userscript.require("heavens-door.js", this);

HeavensDoors("heaven.java.references", function(param){
    const rootDocUrl = param.rootDocUrl;
    const rootSourceDir = param.rootSourceDir;

    const plugin = {};
    plugin.index = function(completeIndex){
	this.openPage(param.rootDocUrl + "allclasses-frame.html", function(doc){
	    completeIndex(
		_(doc.match(/A HREF="[^"]*"/g)).chain()
		    .map(function(href){ 
			return href.match(/A HREF="([^"]*)"/)[1];
		    })
		    .map(function(link){
			return [rootDocUrl + link, 
				link.replace(/\//g,".").replace(/.html$/, "")];
		    })
		    .sort()
		    .value()
	    );
	})
    }

    if(param.rootSourceDir){
	plugin.view = function(){
	    if(content.location.href.indexOf(param.rootDocUrl) != 0) return false;

	    const url = content.location.href;
	    const regex = new RegExp(rootDocUrl + "(.*)\.html");
	    const source = url.match(regex)[1] + ".java";
	    const sourceDir = this.appendPath(rootSourceDir, source);
	    this.openWithEditor(sourceDir);
	    return true;
	}
    }
    return plugin;
});
