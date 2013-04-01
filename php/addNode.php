<?php
//
// +----------------------------------------------------------+
// | Author  : Libor Vohanka                                  |
// | Project : Manipulation with tree of tags using jQuery    |
// | Year    : 2013	                                          |
// | File    : /php/addNode.php                |
// +----------------------------------------------------------+
//
// Adding tags into database.
//
include 'jqTagTree.db.class.php';
include '../config/constants.php';

$connectDb = Db::getInstance();

$data = $_GET['data'];					

//name of predicate
if($data[3] == 'Child'){
	$predicate = JQTT_DEFAULT_PREDICATE_ID;
}else{
	$temp = $connectDb->getPredicateId($data[3]);
	if($temp)
		$predicate = $temp[JQTT_PREDICATE_TABLE_ID];
}

//add tag to tag table
//								name , uri
$result = $connectDb->addTag($data[1], $data[2]);
$return = mysql_insert_id();

if ($result && $predicate){//				id  ,id of added tag, id of predicate
	//add connection of tag to parent to table of connections
	$result = $connectDb->addTagConnect($data[0], $return, $predicate);
	$final['id'] = $return;
	if($predicate != JQTT_DEFAULT_PREDICATE_ID){
		$final['pred'] = $data[3];
	}
	
	echo json_encode($final);
	
}else{
	echo "Unable to write to database";
}
