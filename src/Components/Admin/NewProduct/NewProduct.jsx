import React, { useState, useEffect } from 'react';
import './NewProduct.css'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import baseURL from '../../url';

const PRODUCTOS_TOAST_CONTAINER_ID = 'admin-productos-toast';

export default function NewProduct({ onCreated }) {
    const [mensaje, setMensaje] = useState('');
    const [imagenPreview1, setImagenPreview1] = useState(null);
    const [imagenPreview2, setImagenPreview2] = useState(null);
    const [imagenPreview3, setImagenPreview3] = useState(null);
    const [imagenPreview4, setImagenPreview4] = useState(null);
    const [descripcion, setDescripcion] = useState('');
    const [titulo, setTitulo] = useState('');
    const [categoria, setCategoria] = useState('');
    const [masVendido, setMasVendido] = useState('');
    const [precio, setPrecio] = useState('');
    const [isImage1Selected, setIsImage1Selected] = useState(false);
    const [isImage2Selected, setIsImage2Selected] = useState(false);
    const [isImage3Selected, setIsImage3Selected] = useState(false);
    const [isImage4Selected, setIsImage4Selected] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [categorias, setCategoras] = useState([]);
    const [itemsOpcionales, setItemsOpcionales] = useState(Array.from({ length: 10 }, () => ''));

    const handleItemChange = (index, value) => {
        setItemsOpcionales((prev) => {
            const next = [...prev];
            next[index] = value;
            return next;
        });
    };
    const toggleModal = () => {
        setModalOpen(!modalOpen);
    };
    const handleImagenChange = (event, setImagenPreview, setIsImageSelected) => {
        const file = event.target.files[0];

        if (file) {

            const previewURL = URL.createObjectURL(file);
            setImagenPreview(previewURL);
            setIsImageSelected(true);
        }
    };


    const crear = async () => {
        const form = document.getElementById("crearForm");
        const formData = new FormData(form);
        const resetForm = () => {
            form.reset();
            setImagenPreview1(null);
            setImagenPreview2(null);
            setImagenPreview3(null);
            setImagenPreview4(null);
            setDescripcion('');
            setTitulo('');
            setCategoria('');
            setMasVendido('');
            setPrecio('');
            setItemsOpcionales(Array.from({ length: 10 }, () => ''));

            setIsImage1Selected(false);
            setIsImage2Selected(false);
            setIsImage3Selected(false);
            setIsImage4Selected(false);
        };
        setMensaje('');

        if (
            !formData.get('titulo') ||
            !formData.get('idCategoria') ||
            !formData.get('masVendido') ||
            !formData.get('precio')
        ) {
            toast.error('Por favor, complete los campos obligatorios (título, precio, categoría, más vendido).', { containerId: PRODUCTOS_TOAST_CONTAINER_ID });
            return;
        }

        setMensaje('Procesando...');

        try {
            const response = await fetch(`${baseURL}/productosPost.php`, {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (data.mensaje) {
                setMensaje('');
                resetForm();
                toast.success(data.mensaje, { containerId: PRODUCTOS_TOAST_CONTAINER_ID });
                setModalOpen(false);
                if (typeof onCreated === 'function') {
                    onCreated();
                }
            } else if (data.error) {
                setMensaje('');
                toast.error(data.error, { containerId: PRODUCTOS_TOAST_CONTAINER_ID });
                console.log(data.error);

            }
        } catch (error) {
            console.error('Error:', error);
            setMensaje('');
            toast.error('Error de conexión. Por favor, inténtelo de nuevo.', { containerId: PRODUCTOS_TOAST_CONTAINER_ID });

        }
    };


    const handleCategoriaChange = (e) => {
        setCategoria(e.target.value);
    };
    const handleMasVendidoChange = (e) => {
        setMasVendido(e.target.value);
    };

    useEffect(() => {
        cargarCategoria();

    }, []);


    const cargarCategoria = () => {
        fetch(`${baseURL}/categoriasGet.php`, {
            method: 'GET',
        })
            .then(response => response.json())
            .then(data => {
                setCategoras(data.categorias || []);
                console.log(data.categorias)
            })
            .catch(error => console.error('Error al cargar contactos:', error));
    };
    return (
        <div className='NewContain'>
            <button onClick={toggleModal} className='btnSave'>
                <span>  +</span> Agregar
            </button>
            {modalOpen && (
                <div className="modal">
                    <div className="modal-content">

                        <div className='deFlexBtnsModal'>
                            <button className='selected'>
                                Agregar Producto
                            </button>
                            <span className='close' onClick={toggleModal}>
                                &times;
                            </span>
                        </div>
                        <form id="crearForm">

                            <div className='flexGrap'>
                                <fieldset>
                                    <legend>Título (obligatorio)</legend>
                                    <input
                                        type="text"
                                        id="titulo"
                                        name="titulo"
                                        required
                                        value={titulo}
                                        onChange={(e) => setTitulo(e.target.value)}
                                    />
                                </fieldset>

                                <fieldset>
                                    <legend>Precio (obligatorio)</legend>
                                    <input
                                        type="number"
                                        id="precio"
                                        name="precio"
                                        min="0"
                                        step="0.01"
                                        required
                                        value={precio}
                                        onChange={(e) => setPrecio(e.target.value)}
                                    />
                                </fieldset>


                                <fieldset>
                                    <legend>Categoría (obligatorio)</legend>
                                    <select
                                        id="idCategoria"
                                        name="idCategoria"
                                        value={categoria}
                                        onChange={handleCategoriaChange}
                                    >
                                        <option value="">Selecciona una categoría</option>
                                        {categorias.map(item => (
                                            <option key={item.idCategoria} value={item.idCategoria}>{item.categoria}</option>
                                        ))}
                                    </select>
                                </fieldset>
                                <fieldset>
                                    <legend>Más vendido (obligatorio)</legend>
                                    <select
                                        id="masVendido"
                                        name="masVendido"
                                        value={masVendido}
                                        onChange={handleMasVendidoChange}
                                    >
                                        <option value="">Selecciona opcion</option>
                                        <option value="si">Si</option>
                                        <option value="no">No</option>

                                    </select>
                                </fieldset>
                                <fieldset id='descripcion'>
                                    <legend>Descripción</legend>
                                    <textarea
                                        id="descripcion"
                                        name="descripcion"
                                        value={descripcion}
                                        onChange={(e) => setDescripcion(e.target.value)}
                                        placeholder="Descripción"
                                    />
                                </fieldset>

                                {itemsOpcionales.map((valorItem, index) => (
                                    <fieldset key={`item-${index + 1}`}>
                                        <legend>Opción {index + 1} (opcional)</legend>
                                        <input
                                            type="text"
                                            id={`item${index + 1}`}
                                            name={`item${index + 1}`}
                                            value={valorItem}
                                            onChange={(e) => handleItemChange(index, e.target.value)}
                                            placeholder="Ej: Cas, Mora, Piña"
                                        />
                                    </fieldset>
                                ))}




                                <fieldset>
                                    <legend>Imagen 1 (opcional)</legend>
                                    <input
                                        type="file"
                                        id="imagen1"
                                        name="imagen1"
                                        accept="image/*"
                                        onChange={(e) => handleImagenChange(e, setImagenPreview1, setIsImage1Selected)}
                                    />
                                </fieldset>
                                <fieldset>
                                    <legend>Imagen 2 (opcional)</legend>
                                    <input
                                        type="file"
                                        id="imagen2"
                                        name="imagen2"
                                        accept="image/*"
                                        onChange={(e) => handleImagenChange(e, setImagenPreview2, setIsImage2Selected)}
                                    />
                                </fieldset>

                                <fieldset>
                                    <legend>Imagen 3 (opcional)</legend>
                                    <input
                                        type="file"
                                        id="imagen3"
                                        name="imagen3"
                                        accept="image/*"
                                        onChange={(e) => handleImagenChange(e, setImagenPreview3, setIsImage3Selected)}
                                    />
                                </fieldset>
                                <fieldset>
                                    <legend>Imagen 4 (opcional)</legend>

                                    <input
                                        type="file"
                                        id="imagen4"
                                        name="imagen4"
                                        accept="image/*"
                                        onChange={(e) => handleImagenChange(e, setImagenPreview4, setIsImage4Selected)}
                                    />
                                </fieldset>

                            </div>
                            {(isImage1Selected || isImage2Selected || isImage3Selected || isImage4Selected) &&
                                <div className='previevCategori'>
                                    {isImage1Selected && <img src={imagenPreview1} alt="Vista previa 1" />}
                                    {isImage2Selected && <img src={imagenPreview2} alt="Vista previa 2" />}
                                    {isImage3Selected && <img src={imagenPreview3} alt="Vista previa 3" />}
                                    {isImage4Selected && <img src={imagenPreview4} alt="Vista previa 4" />}
                                </div>
                            }
                            {mensaje ? (
                                <button type="button" className='btnLoading' disabled>
                                    {mensaje}
                                </button>
                            ) : (
                                <button type="button" onClick={crear} className='btnPost'>
                                    Agregar
                                </button>
                            )}


                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}

