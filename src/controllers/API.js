import Config from '/controllers/Config'

const url = endpoint => Config.API.baseUrl + endpoint

const request = async (endpoint, options, params = {}) => {
  // Build the param urls query
  const query = Object.entries(params)
    .map(([key, value]) => {
      const list = Array.isArray(value) ? value.join(',') : value
      return `${encodeURIComponent(key)}=${encodeURIComponent(list).replaceAll('%2C', ',')}`
    })
    .join('&')

  const response = await fetch(url(endpoint) + (query ? '?' + query : ''), options)
  if (!response.ok) throw new Error(`API error ${response.status} on ${endpoint}: ${await response.text()}`)
  return response.json()
}

export default {
  ping: async () => (await fetch(url(Config.API.endpoints.ping))).ok,

  fetchTranscript: async blob => {
    return request(Config.API.endpoints.transcript, {
      headers: { 'Content-Type': 'audio/wav' },
      method: 'POST',
      body: blob
    })
  },

  fetchQuestions: async () => request(Config.API.endpoints.questions),

  fetchArtworks: async (question, artworks = []) => (
    request(Config.API.endpoints.artworks, {}, {
      q: question.id,
      h: artworks.map(artwork => artwork.id)
    })
  ),

  fetchTestimonies: async (artwork) =>
    request(Config.API.endpoints.testimonies, {}, {
      a: artwork.id
    })
}
