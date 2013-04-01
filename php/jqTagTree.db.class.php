<?php

//
// +----------------------------------------------------------+
// | Author  : Libor Vohanka                                  |
// | Project : Manipulation with tree of tags using jQuery    |
// | Year    : 2013	                                          |
// | File    : /assets/js/jquery.jqTagTree.php                |
// +----------------------------------------------------------+
//
//  Class for handling with database.
//
class Db{
	
	private static $instance = NULL;
	private $connection = NULL;
	private $connected = false;

	/**
	 *  Establish of connection.
	 */
	private function __construct(){
		$this->connection = mysql_connect ( JQTT_HOST, JQTT_USER, JQTT_PASS );
		if($this->connection != NULL){
			$this->connected = true;
			$this->selectDb(JQTT_DB);
			$this->setCharset("utf8");
		}else {
			flash(false,"Nelze se připojit do databáze","error");
		}
	}
	/*
	 *  End of connection.
	 */
	public function __destruct(){
		if($this->connection!=NULL){
			mysql_close($this->connection);
		}
	}
	/*
	 *  Get connection.
	 */
	public function getConnected(){
		return $this->connected;
	}
	/*
	 *  Get instance of class.
	 */
	public static function getInstance(){
		if(Db::$instance==NULL){
			Db::$instance=new Db();
		}
		return Db::$instance;
	}
	/*
	 *  Selecting of database.
	 */
	public function selectDb($db){
		return mysql_select_db($db);
	}
	/*
	 *  Setting of charset.
	 */
	public function setCharset($charset){
		return mysql_set_charset($charset);
	}
	/*
	 *  Escaping of strings.
	 */
	private function escape($string){
		return mysql_real_escape_string($string);
	}
	/*
	 *  Db query.
	 */
	private function query($dotaz){
		return mysql_query($dotaz);
	}
	/*
	 *  Get number of rows.
	 */
	private function numRows($dotaz){
		return mysql_num_rows($dotaz);
	}
	/*
	 *  Get array of records.
	 */
	private function fetchArray($dotaz){
		return mysql_fetch_array($dotaz,MYSQL_ASSOC);
	}
	/*
	 *  Get number of returned rows.
	 */
	private function numberOfRows($dotaz){
		$vysledek = $this->query($dotaz);
		return $this->numRows($vysledek);
	}
	/*
	 *  Get single line.
	 */
	public function readLine($dotaz){
		$vysledek = $this->query($dotaz);
		return $this->fetchArray($vysledek);
	}
	/*
	 *  Get array of arrays 
	 */
	public function readFromDb($dotaz){
		$vsechnyRadek = NULL;
		$vysledek = $this->query($dotaz);
		$pocetRadek = $this->numRows($vysledek);
		for($i=0;$i<$pocetRadek;$i++){
			$vsechnyRadek[$i] = $this->fetchArray($vysledek);
		}
		return $vsechnyRadek;
	}
	/*
	 *  Query for loading first level of tag tree.
	 */
	public function loadFirstLevelFromDb(){
		$record = $this->readFromDb('SELECT a.'. JQTT_TAG_TABLE_ID.', a.'. JQTT_TAG_TABLE_NAME .', a.'. JQTT_TAG_TABLE_URI .', count(c.'. JQTT_TAG_TABLE_ID.') AS children 
			FROM '. JQTT_TAG_TABLE .' a 
			LEFT JOIN ' . JQTT_CONNECTIONS_TABLE . ' c ON a.'. JQTT_TAG_TABLE_ID.'=c.'. JQTT_CONNECTIONS_TABLE_PARENT.' WHERE a.'. JQTT_TAG_TABLE_ID .' NOT IN (SELECT 	b.'. JQTT_CONNECTIONS_TABLE_CHILD .'
			FROM '. JQTT_CONNECTIONS_TABLE .' b) GROUP BY a.'. JQTT_TAG_TABLE_ID .' order by a.'.JQTT_TAG_TABLE_NAME);
		
		return $record;
	}

	/*
	 *  Query for loading other levels of tag tree.
	 */
	public function loadNextLevelFromDb($id){
		$id = $this->escape($id);
		$record = $this->readFromDb('SELECT a.'. JQTT_TAG_TABLE_ID.', a.'. JQTT_TAG_TABLE_NAME .', a.'. JQTT_TAG_TABLE_URI .', count(c.'. JQTT_TAG_TABLE_ID.') AS children
		FROM '. JQTT_TAG_TABLE .' a 
		LEFT JOIN ' . JQTT_CONNECTIONS_TABLE . ' c ON a.'. JQTT_TAG_TABLE_ID.'=c.'. JQTT_CONNECTIONS_TABLE_PARENT.'	WHERE a.'. JQTT_TAG_TABLE_ID .' IN (SELECT b.'. JQTT_CONNECTIONS_TABLE_CHILD .' 
		FROM '. JQTT_CONNECTIONS_TABLE .' b WHERE b.'.JQTT_CONNECTIONS_TABLE_PARENT.'='.$id.') GROUP BY a.'.JQTT_TAG_TABLE_NAME);
		
		return $record;
	}
	
	/*
	 *  Query for updating tag tree.
	 */
	public function editTag($id, $newName, $newUri){
		$escId = $this->escape($id);
		$escName = $this->escape($newName);
		$escUri = $this->escape($newUri);
		return $this->query("UPDATE " . JQTT_TAG_TABLE . " SET " . JQTT_TAG_TABLE_NAME . " = '" . $escName . "', " . JQTT_TAG_TABLE_URI . " = '" . $escUri . "' WHERE " . JQTT_TAG_TABLE_ID . "= '" . $escId . "'");
	}
	
	/*
	 *  Query for adding tags to tag tree.
	 */
	public function addTag($name, $uri){
		$escName = $this->escape($name);
		$escUri = $this->escape($uri);
		return $this->query("INSERT INTO " . JQTT_TAG_TABLE . " ( " . JQTT_TAG_TABLE_NAME . ", ". JQTT_TAG_TABLE_URI .") VALUES ('" . $escName . "','" . $uri . "') ");
	}
	
	/*
	 *  Query for adding connection between parrent and added child.
	 */
	public function addTagConnect($parent, $child, $predicate){
		$escParent = $this->escape($parent);
		$escChild = $this->escape($child);
		return $this->query("INSERT INTO " . JQTT_CONNECTIONS_TABLE . " ( " . JQTT_CONNECTIONS_TABLE_PARENT . ", ". JQTT_CONNECTIONS_TABLE_CHILD .", ". JQTT_CONNECTIONS_TABLE_PREDICATE .") 
																	VALUES ('" . $escParent . "','" . $escChild . "','".$predicate."') ");
	}
	
	/*
	 *  Queries which deletes tags and connectins between them.
	 * 
	 * @param $deleteTag - array of tags to be deleted
	 * @param $deleteConn - array of connections to be deleted
	 */
	public function delTag($deleteTag, $deleteConn){
		$this->query("DELETE FROM " . JQTT_TAG_TABLE . " WHERE ".JQTT_TAG_TABLE_ID ." IN (".implode(', ', $deleteTag).")");
		$this->query("DELETE FROM " . JQTT_CONNECTIONS_TABLE . " WHERE ".JQTT_CONNECTIONS_TABLE_ID ." IN (".implode(', ', $deleteConn).")");
	}
	/*
	 * Query for finding parents connections with specific child id. Used in delNode for find all tags and connections to be deleted.
	 * 
	 * @param $id - id of child connection 
	 */
	public function delTag_findParentConnection($id){
		return $this->readLine("SELECT " . JQTT_CONNECTIONS_TABLE_ID . " FROM " . JQTT_CONNECTIONS_TABLE . " WHERE " . JQTT_CONNECTIONS_TABLE_CHILD . " = " . $id);
	}
	
	/*
	 * Query for finding children connections with specific parent id. Used in delNode for find all tags and connections to be deleted.
	 * 
	 * @param $id - id of parent connection 
	 */
	public function delTag_findChildrenConnection($id){
		return $this->readFromDb("SELECT * FROM " . JQTT_CONNECTIONS_TABLE . " WHERE " . JQTT_CONNECTIONS_TABLE_PARENT . " = " . $id);
	}
	
	/*
	 * Query for getting predicates to be shown in add modal as listbox.
	 */
	public function getPredicates(){
		return $this->readFromDb("SELECT * FROM ". JQTT_PREDICATE_TABLE);
	}
	
	/*
	 * Query for getting id of predicate for passed name.
	 * 
	 * @param $name - name of predicate 
	 */
	public function getPredicateId($name){
		$name = $this->escape($name);
		return $this->readLine("SELECT ".JQTT_PREDICATE_TABLE_ID." FROM ". JQTT_PREDICATE_TABLE . " WHERE " . JQTT_PREDICATE_TABLE_NAME . " = '" . $name ."'");
	}
	
	/*
	 * Query for finding connections of children. Used in loadFromDb.
	 * 
	 * @param $ids - ids of chldren
	 */
	public function getChildrenConnections($ids){
		return $this->readFromDb("SELECT * FROM ". JQTT_CONNECTIONS_TABLE ." WHERE ". JQTT_CONNECTIONS_TABLE_CHILD." IN (".implode(', ', $ids).")");
	}
	
	/*
	 * Query for finding connections of parents. Used in loadFromDb.
	 * 
	 * @param $ids - ids of parents
	 */
	public function getParentsConnections($ids){
		return $this->readFromDb("SELECT * FROM ". JQTT_CONNECTIONS_TABLE ." WHERE ". JQTT_CONNECTIONS_TABLE_PARENT." IN (".implode(', ', $ids).")");
	}
	
	/*
	 * This query connects every three tables to get name of predicate tag, name of predicate and uri of predicate tag related to parent tag id
	 * 
	 * @param $id - id of parent tag
	 */
	public function getPredicatesAndNameOfId($id){
		return $this->readFromDb("
				SELECT  c.".JQTT_TAG_TABLE_ID.", c.".JQTT_TAG_TABLE_NAME." AS name, b.".JQTT_PREDICATE_TABLE_NAME." AS struct, c.".JQTT_TAG_TABLE_URI." AS uri FROM (
					SELECT aa.".JQTT_CONNECTIONS_TABLE_ID." , aa.".JQTT_CONNECTIONS_TABLE_CHILD." , aa.". JQTT_CONNECTIONS_TABLE_PREDICATE." FROM ". JQTT_CONNECTIONS_TABLE." aa WHERE
							aa.".JQTT_CONNECTIONS_TABLE_PARENT." = '".$id."' AND aa.predicate_id != '".JQTT_DEFAULT_PREDICATE_ID."') a 
								LEFT JOIN ".JQTT_PREDICATE_TABLE." b ON a.".JQTT_CONNECTIONS_TABLE_PREDICATE." = b.".JQTT_PREDICATE_TABLE_ID." 
									LEFT JOIN ".JQTT_TAG_TABLE." c ON a.".JQTT_CONNECTIONS_TABLE_CHILD." = c.".JQTT_TAG_TABLE_ID
				);

	}
}

?>