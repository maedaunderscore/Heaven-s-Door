// PLUGIN INFO: {{{
var PLUGIN_INFO =
<KeySnailPlugin>
    <name>Heavens Door for Scala</name>
    <description>Search ScalaDoc and open the code with editor</description>
    <description lang="ja">Scala Docの検索支援とコードをエディタで開く</description>
    <version>0.0.1</version>
    <updateURL>http://github.com/maeda-/Heaven-s-Door/raw/master/scala-doc.ks.js</updateURL>
    <iconURL>http://github.com/</iconURL>
    <author mail="clouds.across.the.moon@gmail.com" twitter="maeda_" homepage="http://d.hatena.ne.jp/clouds-across-the-moon/">maeda_</author>
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
            <name>heaven.scala.references</name>
            <type>object</type>
            <description>Path for ScalaDoc, etc...</description>
            <description lang="ja">ScalaDocのパス等の設定</description>
        </option>
    </options>
    <detail lang="ja"><![CDATA[
=== 使い方 ===
.keysnail.jsのPRESERVE領域内に記述を追加してください。(パスは環境に応じて適切に設定してください)
>|javascript|
plugins.options["heaven.scala.references"] = [
    { name : "scala",
      param : {
	  version: "2.9",
	  rootDocUrl : "file:///where/your/scala/doc/scala-2.9.0.RC1-devel-docs/api/",			// ScalaDocのindex.htmlがあるディレクトリ
	  rootSourceLinkUrl:"https://lampsvn.epfl.ch/trac/scala/browser/scala/branches/2.9.x/src/",	// 2.9の場合はコレ
	  rootSourceDir:"/where/your/scala/code/scala-2.9.0.RC1-sources/src/"				// Scalaコードのlibraryディレクトリがあるディレクトリ
      }
    },
    { name : "lift",
      param : {
	  version: "2.8",										// liftのScalaDocはScala 2.8の頃のフォーマット
	  rootDocUrl : "file:///where/your/lift/doc/liftweb-2.3-doc/"
      }
    }
];
||<

.keysnailに下記のようなキーバインドを設定します。
>|javascript|
key.setViewKey(['C-c', 'd', 's'], function(ev, arg){
    plugins.heavens.scala.open();
}, 'Scala Docを開く');
key.setViewKey(['C-c', 's'], function(ev, arg){
    ext.exec("heavens-view",arg);
}, 'コードをエディタで開く');
||<

上記のような設定により C-c d s でclass/trait/objectのScalaDocの検索が可能になります。
初回実行時はインデックスの作成が実行されます。右上にインデックス作成完了のメッセージが表示された後、再度 C-c d sを実行してください。
また、ScalaDocを表示中に、C-c s で、今表示しているScala Docのコードをテキストエディタで開きます。
]]></detail>
</KeySnailPlugin>;
// }}}

// ChangeLog : {{{
//
// ==== 0.0.1 (2010 05/01) ====
//
// * Created
//
// }}}


userscript.require("heavens-door.js", this);

HeavensDoors("heaven.scala.references", function(param){
    const OBJECT = "object";
    const CLASS = "class";
    const TRAIT = "trait";
    const CASECLASS = "case class";
    
    const plugin = {};
    plugin.styles = [null,"color:#001d6b;"];
    if(param.version=="2.9"){
	plugin.index = function(completeIndex){
	    this.openPage(param.rootDocUrl + "index.html", function(doc){
		var Index = {};
		eval(doc.match("Index.PACKAGES = {.*};")[0]);
		
		completeIndex(
		    _(Index.PACKAGES).chain()
			.reduce( function (acc, xs){ return acc.concat(xs) }, [])
			.map(function(cl){
			    const buf = []
			    if(cl[OBJECT]) buf.push( [param.rootDocUrl + cl[OBJECT], cl.name,  OBJECT] );
			    if(cl[CLASS])  buf.push( [param.rootDocUrl + cl[CLASS], cl.name,  CLASS] );
			    if(cl[TRAIT])  buf.push( [param.rootDocUrl + cl[TRAIT], cl.name,  TRAIT] );
			    if(cl[CASECLASS]) buf.push( [param.rootDocUrl + cl[CASECLASS], cl.name, CASECLASS] );
			    return buf;
			})
			.reduce( function (acc, xs){ return acc.concat(xs) }, [])
			.value()
		);
	    });
	}
    }else{
	plugin.index = function(completeIndex){
	    this.openPage(param.rootDocUrl + "index.html", function(doc){
		completeIndex(
		    _(doc.match(/<a href="([^"]*)" class="[^"]*"><span class="([^"]*)">/g)).chain()
			.map(function(m){
			    return m.match(/<a href="([^"]*)" class="[^"]*"><span class="([^"]*)">/)
			})
			.map(function(m){
			    return [param.rootDocUrl + m[1], 
				    m[1].replace(/\//g, ".").replace(/\$?\.html$/, ""),
				    m[2]]
			})
			.value()
		);
	    });
	}
    }

    if(param.rootSourceDir){
	plugin.view = function(){

	    const comment = this.xpath(content.document.body, '//div[@id="comment"]')
	    if(comment.snapshotLength == 0) return false;
	    const link = comment.snapshotItem(0).innerHTML.match("source: <a href=\"([^\"]*)\">");
	    if(!link) return false;
	    var sourceDir = null;
	    if(link[1].match(/file:\/\//)){ 
		sourceDir = link[1]
	    }else{
		if(content.location.href.indexOf(param.rootDocUrl) != 0) return false;
		const sourceLinkUrl = link[1].match(param.rootSourceLinkUrl+"(.*\.scala)")
		if(sourceLinkUrl){
		    sourceDir = this.appendPath(param.rootSourceDir, sourceLinkUrl[1])
		}else{
		    return false;
		}
	    }

	    this.openWithEditor(sourceDir);
	    return true;
	}
    }
    return plugin;
});

