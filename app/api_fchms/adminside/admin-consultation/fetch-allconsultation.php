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
        c.course_name,
        y.year_name,
        f.username AS faculty_name,
        b.subject_name,
        b.purpose,
        b.booking_date,
        b.approval_date,
        CONCAT(tr.start_time, ' - ', tr.end_time) AS time_range,
        a.approval_name,
        sb.schedulebookings_id,
        sb.discussion,
        sb.recommendation,
        COALESCE(fc.feedback_count, 0) AS feedback_count
    FROM tbl_booking b
    JOIN tbl_students s ON b.student_id = s.student_id
    LEFT JOIN tbl_course c ON s.course_id = c.course_id
    LEFT JOIN tbl_yearlevel y ON s.year_id = y.year_id
    JOIN tbl_setavailabilityfaculty af ON b.availabilityfaculty_id = af.availabilityfaculty_id
    JOIN tbl_users f ON af.user_id = f.user_id
    JOIN tbl_timerange tr ON b.timerange_id = tr.timerange_id
    JOIN tbl_approval a ON b.approval_id = a.approval_id
    LEFT JOIN tbl_scheduledbookings sb ON b.booking_id = sb.booking_id
    LEFT JOIN (
        SELECT schedulebookings_id, COUNT(*) AS feedback_count
        FROM tbl_feedback
        GROUP BY schedulebookings_id
    ) fc ON sb.schedulebookings_id = fc.schedulebookings_id
    WHERE 1=1
";


    $query .= " ORDER BY b.booking_date DESC";

    $stmt = $conn->prepare($query);
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
