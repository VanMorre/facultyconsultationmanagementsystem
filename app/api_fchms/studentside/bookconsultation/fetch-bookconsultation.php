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


    $params = [];
    $feedback_user_id = null;

    // ✅ Only show records related to a specific student_id
    if (isset($_GET['student_id']) && intval($_GET['student_id']) > 0) {
        $query .= " AND b.student_id = :student_id";
        $params[':student_id'] = intval($_GET['student_id']);
    }

    // ✅ If user_id is provided → filter faculty requests
    if (isset($_GET['user_id']) && intval($_GET['user_id']) > 0) {
        $query .= " AND f.user_id = :user_id";
        $params[':user_id'] = intval($_GET['user_id']);
        $feedback_user_id = intval($_GET['user_id']);
    }

    $query .= " ORDER BY b.booking_date DESC";

    $stmt = $conn->prepare($query);

    foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value, PDO::PARAM_INT);
    }

    $stmt->execute();
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Add user_feedback_count to each result if user_id was provided
    if ($feedback_user_id !== null && !empty($results)) {
        $scheduleIds = array_filter(array_column($results, 'schedulebookings_id'));
        if (!empty($scheduleIds)) {
            $placeholders = implode(',', array_fill(0, count($scheduleIds), '?'));
            $userFeedbackQuery = "SELECT schedulebookings_id, COUNT(*) AS user_feedback_count 
                                  FROM tbl_feedback 
                                  WHERE schedulebookings_id IN ($placeholders) AND user_id = ?
                                  GROUP BY schedulebookings_id";
            $userFeedbackStmt = $conn->prepare($userFeedbackQuery);
            $userFeedbackStmt->execute(array_merge($scheduleIds, [$feedback_user_id]));
            $userFeedbackCounts = $userFeedbackStmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Create a map for quick lookup
            $userFeedbackMap = [];
            foreach ($userFeedbackCounts as $ufc) {
                $userFeedbackMap[$ufc['schedulebookings_id']] = intval($ufc['user_feedback_count']);
            }
            
            // Add user_feedback_count to each result
            foreach ($results as &$result) {
                $scheduleId = $result['schedulebookings_id'];
                $result['user_feedback_count'] = isset($userFeedbackMap[$scheduleId]) ? $userFeedbackMap[$scheduleId] : 0;
            }
            unset($result);
        } else {
            // No schedulebookings_id found, set all to 0
            foreach ($results as &$result) {
                $result['user_feedback_count'] = 0;
            }
            unset($result);
        }
    } else {
        // No user_id provided, set all to 0
        foreach ($results as &$result) {
            $result['user_feedback_count'] = 0;
        }
        unset($result);
    }

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
