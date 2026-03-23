<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: PUT, OPTIONS');
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

    if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
        echo json_encode(["error" => "Metodo no permitido"]);
        exit;
    }

    $idPedidoCaja = $_GET['idPedidoCaja'] ?? null;
    $data = json_decode(file_get_contents('php://input'), true);

    if (empty($idPedidoCaja)) {
        echo json_encode(["error" => "idPedidoCaja es obligatorio"]);
        exit;
    }

    $camposPermitidos = [
        'estado',
        'telefonoCliente',
        'ticketImagen',
        'metodoPago',
        'montoPagado',
        'vuelto',
        'descuento',
        'subtotal',
        'total'
    ];

    $set = [];
    $params = [':idPedidoCaja' => $idPedidoCaja];

    foreach ($camposPermitidos as $campo) {
        if (array_key_exists($campo, $data)) {
            $set[] = "$campo = :$campo";
            $params[":$campo"] = $data[$campo];
        }
    }

    if (count($set) === 0) {
        echo json_encode(["error" => "No hay campos para actualizar"]);
        exit;
    }

    $sql = "UPDATE pedidos_caja SET " . implode(', ', $set) . " WHERE idPedidoCaja = :idPedidoCaja";
    $stmt = $conexion->prepare($sql);

    foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value);
    }

    $stmt->execute();

    echo json_encode(["ok" => true, "mensaje" => "Pedido de caja actualizado"]);
} catch (PDOException $error) {
    echo json_encode(["error" => "Error de conexion: " . $error->getMessage()]);
}
?>