<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

require __DIR__ . '/vendor/autoload.php';
use Dotenv\Dotenv;

$dotenv = Dotenv::createImmutable(__DIR__);
$dotenv->load();

$host = $_ENV['DB_HOST'] ?? '';
$port = $_ENV['DB_PORT'] ?? '';
$dbName = $_ENV['DB_NAME'] ?? '';
$user = $_ENV['DB_USER'] ?? '';
$pass = $_ENV['DB_PASS'] ?? '';

if ($host === '' || $port === '' || $dbName === '' || $user === '') {
    echo json_encode([
        'ok' => false,
        'message' => 'Faltan variables de entorno requeridas en public/.env',
        'env' => [
            'DB_HOST' => $host,
            'DB_PORT' => $port,
            'DB_NAME' => $dbName,
            'DB_USER' => $user === '' ? '' : 'configurado'
        ]
    ]);
    exit;
}

try {
    $dsn = "mysql:host={$host};port={$port};dbname={$dbName};charset=utf8mb4";
    $pdo = new PDO($dsn, $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_TIMEOUT => 5
    ]);

    $stmt = $pdo->query('SELECT 1 AS ok, NOW() AS server_time, VERSION() AS mysql_version');
    $row = $stmt->fetch();

    echo json_encode([
        'ok' => true,
        'message' => 'Conexion a base de datos exitosa',
        'database' => $dbName,
        'host' => $host,
        'port' => (int)$port,
        'server_time' => $row['server_time'] ?? null,
        'mysql_version' => $row['mysql_version'] ?? null
    ]);
} catch (PDOException $e) {
    $payload = [
        'ok' => false,
        'message' => 'No fue posible conectar a la base de datos'
    ];

    // Solo en local se expone el detalle tecnico para diagnostico.
    if ($isLocal) {
        $payload['error'] = $e->getMessage();
    }

    echo json_encode($payload);
}
