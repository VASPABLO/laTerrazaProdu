<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require __DIR__ . '/vendor/autoload.php';

use Dotenv\Dotenv;

$dotenv = Dotenv::createImmutable(__DIR__);
$dotenv->load();

$servidor = $_ENV['DB_HOST'] . ':' . $_ENV['DB_PORT'];
$usuario = $_ENV['DB_USER'];
$contrasena = $_ENV['DB_PASS'];
$dbname = $_ENV['DB_NAME'];

function asegurarTablasCaja($conexion) {
    $sqlCaja = "CREATE TABLE IF NOT EXISTS `cajas` (
        `idCaja` INT(11) AUTO_INCREMENT PRIMARY KEY,
        `idUsuario` INT(11) NOT NULL,
        `montoInicial` DECIMAL(10,2) NOT NULL DEFAULT 0,
        `totalVentas` DECIMAL(10,2) NOT NULL DEFAULT 0,
        `totalIngresos` DECIMAL(10,2) NOT NULL DEFAULT 0,
        `totalRetiros` DECIMAL(10,2) NOT NULL DEFAULT 0,
        `montoEsperado` DECIMAL(10,2) NOT NULL DEFAULT 0,
        `montoCierre` DECIMAL(10,2) DEFAULT NULL,
        `diferencia` DECIMAL(10,2) DEFAULT NULL,
        `estado` VARCHAR(20) NOT NULL DEFAULT 'abierta',
        `fechaApertura` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        `fechaCierre` DATETIME DEFAULT NULL
    )";

    $sqlMovimientos = "CREATE TABLE IF NOT EXISTS `caja_movimientos` (
        `idMovimiento` INT(11) AUTO_INCREMENT PRIMARY KEY,
        `idCaja` INT(11) NOT NULL,
        `tipo` VARCHAR(30) NOT NULL,
        `metodoPago` VARCHAR(30) DEFAULT NULL,
        `monto` DECIMAL(10,2) NOT NULL,
        `referencia` VARCHAR(120) DEFAULT NULL,
        `detalle` TEXT,
        `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )";

    $conexion->exec($sqlCaja);
    $conexion->exec($sqlMovimientos);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['error' => 'Metodo no permitido']);
    exit();
}

try {
    $dsn = "mysql:host=$servidor;dbname=$dbname";
    $conexion = new PDO($dsn, $usuario, $contrasena);
    $conexion->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    asegurarTablasCaja($conexion);

    session_start();

    $idUsuario = null;
    if (isset($_POST['idUsuario']) && is_numeric($_POST['idUsuario'])) {
        $idUsuario = (int) $_POST['idUsuario'];
    } elseif (isset($_SESSION['usuario_id']) && is_numeric($_SESSION['usuario_id'])) {
        $idUsuario = (int) $_SESSION['usuario_id'];
    }

    $montoInicial = isset($_POST['montoInicial']) ? (float) $_POST['montoInicial'] : 0;

    if (!$idUsuario || $montoInicial < 0) {
        echo json_encode(['error' => 'Datos invalidos para abrir caja']);
        exit();
    }

    $sqlCajaAbierta = "SELECT idCaja FROM cajas WHERE idUsuario = :idUsuario AND estado = 'abierta' LIMIT 1";
    $stmtCajaAbierta = $conexion->prepare($sqlCajaAbierta);
    $stmtCajaAbierta->bindParam(':idUsuario', $idUsuario);
    $stmtCajaAbierta->execute();

    if ($stmtCajaAbierta->rowCount() > 0) {
        echo json_encode(['error' => 'Ya tienes una caja abierta']);
        exit();
    }

    $sqlAbrir = "INSERT INTO cajas (idUsuario, montoInicial, montoEsperado, estado) VALUES (:idUsuario, :montoInicial, :montoEsperado, 'abierta')";
    $stmtAbrir = $conexion->prepare($sqlAbrir);
    $stmtAbrir->bindParam(':idUsuario', $idUsuario);
    $stmtAbrir->bindParam(':montoInicial', $montoInicial);
    $stmtAbrir->bindParam(':montoEsperado', $montoInicial);
    $stmtAbrir->execute();

    $idCaja = (int) $conexion->lastInsertId();

    $tipo = 'apertura';
    $metodoPago = 'efectivo';
    $referencia = 'Apertura de turno';
    $detalle = 'Monto inicial de caja';

    $sqlMovimiento = "INSERT INTO caja_movimientos (idCaja, tipo, metodoPago, monto, referencia, detalle) VALUES (:idCaja, :tipo, :metodoPago, :monto, :referencia, :detalle)";
    $stmtMovimiento = $conexion->prepare($sqlMovimiento);
    $stmtMovimiento->bindParam(':idCaja', $idCaja);
    $stmtMovimiento->bindParam(':tipo', $tipo);
    $stmtMovimiento->bindParam(':metodoPago', $metodoPago);
    $stmtMovimiento->bindParam(':monto', $montoInicial);
    $stmtMovimiento->bindParam(':referencia', $referencia);
    $stmtMovimiento->bindParam(':detalle', $detalle);
    $stmtMovimiento->execute();

    echo json_encode([
        'mensaje' => 'Caja abierta correctamente',
        'idCaja' => $idCaja,
        'montoInicial' => $montoInicial
    ]);
} catch (PDOException $error) {
    echo json_encode(['error' => 'Error de conexion: ' . $error->getMessage()]);
}
?>
