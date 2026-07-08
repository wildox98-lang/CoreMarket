import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg(process.env.DATABASE_URL ?? "");
const db = new PrismaClient({ adapter });

function img(photoId: number, alt: string, position = 0) {
  return {
    url: `https://picsum.photos/id/${photoId}/1200/1200`,
    alt,
    position,
  };
}

// Curated, hand-checked photo IDs (see design notes) reused per category so
// the catalog reads as one consistent editorial mood board rather than
// random unrelated stock photography.
const CATEGORY_PHOTOS: Record<string, [number, number]> = {
  proteinas: [19, 30],
  "creatina-rendimiento": [53, 89],
  aminoacidos: [18, 89],
  "vitaminas-minerales": [106, 25],
  superalimentos: [102, 112],
  "frutos-secos-semillas": [112, 102],
  "snacks-saludables": [63, 30],
  "bienestar-natural": [25, 116],
};

const categories = [
  {
    slug: "proteinas",
    name: "Proteínas",
    description:
      "Whey, caseína y proteínas vegetales para recuperación y desarrollo muscular.",
    image: "https://picsum.photos/id/19/1200/900",
    position: 1,
  },
  {
    slug: "creatina-rendimiento",
    name: "Creatina & Rendimiento",
    description: "Creatina, pre-entrenos y fórmulas para llevar tu fuerza al siguiente nivel.",
    image: "https://picsum.photos/id/53/1200/900",
    position: 2,
  },
  {
    slug: "aminoacidos",
    name: "Aminoácidos",
    description: "BCAA, glutamina y aminoácidos esenciales para reducir el catabolismo.",
    image: "https://picsum.photos/id/18/1200/900",
    position: 3,
  },
  {
    slug: "vitaminas-minerales",
    name: "Vitaminas & Minerales",
    description: "Multivitamínicos y minerales para sostener tu energía día a día.",
    image: "https://picsum.photos/id/106/1200/900",
    position: 4,
  },
  {
    slug: "superalimentos",
    name: "Superalimentos",
    description: "Espirulina, maca, cacao crudo y otros concentrados de nutrientes.",
    image: "https://picsum.photos/id/102/1200/900",
    position: 5,
  },
  {
    slug: "frutos-secos-semillas",
    name: "Frutos Secos & Semillas",
    description: "Almendras, nueces, semillas y mixes a granel, tostados en casa.",
    image: "https://picsum.photos/id/112/1200/900",
    position: 6,
  },
  {
    slug: "snacks-saludables",
    name: "Snacks Saludables",
    description: "Barritas, chips y dulces naturales sin azúcar agregada.",
    image: "https://picsum.photos/id/63/1200/900",
    position: 7,
  },
  {
    slug: "bienestar-natural",
    name: "Bienestar Natural",
    description: "Tés, adaptógenos y aceites para acompañar tu rutina de bienestar.",
    image: "https://picsum.photos/id/25/1200/900",
    position: 8,
  },
];

const brands = [
  {
    slug: "core-market-select",
    name: "Core Market Select",
    logo: "https://picsum.photos/seed/brand-select/200/200",
  },
  {
    slug: "nutriforce",
    name: "NutriForce",
    logo: "https://picsum.photos/seed/brand-nutriforce/200/200",
  },
  {
    slug: "andes-naturals",
    name: "Andes Naturals",
    logo: "https://picsum.photos/seed/brand-andes/200/200",
  },
  {
    slug: "purovital",
    name: "PuroVital",
    logo: "https://picsum.photos/seed/brand-purovital/200/200",
  },
  {
    slug: "cosecha-real",
    name: "Cosecha Real",
    logo: "https://picsum.photos/seed/brand-cosecha/200/200",
  },
];

type ProductSeed = {
  slug: string;
  name: string;
  categorySlug: string;
  brandSlug: string;
  shortDescription: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  tags: string;
  featured?: boolean;
  isNew?: boolean;
  isBestSeller?: boolean;
  nutritionFacts?: Record<string, string>;
  images: { seed: string; alt: string }[];
  reviews: { authorName: string; rating: number; comment: string }[];
};

