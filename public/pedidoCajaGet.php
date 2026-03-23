<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

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

    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        echo json_encode(["error" => "Metodo no permitido"]);
        exit;
    }

    $filtros = [];
    $params = [];

    if (!empty($_GET['idUsuario'])) {
        $filtros[] = 'idUsuario = :idUsuario';
        $params[':idUsuario'] = $_GET['idUsuario'];
    }

    if (!empty($_GET['idCaja'])) {
        $filtros[] = 'idCaja = :idCaja';
        $params[':idCaja'] = $_GET['idCaja'];
    }

    if (!empty($_GET['estado'])) {
        $filtros[] = 'estado = :estado';
        $params[':estado'] = $_GET['estado'];
    }

    $where = count($filtros) > 0 ? ('WHERE ' . implode(' AND ', $filtros)) : '';
    $sql = "SELECT * FROM pedidos_caja $where ORDER BY idPedidoCaja DESC";

    $stmt = $conexion->prepare($sql);
    foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value);
    }

    $stmt->execute();
    $resultado = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(["pedidosCaja" => $resultado]);
} catch (PDOException $error) {
    echo json_encode(["error" => "Error de conexion: " . $error->getMessage()]);
}
?>