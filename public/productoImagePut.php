<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

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
$rutaweb = $_ENV['RUTA_WEB'];
$mensaje = "";
$carpetaImagenesRel = 'imagenes_productos';
$carpetaImagenesAbs = __DIR__ . DIRECTORY_SEPARATOR . $carpetaImagenesRel;

try {
    $dsn = "mysql:host=$servidor;dbname=$dbname";
    $conexion = new PDO($dsn, $usuario, $contrasena);
    $conexion->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    if (!file_exists($carpetaImagenesAbs)) {
        mkdir($carpetaImagenesAbs, 0777, true);
    }

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $idProducto = isset($_REQUEST['idProducto']) ? $_REQUEST['idProducto'] : null;

    
        if (!$idProducto) {
            echo json_encode(["error" => "Se requiere proporcionar un ID de producto para actualizar las imágenes."]);
            exit;
        }

        $nombreImagen1 = $_FILES['imagen1']['name'] ?? '';
        $rutaImagen1Completa = '';
        if (!empty($nombreImagen1)) {
            $nombreGuardado1 = time() . '_' . basename($nombreImagen1);
            $rutaImagen1 = $carpetaImagenesAbs . DIRECTORY_SEPARATOR . $nombreGuardado1;
            $rutaImagen1Web = $carpetaImagenesRel . '/' . $nombreGuardado1;
            
            if (move_uploaded_file($_FILES['imagen1']['tmp_name'], $rutaImagen1)) {
                $rutaImagen1Completa = rtrim($rutaweb, '/') . '/' . ltrim($rutaImagen1Web, '/');
            } else {
                echo json_encode(["error" => "Error al mover el archivo de imagen1"]);
                exit;
            }
        }

        $nombreImagen2 = $_FILES['imagen2']['name'] ?? '';
        $rutaImagen2Completa = '';
        if (!empty($nombreImagen2)) {
            $nombreGuardado2 = time() . '_2_' . basename($nombreImagen2);
            $rutaImagen2 = $carpetaImagenesAbs . DIRECTORY_SEPARATOR . $nombreGuardado2;
            $rutaImagen2Web = $carpetaImagenesRel . '/' . $nombreGuardado2;
            
            if (move_uploaded_file($_FILES['imagen2']['tmp_name'], $rutaImagen2)) {
                $rutaImagen2Completa = rtrim($rutaweb, '/') . '/' . ltrim($rutaImagen2Web, '/');
            } else {
                echo json_encode(["error" => "Error al mover el archivo de imagen2"]);
                exit;
            }
        }

        $nombreImagen3 = $_FILES['imagen3']['name'] ?? '';
        $rutaImagen3Completa = '';
        if (!empty($nombreImagen3)) {
            $nombreGuardado3 = time() . '_3_' . basename($nombreImagen3);
            $rutaImagen3 = $carpetaImagenesAbs . DIRECTORY_SEPARATOR . $nombreGuardado3;
            $rutaImagen3Web = $carpetaImagenesRel . '/' . $nombreGuardado3;
            
            if (move_uploaded_file($_FILES['imagen3']['tmp_name'], $rutaImagen3)) {
                $rutaImagen3Completa = rtrim($rutaweb, '/') . '/' . ltrim($rutaImagen3Web, '/');
            } else {
                echo json_encode(["error" => "Error al mover el archivo de imagen3"]);
                exit;
            }
        }

        $nombreImagen4 = $_FILES['imagen4']['name'] ?? '';
        $rutaImagen4Completa = '';
        if (!empty($nombreImagen4)) {
            $nombreGuardado4 = time() . '_4_' . basename($nombreImagen4);
            $rutaImagen4 = $carpetaImagenesAbs . DIRECTORY_SEPARATOR . $nombreGuardado4;
            $rutaImagen4Web = $carpetaImagenesRel . '/' . $nombreGuardado4;
            
            if (move_uploaded_file($_FILES['imagen4']['tmp_name'], $rutaImagen4)) {
                $rutaImagen4Completa = rtrim($rutaweb, '/') . '/' . ltrim($rutaImagen4Web, '/');
            } else {
                echo json_encode(["error" => "Error al mover el archivo de imagen4"]);
                exit;
            }
        }

        $sqlSelect = "SELECT imagen1, imagen2, imagen3, imagen4 FROM productos WHERE idProducto = :idProducto"; // Cambia de publicaciones a productos
        $sentenciaSelect = $conexion->prepare($sqlSelect);
        $sentenciaSelect->bindParam(':idProducto', $idProducto, PDO::PARAM_INT);
        $sentenciaSelect->execute();
        $valoresActuales = $sentenciaSelect->fetch(PDO::FETCH_ASSOC);
    
        $rutaImagen1Completa = $rutaImagen1Completa ?: $valoresActuales['imagen1'];
        $rutaImagen2Completa = $rutaImagen2Completa ?: $valoresActuales['imagen2'];
        $rutaImagen3Completa = $rutaImagen3Completa ?: $valoresActuales['imagen3'];
        $rutaImagen4Completa = $rutaImagen4Completa ?: $valoresActuales['imagen4'];

        $sqlUpdate = "UPDATE productos SET imagen1 = :imagen1, imagen2 = :imagen2, imagen3 = :imagen3, imagen4 = :imagen4 WHERE idProducto = :idProducto"; // Cambia de publicaciones a productos
        $sentenciaUpdate = $conexion->prepare($sqlUpdate);
        $sentenciaUpdate->bindParam(':imagen1', $rutaImagen1Completa);
        $sentenciaUpdate->bindParam(':imagen2', $rutaImagen2Completa);
        $sentenciaUpdate->bindParam(':imagen3', $rutaImagen3Completa);
        $sentenciaUpdate->bindParam(':imagen4', $rutaImagen4Completa);
        $sentenciaUpdate->bindParam(':idProducto', $idProducto, PDO::PARAM_INT);
    
        if ($sentenciaUpdate->execute()) {
            echo json_encode(["mensaje" => "Imágenes actualizadas correctamente"]);
        } else {
            echo json_encode(["error" => "Error al actualizar las imágenes: " . implode(", ", $sentenciaUpdate->errorInfo())]);
        }
        exit;
    }
} catch (PDOException $error) {
    echo json_encode(["error" => "Error de conexión: " . $error->getMessage()]);
}
?>

