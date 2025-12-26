<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

include '../../dbconnection.php';

// Read raw POST data
$data = json_decode(file_get_contents("php://input"), true);

// ✅ Validate input (removed subject_id and recurrence_id)
if (
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
    // ✅ Start transaction (so both inserts succeed together)
    $conn->beginTransaction();

    // Insert into tbl_setavailabilityfaculty
    $query = "INSERT INTO tbl_setavailabilityfaculty 
                (availability_id, timerange_id, user_id, availableslotstatus_id) 
              VALUES 
                (:availability_id, :timerange_id, :user_id, :availableslotstatus_id)";
    $stmt = $conn->prepare($query);

    $stmt->bindParam(':availability_id', $data['availability_id'], PDO::PARAM_INT);
    $stmt->bindParam(':timerange_id', $data['timerange_id'], PDO::PARAM_INT);
    $stmt->bindParam(':user_id', $data['user_id'], PDO::PARAM_INT);
    $stmt->bindParam(':availableslotstatus_id', $data['availableslotstatus_id'], PDO::PARAM_INT);

    if ($stmt->execute()) {
        // ✅ Insert activity log
        $logQuery = "INSERT INTO tbl_activitylogs (user_id, activity_type, action, activity_time)
                     VALUES (:user_id, :activity_type, :action, NOW())";
        $logStmt = $conn->prepare($logQuery);

        $activityType = "Add-Availabilityschedule"; // you can change this if you want
        $action = "Set faculty availability (Availability: {$data['availability_id']}, TimeRange: {$data['timerange_id']})";

        $logStmt->bindParam(':user_id', $data['user_id'], PDO::PARAM_INT);
        $logStmt->bindParam(':activity_type', $activityType, PDO::PARAM_STR);
        $logStmt->bindParam(':action', $action, PDO::PARAM_STR);

        $logStmt->execute();

        // Commit transaction
        $conn->commit();

        echo json_encode([
            "success" => true,
            "message" => "Availability set successfully and activity logged."
        ]);
    } else {
        $conn->rollBack();
        echo json_encode([
            "success" => false,
            "message" => "Failed to set availability."
        ]);
    }
} catch (PDOException $e) {
    $conn->rollBack();
    echo json_encode([
        "success" => false,
        "message" => "Database error: " . $e->getMessage()
    ]);
}
?>
