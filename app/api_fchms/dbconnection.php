<?php
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "facultyconsultation";

try {
    // Create a PDO connection
    $conn = new PDO("mysql:host=$servername;dbname=$dbname", $username, $password);
    // Set the PDO error mode to exceptions
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    // Handle connection error
    http_response_code(500);
    echo json_encode(["error" => "Connection failed: " . $e->getMessage()]);
    exit();
}
?>
