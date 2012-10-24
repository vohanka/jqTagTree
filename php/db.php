<?php
//Třída Zajišťující připojení k databázi a funkce pracující s ní.
class Db{
	
	private static $instance = NULL;
	private $connection = NULL;
	private $connected = false;

	//Vytvoření připojení.
	private function __construct(){
		$this->connection = mysql_connect ( HOST, USER, PASS );
		if($this->connection != NULL){
			$this->connected = true;
			$this->selectDb(DB);
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
	public function escape($string){
		return mysql_real_escape_string($string);
	}
	//Dotaz do DB
	public function query($dotaz){
		return mysql_query($dotaz);
	}
	//Databázová funkce počet řádek
	public function numRows($dotaz){
		return mysql_num_rows($dotaz);
	}
	//Vrací řádek ze zadaného dotazu
	public function fetchArray($dotaz){
		return mysql_fetch_array($dotaz,MYSQL_ASSOC);
	}
	//Funkce vracející počet řádek ze zadaného dotazu
	public function numberOfRows($dotaz){
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

}

?>