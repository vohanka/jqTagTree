<!DOCTYPE HTML>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title>jQuery tree plugin</title>
	  	<link href="/libs/bootstrap/css/bootstrap-responsive.min.css" rel="stylesheet" />
	  	<link href="/libs/bootstrap/css/bootstrap.min.css" rel="stylesheet" />
	  	<link href="/assets/css/style.css" rel="stylesheet" />
</head>
<body>
	<div class="container">
	<h1></h1>

	<h2 class="welcome">jQuery plug-in - Manipulation with tree of tags!</h2>

	<ul id="jqTree">
		
		<li style="display: none" class="tagNameTemplate liId">
			<div>
				<a href="#" class="showUls name" ></a>
				<span class='contextMenu'>
					<span class="contextHeight2">
						<a href="#" class="show" target="blank">Zobrazit</a>
						<a href="#" class="add">Přidat</a><br>
						<a href="#" class="edit">Upravit</a><br>
						<a href="#" class="cut">Vyjmout</a><br>
						<a href="#" class="delete">Smazat</a>
					</span>
				</span>
			</div>
		</li>																		
	</ul>
	
	<script src="/libs/jquery/jquery-1.8.2.min.js"></script>
	<script src="/assets/js/jquery.jqTree.js"></script>
	<script src="/libs/jquery/jquery-ui.min.js"></script>
	<script>
		$(document).ready(function(){
			$('#jqTree').jqTree({  ajaxPhpPath : '/php/loadFromDb.php', iconOpen : 'icon-envelope',iconClose : 'icon-glass'});
		});
	</script>
	
	</div>
</body>
</html>