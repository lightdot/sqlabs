var _change = function(_style,___change){
var selection = getSelection();
var range = selection.getRangeAt(0);

if(range.startContainer.nodeType == Node.TEXT_NODE){
	if(range.endContainer == range.startContainer){
		var textnode = range.startContainer;
		textnode.splitText(range.endOffset);
		var text1 = textnode.splitText(range.startOffset);
		var newspan = document.createElement('span');
		var range2 = document.createRange();
		range2.selectNode(text1);
		range2.surroundContents(newspan);
		range2.detach();
		range.selectNode(newspan);
	}
        else{
        	var newone = range.startContainer.splitText(range.startOffset);
		var newspan = document.createElement('span');
		var range2 = document.createRange();
		range2.selectNode(newone);
		range2.surroundContents(newspan);
		range2.detach();
		range.setStartBefore(newspan);
        }
}

if(range.endContainer.nodeType == Node.TEXT_NODE){
	range.endContainer.splitText(range.endOffset);
	var newspan = document.createElement('span');
	var range2 = document.createRange();
	range2.selectNode(range.endContainer);
	range2.surroundContents(newspan);
	range2.detach();
	range.setEndAfter(newspan);
}
 
var currentNode = range.startContainer;
var range2 = document.createRange();
while(true){
	range2.selectNode(currentNode);
	if(range2.compareBoundaryPoints(Range.START_TO_START,range)==-1 ||
	   range2.compareBoundaryPoints(Range.END_TO_END,range)==1){
		if(range2.compareBoundaryPoints(Range.START_TO_END,range)<=0){
			while(currentNode.parentNode || currentNode.nextSibling){
				if(currentNode.nextSibling){
					currentNode=currentNode.nextSibling;
					break;
				}
				currentNode=currentNode.parentNode;
			}
			continue;
		}
                else if(range2.compareBoundaryPoints(Range.END_TO_START,range)>=0){
			break;
		}else{
			if(currentNode.firstChild){
				currentNode = currentNode.firstChild;
				continue;
			}else{
				break;
			}
		}
	}
        else{
        	var cN_children = jQuery("*", currentNode);
		cN_children.css(_style,___change);

		//親がはみ出ている場合のスタイル指定
                //！！！！！！！！！ここがうまく機能していないために、滅多に親がはみ出すことがなく、バグが発生している！
                //根本的な原因は<span>で囲むことによってrangeのスタートコンテナーが変化することであると考えられる。
		if(currentNode.nodeType == Node.TEXT_NODE){
			//テキストノードだったら、span要素で囲む
			var newspan = document.createElement('span');
			$(newspan).css(_style,___change);
			range2.selectNode(currentNode);
			range2.surroundContents(newspan);
		}else{
			//それ以外なら、直接スタイル指定
			$(currentNode).css(_style,___change);
		}
                //親もしくは兄弟がいる要素になるまでwhilw文をまわす
		while(currentNode.parentNode || currentNode.nextSibling){	//親も兄弟もいなければどうしようもない
			if(currentNode.nextSibling){
				currentNode=currentNode.nextSibling;
				break;
			}
			currentNode=currentNode.parentNode;
		}
		continue;
	}
}
range2.detach();

}
