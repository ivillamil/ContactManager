<?php

class Contacts extends Api
{
	private $table = "contacts";

	public function __construct()
	{
		parent::__construct();
	}

	public function lista()
	{
		$sql = "SELECT * FROM {$this->table} ORDER BY name ASC";
		$result = mysql_query($sql, $this->db) OR die(mysql_error());
		$arr = array();
		while($row = mysql_fetch_array($result))
		{
			array_push($arr, $row);
		}
		
		//$arr = array('msg' => 'somthing');

		$this->response($this->json($arr), 200);
	}

	public function insert()
	{

	}

	public function update()
	{

	}

	public function delete()
	{

	}
}