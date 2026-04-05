<?php
header('Content-Type: application/json; charset=utf-8');

require __DIR__ . '/vendor/autoload.php';
use Dotenv\Dotenv;

$dotenv = Dotenv::createImmutable(__DIR__);
$dotenv->load();

$rutaWeb = rtrim($_ENV['RUTA_WEB'] ?? '', '/');
$parsed = parse_url($rutaWeb);
$allowedOrigin = '';
if (!empty($parsed['scheme']) && !empty($parsed['host'])) {
    $allowedOrigin = $parsed['scheme'] . '://' . $parsed['host'];
}

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($allowedOrigin !== '' && ($origin === $allowedOrigin || $origin === '')) {
    header('Access-Control-Allow-Origin: ' . ($origin ?: $allowedOrigin));
    header('Access-Control-Allow-Credentials: true');
}
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Methods: GET, OPTIONS');

session_start();

echo json_encode([
    'session_status' => [
        'session_name' => session_name(),
        'session_id' => session_id(),
        'has_usuario_id' => isset($_SESSION['usuario_id']),
        'usuario_id' => $_SESSION['usuario_id'] ?? null,
        'rol' => $_SESSION['rol'] ?? null,
        'session_data' => $_SESSION
    ],
    'db_config' => [
        'DB_HOST' => $_ENV['DB_HOST'] ?? 'not set',
        'DB_PORT' => $_ENV['DB_PORT'] ?? 'not set',
        'DB_NAME' => $_ENV['DB_NAME'] ?? 'not set',
        'DB_USER' => $_ENV['DB_USER'] ?? 'not set',
        'DB_PASS' => (!empty($_ENV['DB_PASS']) ? str_repeat('*', 4) : 'not set')
    ],
    'server' => [
        'REQUEST_METHOD' => $_SERVER['REQUEST_METHOD'],
        'HTTP_ORIGIN' => $_SERVER['HTTP_ORIGIN'] ?? 'not set',
        'SERVER_NAME' => $_SERVER['SERVER_NAME'],
        'SERVER_PORT' => $_SERVER['SERVER_PORT'],
        'HTTPS' => $_SERVER['HTTPS'] ?? 'not set'
    ]
]);
?>
