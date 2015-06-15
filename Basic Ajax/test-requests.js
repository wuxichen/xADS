xADS.addEvent(window, 'load', function() {

	var options = {
		loadListener:function() { 
			//console.log('loadListener'); 
		},
		loadedListener:function() {
			//console.log('loadedListener'); 
		},
		interactiveListener:function() { 
			//console.log('ineractiveListener'); 
		},
		jsResponseListener:function(response) { 
			console.log('jsResponseListener'); 
			console.log(typeof response);
			console.log(response); 
		},
		jsonResponseListener:function(response) { 
			console.log('jsonResponseListener'); 
			console.log(typeof response);
			console.log(response); 
		},
		xmlResponseListener:function(response) { 
			console.log('xmlResponseListener'); 
			console.log(typeof response);
			console.log(response); 
		},
		htmlResponseListener:function(response) { 
			console.log('htmlResponseListener'); 
			console.log(typeof response);
			console.log(response); 
		},
		completeListener:function() { 
			//console.log('completeListener'); 
		},
		errorListener:function(response) { 
			console.log('errorListener');
			console.log(typeof response);
			console.log(response); 
		}
	}
	
	xADS.ajaxRequest('server.php?type=html',options);
	xADS.ajaxRequest('server.php?type=xml',options);
	xADS.ajaxRequest('server.php?type=json',options);
	xADS.ajaxRequest('server.php?type=javascript',options);
	xADS.ajaxRequest('server.php?type=none',options);

});