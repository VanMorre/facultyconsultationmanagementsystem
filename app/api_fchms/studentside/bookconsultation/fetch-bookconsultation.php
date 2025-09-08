<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

include '../../dbconnection.php';

try {
    $query = "
        SELECT 
            b.booking_id,
            b.student_id,
            s.student_name,
            f.username AS faculty_name,
            b.subject_name,
            b.purpose,
            b.booking_date,
            b.approval_date,
            CONCAT(tr.start_time, ' - ', tr.end_time) AS time_range,
            a.approval_name
        FROM tbl_booking b
        JOIN tbl_students s ON b.student_id = s.student_id
        JOIN tbl_setavailabilityfaculty af ON b.availabilityfaculty_id = af.availabilityfaculty_id
        JOIN tbl_users f ON af.user_id = f.user_id
        JOIN tbl_timerange tr ON b.timerange_id = tr.timerange_id
        JOIN tbl_approval a ON b.approval_id = a.approval_id
        WHERE 1=1
    ";

    $params = [];

    // ✅ If student_id is provided → filter student requests
    if (isset($_GET['student_id']) && intval($_GET['student_id']) > 0) {
        $query .= " AND b.student_id = :student_id";
        $params[':student_id'] = intval($_GET['student_id']);
    }

    // ✅ If user_id is provided → filter faculty requests
    if (isset($_GET['user_id']) && intval($_GET['user_id']) > 0) {
        $query .= " AND f.user_id = :user_id";
        $params[':user_id'] = intval($_GET['user_id']);
    }

    $query .= " ORDER BY b.booking_date DESC";

    $stmt = $conn->prepare($query);

    foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value, PDO::PARAM_INT);
    }

    $stmt->execute();
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true,
        "data" => $results
    ]);

} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => "Database error: " . $e->getMessage()
    ]);
}
?>
