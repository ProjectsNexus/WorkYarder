<?php
require_once 'config.php';
session_start();

error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: application/json');

// Get logged-in user's ID
$user_id = $_SESSION['user_id'] ?? null;

if (!$user_id) {
    echo json_encode(['error' => 'User not authenticated']);
    exit;
}

// Decode incoming request
$data = json_decode(file_get_contents('php://input'), true);
//$data = $data[0] ?? null;

if (!$data) {
    echo json_encode(['error' => 'Invalid request data']);
    exit;
}

try {
    $conn->begin_transaction();

    // Get manager's location_id
    $stmt = $conn->prepare("SELECT location_id FROM service_manager_details WHERE user_id = ?");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $stmt->bind_result($location_id);
    $stmt->fetch();
    $stmt->close();

    if (!$location_id) {
        throw new Exception('User is not assigned to a location');
    }

    // Handle new customer creation
    $customer_id = $data['customer_id'] ?? null;
    $address_id = $data['address_id'] ?? null;

    if ($customer_id === null && isset($data['new_customer'])) {
        $new_customer = $data['new_customer'];
        $names = explode(' ', trim($new_customer['name']), 2);
        $first_name = $names[0];
        $last_name = $names[1] ?? '';

        // Insert user
        $stmt = $conn->prepare("INSERT INTO users (email, first_name, last_name, phone, role, registration_date, status)
            VALUES (?, ?, ?, ?, 'customer', NOW(), 'active')");
        $stmt->bind_param("ssss", $new_customer['email'], $first_name, $last_name, $new_customer['phone']);
        $stmt->execute();
        $customer_id = $conn->insert_id;
        $stmt->close();

        // Insert address (format: "Street, City, State Zip")
        $address_parts = explode(',', $new_customer['address']);
        $street = trim($address_parts[0]);
        $city = trim($address_parts[1] ?? '');
        $state_zip = explode(' ', trim($address_parts[2] ?? ''));
        $state = trim($state_zip[0] ?? '');
        $zipcode = trim($state_zip[1] ?? '');

        $stmt = $conn->prepare("INSERT INTO user_addresses (user_id, location_id, street, city, state, zipcode, is_primary, created_at)
            VALUES (?, ?, ?, ?, ?, ?, 1, NOW())");
        $stmt->bind_param("iissss", $customer_id, $location_id, $street, $city, $state, $zipcode);
        $stmt->execute();
        $address_id = $conn->insert_id;
        $stmt->close();
    }

    // Use service_package price directly
    $base_price = $data['service_package']['price'];

    // Insert into orders
    $stmt = $conn->prepare("INSERT INTO orders (user_id, address_id, order_date, total_amount, payment_status)
        VALUES (?, ?, NOW(), ?, 'pending')");
    $stmt->bind_param("iid", $customer_id, $address_id, $base_price);
    $stmt->execute();
    $order_id = $conn->insert_id;
    $stmt->close();

    // Add order item
    $additional_tasks = $data['service_extras'] ?? [];
    $additional_tasks_json = json_encode($additional_tasks);

    $stmt = $conn->prepare("INSERT INTO order_items (order_id, service_id, service_date, service_time, status, price, additional_tasks, user_id)
    VALUES (?, ?, ?, ?, 'pending', ?, ?, ?)");
    $stmt->bind_param("iissdssi", $order_id, $data['service_package']['id'], $data['service_date'], $data['service_time'], $base_price, $additional_tasks_json, $user_id);
    $stmt->execute();
    $order_item_id = $conn->insert_id;
    $stmt->close();

    // Call stored procedure to assign professional tasks
    $service_id = $data['service_package']['id'];
    $stmt = $conn->prepare("CALL create_professional_tasks(?, ?, ?)");
    $stmt->bind_param("iii", $order_item_id, $service_id, $user_id);
    $stmt->execute();
    $stmt->close();


    // Add extra prices
    $total_extra_price = 0;
    if (!empty($additional_tasks)) {
        $placeholders = implode(',', array_fill(0, count($additional_tasks), '?'));
        $task_ids = array_column($additional_tasks, 'id');
        $types = str_repeat('s', count($task_ids));
        $stmt = $conn->prepare("SELECT SUM(price) FROM service_task_templates WHERE id IN ($placeholders)");
        $stmt->bind_param($types, ...$task_ids);
        $stmt->execute();
        $stmt->bind_result($total_extra_price);
        $stmt->fetch();
        $stmt->close();
    }

    $final_total = $base_price + $total_extra_price;
    $stmt = $conn->prepare("UPDATE orders SET total_amount = ? WHERE id = ?");
    $stmt->bind_param("di", $final_total, $order_id);
    $stmt->execute();
    $stmt->close();

    $conn->commit();

    echo json_encode([
        'success' => true,
        'message' => 'Service scheduled successfully',
        'order_id' => $order_id,
        'order_item_id' => $order_item_id
    ]);
} catch (Exception $e) {
    $conn->rollback();
    echo json_encode([
        'success' => false,
        'error' => 'Failed to schedule service',
        'message' => $e->getMessage()
    ]);
}
?>
