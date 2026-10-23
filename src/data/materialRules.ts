export type WasteCategory = 'paper' | 'plastic';

export type PaperMaterial =
  | 'newspaper'
  | 'office paper'
  | 'corrugated cardboard'
  | 'paperboard';

export type PlasticMaterial = 'PET' | 'HDPE' | 'other plastic';

export type BoundedMaterial = PaperMaterial | PlasticMaterial;

export type ContaminationLevel = 'low' | 'medium' | 'high';

export interface MaterialRule {
  id: string;
  name: BoundedMaterial;
  category: WasteCategory;
  displayName: string;
  rewardPointsPerKg: number;
  baseRecoveryRoute: string;
  routeDescription: string;
  processingType: string;
  description: string;
  acceptedItems: string[];
  contaminationWarnings: string[];
}

export const BOUNDED_MATERIAL_RULES: Record<BoundedMaterial, MaterialRule> = {
  // --- PLASTICS ---
  PET: {
    id: 'mat_pet',
    name: 'PET',
    category: 'plastic',
    displayName: 'PET Plastic (#1)',
    rewardPointsPerKg: 25,
    baseRecoveryRoute: 'PET Plastic Recycling',
    routeDescription: 'Mechanical flaking and bottle-to-bottle decontamination for food-grade resin pellets.',
    processingType: 'Mechanical Pelletizing & Optical Sorting',
    description: 'Clear and tinted Polyethylene Terephthalate water bottles, beverage jugs, and clean food containers.',
    acceptedItems: ['Water bottles', 'Soda bottles', 'Clear food tubs', 'Cooking oil containers (rinsed)'],
    contaminationWarnings: ['Ensure bottles are drained and rinsed', 'Remove metal caps or foreign pump mechanisms'],
  },
  HDPE: {
    id: 'mat_hdpe',
    name: 'HDPE',
    category: 'plastic',
    displayName: 'HDPE Plastic (#2)',
    rewardPointsPerKg: 30,
    baseRecoveryRoute: 'HDPE Recycling',
    routeDescription: 'Continuous shredding, hot washing, and industrial extrusion into durable utility products.',
    processingType: 'Extrusion & Injection Molding',
    description: 'High-Density Polyethylene milk containers, laundry detergent bottles, shampoo jugs, and solid plastic caps.',
    acceptedItems: ['Milk jugs', 'Detergent bottles', 'Shampoo containers', 'Plastic buckets and crates'],
    contaminationWarnings: ['Thoroughly rinse soap and dairy residue', 'Empty all liquid completely'],
  },
  'other plastic': {
    id: 'mat_other_plastic',
    name: 'other plastic',
    category: 'plastic',
    displayName: 'Other Plastic (PP / Mixed)',
    rewardPointsPerKg: 15,
    baseRecoveryRoute: 'Mixed Polymer Recovery',
    routeDescription: 'Aggregated sorting and secondary thermal extrusion into composite construction decking and utility posts.',
    processingType: 'Secondary Polymer Compounding',
    description: 'Polypropylene food tubs, yogurt cups, rigid lids, and non-PET/HDPE consumer polymers.',
    acceptedItems: ['Yogurt containers', 'Takeout plastic tubs (clean)', 'Plastic bottle caps', 'Storage crates'],
    contaminationWarnings: ['Strictly no hazardous chemical containers', 'Greasy or oily plastic requires warm water degreasing'],
  },

  // --- PAPER ---
  newspaper: {
    id: 'mat_newspaper',
    name: 'newspaper',
    category: 'paper',
    displayName: 'Newspaper & Newsprint',
    rewardPointsPerKg: 15,
    baseRecoveryRoute: 'Paper Recycling',
    routeDescription: 'Flotation de-inking and low-energy hydropulping into fresh newsprint and egg carton fiber.',
    processingType: 'De-inking & Fiber Repulping',
    description: 'Standard newsprint publications, daily newspapers, local periodicals, and advertising circulars.',
    acceptedItems: ['Daily newspapers', 'Press inserts', 'Uncoated print flyers', 'Newsprint catalogs'],
    contaminationWarnings: ['Keep dry; water degradation destroys fiber tensile strength', 'No wax coatings or plastic sleeves'],
  },
  'office paper': {
    id: 'mat_office_paper',
    name: 'office paper',
    category: 'paper',
    displayName: 'Office Paper & Clean Print',
    rewardPointsPerKg: 10,
    baseRecoveryRoute: 'Paper Recycling',
    routeDescription: 'High-brightness chemical de-inking and high-speed paper machine rolling into recycled printer paper and stationery.',
    processingType: 'High-Grade Bleached Repulping',
    description: 'White and light-colored copy paper, notebooks, documents, envelopes, and letterheads.',
    acceptedItems: ['Printer / copier paper', 'Envelopes (plastic windows removed)', 'Notebook paper (spirals removed)', 'Printed invoices'],
    contaminationWarnings: ['Remove metal staples, spiral bindings, and plastic clips', 'No carbon paper or thermal receipts'],
  },
  'corrugated cardboard': {
    id: 'mat_cardboard',
    name: 'corrugated cardboard',
    category: 'paper',
    displayName: 'Corrugated Cardboard',
    rewardPointsPerKg: 12,
    baseRecoveryRoute: 'Cardboard Recycling',
    routeDescription: 'High-consistency hydropulping, centrifugal cleaning, and heavy kraft linerboard fabrication for new boxes.',
    processingType: 'Hydropulping & Baling',
    description: 'Corrugated cardboard boxes featuring fluted wave fiber cores, parcel shipping boxes, and heavy packing cartons.',
    acceptedItems: ['E-commerce shipping cartons', 'Packing boxes', 'Fluted corrugated sheets', 'Clean appliance packaging'],
    contaminationWarnings: ['Flatten all boxes before drop-off', 'No pizza boxes soaked in food grease', 'Remove heavy packing tape where possible'],
  },
  paperboard: {
    id: 'mat_paperboard',
    name: 'paperboard',
    category: 'paper',
    displayName: 'Paperboard & Chipboard',
    rewardPointsPerKg: 12,
    baseRecoveryRoute: 'Paperboard Recycling',
    routeDescription: 'Dry mechanical defibering and cylinder vat mold forming into recycled cartons, shoe boxes, and book covers.',
    processingType: 'Molded Pulp & Boxboard Manufacturing',
    description: 'Single-layer folding cartons like cereal boxes, shoe boxes, tissue boxes, paper towel roll tubes, and dry food packaging.',
    acceptedItems: ['Cereal and granola boxes', 'Shoe boxes', 'Toilet paper tubes', 'Cardboard sleeve packaging'],
    contaminationWarnings: ['Ensure inner foil or plastic liner bags are discarded', 'No moisture or freezer-burn ice residue'],
  },
};

export const PAPER_SUBMATERIALS: { material: PaperMaterial; label: string }[] = [
  { material: 'newspaper', label: 'Newspaper' },
  { material: 'office paper', label: 'Office Paper' },
  { material: 'corrugated cardboard', label: 'Corrugated Cardboard' },
  { material: 'paperboard', label: 'Paperboard' },
];

export const PLASTIC_SUBMATERIALS: { material: PlasticMaterial; label: string }[] = [
  { material: 'PET', label: 'PET (#1)' },
  { material: 'HDPE', label: 'HDPE (#2)' },
  { material: 'other plastic', label: 'Other Plastic' },
];

