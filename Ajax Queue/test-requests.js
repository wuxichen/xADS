xADS.addEvent(window, 'load', function() {

	var options = {
		completeListener:function() {
			console.log('Complete:' + this.responseText);
		},
		errorListener:function(response) {
			console.log('Error: ' + this.statusText);
		}
	}

	xADS.ajaxRequestQueue(
		'server.php?message=queue1%20Number%201',
		options,
		'queue1'
	);
	xADS.ajaxRequestQueue(
		'server.php?message=queue1%20Number%202',
		options,
		'queue1'
	);


	xADS.ajaxRequestQueue(
		'server.php?message=queue2%20Number%201',
		options,
		'queue2'
	);

	xADS.ajaxRequestQueue(
		'server.broken.php?message=queue1%20Number%203',
		options,
		'queue1'
	);
	xADS.ajaxRequestQueue(
		'server.php?message=queue1%20Number%204',
		options,
		'queue1'
	);

	xADS.ajaxRequestQueue(
		'server.php?message=queue1%20Number%205',
		options,
		'queue1'
	);


	xADS.ajaxRequestQueue(
		'server.php?message=queue2%20Number%202',
		options,
		'queue2'
	);
	xADS.ajaxRequestQueue(
		'server.php?message=queue2%20Number%203',
		options,
		'queue2'
	);
	xADS.ajaxRequestQueue(
		'server.php?message=queue2%20Number%204',
		options,
		'queue2'
	);


});