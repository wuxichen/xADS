/**
 * Created by lenovo on 2015/6/11.
 * 测试用js
 */

(function () {

    // xADS_main.js
    // ---------------------------------------------------------

    // getElementsByClassName
    var listElements = xADS.getElementsByClassName('list');
    for (var i = 0; i < listElements.length; i++) {
        console.log(listElements[i]);
    }

    // insertAfter
    var div = document.createElement('div');
    div.setAttribute('style', 'color:red;text-decoration:underline;');
    div.appendChild( document.createTextNode('我是新加入的') );
    var subtitle = xADS.$('subtitle');
    xADS.insertAfter(div, subtitle);

    // prependChild
    var list = listElements[0];
    var li = document.createElement('li');
    li.appendChild( document.createTextNode('我是新的li') );
    xADS.prependChild(list, li);

    // removeChild
    //setTimeout(function(){
    //    xADS.removeChildren(list);
    //    console.log('remove children of list');
    //}, 5000);

    // 遍历DOM树
    function printNode() {
        var node = this;
        if (node.nodeType) {
            console.log('Name: ' + node.nodeName + ', Value: ' + node.nodeValue + ', Type: ' + node.nodeType);
        } else {
            console.log('invalid node.');
        }
    }

    console.log('--- walkElementsLinear -------------');
    console.log('只能取到元素节点，无法文本节点')
    xADS.walkElementsLinear(printNode, document.body);

    console.log('--- walkTheDOMRecursive -------------');
    xADS.walkTheDOMRecursive(printNode, document.body, 0);

    console.log('--- walkTheDOMWithAttributes -------------');
    xADS.walkTheDOMWithAttributes(printNode, document.body, 0);


    // getWindowSize
    console.log( xADS.getWindowSize() );

    // getDimensions
    console.log( xADS.getDimensions(list) );


    // xADS_event.js
    // ---------------------------------------------------------

    xADS.addEvent(div, 'click', function(event){
        printNode.call(this);
        event = xADS.getEventObject(event);

        console.log( xADS.getMouseButton(event) );
        console.log( xADS.getTarget(event) );
        console.log( xADS.getPointerPositionInDocument(event) );
    });

    xADS.addEvent(document, 'keypress', function(event){
        console.log( xADS.getKeyPressed(event) );
    });


    // xADS_style.js
    xADS.setStyle('subsubtitle', {'background-color':'#eec883'});
    xADS.setStylesByClassName('list', {'color':'blue'});
    xADS.setStylesByTagName('h1', {'color':'darkred'});

    console.log( xADS.getStyle('title','font-family') );

    console.log( xADS.getClassNames('subsubtitle') );
    console.log( xADS.hasClassName('subsubtitle', 'c') );
    console.log( xADS.hasClassName('subsubtitle', 'd') );
    console.log( xADS.addClassName('subsubtitle', 'd') );
    console.log( xADS.removeClassName('subsubtitle', 'c') );

    xADS.editCSSRule('body', {'background-color':'#eee'});
    xADS.addCSSRule('body', {'font-size':'200%', 'color':'#34bd82'});

    xADS.fadeColor(
        {'r':76,'g':162,'b':192},
        {'r':212,'g':54,'b':130},
        function(color) {
            xADS.setStyle('colorful', {'background-color':color});
        },
        1
    );

})();

