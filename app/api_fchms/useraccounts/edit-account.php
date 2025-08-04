<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

include '../dbconnection.php';

$data = json_decode(file_get_contents("php://input"), true);

if (
    !isset($data['user_id']) ||
    !isset($data['username']) ||
    !isset($data['fullname']) ||
    !isset($data['age']) ||
    !isset($data['address']) ||
    !isset($data['contact']) ||
    !isset($data['email']) ||
    !isset($data['photo_url']) ||
    !isset($data['role_id']) ||
    !isset($data['user_status'])
) {
    echo json_encode(["success" => false, "message" => "Missing required fields"]);
    exit;
}

$user_id = intval($data['user_id']);
$username = trim($data['username']);
$fullname = trim($data['fullname']);
$age = trim($data['age']);
$address = trim($data['address']);
$contact = trim($data['contact']);
$email = trim($data['email']);
$photo_url = trim($data['photo_url']);
$role_id = intval($data['role_id']);
$user_status = intval($data['user_status']);

$invalidPattern = '/[<>?+=\\\";{}\[\]]/';
if (
    preg_match($invalidPattern, $username) ||
    preg_match($invalidPattern, $fullname) ||
    preg_match($invalidPattern, $address) ||
    preg_match($invalidPattern, $contact)
) {
    echo json_encode(["success" => false, "message" => "Invalid characters in input."]);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(["success" => false, "message" => "Invalid email format."]);
    exit;
}

// Check existence
$checkSql = "SELECT * FROM tbl_users WHERE user_id = :user_id";
$checkStmt = $conn->prepare($checkSql);
$checkStmt->execute(['user_id' => $user_id]);

if ($checkStmt->rowCount() === 0) {
    echo json_encode(["success" => false, "message" => "User not found."]);
    exit;
}

$current = $checkStmt->fetch(PDO::FETCH_ASSOC);

if (
    $current['username'] === $username &&
    $current['fullname'] === $fullname &&
    $current['age'] === $age &&
    $current['address'] === $address &&
    $current['contact'] === $contact &&
    $current['email'] === $email &&
    $current['photo_url'] === $photo_url &&
    $current['role_id'] == $role_id &&
    $current['user_status'] == $user_status
) {
    echo json_encode(["success" => false, "message" => "No changes detected."]);
    exit;
}

$sql = "UPDATE tbl_users 
        SET username = :username,
            fullname = :fullname,
            age = :age,
            address = :address,
            contact = :contact,
            email = :email,
            photo_url = :photo_url,
            role_id = :role_id,
            user_status = :user_status,
            updated_at = NOW()
        WHERE user_id = :user_id";

$stmt = $conn->prepare($sql);

$success = $stmt->execute([
    'username' => $username,
    'fullname' => $fullname,
    'age' => $age,
    'address' => $address,
    'contact' => $contact,
    'email' => $email,
    'photo_url' => $photo_url,
    'role_id' => $role_id,
    'user_status' => $user_status,
    'user_id' => $user_id
]);

echo json_encode([
    "success" => $success,
    "message" => $success ? "User updated successfully" : "Failed to update user"
]);

$conn = null;
?>
