<?php 
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

include '../../dbconnection.php';

$data = json_decode(file_get_contents("php://input"), true);

// ✅ Normalize inputs
$studentId = isset($data['student_id']) ? (int)$data['student_id'] : null;
$availabilityFacultyId = isset($data['availabilityfaculty_id']) ? (int)$data['availabilityfaculty_id'] : null;
$timerangeId = isset($data['timerange_id']) && is_numeric($data['timerange_id']) ? (int)$data['timerange_id'] : null;
$subject = !empty($data['subject']) ? trim($data['subject']) : null;
$purpose = isset($data['notes']) ? trim($data['notes']) : null;
$bookingDate = !empty($data['consultation_date']) ? date('Y-m-d', strtotime($data['consultation_date'])) : null;
$approvalId = isset($data['approval_id']) ? (int)$data['approval_id'] : null;
$approvalDate = !empty($data['approval_date']) ? date('Y-m-d H:i:s', strtotime($data['approval_date'])) : null;

// ✅ Validate required fields
if (
    !$studentId ||
    !$availabilityFacultyId ||
    !$timerangeId ||
    !$subject ||
    !$bookingDate ||
    !$approvalId
) {
    echo json_encode([
        "success" => false,
        "message" => "Missing or invalid required fields."
    ]);
    exit;
}

try {
    $query = "INSERT INTO tbl_booking 
                (student_id, availabilityfaculty_id, timerange_id, subject_name, purpose, booking_date, approval_id, approval_date) 
              VALUES 
                (:student_id, :availabilityfaculty_id, :timerange_id, :subject_name, :purpose, :booking_date, :approval_id, :approval_date)";
    
    $stmt = $conn->prepare($query);

    $stmt->bindParam(':student_id', $studentId, PDO::PARAM_INT);
    $stmt->bindParam(':availabilityfaculty_id', $availabilityFacultyId, PDO::PARAM_INT);
    $stmt->bindParam(':timerange_id', $timerangeId, PDO::PARAM_INT);
    $stmt->bindParam(':subject_name', $subject, PDO::PARAM_STR);
    $stmt->bindParam(':purpose', $purpose, PDO::PARAM_STR);
    $stmt->bindParam(':booking_date', $bookingDate, PDO::PARAM_STR);
    $stmt->bindParam(':approval_id', $approvalId, PDO::PARAM_INT);

    // ✅ Handle approval_date (nullable)
    if ($approvalDate) {
        $stmt->bindParam(':approval_date', $approvalDate, PDO::PARAM_STR);
    } else {
        $stmt->bindValue(':approval_date', null, PDO::PARAM_NULL);
    }

    if ($stmt->execute()) {
        echo json_encode([
            "success" => true,
            "message" => "Consultation booked successfully."
        ]);
    } else {
        echo json_encode([
            "success" => false,
            "message" => "Failed to book consultation."
        ]);
    }
} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => "Database error: " . $e->getMessage()
    ]);
}
?>
