<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

include '../../dbconnection.php';

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['student_id'], $data['current_password'], $data['new_password'])) {
    echo json_encode(["success" => false, "message" => "Missing required fields."]);
    exit;
}

$student_id = intval($data['student_id']);
$current_password = $data['current_password'];
$new_password = $data['new_password'];

// Fetch student using student_password column
$sql = "SELECT student_password FROM tbl_students WHERE student_id = :student_id";
$stmt = $conn->prepare($sql);
$stmt->execute(['student_id' => $student_id]);
$student = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$student) {
    echo json_encode(["success" => false, "message" => "Student not found."]);
    exit;
}

// Verify current password using SHA1 (to match DB)
$hashedCurrent = sha1($current_password);
if ($hashedCurrent !== $student['student_password']) {
    echo json_encode(["success" => false, "message" => "Current password is incorrect."]);
    exit;
}

// Validate new password strength (same regex as frontend)
if (!preg_match('/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/', $new_password)) {
    echo json_encode(["success" => false, "message" => "Password does not meet complexity requirements."]);
    exit;
}

// Hash new password with SHA1 (to match DB storage format)
$hashedPassword = sha1($new_password);

// Update student_password column
$updateSql = "UPDATE tbl_students SET student_password = :student_password, updated_at = NOW() WHERE student_id = :student_id";
$updateStmt = $conn->prepare($updateSql);
$success = $updateStmt->execute(['student_password' => $hashedPassword, 'student_id' => $student_id]);

echo json_encode([
    "success" => $success,
    "message" => $success ? "Password updated successfully." : "Failed to update password."
]);

$conn = null;
?>
