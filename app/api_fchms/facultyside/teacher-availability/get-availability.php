<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

include '../../dbconnection.php';

if (!isset($_GET['id']) || empty($_GET['id'])) {
    echo json_encode([
        "success" => false,
        "message" => "Missing availabilityfaculty_id."
    ]);
    exit;
}

$id = intval($_GET['id']);

try {
    $query = "SELECT 
                  saf.availabilityfaculty_id, 
                  saf.availability_id, 
                  saf.timerange_id, 
                  saf.user_id, 
                  saf.availableslotstatus_id,
                  st.status_id,
                  st.status_name
              FROM tbl_setavailabilityfaculty saf
              INNER JOIN tbl_status st 
                ON saf.availableslotstatus_id = st.status_id
              WHERE saf.availabilityfaculty_id = :id
              LIMIT 1";
    
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':id', $id, PDO::PARAM_INT);
    $stmt->execute();

    $data = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($data) {
        echo json_encode([
            "success" => true,
            "data" => $data
        ]);
    } else {
        echo json_encode([
            "success" => false,
            "message" => "Availability not found."
        ]);
    }
} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => "Database error: " . $e->getMessage()
    ]);
}
?>
