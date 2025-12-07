<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

include '../../dbconnection.php';

// ✅ Ensure user_id is provided and valid
if (!isset($_GET['user_id']) || intval($_GET['user_id']) <= 0) {
    echo json_encode([
        "success" => true,
        "data" => [] // return empty data if no valid user_id
    ]);
    exit;
}

$user_id = intval($_GET['user_id']);

try {
    $query = "
        SELECT 
            sb.schedulebookings_id,
            sb.booking_id,
            sb.discussion,
            sb.recommendation,
            a.approval_id,
            a.approval_name,
            u.user_id,
            b.subject_name,
            b.purpose,
            b.booking_date,
            COALESCE(CONCAT(tr.start_time, ' - ', tr.end_time), '') AS time_range,
            u.fullname AS created_by,
            s.student_id,
            s.student_name,
            c.course_name,
            y.year_name
        FROM tbl_scheduledbookings sb
        INNER JOIN tbl_booking b ON sb.booking_id = b.booking_id
        INNER JOIN tbl_students s ON b.student_id = s.student_id
        LEFT JOIN tbl_course c ON s.course_id = c.course_id
        LEFT JOIN tbl_yearlevel y ON s.year_id = y.year_id
        LEFT JOIN tbl_timerange tr ON b.timerange_id = tr.timerange_id
        INNER JOIN tbl_approval a ON sb.approval_id = a.approval_id
        INNER JOIN tbl_users u ON sb.user_id = u.user_id
        WHERE sb.user_id = :user_id
        ORDER BY sb.schedulebookings_id DESC
    ";

    $stmt = $conn->prepare($query);
    $stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
    $stmt->execute();
    $consultations = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true,
        "data" => $consultations
    ]);
} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => "Database error: " . $e->getMessage()
    ]);
}
?>
