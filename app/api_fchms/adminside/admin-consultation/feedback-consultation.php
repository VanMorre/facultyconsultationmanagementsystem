<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

include '../../dbconnection.php';

try {
    $data = json_decode(file_get_contents("php://input"), true);

    if (!isset($data['schedulebookings_id']) || !isset($data['user_id']) || !isset($data['feedback_text'])) {
        echo json_encode([
            "success" => false,
            "message" => "Missing required fields"
        ]);
        exit;
    }

    $schedulebookings_id = intval($data['schedulebookings_id']);
    $user_id = intval($data['user_id']);
    $message = trim($data['feedback_text']); // ✅ align with frontend

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
} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => "Error: " . $e->getMessage()
    ]);
}
?>