export const products = [
  {
    productId: "ECO-TX-2025-001",
    category: "textile",
    brand: "EcoWear GmbH",
    materials: [
      { name: "Organic Cotton", percentage: 85, origin: "India", certified: "GOTS" },
      { name: "Recycled Polyester", percentage: 15, origin: "DE", certified: "GRS" }
    ],
    provenance: [
      { stage: "Raw material", location: "Tamil Nadu, IN", date: "2025-01-10" },
      { stage: "Spinning", location: "Stuttgart, DE", date: "2025-02-03" },
      { stage: "Assembly", location: "Hamburg, DE", date: "2025-02-28" }
    ],
    repairGuide: "https://ecowear.eu/repair/ECO-TX-2025-001",
    recycling: "Drop-off at any H&M or Zalando return point"
  },
  {
    productId: "ECO-EL-2025-001",
    category: "electronics",
    brand: "GreenTech Solutions",
    materials: [
      { name: "Recycled Aluminium", percentage: 60, origin: "DE", certified: "ISO14001" },
      { name: "Recycled Plastic", percentage: 25, origin: "NL", certified: "RCS" },
      { name: "Lithium Battery", percentage: 15, origin: "FR", certified: "IEC62133" }
    ],
    provenance: [
      { stage: "Raw material", location: "Berlin, DE", date: "2025-03-01" },
      { stage: "Manufacturing", location: "Munich, DE", date: "2025-03-20" },
      { stage: "Quality Check", location: "Hamburg, DE", date: "2025-04-01" }
    ],
    repairGuide: "https://greentech.eu/repair/ECO-EL-2025-001",
    recycling: "Return to any MediaMarkt or Saturn store in EU"
  },
  {
    productId: "ECO-FN-2025-001",
    category: "furniture",
    brand: "SustainHome BV",
    materials: [
      { name: "FSC Certified Wood", percentage: 70, origin: "SE", certified: "FSC" },
      { name: "Recycled Metal", percentage: 20, origin: "NL", certified: "ISO14001" },
      { name: "Natural Fabric", percentage: 10, origin: "PT", certified: "OEKO-TEX" }
    ],
    provenance: [
      { stage: "Timber sourcing", location: "Stockholm, SE", date: "2025-02-01" },
      { stage: "Processing", location: "Amsterdam, NL", date: "2025-02-25" },
      { stage: "Assembly", location: "Rotterdam, NL", date: "2025-03-15" }
    ],
    repairGuide: "https://sustainhome.eu/repair/ECO-FN-2025-001",
    recycling: "Contact local municipality for furniture recycling collection"
  }
]