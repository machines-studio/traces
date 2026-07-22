import { random, randomInt } from 'missing-math'

// Fixture responses for API mock mode (see Config.API.mock in config.dev.json)
//
// Field shapes/comments below mirror the Rust backend (pp1-backend-rust):
// src/questions.rs, src/artworks.rs, src/testimonies.rs, src/scoring.rs,
// and the sqlite schema (types_of_object, artwork_emotions, testimonies CHECK constraints).

// ResultArtwork.criterion tags which scoring criterion selected the artwork (src/scoring.rs).
// 'random' is used for the very first question (Artworks::read_matching_question_id, h absent).
// The other four are produced by scoring::proposals_from_history for subsequent rounds (h
// present) — exactly one artwork per criterion, aggregated via an OWA operator (weights:
// 0.125/0.125/0.125/0.625), so that branch always returns exactly 4 artworks.
const SCORING_CRITERIONS = [
  'year_scoring',
  'type_of_object_scoring',
  'emotions_scoring',
  'description_vector_scoring'
]

// artworks.type_of_object_id, resolved server-side against types_of_object and exposed
// as ResultArtwork.type_of_object ({en,fr,nl}, nullable — mirrors emotions/keywords).
const TYPE_OF_OBJECT = { en: 'Fine Arts', fr: 'Beaux-Arts', nl: 'Beeldende kunst' }

// artworks.origin (NOT NULL) — real distinct values seen in the collection DB.
const ORIGINS = ['Le Fresnoy', 'Abby', 'Maison des collections, Ville de Mons']

// artwork_emotions.emotion, resolved server-side against the emotions table and exposed
// as ResultArtwork.emotions (list of {en,fr,nl}, mirrors keywords/type_of_object).
const EMOTIONS = [
  { en: 'Joy', fr: 'Joie', nl: 'Vreugde' },
  { en: 'Trust', fr: 'Confiance', nl: 'Vertrouwen' },
  { en: 'Interest', fr: 'Intérêt', nl: 'Interesse' }
]

// One id per SCORING_CRITERIONS entry — proposals_from_scorings never repeats an artwork
// id within a single response (it explicitly excludes ids already picked by an earlier
// criterion, see the `result.iter().any(...)` guard in src/scoring.rs), so each question
// needs at least 4 distinct fixture ids to keep that guarantee true in mock mode too.
const ARTWORK_IDS_BY_QUESTION = {
  1: [1, 2, 3, 16],
  2: [4, 5, 6, 17],
  3: [7, 8, 9, 18],
  4: [10, 11, 12, 19],
  5: [13, 14, 15, 20]
}

// Mirrors ResultArtwork (src/artworks.rs): id, keywords (InternationalizedString), title
// (InternationalizedString, nullable), description (InternationalizedString), media_url
// (nullable), thumbnail_url (nullable), date_period (nullable, free-form text e.g. "circa
// 1850"), emotions (list of InternationalizedString), type_of_object (InternationalizedString,
// nullable), origin, criterion. Internal-only fields (description_vector, type_of_object_id,
// author_name, museum_id, storage_place, popularity, question_id, date_year_min/max) are used
// server-side for scoring/matching but never serialized to the client.
//
// media_url mirrors the DB format: comma-SPACE separated filenames, e.g.
// "a.jpg, b.jpg" (see database repo SCHEMA.md) — kept multi-item here so the
// client's split/trim logic is actually exercised in mock mode. Bare
// filenames (not full URLs): Api.assets() resolves them to a placeholder
// image itself when Config.API.mock is set, same as it resolves real
// filenames against the backend otherwise.
const artwork = (id, criterion) => ({
  id,
  keywords: {
    en: `mock, artwork, keyword-${id}`,
    fr: `mock, œuvre, mot-clé-${id}`,
    nl: `mock, kunstwerk, trefwoord-${id}`
  },
  // Not all artworks have a title, so this is randomly omitted here too.
  ...(random() < 0.5
    ? {}
    : {
        title: {
          en: `Mock title #${id}`,
          fr: `Titre factice #${id}`,
          nl: `Mock titel #${id}`
        }
      }
  ),
  description: {
    en: `Mock artwork #${id}: a placeholder description used for local debugging.`,
    fr: `Œuvre factice #${id} : une description de substitution utilisée pour le débogage local.`,
    nl: `Mock kunstwerk #${id}: een tijdelijke beschrijving voor lokaal debuggen.`
  },
  media_url: `mock-artwork-${id}-1.jpg, mock-artwork-${id}-2.jpg`,
  thumbnail_url: `mock-artwork-${id}-1.jpg`,
  date_period: '19th century',
  emotions: EMOTIONS,
  type_of_object: TYPE_OF_OBJECT,
  origin: ORIGINS[id % ORIGINS.length],
  criterion
})

