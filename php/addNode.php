<?php
include 'jqTagTree.db.class.php';
include '../config/constants.php';

$connectDb = Db::getInstance();

$data = $_GET['data'];
//								name , uri
$result = $connectDb->addTag($data[1], $data[2]);
$return['id'] = mysql_insert_id();

if ($result){//								id  ,id of added tag
	$result = $connectDb->addTagConnect($data[0], $return['id'], JQTT_CONNECTIONS_TABLE_DEFAULT_PREDICATE);
}else{
	echo "Unable to write to database";
}

echo json_encode($return);