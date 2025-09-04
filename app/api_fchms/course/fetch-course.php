<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
include '../dbconnection.php';

try {
    $stmt = $conn->prepare("SELECT course_id , course_name FROM tbl_course");
    $stmt->execute();
    $courses = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(["success" => true, "data" => $courses]);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Error fetching courses: " . $e->getMessage()]);
}
$conn = null;
?>
