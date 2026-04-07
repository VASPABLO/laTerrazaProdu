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

$email = trim($_POST['email'] ?? '');
if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['error' => 'Email invalido']);
    exit();
}

$dbHost = $_ENV['DB_HOST'] ?? '';
$dbPort = $_ENV['DB_PORT'] ?? '';
$dbName = $_ENV['DB_NAME'] ?? '';
$dbUser = $_ENV['DB_USER'] ?? '';
$dbPass = $_ENV['DB_PASS'] ?? '';

$genericMessage = 'Si el correo existe, te enviamos un enlace para recuperar tu contrasena.';

function sendResetEmail(string $toEmail, string $toName, string $resetLink): bool
{
    $fromAddress = $_ENV['MAIL_FROM_ADDRESS'] ?? '';
    $fromName = $_ENV['MAIL_FROM_NAME'] ?? 'Soporte';

    if ($fromAddress === '') {
        return false;
    }

    $subject = 'Recupera tu contrasena - La Terraza';
    $safeName = htmlspecialchars($toName !== '' ? $toName : 'Usuario', ENT_QUOTES, 'UTF-8');
    $safeLink = htmlspecialchars($resetLink, ENT_QUOTES, 'UTF-8');

    $message = "<html><body>"
        . "<p>Hola {$safeName},</p>"
        . "<p>Recibimos una solicitud para restablecer tu contrasena.</p>"
        . "<p><a href=\"{$safeLink}\">Haz clic aqui para cambiar tu contrasena</a></p>"
        . "<p>Este enlace expira en 30 minutos.</p>"
        . "<p>Si no solicitaste este cambio, ignora este correo.</p>"
        . "</body></html>";

    $headers = [
        'MIME-Version: 1.0',
        'Content-type: text/html; charset=UTF-8',
        'From: ' . $fromName . ' <' . $fromAddress . '>',
        'Reply-To: ' . $fromAddress,
    ];

    return @mail($toEmail, $subject, $message, implode("\r\n", $headers));
}

try {
    $dsn = "mysql:host={$dbHost};port={$dbPort};dbname={$dbName};charset=utf8mb4";
    $conexion = new PDO($dsn, $dbUser, $dbPass);
    $conexion->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $ip = $_SERVER['REMOTE_ADDR'] ?? null;
    $ua = substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 255);

    $stmtLog = $conexion->prepare('INSERT INTO password_reset_requests (email, ip, requested_at) VALUES (:email, :ip, NOW())');
    $stmtLog->execute([
        ':email' => $email,
        ':ip' => $ip,
    ]);

    $stmtRateEmail = $conexion->prepare('SELECT COUNT(*) FROM password_reset_requests WHERE email = :email AND requested_at > DATE_SUB(NOW(), INTERVAL 15 MINUTE)');
    $stmtRateEmail->execute([':email' => $email]);
    $emailAttempts = (int)$stmtRateEmail->fetchColumn();

    $stmtRateIp = $conexion->prepare('SELECT COUNT(*) FROM password_reset_requests WHERE ip = :ip AND requested_at > DATE_SUB(NOW(), INTERVAL 15 MINUTE)');
    $stmtRateIp->execute([':ip' => $ip]);
    $ipAttempts = (int)$stmtRateIp->fetchColumn();

    if ($emailAttempts > 3 || $ipAttempts > 10) {
        echo json_encode(['mensaje' => $genericMessage]);
        exit();
    }

    $stmtUser = $conexion->prepare('SELECT idUsuario, nombre, email FROM usuarios WHERE email = :email LIMIT 1');
    $stmtUser->execute([':email' => $email]);
    $usuario = $stmtUser->fetch(PDO::FETCH_ASSOC);

    if (!$usuario) {
        echo json_encode(['mensaje' => $genericMessage]);
        exit();
    }

    $conexion->beginTransaction();

    $stmtInvalidate = $conexion->prepare('UPDATE password_resets SET used_at = NOW() WHERE usuario_id = :usuario_id AND used_at IS NULL');
    $stmtInvalidate->execute([':usuario_id' => $usuario['idUsuario']]);

    $token = bin2hex(random_bytes(32));
    $tokenHash = hash('sha256', $token);

    $stmtInsert = $conexion->prepare('INSERT INTO password_resets (usuario_id, token_hash, expires_at, requested_ip, requested_user_agent, created_at) VALUES (:usuario_id, :token_hash, DATE_ADD(NOW(), INTERVAL 30 MINUTE), :requested_ip, :requested_ua, NOW())');
    $stmtInsert->execute([
        ':usuario_id' => $usuario['idUsuario'],
        ':token_hash' => $tokenHash,
        ':requested_ip' => $ip,
        ':requested_ua' => $ua,
    ]);

    $conexion->commit();

    $resetLink = $rutaWeb . '/reset-password?token=' . urlencode($token);
    sendResetEmail($usuario['email'], (string)($usuario['nombre'] ?? ''), $resetLink);

    echo json_encode(['mensaje' => $genericMessage]);
} catch (Throwable $error) {
    if (isset($conexion) && $conexion instanceof PDO && $conexion->inTransaction()) {
        $conexion->rollBack();
    }

    http_response_code(500);
    echo json_encode(['error' => 'No se pudo procesar la solicitud']);
}
?>