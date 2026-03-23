<?php
header("Content-Type: application/json");
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

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
$mensaje = "";

try {
    $dsn = "mysql:host=$servidor;dbname=$dbname";
    $conexion = new PDO($dsn, $usuario, $contrasena);
    $conexion->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        // Consulta para obtener todos los banners con las imágenes
        $sqlSelect = "SELECT idBanner, imagen FROM `banner`";
        $stmt = $conexion->query($sqlSelect);
        $banners = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($banners as &$banner) {
            if (!empty($banner['imagen'])) {
                $imagen = str_replace('/./', '/', $banner['imagen']);
                $imagen = preg_replace('#^https?://localhost:8081/imagenes_banners/#', rtrim($rutaweb, '/') . '/imagenes_banners/', $imagen);
                $banner['imagen'] = $imagen;
            }
        }
        unset($banner);

        // Respuesta JSON con los banners y sus imágenes  
        echo json_encode(["banner" => $banners]);
    } else {
        echo json_encode(["error" => "Método no permitido"]);
    }
} catch (PDOException $error) {
    echo json_encode(["error" => "Error de conexión: " . $error->getMessage()]);
}
?>
