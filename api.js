const SERP_API_URL = 'https://serpapi.com/search'
const TEXT_RAZOR_API_URL = 'https://api.textrazor.com'
const MAX_SERP_CACHE_SIZE = 100

const apiConfig = {
  serpApiKey: '',
  textRazorKey: '',
  serpCache: new Map()
}

function initApi({ serpApiKey, textRazorKey }) {
  if (serpApiKey) apiConfig.serpApiKey = serpApiKey
  if (textRazorKey) apiConfig.textRazorKey = textRazorKey
}

async function fetchSERPData(query) {
  if (!apiConfig.serpApiKey) {
    throw new Error('SERP API key is not initialized')
  }
  const q = String(query).trim()
  if (!q) {
    throw new Error('Query must be a non-empty string')
  }
  if (apiConfig.serpCache.has(q)) {
    return apiConfig.serpCache.get(q)
  }
  const params = new URLSearchParams({
    engine: 'google',
    q,
    api_key: apiConfig.serpApiKey
  })
  const url = `${SERP_API_URL}?${params.toString()}`
  const fetchPromise = fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error(`SERP API error: ${response.status} ${response.statusText}`)
      }
      return response.json()
    })
    .catch(error => {
      apiConfig.serpCache.delete(q)
      throw error
    })
  if (apiConfig.serpCache.size >= MAX_SERP_CACHE_SIZE) {
    const oldestKey = apiConfig.serpCache.keys().next().value
    apiConfig.serpCache.delete(oldestKey)
  }
  apiConfig.serpCache.set(q, fetchPromise)
  return fetchPromise
}

async function fetchRelatedSearches(query) {
  const data = await fetchSERPData(query)
  if (Array.isArray(data.related_searches)) {
    return data.related_searches.map(item => ({
      query: item.query || item,
      link: item.link || null
    }))
  }
  return []
}

async function fetchPeopleAlsoAsk(query) {
  const data = await fetchSERPData(query)
  if (Array.isArray(data.people_also_ask)) {
    return data.people_also_ask.map(item => ({
      question: item.question || item,
      link: item.link || null
    }))
  }
  if (Array.isArray(data.related_questions)) {
    return data.related_questions.map(item => ({
      question: item.question || item,
      link: item.link || null
    }))
  }
  return []
}

async function fetchEntityAnalysis(text) {
  if (!apiConfig.textRazorKey) {
    throw new Error('TextRazor API key is not initialized')
  }
  if (typeof text !== 'string' || !text.trim()) {
    throw new Error('Text must be a non-empty string')
  }
  const body = new URLSearchParams({
    text: text.trim(),
    extractors: 'entities'
  })
  const response = await fetch(TEXT_RAZOR_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'x-textrazor-key': apiConfig.textRazorKey
    },
    body: body.toString()
  })
  if (!response.ok) {
    throw new Error(`TextRazor API error: ${response.status} ${response.statusText}`)
  }
  const result = await response.json()
  return (result.response && result.response.entities) || []
}

// Expose functions to global namespace
window.SEOWidgetPlus = window.SEOWidgetPlus || {}
window.SEOWidgetPlus.api = {
  initApi,
  fetchSERPData,
  fetchRelatedSearches,
  fetchPeopleAlsoAsk,
  fetchEntityAnalysis
}