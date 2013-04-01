<?php
//
// +----------------------------------------------------------+
// | Author  : Libor Vohanka                                  |
// | Project : Manipulation with tree of tags using jQuery    |
// | Year    : 2013	                                          |
// | File    : /php/loadFromDb.php                |
// +----------------------------------------------------------+
// 
// Loading tree from database.
//

include 'jqTagTree.db.class.php';
include '../config/constants.php';

$connectDb = Db::getInstance();

$id = $_GET['id']+0;

// whether will be loaded first or different level of tree
if($id==0){
	$roots = $connectDb->loadFirstLevelFromDb();
}else{
	$roots = $connectDb->loadNextLevelFromDb($id);
}

//save ids to extra array
for ($index = 0; $index < count($roots); $index++) {
	$ids[$index] = $roots[$index][JQTT_TAG_TABLE_ID];
}
//load records from connectons table where $ids fugures as children
$recordsChildren = $connectDb->getChildrenConnections($ids);
//load records from connectons table where $ids fugures as parents
$recordsParents = $connectDb->getParentsConnections($ids);

//
// if there is any predicate in children
//
if($recordsChildren){
	$indexer = 0;
	for ($index = 0; $index < count($recordsChildren); $index++) {
		if($recordsChildren[$index][JQTT_CONNECTIONS_TABLE_PREDICATE] != JQTT_DEFAULT_PREDICATE_ID){
			$predicates[$indexer] = $recordsChildren[$index][JQTT_CONNECTIONS_TABLE_CHILD];
			$indexer++;
		}
	}
	if(isset($predicates)){
		for ($i = 0; $i < count($roots); $i++) {
			for ($j = 0; $j < count($predicates); $j++) {

				if($roots[$i][JQTT_TAG_TABLE_ID] == $predicates[$j]){
					$roots[$i]['predicate'] = 1;	
				}
			}
		}
		for ($i = 0; $i < count($roots); $i++) {
			if (!isset($roots[$i]['predicate'])) {
				$roots[$i]['predicate'] = 0;	
			}
			
		}
	}
}
//
// if and how many do parents have predicates
//
if ($recordsParents) {
	$indexer = 0;
	//find all predicates and save it to array
	for ($i = 0; $i < count($recordsParents); $i++) {
		if($recordsParents[$i][JQTT_CONNECTIONS_TABLE_PREDICATE] != JQTT_DEFAULT_PREDICATE_ID){
			$numOfPredicates[$indexer]['id'] =  $recordsParents[$i][JQTT_CONNECTIONS_TABLE_PARENT];
			$indexer++;
		}
	}
	
	//if there is any predicate
	if(isset($numOfPredicates)){
		for ($i = 0; $i < count($roots); $i++) {
			$roots[$i]['numOfPredic'] = 0;
			for ($j = 0; $j < count($numOfPredicates); $j++) {
				if($roots[$i][JQTT_TAG_TABLE_ID] == $numOfPredicates[$j]['id'])
				$roots[$i]['numOfPredic']++;
			}
		}
	}else{	
		for ($i = 0; $i < count($roots); $i++)
			$roots[$i]['numOfPredic'] = 0;
	}
}
else{	
		for ($i = 0; $i < count($roots); $i++)
			$roots[$i]['numOfPredic'] = 0;
	}
echo json_encode( $roots );