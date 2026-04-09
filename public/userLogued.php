<?php
header('Content-Type: application/json; charset=utf-8');

require __DIR__ . '/vendor/autoload.php';
use Dotenv\Dotenv;

$dotenv = Dotenv::createImmutable(__DIR__);
$dotenv->load();

$rutaWeb = rtrim($_ENV['RUTA_WEB'] ?? '', '/');
$parsed = parse_url($rutaWeb);
$allowedOrigins = [];
if (!empty($parsed['scheme']) && !empty($parsed['host'])) {
    $baseOrigin = $parsed['scheme'] . '://' . $parsed['host'];
    $allowedOrigins[] = $baseOrigin;

    $host = $parsed['host'];
    if (strpos($host, 'www.') === 0) {
        $allowedOrigins[] = $parsed['scheme'] . '://' . substr($host, 4);
    } else {
        $allowedOrigins[] = $parsed['scheme'] . '://www.' . $host;
    }
}

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin !== '' && in_array($origin, $allowedOrigins, true)) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Access-Control-Allow-Credentials: true');
    header('Vary: Origin');
} elseif (!empty($allowedOrigins)) {
    header('Access-Control-Allow-Origin: ' . $allowedOrigins[0]);
}
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Methods: GET, OPTIONS');

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') {
    http_response_code(204);
    exit();
}

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Metodo no permitido']);
    exit();
}

$dbHost = $_ENV['DB_HOST'] ?? '';
$dbPort = $_ENV['DB_PORT'] ?? '';
$dbName = $_ENV['DB_NAME'] ?? '';
$dbUser = $_ENV['DB_USER'] ?? '';
$dbPass = $_ENV['DB_PASS'] ?? '';

try {
    $dsn = "mysql:host={$dbHost};port={$dbPort};dbname={$dbName};charset=utf8mb4";
    $conexion = new PDO($dsn, $dbUser, $dbPass);
    $conexion->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    session_start();

    if (!isset($_SESSION['usuario_id'])) {
        echo json_encode([
            'authenticated' => false,
            'usuario' => null,
        ]);
        exit();
    }

    $usuarioId = (int)$_SESSION['usuario_id'];
    $sql = 'SELECT idUsuario, nombre, email, rol FROM usuarios WHERE idUsuario = :idUsuario LIMIT 1';
    $stmtUsuario = $conexion->prepare($sql);
    $stmtUsuario->bindParam(':idUsuario', $usuarioId, PDO::PARAM_INT);
    $stmtUsuario->execute();

    $resultadoUsuario = $stmtUsuario->fetch(PDO::FETCH_ASSOC);
    if (!$resultadoUsuario) {
        echo json_encode([
            'authenticated' => false,
            'usuario' => null,
        ]);
        exit();
    }

    echo json_encode(array_merge([
        'authenticated' => true,
    ], $resultadoUsuario));
} catch (PDOException $error) {
    http_response_code(500);
    echo json_encode(['error' => 'Error de conexion']);
}
?>
