<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
include '../dbconnection.php';

try {
    $stmt = $conn->prepare("SELECT availability_id, availability_name FROM tbl_availabilityday");
    $stmt->execute();
    $availday = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(["success" => true, "data" => $availday]);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Error availability day: " . $e->getMessage()]);
}
$conn = null;
?>
