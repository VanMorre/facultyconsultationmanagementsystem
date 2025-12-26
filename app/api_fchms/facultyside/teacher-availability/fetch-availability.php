<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

include '../../dbconnection.php';

// Ensure user_id is provided and valid
if (!isset($_GET['user_id']) || intval($_GET['user_id']) <= 0) {
    echo json_encode([
        "success" => true,
        "data" => [] // return empty data if no valid user_id
    ]);
    exit;
}   

$user_id = intval($_GET['user_id']);

try {
    $query = "SELECT 
                  saf.availabilityfaculty_id,
                  saf.user_id,
                  a.availability_name,
                  CONCAT(t.start_time, ' - ', t.end_time) AS time_range,
                  u.username,
                  st.status_name AS availableslot_status
              FROM tbl_setavailabilityfaculty saf
              INNER JOIN tbl_availabilityday a ON saf.availability_id = a.availability_id
              INNER JOIN tbl_timerange t ON saf.timerange_id = t.timerange_id
              INNER JOIN tbl_users u ON saf.user_id = u.user_id
              INNER JOIN tbl_status st ON saf.availableslotstatus_id = st.status_id
              WHERE saf.user_id = :user_id
              ORDER BY saf.availabilityfaculty_id DESC";

    $stmt = $conn->prepare($query);
    $stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
    $stmt->execute();

    $availability = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true,
        "data" => $availability
    ]);
} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => "Database error: " . $e->getMessage()
    ]);
}
?>
