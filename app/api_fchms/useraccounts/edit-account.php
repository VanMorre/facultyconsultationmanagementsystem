<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

include '../dbconnection.php';

$response = [];

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["success" => false, "message" => "Invalid request method. Only POST is allowed."]);
    exit;
}

try {
    function sanitize($data) {
        return htmlspecialchars(strip_tags(trim($data)));
    }

    // Required fields
    $user_id   = intval($_POST['user_id'] ?? 0);
    $username  = sanitize($_POST['username'] ?? '');
    $fullname  = sanitize($_POST['fullname'] ?? '');
    $age       = sanitize($_POST['age'] ?? '');
    $address   = sanitize($_POST['address'] ?? '');
    $contact   = sanitize($_POST['contact'] ?? '');
    $email     = sanitize($_POST['email'] ?? '');

    // Optional fields
    $role_id     = isset($_POST['role_id']) ? intval($_POST['role_id']) : null;
    $user_status = isset($_POST['user_status']) ? intval($_POST['user_status']) : null;

    if (!$user_id || !$username || !$fullname || !$age || !$address || !$contact || !$email) {
        echo json_encode(["success" => false, "message" => "All fields are required."]);
        exit;
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(["success" => false, "message" => "Invalid email format."]);
        exit;
    }

    // ✅ Check if user exists
    $checkSql = "SELECT * FROM tbl_users WHERE user_id = :user_id";
    $checkStmt = $conn->prepare($checkSql);
    $checkStmt->execute(['user_id' => $user_id]);

    if ($checkStmt->rowCount() === 0) {
        echo json_encode(["success" => false, "message" => "User not found."]);
        exit;
    }

    $current = $checkStmt->fetch(PDO::FETCH_ASSOC);
    $photo_url = $current['photo_url']; // ✅ Keep old photo if no new upload

    // ✅ Handle new image (if uploaded)
    if (isset($_FILES['userImage']) && $_FILES['userImage']['error'] === UPLOAD_ERR_OK) {
        $file = $_FILES['userImage'];
        $fileName = time() . '_' . basename($file['name']);
        $targetDir = dirname(__DIR__) . '/uploads/';
        $targetPath = $targetDir . $fileName;

        if (!file_exists($targetDir)) {
            mkdir($targetDir, 0755, true);
        }

        $allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
        $fileType = mime_content_type($file['tmp_name']);
        $maxFileSize = 2 * 1024 * 1024;

        if (!in_array($fileType, $allowedTypes)) {
            echo json_encode(["success" => false, "message" => "Invalid file type."]);
            exit;
        }
        if ($file['size'] > $maxFileSize) {
            echo json_encode(["success" => false, "message" => "File size exceeds 2MB."]);
            exit;
        }

        if (move_uploaded_file($file['tmp_name'], $targetPath)) {
            $photo_url = 'uploads/' . $fileName; // ✅ Replace with new photo if uploaded
        } else {
            echo json_encode(["success" => false, "message" => "Failed to move uploaded file."]);
            exit;
        }
    }

    // ✅ Build dynamic SQL (role_id & user_status only if provided)
    $updateFields = "
        username = :username,
        fullname = :fullname,
        age = :age,
        address = :address,
        contact = :contact,
        email = :email,
        photo_url = :photo_url,
        updated_at = NOW()";

    if ($role_id !== null) {
        $updateFields .= ", role_id = :role_id";
    }
    if ($user_status !== null) {
        $updateFields .= ", user_status = :user_status";
    }

    $sql = "UPDATE tbl_users SET $updateFields WHERE user_id = :user_id";
    $stmt = $conn->prepare($sql);

    // Bind required fields
    $params = [
        'username' => $username,
        'fullname' => $fullname,
        'age' => $age,
        'address' => $address,
        'contact' => $contact,
        'email' => $email,
        'photo_url' => $photo_url, // ✅ Always keep or update photo_url
        'user_id' => $user_id
    ];

    // Bind optional fields if provided
    if ($role_id !== null) {
        $params['role_id'] = $role_id;
    }
    if ($user_status !== null) {
        $params['user_status'] = $user_status;
    }

    $success = $stmt->execute($params);

    if ($success) {
        $baseImageUrl = "http://localhost/fchms/app/api_fchms/";
        $response = [
            "success" => true,
            "message" => "User updated successfully",
            // ✅ Always return full photo_url (old or new)
            "newPhotoUrl" => $photo_url ? $baseImageUrl . $photo_url : null
        ];
    } else {
        $response = ["success" => false, "message" => "Failed to update user"];
    }

} catch (PDOException $e) {
    $response = ["success" => false, "message" => "Database error: " . $e->getMessage()];
} catch (Exception $e) {
    $response = ["success" => false, "message" => $e->getMessage()];
}

echo json_encode($response);
$conn = null;
