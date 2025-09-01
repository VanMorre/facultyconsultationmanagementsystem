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
    !isset($data['subject_id']) || empty($data['subject_id']) ||
    !isset($data['recurrence_id']) || empty($data['recurrence_id']) ||
    !isset($data['availability_id']) || empty($data['availability_id']) ||
    !isset($data['timerange_id']) || empty($data['timerange_id']) ||
    !isset($data['user_id']) || empty($data['user_id']) ||
    !isset($data['availableslotstatus_id']) || empty($data['availableslotstatus_id'])
) {
    echo json_encode([
        "success" => false,
        "message" => "Missing required fields."
    ]);
    exit;
}

try {
    $query = "INSERT INTO tbl_setavailabilityfaculty 
                (subject_id, recurrence_id, availability_id, timerange_id, user_id, availableslotstatus_id) 
              VALUES 
                (:subject_id, :recurrence_id, :availability_id, :timerange_id, :user_id, :availableslotstatus_id)";
    $stmt = $conn->prepare($query);

    // Bind values
    $stmt->bindParam(':subject_id', $data['subject_id'], PDO::PARAM_INT);
    $stmt->bindParam(':recurrence_id', $data['recurrence_id'], PDO::PARAM_INT);
    $stmt->bindParam(':availability_id', $data['availability_id'], PDO::PARAM_INT);
    $stmt->bindParam(':timerange_id', $data['timerange_id'], PDO::PARAM_INT);
    $stmt->bindParam(':user_id', $data['user_id'], PDO::PARAM_INT);
    $stmt->bindParam(':availableslotstatus_id', $data['availableslotstatus_id'], PDO::PARAM_INT);

    if ($stmt->execute()) {
        echo json_encode([
            "success" => true,
            "message" => "Availability set successfully."
        ]);
    } else {
        echo json_encode([
            "success" => false,
            "message" => "Failed to set availability."
        ]);
    }
} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => "Database error: " . $e->getMessage()
    ]);
}
?>
