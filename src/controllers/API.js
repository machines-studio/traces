import mocks from '/data/mock-api-responses'
import Config from '/controllers/Config'

const url = endpoint => Config.API.baseUrl + endpoint

// Config.API.mock: true (mock all), false (mock none), or an array of endpoint names.
const isMocked = name => (
  Config.API.mock === true ||
  (Array.isArray(Config.API.mock) && Config.API.mock.includes(name))
)

const request = async (endpoint, options, params = {}) => {
  // Convert params array to csv
  for (const key in params) {
    if (!Array.isArray(params[key])) continue
    params[key] = params[key].join(',')
  }

  // Longest matching endpoint path (handles /testimony/<id>-style templated paths).
  const name = Object.keys(Config.API.endpoints)
    .filter(key => {
      const path = Config.API.endpoints[key]
      return endpoint === path || endpoint.startsWith(path + '/')
    })
    .sort((a, b) => Config.API.endpoints[b].length - Config.API.endpoints[a].length)[0]
  if (isMocked(name)) {
    const method = options?.method ?? 'GET'
    // Fixtures are keyed by endpoint name, either a function or {METHOD: fn} (see mocks.testimony).
    const fixture = mocks[name]
    const mock = typeof fixture === 'function' ? fixture : fixture?.[method]
    if (mock) {
      const query = Object.entries(params)
        .map(([key, value]) => `${key}=${value}`)
        .join('&')
      const response = await mock(params, options?.body, endpoint)
      console.log(
        `%c[mock] ${method} ${endpoint}${query ? '?' + query : ''}`,
        'color: #888',
        response
      )
      return response
    }
  }

  // Build the param urls query
  const query = Object.entries(params)
    .map(([key, value]) => (
      `${encodeURIComponent(key)}=${encodeURIComponent(value).replaceAll('%2C', ',')}`)
    )
    .join('&')

  const response = await fetch(url(endpoint) + (query ? '?' + query : ''), options)
  if (!response.ok) throw new Error(`API error ${response.status} on ${endpoint}: ${await response.text()}`)
  return response.json()
}

export default {
  // In mock mode there's no local backend to serve real artwork photos from, so
  // resolve to a deterministic picsum.photos placeholder instead of a broken URL.
  assets: filename => (
    isMocked('assets')
      ? `https://picsum.photos/seed/${encodeURIComponent(filename)}/1200/800`
      : url(Config.API.endpoints.assets + '/' + filename)
  ),
  ping: async () => (
    isMocked('ping') || (await fetch(url(Config.API.endpoints.ping))).ok
  ),

  fetchTranscript: async blob => {
    return request(Config.API.endpoints.transcript, {
      headers: { 'Content-Type': 'audio/wav' },
      method: 'POST',
      body: blob
    })
  },

  fetchQuestions: async () => (
    request(Config.API.endpoints.questions)
  ),

  fetchArtworks: async (question, artworks = []) => (
    request(Config.API.endpoints.artworks, {}, {
      q: question.id,
      ...(
        artworks.length
          ? { h: artworks.map(artwork => artwork.id) }
          : {}
      )
    })
  ),

  fetchTestimonies: async artwork => (
    request(Config.API.endpoints.testimonies, {}, {
      a: artwork.id
    })
  ),

  fetchAllTestimonies: async () => (
    request(Config.API.endpoints.testimoniesAll)
  ),

  pushTestimony: async (artwork, transcript = '', visitorId) => (
    request(Config.API.endpoints.testimony, {
      headers: { 'Content-Type': 'text/plain' },
      method: 'POST',
      body: transcript
    }, {
      a: artwork.id,
      c: Config.SESSION.city,
      v: visitorId
    })
  ),

  // `city` stands in for the moderator's identity until a real staff concept exists.
  moderateTestimony: async (id, status, city = Config.SESSION.city) => (
    request(Config.API.endpoints.testimony + '/' + id, { method: 'PATCH' }, { status, city })
  ),

  // print_png responds with an empty body on success, so this bypasses the
  // shared `request` helper instead of trying to parse JSON from nothing.
  print: async blob => {
    if (isMocked('print')) {
      console.log('%c[mock] POST /print_png', 'color: #888', blob)
      return
    }
    const response = await fetch(url(Config.API.endpoints.print), {
      headers: { 'Content-Type': 'image/png' },
      method: 'POST',
      body: blob
    })
    if (!response.ok) throw new Error(`API error ${response.status} on ${Config.API.endpoints.print}: ${await response.text()}`)
  },

  fetchSummary: async (visitorId, lang, artworks = []) => (
    request(Config.API.endpoints.summary, {
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
      body: JSON.stringify({
        visitor_id: visitorId,
        lang,
        artworks: artworks.map(artwork => ({
          type_of_object: artwork.type_of_object?.[lang],
          description: artwork.description?.[lang],
          testimony: artwork.testimony
        }))
      })
    })
  )
}
