<!DOCTYPE HTML>
<html>
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
		<title>jQuery tag tree plugin</title>
		<link href="/libs/bootstrap/css/bootstrap-responsive.min.css" rel="stylesheet" />
		<link href="/libs/bootstrap/css/bootstrap.min.css" rel="stylesheet" />
		<link href="/assets/css/style.css" rel="stylesheet" />
	</head>
	<body>
		<div class="container">
			<h1></h1>

			<h2 class="welcome">jQuery plugin - Manipulation with tree of tags!</h2>


			<ul id="jqTagTree">
				<li style="display: none" class="tagNameTemplate liId">
					<div style="position: relative">
						<a href="#" class="showUls name" ></a>
					</div>
				</li>																		
			</ul>

			<script src="/libs/jquery/jquery-1.8.2.min.js"></script>

			<script src="/assets/js/jquery.jqTree.js"></script>
			<script src="/libs/jquery/jquery-ui.min.js"></script>
			<script>
				$(document).ready(function(){
					$('#jqTagTree').jqTagTree({ajaxPhpPath : '/php/loadFromDb.php'});
				});
			</script>
			<script> 
				$(); 
			</script>

		</div>
	</body>
</html>