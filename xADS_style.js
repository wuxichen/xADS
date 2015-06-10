/**
 * Created by lenovo on 2015/6/9.
 * JavaScript 扩展基础DOM操作库
 * 样式相关库
 */

(function() {

    if (!window['xADS']) {
        window['xADS'] = {};    // namespace -- xADS
    }

    /**
     * 切换DOM元素的可见性display
     * node -- 元素，value -- 设置可见性display的非none值
     * */
    function toggleDisplay( node, value ) {
        if (!isCompatible()) { return false; }
        if (!(node = xADS.$(node))) { return false; }

        if (node.style.display !== 'none') {
            node.style.display = 'none';
        } else {
            node.style.display = value || '';
        }
        return true;
    }

    window['xADS']['toggleDisplay'] = toggleDisplay;


    /**
     * 通过ID修改单个元素的样式
     * element -- 元素（名），styles -- 样式对象{'color':'red', ...}
     * */
    function setStyleById( element, styles ) {
        if (!(element = xADS.$(element))) { return false; }

        for (var property in styles) {
            if (!styles.hasOwnProperty(property)) {
                continue;
            }

            if (element.style.setProperty) {
                element.style.setProperty(xADS.uncamelize(property, '-'), styles[property], null);
            } else {
                element.style[xADS.camelize(property)] = styles[property];
            }
        }
        return true;
    }

    window['xADS']['setStyle'] = setStyleById;
    window['xADS']['setStyleById'] = setStyleById;


    /**
     * 通过类名修改多个元素样式
     * parent -- 根元素，tag -- 标签，className -- 类名，styles -- 样式对象{'color':'red', ...}
     * */
    function setStylesByClassName( className, tag, parent, styles ) {
        if (!(parent = xADS.$(parent))) { return false; }
        var elements = xADS.getElementsByClassName(className, tag, parent);
        for (var i = 0; i < elements.length; i++) {
            xADS.setStyle(elements[i], styles);
        }
    }

    window['xADS']['setStylesByClassName'] = setStylesByClassName;


    /**
     * 通过标签名修改多个元素的样式
     * parent -- 根元素，tagName -- 标签名，styles -- 样式对象
     * */
    function setStylesByTagName( tagName, styles, parent ) {
        parent = xADS.$(parent) || document;
        var elements = parent.getElementsByTagName(tagName);
        for (var i = 0; i < elements.length; i++) {
            xADS.setStyle(elements[i], styles);
        }
    }

    window['xADS']['setStylesByTagName'] = setStylesByTagName;


    /**
     * 获取元素的计算样式
     * element -- 元素，property -- 样式属性
     * */
    function getStyle( element, property ) {
        if (!(element = xADS.$(element))) { return false; }
        var value = element.style[ xADS.camelize(property) ];

        if (!value) {
            // 取得计算的样式值
            if ( document.defaultView && document.defaultView.getComputedStyle ) {
                // DOM 规范方法
                var css = document.defaultView.getComputedStyle(element, null);
                value = css ? css.getPropertyValue(property) : null;
            } else {
                // MSIE 方法
                value = element.currentStyle[ xADS.camelize(property) ];
            }
        }

        // 返回空字符串而不是'auto'
        return value === 'auto' ? '' : value;
    }

    window['xADS']['getStyle'] = getStyle;
    window['xADS']['getStyleById'] = getStyle;


    /**
     * 取得包含元素类名的数组
     * element -- 元素（名或元素）
     * */
    function getClassNames( element ) {
        if (!(element = xADS.$(element))) { return false; }

        // 用一个空格替代多个空格，然后分割
        return element.className.replace(/\s+/, ' ').split(' ');
    }

    window['xADS']['getClassNames'] = getClassNames;


    /**
     * 检查元素中是否存在某个类
     * element -- 元素（名或元素），className -- 类名
     * */
    function hasClassName( element, className ) {
        if (!(element = xADS.$(element))) { return false; }
        var classes = xADS.getClassNames(element);
        for (var i = 0; i < classes.length; i++) {
            if (classes[i] === className) {
                return true;
            }
        }
        return false;
    }

    window['xADS']['hasClassName'] = hasClassName;


    /**
     * 为元素添加类
     * element -- 元素（名或元素），className -- 类名
     * */
    function addClassName( element, className ) {
        if (!(element = xADS.$(element))) { return false; }

        // 将类名加至末尾，若已有类名，则前面加个空格
        element.className += (element.className ? ' ' : '') + className;
        return true;
    }

    window['xADS']['addClassName'] = addClassName;


    /**
     * 从元素中删除类
     * element -- 元素（名或元素），className -- 类名
     * */
    function removeClassName( element, className ) {
        if (!(element = xADS.$(element))) { return false; }
        var classes = xADS.getClassNames(element);
        var length = classes.length;

        // 循环遍历数组删除匹配的项 [[因为删除会变短，所以反向循环]]
        for (var i = length-1; i >= 0; i--) {
            if (classes[i] === className) {
                delete classes[i];
            }
        }

        element.className = classes.join(' ');
        return classes.length == length ? false : true;
    }

    window['xADS']['removeClassName'] = removeClassName;


    /**
     * 切换类名的存在
     * element -- 元素（名或元素），className -- 类名
     * */
    function toggleClassName( element, className ) {
        if (!xADS.hasClassName(element, className)) {
            xADS.addClassName(element, className);
        } else {
            xADS.removeClassName(element, className);
        }
    }

    window['xADS']['toggleClassName'] = toggleClassName;


    /**
     * 添加新样式表
     * url -- 样式表url，media -- 目标媒体
     * */
    function addStyleSheet( url, media ) {
        media = media || 'screen';
        var link = document.createElement('LINK');
        link.setAttribute('rel', 'stylesheet');
        link.setAttribute('type', 'text/css');
        link.setAttribute('href', url);
        link.setAttribute('media', media);

        document.getElementsByTagName('head')[0].appendChild(link);
    }

    window['xADS']['addStyleSheet'] = addStyleSheet;


    /**
     * 通过URL取得包含所有样式表的数组
     * url -- 样式表，media -- 目标媒体
     * */
    function getStyleSheets(url, media) {
        var sheets = [];

        for (var i = 0; i < document.styleSheets.length; i++) {
            if (url && document.styleSheets[i].href.indexOf(url) == -1) {
                continue;
            }

            if (media) {
                //规范化media字符串
                media = media.replace(/,\s*/, ',');
                var sheetMedia;

                if (document.styleSheets[i].media.mediaText) {
                    // DOM 方法
                    sheetMedia = document.styleSheets[i].media.mediaText.replace(/,\s*/, ',');
                    sheetMedia = sheetMedia.replace(/,\s*xADS.$/, '');
                } else {
                    // MSIE 方法
                    sheetMedia = document.styleSheets[i].media.replace(/,\s*/, ',');
                }

                // media匹配不通过，则跳过
                if (media !== sheetMedia) {
                    continue;
                }
            }

            sheets.push(document.styleSheets[i]);
        }
        return sheets
    }

    window['xADS']['getStyleSheets'] = getStyleSheets;



    /**
     * 删除样式表
     * url -- 样式表url，media -- 目标媒体
     * */
    function removeStyleSheet( url, media ) {
        var styles = xADS.getStyleSheets(url, media);
        for (var i = 0; i < styles.length; i++) {
            var node = styles[i].ownerNode || styles[i].owningElement;

            // 禁用样式表
            styles[i].disabled = true;

            //移除节点
            node.parentNode.removeChild(node);
        }
    }

    window['xADS']['removeStyleSheet'] = removeStyleSheet;


    /**
     * 编辑一条样式规则
     * selector -- 选择符，styles -- 样式对象，url -- 样式表的url或者CSSStyleSheet对象数组，media -- 目标媒体
     * */
    function editCSSRule( selector, styles, url, media ) {
        var styleSheets = (typeof url === 'array' ? url : xADS.getStyleSheets(url, media));

        for (var i = 0; i < styleSheets.length; i++) {

            // 取得CSSStyleRule规则列表
            // DOM2样式规范方法是cssRules，而MSIE是rules
            var rules = styleSheets[i].cssRules || styleSheets[i].rules;
            if (!rules) { continue; }

            // 由于MSIE默认使用大写，所以转换成大写
            selector = selector.toUpperCase();

            for (var j = 0; j < rules.length; j++) {
                if (rules[j].selectorText.toUpperCase() === selector) {
                    for (var property in styles) {
                        if (!styles.hasOwnProperty(property)) { continue; }
                        //设置新的样式属性
                        rules[j].style[ xADS.camelize(property) ] = styles[property];
                    }
                }
            }
        }
    }

    window['xADS']['editCSSRule'] = editCSSRule;


    /**
     * 添加一条CSS规则
     * selector -- 选择符，styles -- 样式对象，url -- 样式表的url或者CSSStyleSheet对象数组，media -- 目标媒体
     * */
    function addCSSRule( selector, styles, index, url, media ) {
        var declaration = '';

        // 根据styles参数（样式对象）构建声明字符串
        for (var property in styles) {
            if (!styles.hasOwnProperty(property)) { continue; }
            declaration += property + ':' + styles[property] + '; ';
        }

        var styleSheets = (typeof url === 'array' ? url : xADS.getStyleSheets(url, media));
        var newIndex;

        for (var i = 0; i < styleSheets.length; i++) {

            // 添加规则
            if (styleSheets[i].insertRule) {
                // DOM2规范方法
                newIndex = (index >= 0 ? index : styleSheets[i].cssRules.length);
                styleSheets[i].insertRule(
                    selector + ' { ' + declaration + ' } ',
                    newIndex
                );

            } else if (styleSheets[i].addRule) {
                // MSIE方法（-1为列表末尾）
                newIndex = (index >= 0 ? index : -1);
                styleSheets[i].addRule(selector, declaration, newIndex);
            }
        }
    }

    window['xADS']['addCSSRule'] = addCSSRule;


    /**
     * 颜色渐变
     * @param from -- 开始颜色（{'r':0,'g':0,'b':0}），to -- 最终颜色，callback -- 回调函数
     * @param duration -- 渐变效果持续时间 秒（默认1秒），framesPerSecond -- 一秒的帧数
     */
    function fadeColor( from, to, callback, duration, framesPerSecond ) {

        /**
         * 包装setTimeout函数，用于基于帧数计算延迟时间
         * @param color -- 应用的颜色，frame -- 处于的帧数（即从开始起应该延迟的时间）
         */
        function doTimeout( color, frame ) {
            setTimeout(function(){
                try {
                    callback(color);
                } catch(e) {
                    console.log(e);
                }
            }, (duration * 1000 / framesPerSecond)*frame );
        }

        var duration = duration || 1;
        var framesPerSecond = framesPerSecond || duration*15;

        var r, g, b;
        var frame = 1;

        // 设置起始颜色 第0帧
        doTimeout('rgb(' + from.r + ',' + from.g + ',' + from.b + ')', 0);

        // 计算两帧之间的RGB值的改变量，并加入时间队列
        while (frame <= framesPerSecond) {
            r = Math.ceil(from.r + (to.r-from.r) * (frame / framesPerSecond));
            g = Math.ceil(from.g + (to.g-from.g) * (frame / framesPerSecond));
            b = Math.ceil(from.b + (to.b-from.b) * (frame / framesPerSecond));

            doTimeout('rgb(' + r + ',' + g + ',' + b + ')', frame);
            frame++;
        }

    }

    window['xADS']['fadeColor'] = fadeColor;

})();






