<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
include '../dbconnection.php';

try {
    $stmt = $conn->prepare("SELECT academicyear_id , academicyear FROM tbl_academicyear");
    $stmt->execute();
    $academics = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(["success" => true, "data" => $academics]);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Error fetching academics: " . $e->getMessage()]);
}
$conn = null;
?>
