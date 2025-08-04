<?php
// Set headers for JSON response and CORS
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type");

// Include the database connection
include '../dbconnection.php';



$baseImageUrl = "http://localhost/fchms/app/api_fchms/uploads/";



if ($_SERVER["REQUEST_METHOD"] === "GET") {
    // Query with INNER JOIN on tbl_role and tbl_status
    $query = "SELECT 
                u.user_id, 
                u.username,
                u.address,
                u.age,
                u.contact,
                u.email,
                u.photo_url,
                r.role_name AS role,
                s.status_name AS status,
                u.created_at     
              FROM tbl_users u
              INNER JOIN tbl_role r ON u.role_id = r.role_id
              INNER JOIN tbl_status s ON u.user_status = s.status_id"; 

    $stmt = $conn->prepare($query);

    if ($stmt->execute()) {
        // Fetch all the records
        $fetchusersaccounts = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($fetchusersaccounts as &$user) {
            $user['photo_url'] = !empty($user['photo_url']) ? $baseImageUrl . basename($user['photo_url']) : null;
        }
        
        if (!empty($fetchusersaccounts)) {
            echo json_encode(["success" => true, "data" => $fetchusersaccounts]);
        } else {
            echo json_encode(["success" => false, "message" => "No Users Details found."]);
        }
    } else {
        echo json_encode(["success" => false, "error" => "Failed to retrieve Users Details. Please try again."]);
    }
} else {
    echo json_encode(["error" => "Only GET method is allowed"]);
}
?>
