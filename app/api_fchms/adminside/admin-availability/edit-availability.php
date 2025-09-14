<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

include '../../dbconnection.php';

$data = json_decode(file_get_contents("php://input"), true);


if (
    !isset($data['availabilityfaculty_id']) || empty($data['availabilityfaculty_id']) ||
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
    $query = "UPDATE tbl_setavailabilityfaculty 
              SET recurrence_id = :recurrence_id,
                  availability_id = :availability_id,
                  timerange_id = :timerange_id,
                  user_id = :user_id,
                  availableslotstatus_id = :availableslotstatus_id
              WHERE availabilityfaculty_id = :id";
    $stmt = $conn->prepare($query);

    $stmt->bindParam(':id', $data['availabilityfaculty_id'], PDO::PARAM_INT);
    $stmt->bindParam(':recurrence_id', $data['recurrence_id'], PDO::PARAM_INT);
    $stmt->bindParam(':availability_id', $data['availability_id'], PDO::PARAM_INT);
    $stmt->bindParam(':timerange_id', $data['timerange_id'], PDO::PARAM_INT);
    $stmt->bindParam(':user_id', $data['user_id'], PDO::PARAM_INT);
    $stmt->bindParam(':availableslotstatus_id', $data['availableslotstatus_id'], PDO::PARAM_INT);

    if ($stmt->execute()) {
        echo json_encode([
            "success" => true,
            "message" => "Availability updated successfully."
        ]);
    } else {
        echo json_encode([
            "success" => false,
            "message" => "Failed to update availability."
        ]);
    }
} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => "Database error: " . $e->getMessage()
    ]);
}
?>
