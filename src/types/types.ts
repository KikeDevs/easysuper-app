export interface UserLite {
    user_id: number;
    username: string;
    email: string;
}

export interface RegisterResponse {
    status: "ok" | "warning" | "error";
    user?: UserLite;      // <- ahora es objeto, no number
    token?: string;       // <- token en claro (para guardarlo)
    message: string;
}

export interface LoginResponse {
    status: "ok" | "warning" | "error";
    user?: UserLite;
    token?: string;
    message: string;
}

export interface  Profile {
    profile_id: number
    name_perfil: string
    avatar?: string | null
}

//Listas
export interface miList {
    userlist_id: number
    list_id: number
    name_list: string
    emoji: string
    t_products: number
    status_list: number
}

export interface ListReboot {
    userlist_id: number
    name_list: string
    created_at: string
}

//Productos
export interface Departamento {
    departament_id: number
    name_departament: string
}

export interface Product {
    product_id: number;
    name_product: string;
    unit: string | null;
    content: string | null;
    brand: string | null;
    subcategory: string;
    category: string;
    departament_id: number | null;
    departament: string | null;
}

export interface ProductList {
    product_id: number;
    name_product: string;
    cantidad?: number;
    profile_updated: number;
    name_perfil: string;
    status_pro: number;
    name_subcategory: string;
    departament_id?: number | null;
}

export interface Terminada{
    name_list: string
    perfil_updated: number
    name_perfil: string
}

