<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

include '../dbconnection.php';

try {
    $query = "SELECT 
                  s.subject_id, 
                  s.subject_name, 
                  ay.academicyear, 
                  st.status_name
              FROM tbl_subjects s
              INNER JOIN tbl_academicyear ay 
                  ON s.academicyear_id = ay.academicyear_id
              INNER JOIN tbl_status st 
                  ON s.status_id = st.status_id
              ORDER BY s.subject_id DESC";

    $stmt = $conn->prepare($query);
    $stmt->execute();

    $subjects = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true,
        "data" => $subjects
    ]);
} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => "Database error: " . $e->getMessage()
    ]);
}
?>
