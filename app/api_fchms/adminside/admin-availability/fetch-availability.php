<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

include '../../dbconnection.php';

try {
    $query = "SELECT 
                  saf.availabilityfaculty_id,
                  r.recurrence_name,
                  a.availability_name,
                  CONCAT(t.start_time, ' - ', t.end_time) AS time_range,
                  u.username,
                  st.status_name AS availableslot_status
              FROM tbl_setavailabilityfaculty saf
              INNER JOIN tbl_recurrence r 
                  ON saf.recurrence_id = r.recurrence_id
              INNER JOIN tbl_availabilityday a 
                  ON saf.availability_id = a.availability_id
              INNER JOIN tbl_timerange t 
                  ON saf.timerange_id = t.timerange_id
              INNER JOIN tbl_users u 
                  ON saf.user_id = u.user_id
              INNER JOIN tbl_status st
                  ON saf.availableslotstatus_id = st.status_id
              ORDER BY saf.availabilityfaculty_id DESC";

    $stmt = $conn->prepare($query);
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
