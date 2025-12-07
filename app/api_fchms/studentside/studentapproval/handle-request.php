<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

include '../../dbconnection.php';

try {
    $data = json_decode(file_get_contents("php://input"), true);

    if (!isset($data['booking_id']) || !isset($data['action'])) {
        echo json_encode([
            "success" => false,
            "message" => "Invalid request."
        ]);
        exit;
    }

    $booking_id = intval($data['booking_id']);
    $action = $data['action'];

    // ✅ approval_id mapping (adjust based on your tbl_approval values)
    $approval_id = null;
    if ($action === "Cancelled") {
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
    $checkQuery = "SELECT approval_id FROM tbl_booking WHERE booking_id = :booking_id";
    $checkStmt = $conn->prepare($checkQuery);
    $checkStmt->bindParam(":booking_id", $booking_id, PDO::PARAM_INT);
    $checkStmt->execute();
    $current = $checkStmt->fetch(PDO::FETCH_ASSOC);

    if ($current && in_array($current['approval_id'], [1, 2, 3])) {
        echo json_encode([
            "success" => false,
            "message" => "Booking already finalized. No changes allowed."
        ]);
        exit;
    }

    // 🔎 Step 2: Proceed with update if still pending
    $query = "UPDATE tbl_booking 
              SET approval_id = :approval_id, approval_date = NOW()
              WHERE booking_id = :booking_id";

    $stmt = $conn->prepare($query);
    $stmt->bindParam(":approval_id", $approval_id, PDO::PARAM_INT);
    $stmt->bindParam(":booking_id", $booking_id, PDO::PARAM_INT);

    if ($stmt->execute()) {
        echo json_encode([
            "success" => true,
            "message" => "Booking updated successfully."
        ]);
    } else {
        echo json_encode([
            "success" => false,
            "message" => "Failed to update booking."
        ]);
    }
} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => "Database error: " . $e->getMessage()
    ]);
}
