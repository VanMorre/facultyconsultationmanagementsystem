<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type");

include '../../dbconnection.php';

// Validate student_id
if (!isset($_GET['student_id'])) {
    echo json_encode(["success" => false, "message" => "Missing student_id"]);
    exit;
}

$student_id = intval($_GET['student_id']);

// Fetch student data
$sql = "SELECT 
            s.student_id,
            s.student_name,
            s.age,
            s.contact,
            s.student_email,
            s.photo_url,
            r.role_name,
            c.course_name,
            y.year_name,
            s.created_at,
            s.updated_at
        FROM tbl_students s
        LEFT JOIN tbl_role r ON s.role_id = r.role_id
        LEFT JOIN tbl_course c ON s.course_id = c.course_id
        LEFT JOIN tbl_yearlevel y ON s.year_id = y.year_id
        WHERE s.student_id = :student_id";

$stmt = $conn->prepare($sql);
$stmt->execute(['student_id' => $student_id]);
$student = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$student) {
    echo json_encode(["success" => false, "message" => "Student not found"]);
    exit;
}

echo json_encode([
    "success" => true,
    "data" => $student
]);

$conn = null;
?>
