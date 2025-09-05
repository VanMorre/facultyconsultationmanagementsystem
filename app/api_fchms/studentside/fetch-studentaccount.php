<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");
session_start();
include '../dbconnection.php';

if ($_SERVER["REQUEST_METHOD"] == "OPTIONS") {
    http_response_code(200);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);

// Validate input
if (!isset($data['student_email'], $data['student_password'])) {
    echo json_encode(['success' => false, 'message' => 'Invalid request! Missing email or password.']);
    exit;
}

$student_email = trim($data['student_email']);
$student_password = trim($data['student_password']);
$hashedPassword = sha1($student_password); // ✅ hashed, matches DB

// Fetch student data
$stmt = $conn->prepare("
    SELECT s.student_id, 
           s.student_name, 
           s.student_password, 
           s.role_id, 
           r.role_name,             
           s.age, 
           s.contact, 
           s.student_email, 
           s.photo_url, 
           c.course_name, 
           y.year_name
    FROM tbl_students s
    LEFT JOIN tbl_course c ON s.course_id = c.course_id
    LEFT JOIN tbl_yearlevel y ON s.year_id = y.year_id
    LEFT JOIN tbl_role r ON s.role_id = r.role_id   -- ✅ join role table
    WHERE BINARY s.student_email = :student_email
");

$stmt->bindParam(':student_email', $student_email, PDO::PARAM_STR);
$stmt->execute();
$student = $stmt->fetch(PDO::FETCH_ASSOC);

if ($student) {
    if ($hashedPassword === $student['student_password']) {
        $_SESSION['student_id'] = $student['student_id'];
        $_SESSION['role_id'] = $student['role_id'];

        $token = bin2hex(random_bytes(16));
        $baseImageUrl = "http://localhost/fchms/app/api_fchms/uploads/";
        $photoUrl = $student['photo_url'] ? $baseImageUrl . basename($student['photo_url']) : null;

        echo json_encode([
            "success" => true,
            "message" => "Login successful",
            "token" => $token,
            "student_id" => $student['student_id'],
            "student_name" => $student['student_name'],
            "role" => $student['role_id'],
            "role_name" => strtolower($student['role_name']),
            "age" => $student['age'],
            "contact" => $student['contact'],
            "student_email" => $student['student_email'],
            "photo_url" => $photoUrl,
            "course_name" => $student['course_name'],
            "year_name" => $student['year_name']
        ]);
    } else {
        echo json_encode(["success" => false, "message" => "Incorrect password."]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Invalid credentials."]);
}
?>
