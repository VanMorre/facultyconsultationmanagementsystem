<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
include '../dbconnection.php';

try {
    $stmt = $conn->prepare("SELECT year_id , year_name FROM tbl_yearlevel");
    $stmt->execute();
    $yearlevels = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(["success" => true, "data" => $yearlevels]);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Error fetching yearlevels: " . $e->getMessage()]);
}
$conn = null;
?>
