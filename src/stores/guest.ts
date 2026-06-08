import { defineStore } from "pinia";
import { ref } from "vue";

export interface GuestProduct {
  product_id: number;
  name_product: string;
  checked: boolean;
}

export interface GuestList {
  id: string;
  name: string;
  items: GuestProduct[];
  created_at: number;
}

const STORAGE_KEY = "guest_lists";

function loadFromStorage(): GuestList[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveToStorage(lists: GuestList[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lists));
}

export const useGuestStore = defineStore("guest", () => {
  const lists = ref<GuestList[]>(loadFromStorage());

  function addList(name: string): GuestList {
    const list: GuestList = {
      id: Date.now().toString(),
      name,
      items: [],
      created_at: Date.now(),
    };
    lists.value.push(list);
    saveToStorage(lists.value);
    return list;
  }

  function deleteList(id: string) {
    lists.value = lists.value.filter(l => l.id !== id);
    saveToStorage(lists.value);
  }

  function getList(id: string): GuestList | undefined {
    return lists.value.find(l => l.id === id);
  }

  function addProduct(listId: string, product: { product_id: number; name_product: string }) {
    const list = lists.value.find(l => l.id === listId);
    if (!list) return;
    const already = list.items.some(i => i.product_id === product.product_id);
    if (already) return;
    list.items.push({ ...product, checked: false });
    saveToStorage(lists.value);
  }

  function removeProduct(listId: string, productId: number) {
    const list = lists.value.find(l => l.id === listId);
    if (!list) return;
    list.items = list.items.filter(i => i.product_id !== productId);
    saveToStorage(lists.value);
  }

  function toggleProduct(listId: string, productId: number) {
    const list = lists.value.find(l => l.id === listId);
    if (!list) return;
    const item = list.items.find(i => i.product_id === productId);
    if (item) item.checked = !item.checked;
    saveToStorage(lists.value);
  }

  return { lists, addList, deleteList, getList, addProduct, removeProduct, toggleProduct };
});
