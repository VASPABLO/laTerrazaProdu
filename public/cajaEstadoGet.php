<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
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

try {
    $dsn = "mysql:host=$servidor;dbname=$dbname";
    $conexion = new PDO($dsn, $usuario, $contrasena);
    $conexion->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    asegurarTablasCaja($conexion);

    session_start();

    $idUsuario = null;
    if (isset($_GET['idUsuario']) && is_numeric($_GET['idUsuario'])) {
        $idUsuario = (int) $_GET['idUsuario'];
    } elseif (isset($_SESSION['usuario_id']) && is_numeric($_SESSION['usuario_id'])) {
        $idUsuario = (int) $_SESSION['usuario_id'];
    }

    if (!$idUsuario) {
        echo json_encode([
            'abierta' => false,
            'error' => 'No se pudo identificar el usuario'
        ]);
        exit();
    }

    $sqlCaja = "SELECT * FROM cajas WHERE idUsuario = :idUsuario AND estado = 'abierta' ORDER BY idCaja DESC LIMIT 1";
    $stmtCaja = $conexion->prepare($sqlCaja);
    $stmtCaja->bindParam(':idUsuario', $idUsuario);
    $stmtCaja->execute();

    if ($stmtCaja->rowCount() === 0) {
        echo json_encode([
            'abierta' => false,
            'idUsuario' => $idUsuario
        ]);
        exit();
    }

    $caja = $stmtCaja->fetch(PDO::FETCH_ASSOC);

    $montoEsperado = (float) $caja['montoInicial'] + (float) $caja['totalVentas'] + (float) $caja['totalIngresos'] - (float) $caja['totalRetiros'];

    echo json_encode([
        'abierta' => true,
        'caja' => [
            'idCaja' => (int) $caja['idCaja'],
            'idUsuario' => (int) $caja['idUsuario'],
            'montoInicial' => (float) $caja['montoInicial'],
            'totalVentas' => (float) $caja['totalVentas'],
            'totalIngresos' => (float) $caja['totalIngresos'],
            'totalRetiros' => (float) $caja['totalRetiros'],
            'montoEsperado' => (float) $montoEsperado,
            'fechaApertura' => $caja['fechaApertura']
        ]
    ]);
} catch (PDOException $error) {
    echo json_encode(['error' => 'Error de conexion: ' . $error->getMessage()]);
}
?>
