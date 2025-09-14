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
            sb.schedulebookdate,
            -- ✅ Concatenate start_time - end_time only
            GROUP_CONCAT(
                CONCAT(tr.start_time, ' - ', tr.end_time)
                ORDER BY tr.start_time ASC SEPARATOR ', '
            ) AS timeranges,
            a.approval_id,
            a.approval_name,
            u.user_id,
            b.subject_name,
            u.fullname AS created_by,
            s.student_id,
            s.student_name
        FROM tbl_scheduledbookings sb
        INNER JOIN tbl_booking b ON sb.booking_id = b.booking_id
        INNER JOIN tbl_students s ON b.student_id = s.student_id
        INNER JOIN tbl_timerange tr ON sb.timerange_id = tr.timerange_id
        INNER JOIN tbl_approval a ON sb.approval_id = a.approval_id
        INNER JOIN tbl_users u ON sb.user_id = u.user_id
        WHERE sb.user_id = :user_id
        GROUP BY sb.schedulebookings_id, sb.booking_id, sb.schedulebookdate, 
                 a.approval_id, a.approval_name, u.user_id, u.fullname, 
                 s.student_id, s.student_name
        ORDER BY sb.schedulebookdate DESC
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
