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
