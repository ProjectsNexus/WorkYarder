<?php
require_once 'config.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"), true);

if (
    empty($data['id']) || 
    empty($data['name']) || 
    empty($data['category']) || 
    !isset($data['base_price']) || 
    empty($data['status'])
) {
    echo json_encode(['success' => false, 'error' => 'Missing required fields']);
    exit;
}

try {
    $stmt = $conn->prepare("
        UPDATE services SET 
            name = ?, 
            category = ?, 
            description = ?, 
            base_price = ?, 
            status = ?
        WHERE id = ?
    ");

    $stmt->bind_param(
        "sssisi", 
        $data['name'], 
        $data['category'], 
        $data['description'], 
        $data['base_price'], 
        $data['status'], 
        $data['id']
    );

    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        throw new Exception($stmt->error);
    }

    $stmt->close();
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => 'Error updating service', 'debug' => $e->getMessage()]);
}
