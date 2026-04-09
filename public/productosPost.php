<?php
header("Content-Type: application/json");
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
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

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {

        // Campos obligatorios
        $titulo = isset($_POST['titulo']) && trim($_POST['titulo']) !== '' ? $_POST['titulo'] : null;
        $precio = isset($_POST['precio']) && trim($_POST['precio']) !== '' ? $_POST['precio'] : null;
        $idCategoria = isset($_POST['idCategoria']) && trim($_POST['idCategoria']) !== '' ? $_POST['idCategoria'] : null;
        $masVendido = isset($_POST['masVendido']) && trim($_POST['masVendido']) !== '' ? $_POST['masVendido'] : 'no';

        // Campos opcionales
        $descripcion = isset($_POST['descripcion']) ? trim((string)$_POST['descripcion']) : '';
        if ($descripcion === '') {
            $descripcion = 'Sin descripcion';
        }
        $precioAnterior = isset($_POST['precioAnterior']) && trim($_POST['precioAnterior']) !== '' ? $_POST['precioAnterior'] : null;
        $item1 = isset($_POST['item1']) && trim($_POST['item1']) !== '' ? $_POST['item1'] : null;
        $item2 = isset($_POST['item2']) && trim($_POST['item2']) !== '' ? $_POST['item2'] : null;
        $item3 = isset($_POST['item3']) && trim($_POST['item3']) !== '' ? $_POST['item3'] : null;
        $item4 = isset($_POST['item4']) && trim($_POST['item4']) !== '' ? $_POST['item4'] : null;
        $item5 = isset($_POST['item5']) && trim($_POST['item5']) !== '' ? $_POST['item5'] : null;
        $item6 = isset($_POST['item6']) && trim($_POST['item6']) !== '' ? $_POST['item6'] : null;
        $item7 = isset($_POST['item7']) && trim($_POST['item7']) !== '' ? $_POST['item7'] : null;
        $item8 = isset($_POST['item8']) && trim($_POST['item8']) !== '' ? $_POST['item8'] : null;
        $item9 = isset($_POST['item9']) && trim($_POST['item9']) !== '' ? $_POST['item9'] : null;
        $item10 = isset($_POST['item10']) && trim($_POST['item10']) !== '' ? $_POST['item10'] : null;

        // Validar campos obligatorios
        if (empty($titulo) || empty($precio) || empty($idCategoria)) {
            echo json_encode(["error" => "Titulo, precio e idCategoria son obligatorios"]);
            exit;
        }

        // Procesar imágenes si existen (OPCIONALES)
        $rutaImagenCompleta = '';
        $rutaImagen2Completa = '';
        $rutaImagen3Completa = '';
        $rutaImagen4Completa = '';

        $imagenesPresentes = isset($_FILES['imagen1']) || isset($_FILES['imagen2']) || isset($_FILES['imagen3']) || isset($_FILES['imagen4']);

        if ($imagenesPresentes) {
            // Crear carpeta para imágenes si no existe
            $carpetaImagenes = 'imagenes_productos';
            if (!file_exists($carpetaImagenes)) {
                mkdir($carpetaImagenes, 0777, true);
            }

            // Subir imagen1
            if (isset($_FILES['imagen1']) && $_FILES['imagen1']['error'] === UPLOAD_ERR_OK) {
                $nombreImagen = time() . '_' . basename($_FILES['imagen1']['name']);
                $rutaImagen = $carpetaImagenes . '/' . $nombreImagen;
                if (move_uploaded_file($_FILES['imagen1']['tmp_name'], $rutaImagen)) {
                    $rutaImagenCompleta = rtrim($rutaweb, '/') . '/' . ltrim($rutaImagen, '/');
                }
            }

            // Subir imagen2
            if (isset($_FILES['imagen2']) && $_FILES['imagen2']['error'] === UPLOAD_ERR_OK) {
                $nombreImagen2 = time() . '_2_' . basename($_FILES['imagen2']['name']);
                $rutaImagen2 = $carpetaImagenes . '/' . $nombreImagen2;
                if (move_uploaded_file($_FILES['imagen2']['tmp_name'], $rutaImagen2)) {
                    $rutaImagen2Completa = rtrim($rutaweb, '/') . '/' . ltrim($rutaImagen2, '/');
                }
            }

            // Subir imagen3
            if (isset($_FILES['imagen3']) && $_FILES['imagen3']['error'] === UPLOAD_ERR_OK) {
                $nombreImagen3 = time() . '_3_' . basename($_FILES['imagen3']['name']);
                $rutaImagen3 = $carpetaImagenes . '/' . $nombreImagen3;
                if (move_uploaded_file($_FILES['imagen3']['tmp_name'], $rutaImagen3)) {
                    $rutaImagen3Completa = rtrim($rutaweb, '/') . '/' . ltrim($rutaImagen3, '/');
                }
            }

            // Subir imagen4
            if (isset($_FILES['imagen4']) && $_FILES['imagen4']['error'] === UPLOAD_ERR_OK) {
                $nombreImagen4 = time() . '_4_' . basename($_FILES['imagen4']['name']);
                $rutaImagen4 = $carpetaImagenes . '/' . $nombreImagen4;
                if (move_uploaded_file($_FILES['imagen4']['tmp_name'], $rutaImagen4)) {
                    $rutaImagen4Completa = rtrim($rutaweb, '/') . '/' . ltrim($rutaImagen4, '/');
                }
            }
        }

        // Insertar producto en BD (imágenes opcionales)
        $sqlInsert = "INSERT INTO `productos` (descripcion, titulo, precio, idCategoria, masVendido, imagen1, imagen2, imagen3, imagen4,
         item1, item2, item3, item4, item5, item6, item7, item8, item9, item10, precioAnterior) 
         VALUES (:descripcion, :titulo, :precio, :idCategoria, :masVendido, :imagen1, :imagen2, :imagen3, :imagen4,
         :item1, :item2, :item3, :item4, :item5, :item6, :item7, :item8, :item9, :item10, :precioAnterior)";

        try {
            $stmt = $conexion->prepare($sqlInsert);
            $stmt->bindParam(':descripcion', $descripcion);
            $stmt->bindParam(':titulo', $titulo);
            $stmt->bindParam(':precio', $precio);
            $stmt->bindParam(':idCategoria', $idCategoria);
            $stmt->bindParam(':masVendido', $masVendido);
            $stmt->bindParam(':imagen1', $rutaImagenCompleta);
            $stmt->bindParam(':imagen2', $rutaImagen2Completa);
            $stmt->bindParam(':imagen3', $rutaImagen3Completa);
            $stmt->bindParam(':imagen4', $rutaImagen4Completa);
            $stmt->bindParam(':item1', $item1);
            $stmt->bindParam(':item2', $item2);
            $stmt->bindParam(':item3', $item3);
            $stmt->bindParam(':item4', $item4);
            $stmt->bindParam(':item5', $item5);
            $stmt->bindParam(':item6', $item6);
            $stmt->bindParam(':item7', $item7);
            $stmt->bindParam(':item8', $item8);
            $stmt->bindParam(':item9', $item9);
            $stmt->bindParam(':item10', $item10);
            $stmt->bindParam(':precioAnterior', $precioAnterior);
            $stmt->execute();

            $lastId = $conexion->lastInsertId();

            echo json_encode([
                "ok" => true,
                "mensaje" => "Producto creado exitosamente",
                "idProducto" => $lastId,
                "imagen1" => $rutaImagenCompleta,
                "imagen2" => $rutaImagen2Completa,
                "imagen3" => $rutaImagen3Completa,
                "imagen4" => $rutaImagen4Completa
            ]);
        } catch (PDOException $e) {
            echo json_encode(["error" => "Error al insertar producto: " . $e->getMessage()]);
        }
    } else {
        echo json_encode(["error" => "Método no permitido"]);
    }
} catch (PDOException $error) {
    echo json_encode(["error" => "Error de conexión: " . $error->getMessage()]);
}
?>
