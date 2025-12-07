<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

include '../../dbconnection.php';

try {
    $data = json_decode(file_get_contents("php://input"), true);

    if (!isset($data['schedulebookings_id']) || !isset($data['action']) || !isset($data['user_id'])) {
        echo json_encode([
            "success" => false,
            "message" => "Invalid request."
        ]);
        exit;
    }

    $schedulebookings_id = intval($data['schedulebookings_id']);
    $action = $data['action'];
    $userId = intval($data['user_id']); // ✅ who performed the action

    // ✅ approval_id mapping (adjust to match tbl_approval values)
    $approval_id = null;
    if ($action === "Completed") {
        $approval_id = 7;
    } elseif ($action === "Scheduled") {
        $approval_id = 6;
    } elseif ($action === "Cancelled") {
        $approval_id = 8;
    }

    if ($approval_id === null) {
        echo json_encode([
            "success" => false,
            "message" => "Invalid action."
        ]);
        exit;
    }

    // 🔎 Step 1: Check current status
    $checkQuery = "SELECT approval_id FROM tbl_scheduledbookings WHERE schedulebookings_id = :schedulebookings_id";
    $checkStmt = $conn->prepare($checkQuery);
    $checkStmt->bindParam(":schedulebookings_id", $schedulebookings_id, PDO::PARAM_INT);
    $checkStmt->execute();
    $current = $checkStmt->fetch(PDO::FETCH_ASSOC);

    if ($current && $current['approval_id'] == $approval_id) { 
        echo json_encode([
            "success" => false,
            "message" => "Consultation is already marked as $action."
        ]);
        exit;
    }

    // ✅ Start transaction
    $conn->beginTransaction();

    // 🔎 Step 2: Update status
    $query = "UPDATE tbl_scheduledbookings 
              SET approval_id = :approval_id
              WHERE schedulebookings_id = :schedulebookings_id";

    $stmt = $conn->prepare($query);
    $stmt->bindParam(":approval_id", $approval_id, PDO::PARAM_INT);
    $stmt->bindParam(":schedulebookings_id", $schedulebookings_id, PDO::PARAM_INT);

    if ($stmt->execute()) {
        // ✅ Step 3: Insert into activity logs
        $logQuery = "INSERT INTO tbl_activitylogs (user_id, activity_type, action, activity_time)
                     VALUES (:user_id, :activity_type, :action, NOW())";
        $logStmt = $conn->prepare($logQuery);

        $activityType = "Consultation Status Update";
        $logAction = "Updated consultation (ID: {$schedulebookings_id}) to status: {$action}";

        $logStmt->execute([
            ':user_id' => $userId,
            ':activity_type' => $activityType,
            ':action' => $logAction
        ]);

        $conn->commit();

        echo json_encode([
            "success" => true,
            "message" => "Consultation status updated to $action successfully and activity logged."
        ]);
    } else {
        $conn->rollBack();
        echo json_encode([
            "success" => false,
            "message" => "Failed to update consultation."
        ]);
    }
} catch (PDOException $e) {
    if ($conn->inTransaction()) {
        $conn->rollBack();
    }
    echo json_encode([
        "success" => false,
        "message" => "Database error: " . $e->getMessage()
    ]);
}
?>
