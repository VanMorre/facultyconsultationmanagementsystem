<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

include '../dbconnection.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["success" => false, "message" => "Invalid request method"]);
    exit;
}

// Get JSON data
$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['user_id'], $data['current_password'], $data['new_password'])) {
    echo json_encode(["success" => false, "message" => "Missing required fields"]);
    exit;
}

$user_id = intval($data['user_id']);
$current_password = sha1($data['current_password']);
$new_password = sha1($data['new_password']);

// Check current password
$sql = "SELECT user_password FROM tbl_users WHERE user_id = :user_id";
$stmt = $conn->prepare($sql);
$stmt->execute(['user_id' => $user_id]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user) {
    echo json_encode(["success" => false, "message" => "User not found"]);
    exit;
}

if ($user['user_password'] !== $current_password) {
    echo json_encode(["success" => false, "message" => "Current password is incorrect"]);
    exit;
}

// Update new password
$updateSql = "UPDATE tbl_users SET user_password = :new_password, updated_at = NOW() WHERE user_id = :user_id";
$updateStmt = $conn->prepare($updateSql);
$success = $updateStmt->execute([
    'new_password' => $new_password,
    'user_id' => $user_id
]);

echo json_encode([
    "success" => $success,
    "message" => $success ? "Password updated successfully" : "Failed to update password"
]);

$conn = null;
?>
