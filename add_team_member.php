<?php
require_once 'config.php';

header('Content-Type: application/json');

try {
    // Read input data
    $data = json_decode(file_get_contents("php://input"), true);

    // Validate required fields
    if (
        empty($data['name']) || 
        empty($data['email']) || 
        empty($data['phone']) || 
        empty($data['role'])
    ) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Missing required user fields.']);
        exit;
    }

    // Split full name
    $name_parts = explode(' ', trim($data['name']));
    $first_name = $name_parts[0];
    $last_name = isset($name_parts[1]) ? $name_parts[1] : '';

    $email = $data['email'];
    $phone = $data['phone'];
    $role = $data['role'];

    // 1. Insert into `users`
    $stmt = $conn->prepare("INSERT INTO users (first_name, last_name, email, phone, role) VALUES (?, ?, ?, ?, ?)");
    $stmt->bind_param("sssss", $first_name, $last_name, $email, $phone, $role);

    if (!$stmt->execute()) {
        throw new Exception("User insert failed: " . $stmt->error);
    }

    $user_id = $stmt->insert_id;
    $stmt->close();

    // 2. If role is "professional", insert into `service_professional_details`
    // if ($role === 'professional') {
    //     $specialization = !empty($data['specialization']) ? $data['specialization'] : null;
    //     $experience = null;
    //     $availability = null;
    //     $locations_serving = '[]'; // valid empty JSON as required

    //     $stmt = $conn->prepare("
    //         INSERT INTO service_professional_details 
    //             (user_id, specialization, experience, availability, locations_serving) 
    //         VALUES (?, ?, ?, ?, ?)
    //     ");
    //     $stmt->bind_param("issss", $user_id, $specialization, $experience, $availability, $locations_serving);

    //     if (!$stmt->execute()) {
    //         throw new Exception("CONSTRAINT failure: " . $stmt->error);
    //     }

    //     $stmt->close();
    // }

    echo json_encode(['success' => true, 'message' => 'Team member added successfully']);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Server error while adding member',
        'debug_message' => $e->getMessage()
    ]);
}
