<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST");
header("Content-Type: application/json; charset=UTF-8");

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

    // ✅ Collect form data
    $studentname     = sanitize($_POST['studentname'] ?? '');
    
    // ⚠️ Do not sanitize password
    $studentpasswordRaw = $_POST['studentpassword'] ?? '';
    $studentpassword    = sha1($studentpasswordRaw); 

    $studentemail    = sanitize($_POST['studentemail'] ?? '');
    $studentage      = sanitize($_POST['studentage'] ?? '');
    $studentcontact  = sanitize($_POST['studentcontact'] ?? '');
    $studentcourse   = sanitize($_POST['studentcourse'] ?? '');
    $studentyear     = sanitize($_POST['studentyearlevel'] ?? '');
    $studentrole     = sanitize($_POST['studentrole'] ?? '');

    // ✅ Check if email or contact already exists
    $checkQuery = "SELECT student_email, contact 
                   FROM tbl_students 
                   WHERE student_email = :studentemail OR contact = :studentcontact";
    $stmt = $conn->prepare($checkQuery);
    $stmt->bindParam(':studentemail', $studentemail, PDO::PARAM_STR);
    $stmt->bindParam(':studentcontact', $studentcontact, PDO::PARAM_STR);
    $stmt->execute();

    if ($stmt->rowCount() > 0) {
        $existing = $stmt->fetch(PDO::FETCH_ASSOC);
        $message = "The following already exists: ";
        if ($existing['student_email'] === $studentemail) $message .= "Email, ";
        if ($existing['contact'] === $studentcontact) $message .= "Contact, ";
        echo json_encode(["success" => false, "message" => rtrim($message, ", ") . "."]);
        exit;
    }

    // ✅ Handle photo upload
    $photo_url = null;
    if (isset($_FILES['studentphoto']) && $_FILES['studentphoto']['error'] === UPLOAD_ERR_OK) {
        $file = $_FILES['studentphoto'];
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
            $photo_url = 'uploads/' . $fileName;
        } else {
            echo json_encode(["success" => false, "message" => "Failed to move uploaded file."]);
            exit;
        }
    }

    // ✅ Insert student record
    $sql = "INSERT INTO tbl_students 
            (student_name, student_password, student_email, age, contact, course_id, year_id, role_id, photo_url, created_at, updated_at) 
            VALUES 
            (:studentname, :studentpassword, :studentemail, :studentage, :studentcontact, :studentcourse, :studentyear, :studentrole, :photo_url, NOW(), NOW())";

    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':studentname', $studentname, PDO::PARAM_STR);
    $stmt->bindParam(':studentpassword', $studentpassword, PDO::PARAM_STR);
    $stmt->bindParam(':studentemail', $studentemail, PDO::PARAM_STR);
    $stmt->bindParam(':studentage', $studentage, PDO::PARAM_INT);
    $stmt->bindParam(':studentcontact', $studentcontact, PDO::PARAM_STR);
    $stmt->bindParam(':studentcourse', $studentcourse, PDO::PARAM_INT);
    $stmt->bindParam(':studentyear', $studentyear, PDO::PARAM_INT);
    $stmt->bindParam(':studentrole', $studentrole, PDO::PARAM_INT);
    $stmt->bindParam(':photo_url', $photo_url, PDO::PARAM_STR);

    if ($stmt->execute()) {
        $response = ["success" => true, "message" => "Student account created successfully!"];
    } else {
        $response = ["success" => false, "message" => "Failed to create student account."];
    }

} catch (PDOException $e) {
    $response = ["success" => false, "message" => "Error: " . $e->getMessage()];
} catch (Exception $e) {
    $response = ["success" => false, "message" => $e->getMessage()];
}

echo json_encode($response);
$conn = null;
?>
