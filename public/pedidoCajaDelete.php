<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: DELETE, OPTIONS');
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

    if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
        echo json_encode(["error" => "Metodo no permitido"]);
        exit;
    }

    $idPedidoCaja = $_GET['idPedidoCaja'] ?? null;

    if (empty($idPedidoCaja)) {
        echo json_encode(["error" => "idPedidoCaja es obligatorio"]);
        exit;
    }

    $sql = "DELETE FROM pedidos_caja WHERE idPedidoCaja = :idPedidoCaja";
    $stmt = $conexion->prepare($sql);
    $stmt->bindValue(':idPedidoCaja', $idPedidoCaja, PDO::PARAM_INT);
    $stmt->execute();

    echo json_encode(["ok" => true, "mensaje" => "Pedido de caja eliminado"]);
} catch (PDOException $error) {
    echo json_encode(["error" => "Error de conexion: " . $error->getMessage()]);
}
?>