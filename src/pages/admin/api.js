// Appels à l'API d'administration (cookie de session HttpOnly + en-tête anti-CSRF)
export async function api(path, { method = 'GET', body, raw } = {}) {
  const headers = { 'X-SunuCare-Admin': '1' }
  if (body !== undefined && !raw) headers['Content-Type'] = 'application/json'
  if (raw) headers['Content-Type'] = raw.type
  const r = await fetch(`/api/admin${path}`, { method, headers, credentials: 'same-origin', body: raw || (body !== undefined ? JSON.stringify(body) : undefined) })
  const isJson = r.headers.get('content-type')?.includes('json')
  const data = isJson ? await r.json() : null
  if (!r.ok) {
    const err = new Error(data?.error || (isJson ? `Erreur ${r.status}` : "Le serveur d'administration ne répond pas. Lancez le site avec « npm start »."))
    err.status = r.status
    throw err
  }
  return data
}
