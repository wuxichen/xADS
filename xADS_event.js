/**
 * Created by lenovo on 2015/6/6.
 * JavaScript ��չ����DOM������
 * �¼���ؿ�
 */

(function() {

    if (!window['xADS']) {
        window['xADS'] = {};    // namespace -- xADS
    }

    /**
     * ���¼�
     * node -- �󶨶���type -- �¼����ͣ�listener -- �¼��ص�����
     * */
    function addEvent( node, type, listener ) {
        if (!isCompatible()) { return false; }
        if (!(node = $(node))) { return false; }

        if (node.addEventListener) {
            // W3C ����
            node.addEventListener(type, listener, false);
            return true;

        } else if (node.attachEvent) {
            // MSIE ����
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
     * ����¼���
     * node -- �󶨵Ķ���type -- �¼����ͣ�listener -- �¼��ص�����
     * */
    function removeEvent( node, type, listener ) {
        if (!isCompatible()) { return false; }
        if (!(node = $(node))) { return false; }

        if (node.removeEventListener) {
            // W3C ����
            node.removeEventListener(type, listener, false);
            return true;

        } else if (node.detachEvent) {
            // MSIE ����
            node.detachEvent('on'+type, node[type+listener]);
            node[type + listener] = null;
            return true;
        }

        return false;
    }

    window['xADS']['removeEvent'] = removeEvent;


    /**
     * ��ֹ�¼�ð��
     * eventObject -- �¼�����
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
     * ȡ���¼���Ĭ�϶���
     * eventObject -- �¼�����
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
     * Load�¼���DOM���ṹ����֮�󣬾����У�������ȵ�����Ԫ�ض�������ϣ���ͼ��
     * loadEvent -- �����¼���waitForImages -- �Ƿ��ͼƬ������
     * */
    function addLoadEvent( loadEvent, waitForImages ) {
        if (!isCompatible()) { return false; }

        // ����ȴ����Ϊtrue����ʹ�ó����load�¼�
        if (waitForImages) {
            return addEvent(window, 'load', loadEvent);
        }

        // ����ʹ�ò�ͬ�ķ�����װloadEvent()

        // �Ա�Ϊthis�ؼ���ָ��ȷ�����ݣ�ͬʱȷ���¼�����ִ������
        var init = function() {

            // �����������Լ������ù��ˣ��򷵻�
            if (arguments.callee.done) { return; }

            // �����������Ա�������Ƿ�������
            arguments.callee.done = true;

            // ��document�Ļ��������������¼�
            loadEvent.apply(document, arguments);
        };

        // 1.W3C������ΪDOMContentLoaded�¼�ע���¼�������
        if (document.addEventListener) {
            document.addEventListener('DOMContentLoaded', init, false);
        }

        // 2.Safari������ʹ��setInterval()�������
        if ( /Webkit/i.test(navigator.userAgent) ) {

            var _timer = setInterval(function() {
                if ( /loaded|complete/.test(document.readyState) ) {
                    clearInterval(_timer);
                    init();
                }
            }, 10);
        }

        // 3.����IE��ʹ������ע�ͣ�������һ��������������ִ�еĽű��������ű��Ƿ��������
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
     * ��ȡ�¼�����
     * eventObject -- �¼�����
     * */
    function getEventObject( W3CEvent ) {
        // W3C�ɴ��ݵ��¼��������У���IE��window.event
        return W3CEvent || window.event;
    }

    window['xADS']['getEventObject'] = getEventObject;


    /**
     * �����¼���Ŀ��Ԫ��
     * eventObject -- �¼�����
     * */
    function getTarget( eventObject ) {
        if (!isCompatible()) { return false; }

        eventObject = eventObject || getEventObject(eventObject);

        // W3C��MSIEģ��
        var target = eventObject.target || eventObject.srcElement;

        // Safari�л��ȡ�ı��ڵ㣬�����丸�ڵ�
        // �������ı��ڵ㣬��ȡ�丸�ڵ�
        if (target.nodeType === xADS.node.TEXT_NODE) {
            target = target.parentNode;
        }

        return target;
    }

    window['xADS']['getTarget'] = getTarget;


    /**
     * ȷ���������ĸ���갴��
     * eventObject -- �¼�����
     * */
    function getMouseButton( eventObject ) {
        if (!isCompatible()) { return false; }

        eventObject = eventObject || getEventObject(eventObject);

        // ʹ���ʵ������Գ�ʼ��һ���������
        var buttons = {
            'left': false,
            'middle': false,
            'right': false
        };

        // W3C��� eventObject�����toString������Ӧ����MouseEvent
        if ( eventObject.toString && eventObject.toString().indexOf('MouseEvent') != -1 ) {
            switch (eventObject.button) {
                case 0: buttons.left = true; break;
                case 1: buttons.middle = true; break;
                case 2: buttons.right = true; break;
                default: break;
            }

        } else if (eventObject.button) {
            // MSIE����
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
     * ��ȡ���������ĵ���λ��
     * eventObject -- �¼�����
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
     * ��ȡ��������
     * eventObject -- �¼�����
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


