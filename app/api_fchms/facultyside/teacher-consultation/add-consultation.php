<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

include '../../dbconnection.php';

$data = json_decode(file_get_contents("php://input"), true);

// Extract payload
$bookings = isset($data['students']) && is_array($data['students']) ? $data['students'] : []; // ✅ booking_ids
$approvalId = isset($data['approval_id']) ? (int)$data['approval_id'] : null;
$userId = isset($data['user_id']) ? (int)$data['user_id'] : null;

// Validate required fields
if (empty($bookings) || !$approvalId || !$userId) {
    echo json_encode([
        "success" => false,
        "message" => "Missing required fields."
    ]);
    exit;
}

try {
    $conn->beginTransaction();

    $query = "INSERT INTO tbl_scheduledbookings 
                 (booking_id, approval_id, user_id) 
              VALUES 
                 (:booking_id, :approval_id, :user_id)";
    $stmt = $conn->prepare($query);

    foreach ($bookings as $bookingId) {
        // 🔎 Prevent duplicates (check if booking already scheduled)
        $checkQuery = "SELECT COUNT(*) FROM tbl_scheduledbookings 
                       WHERE booking_id = :booking_id";
        $checkStmt = $conn->prepare($checkQuery);
        $checkStmt->execute([
            ':booking_id' => $bookingId
        ]);

        if ($checkStmt->fetchColumn() > 0) {
            continue; // skip if already scheduled
        }

        $stmt->execute([
            ':booking_id' => $bookingId,
            ':approval_id' => $approvalId,
            ':user_id' => $userId
        ]);

        // ✅ Insert into activity logs for each scheduled booking
        $logQuery = "INSERT INTO tbl_activitylogs (user_id, activity_type, action, activity_time)
                     VALUES (:user_id, :activity_type, :action, NOW())";
        $logStmt = $conn->prepare($logQuery);

        $activityType = "Consultation Scheduling";
        $action = "Scheduled consultation (Booking ID: {$bookingId})";

        $logStmt->execute([
            ':user_id' => $userId,
            ':activity_type' => $activityType,
            ':action' => $action
        ]);
    }

    $conn->commit();

    echo json_encode([
        "success" => true,
        "message" => "Consultation scheduled successfully and activities logged."
    ]);
} catch (PDOException $e) {
    $conn->rollBack();
    echo json_encode([
        "success" => false,
        "message" => "Database error: " . $e->getMessage()
    ]);
}
?>
