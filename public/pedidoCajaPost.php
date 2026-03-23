<?php
header("Content-Type: application/json");
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

require __DIR__.'/vendor/autoload.php';
use Dotenv\Dotenv;

$dotenv = Dotenv::createImmutable(__DIR__);
$dotenv->load();

$servidor = $_ENV['DB_HOST'] . ':' . $_ENV['DB_PORT'];
$usuario = $_ENV['DB_USER'];
$contrasena = $_ENV['DB_PASS'];
$dbname = $_ENV['DB_NAME'];

try {
    $dsn = "mysql:host=$servidor;dbname=$dbname";
    $conexion = new PDO($dsn, $usuario, $contrasena);
    $conexion->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        echo json_encode(["error" => "Metodo no permitido"]);
        exit;
    }

    $idCaja = $_POST['idCaja'] ?? null;
    $idUsuario = $_POST['idUsuario'] ?? null;
    $estado = $_POST['estado'] ?? 'Generado';
    $productos = $_POST['productos'] ?? '[]';
    $subtotal = $_POST['subtotal'] ?? 0;
    $descuento = $_POST['descuento'] ?? 0;
    $total = $_POST['total'] ?? 0;
    $montoPagado = $_POST['montoPagado'] ?? 0;
    $vuelto = $_POST['vuelto'] ?? 0;
    $metodoPago = $_POST['metodoPago'] ?? null;
    $telefonoCliente = $_POST['telefonoCliente'] ?? null;
    $ticketImagen = $_POST['ticketImagen'] ?? null;

    if (empty($idCaja) || empty($idUsuario) || empty($total)) {
        echo json_encode(["error" => "idCaja, idUsuario y total son obligatorios"]);
        exit;
    }

    $sql = "INSERT INTO pedidos_caja (
        idCaja, idUsuario, estado, productos, subtotal, descuento, total, montoPagado, vuelto, metodoPago, telefonoCliente, ticketImagen
    ) VALUES (
        :idCaja, :idUsuario, :estado, :productos, :subtotal, :descuento, :total, :montoPagado, :vuelto, :metodoPago, :telefonoCliente, :ticketImagen
    )";

    $stmt = $conexion->prepare($sql);
    $stmt->bindParam(':idCaja', $idCaja, PDO::PARAM_INT);
    $stmt->bindParam(':idUsuario', $idUsuario, PDO::PARAM_INT);
    $stmt->bindParam(':estado', $estado);
    $stmt->bindParam(':productos', $productos);
    $stmt->bindParam(':subtotal', $subtotal);
    $stmt->bindParam(':descuento', $descuento);
    $stmt->bindParam(':total', $total);
    $stmt->bindParam(':montoPagado', $montoPagado);
    $stmt->bindParam(':vuelto', $vuelto);
    $stmt->bindParam(':metodoPago', $metodoPago);
    $stmt->bindParam(':telefonoCliente', $telefonoCliente);
    $stmt->bindParam(':ticketImagen', $ticketImagen);
    $stmt->execute();

    echo json_encode([
        "ok" => true,
        "mensaje" => "Pedido de caja creado",
        "idPedidoCaja" => $conexion->lastInsertId()
    ]);
} catch (PDOException $error) {
    echo json_encode(["error" => "Error de conexion: " . $error->getMessage()]);
}
?>