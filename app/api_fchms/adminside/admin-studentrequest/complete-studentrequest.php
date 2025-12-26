<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

include '../../dbconnection.php';

try {
    $data = json_decode(file_get_contents("php://input"), true);

    if (!isset($data['booking_id']) || !isset($data['user_id']) || !isset($data['discussion']) || !isset($data['recommendation'])) {
        echo json_encode([
            "success" => false,
            "message" => "Missing required fields"
        ]);
        exit;
    }

    $booking_id = intval($data['booking_id']);
    $user_id = intval($data['user_id']);
    $discussion = trim($data['discussion']);
    $recommendation = trim($data['recommendation']);

    // Check if booking exists
    $checkQuery = "SELECT approval_id FROM tbl_booking WHERE booking_id = :booking_id";
    $checkStmt = $conn->prepare($checkQuery);
    $checkStmt->bindParam(':booking_id', $booking_id, PDO::PARAM_INT);
    $checkStmt->execute();
    $booking = $checkStmt->fetch(PDO::FETCH_ASSOC);

    if (!$booking) {
        echo json_encode([
            "success" => false,
            "message" => "Booking not found."
        ]);
        exit;
    }

    // Check if already completed
    if ($booking['approval_id'] == 7) {
        echo json_encode([
            "success" => false,
            "message" => "Booking is already completed."
        ]);
        exit;
    }

    // Start transaction
    $conn->beginTransaction();

    // Check if scheduledbooking exists, if not create it
    $checkScheduleQuery = "SELECT schedulebookings_id FROM tbl_scheduledbookings WHERE booking_id = :booking_id";
    $checkScheduleStmt = $conn->prepare($checkScheduleQuery);
    $checkScheduleStmt->bindParam(':booking_id', $booking_id, PDO::PARAM_INT);
    $checkScheduleStmt->execute();
    $schedule = $checkScheduleStmt->fetch(PDO::FETCH_ASSOC);

    if ($schedule) {
        // Update existing scheduledbooking with discussion and recommendation only
        $updateScheduleQuery = "UPDATE tbl_scheduledbookings 
                                SET discussion = :discussion, 
                                    recommendation = :recommendation,
                                    user_id = :user_id
                                WHERE schedulebookings_id = :schedulebookings_id";
        $updateStmt = $conn->prepare($updateScheduleQuery);
        $updateStmt->bindParam(':discussion', $discussion, PDO::PARAM_STR);
        $updateStmt->bindParam(':recommendation', $recommendation, PDO::PARAM_STR);
        $updateStmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
        $updateStmt->bindParam(':schedulebookings_id', $schedule['schedulebookings_id'], PDO::PARAM_INT);
        $updateStmt->execute();
    } else {
        // Create new scheduledbooking entry (without approval_id)
        $insertScheduleQuery = "INSERT INTO tbl_scheduledbookings (booking_id, discussion, recommendation, user_id) 
                                VALUES (:booking_id, :discussion, :recommendation, :user_id)";
        $insertStmt = $conn->prepare($insertScheduleQuery);
        $insertStmt->bindParam(':booking_id', $booking_id, PDO::PARAM_INT);
        $insertStmt->bindParam(':discussion', $discussion, PDO::PARAM_STR);
        $insertStmt->bindParam(':recommendation', $recommendation, PDO::PARAM_STR);
        $insertStmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
        $insertStmt->execute();
    }

    // Update booking to Completed (approval_id = 7) and set approval_date
    $updateBookingQuery = "UPDATE tbl_booking 
                           SET approval_id = 7, approval_date = NOW()
                           WHERE booking_id = :booking_id";
    $updateBookingStmt = $conn->prepare($updateBookingQuery);
    $updateBookingStmt->bindParam(':booking_id', $booking_id, PDO::PARAM_INT);
    $updateBookingStmt->execute();

    // Insert into activity logs
    $logQuery = "INSERT INTO tbl_activitylogs (user_id, activity_type, action, activity_time)
                 VALUES (:user_id, :activity_type, :action, NOW())";
    $logStmt = $conn->prepare($logQuery);
    $activityType = "Booking Completion";
    $logAction = "Completed booking (ID: {$booking_id}) with discussion and recommendation";
    $logStmt->execute([
        ':user_id' => $user_id,
        ':activity_type' => $activityType,
        ':action' => $logAction
    ]);

    $conn->commit();

    echo json_encode([
        "success" => true,
        "message" => "Booking completed successfully!"
    ]);
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

