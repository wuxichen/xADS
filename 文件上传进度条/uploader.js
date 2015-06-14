
/**
 * 验证文件类型 是否为<input accept=".."/>accept的类型或jpg
 * */
function verifyFileType( fileInput ) {
    if(!fileInput.value || !fileInput.accept) return true;
    var extension = fileInput.value.split('.').pop().toLowerCase();
    var mimetypes = fileInput.accept.toLowerCase().split(',');
    var type;
    for(var i in mimetypes) {
        type = mimetypes[i].split('/')[1];
        if(type == extension || (type=='jpeg' && extension=='jpg')) {
            return true;
        }
    }
    return false;
}

/**
 * 表单进度条
 * */
var addProgressBar = function( form, modificationHandler ) {

    // 获取表单元素
    if(!(form = xADS.$(form))) { return false; }

    // 1. 验证文件类型 ----------------------------------
    // 查找所有文件输入元素，存入fileInputs（后面的函数中可以通过作用域链引用）
    var allInputs = form.getElementsByTagName('INPUT');
    var input;
    var fileInputs = [];
    for(var i=0 ; (input = allInputs[i]) ; i++) {
        if(input.getAttribute('type') == 'file') {
            fileInputs.push(input);
        }
    }

    if(fileInputs.length == 0) { return false; }

    // 添加change事件以基于MIME类型验证扩展名
    for(var i=0 ; (fileInput = fileInputs[i]) ; i++) {
        // 使用change事件侦听器 进行文件类型的检查
        xADS.addEvent(fileInput, 'change', function(W3CEvent) {
            var ok = verifyFileType(this);
            if(!ok) {
                if(!xADS.hasClassName(this,'error')) {
                    xADS.addClassName(this,'error');
                }
                alert('Sorry, that file type is not allowed. Please select one of: ' + this.accept.toLowerCase());
            } else {
                xADS.removeClassName(this,'error');
            }
        });

    }


    // 2. 重定向表单 ------------------------------------------
    // 为上传而附加的iframe元素，
    // 但是IE中使用DOM操作无法设置name，如下：
    // var uploadTargetFrame = document.createElement('iframe');
    // uploadTargetFrame.setAttribute('id','uploadTargetFrame');
    // uploadTargetFrame.setAttribute('name','uploadTargetFrame');

    // 所以用innerHtml
    var uploadTargetFrame = document.createElement('div');
    uploadTargetFrame.innerHTML = '<iframe name="uploadTargetFrame" id="uploadTargetFrame"></iframe>';
    xADS.setStyleById(uploadTargetFrame,{
        'width':'0',
        'height':'0',
        'border':'0',
        'visibility':'hidden',
        'zIndex':'-1'
    });
    document.body.appendChild(uploadTargetFrame);

    // 修改表单target属性为新的iframe元素，避免页面重载
    form.setAttribute('target','uploadTargetFrame');


    // 3. 唯一性ID跟踪上传进度 ------------------------------------
    var uniqueID = 'A' + Math.floor(Math.random() * 10000000000000);

    // ID需要加入表单的输入文件字段之前
    var uniqueIDField = document.createElement('input');
    uniqueIDField.setAttribute('type','hidden');
    uniqueIDField.setAttribute('value',uniqueID);
    uniqueIDField.setAttribute('name','APC_UPLOAD_PROGRESS');
    form.insertBefore(uniqueIDField,form.firstChild);


	// 4. 创建进度条 -------------------------------------------
	var progressBar = document.createElement('span')
	progressBar.className = 'progressBar';
	xADS.setStyle(progressBar,{
		'display':'block'
	});
	
	var progressBackground = document.createElement('span')
	progressBackground.className = 'progressBackground';
	xADS.setStyle(progressBackground,{
		'display':'block',
		'height':'10px'
	});
	progressBackground.appendChild(progressBar);
	
	var progressContainer = xADS.getElementsByClassName(
		'progressContainer',
		'span'
	)[0];
	
	if(!progressContainer) {
		progressContainer = document.createElement('span')
		progressContainer.className = 'progressContainer';
		form.appendChild(progressContainer);
	}
	
	xADS.setStyle(progressContainer,{
		'display':'block'
	});
	
	progressContainer.appendChild(progressBackground);
	
	var progressMessage = document.createElement('p')
	progressMessage.className = 'progressMessage';
	progressContainer.appendChild(progressMessage);

    /**
     * 更新进度条的进度，以及提示信息
     * */
    function updateProgressBar(percent,message,satus) {
        progressMessage.innerHTML = message;
        xADS.removeClassName(progressMessage,'error');
        xADS.removeClassName(progressMessage,'complete');
        xADS.removeClassName(progressMessage,'waiting');
        xADS.removeClassName(progressMessage,'uploading');
        xADS.addClassName(progressMessage,satus);

        xADS.setStyle(progressBar,{
            'width':percent
        });
    }

    // 初始化进度条
    updateProgressBar('0%','Waiting for upload','waiting');

    // 5. 跟踪进度条 ---------------------------------------
    xADS.addEvent(form,'submit',function(W3CEvent){

        // 再次检查文件类型
        var ok = true;
        var hasFiles = false;
        for(var i=0 ; (fileInput = fileInputs[i]) ; i++) {
            if(fileInput.value.length>0) {
                hasFiles = true;
            }
            if(!verifyFileType(fileInput)) {
                // highlight the file input as an error
                if(!xADS.hasClassName(fileInput,'error')) {
                    xADS.addClassName(fileInput,'error');
                }
                ok = false;
            }
        }

        if(!ok || !hasFiles) {
            // If they don't alert the user to fix the problem
            xADS.preventDefault(W3CEvent);
            alert('Please select some valid files.');
            return false;
        }


        /**
         * 将表单元素的mousedown事件添加侦听器warning，提示禁用表单元素
         */
        function warning(W3CEvent) {
            xADS.preventDefault(W3CEvent);
            alert('There is an upload in progress. Please wait.');
        }
        for(var i=0 ; (input = allInputs[i]) ; i++) {
           // input.setAttribute('disabled','disabled');
           xADS.addEvent(input,'mousedown',warning);
        }

        /**
         * 上传完成后调用，清除警告侦听器，重新启用表单元素
         * */
        function clearWarnings() {
            // Remove the warning from the form elements
            for(var i=0 ; (input = allInputs[i]) ; i++) {
                xADS.removeEvent(input,'mousedown',warning);
            }

            // ID值换成新的
            uniqueID = Math.floor(Math.random() * 1000000000000000);
            uniqueIDField.setAttribute('value',uniqueID);
        }

        updateProgressBar('0%','Beginning','waiting');
        
        // 模拟脚本的计数器
        var counter = 0;

        /**
         * 触发一次新的进度请求
         * */
        var progressWatcher = function() {

            // 使用唯一ID来请求
            ADS.ajaxRequest(form.action 
                + (form.action.indexOf('?') == -1 ? '?' : '&') 
                + 'key=' + uniqueID + '&sim=' + (++counter) , {

                // json侦听器
                jsonResponseListener:function(response) {
                    // Check the response to see if there was an
                    // error in the server side script
                    
                    if(!response) {
                        // 无响应
                        updateProgressBar('0%','Invalid response from progress watcher','error');
                        clearWarnings();

                    } else if(response.error) {
                        // 服务器报告错误
                        updateProgressBar('0%',response.error,'error');
                        clearWarnings();

                    } else if(response.done == 1) {
                        // 上传完成
                        updateProgressBar('100%','Upload Complete','complete');
                        clearWarnings();

                        // 上传完成后的处理
                        if(modificationHandler.constructor == Function) {
                            modificationHandler(response);
                        }

                    } else {
                        // 更新进度条以返回结果
                        updateProgressBar(
                            Math.round(response.current/response.total*100)+'%',
                            response.current
                                + ' of '
                                + response.total
                                + '. '
                                + 'Uploading file: ' +
                                response.currentFileName,
                            'uploading'
                        );
                        
                        // 1秒后再次执行进度监视程序
                        setTimeout(progressWatcher,1000);

                    }
                    
                },
                errorListener:function() {
                    updateProgressBar('0%',this.status,'error');
                    clearWarnings();
                }
            });

        };
        
        // 开始监视
        setTimeout(progressWatcher,1000);
        
    }); // submit事件侦听器结束

}