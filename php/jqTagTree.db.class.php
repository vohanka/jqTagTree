<?php
//Třída Zajišťující připojení k databázi a funkce pracující s ní.
class Db{
	
	private static $instance = NULL;
	private $connection = NULL;
	private $connected = false;

	//Vytvoření připojení.
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
	//Ukončení připojení
	public function __destruct(){
		if($this->connection!=NULL){
			mysql_close($this->connection);
		}
	}
	public function getConnected(){
		return $this->connected;
	}
	//Získání instance třídy.
	public static function getInstance(){
		if(Db::$instance==NULL){
			Db::$instance=new Db();
		}
		return Db::$instance;
	}
	//Výběr databáze.
	public function selectDb($db){
		return mysql_select_db($db);
	}
	//Nastavení znakové sady.
	public function setCharset($charset){
		return mysql_set_charset($charset);
	}
	private function escape($string){
		return mysql_real_escape_string($string);
	}
	//Dotaz do DB
	public function query($dotaz){
		return mysql_query($dotaz);
	}
	//Databázová funkce počet řádek
	private function numRows($dotaz){
		return mysql_num_rows($dotaz);
	}
	//Vrací řádek ze zadaného dotazu
	private function fetchArray($dotaz){
		return mysql_fetch_array($dotaz,MYSQL_ASSOC);
	}
	//Funkce vracející počet řádek ze zadaného dotazu
	private function numberOfRows($dotaz){
		$vysledek = $this->query($dotaz);
		return $this->numRows($vysledek);
	}
	//Funkce vracející jeden řádek ze zadaného dotazu
	public function readLine($dotaz){
		$vysledek = $this->query($dotaz);
		return $this->fetchArray($vysledek);
	}
	//Funkce vracející dvojrozměrné pole řádek v databázi ze zadaného dotazu
	public function readFromDb($dotaz){
		$vsechnyRadek = NULL;
		$vysledek = $this->query($dotaz);
		$pocetRadek = $this->numRows($vysledek);
		for($i=0;$i<$pocetRadek;$i++){
			$vsechnyRadek[$i] = $this->fetchArray($vysledek);
		}
		return $vsechnyRadek;
	}
	//loading first level of tree
	public function loadFirstLevelFromDb(){
		$record = $this->readFromDb('SELECT a.'. JQTT_TAG_TABLE_ID.', a.'. JQTT_TAG_TABLE_NAME .', a.'. JQTT_TAG_TABLE_URI .', count(c.'. JQTT_TAG_TABLE_ID.') AS children FROM '. JQTT_TAG_TABLE .' a 
		LEFT JOIN ' . JQTT_CONNECTIONS_TABLE . ' c ON a.'. JQTT_TAG_TABLE_ID.'=c.'. JQTT_CONNECTIONS_TABLE_PARENT.'	WHERE a.'. JQTT_TAG_TABLE_ID .' NOT IN (SELECT b.'. JQTT_CONNECTIONS_TABLE_CHILD .' 
		FROM '. JQTT_CONNECTIONS_TABLE .' b) GROUP BY a.'. JQTT_TAG_TABLE_ID .' order by a.'.JQTT_TAG_TABLE_NAME);
		
		return $record;
	}

	//loading sub tree of passed id
	public function loadNextLevelFromDb($id){
		$id = $this->escape($id);
		$record = $this->readFromDb('SELECT a.'. JQTT_TAG_TABLE_ID.', a.'. JQTT_TAG_TABLE_NAME .', a.'. JQTT_TAG_TABLE_URI .', count(c.'. JQTT_TAG_TABLE_ID.') AS children FROM '. JQTT_TAG_TABLE .' a 
		LEFT JOIN ' . JQTT_CONNECTIONS_TABLE . ' c ON a.'. JQTT_TAG_TABLE_ID.'=c.'. JQTT_CONNECTIONS_TABLE_PARENT.'	WHERE a.'. JQTT_TAG_TABLE_ID .' IN (SELECT b.'. JQTT_CONNECTIONS_TABLE_CHILD .' 
		FROM '. JQTT_CONNECTIONS_TABLE .' b WHERE b.'.JQTT_CONNECTIONS_TABLE_PARENT.'='.$id.') GROUP BY a.'.JQTT_TAG_TABLE_NAME);
		
		return $record;
	}
	
	public function editTag($id, $newName, $newUri){
		$escId = $this->escape($id);
		$escName = $this->escape($newName);
		$escUri = $this->escape($newUri);
		return $this->query("UPDATE " . JQTT_TAG_TABLE . " SET " . JQTT_TAG_TABLE_NAME . " = '" . $escName . "', " . JQTT_TAG_TABLE_URI . " = '" . $escUri . "' WHERE " . JQTT_TAG_TABLE_ID . "= '" . $escId . "'");
	}
	
	public function addTag($name, $uri){
		$escName = $this->escape($name);
		$escUri = $this->escape($uri);
		return $this->query("INSERT INTO " . JQTT_TAG_TABLE . " ( " . JQTT_TAG_TABLE_NAME . ", ". JQTT_TAG_TABLE_URI .") VALUES ('" . $escName . "','" . $uri . "') ");
	}
	
	public function addTagConnect($parent, $child, $predicate){
		$escParent = $this->escape($parent);
		$escChild = $this->escape($child);
		return $this->query("INSERT INTO " . JQTT_CONNECTIONS_TABLE . " ( " . JQTT_CONNECTIONS_TABLE_PARENT . ", ". JQTT_CONNECTIONS_TABLE_CHILD .", ". JQTT_CONNECTIONS_TABLE_PREDICATE .") 
																	VALUES ('" . $escParent . "','" . $escChild . "','".$predicate."') ");
	}
	
	public function delTag($deleteTag, $deleteConn){
		echo $this->query("DELETE FROM " . JQTT_TAG_TABLE . " WHERE ".JQTT_TAG_TABLE_ID ." IN (".implode(', ', $deleteTag).")");
		echo $this->query("DELETE FROM " . JQTT_CONNECTIONS_TABLE . " WHERE ".JQTT_CONNECTIONS_TABLE_ID ." IN (".implode(', ', $deleteConn).")");
		
	}
	public function delTag_findParentConnection($id){
		return $this->readLine("SELECT " . JQTT_CONNECTIONS_TABLE_ID . " FROM " . JQTT_CONNECTIONS_TABLE . " WHERE " . JQTT_CONNECTIONS_TABLE_CHILD . " = " . $id);
	}
	
	public function delTag_findChildrenConnection($id){
		return $this->readFromDb("SELECT * FROM " . JQTT_CONNECTIONS_TABLE . " WHERE " . JQTT_CONNECTIONS_TABLE_PARENT . " = " . $id);
	}
	
	
}

?>