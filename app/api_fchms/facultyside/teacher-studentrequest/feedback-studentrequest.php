<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

include '../../dbconnection.php';

try {
    $data = json_decode(file_get_contents("php://input"), true);

    if (!isset($data['booking_id']) || !isset($data['user_id']) || !isset($data['feedback_text'])) {
        echo json_encode([
            "success" => false,
            "message" => "Missing required fields"
        ]);
        exit;
    }

    $booking_id = intval($data['booking_id']);
    $user_id = intval($data['user_id']);
    $message = trim($data['feedback_text']);

    // Check if booking exists and get schedulebookings_id if available
    $checkQuery = "SELECT sb.schedulebookings_id 
                   FROM tbl_booking b
                   LEFT JOIN tbl_scheduledbookings sb ON b.booking_id = sb.booking_id
                   WHERE b.booking_id = :booking_id
                   LIMIT 1";
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

    // If schedulebookings_id exists, use it; otherwise, we'll need to handle feedback differently
    if ($booking['schedulebookings_id']) {
        $schedulebookings_id = intval($booking['schedulebookings_id']);
        
        // Check if feedback already exists for this user and schedulebookings_id
        $checkFeedbackQuery = "SELECT feedback_id FROM tbl_feedback 
                               WHERE schedulebookings_id = :schedulebookings_id 
                               AND user_id = :user_id
                               LIMIT 1";
        $checkFeedbackStmt = $conn->prepare($checkFeedbackQuery);
        $checkFeedbackStmt->bindParam(':schedulebookings_id', $schedulebookings_id, PDO::PARAM_INT);
        $checkFeedbackStmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
        $checkFeedbackStmt->execute();
        $existingFeedback = $checkFeedbackStmt->fetch(PDO::FETCH_ASSOC);

        if ($existingFeedback) {
            echo json_encode([
                "success" => false,
                "message" => "You have already submitted feedback for this booking. Feedback can only be submitted once."
            ]);
            exit;
        }
        
        $stmt = $conn->prepare("INSERT INTO tbl_feedback (schedulebookings_id, user_id, message) VALUES (:schedulebookings_id, :user_id, :message)");
        $stmt->bindParam(":schedulebookings_id", $schedulebookings_id, PDO::PARAM_INT);
        $stmt->bindParam(":user_id", $user_id, PDO::PARAM_INT);
        $stmt->bindParam(":message", $message, PDO::PARAM_STR);

        if ($stmt->execute()) {
            echo json_encode([
                "success" => true,
                "message" => "Feedback submitted successfully!"
            ]);
        } else {
            echo json_encode([
                "success" => false,
                "message" => "Failed to submit feedback"
            ]);
        }
    } else {
        // If no schedulebookings_id exists, you might want to create one first
        // or use a different feedback mechanism for bookings
        echo json_encode([
            "success" => false,
            "message" => "Cannot submit feedback: No scheduled booking found for this booking ID. A booking must be scheduled first."
        ]);
    }
} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => "Error: " . $e->getMessage()
    ]);
}
?>

