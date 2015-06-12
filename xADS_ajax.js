/**
 * Created by lenovo on 2015/6/12.
 *
 * JavaScript 扩展基础DOM操作库
 * Ajax异步通信部分
 */


(function() {

    if (!window['xADS']) {
        window['xADS'] = {};    // namespace -- xADS
    }

    /**
     * 解析JSON文本，生成一个对象或数组
     * s -- JSON文本，filter -- 过滤函数filter(key, value)
     * */
    function parseJSON( s, filter) {
        var j;

        function walk( k, v ) {
            var i;
            if (v && typeof v === 'object' ) {
                for (i in v) {
                    if (v.hasOwnProperty(i)) {
                        v[i] = walk(i, v[i]);
                    }
                }
            }
            return filter(k, v);
        }

        // 第一阶段：通过正则表达式检测JSON文本，查找非JSON字符
        // 尤其是"()", "new", "="
        if (/^("(\\.|[^"\\\n\r])*?"|[,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t])+?$/.
                test(s)) {

            // 第二阶段：使用eval函数将JSON文本编译成JavaScript结构
            // 用()括起来是为了消除{}的二义性，表示 对象字面量 而非 语句块
            try {
                j = eval( '(' + s + ')' );
            } catch (e) {
                throw new SyntaxError('parseJSON');
            }
        } else {
            throw new SyntaxError('parseJSON');
        }

        // 第三阶段（可选）代码递归地遍历了新生成的结构，
        // 将每个名/值对传递给一个过滤函数，以便进行可能的转换
        if (typeof filter === 'function') {
            j = walk('', j);
        }
        return j;
    }

    /**
     * 设置XMLHttpRequest对象的各个不同部分
     * @param url -- 请求的URL，
     * @param options -- 请求的选项
     *          method 请求方法；
     *          send 待发送的字符串；
     *          loadListener LoadedListener interactiveListener 是readyState为123时调用的侦听器；
     *          请求成功后根据Content-Type区别调用侦听器：
     *              jsResponseListener jsonResponseListener xmlResponseListener htmlResponseListener；
     *          completeListener 响应侦听器调用之后被调用的侦听器；
     *          errorListener 响应状态值不是200也不是0时，调用的侦听器；
     *          【所有侦听器内部 this指向的是请求对象req】
     */
    function getRequestObject(url, options) {

        // 初始化请求对象
        var req = false;
        if (window.XMLHttpRequest) {
            var req = new window.XMLHttpRequest();
        } else if (window.ActiveXObject) {
            var req = new window.ActiveXObject('Microsoft.XMLHTTP');
        }

        if (!req) { return false; }

        // 定义默认的选项
        options = options || {};
        options.method = options.method || 'GET';
        options.send = options.send || null;

        // 为请求的每个阶段定义不同的侦听器
        req.onreadystatechange = function() {
            switch (req.readyState) {
                case 1:
                    // 载入中
                    if (options.loadListener) {
                        options.loadListener.apply(req, arguments);
                    }
                    break;

                case 2:
                    // 载入完成
                    if (options.loadedListener) {
                        options.loadedListener.apply(req, arguments);
                    }
                    break;

                case 3:
                    // 交互
                    if (options.interactiveListener) {
                        options.interactiveListener.apply(req, arguments);
                    }
                    break;

                case 4:
                    // 完成，若失败则抛出错误
                    try {
                        if (req.status && req.status == 200) {

                            // 提取Content-Type的所需部分
                            var contentType = req.getResponseHeader('Content-Type')
                            var mimeType = contentType.match(/\s*([^;]+)\s*(;|$)/i)[1];

                            switch (mimeType) {
                                case 'text/javascript':
                                case 'application/javascript':
                                    if(options.jsResponseListener) {
                                        options.jsResponseListener.call(req, req.responseText);
                                    }
                                    break;

                                case 'application/json':
                                    if(options.jsonResponseListener) {
                                        try {
                                            var json = parseJSON(req.responseText);
                                        } catch(e) {
                                            var json = false;
                                        }
                                        options.jsonResponseListener.call(req, json);
                                    }
                                    break;

                                case 'text/xml':
                                case 'application/xml':
                                case 'application/xhtml+xml':
                                    if(options.xmlResponseListener) {
                                        options.xmlResponseListener.call(req, req.responseXML);
                                    }
                                    break;

                                case 'text/html':
                                    if(options.htmlResponseListener) {
                                        options.htmlResponseListener.call(req, req.responseText);
                                    }
                                    break;
                            }

                            // 针对响应成功完成的侦听器
                            if (options.completeListener) {
                                options.completeListener.apply(req, arguments);
                            }

                        } else {
                            if (options.errorListener) {
                                options.errorListener.apply(req, arguments);
                            }
                        }
                    } catch (e) {
                        // 忽略错误
                    }
                    break;
            }
        };

        // 开启请求
        req.open(options.method, url, true);
        // 添加特殊头部信息以标识请求
        req.setRequestHeader('X-ADS-Ajax-Reques', 'AjaxRequest');
        return req;
    }

    window['xADS']['getRequestObject'] = getRequestObject;


    /**
     * 发送XMLHttpRequest对象的请求
     * url -- 请求的URL，options -- 请求选项
     * */
    function ajaxRequest(url, options) {
        var req = xADS.getRequestObject(url, options);
        return req.send(options.send);
    }

    window['xADS']['ajaxRequest'] = ajaxRequest;


})();