<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

include '../dbconnection.php';

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['user_id'], $data['current_password'], $data['new_password'])) {
    echo json_encode(["success" => false, "message" => "Missing required fields."]);
    exit;
}

$user_id = intval($data['user_id']);
$current_password = $data['current_password'];
$new_password = $data['new_password'];

// Fetch user using user_password column
$sql = "SELECT user_password FROM tbl_users WHERE user_id = :user_id";
$stmt = $conn->prepare($sql);
$stmt->execute(['user_id' => $user_id]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user) {
    echo json_encode(["success" => false, "message" => "User not found."]);
    exit;
}

// Verify current password using SHA1 (to match DB)
$hashedCurrent = sha1($current_password);
if ($hashedCurrent !== $user['user_password']) {
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

// Update user_password column
$updateSql = "UPDATE tbl_users SET user_password = :user_password, updated_at = NOW() WHERE user_id = :user_id";
$updateStmt = $conn->prepare($updateSql);
$success = $updateStmt->execute(['user_password' => $hashedPassword, 'user_id' => $user_id]);

echo json_encode([
    "success" => $success,
    "message" => $success ? "Password updated successfully." : "Failed to update password."
]);

$conn = null;
?>