<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

include '../../dbconnection.php';

$data = json_decode(file_get_contents("php://input"), true);

// Extract payload
$bookings = isset($data['students']) && is_array($data['students']) ? $data['students'] : []; // ✅ actually booking_ids
$consultationDate = !empty($data['consultation_date']) ? date('Y-m-d', strtotime($data['consultation_date'])) : null;
$timerangeId = isset($data['timerange_id']) ? (int)$data['timerange_id'] : null;
$approvalId = isset($data['approval_id']) ? (int)$data['approval_id'] : null;
$userId = isset($data['user_id']) ? (int)$data['user_id'] : null;

// Validate required fields
if (empty($bookings) || !$consultationDate || !$timerangeId || !$approvalId || !$userId) {
    echo json_encode([
        "success" => false,
        "message" => "Missing required fields."
    ]);
    exit;
}

try {
    $conn->beginTransaction();

    $query = "INSERT INTO tbl_scheduledbookings 
                 (booking_id, schedulebookdate, timerange_id, approval_id, user_id) 
              VALUES 
                 (:booking_id, :schedulebookdate, :timerange_id, :approval_id, :user_id)";
    $stmt = $conn->prepare($query);

    foreach ($bookings as $bookingId) {
        // 🔎 Prevent duplicates (same booking, same date, same time)
        $checkQuery = "SELECT COUNT(*) FROM tbl_scheduledbookings 
                       WHERE booking_id = :booking_id 
                       AND schedulebookdate = :schedulebookdate 
                       AND timerange_id = :timerange_id";
        $checkStmt = $conn->prepare($checkQuery);
        $checkStmt->execute([
            ':booking_id' => $bookingId,
            ':schedulebookdate' => $consultationDate,
            ':timerange_id' => $timerangeId
        ]);

        if ($checkStmt->fetchColumn() > 0) {
            continue; // skip if already scheduled
        }

        $stmt->execute([
            ':booking_id' => $bookingId,   // ✅ booking_id from tbl_booking
            ':schedulebookdate' => $consultationDate,
            ':timerange_id' => $timerangeId,
            ':approval_id' => $approvalId,
            ':user_id' => $userId
        ]);
    }

    $conn->commit();

    echo json_encode([
        "success" => true,
        "message" => "Consultation scheduled successfully."
    ]);
} catch (PDOException $e) {
    $conn->rollBack();
    echo json_encode([
        "success" => false,
        "message" => "Database error: " . $e->getMessage()
    ]);
}
?>
