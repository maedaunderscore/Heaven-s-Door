// PLUGIN INFO: {{{
var PLUGIN_INFO =
<KeySnailPlugin>
    <name>Heavens Door for .NET</name>
    <description>Search .NET Document</description>
    <description lang="ja">.NET のドキュメント検索支援</description>
    <version>0.0.1</version>
    <updateURL>http://github.com/maeda-/Heaven-s-Door/raw/master/dotnet-doc.ks.js</updateURL>
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
            <name>heaven.dotnet.references</name>
            <type>object</type>
            <description>URL of .NET reference page</description>
            <description lang="ja">.NET のリファレンスページのURL</description>
        </option>
    </options>
    <detail lang="ja"><![CDATA[
.keysnail.jsのPRESERVE領域内に記述を追加してください。(英語版にしか対応していません。)
>|javascript|
plugins.options["heaven.dotnet.references"] = [
    { name : "dotnet",
      param : {
	  rootDocUrl : "http://msdn.microsoft.com/en-us/library/gg145045.aspx"
      }
    }
];
||<

.keysnailに下記のようなキーバインドを設定します。
>|javascript|
key.setViewKey(['C-c', 'd', 'd'], function(ev, arg){
    plugins.heavens.dotnet.open();
}, '.NET Documentcを開く');
||<

上記のような設定により C-c d d でclass/interface等のドキュメントの検索が可能になります。
初回実行時はインデックスの作成が実行されます(数十分かかります。)右上にインデックス作成完了のメッセージが表示された後、再度 C-c d dを実行してください。
]]></detail>
</KeySnailPlugin>;
// }}}

// ChangeLog : {{{
//
// ==== 0.0.1 (2011 05/04) ====
//
// * Created
//
// }}}

userscript.require("heavens-door.js", this);

HeavensDoors("heaven.dotnet.references", function(param){

    const plugin = {};
    plugin.index = function(completeIndex){
	var indexes = [];
	var self = this;
	function crawlLinks(doctext){
	    var urls = [];
	    function textToDOM(text){
		const el = content.document.createElement('div');
		el.innerHTML = text;
		return el;
	    }
	    function tableType(table){
		return self.xpath(table, './tbody/tr/th[@class="nameColumn"]').snapshotItem(0).innerHTML;
	    }
	    function extractLinks(table){
		return self.xpath(table, './tbody/tr/td/a');
	    }
	    function extractNamespace(doc){
		const ret = self.xpath(doc, ".//div/div/h1").snapshotItem(0).innerHTML.match(/^(.*) Namespaces?$/);
		return (ret)? ret[1] : "00000UNKNOWN NAMESPACE";
	    }
	    const doc = textToDOM(doctext);
	    const namespace = extractNamespace(doc) + ".";
	    display.showPopup("now analyzing : " + namespace);
	    const tables = self.xpath(doc, "//table[@class='members']")
	    for(var i = 0; i < tables.snapshotLength; i++){
		var table = tables.snapshotItem(i);
		var type = tableType(table);
		var links = extractLinks(table);
		
		if(type == "Namespace"){
		    for(var j = 0; j < links.snapshotLength; j++){
			var link = links.snapshotItem(j);
			urls.push(link.href);
		    }
		}else{
		    for(var j = 0; j < links.snapshotLength; j++){
			var link = links.snapshotItem(j);
			indexes.push([link.href, namespace + link.innerHTML, type]);
		    }
		}
	    }
	    return urls;
	}

	this.openPages([param.rootDocUrl], crawlLinks, function(){
	    completeIndex(indexes);
	});
    }
    return plugin;
});