const products: ProductSeed[] = [
  {
    slug: "whey-protein-concentrado-900g-chocolate",
    name: "Whey Protein Concentrado 900g – Chocolate",
    categorySlug: "proteinas",
    brandSlug: "core-market-select",
    shortDescription: "24g de proteína por pomo, mezcla instantánea, sabor chocolate belga.",
    description:
      "Nuestra proteína de suero insignia: 24g de proteína completa por pomo, bajo en azúcares y con una mezcla instantánea que se disuelve sin grumos. Ideal como recuperación post-entrenamiento o para sumar proteína de calidad a tu día. Elaborada con leche de tambos argentinos.",
    price: 52000,
    compareAtPrice: 61000,
    stock: 48,
    tags: "sin-tacc,alto-en-proteina",
    featured: true,
    isBestSeller: true,
    nutritionFacts: {
      porcion: "30g (1 pomo)",
      calorias: "120 kcal",
      proteina: "24g",
      carbohidratos: "3g",
      grasas: "1.5g",
    },
    images: [
      { seed: "whey-choc-1", alt: "Pomo de whey protein sabor chocolate sobre mesada de madera" },
      { seed: "whey-choc-2", alt: "Batido de proteína chocolate en coctelera" },
    ],
    reviews: [
      { authorName: "Martín G.", rating: 5, comment: "El sabor es el mejor que probé, no queda arenoso." },
      { authorName: "Lucía R.", rating: 5, comment: "Se disuelve perfecto y no hincha. Repito siempre." },
      { authorName: "Fede A.", rating: 4, comment: "Muy buena relación precio-calidad para el nivel de proteína." },
    ],
  },
  {
    slug: "whey-protein-concentrado-900g-vainilla",
    name: "Whey Protein Concentrado 900g – Vainilla",
    categorySlug: "proteinas",
    brandSlug: "core-market-select",
    shortDescription: "24g de proteína por pomo, sabor vainilla suave, ideal para combinar.",
    description:
      "La versión vainilla de nuestra whey insignia. Un sabor neutro y suave que combina perfecto con frutas, avena o café para tus batidos caseros. 24g de proteína por porción, sin azúcares agregados.",
    price: 52000,
    stock: 40,
    tags: "sin-tacc,alto-en-proteina",
    isBestSeller: true,
    nutritionFacts: {
      porcion: "30g (1 pomo)",
      calorias: "118 kcal",
      proteina: "24g",
      carbohidratos: "2.5g",
      grasas: "1.5g",
    },
    images: [
      { seed: "whey-van-1", alt: "Pomo de whey protein sabor vainilla" },
      { seed: "whey-van-2", alt: "Batido de proteína vainilla con banana" },
    ],
    reviews: [
      { authorName: "Sabrina L.", rating: 5, comment: "Ideal para mezclar con licuados de fruta." },
      { authorName: "Diego M.", rating: 4, comment: "Buen sabor, un poco dulce para mi gusto pero muy bueno." },
    ],
  },
  {
    slug: "proteina-vegetal-arveja-vainilla-800g",
    name: "Proteína Vegetal de Arveja 800g – Vainilla",
    categorySlug: "proteinas",
    brandSlug: "andes-naturals",
    shortDescription: "100% vegetal, sin lactosa, perfil completo de aminoácidos.",
    description:
      "Proteína aislada de arveja amarilla, 100% de origen vegetal y sin lactosa. Perfecta para quienes eligen una alimentación basada en plantas sin resignar rendimiento. Textura cremosa gracias a su micronizado especial.",
    price: 47000,
    stock: 26,
    tags: "vegano,sin-tacc,sin-lactosa",
    isNew: true,
    nutritionFacts: {
      porcion: "33g (1 pomo)",
      calorias: "125 kcal",
      proteina: "22g",
      carbohidratos: "4g",
      grasas: "2g",
    },
    images: [
      { seed: "protein-arveja-1", alt: "Proteína vegetal de arveja envasada" },
      { seed: "protein-arveja-2", alt: "Batido vegetal verde con proteína de arveja" },
    ],
    reviews: [
      { authorName: "Cami T.", rating: 5, comment: "Al fin una vegetal que no tiene gusto a tierra." },
      { authorName: "Nico P.", rating: 4, comment: "Se disuelve bien, sabor suave." },
    ],
  },
  {
    slug: "caseina-micelar-900g-dulce-de-leche",
    name: "Caseína Micelar 900g – Dulce de Leche",
    categorySlug: "proteinas",
    brandSlug: "nutriforce",
    shortDescription: "Liberación lenta ideal para la noche, sabor dulce de leche.",
    description:
      "Proteína de digestión lenta que nutre tus músculos mientras descansás. Con sabor a dulce de leche bien argentino. Recomendada antes de dormir o en ayunos prolongados.",
    price: 58000,
    stock: 18,
    tags: "sin-tacc,alto-en-proteina",
    images: [
      { seed: "caseina-1", alt: "Pote de caseína micelar sabor dulce de leche" },
      { seed: "caseina-2", alt: "Batido cremoso de caseína" },
    ],
    reviews: [
      { authorName: "Rocío V.", rating: 5, comment: "El sabor es un golazo, se siente a dulce de leche real." },
    ],
  },
  {
    slug: "creatina-monohidratada-300g",
    name: "Creatina Monohidratada 300g",
    categorySlug: "creatina-rendimiento",
    brandSlug: "core-market-select",
    shortDescription: "Creatina pura micronizada, sin sabor, 100 porciones.",
    description:
      "Creatina monohidratada micronizada de máxima pureza. Sin sabor ni aditivos, se disuelve fácilmente en agua, jugo o tu batido de proteína. El suplemento más estudiado para fuerza y potencia.",
    price: 28000,
    compareAtPrice: 33000,
    stock: 60,
    tags: "sin-tacc,sin-sabor",
    featured: true,
    isBestSeller: true,
    nutritionFacts: {
      porcion: "3g (1 medida)",
      creatina: "3g",
    },
    images: [
      { seed: "creatina-1", alt: "Pote de creatina monohidratada micronizada" },
      { seed: "creatina-2", alt: "Medida de creatina sobre mesada" },
    ],
    reviews: [
      { authorName: "Tomás B.", rating: 5, comment: "La de siempre, no falla nunca." },
      { authorName: "Agustina F.", rating: 5, comment: "Se disuelve perfecto, no tiene sabor a nada." },
      { authorName: "Ezequiel D.", rating: 4, comment: "Buena pureza y precio justo." },
    ],
  },
  {
    slug: "pre-entreno-citrus-300g",
    name: "Pre-Entreno Citrus Blast 300g",
    categorySlug: "creatina-rendimiento",
    brandSlug: "nutriforce",
    shortDescription: "Energía, foco y bombeo muscular antes de entrenar.",
    description:
      "Fórmula con cafeína natural, citrulina y beta-alanina para maximizar tu energía y bombeo en el gimnasio. Sabor cítrico refrescante, ideal 20 minutos antes de entrenar.",
    price: 39000,
    stock: 22,
    tags: "con-cafeina",
    isNew: true,
    nutritionFacts: {
      porcion: "10g (1 medida)",
      cafeina: "200mg",
      citrulina: "6g",
    },
    images: [
      { seed: "preentreno-1", alt: "Pote de pre-entreno sabor cítrico" },
      { seed: "preentreno-2", alt: "Shaker con pre-entreno color amarillo" },
    ],
    reviews: [
      { authorName: "Bruno S.", rating: 5, comment: "La energía dura todo el entrenamiento sin bajón." },
    ],
  },
  {
    slug: "hmb-capsulas-90u",
    name: "HMB 1000mg 90 Cápsulas",
    categorySlug: "creatina-rendimiento",
    brandSlug: "purovital",
    shortDescription: "Ayuda a preservar masa muscular en entrenamientos intensos.",
    description:
      "HMB (beta-hidroxi-beta-metilbutirato) en cápsulas de fácil dosificación. Complementa tu rutina de fuerza reduciendo el daño muscular en entrenamientos de alta intensidad.",
    price: 31000,
    stock: 15,
    tags: "sin-tacc",
    images: [
      { seed: "hmb-1", alt: "Frasco de cápsulas de HMB" },
    ],
    reviews: [
      { authorName: "Julián C.", rating: 4, comment: "Buen complemento en bloques de fuerza." },
    ],
  },
  {
    slug: "bcaa-2-1-1-frutos-rojos-400g",
    name: "BCAA 2:1:1 Frutos Rojos 400g",
    categorySlug: "aminoacidos",
    brandSlug: "core-market-select",
    shortDescription: "Aminoácidos ramificados para reducir el catabolismo muscular.",
    description:
      "BCAA en proporción 2:1:1, ideal para tomar durante el entrenamiento e hidratarte con sabor. Ayuda a reducir la fatiga y preservar la masa muscular en sesiones largas.",
    price: 33000,
    stock: 30,
    tags: "sin-tacc",
    isBestSeller: true,
    images: [
      { seed: "bcaa-1", alt: "Pote de BCAA sabor frutos rojos" },
      { seed: "bcaa-2", alt: "Botella de agua con BCAA disuelto" },
    ],
    reviews: [
      { authorName: "Vale H.", rating: 5, comment: "El sabor a frutos rojos es riquísimo, tomo en cada entreno." },
    ],
  },
  {
    slug: "glutamina-300g",
    name: "L-Glutamina Pura 300g",
    categorySlug: "aminoacidos",
    brandSlug: "purovital",
    shortDescription: "Recuperación muscular y soporte para el sistema inmune.",
    description:
      "Glutamina en polvo sin sabor, el aminoácido más abundante en el músculo. Aporta a la recuperación post-ejercicio y al sistema inmunológico en épocas de mayor carga de entrenamiento.",
    price: 24000,
    stock: 34,
    tags: "sin-tacc,sin-sabor",
    images: [{ seed: "glutamina-1", alt: "Pote de glutamina en polvo" }],
    reviews: [
      { authorName: "Pablo N.", rating: 4, comment: "Cumple lo que promete, sin sabor raro." },
    ],
  },
  {
    slug: "eaa-aminoacidos-esenciales-limon-350g",
    name: "EAA Aminoácidos Esenciales Limón 350g",
    categorySlug: "aminoacidos",
    brandSlug: "nutriforce",
    shortDescription: "Los 9 aminoácidos esenciales en una fórmula refrescante.",
    description:
      "Fórmula completa con los 9 aminoácidos esenciales que el cuerpo no produce por sí mismo. Sabor limón bien fresco, perfecto para hidratarte mientras entrenás o ayunás.",
    price: 36000,
    stock: 20,
    tags: "sin-tacc",
    isNew: true,
    images: [{ seed: "eaa-1", alt: "Pote de EAA sabor limón" }],
    reviews: [
      { authorName: "Carla Z.", rating: 5, comment: "Refrescante y se nota la diferencia en la recuperación." },
    ],
  },
  {
    slug: "multivitaminico-completo-60caps",
    name: "Multivitamínico Completo 60 Cápsulas",
    categorySlug: "vitaminas-minerales",
    brandSlug: "purovital",
    shortDescription: "26 vitaminas y minerales para tu día a día.",
    description:
      "Fórmula completa con vitaminas A, C, D, E, complejo B y minerales esenciales como zinc, magnesio y selenio. Pensado para acompañar una rutina activa y una alimentación exigente.",
    price: 22000,
    stock: 42,
    tags: "sin-tacc",
    featured: true,
    images: [{ seed: "multivit-1", alt: "Frasco de multivitamínico completo" }],
    reviews: [
      { authorName: "Marina O.", rating: 5, comment: "Lo tomo hace 6 meses y noto mejor energía." },
      { authorName: "Ignacio W.", rating: 4, comment: "Buena relación de dosis por cápsula." },
    ],
  },
  {
    slug: "vitamina-d3-2000ui-90caps",
    name: "Vitamina D3 2000UI 90 Cápsulas",
    categorySlug: "vitaminas-minerales",
    brandSlug: "purovital",
    shortDescription: "Soporte óseo, inmune y hormonal.",
    description:
      "Vitamina D3 (colecalciferol) en dosis de 2000UI, clave para la salud ósea, el sistema inmune y el equilibrio hormonal. Especialmente recomendada en meses de menor exposición solar.",
    price: 17000,
    stock: 50,
    tags: "sin-tacc",
    images: [{ seed: "vitd-1", alt: "Frasco de vitamina D3" }],
    reviews: [
      { authorName: "Sol M.", rating: 5, comment: "Mi médica me la recomendó y esta marca es muy buena." },
    ],
  },
  {
    slug: "magnesio-quelado-90caps",
    name: "Magnesio Quelado 90 Cápsulas",
    categorySlug: "vitaminas-minerales",
    brandSlug: "andes-naturals",
    shortDescription: "Descanso, relajación muscular y función nerviosa.",
    description:
      "Magnesio bisglicinato de alta absorción, ideal para acompañar el descanso, aliviar calambres y sostener la función nerviosa y muscular en rutinas exigentes.",
    price: 19500,
    stock: 38,
    tags: "sin-tacc",
    isBestSeller: true,
    images: [{ seed: "magnesio-1", alt: "Frasco de magnesio quelado" }],
    reviews: [
      { authorName: "Gaby P.", rating: 5, comment: "Duermo mucho mejor desde que lo tomo." },
    ],
  },
  {
    slug: "omega-3-1000mg-120caps",
    name: "Omega 3 1000mg 120 Cápsulas",
    categorySlug: "vitaminas-minerales",
    brandSlug: "purovital",
    shortDescription: "EPA y DHA de alta concentración para salud cardiovascular.",
    description:
      "Aceite de pescado purificado con alta concentración de EPA y DHA. Contribuye a la salud cardiovascular, cerebral y articular como parte de una alimentación equilibrada.",
    price: 26000,
    stock: 28,
    tags: "sin-tacc",
    images: [{ seed: "omega3-1", alt: "Frasco de cápsulas de Omega 3" }],
    reviews: [
      { authorName: "Ariel K.", rating: 4, comment: "Cápsulas grandes pero sin gusto a pescado." },
    ],
  },
  {
    slug: "espirulina-organica-200g",
    name: "Espirulina Orgánica en Polvo 200g",
    categorySlug: "superalimentos",
    brandSlug: "andes-naturals",
    shortDescription: "Alga verde-azulada, alta en proteína y antioxidantes.",
    description:
      "Espirulina 100% orgánica cultivada de forma sustentable. Rica en proteína completa, hierro y antioxidantes. Sumala a licuados, jugos verdes o tus preparaciones favoritas.",
    price: 21000,
    stock: 24,
    tags: "vegano,organico,sin-tacc",
    isNew: true,
    images: [
      { seed: "spirulina-1", alt: "Bolsa de espirulina orgánica en polvo" },
      { seed: "spirulina-2", alt: "Licuado verde con espirulina" },
    ],
    reviews: [
      { authorName: "Melina D.", rating: 5, comment: "Buenísima calidad, se nota que es orgánica." },
    ],
  },
  {
    slug: "maca-andina-en-polvo-250g",
    name: "Maca Andina en Polvo 250g",
    categorySlug: "superalimentos",
    brandSlug: "andes-naturals",
    shortDescription: "Raíz andina tradicional, energía y equilibrio hormonal.",
    description:
      "Maca peruana cultivada en altura, secada y molida de forma tradicional. Usada históricamente por su aporte a la energía, la resistencia y el equilibrio hormonal.",
    price: 18500,
    stock: 32,
    tags: "vegano,organico,sin-tacc",
    images: [{ seed: "maca-1", alt: "Bolsa de maca andina en polvo" }],
    reviews: [
      { authorName: "Fernanda J.", rating: 4, comment: "Buen sabor en el licuado de la mañana." },
    ],
  },
  {
    slug: "cacao-crudo-organico-300g",
    name: "Cacao Crudo Orgánico en Polvo 300g",
    categorySlug: "superalimentos",
    brandSlug: "cosecha-real",
    shortDescription: "Cacao sin procesar, rico en antioxidantes y magnesio.",
    description:
      "Cacao 100% crudo y orgánico, prensado en frío para conservar sus antioxidantes naturales. Perfecto para batidos, postres saludables o tu café de la mañana.",
    price: 15000,
    stock: 45,
    tags: "vegano,organico,sin-tacc",
    featured: true,
    images: [{ seed: "cacao-1", alt: "Bolsa de cacao crudo orgánico en polvo" }],
    reviews: [
      { authorName: "Yamila S.", rating: 5, comment: "El sabor es intenso, se nota que es cacao real." },
    ],
  },
  {
    slug: "colageno-hidrolizado-300g",
    name: "Colágeno Hidrolizado 300g",
    categorySlug: "superalimentos",
    brandSlug: "purovital",
    shortDescription: "Soporte para piel, articulaciones y tejido conectivo.",
    description:
      "Colágeno hidrolizado tipo I y III, de fácil absorción. Sin sabor, se disuelve en frío o caliente. Ideal para sumar a tu café, licuado o infusión diaria.",
    price: 27000,
    stock: 30,
    tags: "sin-tacc,sin-sabor",
    isBestSeller: true,
    images: [{ seed: "colageno-1", alt: "Pote de colágeno hidrolizado en polvo" }],
    reviews: [
      { authorName: "Andrea P.", rating: 5, comment: "Lo tomo en el café todas las mañanas, no altera el sabor." },
    ],
  },
  {
    slug: "almendras-tostadas-500g",
    name: "Almendras Tostadas sin Sal 500g",
    categorySlug: "frutos-secos-semillas",
    brandSlug: "cosecha-real",
    shortDescription: "Tostadas en casa, crocantes y sin agregados.",
    description:
      "Almendras seleccionadas, tostadas en pequeños lotes para resaltar su sabor natural. Sin sal ni aceites agregados, un snack simple y nutritivo para cualquier momento del día.",
    price: 9800,
    stock: 60,
    tags: "vegano,sin-tacc",
    featured: true,
    images: [{ seed: "almendras-1", alt: "Bowl de almendras tostadas" }],
    reviews: [
      { authorName: "Ramiro T.", rating: 5, comment: "Muy crocantes, se nota que son frescas." },
    ],
  },
  {
    slug: "mix-frutos-secos-premium-400g",
    name: "Mix Premium de Frutos Secos 400g",
    categorySlug: "frutos-secos-semillas",
    brandSlug: "cosecha-real",
    shortDescription: "Almendras, nueces, castañas de cajú y pasas de uva.",
    description:
      "Nuestra selección premium: almendras, nueces pecan, castañas de cajú y pasas de uva sin semilla. Un snack completo, energético y perfecto para llevar a cualquier lado.",
    price: 12500,
    stock: 40,
    tags: "vegano,sin-tacc",
    isBestSeller: true,
    images: [{ seed: "mixfrutossecos-1", alt: "Mix de frutos secos premium en bowl" }],
    reviews: [
      { authorName: "Lourdes B.", rating: 5, comment: "El mix favorito de casa, muy variado." },
    ],
  },
  {
    slug: "semillas-de-chia-organicas-300g",
    name: "Semillas de Chía Orgánicas 300g",
    categorySlug: "frutos-secos-semillas",
    brandSlug: "andes-naturals",
    shortDescription: "Ricas en omega-3, fibra y antioxidantes.",
    description:
      "Semillas de chía 100% orgánicas, cultivadas en el norte argentino. Ideales para puddings, licuados o simplemente espolvoreadas sobre tu desayuno.",
    price: 7200,
    stock: 55,
    tags: "vegano,organico,sin-tacc",
    images: [{ seed: "chia-1", alt: "Bolsa de semillas de chía orgánicas" }],
    reviews: [
      { authorName: "Ornella G.", rating: 4, comment: "Buena calidad, se hinchan perfecto para el pudding." },
    ],
  },
  {
    slug: "manteca-de-mani-natural-500g",
    name: "Manteca de Maní Natural 500g",
    categorySlug: "frutos-secos-semillas",
    brandSlug: "cosecha-real",
    shortDescription: "100% maní, sin azúcar ni aceites agregados.",
    description:
      "Solo maní tostado y molido, sin azúcar, sal ni aceites vegetales agregados. Cremosa, natural y perfecta para tostadas, licuados o directo de la cuchara.",
    price: 8900,
    stock: 42,
    tags: "vegano,sin-tacc",
    isNew: true,
    images: [{ seed: "mantecamani-1", alt: "Frasco de manteca de maní natural" }],
    reviews: [
      { authorName: "Emiliano R.", rating: 5, comment: "La mejor que probé, se nota que no tiene azúcar." },
    ],
  },
  {
    slug: "barritas-proteicas-caja-x12-cacao",
    name: "Barritas Proteicas Caja x12 – Cacao y Almendras",
    categorySlug: "snacks-saludables",
    brandSlug: "core-market-select",
    shortDescription: "15g de proteína por barrita, sin azúcares agregados.",
    description:
      "Barritas con 15g de proteína, endulzadas naturalmente y con trozos reales de almendra. El snack ideal para tener siempre a mano entre comidas o después de entrenar.",
    price: 34000,
    stock: 36,
    tags: "sin-tacc,alto-en-proteina",
    featured: true,
    isBestSeller: true,
    images: [
      { seed: "barritas-1", alt: "Caja de barritas proteicas sabor cacao" },
      { seed: "barritas-2", alt: "Barrita proteica partida al medio" },
    ],
    reviews: [
      { authorName: "Denise F.", rating: 5, comment: "Las mejores barritas que probé, no son empalagosas." },
      { authorName: "Hernán V.", rating: 4, comment: "Buena textura, se las recomiendo a todos." },
    ],
  },
  {
    slug: "chips-de-batata-horneadas-150g",
    name: "Chips de Batata Horneadas 150g",
    categorySlug: "snacks-saludables",
    brandSlug: "cosecha-real",
    shortDescription: "Horneadas, no fritas, con un toque de sal marina.",
    description:
      "Chips de batata cortadas finas y horneadas lentamente para lograr esa textura crocante, sin freír. Un toque justo de sal marina para un snack liviano y sabroso.",
    price: 6200,
    stock: 50,
    tags: "vegano,sin-tacc",
    images: [{ seed: "chipsbatata-1", alt: "Bolsa de chips de batata horneadas" }],
    reviews: [
      { authorName: "Julieta N.", rating: 4, comment: "Muy ricas, se nota que no están fritas." },
    ],
  },
  {
    slug: "bombones-de-cacao-sin-azucar-200g",
    name: "Bombones de Cacao sin Azúcar 200g",
    categorySlug: "snacks-saludables",
    brandSlug: "cosecha-real",
    shortDescription: "Endulzados con dátiles, sin azúcar agregada.",
    description:
      "Pequeños bombones de cacao endulzados naturalmente con dátiles y un toque de coco. Un capricho dulce sin culpa para acompañar el café de la tarde.",
    price: 8400,
    stock: 34,
    tags: "vegano,sin-tacc,sin-azucar",
    isNew: true,
    images: [{ seed: "bombones-1", alt: "Bombones de cacao sin azúcar en bowl" }],
    reviews: [
      { authorName: "Nadia C.", rating: 5, comment: "Perfectos para las ganas de algo dulce a la tarde." },
    ],
  },
  {
    slug: "granola-artesanal-sin-azucar-400g",
    name: "Granola Artesanal sin Azúcar 400g",
    categorySlug: "snacks-saludables",
    brandSlug: "cosecha-real",
    shortDescription: "Avena, frutos secos y miel en mínima cantidad.",
    description:
      "Granola horneada en pequeños lotes con avena, almendras, nueces y semillas. Endulzada apenas con un toque de miel, ideal para el desayuno con yogur o leche vegetal.",
    price: 9200,
    stock: 44,
    tags: "sin-azucar",
    images: [{ seed: "granola-1", alt: "Bowl de granola artesanal con yogur" }],
    reviews: [
      { authorName: "Ivana L.", rating: 5, comment: "Muy crocante y no empalaga como otras marcas." },
    ],
  },
  {
    slug: "te-verde-matcha-ceremonial-100g",
    name: "Té Verde Matcha Ceremonial 100g",
    categorySlug: "bienestar-natural",
    brandSlug: "andes-naturals",
    shortDescription: "Grado ceremonial, energía calma y antioxidantes.",
    description:
      "Matcha de grado ceremonial, molido en piedra para preservar su color y sabor. Aporta una energía sostenida y calma, ideal para reemplazar el café de la mañana.",
    price: 23000,
    stock: 20,
    tags: "vegano,organico",
    isNew: true,
    images: [{ seed: "matcha-1", alt: "Lata de té matcha ceremonial con batidor" }],
    reviews: [
      { authorName: "Renata Q.", rating: 5, comment: "Color y sabor espectaculares, se nota la calidad." },
    ],
  },
  {
    slug: "aceite-de-coco-organico-500ml",
    name: "Aceite de Coco Orgánico 500ml",
    categorySlug: "bienestar-natural",
    brandSlug: "andes-naturals",
    shortDescription: "Prensado en frío, ideal para cocina y piel.",
    description:
      "Aceite de coco 100% orgánico, prensado en frío sin refinar. Versátil para cocinar, hornear o incluso como parte de tu rutina de cuidado personal.",
    price: 11500,
    stock: 38,
    tags: "vegano,organico,sin-tacc",
    images: [{ seed: "aceitecoco-1", alt: "Frasco de aceite de coco orgánico" }],
    reviews: [
      { authorName: "Camila F.", rating: 4, comment: "Muy buen aroma y sabor, lo uso para todo." },
    ],
  },
  {
    slug: "ashwagandha-capsulas-60u",
    name: "Ashwagandha 600mg 60 Cápsulas",
    categorySlug: "bienestar-natural",
    brandSlug: "purovital",
    shortDescription: "Adaptógeno para manejo del estrés y descanso.",
    description:
      "Extracto estandarizado de ashwagandha (KSM-66), un adaptógeno milenario que ayuda al cuerpo a manejar el estrés diario y favorece un descanso más profundo.",
    price: 24500,
    stock: 26,
    tags: "sin-tacc",
    featured: true,
    images: [{ seed: "ashwagandha-1", alt: "Frasco de cápsulas de ashwagandha" }],
    reviews: [
      { authorName: "Belén A.", rating: 5, comment: "Noto la diferencia en cómo manejo el estrés del trabajo." },
    ],
  },
];

