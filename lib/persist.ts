import fs from "fs"
import path from "path"

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || ""
const REPO = process.env.GITHUB_REPO || "alpha-store19/alpha-store"
const API_URL = "https://api.github.com/repos"

function tmpPath(name: string) {
  return path.join("/tmp", name)
}

function readTmp<T>(name: string): T | null {
  try {
    const p = tmpPath(name)
    if (fs.existsSync(p)) {
      return JSON.parse(fs.readFileSync(p, "utf-8"))
    }
  } catch {}
  return null
}

function writeTmp(name: string, data: unknown) {
  try {
    fs.writeFileSync(tmpPath(name), JSON.stringify(data, null, 2))
  } catch {}
}

async function readGitHub<T>(path: string): Promise<T | null> {
  if (!GITHUB_TOKEN) return null
  try {
    const res = await fetch(`${API_URL}/${REPO}/contents/${path}`, {
      headers: { Authorization: `Bearer ${GITHUB_TOKEN}` },
      next: { revalidate: 0 },
    })
    if (!res.ok) return null
    const data = await res.json()
    return JSON.parse(Buffer.from(data.content, "base64").toString("utf-8")) as T
  } catch {
    return null
  }
}

async function writeGitHub(path: string, data: unknown): Promise<boolean> {
  if (!GITHUB_TOKEN) return false
  try {
    const getRes = await fetch(`${API_URL}/${REPO}/contents/${path}`, {
      headers: { Authorization: `Bearer ${GITHUB_TOKEN}` },
    })
    if (!getRes.ok) return false
    const existing = await getRes.json()
    const sha = existing.sha
    const content = Buffer.from(JSON.stringify(data, null, 2)).toString("base64")
    const putRes = await fetch(`${API_URL}/${REPO}/contents/${path}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${GITHUB_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({ message: `Update ${path}`, content, sha }),
    })
    return putRes.ok
  } catch {
    return false
  }
}

export function loadPersisted<T>(name: string, fallback: T): T {
  const fromTmp = readTmp<T>(name)
  if (fromTmp) return fromTmp
  return fallback
}

export async function savePersisted<T>(name: string, path: string, data: T) {
  writeTmp(name, data)
  try {
    await writeGitHub(path, data)
  } catch {}
}

export async function initFromGitHub<T>(name: string, fallback: T): Promise<T> {
  const fromTmp = readTmp<T>(name)
  if (fromTmp) return fromTmp
  const fromGH = await readGitHub<T>(name === "products.json" ? "data/products.json" : "data/provinces.json")
  if (fromGH) {
    writeTmp(name, fromGH)
    return fromGH
  }
  return fallback
}
