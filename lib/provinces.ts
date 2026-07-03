import initialData from "../data/provinces.json"
import { loadPersisted, savePersisted, initFromGitHub } from "./persist"

type Zone = { id: string; name: string; nameAr: string; nameFr: string; rate: number }
type Province = { id: string; name: string; nameAr: string; nameFr: string; zone: string }

const FILE = "provinces.json"
const GH_PATH = "data/provinces.json"

interface ProvincesData { zones: Zone[]; provinces: Province[] }

const fallback: ProvincesData = JSON.parse(JSON.stringify(initialData))
let state: ProvincesData = loadPersisted<ProvincesData>(FILE, fallback)
let initialized = false

async function ensureInit() {
  if (initialized) return
  initialized = true
  state = await initFromGitHub<ProvincesData>(FILE, state)
}

export async function getZones() {
  await ensureInit()
  return state.zones
}

export async function getProvinces() {
  await ensureInit()
  return state.provinces
}

export async function getProvinceById(id: string) {
  await ensureInit()
  return state.provinces.find((p) => p.id === id)
}

export async function getDeliveryRate(provinceId: string): Promise<number> {
  await ensureInit()
  const prov = state.provinces.find((p) => p.id === provinceId)
  if (!prov) return 0
  const zone = state.zones.find((z) => z.id === prov.zone)
  return zone?.rate ?? 0
}

export async function updateZoneRate(zoneId: string, rate: number): Promise<boolean> {
  await ensureInit()
  const idx = state.zones.findIndex((z) => z.id === zoneId)
  if (idx === -1) return false
  state.zones[idx] = { ...state.zones[idx], rate }
  await savePersisted(FILE, GH_PATH, state)
  return true
}
