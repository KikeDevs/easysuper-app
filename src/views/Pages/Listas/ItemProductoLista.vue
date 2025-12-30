<script setup lang="ts">
import IconCustom from "@/views/Components/IconCustom.vue";
import {Product, ProductList} from "@/interfaces/products";
import {computed} from "vue";

const props = defineProps<{
  item?: Product,
  itemDetails?: ProductList
}>();

const DEPT_ICON: Record<number, string> = {
  1: "grocery-bag",                // Abarrotes
  2: "milk-alt",                  // Lácteos
  3: "apple-whole",                 // Frutas y verduras
  4: "beer",                  // Cervezas, vinos y licores
  5: "sausage",               // Salchichonería
  6: "candle-lotus-yoga",                   // Belleza y cuidado personal
  7: "water-bottle",              // Jugos y bebidas
  8: "fish",                  // Carnes, pescados y mariscos
  9: "snowflake",             // Congelados
  10: "tshirt",               // Cuidado de la ropa
  11: "toilet-paper-blank-under",         // Higiénicos
  12: "home-care",            // Cuidado del hogar
  13: "bread",                // Panadería
  14: "baby",                 // Bebés
  15: "paw",                  // Mascotas
  16: "capsules",                 // Farmacia
};

// 2) Obtén el departament_id desde item o itemDetails
const departamentId = computed<number | null>(() =>
    (props.item as any)?.departament_id
    ?? (props.itemDetails as any)?.departament_id
    ?? null
);

// 3) Computed del icono (con fallback)
const deptIcon = computed<string>(() => {
  const id = departamentId.value ?? -1;
  return DEPT_ICON[id] ?? "box"; // "box" o el que quieras como default
});

</script>

<template>
  <div class="relative flex items-center gap-2 py-2.5 border-b border-b-gray-400">
    <!-- avatar / icono -->
    <div class="bg-gray-200 rounded-full w-14 h-14 overflow-hidden flex justify-center items-center">
      <!-- LOGO: solo si hay marca y patrocinio -->
      <img
          v-if="item?.brand && item?.patrocinio === 1"
          :src="'http://srv1170449.hstgr.cloud/images/brands/' + item.brand + '.png'"
          :alt="item.brand"
          class="w-full h-full object-cover"
      />

      <img
          v-else-if="itemDetails?.brand && itemDetails?.patrocinio === 1"
          :src="'http://srv1170449.hstgr.cloud/images/brands/' + itemDetails.brand + '.png'"
          :alt="itemDetails.brand"
          class="w-full h-full object-cover"
      />

      <!-- ICONO: todos los demás casos -->
      <icon-custom
          v-else
          :icon="deptIcon"
          size="3xl"
          class="not-dark:text-blue-500 dark:text-gray-800"
      />
    </div>

    <!-- texto -->
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