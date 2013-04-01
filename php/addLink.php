<?php
//
// +----------------------------------------------------------+
// | Author  : Libor Vohanka                                  |
// | Project : Manipulation with tree of tags using jQuery    |
// | Year    : 2013	                                          |
// | File    : /php/addLink.php                |
// +----------------------------------------------------------+
//
// This file prints options to selectbox in adding new tag. Options are loaded dynamicaly from database from table of predicates.
//

include 'jqTagTree.db.class.php';
include '../config/constants.php';

$connectDb = Db::getInstance();



$predicates = $connectDb->getPredicates();
$options = "";

for ($i = 0; $i < count($predicates); $i++) {
	//if default predicate id found than is shifted on top of options
    if($predicates[$i][JQTT_PREDICATE_TABLE_ID] == JQTT_DEFAULT_PREDICATE_ID){
		$temp = "<option>Child</option>";
		$temp .= "<option data-divider='true'></option>";
		$temp .= $options;
		$options = $temp;
	}else{
		$options .= "<option>". $predicates[$i][JQTT_PREDICATE_TABLE_NAME] ."</option>";
	}
}
echo $options;
?>