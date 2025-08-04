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
    // Sanitize and validate input
    function sanitize($data) {
        return htmlspecialchars(strip_tags(trim($data)));
    }



    $usersname = sanitize($_POST['usersname'] ?? '');
    $userpasswords = sha1(sanitize($_POST['userpasswords'] ?? ''));
    $useraddress = sanitize($_POST['useraddress'] ?? '');
    $userage = sanitize($_POST['userage'] ?? '');
    $userfullname = sanitize($_POST['userfullname'] ?? '');
    $usercontact = sanitize($_POST['usercontact'] ?? '');
    $useremail = sanitize($_POST['useremail'] ?? '');
    $userrole = sanitize($_POST['userrole'] ?? '');
    $userstatus = 1;
    

    // Check for existing records
    $checkQuery = "SELECT username, email, fullname, contact, address FROM tbl_users 
                   WHERE username = :usersname OR email = :useremail OR fullname = :userfullname 
                         OR contact = :usercontact OR address = :useraddress";

    $stmt = $conn->prepare($checkQuery);
    $stmt->bindParam(':usersname', $usersname, PDO::PARAM_STR);
    $stmt->bindParam(':useremail', $useremail, PDO::PARAM_STR);
    $stmt->bindParam(':userfullname', $userfullname, PDO::PARAM_STR);
    $stmt->bindParam(':usercontact', $usercontact, PDO::PARAM_STR);
    $stmt->bindParam(':useraddress', $useraddress, PDO::PARAM_STR);
    $stmt->execute();

    if ($stmt->rowCount() > 0) {
        $existing = $stmt->fetch(PDO::FETCH_ASSOC);
        $message = "The following already exists: ";
        if ($existing['username'] === $usersname) $message .= "Username, ";
        if ($existing['email'] === $useremail) $message .= "Email, ";
        if ($existing['fullname'] === $userfullname) $message .= "Full Name, ";
        if ($existing['contact'] === $usercontact) $message .= "Contact, ";
        if ($existing['address'] === $useraddress) $message .= "Address, ";

        echo json_encode(["success" => false, "message" => rtrim($message, ", ") . "."]);
        exit;
    }

    $photo_url = null;
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
            echo json_encode(["success" => false, "message" => "Invalid file type. Only JPEG, PNG, and GIF images are allowed."]);
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

    $sql = "INSERT INTO tbl_users (username, user_password, fullname, address, age, contact, email, photo_url, role_id, user_status, created_at) 
            VALUES (:usersname, :userpasswords, :userfullname, :useraddress, :userage, :usercontact, :useremail, :photo_url, :userrole, :userstatus, NOW())";

    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':usersname', $usersname, PDO::PARAM_STR);
    $stmt->bindParam(':userpasswords', $userpasswords, PDO::PARAM_STR);
    $stmt->bindParam(':useraddress', $useraddress, PDO::PARAM_STR);
    $stmt->bindParam(':userage', $userage, PDO::PARAM_STR);
    $stmt->bindParam(':userfullname', $userfullname, PDO::PARAM_STR);
    $stmt->bindParam(':usercontact', $usercontact, PDO::PARAM_STR);
    $stmt->bindParam(':useremail', $useremail, PDO::PARAM_STR);
    $stmt->bindParam(':photo_url', $photo_url, PDO::PARAM_STR);
    $stmt->bindParam(':userrole', $userrole, PDO::PARAM_INT);
    $stmt->bindParam(':userstatus', $userstatus, PDO::PARAM_INT);
    $stmt->execute();




       if ($stmt->rowCount() > 0) {
        $new_user_id = $conn->lastInsertId();

        // Fetch role name for log description
        $roleQuery = $conn->prepare("SELECT role_name FROM tbl_role WHERE role_id = ?");
        $roleQuery->execute([$userrole]);
        $roleData = $roleQuery->fetch(PDO::FETCH_ASSOC);
        $roleName = $roleData ? $roleData['role_name'] : "Unknown Role";


        $activity_type = "User Management";
        $action = "Added new user account: $usersname ($roleName)";
        $activity_time = date("Y-m-d H:i:s");

        $logStmt = $conn->prepare("INSERT INTO tbl_activity_logs (user_id, activity_type, action, activity_time) VALUES (?, ?, ?, ?)");
        $logStmt->execute([$new_user_id, $activity_type, $action, $activity_time]);

        $response = ["success" => true, "message" => "User successfully added"];
    } else {
        $response = ["success" => false, "message" => "Failed to add user"];
    }



} catch (PDOException $e) {
    $response = ["success" => false, "message" => "Error adding user: " . $e->getMessage()];
} catch (Exception $e) {
    $response = ["success" => false, "message" => $e->getMessage()];
}

echo json_encode($response);
$conn = null;
?>
