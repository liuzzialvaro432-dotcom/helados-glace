import { ORDER_BRANCHES } from "@/data/catalog";

export type Branch = {
  id: string;
  name: string;
  address: string;
  phone: string | null;
  mapsUrl: string;
  /** Id del local en el catálogo de pedidos; null si la sucursal todavía no recibe pedidos online. */
  orderBranchId: number | null;
};

function mapsSearch(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`Helados Glacé ${query}`)}`;
}

export const BRANCHES: Branch[] = [
  {
    id: "casa-central",
    name: "Casa Central",
    address: "Capitán Ortiz 2571 casi San Pedro, Trinidad",
    phone: "0982 897 584",
    mapsUrl: "https://maps.app.goo.gl/gvw6VCm86VzkaCRz5",
    orderBranchId: 5612,
  },
  {
    id: "sacramento",
    name: "Sacramento",
    address: "Av. Sacramento 1525 esq. Profesor Mario Mariotti",
    phone: "0993 412 222",
    mapsUrl: mapsSearch("Sacramento Av. Sacramento 1525 Asunción"),
    orderBranchId: 7093,
  },
  {
    id: "sargento-gauto",
    name: "Sargento Gauto",
    address: "Sgto. Gauto y Zurbarán",
    phone: "0972 886 700",
    mapsUrl: mapsSearch("Sargento Gauto y Zurbarán Asunción"),
    orderBranchId: 7090,
  },
  {
    id: "san-lorenzo",
    name: "San Lorenzo",
    address: "Av. Defensores del Chaco y Saturio Ríos",
    phone: "0981 202 061",
    mapsUrl: mapsSearch("San Lorenzo Av. Defensores del Chaco y Saturio Ríos"),
    orderBranchId: 7094,
  },
  {
    id: "mariano-roque-alonso",
    name: "Mariano Roque Alonso",
    address: "Hovenia 123 entre Palo Santo y Transchaco",
    phone: "0991 848 116",
    mapsUrl: mapsSearch("Mariano Roque Alonso Hovenia 123"),
    orderBranchId: 7092,
  },
  {
    id: "luque",
    name: "Luque",
    address: "14 de Mayo y Bernardino Caballero",
    phone: "0983 465 837",
    mapsUrl: mapsSearch("Luque 14 de Mayo y Bernardino Caballero"),
    orderBranchId: null,
  },
  {
    id: "lambare",
    name: "Lambaré",
    address: "Lambaré",
    phone: "0994 882 333",
    mapsUrl: mapsSearch("Lambaré"),
    orderBranchId: null,
  },
  {
    id: "san-miguel",
    name: "San Miguel",
    address: "San Lorenzo",
    phone: "0982 890 465",
    mapsUrl: mapsSearch("San Miguel San Lorenzo"),
    orderBranchId: null,
  },
  {
    id: "laguna-de-ita",
    name: "Laguna de Itá",
    address: "Mariscal Estigarribia y Enrique Doldanibieta",
    phone: "0976 148 963",
    mapsUrl: mapsSearch("Laguna de Itá Mariscal Estigarribia"),
    orderBranchId: null,
  },
  {
    id: "alberdi",
    name: "Alberdi",
    address: "Mariscal Estigarribia y Alberdi",
    phone: null,
    mapsUrl: mapsSearch("Mariscal Estigarribia y Alberdi"),
    orderBranchId: null,
  },
  {
    id: "concepcion",
    name: "Concepción",
    address: "Av. Heriberto Colombino esq. Screibert",
    phone: null,
    mapsUrl: mapsSearch("Concepción Av. Heriberto Colombino"),
    orderBranchId: null,
  },
  {
    id: "pilar-costanera",
    name: "Pilar Costanera",
    address: "Dr. Mazzei, Pilar",
    phone: null,
    mapsUrl: mapsSearch("Pilar Costanera Dr. Mazzei"),
    orderBranchId: null,
  },
];

export type OrderBranchOption = { id: number; name: string; catalogName: string; address: string };

/** Sucursales que reciben pedidos desde la app, con el nombre que usa el local en el catálogo. */
export const ORDER_BRANCH_OPTIONS: OrderBranchOption[] = ORDER_BRANCHES.map((orderBranch) => {
  const branch = BRANCHES.find((item) => item.orderBranchId === orderBranch.id);
  return {
    id: orderBranch.id,
    name: branch?.name ?? orderBranch.name,
    catalogName: orderBranch.name,
    address: branch?.address ?? "",
  };
});

export function getOrderBranch(id: number | null): OrderBranchOption | undefined {
  return ORDER_BRANCH_OPTIONS.find((branch) => branch.id === id);
}
