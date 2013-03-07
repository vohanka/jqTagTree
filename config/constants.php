<?php


define ("JQTT_HOST", "localhost");
define ("JQTT_USER", "root"); 
define ("JQTT_PASS", "default");
define ("JQTT_DB", "test_call_for_papers");


define("JQTT_TAG_TABLE", "cfp_automatic_tags");
define("JQTT_CONNECTIONS_TABLE", "cfp_automatic_tags_triples");

define("JQTT_TAG_TABLE_ID", "id");
define("JQTT_TAG_TABLE_NAME", "name");
define("JQTT_TAG_TABLE_URI", "uri");

define("JQTT_CONNECTIONS_TABLE_ID", "id");
define("JQTT_CONNECTIONS_TABLE_PARENT", "object_id");
define("JQTT_CONNECTIONS_TABLE_CHILD", "subject_id");
define("JQTT_CONNECTIONS_TABLE_PREDICATE", "predicate_id");

define("JQTT_CONNECTIONS_TABLE_DEFAULT_PREDICATE", 2);

?>
