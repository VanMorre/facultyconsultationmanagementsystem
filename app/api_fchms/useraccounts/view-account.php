<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type");

include '../dbconnection.php';

if (!isset($_GET['user_id'])) {
    echo json_encode(["success" => false, "message" => "Missing user_id"]);
    exit;
}

$user_id = intval($_GET['user_id']);

$sql = "SELECT 
            u.user_id,
            u.username,
            u.fullname,
            u.age,
            u.address,
            u.contact,
            u.email,
            u.photo_url,
            r.role_name,
            s.status_name,
            u.created_at,
            u.updated_at
        FROM tbl_users u
        LEFT JOIN tbl_role r ON u.role_id = r.role_id
        LEFT JOIN tbl_status s ON u.user_status = s.status_id
        WHERE u.user_id = :user_id";

$stmt = $conn->prepare($sql);
$stmt->execute(['user_id' => $user_id]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user) {
    echo json_encode(["success" => false, "message" => "User not found"]);
    exit;
}

echo json_encode([
    "success" => true,
    "data" => $user
]);

$conn = null;
?>
