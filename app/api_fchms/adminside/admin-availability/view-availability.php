<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

include '../../dbconnection.php';

try {
    if (!isset($_GET['id']) || empty($_GET['id'])) {
        echo json_encode([
            "success" => false,
            "message" => "Missing availabilityfaculty_id."
        ]);
        exit;
    }

    $availabilityfaculty_id = intval($_GET['id']);

    $query = "
        SELECT 
            s.student_name,
            b.subject_name,
            b.purpose,
            b.booking_date,
            a.approval_name,
            sb.discussion,
            sb.recommendation
        FROM tbl_booking b
        INNER JOIN tbl_students s 
            ON b.student_id = s.student_id
        INNER JOIN tbl_approval a
            ON b.approval_id = a.approval_id
        LEFT JOIN tbl_scheduledbookings sb
            ON b.booking_id = sb.booking_id
        WHERE b.availabilityfaculty_id = :availabilityfaculty_id
        ORDER BY b.booking_date DESC
    ";

    $stmt = $conn->prepare($query);
    $stmt->bindParam(":availabilityfaculty_id", $availabilityfaculty_id, PDO::PARAM_INT);
    $stmt->execute();

    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if ($results && count($results) > 0) {
        echo json_encode([
            "success" => true,
            "data" => $results
        ]);
    } else {
        echo json_encode([
            "success" => false,
            "message" => "No student bookings found."
        ]);
    }

} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => "Database error: " . $e->getMessage()
    ]);
}
?>
