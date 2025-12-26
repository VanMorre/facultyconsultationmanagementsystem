<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

include '../../dbconnection.php';

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['availabilityfaculty_id']) || !isset($data['timerange_id'])) {
    echo json_encode([
        "success" => false,
        "message" => "Missing required fields."
    ]);
    exit;
}

$availabilityfaculty_id = intval($data['availabilityfaculty_id']);
$timerange_id = intval($data['timerange_id']);

try {
    $query = "INSERT INTO tbl_setavailabilityfaculty 
                (availability_id, timerange_id, availableslotstatus_id, user_id)
              SELECT availability_id, :timerange_id, availableslotstatus_id, user_id
              FROM tbl_setavailabilityfaculty
              WHERE availabilityfaculty_id = :availabilityfaculty_id
              LIMIT 1";

    $stmt = $conn->prepare($query);
    $stmt->bindParam(':timerange_id', $timerange_id, PDO::PARAM_INT);
    $stmt->bindParam(':availabilityfaculty_id', $availabilityfaculty_id, PDO::PARAM_INT);

    if ($stmt->execute()) {
        $newId = $conn->lastInsertId(); // ✅ return the new inserted slot id

        echo json_encode([
            "success" => true,
            "message" => "New slot added successfully.",
            "new_id" => $newId
        ]);
    } else {
        echo json_encode([
            "success" => false,
            "message" => "Failed to add slot."
        ]);
    }
} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => "Database error: " . $e->getMessage()
    ]);
}
