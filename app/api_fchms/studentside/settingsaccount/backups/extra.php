<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

include '../../dbconnection.php';

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
    $student_id    = intval($_POST['student_id'] ?? 0);
    $student_name  = sanitize($_POST['student_name'] ?? '');
    $age           = sanitize($_POST['age'] ?? '');
    $contact       = sanitize($_POST['contact'] ?? '');
    $student_email = sanitize($_POST['student_email'] ?? '');

    // Optional fields
    $course_id  = isset($_POST['course_id']) ? intval($_POST['course_id']) : null;
    $year_id    = isset($_POST['year_id']) ? intval($_POST['year_id']) : null;
    $role_id    = isset($_POST['role_id']) ? intval($_POST['role_id']) : null;

    if (!$student_id || !$student_name || !$age || !$contact || !$student_email) {
        echo json_encode(["success" => false, "message" => "All fields are required."]);
        exit;
    }

    if (!filter_var($student_email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(["success" => false, "message" => "Invalid email format."]);
        exit;
    }

    // ✅ Check if student exists
    $checkSql = "SELECT * FROM tbl_students WHERE student_id = :student_id";
    $checkStmt = $conn->prepare($checkSql);
    $checkStmt->execute(['student_id' => $student_id]);

    if ($checkStmt->rowCount() === 0) {
        echo json_encode(["success" => false, "message" => "Student not found."]);
        exit;
    }

    $current = $checkStmt->fetch(PDO::FETCH_ASSOC);
    $photo_url = $current['photo_url']; // ✅ Keep old photo if no new upload

    // ✅ Handle new image (if uploaded, use `photo_url` key)
    if (isset($_FILES['photo_url']) && $_FILES['photo_url']['error'] === UPLOAD_ERR_OK) {
        $file = $_FILES['photo_url'];
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

    // ✅ Build dynamic SQL
    $updateFields = "
        student_name = :student_name,
        age = :age,
        contact = :contact,
        student_email = :student_email,
        photo_url = :photo_url,
        updated_at = NOW()";

    if ($course_id !== null) {
        $updateFields .= ", course_id = :course_id";
    }
    if ($year_id !== null) {
        $updateFields .= ", year_id = :year_id";
    }
    if ($role_id !== null) {
        $updateFields .= ", role_id = :role_id";
    }

    $sql = "UPDATE tbl_students SET $updateFields WHERE student_id = :student_id";
    $stmt = $conn->prepare($sql);

    // Bind required fields
    $params = [
        'student_name' => $student_name,
        'age' => $age,
        'contact' => $contact,
        'student_email' => $student_email,
        'photo_url' => $photo_url, // ✅ Always keep or update photo_url
        'student_id' => $student_id
    ];

    // Bind optional fields if provided
    if ($course_id !== null) {
        $params['course_id'] = $course_id;
    }
    if ($year_id !== null) {
        $params['year_id'] = $year_id;
    }
    if ($role_id !== null) {
        $params['role_id'] = $role_id;
    }

    $success = $stmt->execute($params);

    if ($success) {
        $baseImageUrl = "http://localhost/fchms/app/api_fchms/";

        // ✅ Fetch student info with course_name and year_name
        $infoSql = "SELECT s.*, c.course_name, y.year_name
                    FROM tbl_students s
                    LEFT JOIN tbl_course c ON s.course_id = c.course_id
                    LEFT JOIN tbl_yearlevel y ON s.year_id = y.year_id
                    WHERE s.student_id = :student_id";
        $infoStmt = $conn->prepare($infoSql);
        $infoStmt->execute(['student_id' => $student_id]);
        $studentInfo = $infoStmt->fetch(PDO::FETCH_ASSOC);

        $response = [
            "success" => true,
            "message" => "Student updated successfully",
            "student" => [
                "student_id"    => $studentInfo['student_id'],
                "student_name"  => $studentInfo['student_name'],
                "age"           => $studentInfo['age'],
                "contact"       => $studentInfo['contact'],
                "student_email" => $studentInfo['student_email'],
                "course_id"     => $studentInfo['course_id'],
                "year_id"       => $studentInfo['year_id'],
                "role_id"       => $studentInfo['role_id'],
                "course_name"   => $studentInfo['course_name'],
                "year_name"     => $studentInfo['year_name'],
                "photo_url"     => $studentInfo['photo_url'] ? $baseImageUrl . $studentInfo['photo_url'] : null
            ]
        ];
    } else {
        $response = ["success" => false, "message" => "Failed to update student"];
    }

} catch (PDOException $e) {
    $response = ["success" => false, "message" => "Database error: " . $e->getMessage() ];
} catch (Exception $e) {
    $response = ["success" => false, "message" => $e->getMessage() ];
}

echo json_encode($response);
$conn = null;
?>
