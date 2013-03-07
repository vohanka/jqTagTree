<?php

include 'jqTagTree.db.class.php';
include '../config/constants.php';

$connectDb = Db::getInstance();

$data = $_GET['data'];

$result = "false";

if (($data[1] != $data[2]) || ($data[3] != $data[4])) {
	$result = $connectDb->editNode($data[0], $data[2], $data[4]);
}

echo json_encode($result);