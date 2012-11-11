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
		if ($this->get_request_method() != "GET")
			$this->response('',406);

		$sql = "SELECT * FROM {$this->table} ORDER BY name ASC";
		$result = mysql_query($sql, $this->db) OR die(mysql_error());

		if(mysql_num_rows($result) > 0)
		{
			$arr = array();

			while($row = mysql_fetch_array($result,MYSQL_ASSOC))
			{
				array_push($arr, $row);
			}		

			$this->response($this->json($arr), 200);
		}			

		$this->response('',204);
	}

	public function manage($args)
	{
		$method = (isset($this->_request['_method'])) ? $this->_request['_method'] : $this->get_request_method();
		switch($method)
		{
			case 'PUT': 
			case 'POST': $this->insert($args);break;
			case 'GET': $this->getContact($args);break;
			case 'DELETE': $this->delete($args);break;
		}
	}

	private function insert()
	{
		$model	= json_decode($this->_request['model']);

		$id 	= (isset($model->id)) ? (int)$model->id : null;
		$address= mysql_real_escape_string($model->address);
		$tel	= mysql_real_escape_string($model->tel);
		$email	= mysql_real_escape_string($model->email);
		$type	= mysql_real_escape_string($model->type);
		$name	= mysql_real_escape_string($model->name);

		if(! is_null($id)) {
			if(filter_var($email, FILTER_VALIDATE_EMAIL))
			{
				$sql = "UPDATE {$this->table} SET tel = '$tel', address = '$address', email ='$email', type='$type', name='$name' WHERE id = $id ";
				$result = mysql_query($sql) or $this->response(mysql_error(), 406);
				if($result)
					$this->response('', 200);
			}

			$this->response('Incorrect set of parameters', 406);
		}
		else
		{
			if(filter_var($email, FILTER_VALIDATE_EMAIL))
			{
				$sql = "INSERT INTO {$this->table}(id,address,tel,email,type,name) VALUES(NULL,'$address','$tel','$email','$type','$name')";
				$result = mysql_query($sql) or $this->response(mysql_error(), 406);
				if($result)
					$this->response('', 200);
			}

			$this->response('Incorrect set of parameters', 406);
		}

		/*
		if( ! empty($address)
			&& ! empty($tel)
			&& ! empty($email)
			&& ! empty($type)
			&& ! empty($name)) {

			if(filter_var($email, FILTER_VALIDATE_EMAIL)) {
				$sql = "INSERT INTO {$this->table} (id, address, tel, email, type, name) VALUES (NULL, '".mysql_real_escape_string($address)."', '".mysql_real_escape_string($tel)."','".mysql_real_escape_string($type)."',	'".mysql_real_escape_string($name)."')";
				$result = mysql_query($sql, $this->db);
				if($result)
				{
					$idContact = mysql_insert_id();
					$resp = "{idContact:$idContact}";
					$this->response($this->json($resp), 200);
				}
				$this->response('Incorrect set of parameters', 406);
			}

		}
		*/

		$this->response('', 406);
	}

	private function delete($args)
	{
		$id = (int)$args;
		$sql = "DELETE FROM {$this->table} WHERE id = ".mysql_real_escape_string($id);
		$result = mysql_query($sql) or $this->response(mysql_error(), 406);

		if($result)
			$this->response('', 200);

		$this->response("", 406);
	}
}