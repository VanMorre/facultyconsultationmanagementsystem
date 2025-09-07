<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

include '../dbconnection.php';

try {
   $query = "SELECT 
              MIN(saf.availabilityfaculty_id) AS availabilityfaculty_id,
              u.user_id,
              u.username
          FROM tbl_setavailabilityfaculty saf
          INNER JOIN tbl_users u ON saf.user_id = u.user_id
          GROUP BY u.user_id, u.username
          ORDER BY u.username ASC";


    $stmt = $conn->prepare($query);
    $stmt->execute();

    $availability = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true,
        "data" => $availability
    ]);
} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => "Database error: " . $e->getMessage()
    ]);
}
?>
