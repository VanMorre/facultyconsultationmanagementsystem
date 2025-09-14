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

// Required fields
$required = ['user_id','username','fullname','age','address','contact','email','role_id','user_status'];
foreach ($required as $field) {
    if (!isset($_POST[$field])) {
        echo json_encode(["success" => false, "message" => "Missing required field: $field"]);
        exit;
    }
}

$user_id   = intval($_POST['user_id']);
$username  = trim($_POST['username']);
$fullname  = trim($_POST['fullname']);
$age       = trim($_POST['age']);
$address   = trim($_POST['address']);
$contact   = trim($_POST['contact']);
$email     = trim($_POST['email']);

// ✅ Fix: make sure role_id and user_status are numeric
$role_id     = (isset($_POST['role_id']) && is_numeric($_POST['role_id'])) ? intval($_POST['role_id']) : null;
$user_status = (isset($_POST['user_status']) && is_numeric($_POST['user_status'])) ? intval($_POST['user_status']) : null;

// 🔹 Handle File Upload
$photoFileName = null;
if (isset($_FILES['photo']) && $_FILES['photo']['error'] === UPLOAD_ERR_OK) {
    $uploadDir = "../uploads/";
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }

    $ext = pathinfo($_FILES['photo']['name'], PATHINFO_EXTENSION);
    $photoFileName = uniqid("profile_") . "." . $ext;
    $uploadPath = $uploadDir . $photoFileName;

    if (!move_uploaded_file($_FILES['photo']['tmp_name'], $uploadPath)) {
        echo json_encode(["success" => false, "message" => "Failed to upload photo"]);
        exit;
    }
}

// 🔹 Get current user
$checkSql = "SELECT * FROM tbl_users WHERE user_id = :user_id";
$checkStmt = $conn->prepare($checkSql);
$checkStmt->execute(['user_id' => $user_id]);
if ($checkStmt->rowCount() === 0) {
    echo json_encode(["success" => false, "message" => "User not found."]);
    exit;
}
$current = $checkStmt->fetch(PDO::FETCH_ASSOC);

// ✅ If no role_id/user_status passed, keep current values
if ($role_id === null) {
    $role_id = $current['role_id'];
}
if ($user_status === null) {
    $user_status = $current['user_status'];
}

// 🔹 Validate role_id (avoid FK violation)
$roleCheck = $conn->prepare("SELECT role_id FROM tbl_role WHERE role_id = :role_id");
$roleCheck->execute(['role_id' => $role_id]);
if ($roleCheck->rowCount() === 0) {
    echo json_encode(["success" => false, "message" => "Invalid role_id: $role_id"]);
    exit;
}

// If no new photo uploaded, keep old one
if (!$photoFileName) {
    $photoFileName = $current['photo_url'];
}

// 🔹 Update
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
    'username'   => $username,
    'fullname'   => $fullname,
    'age'        => $age,
    'address'    => $address,
    'contact'    => $contact,
    'email'      => $email,
    'photo_url'  => $photoFileName,
    'role_id'    => $role_id,
    'user_status'=> $user_status,
    'user_id'    => $user_id
]);

echo json_encode([
    "success" => $success,
    "message" => $success ? "User updated successfully" : "Failed to update user"
]);

$conn = null;
?>
