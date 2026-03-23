<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // Permitir solicitudes desde cualquier origen (no seguro para producción)

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
$rutaweb = $_ENV['RUTA_WEB'];

try {
    // Establecer conexión a la base de datos
    $dsn = "mysql:host=$servidor;dbname=$dbname";
    $conexion = new PDO($dsn, $usuario, $contrasena);
    $conexion->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Verificar el método de la solicitud
    $metodo = $_SERVER['REQUEST_METHOD'];

    // Consulta SQL para obtener todos los productos
    if ($metodo == 'GET') {
        $sqlSelect = "SELECT * FROM productos";
        $sentencia = $conexion->prepare($sqlSelect);

        if ($sentencia->execute()) {
            // Obtener resultados
            $resultado = $sentencia->fetchAll(PDO::FETCH_ASSOC);

            foreach ($resultado as &$producto) {
                foreach (['imagen1', 'imagen2', 'imagen3', 'imagen4'] as $campoImagen) {
                    if (!empty($producto[$campoImagen])) {
                        $imagen = str_replace('/./', '/', $producto[$campoImagen]);
                        $imagen = preg_replace('#^https?://localhost:8081/imagenes_productos/#', rtrim($rutaweb, '/') . '/imagenes_productos/', $imagen);
                        $producto[$campoImagen] = $imagen;
                    }
                }
            }
            unset($producto);

            // Imprimir datos en formato JSON
            echo json_encode(["productos" => $resultado]);
        } else {
            // Imprimir mensaje de error si la ejecución de la consulta falla
            echo json_encode(["error" => "Error al ejecutar la consulta SQL: " . implode(", ", $sentencia->errorInfo())]);
        }
    }
} catch (PDOException $error) {
    // Manejar errores específicos de la conexión
    echo json_encode(["error" => "Error de conexión: " . $error->getMessage()]);
} catch (Exception $error) {
    // Manejar otros tipos de errores
    echo json_encode(["error" => "Error desconocido: " . $error->getMessage()]);
}
?>
