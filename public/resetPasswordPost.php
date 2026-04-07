<?php
header('Content-Type: application/json; charset=utf-8');

require __DIR__ . '/vendor/autoload.php';
use Dotenv\Dotenv;

$dotenv = Dotenv::createImmutable(__DIR__);
$dotenv->safeLoad();

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
} elseif (!empty($allowedOrigins)) {
    header('Access-Control-Allow-Origin: ' . $allowedOrigins[0]);
}
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Methods: POST, OPTIONS');

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') {
    http_response_code(204);
    exit();
}

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Metodo no permitido']);
    exit();
}

$token = trim($_POST['token'] ?? '');
$contrasena = (string)($_POST['contrasena'] ?? '');
$confirmarContrasena = (string)($_POST['confirmar_contrasena'] ?? '');

if ($token === '' || $contrasena === '' || $confirmarContrasena === '') {
    http_response_code(400);
    echo json_encode(['error' => 'Token y contrasena son obligatorios']);
    exit();
}

if ($contrasena !== $confirmarContrasena) {
    http_response_code(400);
    echo json_encode(['error' => 'Las contrasenas no coinciden']);
    exit();
}

if (strlen($contrasena) < 8) {
    http_response_code(400);
    echo json_encode(['error' => 'La contrasena debe tener al menos 8 caracteres']);
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

    $tokenHash = hash('sha256', $token);
    $stmtToken = $conexion->prepare('SELECT id, usuario_id, expires_at, used_at FROM password_resets WHERE token_hash = :token_hash LIMIT 1');
    $stmtToken->execute([':token_hash' => $tokenHash]);
    $row = $stmtToken->fetch(PDO::FETCH_ASSOC);

    if (!$row) {
        http_response_code(400);
        echo json_encode(['error' => 'Token invalido o expirado']);
        exit();
    }

    $expiraEn = strtotime((string)$row['expires_at']);
    $usadoEn = $row['used_at'];
    if ($usadoEn !== null || $expiraEn === false || $expiraEn < time()) {
        http_response_code(400);
        echo json_encode(['error' => 'Token invalido o expirado']);
        exit();
    }

    $hashContrasena = password_hash($contrasena, PASSWORD_DEFAULT);

    $conexion->beginTransaction();

    $stmtUpdateUser = $conexion->prepare('UPDATE usuarios SET contrasena = :contrasena, password_changed_at = NOW(), session_version = session_version + 1 WHERE idUsuario = :usuario_id');
    $stmtUpdateUser->execute([
        ':contrasena' => $hashContrasena,
        ':usuario_id' => $row['usuario_id'],
    ]);

    $stmtUseToken = $conexion->prepare('UPDATE password_resets SET used_at = NOW() WHERE id = :id AND used_at IS NULL');
    $stmtUseToken->execute([':id' => $row['id']]);

    $stmtUseAllTokens = $conexion->prepare('UPDATE password_resets SET used_at = NOW() WHERE usuario_id = :usuario_id AND used_at IS NULL');
    $stmtUseAllTokens->execute([':usuario_id' => $row['usuario_id']]);

    $conexion->commit();

    echo json_encode(['mensaje' => 'Contrasena actualizada correctamente']);
} catch (Throwable $error) {
    if (isset($conexion) && $conexion instanceof PDO && $conexion->inTransaction()) {
        $conexion->rollBack();
    }

    http_response_code(500);
    echo json_encode(['error' => 'No se pudo actualizar la contrasena']);
}
?>