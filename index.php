<!--
 +----------------------------------------------------------+
 | Author  : Libor Vohanka                                  |
 | Project : Manipulation with tree of tags using jQuery    |
 | Year    : 2013                                           |
 | File    : index.php                                      |
 +----------------------------------------------------------+
-->
<!DOCTYPE HTML>
<html>
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
		<title>jQuery tag tree plugin</title>
		<!-- Styles which must be included -->
		<link href="libs/bootstrap/css/bootstrap.min.css" rel="stylesheet" />
		<link href="libs/selectBox/css/bootstrap-select.min.css" rel="stylesheet" />
		<link href="assets/css/style.css" rel="stylesheet" />
	</head>
	<body>
		<div class="container">
			<h2 class="welcome">jQuery plugin - Manipulation with tree of tags!!</h2>

			<!-- Ul tag which needs to be inserted. You sould keep name jqTagTree otherwise styles won't be correct -->
			<ul id="jqTagTree"></ul>

			<!-- Javascripts which must be included -->
			<script src="libs/jquery/jquery-1.8.2.min.js"></script>
			<script src="libs/jquery/jquery-ui.min.js"></script>
			<script src="assets/js/jquery.jqTagTree.js"></script>
			<script src="libs/bootstrap/js/bootstrap.min.js"></script>
			<script src="libs/selectBox/js/bootstrap-select.min.js"></script>

			<script>
				$(document).ready(function(){
					$('#jqTagTree').jqTagTree({iconOpen : 'icon-arrow-right', iconClose : 'icon-arrow-down'});
				});
			</script>
		</div>
	</body>
</html>