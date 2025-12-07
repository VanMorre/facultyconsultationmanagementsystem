<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

include '../../dbconnection.php';

try {
    $data = json_decode(file_get_contents("php://input"), true);

    // ✅ Require booking_id, action, and user_id
    if (!isset($data['booking_id']) || !isset($data['action']) || !isset($data['user_id'])) {
        echo json_encode([
            "success" => false,
            "message" => "Invalid request. Missing required fields."
        ]);
        exit;
    }

    $booking_id = intval($data['booking_id']);
    $action = trim($data['action']);
    $userId = intval($data['user_id']); // ✅ Who performed the action

    // ✅ approval_id mapping (adjust according to tbl_approval values)
    $approval_id = null;
    if ($action === "Approve") {
        $approval_id = 1;
    } elseif ($action === "Disapprove") {
        $approval_id = 2;
    } elseif ($action === "Cancelled") {
        $approval_id = 38;
    }

    if ($approval_id === null) {
        echo json_encode([
            "success" => false,
            "message" => "Invalid action."
        ]);
        exit;
    }

    // 🔎 Step 1: Check current status
    $checkQuery = "SELECT approval_id FROM tbl_booking WHERE booking_id = :booking_id";
    $checkStmt = $conn->prepare($checkQuery);
    $checkStmt->bindParam(":booking_id", $booking_id, PDO::PARAM_INT);
    $checkStmt->execute();
    $current = $checkStmt->fetch(PDO::FETCH_ASSOC);

    if ($current && in_array($current['approval_id'], [1, 2])) {
        echo json_encode([
            "success" => false,
            "message" => "Booking already finalized. No changes allowed."
        ]);
        exit;
    }

    // ✅ Step 2: Start transaction
    $conn->beginTransaction();

    // ✅ Step 3: Update booking
    $query = "UPDATE tbl_booking 
              SET approval_id = :approval_id, approval_date = NOW()
              WHERE booking_id = :booking_id";

    $stmt = $conn->prepare($query);
    $stmt->bindParam(":approval_id", $approval_id, PDO::PARAM_INT);
    $stmt->bindParam(":booking_id", $booking_id, PDO::PARAM_INT);

    if ($stmt->execute()) {
        // ✅ Step 4: Insert into activity logs
        $logQuery = "INSERT INTO tbl_activitylogs (user_id, activity_type, action, activity_time)
                     VALUES (:user_id, :activity_type, :action, NOW())";
        $logStmt = $conn->prepare($logQuery);

        $activityType = "Booking Approval";
        $logAction = "Updated booking (ID: {$booking_id}) to status: {$action}";

        $logStmt->execute([
            ':user_id' => $userId,
            ':activity_type' => $activityType,
            ':action' => $logAction
        ]);

        $conn->commit();

        echo json_encode([
            "success" => true,
            "message" => "Booking updated successfully and activity logged."
        ]);
    } else {
        $conn->rollBack();
        echo json_encode([
            "success" => false,
            "message" => "Failed to update booking."
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
