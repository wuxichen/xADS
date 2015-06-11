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
        if (!isCompatible()) { return false; }

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
        if (!isCompatible()) { return false; }

        tag = tag || '*';
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
        if (!isCompatible()) { return false; }

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
        if (!isCompatible()) { return false; }

        if (!(parent = $(parent))) { return false; }
        if (!(newChild = $(newChild))) { return false; }

        if (parent.firstChild) {
            // 如果存在一个子节点，则插在这个子节点之前
            parent.insertBefore(newChild, parent.firstChild);
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
        if (!isCompatible()) { return false; }
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
        if (!isCompatible()) { return false; }

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
        if (!isCompatible()) { return false; }

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
        if (!isCompatible()) { return false; }

        var root = node || window.document;
        returnedFromParent = func.call(root, depth++, returnedFromParent);

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
     * 将连字写法转换为驼峰写法
     * s -- 连字写法字符串
     * */
    function camelize(s) {
        return s.replace(/-(\w)/g, function(strMatch, p1) {
            return p1.toUpperCase();
        });
    }

    window['xADS']['camelize'] = camelize;


    /**
     * 驼峰写法转成连字符写法
     * s -- 驼峰写法，sep -- 连字符
     * */
    function uncamelize(s, sep) {
        sep = sep || '-';
        return s.replace(/([a-z])([A-Z])/g, function (strMatch, p1, p2){
            return p1 + sep + p2.toLowerCase();
        });
    }

    window['xADS']['uncamelize'] = uncamelize;


    /**
     * 返回一个数组，浏览器窗口的宽度和高度存于其中：[width, height]
     * */
    function getWindowSize(){
        if (window.innerHeight) {
            // 最常用
            return {
                'width':window.innerWidth,
                'height':window.innerHeight
            };
        } else if (document.documentElement
            && document.documentElement.clientHeight) {
            // MSIE 严格模式
            return {
                'width':document.documentElement.clientWidth,
                'height':document.documentElement.clientHeight
            };
        } else if (document.body) {
            // MSIE 怪异模式
            return {
                'width':document.body.clientWidth,
                'height':document.body.clientHeight
            };
        }
    }

    window['xADS']['getWindowSize'] = getWindowSize;


    /**
     * 返回一个对象，以所提供元素的宽度、高度、顶部边距和左侧边距作为属性
     * @param e -- 元素
     */
    function getDimensions(e) {
        return {
            top     : e.offsetTop,
            left    : e.offsetLeft,
            width   : e.offsetWidth,
            height  : e.offsetHeight
        };
    }

    window['xADS']['getDimensions'] = getDimensions;


})();

