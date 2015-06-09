/**
 * Created by lenovo on 2015/6/6.
 * JavaScript 扩展基础DOM操作库
 * 事件相关库
 */

(function() {

    if (!window['xADS']) {
        window['xADS'] = {};    // namespace -- xADS
    }

    /**
     * 绑定事件
     * node -- 绑定对象，type -- 事件类型，listener -- 事件回调函数
     * */
    function addEvent( node, type, listener ) {
        if (!isCompatible()) { return false; }
        if (!(node = $(node))) { return false; }

        if (node.addEventListener) {
            // W3C 方法
            node.addEventListener(type, listener, false);
            return true;

        } else if (node.attachEvent) {
            // MSIE 方法
            node['e' + type + listener] = listener;
            node[type + listener] = function() {
                node['e' + type + listener](window.event);
            };
            node.attachEvent('on'+type, node[type+listener]);
            return true;
        }

        return false;
    }

    window['xADS']['addEvent'] = addEvent;


    /**
     * 解除事件绑定
     * node -- 绑定的对象，type -- 事件类型，listener -- 事件回调函数
     * */
    function removeEvent( node, type, listener ) {
        if (!isCompatible()) { return false; }
        if (!(node = $(node))) { return false; }

        if (node.removeEventListener) {
            // W3C 方法
            node.removeEventListener(type, listener, false);
            return true;

        } else if (node.detachEvent) {
            // MSIE 方法
            node.detachEvent('on'+type, node[type+listener]);
            node[type + listener] = null;
            return true;
        }

        return false;
    }

    window['xADS']['removeEvent'] = removeEvent;


    /**
     * 阻止事件冒泡
     * eventObject -- 事件对象
     * */
    function stopPropagation( eventObject ) {
        if (!isCompatible()) { return false; }

        eventObject = eventObject || getEventObject(eventObject);
        if (eventObject.stopPropagation) {
            eventObject.stopPropagation();
        } else {
            eventObject.cancelBubble = true;
        }
    }

    window['xADS']['stopPropagation'] = stopPropagation;


    /**
     * 取消事件的默认动作
     * eventObject -- 事件对象
     * */
    function preventDefault( eventObject ) {
        if (!isCompatible()) { return false; }

        eventObject = eventObject || getEventObject(eventObject);
        if (eventObject.preventDefault) {
            eventObject.preventDefault();
        } else {
            eventObject.returnValue = false;
        }
    }

    window['xADS']['preventDefault'] = preventDefault;


    /**
     * Load事件在DOM树结构建完之后，就运行，而无需等到所有元素都载入完毕（如图像）
     * loadEvent -- 加载事件，waitForImages -- 是否等图片加载完
     * */
    function addLoadEvent( loadEvent, waitForImages ) {
        if (!isCompatible()) { return false; }

        // 如果等待标记为true，则使用常规的load事件
        if (waitForImages) {
            return addEvent(window, 'load', loadEvent);
        }

        // 否则使用不同的方法包装loadEvent()

        // 以便为this关键字指定确定内容，同时确保事件不会执行两次
        var init = function() {

            // 如果这个函数以及被调用过了，则返回
            if (arguments.callee.done) { return; }

            // 标记这个函数以便检验它是否已运行
            arguments.callee.done = true;

            // 在document的环境中运行载入事件
            loadEvent.apply(document, arguments);
        };

        // 1.W3C方法：为DOMContentLoaded事件注册事件侦听器
        if (document.addEventListener) {
            document.addEventListener('DOMContentLoaded', init, false);
        }

        // 2.Safari方法：使用setInterval()函数检测
        if ( /Webkit/i.test(navigator.userAgent) ) {

            var _timer = setInterval(function() {
                if ( /loaded|complete/.test(document.readyState) ) {
                    clearInterval(_timer);
                    init();
                }
            }, 10);
        }

        // 3.对于IE（使用条件注释），附加一个在载入过程最后执行的脚本，并检测脚本是否载入完成
        /*@cc_on @*/
        /*@if (@_win32)
         document.write('<script id=__ie_onload defer src=javascript:void(0)><\/script>');
         var script = document.getElementById('__ie_onload');
         script.onreadystatechange = function() {
         if (this.readyState == 'complete') {
         init();
         }
         };
         /*@ end @*/
        return true;
    }

    window['xADS']['addLoadEvent'] = addLoadEvent;


    /**
     * 获取事件对象
     * eventObject -- 事件对象
     * */
    function getEventObject( W3CEvent ) {
        // W3C可传递到事件侦听器中，而IE用window.event
        return W3CEvent || window.event;
    }

    window['xADS']['getEventObject'] = getEventObject;


    /**
     * 访问事件的目标元素
     * eventObject -- 事件对象
     * */
    function getTarget( eventObject ) {
        if (!isCompatible()) { return false; }

        eventObject = eventObject || getEventObject(eventObject);

        // W3C或MSIE模型
        var target = eventObject.target || eventObject.srcElement;

        // Safari中会获取文本节点，而非其父节点
        // 故若是文本节点，则取其父节点
        if (target.nodeType === xADS.node.TEXT_NODE) {
            target = target.parentNode;
        }

        return target;
    }

    window['xADS']['getTarget'] = getTarget;


    /**
     * 确定单击了哪个鼠标按键
     * eventObject -- 事件对象
     * */
    function getMouseButton( eventObject ) {
        if (!isCompatible()) { return false; }

        eventObject = eventObject || getEventObject(eventObject);

        // 使用适当的属性初始化一个对象变量
        var buttons = {
            'left': false,
            'middle': false,
            'right': false
        };

        // W3C检测 eventObject对象的toString方法，应该是MouseEvent
        if ( eventObject.toString && eventObject.toString().indexOf('MouseEvent') != -1 ) {
            switch (eventObject.button) {
                case 0: buttons.left = true; break;
                case 1: buttons.middle = true; break;
                case 2: buttons.right = true; break;
                default: break;
            }

        } else if (eventObject.button) {
            // MSIE方法
            switch (eventObject.button) {
                case 1: buttons.left = true; break;
                case 2: buttons.right = true; break;
                case 3:
                    buttons.left = true;
                    buttons.right = true;
                    break;
                case 4: buttons.middle = true; break;
                case 5:
                    buttons.left = true;
                    buttons.middle = true;
                    break;
                case 6:
                    buttons.middle = true;
                    buttons.right = true;
                    break;
                case 7:
                    buttons.left = true;
                    buttons.middle = true;
                    buttons.right = true;
                    break;
                default: break;
            }
        } else {
            return false;
        }

        return buttons;
    }

    window['xADS']['getMouseButton'] = getMouseButton;


    /**
     * 获取鼠标相对于文档的位置
     * eventObject -- 事件对象
     * */
    function getPointerPositionInDocument( eventObject ) {
        if (!isCompatible()) { return false; }

        eventObject = eventObject || getEventObject();

        var x = eventObject.pageX || (eventObject.clientX +
            (document.documentElement.scrollLeft
                || document.body.scrollLeft));

        var y = eventObject.pageY || (eventObject.clientY +
            (document.documentElement.scrollTop
                || document.body.scrollTop));

        return {'x': x, 'y': y};
    }

    window['xADS']['getPointerPositionInDocument'] = getPointerPositionInDocument;


    /**
     * 获取键盘命令
     * eventObject -- 事件对象
     * */
    function getKeyPressed( eventObject ) {
        if (!isCompatible()) { return false; }

        eventObject = eventObject || getEventObject(eventObject);

        var code = eventObject.keyCode;
        var value = String.fromCharCode(code);
        return {'code': code, 'value': value};
    }

    window['xADS']['getKeyPressed'] = getKeyPressed;


})();


