<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

include '../../dbconnection.php';

try {
    // ✅ Validate booking_id
    if (!isset($_GET['booking_id']) || intval($_GET['booking_id']) <= 0) {
        echo json_encode([
            "success" => false,
            "message" => "Invalid booking_id."
        ]);
        exit;
    }

    $booking_id = intval($_GET['booking_id']);
    $params = [':booking_id' => $booking_id];

    $query = "
        SELECT 
            b.booking_id,
            b.student_id,
            s.student_name,
            f.user_id AS faculty_id,
            f.username AS faculty_name,
            f.fullname AS created_by,
            b.subject_name,
            b.purpose,
            b.booking_date,
            b.approval_date,
            CONCAT(tr.start_time, ' - ', tr.end_time) AS time_range,
            a.approval_name,
            sb.schedulebookings_id,
            COALESCE(fc.feedback_count, 0) AS feedback_count,
            fb.feedback_id,
            fu.fullname AS feedback_by,
            fb.created_at AS feedback_date,
            fb.message AS feedback_message
        FROM tbl_booking b
        JOIN tbl_students s ON b.student_id = s.student_id
        JOIN tbl_setavailabilityfaculty af ON b.availabilityfaculty_id = af.availabilityfaculty_id
        JOIN tbl_users f ON af.user_id = f.user_id   -- faculty
        JOIN tbl_timerange tr ON b.timerange_id = tr.timerange_id
        JOIN tbl_approval a ON b.approval_id = a.approval_id
        LEFT JOIN tbl_scheduledbookings sb ON b.booking_id = sb.booking_id
        LEFT JOIN (
            SELECT schedulebookings_id, COUNT(*) AS feedback_count
            FROM tbl_feedback
            GROUP BY schedulebookings_id
        ) fc ON sb.schedulebookings_id = fc.schedulebookings_id
        LEFT JOIN tbl_feedback fb ON sb.schedulebookings_id = fb.schedulebookings_id
        LEFT JOIN tbl_users fu ON fb.user_id = fu.user_id   -- feedback giver
        WHERE b.booking_id = :booking_id
        ORDER BY b.booking_date DESC
    ";

    $stmt = $conn->prepare($query);
    $stmt->execute($params);
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
