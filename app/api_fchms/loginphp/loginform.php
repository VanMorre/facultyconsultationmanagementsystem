<?php
// Allow cross-origin requests
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

session_start();
include '../dbconnection.php'; 

// Handle preflight request
if ($_SERVER["REQUEST_METHOD"] == "OPTIONS") {
    http_response_code(200);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);

// Validate input
if (!isset($data['email'], $data['password'])) {
    echo json_encode(['success' => false, 'message' => 'Invalid request! Missing email or password.']);
    exit;
}

$email = trim($data['email']);
$password = trim($data['password']);
$hashedPassword = sha1($password); // ⚠️ For production, use password_hash and password_verify

// Fetch user data, including additional fields
$stmt = $conn->prepare("
    SELECT u.user_id, u.username, u.user_password, u.role_id, u.fullname, u.photo_url, 
           u.age, u.contact, u.email, u.address,
           r.role_name 
    FROM tbl_users u 
    JOIN tbl_role r ON u.role_id = r.role_id
    WHERE BINARY u.email = :email 
");
$stmt->bindParam(':email', $email , PDO::PARAM_STR);
$stmt->execute();
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if ($user) {
    $user_id = $user['user_id'];

    // Validate password
    if ($hashedPassword === $user['user_password']) {
        $_SESSION['user_id'] = $user_id;
        $_SESSION['role_id'] = $user['role_id'];
        $token = bin2hex(random_bytes(16));

        $baseImageUrl = "http://localhost/fchms/app/api_fchms/uploads/";
        $photoUrl = $user['photo_url'] ? $baseImageUrl . basename($user['photo_url']) : null;

        echo json_encode([
            "success" => true,
            "message" => "Login successful",
            "token" => $token,
            "user_id" => $user_id,
            "username" => $user['username'],
            "role" => $user['role_id'],
            "role_name" => strtolower($user['role_name']),
            "fullname" => $user['fullname'],
            "photo_url" => $photoUrl,
            "age" => $user['age'],
            "contact" => $user['contact'],
            "email" => $user['email'],
            "address" => $user['address']
        ]);
    } else {
        echo json_encode(["success" => false, "message" => "Incorrect password."]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Invalid credentials."]);
}
?>
