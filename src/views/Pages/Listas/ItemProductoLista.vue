<script setup lang="ts">
import IconCustom from "@/views/Components/IconCustom.vue";
import {Product, ProductList} from "@/interfaces/products";
import {computed} from "vue";
import {getUrlBase} from "@/services/services";

const props = defineProps<{
  item?: Product,
  itemDetails?: ProductList
}>();

const CATEGORY_ICON: Record<number, string> = {
  1: "oil-can",                  // Aceites y Grasas Vegetales
  2: "utensils",                 // Alimentos Preparados y Cocinados
  3: "wheat",                    // Arroz y Cereales
  4: "toilet-paper-blank-under", // Artículos de Papel de Higiene Personal
  5: "candle-lotus-yoga",        // Artículos para el Cuidado Personal
  6: "cube",                     // Azúcar
  7: "mug-hot",                  // Café
  8: "meat",                     // Carnes
  9: "sausage",                  // Carnes Frías Secas y Embutidos
  10: "candy",                   // Chocolates y Golosinas
  11: "pepper-hot",              // Condimentos, Especias y Sales
  12: "jar-alt",                     // Conservas
  13: "milk-alt",                // Derivados de Leche
  14: "spray-can-sparkles",      // Detergentes
  15: "plug",                    // Electrónica
  16: "capsules",                // Farmacia
  17: "apple-whole",             // Frutas Frescas
  18: "cookie",                  // Galletas
  19: "carrot",                  // Hortalizas Frescas
  20: "egg",                     // Huevo
  21: "seedling",                // Legumbres Secas
  22: "paw",                     // Mascotas
  23: "pills",                   // Medicamentos
  24: "box",                     // Miscelánea
  25: "bread-slice",             // Pan
  26: "wheat",                   // Pastas y Harinas de Trigo
  27: "fish",                    // Pescados y Mariscos
  28: "water-bottle",            // Refrescos Envasados
  29: "seedling",                // Semillas
  30: "cheese",                  // Tortillas y Derivados del Maíz
  31: "detergent",               // Utensilios Domésticos
  32: "wine-bottle"              // Vinos, Licores y Cerveza
};

// ahora tomamos category_id
const categoryId = computed<number | null>(() =>
    (props.item as any)?.category_id
    ?? (props.itemDetails as any)?.category_id
    ?? null
);

const categoryIcon = computed<string>(() => {
  const id = categoryId.value ?? -1;
  return CATEGORY_ICON[id] ?? "box";
});
</script>

<template>
  <div class="relative flex items-center gap-2 py-2.5 border-b border-b-gray-400">
    <div class="bg-gray-200 rounded-full w-14 h-14 overflow-hidden flex justify-center items-center">
      <img
          v-if="item?.name_brand && Number(item?.patrocinio) === 1"
          :src="getUrlBase(`images/brands/${item.name_brand}.png`)"
          :alt="item.name_brand"
          class="w-full h-full object-cover"
      />

      <img
          v-else-if="itemDetails?.name_brand && Number(itemDetails?.patrocinio) === 1"
          :src="getUrlBase(`images/brands/${itemDetails.name_brand}.png`)"
          :alt="itemDetails.name_brand"
          class="w-full h-full object-cover"
      />

      <icon-custom
          v-else
          :icon="categoryIcon"
          size="3xl"
          class="not-dark:text-blue-500 dark:text-gray-800"
      />
    </div>

    <div class="flex-1 w-full text-wrap flex flex-col justify-center">
      <p class="font-bold">
        {{ item?.name_product ?? itemDetails?.name_product ?? 'Producto' }}
      </p>
      <span class="w-fit h-fit px-2 py-0.5 rounded-full text-[10px] bg-blue-400 dark:bg-gray-800 text-white dark:text-gray-300">
        {{ item?.subcategory ?? itemDetails?.name_subcategory ?? 'Subcategoría' }}
      </span>
    </div>

    <slot/>
  </div>
</template>