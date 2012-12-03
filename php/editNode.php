<?php

include 'db.php';
include '../config/constants.php';

$connectDb = Db::getInstance();

$data = $_GET['data'];

$result = "false";

if (($data[1] != $data[2]) && ($data[3] != $data[4])) {
	$result = $connectDb->query("UPDATE " . JQTT_TAG_TABLE . " SET " . JQTT_TAG_TABLE_NAME . " = '" . $data[2] . "', " . JQTT_TAG_TABLE_URI . " = '" . $data[4] . "' WHERE " . JQTT_TAG_TABLE_ID . "= '" . $data[0] . "'");
} else if (($data[1] != $data[2])) {
	$result = $connectDb->query("UPDATE " . JQTT_TAG_TABLE . " SET " . JQTT_TAG_TABLE_NAME . " = '" . $data[2] . "' WHERE " . JQTT_TAG_TABLE_ID . "= '" . $data[0] . "'");
} elseif (($data[3] != $data[4])) {
	$result = $connectDb->query("UPDATE " . JQTT_TAG_TABLE . " SET " . JQTT_TAG_TABLE_URI . " = '" . $data[4] . "' WHERE " . JQTT_TAG_TABLE_ID . " = '" . $data[0] . "'");
}
echo json_encode($result);