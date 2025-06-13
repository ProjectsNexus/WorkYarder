<?php
header('Content-Type: application/json');
require 'db.php'; // Your DB connection file

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    echo json_encode(["success" => false, "error" => "Invalid request method"]);
    exit;
}

parse_str(file_get_contents("php://input"), $data); // Fetch DELETE payload
$serviceId = $data['id'] ?? $_GET['id'] ?? null;

if (!$serviceId) {
    echo json_encode(["success" => false, "error" => "Missing service ID"]);
    exit;
}

try {
    $stmt = $pdo->prepare("DELETE FROM services WHERE id = ?");
    $stmt->execute([$serviceId]);

    echo json_encode(["success" => true]);
} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "error" => "Database error while deleting service",
        "debug" => $e->getMessage()
    ]);
}
