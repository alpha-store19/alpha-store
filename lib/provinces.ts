import initialData from "../data/provinces.json"
import { loadPersisted, savePersisted, initFromGitHub } from "./persist"

type Province = { id: string; name: string; nameAr: string; nameFr: string; rateHome: number; rateOffice: number }

const FILE = "provinces.json"

interface ProvincesData { provinces: Province[] }

const fallback: ProvincesData = JSON.parse(JSON.stringify(initialData))
let state: ProvincesData = loadPersisted<ProvincesData>(FILE, fallback)
let initialized = false

async function ensureInit() {
  if (initialized) return
  initialized = true
  state = await initFromGitHub<ProvincesData>(FILE, state)
}

export async function getProvinces() {
  await ensureInit()
  return state.provinces
}

export async function getProvinceById(id: string) {
  await ensureInit()
  return state.provinces.find((p) => p.id === id)
}

export async function getDeliveryRate(provinceId: string, type: "home" | "office" = "home"): Promise<number> {
  await ensureInit()
  const prov = state.provinces.find((p) => p.id === provinceId)
  if (!prov) return 0
  return type === "office" ? prov.rateOffice : prov.rateHome
}

export async function updateProvinceRate(provinceId: string, rateHome: number, rateOffice: number): Promise<boolean> {
  await ensureInit()
  const idx = state.provinces.findIndex((p) => p.id === provinceId)
  if (idx === -1) return false
  state.provinces[idx] = { ...state.provinces[idx], rateHome, rateOffice }
  await savePersisted(FILE, "data/provinces.json", state)
  return true
}