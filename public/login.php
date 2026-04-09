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
header('Access-Control-Allow-Methods: POST, OPTIONS');

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') {
    http_response_code(204);
    exit();
}

$isHttps = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
    || (($_SERVER['SERVER_PORT'] ?? '') === '443')
    || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https');

$isProduction = !empty($allowedOrigins) && strpos($allowedOrigins[0], 'https://') === 0;
$requestHost = $_SERVER['HTTP_HOST'] ?? '';
$requestOrigin = $requestHost !== ''
    ? (($isHttps ? 'https' : 'http') . '://' . $requestHost)
    : '';
$isCrossOriginRequest = $origin !== '' && $requestOrigin !== '' && $origin !== $requestOrigin;

// COMENTADO PARA DESARROLLO LOCAL - Descomentar en producción
// if ($isProduction && !$isHttps) {
//     http_response_code(400);
//     echo json_encode(['error' => 'HTTPS requerido. Usa una conexión segura.']);
//     exit();
// }

if ($isHttps) {
    header('Strict-Transport-Security: max-age=31536000; includeSubDomains');
}

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Metodo no permitido']);
    exit();
}

$emailLogin = trim($_POST['email'] ?? '');
$contrasenaLogin = (string)($_POST['contrasena'] ?? '');

if ($emailLogin === '' || $contrasenaLogin === '') {
    http_response_code(400);
    echo json_encode(['error' => 'Email y contrasena son obligatorios']);
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

    $sql = 'SELECT idUsuario, nombre, email, contrasena, rol FROM usuarios WHERE email = :email LIMIT 1';
    $stmt = $conexion->prepare($sql);
    $stmt->bindParam(':email', $emailLogin);
    $stmt->execute();

    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$row) {
        echo json_encode(['error' => 'Usuario no encontrado']);
        exit();
    }

    if (!password_verify($contrasenaLogin, $row['contrasena'])) {
        echo json_encode(['error' => 'Contrasena incorrecta']);
        exit();
    }

    if (($row['rol'] ?? '') !== 'admin') {
        echo json_encode(['error' => 'No tienes permisos para acceder']);
        exit();
    }

    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'domain' => '',
        'secure' => $isHttps || $isCrossOriginRequest,
        'httponly' => true,
        'samesite' => $isCrossOriginRequest ? 'None' : 'Lax'
    ]);

    session_start();
    $_SESSION['usuario_id'] = $row['idUsuario'];
    $_SESSION['rol'] = $row['rol'];

    echo json_encode([
        'mensaje' => 'Inicio de sesion exitoso como administrador',
        'redirect' => 'dashboard.php',
        'usuario' => [
            'idUsuario' => $row['idUsuario'],
            'nombre' => $row['nombre'],
            'email' => $row['email'],
            'rol' => $row['rol']
        ]
    ]);
} catch (PDOException $error) {
    http_response_code(500);
    echo json_encode(['error' => 'Error de conexion']);
}
?>