async function main() {
  console.log("Sembrando datos de Core Market...");

  const categoryMap = new Map<string, string>();
  for (const c of categories) {
    const created = await db.category.upsert({
      where: { slug: c.slug },
      update: c,
      create: c,
    });
    categoryMap.set(c.slug, created.id);
  }

  const brandMap = new Map<string, string>();
  for (const b of brands) {
    const created = await db.brand.upsert({
      where: { slug: b.slug },
      update: b,
      create: b,
    });
    brandMap.set(b.slug, created.id);
  }

  for (const p of products) {
    const categoryId = categoryMap.get(p.categorySlug);
    const brandId = brandMap.get(p.brandSlug);
    if (!categoryId || !brandId) {
      throw new Error(`Missing category/brand for product ${p.slug}`);
    }

    const images = p.images.map((_, i) => {
      const photoId = CATEGORY_PHOTOS[p.categorySlug][i % 2];
      return img(photoId, i === 0 ? p.name : `${p.name} — foto ${i + 1}`, i);
    });
    const reviews = p.reviews.map((r) => ({
      authorName: r.authorName,
      rating: r.rating,
      comment: r.comment,
    }));
    const sharedFields = {
      name: p.name,
      shortDescription: p.shortDescription,
      description: p.description,
      price: p.price,
      compareAtPrice: p.compareAtPrice,
      stock: p.stock,
      tags: p.tags,
      featured: p.featured ?? false,
      isNew: p.isNew ?? false,
      isBestSeller: p.isBestSeller ?? false,
      nutritionFacts: p.nutritionFacts ? JSON.stringify(p.nutritionFacts) : null,
      categoryId,
      brandId,
    };

    await db.product.upsert({
      where: { slug: p.slug },
      update: {
        ...sharedFields,
        images: { deleteMany: {}, create: images },
        reviews: { deleteMany: {}, create: reviews },
      },
      create: {
        slug: p.slug,
        ...sharedFields,
        images: { create: images },
        reviews: { create: reviews },
      },
    });
  }

  console.log(
    `Listo: ${categories.length} categorías, ${brands.length} marcas, ${products.length} productos.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
