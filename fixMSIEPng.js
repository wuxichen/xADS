/**
 * Created by lenovo on 2015/6/9.
 * 修复IE6中png图片背景非透明问题插件
 */

(function() {

    /**
     * 修复IE6中png图片背景非透明
     * */
    function fixMSIEPng() {
        if (!document.body.filters) {
            // 不是IE浏览器
            return;
        }

        if (7 <= parseFloat(navigator.appVersion.split("MSIE")[1])) {
            // 7.0以上支持PNG
            return;
        }

        // 修复嵌入图像
        if (document.images) {
            var images = document.images;
            var img = null;

            for (var i = images.length-1; img = images[i]; i--) {

                // 检查是不是PNG图像
                if (img.src
                    && img.src.substring( img.src.length-3, img.src.length ).toLowerCase() !== 'png'
                ) {
                    continue;
                }

                // 为外部元素构建style属性
                var inlineStyle = '';
                if (img.align == 'left' || img.align =='right') {
                    inlineStyle += 'float:' + img.align + ';';
                }
                if (img.parentElement.nodeName == 'A') {
                    // 若是链接a中显示手形光标
                    inlineStyle += 'cursor: hand;';
                }

                // 设置display为inline-block
                inlineStyle += 'display: inline-block;';

                // 取得应用到这个元素的其他样式
                if (img.style && img.style.cssText) {
                    inlineStyle += img.style.cssText;
                }

                // 通过带有适当样式和信息（如className和ID）的<span>标签包围这幅图像
                img.outerHTML = '<span '
                    + (img.id ? ' id = "' + img.id + '"' : '')
                    + (img.className ? ' class = "' + img.className + '"' : '')
                    + ' style="width:' + img.widths + 'px; height:' + img.height + 'px;'
                    + inlineStyle
                    + ' filter: progid:DXImageTransform.Microsoft.AlphaImageLoader(src=\''
                    + img.src
                    + '\', sizingMethod=\'scale\');"></span>';

            }
        }

        // -----------------------------------------------------------
        // 处理每个样式表中元素的背景是png的情况

        /**
         * 为元素设置适当的样式（私有方法）
         * */
        function addFilters(e) {
            // 检查元素是否有style.background，并确保还没应用滤镜
            if (
                e.style
                && e.style.background
                && !e.style.filter
            ) {
                // 检查是否为PNG
                var src = null;
                if (src = e.style.backgroundImage.match(/^url\((.*\.png)\)$/i)) {
                    e.style.backgroundColor = 'transparent';
                    e.style.backgroundImage = 'url()';
                    e.style.filter = 'progid:DXImageTransform.Microsoft.'
                        + 'AlphaImageLoader(src="'
                        + src[1]
                        + '", sizingMethod="'
                        + (( e.style.width && e.style.height ) ? 'scale' : 'crop' )
                        + '"';
                }
            }
        }

        /**
         * 将addFilters()应用到样式表中（私有方法）
         * */
        function processRules(styleSheet) {
            for (var i in styleSheet.rules) {
                addFilters( styleSheet.rules[i] );
            }

            // 递归由@import规则引入的stylesheets
            if (styleSheet.imports) {
                for (var j in styleSheet.imports) {
                    processRules(styleSheet.imports[j]);
                }
            }
        }


        // 处理每个样式表
        var styleSheets = document.styleSheets;
        for (var i = 0; i < styleSheets.length; i++) {
            processRules(styleSheets[i]);
        }

        // 修复嵌入的样式属性
        if (document.all) {
            var all = document.all;
            for (var i = 0; i < all.length; i++) {
                addFilters( all[i] );
            }
        }

    }


    // 修复PNG 加入到load事件中
    if (window.attachEvent) {
        window.attachEvent('onload', fixMSIEPng);
    }

})();
