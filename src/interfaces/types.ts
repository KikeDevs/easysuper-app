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

export interface Terminada{
    name_list: string
    perfil_updated: number
    name_perfil: string
}

