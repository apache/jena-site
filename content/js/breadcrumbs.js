$(document).ready(function() {

	var url = $(location).attr('href');
	
	//Get the name of the domain dynamically
	var prefix = 'http://' + location.host + '/';

	if(url != prefix && url != prefix + 'index.html'){

		var shortForm = url.replace(prefix, '').replace(/(index)?\.html/g, '').replace(/#.*/g, '');
	
		var crumbs = shortForm.split('/');

		if(crumbs[crumbs.length-1] == ""){
			crumbs.pop();
		}

		var link = prefix;
	
		var breadcrumbs = '<ol class="breadcrumb">';
	
		for (var index = 0; index < crumbs.length; ++index) {
			var crumb = crumbs[index];
			link += crumb + '/';

			//Check if it is the last element of the array
			if(crumbs.length - 1 == index){
				//If yes then declare as active
				breadcrumbs += '<li class="active">' + crumb.toUpperCase().replace(/_|-/g, ' ') + '</li>'; 
			}else{
				//if not then print a link for the category
				breadcrumbs += '<li><a href="' + link + '">' + crumb.toUpperCase().replace(/_|-/g, ' ') + '</a></li>'; 
			}
		}
		breadcrumbs += '</ol>';
		$('#breadcrumbs').append(breadcrumbs);
	}else{
		$('#breadcrumbs').hide();
	}
});

//update exporter to handle gh-pages
