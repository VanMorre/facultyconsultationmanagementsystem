<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
include '../dbconnection.php';

try {
    
    $stmt = $conn->prepare("SELECT status_id, status_name FROM tbl_status");
    $stmt->execute();
    $statuses = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(["success" => true, "data" => $statuses]);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Error fetching statuses: " . $e->getMessage()]);
}
$conn = null;
?>
