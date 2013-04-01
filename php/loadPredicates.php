<?php
//
// +----------------------------------------------------------+
// | Author  : Libor Vohanka                                  |
// | Project : Manipulation with tree of tags using jQuery    |
// | Year    : 2013	                                          |
// | File    : /php/loadPredicates.php                        |
// +----------------------------------------------------------+
// 
// File for loading list of predicates by context menu through AJAX.
//

include 'jqTagTree.db.class.php';
include '../config/constants.php';


$connectDb = Db::getInstance();

$tagId = $_GET['id'] + 0;

$td = "<td>";
$tde = "</td>";
$predicates = $connectDb->getPredicatesAndNameOfId($tagId);
$result = "<table class=\"table table-striped table-bordered table-hover table-condensed\">
	<th>Action</th><th>Name</th><th>Predicate</th><th class=\"jqttUriWidth\">URI</th>";

//show delete button, name, predicate name, uri of predicate for each predicate 
foreach ($predicates as $predicate) {
	$result .= "<tr>".$td . "<button type='button' data-jqtt-delete-id='".$predicate[JQTT_TAG_TABLE_ID]."' class='btn btn-danger btn-mini jqttButtonDel'>Delete</button>".$tde.
			$td . $predicate['name']. $tde . $td . $predicate['struct']. $tde . $td . $predicate['uri'] . $tde
	."</tr>";
}	
$result .= "</table>";
echo json_encode($result);

?>
