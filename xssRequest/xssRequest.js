xADS.addEvent(window,'load',function() {
	// This url can go to any website as long 
	// as the response is in the correct format
	xADS.xssRequest('http://advanceddomscripting.com/source/chapter7/xssRequest/responder.php',{
		completeListener:function() {
			console.log(this.responseJSON.message);
		},
		errorListener:function() {
			console.log(this.statusText);
		},
		//timeout after 10 seconds
		timeout:10000
	});
	
	//This one will most likely error as the timeout is 1 millisecod
	xADS.xssRequest('http://home.ustc.edu.cn/~wxc422/responder.php',{
		completeListener:function() {
			console.log(this.responseJSON.message);
		},
		errorListener:function() {
			console.log(this.statusText);
		},
		//timeout after 1 millisecond
		timeout:10000
	});

	xADS.xssRequest('responder.php',{
		completeListener:function() {
			console.log(this.responseJSON.message);
			this.responseJSON.func();
		},
		errorListener:function() {
			console.log(this.statusText);
		},
		//timeout after 1 millisecond
		timeout:10000
	});
});


