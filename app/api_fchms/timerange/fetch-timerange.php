<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
include '../dbconnection.php';

try {
    $stmt = $conn->prepare("SELECT timerange_id, start_time , end_time FROM tbl_timerange");
    $stmt->execute();
    $timeranges = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(["success" => true, "data" => $timeranges]);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Error timeranges: " . $e->getMessage()]);
}
$conn = null;
?>
