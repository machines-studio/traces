import '/test/test.scss'

import { render } from '@tooooools/ui'
import { clamp } from 'missing-math'

import Receipt from '/components/Receipt'
import API from '/controllers/API'
import Config, { loadConfig, DEBUG } from '/controllers/Config'
import { checkMissingTranslations, loadTranslations } from '/controllers/I18N'
import Session from '/controllers/Session'

// Fetch config, translations, ping server and render app
;(async () => {
  await loadConfig()
  await loadTranslations()

  if (DEBUG.includes('translations')) checkMissingTranslations()

  if (!await API.ping()) throw new Error('Cannot reach API')

  // ?debug=trace&step=N fast-fills Session.trace via the real load/commit pipeline.
  if (DEBUG.includes('trace')) {
    const params = new URLSearchParams(window.location.search)
    const step = clamp(Number(params.get('step')), 0, Config.SESSION.rounds)
    const landsOnConstellation = params.get('screen') === 'constellation'
    const rounds = landsOnConstellation ? Math.max(step - 1, 0) : step
    await Session.loadQuestions()
    for (let i = 0; i < rounds; i++) {
      await Session.loadQuestion()
      await Session.loadArtworks()
      Session.$artwork.value = Session.$artworks.value[0]
      Session.commit()
    }
    if (landsOnConstellation && step > 0) {
      await Session.loadQuestion()
      await Session.loadArtworks()
      Session.$artwork.value = Session.$artworks.value[0]
    }
  }

  const receipt = render(
    <Receipt
      text={`
        Tu es entré dans TRACES par le côté du jeu, mais ce n'est pas là que tu t'es arrêté le plus longtemps.
        C'est devant un ruban coupé en deux que quelque chose a changé. Un geste d'avant ta naissance — une moitié gardée, une moitié confiée. Tu n'as pas su quoi en faire au premier regard, et c'est peut-être cela qui compte : ne pas savoir tout de suite. Plus loin, un enfant en chemise de nuit fixait un point hors champ. Ses pieds nus sur le sol froid. Tu as reconnu cette posture — debout dans le couloir, la nuit, avant de décider si l'on va frapper à une porte ou non. La grand-mère filmée, elle, rangeait une recette dans de l'ADN. Comme si certaines choses méritaient de durer plus longtemps que les supports qu'on leur confie.
      `}
    />).components[0]

  const svg = await receipt.toSVG()
  document.body.appendChild(svg)

  const img = new Image()
  const png = await receipt.toPNG()
  img.src = URL.createObjectURL(png)
  document.body.appendChild(img)

  for (const el of [receipt.base, svg, img]) {
    el.addEventListener('click', () => API.print(png))
  }
})()
