<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

include '../../dbconnection.php'; 

// Read raw POST data
$data = json_decode(file_get_contents("php://input"), true);

// ✅ Validate input
if (
    !isset($data['subject_name']) || empty(trim($data['subject_name'])) ||
    !isset($data['academicyear_id']) || empty($data['academicyear_id']) ||
    !isset($data['subjectstatus_id']) || empty($data['subjectstatus_id']) ||
    !isset($data['user_id']) || empty($data['user_id'])
) {
    echo json_encode([
        "success" => false,
        "message" => "Missing required fields."
    ]);
    exit;
}

try {
    // Prepare insert query
    $query = "INSERT INTO tbl_subjects (subject_name, status_id, academicyear_id, user_id) 
              VALUES (:subject_name, :status_id, :academicyear_id, :user_id)";
    $stmt = $conn->prepare($query);

    // Bind values
    $stmt->bindParam(':subject_name', $data['subject_name'], PDO::PARAM_STR);
    $stmt->bindParam(':status_id', $data['subjectstatus_id'], PDO::PARAM_INT);
    $stmt->bindParam(':academicyear_id', $data['academicyear_id'], PDO::PARAM_INT);
    $stmt->bindParam(':user_id', $data['user_id'], PDO::PARAM_INT);

    // Execute
    if ($stmt->execute()) {
        echo json_encode([
            "success" => true,
            "message" => "Subject added successfully."
        ]);
    } else {
        echo json_encode([
            "success" => false,
            "message" => "Failed to add subject."
        ]);
    }
} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => "Database error: " . $e->getMessage()
    ]);
}
?>
