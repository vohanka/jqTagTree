<?php
//
// +----------------------------------------------------------+
// | Author  : Libor Vohanka                                  |
// | Project : Manipulation with tree of tags using jQuery    |
// | Year    : 2013	                                          |
// | File    : /config/constants.php                |
// +----------------------------------------------------------+
//

//-------------------
// Database settings
//-------------------
//
// login informations
define ("JQTT_HOST", "localhost");
define ("JQTT_USER", "root"); 
define ("JQTT_PASS", "default");
define ("JQTT_DB", "test_call_for_papers");

// table names
define("JQTT_TAG_TABLE", "cfp_automatic_tags");
define("JQTT_CONNECTIONS_TABLE", "cfp_automatic_tags_triples");
define("JQTT_PREDICATE_TABLE", "cfp_predicates");

//column names in tag table
define("JQTT_TAG_TABLE_ID", "id");
define("JQTT_TAG_TABLE_NAME", "name");
define("JQTT_TAG_TABLE_URI", "uri");

// column names in connections table
define("JQTT_CONNECTIONS_TABLE_ID", "id");
define("JQTT_CONNECTIONS_TABLE_PARENT", "object_id");
define("JQTT_CONNECTIONS_TABLE_CHILD", "subject_id");
define("JQTT_CONNECTIONS_TABLE_PREDICATE", "predicate_id");

// column names in predicates table
define("JQTT_PREDICATE_TABLE_NAME", "name");
define("JQTT_PREDICATE_TABLE_URI", "uri");
define("JQTT_PREDICATE_TABLE_ID", "id");

// Which predicate id should be default (in adding tag called as "child")
define("JQTT_DEFAULT_PREDICATE_ID", 2);
?>
