<?php
// Headers
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

include '../../dbconnection.php';

// Handle preflight
if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit();
}

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    echo json_encode(["success" => false, "message" => "Invalid request method"]);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data["email"], $data["old_password"], $data["new_password"])) {
    echo json_encode(["success" => false, "message" => "Missing required fields"]);
    exit();
}

$email = trim($data["email"]);
$old_password = sha1($data["old_password"]);
$new_password = sha1($data["new_password"]);

try {
    // Fetch student record
    $sql = "SELECT student_id, student_password FROM tbl_students WHERE student_email = :email LIMIT 1";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(":email", $email, PDO::PARAM_STR);
    $stmt->execute();
    $student = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$student) {
        echo json_encode(["success" => false, "message" => "Student not found"]);
        exit();
    }

    if ($student["student_password"] !== $old_password) {
        echo json_encode(["success" => false, "message" => "Old password is incorrect"]);
        exit();
    }

    // Update new password
    $updateSql = "UPDATE tbl_students SET student_password = :new_password, updated_at = NOW() WHERE student_email = :email";
    $updateStmt = $conn->prepare($updateSql);
    $success = $updateStmt->execute([
        ":new_password" => $new_password,
        ":email" => $email
    ]);

    if ($success) {
        echo json_encode(["success" => true, "message" => "Password updated successfully"]);
    } else {
        echo json_encode(["success" => false, "message" => "Failed to update password"]);
    }
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Server error: " . $e->getMessage()]);
}
?>
