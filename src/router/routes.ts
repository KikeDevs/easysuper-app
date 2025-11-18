const routes = [
    {
        path: "/",
        name: "Inicio",
        component: () => import('../views/Pages/Inicio.vue'),
    },
    {
        path: "/login",
        name: "Login",
        component: () => import('../views/Pages/Login/Login.vue'),
    },
    {
        path: "/register",
        name: "Register",
        component: () => import('../views/Pages/Login/Register.vue'),
    },
    {
        path: "/olvidar",
        name: "Olvidar",
        component: () => import('../views/Pages/Login/ForPassword.vue'),
    },
    {
        path: "/users",
        name: "Users",
        component: () => import('../views/Pages/Home/Users.vue'),
        meta: {requiresAuth: true},
    },
    {
        path: "/home",
        name: "Home",
        component: () => import('../views/Pages/Home/Home.vue'),
        meta: {requiresAuth: true, requiresProfile: true},
    },
    {
        path: "/listas",
        name: "Listas",
        component: () => import('../views/Pages/Listas/Listas.vue'),
    },
    {
        path: "/lista/:listId?/:nameList?",
        name: "Lista",
        component: () => import('../views/Pages/Listas/Lista.vue'),
        props: (route:any) => ({
            listId: route.params.listId ? Number(route.params.listId) : 0,
            nameList: route.params.nameList ? String(route.params.nameList) : '',
        })
    },
    {
        path: "/compra/:userlistId?/:nameList?",
        name: "Compra",
        component: () => import('../views/Pages/Compras/Compra.vue'),
        props: (route:any) => ({
            userlistId: route.params.userlistId ? Number(route.params.userlistId) : 0,
            nameList: route.params.nameList ? String(route.params.nameList) : '',
        })
    },
    {
        path: "/ofertas",
        name: "Ofertas",
        component: () => import('../views/Pages/Ofertas/Ofertas.vue'),
        props: (route:any) => ({
            googleId: route.params.googleId ? String(route.params.googleId) : '',
        })
    },
    {
        path: "/mapa",
        name: "Mapa",
        component: () => import('../views/Pages/Home/Mapa.vue'),
    },
    {
        path: "/configs",
        name: "Configuraciones",
        component: () => import('../views/Pages/Configuraciones/Configuraciones.vue'),
    },
    {
        path: "/configs/admin-perfiles/",
        name: "AdministrarPerfiles",
        component: () => import('../views/Pages/Configuraciones/AdminPerfiles.vue'),
    },
    {
        path: "/configs/cuenta",
        name: "Cuenta",
        component: () => import('../views/Pages/Configuraciones/Cuenta.vue'),
    }
];
export default routes;
