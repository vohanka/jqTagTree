<?php
include 'db.php';
include '../config/constants.php';

$connectDb = Db::getInstance();

$id = $_GET['id'];
if($id==0){
	//$roots = $connectDb->readFromDb('SELECT a.id, a.name, a.uri FROM cfp_automatic_tags a WHERE a.id NOT IN (SELECT b.subject_id FROM cfp_automatic_tags_triples b)');
	$roots = $connectDb->readFromDb('SELECT a.id, a.name, a.uri, count(c.id) AS children FROM cfp_automatic_tags a LEFT JOIN cfp_automatic_tags_triples c ON a.id=c.object_id 
  									WHERE a.id NOT IN (SELECT b.subject_id FROM cfp_automatic_tags_triples b) GROUP BY a.id');
}else{
	//$roots = $connectDb->readFromDb('SELECT a.id, a.name, a.uri FROM cfp_automatic_tags a WHERE id IN( SELECT b.subject_id FROM cfp_automatic_tags_triples b WHERE b.object_id = ('.$id.'))');
	$roots = $connectDb->readFromDb('SELECT a.id, a.name, a.uri, count(c.id) AS children FROM cfp_automatic_tags a LEFT JOIN cfp_automatic_tags_triples c ON a.id=c.object_id 
  									WHERE a.id IN( SELECT b.subject_id FROM cfp_automatic_tags_triples b WHERE b.object_id='.$id.') GROUP BY a.id');
}

for ($i=0;$i<count($roots); $i++) {
	$numberOfChildren = $connectDb->numberOfRows('SELECT subject_id FROM cfp_automatic_tags_triples WHERE object_id = '.$roots[$i]['id']);
	$roots[$i]['child'] = $numberOfChildren;
	$numberOfChildren = 0;
}

echo json_encode( $roots );