// Mirrors Testimony (src/testimonies.rs / testimonies table).
// status: TEXT NOT NULL DEFAULT 'pending', CHECK IN ('pending', 'validated', 'censored').
//   - 'pending': just submitted, awaiting moderation (fresh POST /testimony insert).
//   - 'validated': reviewed and approved.
//   - 'censored': reviewed and rejected.
// XXX[back] Testimonies::read_matching_artwork_id has NO status filter today — GET
// /testimonies actually returns rows of any status (checked in testimonies.rs READ_QUERY).
// This mock still only ever produces 'validated' testimonies, since displaying
// pending/censored content to this client is presumably a bug to fix backend-side,
// not behavior to replicate.
// consent_given: INTEGER CHECK IN (0, 1) — visitor consent to publish/quote; Rocket route
//   new_testimony_route always inserts 1 (see Testimonies::new_testimony).
// moderated_at / moderated_by: null until a staff member reviews the testimony.
const LANGS = ['en', 'fr', 'nl']

// `city` holds a fixed city id (tourcoing/kortrijk/mons), stamped by the backend from
// the recording machine's own config (Config.TESTIMONIES.city) — not visitor input.
// Resolved through the `city.<id>` namespace in public/languages/*.json (see
// I18N('city.' + id)) since there's a small fixed set of physical locations.
const CITY_IDS = ['tourcoing', 'kortrijk', 'mons']

// created_at/moderated_at are SQLite's `datetime('now')` output (schema.sql), passed
// through by the backend as a raw String: "YYYY-MM-DD HH:MM:SS", UTC, no "T"/timezone
// suffix, no milliseconds — NOT ISO 8601 (Date.toISOString() would be wrong here).
const sqliteDatetime = date => date.toISOString().replace('T', ' ').replace(/\.\d+Z$/, '')

const testimony = (id, artworkId, { content, status = 'validated', city, visitorId = null } = {}) => {
  const lang = LANGS[id % LANGS.length]
  const fallback = {
    en: `This is a mock testimony #${id} for artwork ${artworkId}, used for local debugging.`,
    fr: `Ceci est un témoignage factice #${id} pour l'œuvre ${artworkId}, utilisé pour le débogage local.`,
    nl: `Dit is een mock getuigenis #${id} voor kunstwerk ${artworkId}, gebruikt voor lokaal debuggen.`
  }

  return {
    id,
    visitor_id: visitorId,
    artwork_id: artworkId,
    // A real transcript is only known in its recorded `lang` until moderation translates it.
    content: content ? { [lang]: content } : fallback,
    lang,
    city: city ?? CITY_IDS[id % CITY_IDS.length],
    status,
    consent_given: true,
    created_at: sqliteDatetime(new Date()),
    moderated_at: null,
    moderated_by: null
  }
}

let testimonyIdSeq = 1000
let summaryIdSeq = 1

