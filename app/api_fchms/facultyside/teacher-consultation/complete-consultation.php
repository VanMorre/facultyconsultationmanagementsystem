<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

include '../../dbconnection.php';

try {
    $data = json_decode(file_get_contents("php://input"), true);

    if (!isset($data['schedulebookings_id']) || !isset($data['discussion']) || !isset($data['recommendation']) || !isset($data['user_id'])) {
        echo json_encode([
            "success" => false,
            "message" => "Missing required fields."
        ]);
        exit;
    }

    $schedulebookings_id = intval($data['schedulebookings_id']);
    $discussion = trim($data['discussion']);
    $recommendation = trim($data['recommendation']);
    $userId = intval($data['user_id']);
    $approval_id = 7; // Completed status

    // Validate that fields are not empty
    if (empty($discussion) || empty($recommendation)) {
        echo json_encode([
            "success" => false,
            "message" => "Discussion and Recommendation fields are required."
        ]);
        exit;
    }

    // ✅ Start transaction
    $conn->beginTransaction();

    // Update consultation with discussion, recommendation, and set to Completed
    $updateQuery = "UPDATE tbl_scheduledbookings 
                    SET discussion = :discussion, 
                        recommendation = :recommendation, 
                        approval_id = :approval_id
                    WHERE schedulebookings_id = :schedulebookings_id";
    
    $updateStmt = $conn->prepare($updateQuery);
    $updateStmt->bindParam(':discussion', $discussion, PDO::PARAM_STR);
    $updateStmt->bindParam(':recommendation', $recommendation, PDO::PARAM_STR);
    $updateStmt->bindParam(':approval_id', $approval_id, PDO::PARAM_INT);
    $updateStmt->bindParam(':schedulebookings_id', $schedulebookings_id, PDO::PARAM_INT);
    
    if ($updateStmt->execute()) {
        // ✅ Insert into activity logs
        $logQuery = "INSERT INTO tbl_activitylogs (user_id, activity_type, action, activity_time)
                     VALUES (:user_id, :activity_type, :action, NOW())";
        $logStmt = $conn->prepare($logQuery);

        $activityType = "Consultation Completion";
        $action = "Completed consultation (ScheduleBooking ID: {$schedulebookings_id}) with discussion and recommendations";

        $logStmt->execute([
            ':user_id' => $userId,
            ':activity_type' => $activityType,
            ':action' => $action
        ]);

        $conn->commit();

        echo json_encode([
            "success" => true,
            "message" => "Consultation completed successfully."
        ]);
    } else {
        $conn->rollBack();
        echo json_encode([
            "success" => false,
            "message" => "Failed to update consultation."
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

