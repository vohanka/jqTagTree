<?php
include 'jqTagTree.db.class.php';
include '../config/constants.php';

$connectDb = Db::getInstance();

// Next if desides whether will be loaded first level of tree or another
$id = $_GET['id']+0;
if($id==0){
	$roots = $connectDb->loadFirstLevelFromDb();
}else{
	$roots = $connectDb->loadNextLevelFromDb($id);
}
echo json_encode( $roots );