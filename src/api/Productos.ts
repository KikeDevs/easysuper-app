import {api} from "@/services/api";
import {Departamento} from "@/interfaces/types";
import {Product} from "@/interfaces/products";
import {Brand, BrandSuper} from "@/interfaces/brands";
import {data} from "autoprefixer";
import {error} from "@capacitor/assets/dist/util/log";

interface DepartmentResponse {
    status: 'ok' | 'error' | 'warning';
    departaments?: Departamento[]
    message: string;
}

export async function getDepartaments(): Promise<DepartmentResponse> {
    try {
        const resp = await api.post<DepartmentResponse>('departaments',{});
        return resp.data;
    } catch (error: any){
        const message = error?.response?.data?.message
            ?? error?.message
            ?? "Error de red al registrar";
        return { status: "error", message };
    }
}

interface ProductResponse {
    status: 'ok' | 'error' | 'warning';
    products?: Product[];
    message: string;
    meta?: {
        current_page: number;
        per_page: number;
        total: number;
        last_page: number;
        }
}

export async function getProducts(deparId: number,buscar?: string): Promise<ProductResponse> {
    try {
        const resp = await api.post<ProductResponse>('products', {
            departament_id: deparId,
            buscar: buscar,
        });
        return resp.data;
    } catch (error: any) {
        const message = error?.response?.data?.message
        ?? error?.message
        ?? "Error de red al registrar";
        return { status: "error", message };
    }

}

interface BrandResponse {
    status: 'ok' | 'error' | 'warning';
    brands?: Brand[];
    brands_super?: BrandSuper[];
    message: string;
}

export async function getBrands(): Promise<BrandResponse> {
    try{
        const resp = await api.post<BrandResponse>('brands', {});
        return resp.data;
    } catch (error: any){
        const message = error?.response?.data?.message
        ?? error?.message
        ?? "Error de red al registrar";
        return { status: "error", message };
    }
}

export async function getBrandsSuper(): Promise<BrandResponse> {
    try {
        const resp = await api.post<BrandResponse>('brands-super',{});
        return resp.data;
    } catch (error: any) {
        const message = error?.response?.data?.message
        ?? error?.message
        ?? "Error de red al registrar";
        return { status: "error", message };
    }
}

interface actionProductResponse {
    status: 'ok' | 'error' | 'warning';
    message: string;
}

export async function addProduct(userlist_id: number,product_id:number,profile_id?: number): Promise<actionProductResponse> {
    try {
        const resp = await api.post<ProductResponse>('add-product',
            {
                userlist_id: userlist_id,
                product_id: product_id,
                perfil_id: profile_id,
            });
        return resp.data;
    } catch (error: any){
        const message = error?.response?.data?.message
        ?? error?.message
        ?? "Error de red al registrar";
        return { status: "error", message };
    }
}

export async function deleteProduct(userlist_id: number,product_id: number): Promise<actionProductResponse> {
    try {
        const resp = await api.post<ProductResponse>('delete-product', {userlist_id: userlist_id, product_id: product_id});
        return resp.data;
    } catch (error: any) {
        const message = error?.response?.data?.message
        ?? error?.message
        ?? "Error de red al registrar";
        return { status: "error", message };
    }
}

export async function addProductHome(userlistId: number,perfilId: number, selP: Product[]): Promise<actionProductResponse> {
    try {
        const resp = await api.post<actionProductResponse>('add-product-home',{
            userlist_id: userlistId,
            perfil_id: perfilId,
            sel_products: selP,
        });
        return resp.data;
    } catch (error: any) {
        const message = error?.response?.data?.message
        ?? error?.message
        ?? "Error de red al registrar";
        return { status: "error", message };
    }
}