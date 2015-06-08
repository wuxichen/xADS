/**
 * Created by lenovo on 2015/6/6.
 * JavaScript 扩展基础DOM操作库
 *
 */


(function(){

    if (!window['xADS']) {
        window['xADS'] = {};    // namespace -- xADS
    }

    window['xADS']['node'] = {
        ELEMENT_NODE                    : 1,
        ATTRIBUTE_NODE                  : 2,
        TEXT_NODE                       : 3,
        CDATA_SECTION_NODE              : 4,
        ENTITY_REFERENCE_NODE           : 5,
        ENTITY_NODE                     : 6,
        PROCESSING_INSTRUCTION_NODE     : 7,
        COMMENT_NODE                    : 8,
        DOCUMENT_NODE                   : 9,
        DOCUMENT_TYPE_NODE              : 10,
        DOCUMENT_FRAGMENT_NODE          : 11,
        NOTATION_NODE                   : 12
    };

    /**
     * 确定当前库是否与浏览器兼容
     * other --
     * */
    function isCompatible(other) {
        if ( other === false
            || !Array.prototype.push
            || !Object.hasOwnProperty
            || !document.createElement
            || !document.getElementById
        ) {
            return false;
        }
        return true;
    }

    window['xADS']['isCompatible'] = isCompatible;


    /**
     * 获取DOM元素，类似document.getElementById
     * 可传递实参 多个id
     * */
    function $() {
        var elements = new Array();

        for (var i = 0; i < arguments.length; i++) {
            var element = arguments[i];

            // 若该参数是字符串，则假设其为id，并获取DOM元素
            if (typeof element === 'string') {
                element = document.getElementById(element);
            }

            // 若只有一个元素，则立即返回该元素
            if (arguments.length === 1) {
                return element;
            }

            // 否则加入到数组中
            elements.push(element);
        }

        // 最后包含多个被请求元素的数组
        return elements;
    }

    window['xADS']['$'] = $;


    /**
     * 用类名获取元素，类似document.getElementsByClassName（高版本DOM）
     * className -- 类名，tag -- 标签名，parent -- 以该元素为根进行查找
     * */
    function getElementsByClassName( className, tag, parent ) {
        parent = parent || document;
        if (!(parent = $(parent))) { return false; }

        // 查找所有匹配的标签
        // document.all 是页面所有元素的集合
        var allTags = (tag === '*' && parent.all) ? parent.all : parent.getElementsByTagName(tag);
        var matchingElements = new Array();

        // 创建正则表达式，判断className是否正确
        className = className.replace(/\-/g, "\\-");
        var regex = new RegExp("(^|\\s)" + className + "(\\s|$)");

        // 检查每一个元素，是否具有className
        for (var i = 0; i < allTags.length; i++) {
            var element = allTags[i];
            if (regex.test(element.className)) {
                matchingElements.push(element);
            }
        }
        return matchingElements;
    }

    window['xADS']['getElementsByClassName'] = getElementsByClassName;


    /**
     * 插入 新元素 到 参考元素 后面
     * node -- 新元素，referenceNode -- 插在该元素后面
     * */
    function insertAfter( node, referenceNode ) {
        if (!(node = $(node))) { return false; }
        if (!(referenceNode = $(referenceNode))) { return false; }

        return referenceNode.parentNode.insertBefore(node, referenceNode.nextSibling);
    }

    window['xADS']['insertAfter'] = insertAfter;


    /**
     * 插入元素子节点，到父节点前面
     * parent -- 新元素的父节点，newChild -- 新元素
     * */
    function prependChild( parent, newChild ) {
        if (!(parent = $(parent))) { return false; }
        if (!(newChild = $(newChild))) { return false; }

        if (parent.firstChild) {
            // 如果存在一个子节点，则插在这个子节点之前
            parent.firstChild.insertBefore(newChild);
        } else {
            // 如果没有子节点，则直接插入到末尾
            parent.appendChild(newChild);
        }
        return parent;
    }

    window['xADS']['prependChild'] = prependChild;



    /**
     * 删除父节点的所有子节点
     * parent -- 父节点，删除其所有子节点
     * */
    function removeChildren(parent) {
        if (!(parent = $(parent))) { return false; }

        while (parent.firstChild) {
            parent.firstChild.parentNode.removeChild(parent.firstChild);
        }

        // 返回父节点以便实现 连缀
        return parent;
    }

    window['xADS']['removeChildren'] = removeChildren;


    /**
     * 遍历DOM树，利用通配符*
     * func -- 每个节点调用函数，node -- 根节点
     * */
    function walkElementsLinear( func, node ) {
        var root = node || window.document;
        var nodes = root.getElementsByTagName('*');
        for (var i = 0; i < nodes.length; i++) {
            func.call(nodes[i]);
        }
    }

    window['xADS']['walkElementsLinear'] = walkElementsLinear;


    /**
     * 遍历DOM树，递归调用
     * func -- 每个节点调用函数，node -- 根节点，depth -- 递归深度，returnedFromParent -- 父节点调用func返回的信息
     * */
    function walkTheDOMRecursive( func, node, depth, returnedFromParent ) {
        var root = node || window.document;
        var returnedFromParent = func.call(root, depth++, returnedFromParent);
        var node = root.firstChild;

        while (node) {
            walkTheDOMRecursive(func, node, depth, returnedFromParent);
            node = node.nextSibling;
        }
    }

    window['xADS']['walkTheDOMRecursive'] = walkTheDOMRecursive;


    /**
     * 遍历DOM树，包括其属性节点
     * func -- 每个节点调用函数，node -- 根节点，depth -- 递归深度，returnedFromParent -- 父节点调用func返回的信息
     * */
    function walkTheDOMWithAttributes( func, node, depth, returnedFromParent ) {
        var root = node || window.document;
        returnedFromParent = func(root, depth++, returnedFromParent);

        if (root.attributes) {
            for (var i = 0; i < root.attributes.length; i++) {
                walkTheDOMWithAttributes(func, root.attributes[i], depth-1, returnedFromParent);
            }
        }

        if (root.nodeType != xADS.node.ATTRIBUTE_NODE) {
            node = root.firstChild;
            while (node) {
                walkTheDOMWithAttributes(func, node, depth, returnedFromParent);
                node = node.nextSibling;
            }
        }
    }

    window['xADS']['walkTheDOMWithAttributes'] = walkTheDOMWithAttributes;


    /**
     * 绑定事件
     * node -- 绑定对象，type -- 事件类型，listener -- 事件回调函数
     * */
    function addEvent( node, type, listener ) {
        //TODO 绑定事件
    }

    window['xADS']['addEvent'] = addEvent;


    /**
     * 解除事件绑定
     * node -- 绑定的对象，type -- 事件类型，listener -- 事件回调函数
     * */
    function removeEvent( node, type, listener ) {
        //TODO 解除绑定事件
    }

    window['xADS']['removeEvent'] = removeEvent;


    /**
     * 切换DOM元素的可见性display
     * node -- 元素，value -- 设置可见性display的非none值
     * */
    function toggleDisplay( node, value ) {
        if (!(node = $(node))) { return false; }

        if (node.style.display !== 'none') {
            node.style.display = 'none';
        } else {
            node.style.display = value || '';
        }
        return true;
    }

    window['xADS']['toggleDisplay'] = toggleDisplay;

})();

