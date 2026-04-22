import MainLayout from "../Layouts/MainLayout";
import { Navigate, createBrowserRouter } from "react-router-dom";
import Productos from '../Pages/Productos/Productos'
import Usuarios from '../Pages/Usuarios/Usuarios'
import Banners from "./Banners/Banners";
import Main from "./Main/Main";
import Contacto from "./Contacto/Contacto";
import Categorias from "./Categorias/Categorias";
import Codigos from "./Codigos/Codigos";
import Cajas from "./Cajas/Cajas";
import Mesas from "./Mesas/Mesas";
import Pedidos from "./Pedidos/Pedidos";
import PedidosCaja from './PedidosCaja/PedidosCaja';
import Login from '../Components/Admin/Login/Login';
import ForgotPassword from '../Components/Admin/Login/ForgotPassword';
import ResetPassword from '../Components/Admin/Login/ResetPassword';

const rawEnvBasename = (process.env.REACT_APP_BASENAME || process.env.PUBLIC_URL || '').replace(/\/$/, '');
const envBasename = rawEnvBasename === '.' ? '' : rawEnvBasename;
const runtimeBasename = typeof window !== 'undefined'
    ? (window.location.pathname.match(/^(.*\/public)(?:\/|$)/)?.[1] || '')
    : '';

const basename = envBasename || runtimeBasename || undefined;

export const router = createBrowserRouter([
    {
        path: "/login",
        element: <Login />,
    },
    {
        path: "/forgot-password",
        element: <ForgotPassword />,
    },
    {
        path: "/reset-password",
        element: <ResetPassword />,
    },
    {
        path: "/",
        element: <Navigate to="/login" replace />,
    },
    {
        path: "/",
        element: <MainLayout />,
        children: [
            {
                path: `/admin`,
                element: <Main />,
            },
            {
                path: `/admin/productos`,
                element: <Productos />,
            },
            {
                path: `/admin/usuarios`,
                element: <Usuarios />,
            },
            {
                path: `/admin/banners`,
                element: <Banners />,
            },
            {
                path: `/admin/contacto`,
                element: <Contacto />,
            },
            {
                path: `/admin/categorias`,
                element: <Categorias />,
            },
            {
                path: `/admin/codigos`,
                element: <Codigos />,
            },
            {
                path: `/admin/mesas`,
                element: <Mesas />,
            },
            {
                path: `/admin/pedidos`,
                element: <Pedidos />,
            },
            {
                path: `/admin/cajas`,
                element: <Cajas />,
            },
            {
                path: `/admin/pedidos-caja`,
                element: <PedidosCaja />,
            },
            {
                path: `/dashboard`,
                element: <Main />,
            },
            {
                path: `/dashboard/productos`,
                element: <Productos />,
            },
            {
                path: `/dashboard/usuarios`,
                element: <Usuarios />,
            },
            {
                path: `/dashboard/banners`,
                element: <Banners />,
            },
            {
                path: `/dashboard/contacto`,
                element: <Contacto />,
            },
            {
                path: `/dashboard/categorias`,
                element: <Categorias />,
            },
            {
                path: `/dashboard/codigos`,
                element: <Codigos />,
            },
            {
                path: `/dashboard/mesas`,
                element: <Mesas />,
            },
            {
                path: `/dashboard/pedidos`,
                element: <Pedidos />,
            },
            {
                path: `/dashboard/cajas`,
                element: <Cajas />,
            },
            {
                path: `/dashboard/pedidos-caja`,
                element: <PedidosCaja />,
            },
        ],
    },
], { basename });