export default {
  // Mirrors Question (src/questions.rs): id, content (InternationalizedString).
  questions: () => [
    {
      id: 1,
      content: {
        en: 'Which artwork reminds you of home?',
        fr: 'Quelle œuvre te rappelle la maison ?',
        nl: 'Welk kunstwerk doet je aan thuis denken?'
      }
    },
    {
      id: 2,
      content: {
        en: 'Which artwork feels the most alive?',
        fr: 'Quelle œuvre te semble la plus vivante ?',
        nl: 'Welk kunstwerk voelt het meest levend aan?'
      }
    },
    {
      id: 3,
      content: {
        en: 'Which artwork tells a story of loss?',
        fr: 'Quelle œuvre raconte une histoire de perte ?',
        nl: 'Welk kunstwerk vertelt een verhaal van verlies?'
      }
    },
    {
      id: 4,
      content: {
        en: 'Which artwork makes you feel hopeful?',
        fr: 'Quelle œuvre te donne de l’espoir ?',
        nl: 'Welk kunstwerk geeft je hoop?'
      }
    },
    {
      id: 5,
      content: {
        en: 'Which artwork feels like a memory of your own?',
        fr: 'Quelle œuvre te semble être un de tes propres souvenirs ?',
        nl: 'Welk kunstwerk voelt als een van je eigen herinneringen?'
      }
    }
  ],

  // GET /artworks?q=<question_id>&h=<comma-separated artwork id history>
  // `h` is optional: when absent/empty, backend calls Artworks::read_matching_question_id
  // (all artworks matching the question, criterion always "random" — sized however many
  // match, not fixed). When present, backend calls scoring::proposals_from_history instead,
  // which always returns exactly 4 artworks: one per entry in SCORING_CRITERIONS.
  artworks: ({ q, h }) => {
    const excluded = new Set((h ? h.split(',') : []).map(Number))
    const ids = (ARTWORK_IDS_BY_QUESTION[q] ?? [1, 2, 3]).filter(id => !excluded.has(id))
    if (!h) {
      return ids.map(id => artwork(id, 'random'))
    }
    return SCORING_CRITERIONS.map((criterion, i) => artwork(ids[i % ids.length], criterion))
  },

  // GET /testimonies?a=<artwork_id> — mocked with a mix of statuses on purpose: the real
  // route returns every status too, and it's up to the client to only render 'validated'
  // ones (see the .filter(...) in ArtworkScreen.jsx) — no server-side status filtering.
  testimonies: ({ a }) => new Array(randomInt(15)).fill(true).map((_, i) => testimony(Number(a) * 10 + i, Number(a), { status: ['validated', 'validated', 'pending', 'censored'][i % 4] })),

  // GET /testimonies/all — every testimony, unfiltered.
  testimoniesAll: () => new Array(30).fill(true).map((_, i) => testimony(2000 + i, (i % 10) + 1, { status: ['validated', 'validated', 'pending', 'censored'][i % 4] })),

  // POST /transcript (audio/wav body) → Json<String>, produced by TranscriptionState
  // (local Whisper-like transcription service); returns the raw transcribed text.
  transcript: () => 'This is a mock transcript of the recorded audio.',

  // POST creates, PATCH moderates.
  testimony: {
    POST: ({ a, c, v }, content) => [testimony(testimonyIdSeq++, Number(a), { content, status: 'pending', city: c, visitorId: v ?? null })],

    // Preserves the real id (parsed from the URL) so the list update matches the clicked row.
    PATCH: ({ status, city }, _body, endpoint) => {
      const id = Number(endpoint.split('/').pop())
      return [testimony(id, 1, { status, city })]
    }
  },

  summary: (_params, body) => {
    const { visitor_id: visitorId } = JSON.parse(body)
    return {
      id: summaryIdSeq++,
      visitor_id: visitorId,
      content: 'Ceci est un résumé factice généré pour le débogage local, sans appel au LLM.',
      created_at: sqliteDatetime(new Date())
    }
  }
}
