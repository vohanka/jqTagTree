<?php
//
// +----------------------------------------------------------+
// | Author  : Libor Vohanka                                  |
// | Project : Manipulation with tree of tags using jQuery    |
// | Year    : 2013	                                          |
// | File    : /php/delNode.php                               |
// +----------------------------------------------------------+
// 
// Deleting of tag and it's children in modal using AJAX .
//

include 'jqTagTree.db.class.php';
include '../config/constants.php';

$connectDb = Db::getInstance();

/*
 * Finds place to insert in array with help of bysection algorithm.
 * 
 * @param $array - sorted array of ids
 * @param $input - input to add to sorted array
 */
function sortAndAdd($array, $input) {
	$lower = 0;
	$upper = count($array);
	while (($upper - $lower) > 1) {
		$border = round(($lower + $upper) / 2);

		if ($array[$border] == $input) {
			return NULL;
		} elseif ($array[$border] > $input) {
			$upper = $border ;
		} else {
			$lower = $border ;
		}
	}
	
	$temp1 = $input;
	//add at the end of array
	if ($upper == count($array)) {
		$array[$upper] = $temp1;
		return $array;
	}
	$count = 0;
	$len = count($array) + 1;
	//add to found place and shift the rest 
	for ($i = $upper; $i < $len; $i++) {
		if(count($array) > $i)
			$temp2 = $array[$i];
		$array[$i] = $temp1;
		$temp1 = $temp2;
		$count++;
	}
	return $array;
}

$id = $_GET['data'] + 0;

$tagsPointer = 0;
$connPointer = 0;

$deleteTags[$tagsPointer++] = $id;

//find id of parent element
$result = $connectDb->delTag_findParentConnection($id);
if($result[JQTT_CONNECTIONS_TABLE_ID] != ""){
	$deleteConn[$connPointer++] = $result[JQTT_CONNECTIONS_TABLE_ID];
}

//walk through all childs
$walker = 0;
while (TRUE) {
	if (count($deleteTags) > $walker) {
		$result = $connectDb->delTag_findChildrenConnection($deleteTags[$walker]);
		$walker++;
		if (!$result) {
			//no child
			continue;
		}
	} else {
		break;
	}
	foreach ($result as $line) {
		$arr = sortAndAdd($deleteTags, $line[JQTT_CONNECTIONS_TABLE_CHILD]);
		if ($arr != NULL)
			$deleteTags = $arr;
			//suppress notice $deleteConn doesnt exist
			@$arr = sortAndAdd($deleteConn, $line[JQTT_CONNECTIONS_TABLE_ID]);
		if ($arr != NULL)
			$deleteConn = $arr;
	}
}

$return = $connectDb->delTag($deleteTags, $deleteConn);