<?php
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST");
header("Content-Type: application/json; charset=UTF-8");

include '../dbconnection.php';

$sql = "SELECT al.log_id, u.username, al.activity_type, al.action, al.activity_time
        FROM tbl_activitylogs al
        JOIN tbl_users u ON al.user_id = u.user_id
        ORDER BY al.activity_time DESC";

$stmt = $conn->prepare($sql);
$stmt->execute();
$logs = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Return with success structure
echo json_encode([
  "success" => true,
  "data" => $logs
]);
?>
