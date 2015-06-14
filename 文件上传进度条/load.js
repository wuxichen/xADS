xADS.addEvent(window,'load',function(W3CEvent) {
    
    // 按照需要修改uploadForm
    addProgressBar('uploadForm',function(response) {
        var fileList = xADS.$('fileList');
        var files = response.filesProcessed;
        for(var i in files) {

            // 跳过空文件
            if(files[i] == null) continue;
            
            // 创建文件列表
            var li = document.createElement('li');
            var a = document.createElement('a');
            a.setAttribute('href','uploads/' + files[i]);
            a.appendChild(document.createTextNode(files[i]));
            li.appendChild(a);
            fileList.appendChild(li);
        }

        // 更新文件计数器
        var countContainer = xADS.$('fileCount');
        xADS.removeChildren(countContainer);
        var numFiles = fileList.getElementsByTagName('LI').length;
        countContainer.appendChild(document.createTextNode(numFiles));
    });
    
});
