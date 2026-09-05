export type Region = {
  id: string;
  name: string;
  comunas: string[];
};

export const CHILE_REGIONS: Region[] = [
  {
    id: "RM",
    name: "Región Metropolitana de Santiago",
    comunas: [
      "Santiago", "Cerrillos", "Cerro Navia", "Conchalí", "El Bosque", "Estación Central",
      "Huechuraba", "Independencia", "La Cisterna", "La Florida", "La Granja", "La Pintana",
      "La Reina", "Las Condes", "Lo Barnechea", "Lo Espejo", "Lo Prado", "Macul", "Maipú",
      "Ñuñoa", "Pedro Aguirre Cerda", "Peñalolén", "Providencia", "Pudahuel", "Quilicura",
      "Quinta Normal", "Recoleta", "Renca", "San Joaquín", "San Miguel", "San Ramón",
      "Vitacura", "Puente Alto", "Pirque", "San José de Maipo", "Colina", "Lampa",
      "Tiltil", "San Bernardo", "Buin", "Calera de Tango", "Paine", "Melipilla", "Alhué",
      "Curacaví", "María Pinto", "San Pedro", "Talagante", "El Monte", "Isla de Maipo",
      "Padre Hurtado", "Peñaflor"
    ]
  },
  {
    id: "V",
    name: "Región de Valparaíso",
    comunas: [
      "Valparaíso", "Viña del Mar", "Concón", "Quilpué", "Villa Alemana", "Quillota",
      "La Calera", "Limache", "Olmué", "San Antonio", "Cartagena", "Santo Domingo",
      "Algarrobo", "El Quisco", "El Tabo", "San Felipe", "Los Andes", "Putaendo"
    ]
  },
  {
    id: "VIII",
    name: "Región del Biobío",
    comunas: [
      "Concepción", "San Pedro de la Paz", "Talcahuano", "Chiguayante", "Coronel",
      "Hualpén", "Los Ángeles", "Tomé", "Penco", "Lota", "Arauco", "Curanilahue"
    ]
  },
  {
    id: "IV",
    name: "Región de Coquimbo",
    comunas: [
      "La Serena", "Coquimbo", "Ovalle", "Illapel", "Salamanca", "Los Vilos",
      "Vicuña", "Andacollo", "Monte Patria"
    ]
  },
  {
    id: "VI",
    name: "Región del Libertador General Bernardo O'Higgins",
    comunas: [
      "Rancagua", "Machalí", "Rengo", "San Fernando", "Pichilemu", "Graneros",
      "San Vicente", "Santa Cruz", "Chimbarongo", "Mostazal"
    ]
  },
  {
    id: "VII",
    name: "Región del Maule",
    comunas: [
      "Talca", "Curicó", "Linares", "Constitución", "Molina", "San Javier",
      "Cauquenes", "Parral", "San Clemente"
    ]
  },
  {
    id: "IX",
    name: "Región de La Araucanía",
    comunas: [
      "Temuco", "Padre Las Casas", "Villarrica", "Pucón", "Angol", "Victoria",
      "Lautaro", "Nueva Imperial"
    ]
  },
  {
    id: "X",
    name: "Región de Los Lagos",
    comunas: [
      "Puerto Montt", "Puerto Varas", "Osorno", "Castro", "Ancud", "Frutillar",
      "Llanquihue", "Calbuco", "Quellón"
    ]
  },
  {
    id: "XIV",
    name: "Región de Los Ríos",
    comunas: [
      "Valdivia", "La Unión", "Río Bueno", "Panguipulli", "Paillaco", "Los Lagos"
    ]
  },
  {
    id: "II",
    name: "Región de Antofagasta",
    comunas: [
      "Antofagasta", "Calama", "Tocopilla", "Mejillones", "San Pedro de Atacama"
    ]
  },
  {
    id: "I",
    name: "Región de Tarapacá",
    comunas: [
      "Iquique", "Alto Hospicio", "Pozo Almonte", "Pica"
    ]
  },
  {
    id: "XV",
    name: "Región de Arica y Parinacota",
    comunas: [
      "Arica", "Camarones", "Putre", "General Lagos"
    ]
  },
  {
    id: "III",
    name: "Región de Atacama",
    comunas: [
      "Copiapó", "Vallenar", "Caldera", "Chañaral", "Huasco"
    ]
  },
  {
    id: "XVI",
    name: "Región de Ñuble",
    comunas: [
      "Chillán", "Chillán Viejo", "San Carlos", "Bulnes", "Yungay", "Coihueco"
    ]
  },
  {
    id: "XI",
    name: "Región de Aysén",
    comunas: [
      "Coyhaique", "Puerto Aysén", "Chile Chico", "Cochrane"
    ]
  },
  {
    id: "XII",
    name: "Región de Magallanes y de la Antártica Chilena",
    comunas: [
      "Punta Arenas", "Puerto Natales", "Porvenir", "Cabo de Hornos"
    ]
  }
];

export const SHIPPING_METHODS = [
  {
    id: "private_courier",
    name: "Despacho a Domicilio",
    description: "Despachador privado con entrega directa a tu puerta. Solo disponible en Santiago (RM); otras regiones se coordinan por WhatsApp.",
    costRM: 3990,
    costRegions: null as number | null,
    estimatedDays: "24 a 48 hrs hábiles"
  },
  {
    id: "pickup",
    name: "Retiro en Taller (Vitacura, RM)",
    description: "Coordina retiro sin costo en nuestro taller en Vitacura",
    costRM: 0,
    costRegions: 0,
    estimatedDays: "Previo aviso (Lun a Vie)"
  }
];
