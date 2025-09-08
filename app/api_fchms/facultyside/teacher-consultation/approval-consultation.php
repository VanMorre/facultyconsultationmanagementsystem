<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

include '../../dbconnection.php';

try {
    $data = json_decode(file_get_contents("php://input"), true);

    if (!isset($data['schedulebookings_id']) || !isset($data['action'])) {
        echo json_encode([
            "success" => false,
            "message" => "Invalid request."
        ]);
        exit;
    }

    $schedulebookings_id = intval($data['schedulebookings_id']);
    $action = $data['action'];

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

    if ($current && in_array($current['approval_id'], [$approval_id])) { 
        echo json_encode([
            "success" => false,
            "message" => "Consultation is already marked as $action."
        ]);
        exit;
    }

    // 🔎 Step 2: Update
    $query = "UPDATE tbl_scheduledbookings 
              SET approval_id = :approval_id
              WHERE schedulebookings_id = :schedulebookings_id";

    $stmt = $conn->prepare($query);
    $stmt->bindParam(":approval_id", $approval_id, PDO::PARAM_INT);
    $stmt->bindParam(":schedulebookings_id", $schedulebookings_id, PDO::PARAM_INT);

    if ($stmt->execute()) {
        echo json_encode([
            "success" => true,
            "message" => "Consultation status updated to $action successfully."
        ]);
    } else {
        echo json_encode([
            "success" => false,
            "message" => "Failed to update consultation."
        ]);
    }
} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => "Database error: " . $e->getMessage()
    ]);
}
?>
