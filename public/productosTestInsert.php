<?php
header("Content-Type: application/json");
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

    echo json_encode(["ok" => true, "mensaje" => "Conexión exitosa a BD"]);

    // Insertar producto de prueba
    if ($_GET['insertar'] === '1') {
        $sqlInsert = "INSERT INTO `productos` (descripcion, titulo, precio, idCategoria, masVendido, precioAnterior) 
                      VALUES ('Producto de prueba', 'Test Producto 1', 50000, 1, 'no', 60000)";
        $stmt = $conexion->prepare($sqlInsert);
        $stmt->execute();
        $lastId = $conexion->lastInsertId();

        echo json_encode([
            "ok" => true,
            "mensaje" => "Producto de prueba creado",
            "idProducto" => $lastId
        ]);
    }

} catch (PDOException $e) {
    echo json_encode([
        "ok" => false,
        "error" => "Error: " . $e->getMessage()
    ]);
} catch (Exception $e) {
    echo json_encode([
        "ok" => false,
        "error" => "Error desconocido: " . $e->getMessage()
    ]);
}
?>
