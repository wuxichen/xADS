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

    // === 基本Ajax操作 ================================================
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


    // === 跨域异步通信<script> ==================================
    /**
     * XssHttpRequest对象计数器
     */
    var XssHttpRequestCount=0;

    /**
     * 跨域XMLHttpRequest的<script\>实现，构造函数
     */
    var XssHttpRequest = function(){
        this.requestID = 'XSS_HTTP_REQUEST_' + (++XssHttpRequestCount);
    };

    /**
     * XssHttpRequest 公有方法
     */
    XssHttpRequest.prototype = {
        url:null,
        scriptObject:null,
        responseJSON:null,
        status:0,
        readyState:0,
        timeout:30000,
        onreadystatechange:function() { },

        setReadyState: function(newReadyState) {
            // 如果比当前状态更新 或就绪状态，则更新
            if(this.readyState < newReadyState || newReadyState==0) {
                this.readyState = newReadyState;
                this.onreadystatechange();
            }
        },

        open: function(url,timeout){
            this.timeout = timeout || 30000;
            // 将一个名为XSS_HTTP_REQUEST_CALLBACK的变量赋给URL，并包含 本次回调函数名称
            this.url = url
                + ((url.indexOf('?')!=-1) ? '&' : '?' )
                + 'XSS_HTTP_REQUEST_CALLBACK='
                + this.requestID
                + '_CALLBACK';
            this.setReadyState(0);
        },

        send: function(){
            var requestObject = this;

            // 创建一个载入外部数据的script对象
            this.scriptObject = document.createElement('script');
            this.scriptObject.setAttribute('id',this.requestID);
            this.scriptObject.setAttribute('type','text/javascript');

            // 创建一个在给定的毫秒数之后触发的setTimeout方法，
            // 如果在给定时间内脚本没有触发 则取消载入
            var timeoutWatcher = setTimeout(function() {

                // 回调函数为空，并移除脚本防止再次加载
                window[requestObject.requestID + '_CALLBACK'] = function() { };
                requestObject.scriptObject.parentNode.removeChild(
                    requestObject.scriptObject
                );

                // 状态设置为错误
                requestObject.status = 2;
                requestObject.statusText = 'Timeout after '
                    + requestObject.timeout
                    + ' milliseconds.'

                // 更新就绪状态
                requestObject.setReadyState(2);
                requestObject.setReadyState(3);
                requestObject.setReadyState(4);

            },this.timeout);


            // window对象中创建回调函数，
            // 在脚本载入时将执行这个方法，同时传入预期的JSON对象
            window[this.requestID + '_CALLBACK'] = function(JSON) {

                // 载入成功，清除timeoutWatcher
                clearTimeout(timeoutWatcher);

                // 更新就绪状态
                requestObject.setReadyState(2);
                requestObject.setReadyState(3);

                // 状态设置为成功获取信息
                requestObject.responseJSON = JSON;
                requestObject.status=1;
                requestObject.statusText = 'Loaded.'

                // 更新就绪状态
                requestObject.setReadyState(4);
            }

            // 设置初始就绪状态
            this.setReadyState(1);

            // 设置src属性，并加入文档头部，这样会载入脚本
            this.scriptObject.setAttribute('src',this.url);
            var head = document.getElementsByTagName('head')[0];
            head.appendChild(this.scriptObject);
        }
    };

    window['xADS']['XssHttpRequest'] = XssHttpRequest;


    /**
     * 设置XssRequestObject的不同部分
     * url -- 请求的URL，options -- 请求选项
     */
    function getXssRequestObject(url,options) {
        var req = new  XssHttpRequest();

        options = options || {};
        options.timeout = options.timeout || 30000;

        req.onreadystatechange = function() {
            switch (req.readyState) {
                case 1:
                    // Loading
                    if(options.loadListener) {
                        options.loadListener.apply(req,arguments);
                    }
                    break;
                case 2:
                    // Loaded
                    if(options.loadedListener) {
                        options.loadedListener.apply(req,arguments);
                    }
                    break;
                case 3:
                    // Interactive
                    if(options.interactiveListener) {
                        options.interactiveListener.apply(req,arguments);
                    }
                    break;
                case 4:
                    // Complete
                    if (req.status == 1) {
                        // The request was successful
                        if(options.completeListener) {
                            options.completeListener.apply(req,arguments);
                        }
                    } else {
                        // There was an error
                        if(options.errorListener) {
                            options.errorListener.apply(req,arguments);
                        }
                    }
                    break;
            }
        };
        req.open(url,options.timeout);

        return req;
    }

    window['xADS']['getXssRequestObject'] = getXssRequestObject;


    /**
     * 发送XssHttpRequest请求
     */
    function xssRequest(url,options) {
        var req = getXssRequestObject(url,options);
        return req.send(null);
    }
    window['xADS']['xssRequest'] = xssRequest;


    // === 后退按钮与标签问题解决 ==============================
    /**
     * 回调辅助函数
     */
    function makeCallback(method, target) {
        return function() { method.apply(target, arguments); }
    }

    /**
     * 基于hash触发注册的方法的URL hash侦听器
     */
    var actionPager =  {

        // 前一个hash
        lastHash : '',
        // 为hash模式注册的方法列表
        callbacks: [],
        // Safari历史记录列表
        safariHistory : false,
        // 为IE准备的iframe引用
        msieHistory: false,
        // 应该被转换的链接类名
        ajaxifyClassName: '',
        // 引用程序的根目录，当创建hash时，将是被清理后的URL
        ajaxifyRoot: '',

        init: function(ajaxifyClass, ajaxifyRoot, startingHash) {

            this.ajaxifyClassName = ajaxifyClass || 'xADSActionLink';
            this.ajaxifyRoot = ajaxifyRoot || '';

            if (/Safari/i.test(navigator.userAgent)) {
                this.safariHistory = [];

            } else if (/MSIE/i.test(navigator.userAgent)) {

                // 如果是MSIE，添加一个iframe以便跟踪重写后退按钮
                this.msieHistory = document.createElement("iframe");
                this.msieHistory.setAttribute("id", "msieHistory");
                this.msieHistory.setAttribute("name", "msieHistory");
                xADS.setStyleById(this.msieHistory, {
                    'width':'100px',
                    'height':'100px',
                    'border':'1px solid black',
                    'visibility':'visible',
                    'zIndex':'-1'
                });
                document.body.appendChild(this.msieHistory);
                this.msieHistory = frames['msieHistory'];
            }

            // 将链接转换为Ajax链接
            this.ajaxifyLinks();

            // 取得当前地址
            var location = this.getLocation();

            // 检测地址中是否包含hash（来自书签）
            // 或者是否已经提供了hash
            if(!location.hash && !startingHash) { startingHash = 'start'; }

            // 按照需要保存hash
            ajaxHash = this.getHashFromURL(location.hash) || startingHash;
            this.addBackButtonHash(ajaxHash);

            // 添加监视事件以观察地址栏中的变化
            var watcherCallback = makeCallback(this.watchLocationForChange, this);
            window.setInterval(watcherCallback, 200);
        },

        ajaxifyLinks: function() {

            // 将链接转换成锚，以便Ajax进行处理
            var links = xADS.getElementsByClassName(this.ajaxifyClassName, 'a', document);
            for(var i=0 ; i < links.length ; i++) {
                if(xADS.hasClassName(links[i], 'xADSActionPagerModified')) { continue; }

                // 将href属性转换成 #value 形式
                links[i].setAttribute(
                    'href',
                    this.convertURLToHash(links[i].getAttribute('href'))
                );
                xADS.addClassName(links[i], 'xADSActionPagerModified');

                // 注册单击事件以便在必要时添加历史记录
                xADS.addEvent(links[i], 'click', function() {
                    if (this.href && this.href.indexOf('#') > -1) {
                        actionPager.addBackButtonHash(
                            actionPager.getHashFromURL(this.href)
                        );
                    }
                });
            }
        },

        addBackButtonHash: function(ajaxHash) {
            // 保存hash
            if (!ajaxHash) return false;

            if (this.safariHistory !== false) {
                // 为Safari使用特殊数组（[1]为空？）
                if (this.safariHistory.length == 0) {
                    this.safariHistory[window.history.length] = ajaxHash;
                } else {
                    this.safariHistory[window.history.length+1] = ajaxHash;
                }
                return true;

            } else if (this.msieHistory !== false) {
                // 在MSIE中通过导航iframe
                this.msieHistory.document.execCommand('Stop');
                this.msieHistory.location.href = '/fakepage?hash='
                    + ajaxHash
                    + '&title=' + document.title;
                return true;

            } else {
                // 通过改变地址的值
                // 使用makeCallback保证函数，
                // 以便在超时方法内部使this应用actionPager
                var timeoutCallback = makeCallback(function() {
                    if (this.getHashFromURL(window.location.href) != ajaxHash) {
                        window.location.replace(location.href + '#' + ajaxHash);
                    }
                },this);
                setTimeout(timeoutCallback, 200);
                return true;
            }
            return false;
        },

        watchLocationForChange: function() {

            var newHash;
            // 取得新的hash值
            if (this.safariHistory !== false) {
                // Safari从history记录数组中取得
                if (this.safariHistory[history.length]) {
                    newHash = this.safariHistory[history.length];
                }
            } else if (this.msieHistory !== false) {
                // MSIE 从ifram的URL中取得
                newHash = this.msieHistory.location.href.split('&')[0].split('=')[1];
            } else if (location.hash != '') {
                // 对其他浏览器从window.location中取得
                newHash = this.getHashFromURL(window.location.href);
            }

            // 如果 新的hash 和 最后一次的hash不相同，则更新页面
            if (newHash && this.lastHash != newHash) {
                if (this.msieHistory !== false
                    && this.getHashFromURL(window.location.href) != newHash) {
                    // 修复MSIE中的地址栏以便能够适当地加上标签
                    location.hash = newHash;
                }

                // 在发送异常的情况下使用try
                // 尝试执行任何注册的侦听器
                try {
                    this.executeListeners(newHash);
                    // 在通过处理程序添加任何新连接的情况下进行更新
                    this.ajaxifyLinks();
                } catch(e) {
                    // 捕获到回调函数中的异常JS
                    alert(e);
                }

                // 将其保存为最后一个hash
                this.lastHash = newHash;
            }
        },

        register: function( regex, method, context ) {
            var obj = {'regex':regex};
            if(context) {
                // 已经指定的上下文环境
                obj.callback = function(matches) { method.apply(context,matches); };
            } else {
                // 用window作为上下文环境
                obj.callback = function(matches) { method.apply(window,matches); };
            }

            // 将侦听器添加到回调函数数组中
            this.callbacks.push(obj)
        },

        convertURLToHash: function(url) {
            if (!url) {
                // 没有URL则返回 #
                return '#';
            } else if(url.indexOf("#") != -1) {
                // 有hash则返回hash
                return url.split("#")[1];
            } else {
                // 如果URL中包含域名，则去掉
                if(url.indexOf("://") != -1) {
                    url = url.match(/:\/\/[^\/]+(.*)/)[1];
                }
                // 按照init()中的约定去掉根目录
                return '#' + url.substr(this.ajaxifyRoot.length)
            }
        },

        getHashFromURL: function(url) {
            if (!url || url.indexOf("#") == -1) { return ''; }
            return url.split("#")[1];
        },

        getLocation: function() {
            // 检查hash
            if(!window.location.hash) {
                // 没有则生成一个
                var url = {host:null,hash:null}
                if (window.location.href.indexOf("#") > -1) {
                    var parts = window.location.href.split("#")[1];
                    url.domain = parts[0];
                    url.hash = parts[1];
                } else {
                    url.domain = window.location;
                }
                return url;
            }
            return window.location;
        },

        executeListeners: function(hash){
            // 执行与hash匹配的侦听器
            for(var i in this.callbacks) {
                if((matches = hash.match(this.callbacks[i].regex))) {
                    this.callbacks[i].callback(matches);
                }
            }
        }
    };

    window['xADS']['actionPager'] = actionPager;

    /**
     * a helper method to clone a JavaScript object
     */
    function clone(myObj) {
        if(typeof(myObj) != 'object') return myObj;
        if(myObj == null) return myObj;
        var myNewObj = new Object();
        for(var i in myObj) {
            myNewObj[i] = clone(myObj[i]);
        }
        return myNewObj;
    }




})();