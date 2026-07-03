import initialData from "../data/provinces.json"

let zones: typeof initialData.zones = JSON.parse(JSON.stringify(initialData.zones))
let provinces: typeof initialData.provinces = JSON.parse(JSON.stringify(initialData.provinces))

export function getZones() {
  return zones
}

export function getProvinces() {
  return provinces
}

export function getProvinceById(id: string) {
  return provinces.find((p) => p.id === id)
}

export function getDeliveryRate(provinceId: string): number {
  const prov = provinces.find((p) => p.id === provinceId)
  if (!prov) return 0
  const zone = zones.find((z) => z.id === prov.zone)
  return zone?.rate ?? 0
}

export function updateZoneRate(zoneId: string, rate: number) {
  const idx = zones.findIndex((z) => z.id === zoneId)
  if (idx === -1) return false
  zones[idx] = { ...zones[idx], rate }
  return true
}
