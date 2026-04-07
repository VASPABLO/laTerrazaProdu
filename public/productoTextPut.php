<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');


ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Manejo de solicitudes OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

// Cargar variables de entorno desde el archivo .env
require __DIR__.'/vendor/autoload.php';
use Dotenv\Dotenv;

$dotenv = Dotenv::createImmutable(__DIR__);
$dotenv->load();

// Obtener los valores de las variables de entorno
$servidor = $_ENV['DB_HOST'] . ':' . $_ENV['DB_PORT'];
$usuario = $_ENV['DB_USER'];
$contrasena = $_ENV['DB_PASS'];
$dbname = $_ENV['DB_NAME'];
$mensaje = "";

try {
    $dsn = "mysql:host=$servidor;dbname=$dbname";
    $conexion = new PDO($dsn, $usuario, $contrasena);
    $conexion->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
        $idProducto = isset($_REQUEST['idProducto']) ? $_REQUEST['idProducto'] : null;
        $data = json_decode(file_get_contents("php://input"), true);
    
        $nuevaDescripcion = isset($data['nuevaDescripcion']) ? $data['nuevaDescripcion'] : null;
        $nuevoTitulo = isset($data['nuevoTitulo']) ? $data['nuevoTitulo'] : null;
        $nuevaCategoria = isset($data['nuevaCategoria']) ? $data['nuevaCategoria'] : null;
        $nuevoPrecio = isset($data['nuevoPrecio']) ? $data['nuevoPrecio'] : null;
        $masVendido = isset($data['masVendido']) ? $data['masVendido'] : null; 

        $sqlCurrent = "SELECT item1, item2, item3, item4, item5, item6, item7, item8, item9, item10 FROM productos WHERE idProducto = :idProducto LIMIT 1";
        $stmtCurrent = $conexion->prepare($sqlCurrent);
        $stmtCurrent->bindParam(':idProducto', $idProducto, PDO::PARAM_INT);
        $stmtCurrent->execute();
        $currentRow = $stmtCurrent->fetch(PDO::FETCH_ASSOC) ?: [];

        $items = [];
        for ($i = 1; $i <= 10; $i++) {
            $key = "item{$i}";
            if (array_key_exists($key, $data)) {
                $valor = trim((string)$data[$key]);
                $items[$key] = $valor === '' ? null : $valor;
            } else {
                $items[$key] = $currentRow[$key] ?? null;
            }
        }
 
        if (empty($nuevaCategoria)) {
            $sqlSelect = "SELECT idCategoria FROM productos WHERE idProducto = :idProducto";
            $stmt = $conexion->prepare($sqlSelect);
            $stmt->bindParam(':idProducto', $idProducto, PDO::PARAM_INT);
            $stmt->execute();
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            $nuevaCategoria = $row['idCategoria'];
        }

        $sqlUpdate = "UPDATE productos SET descripcion = :descripcion, titulo = :titulo, idCategoria = :idCategoria, precio = :precio, masVendido = :masVendido,
        item1 = :item1, item2 = :item2, item3 = :item3, item4 = :item4, item5 = :item5,
        item6 = :item6, item7 = :item7, item8 = :item8, item9 = :item9, item10 = :item10
        WHERE idProducto = :idProducto";
        $sentenciaUpdate = $conexion->prepare($sqlUpdate);
        $sentenciaUpdate->bindParam(':descripcion', $nuevaDescripcion);
        $sentenciaUpdate->bindParam(':titulo', $nuevoTitulo);
        $sentenciaUpdate->bindParam(':idCategoria', $nuevaCategoria); 
        $sentenciaUpdate->bindParam(':precio', $nuevoPrecio);
        $sentenciaUpdate->bindParam(':masVendido', $masVendido); 
        $sentenciaUpdate->bindParam(':item1', $items['item1']);
        $sentenciaUpdate->bindParam(':item2', $items['item2']);
        $sentenciaUpdate->bindParam(':item3', $items['item3']);
        $sentenciaUpdate->bindParam(':item4', $items['item4']);
        $sentenciaUpdate->bindParam(':item5', $items['item5']);
        $sentenciaUpdate->bindParam(':item6', $items['item6']);
        $sentenciaUpdate->bindParam(':item7', $items['item7']);
        $sentenciaUpdate->bindParam(':item8', $items['item8']);
        $sentenciaUpdate->bindParam(':item9', $items['item9']);
        $sentenciaUpdate->bindParam(':item10', $items['item10']);
        $sentenciaUpdate->bindParam(':idProducto', $idProducto, PDO::PARAM_INT);

        if ($sentenciaUpdate->execute()) {
            echo json_encode(["mensaje" => "Producto actualizado correctamente"]);
        } else {
            echo json_encode(["error" => "Error al actualizar el producto: " . implode(", ", $sentenciaUpdate->errorInfo())]);
        }
        exit;
    }
} catch (PDOException $error) {
    echo json_encode(["error" => "Error de conexión: " . $error->getMessage()]);
}
?>
