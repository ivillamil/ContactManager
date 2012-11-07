<?php
require_once "Rest.inc.php";

Class Api extends Rest {

	public $data = "";

	const DB_SERVER = "localhost";
	const DB_USER = "root";
	const DB_PASSWORD = "";
	const DB = "backbone_contacts";
	const EXT = "php";
	
	protected $db = NULL;

	public function __construct()
	{
		parent::__construct();
		$this->dbConnect();
	}

	private function dbConnect()
	{
		$this->db = mysql_connect(self::DB_SERVER, self::DB_USER, self::DB_PASSWORD);
		if($this->db)
			mysql_select_db(self::DB, $this->db);
	}

	public function processApi()
	{
		$rquestParts = explode("/", strtolower(trim($_REQUEST["rquest"])));

		if(count($rquestParts) <= 1)
			$this->response('',404);

		$obj = $rquestParts[0];
		$func = $rquestParts[1];

		if(count($rquestParts) > 2)
		{
			array_splice($rquestParts, 0);
			array_splice($rquestParts, 1);
			$args = $rquestParts;
		}
		else
			$args = array();
		
		if(is_file(dirname(__FILE__).'\\'.$rquestParts[0]).'.'.self::EXT)
			include_once ($rquestParts[0].".".self::EXT);

		$class = ucfirst($rquestParts[0]);
		$class = new $class();

		if ((int)method_exists($class, $func) > 0)
			$class->$func();
		else
			$this->response('',404);

	}

	protected function json($data)
	{
		if(is_array($data)) {
			return json_encode($data);
		}
	}
}

$api = new Api();
$api->processApi();