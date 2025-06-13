<?php
require_once 'config.php';
header('Content-Type: application/json');

$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;

if (!$id) {
    echo json_encode(['success' => false, 'error' => 'Invalid service ID']);
    exit;
}

try {
    $stmt = $conn->prepare("SELECT id, name, category, description, base_price, status FROM services WHERE id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $stmt->bind_result($id, $name, $category, $description, $base_price, $status);

    if ($stmt->fetch()) {
        echo json_encode([
            'success' => true,
            'service' => [
                'id' => $id,
                'name' => $name,
                'category' => $category,
                'description' => $description,
                'base_price' => $base_price,
                'status' => $status
            ]
        ]);
    } else {
        echo json_encode(['success' => false, 'error' => 'Service not found']);
    }
    $stmt->close();
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => 'Error fetching service', 'debug' => $e->getMessage()]);
}
