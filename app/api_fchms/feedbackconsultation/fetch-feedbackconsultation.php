<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

include '../dbconnection.php';

try {
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
        sb.schedulebookings_id,
        sb.booking_id,
        sb.schedulebookdate,
        GROUP_CONCAT(
            CONCAT(tr.start_time, ' - ', tr.end_time)
            ORDER BY tr.start_time ASC SEPARATOR ', '
        ) AS timeranges,
        a.approval_id,
        a.approval_name,
        u.user_id AS faculty_id,
        u.fullname AS created_by,
        b.subject_name,
        b.purpose,
        s.student_id,
        s.student_name,
        f.feedback_id,
        f.message AS feedback_message,
        fu.fullname AS feedback_by,
        f.created_at AS feedback_date,
        COALESCE(fc.feedback_count, 0) AS feedback_count
    FROM tbl_scheduledbookings sb
    INNER JOIN tbl_booking b ON sb.booking_id = b.booking_id
    INNER JOIN tbl_students s ON b.student_id = s.student_id
    INNER JOIN tbl_timerange tr ON sb.timerange_id = tr.timerange_id
    INNER JOIN tbl_approval a ON sb.approval_id = a.approval_id
    INNER JOIN tbl_users u ON sb.user_id = u.user_id
    LEFT JOIN tbl_feedback f ON sb.schedulebookings_id = f.schedulebookings_id
    LEFT JOIN tbl_users fu ON f.user_id = fu.user_id
    LEFT JOIN (
        SELECT schedulebookings_id, COUNT(*) AS feedback_count
        FROM tbl_feedback
        GROUP BY schedulebookings_id
    ) fc ON sb.schedulebookings_id = fc.schedulebookings_id
    WHERE sb.booking_id = :booking_id
";

    if (isset($_GET['student_id']) && intval($_GET['student_id']) > 0) {
        $query .= " AND s.student_id = :student_id";
        $params[':student_id'] = intval($_GET['student_id']);
    }

    if (isset($_GET['user_id']) && intval($_GET['user_id']) > 0) {
        $query .= " AND u.user_id = :user_id";
        $params[':user_id'] = intval($_GET['user_id']);
    }

    $query .= " ORDER BY sb.schedulebookdate DESC";

    $stmt = $conn->prepare($query);

    foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value, PDO::PARAM_INT);
    }

    $stmt->execute();
    $consultations = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (empty($consultations)) {
        echo json_encode([
            "success" => false,
            "message" => "No feedback found."
        ]);
    } else {
        echo json_encode([
            "success" => true,
            "data" => $consultations
        ]);
    }
} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => "Database error: " . $e->getMessage()
    ]);
}
?>
