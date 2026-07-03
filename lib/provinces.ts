import fs from "fs"
import path from "path"
import initialData from "../data/provinces.json"

const TMP_PATH = path.join("/tmp", "provinces.json")
const DATA_PATH = path.join(process.cwd(), "data", "provinces.json")

type Zone = (typeof initialData.zones)[number]
type Province = (typeof initialData.provinces)[number]

function loadData(): { zones: Zone[]; provinces: Province[] } {
  try {
    if (fs.existsSync(TMP_PATH)) {
      const data = fs.readFileSync(TMP_PATH, "utf-8")
      return JSON.parse(data)
    }
  } catch {}
  return JSON.parse(JSON.stringify(initialData))
}

function saveData(data: { zones: Zone[]; provinces: Province[] }) {
  try {
    fs.writeFileSync(TMP_PATH, JSON.stringify(data, null, 2))
  } catch {}
  try {
    fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2))
  } catch {}
}

const state = loadData()
let zones: Zone[] = state.zones
let provinces: Province[] = state.provinces

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
  saveData({ zones, provinces })
  return true
}
