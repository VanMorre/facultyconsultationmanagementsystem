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

if (!isset($_POST['user_id'])) {
    echo json_encode(["success" => false, "message" => "Missing required field: user_id"]);
    exit;
}

$user_id = intval($_POST['user_id']);

// Get current user
$checkSql = "SELECT * FROM tbl_users WHERE user_id = :user_id";
$checkStmt = $conn->prepare($checkSql);
$checkStmt->execute(['user_id' => $user_id]);
if ($checkStmt->rowCount() === 0) {
    echo json_encode(["success" => false, "message" => "User not found."]);
    exit;
}
$current = $checkStmt->fetch(PDO::FETCH_ASSOC);

// Allowed editable fields
$allowedFields = ['username','fullname','age','address','contact','email','role_id','user_status'];

$updates = [];
$params = ['user_id' => $user_id];

foreach ($allowedFields as $field) {
    if (isset($_POST[$field]) && $_POST[$field] !== '') {
        if ($field === 'role_id' || $field === 'user_status') {
            $val = intval($_POST[$field]);
            if ($val > 0) { // ✅ only allow > 0
                $params[$field] = $val;
                $updates[] = "$field = :$field";
            }
        } else {
            $params[$field] = trim($_POST[$field]);
            $updates[] = "$field = :$field";
        }
    }
}


if (isset($_FILES['photo']) && $_FILES['photo']['error'] === UPLOAD_ERR_OK) {
    // ✅ uploads folder inside api_fchms
    $uploadDir = __DIR__ . "/../uploads/"; 
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }

    $ext = pathinfo($_FILES['photo']['name'], PATHINFO_EXTENSION);
    $username = preg_replace("/[^a-zA-Z0-9]/", "", strtolower($current['username'])); // sanitize username
    $timestamp = time();
    $photoFileName = $timestamp . "_" . $username . "." . $ext; // ✅ correct format

    $uploadPath = $uploadDir . $photoFileName;

    if (!move_uploaded_file($_FILES['photo']['tmp_name'], $uploadPath)) {
        echo json_encode(["success" => false, "message" => "Failed to upload photo"]);
        exit;
    }

    $updates[] = "photo_url = :photo_url";
    // ✅ Save with "uploads/" so DB stores uploads/1757483288_darwingaludo.png
    $params['photo_url'] = "uploads/" . $photoFileName;
}


if (empty($updates)) {
    echo json_encode(["success" => false, "message" => "No fields to update"]);
    exit;
}

// Add updated_at
$updates[] = "updated_at = NOW()";

$sql = "UPDATE tbl_users SET " . implode(", ", $updates) . " WHERE user_id = :user_id";
$stmt = $conn->prepare($sql);
$success = $stmt->execute($params);

// Fetch updated row
$updatedStmt = $conn->prepare("SELECT * FROM tbl_users WHERE user_id = :user_id");
$updatedStmt->execute(['user_id' => $user_id]);
$updatedUser = $updatedStmt->fetch(PDO::FETCH_ASSOC);

// ✅ Return relative path like "uploads/1757041703_sampleuser.png"
if (!empty($updatedUser['photo_url'])) {
    $updatedUser['photo_url'] = "uploads/" . $updatedUser['photo_url'];
}

echo json_encode([
    "success" => $success,
    "message" => $success ? "User updated successfully" : "Failed to update user",
    "data" => $updatedUser
]);

$conn = null;
?>
