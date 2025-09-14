<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
include '../dbconnection.php';

try {
    // Exclude Student role
    $stmt = $conn->prepare("SELECT role_id, role_name FROM tbl_role WHERE role_name != 'Student'");
    $stmt->execute();
    $roles = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode(["success" => true, "data" => $roles]);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Error fetching roles: " . $e->getMessage()]);
}

$conn = null;
?>
