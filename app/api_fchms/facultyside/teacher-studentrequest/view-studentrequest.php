<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

include '../../dbconnection.php';

if (!isset($_GET['booking_id']) || intval($_GET['booking_id']) <= 0) {
    echo json_encode([
        "success" => false,
        "message" => "Invalid booking_id."
    ]);
    exit;
}

$booking_id = intval($_GET['booking_id']);

try {
    $query = "
        SELECT 
            b.booking_id,
            b.student_id,
            s.student_name,
            c.course_name,
            y.year_name,
            f.user_id AS faculty_id,
            f.username AS faculty_name,
            f.fullname AS faculty_fullname,
            b.subject_name,
            b.purpose,
            b.booking_date,
            b.approval_date,
            CONCAT(tr.start_time, ' - ', tr.end_time) AS time_range,
            a.approval_name,
            a.approval_id,
            sb.discussion,
            sb.recommendation
        FROM tbl_booking b
        INNER JOIN tbl_students s ON b.student_id = s.student_id
        LEFT JOIN tbl_course c ON s.course_id = c.course_id
        LEFT JOIN tbl_yearlevel y ON s.year_id = y.year_id
        INNER JOIN tbl_setavailabilityfaculty af ON b.availabilityfaculty_id = af.availabilityfaculty_id
        INNER JOIN tbl_users f ON af.user_id = f.user_id
        INNER JOIN tbl_timerange tr ON b.timerange_id = tr.timerange_id
        INNER JOIN tbl_approval a ON b.approval_id = a.approval_id
        LEFT JOIN tbl_scheduledbookings sb ON b.booking_id = sb.booking_id
        WHERE b.booking_id = :booking_id
        LIMIT 1
    ";

    $stmt = $conn->prepare($query);
    $stmt->bindParam(':booking_id', $booking_id, PDO::PARAM_INT);
    $stmt->execute();
    $booking = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($booking) {
        echo json_encode([
            "success" => true,
            "data" => $booking
        ]);
    } else {
        echo json_encode([
            "success" => false,
            "message" => "Booking not found."
        ]);
    }
} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => "Database error: " . $e->getMessage()
    ]);
}
?>

