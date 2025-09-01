<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
include '../dbconnection.php';

try {
    $stmt = $conn->prepare("SELECT recurrence_id, recurrence_name FROM tbl_recurrence");
    $stmt->execute();
    $recurrences = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(["success" => true, "data" => $recurrences]);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Error recurrences: " . $e->getMessage()]);
}
$conn = null;
?>
