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

    $idCaja = isset($_POST['idCaja']) ? (int) $_POST['idCaja'] : 0;
    $monto = isset($_POST['monto']) ? (float) $_POST['monto'] : 0;
    $metodoPago = isset($_POST['metodoPago']) ? $_POST['metodoPago'] : 'efectivo';
    $referencia = isset($_POST['referencia']) ? $_POST['referencia'] : 'Venta POS';
    $detalle = isset($_POST['detalle']) ? $_POST['detalle'] : '';

    if ($idCaja <= 0 || $monto <= 0) {
        echo json_encode(['error' => 'Datos invalidos para registrar cobro']);
        exit();
    }

    $sqlCaja = "SELECT idCaja, estado, totalVentas, totalIngresos, totalRetiros, montoInicial FROM cajas WHERE idCaja = :idCaja LIMIT 1";
    $stmtCaja = $conexion->prepare($sqlCaja);
    $stmtCaja->bindParam(':idCaja', $idCaja);
    $stmtCaja->execute();

    if ($stmtCaja->rowCount() === 0) {
        echo json_encode(['error' => 'Caja no encontrada']);
        exit();
    }

    $caja = $stmtCaja->fetch(PDO::FETCH_ASSOC);

    if ($caja['estado'] !== 'abierta') {
        echo json_encode(['error' => 'La caja ya esta cerrada']);
        exit();
    }

    $tipo = 'venta';

    $sqlMovimiento = "INSERT INTO caja_movimientos (idCaja, tipo, metodoPago, monto, referencia, detalle) VALUES (:idCaja, :tipo, :metodoPago, :monto, :referencia, :detalle)";
    $stmtMovimiento = $conexion->prepare($sqlMovimiento);
    $stmtMovimiento->bindParam(':idCaja', $idCaja);
    $stmtMovimiento->bindParam(':tipo', $tipo);
    $stmtMovimiento->bindParam(':metodoPago', $metodoPago);
    $stmtMovimiento->bindParam(':monto', $monto);
    $stmtMovimiento->bindParam(':referencia', $referencia);
    $stmtMovimiento->bindParam(':detalle', $detalle);
    $stmtMovimiento->execute();

    // Solo afecta el efectivo esperado en caja.
    if ($metodoPago === 'efectivo') {
        $totalVentas = (float) $caja['totalVentas'] + $monto;
        $montoEsperado = (float) $caja['montoInicial'] + $totalVentas + (float) $caja['totalIngresos'] - (float) $caja['totalRetiros'];

        $sqlUpdate = "UPDATE cajas SET totalVentas = :totalVentas, montoEsperado = :montoEsperado WHERE idCaja = :idCaja";
        $stmtUpdate = $conexion->prepare($sqlUpdate);
        $stmtUpdate->bindParam(':totalVentas', $totalVentas);
        $stmtUpdate->bindParam(':montoEsperado', $montoEsperado);
        $stmtUpdate->bindParam(':idCaja', $idCaja);
        $stmtUpdate->execute();
    }

    echo json_encode([
        'mensaje' => 'Cobro registrado correctamente',
        'idCaja' => $idCaja,
        'monto' => $monto,
        'metodoPago' => $metodoPago
    ]);
} catch (PDOException $error) {
    echo json_encode(['error' => 'Error de conexion: ' . $error->getMessage()]);
}
?>
