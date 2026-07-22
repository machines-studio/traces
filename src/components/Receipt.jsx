import './Receipt.scss'
import HtmlToSvg from '@tooooools/html-to-svg'
import { Component, Props } from '@tooooools/ui'
import { $ } from '@tooooools/ui/state'

import SVGHeadline from '/headline.svg?raw'
import SVGReceiptPartners from '/receipt-partners.svg?raw'
import Constellation from '/components/Constellation'
import Config from '/controllers/Config'
import I18N from '/controllers/I18N'
import Session from '/controllers/Session'
import svgToPng from '/utils/svg-to-png'

// Instanciate a new renderer
const renderer = new HtmlToSvg({
  debug: false,
  fonts: [
    { family: 'cabinet', url: '/fonts/cabinetgrotesk-medium.otf', weight: '500' },
    { family: 'cabinet', url: '/fonts/cabinetgrotesk-bold.otf', weight: '700' },
    { family: 'mono', url: '/fonts/dm-mono-medium.ttf', weight: '700' }
  ]
})

export default class Receipt extends Component {
  static props = {
    text: Props.required([Props.string, Props.Signal])
  }

  template ({ text }) {
    return (
      <section class='receipt'>
        <h1 innerHTML={SVGHeadline} />

        <header innerHTML={I18N('receipt.header', { id: Session.id })} />

        <Constellation
          fill
          seed={Session.seed}
          length={Config.SESSION.rounds}
          artworks={Session.trace}
          ref={this.ref('constellation')}
        />

        <article
          innerHTML={$(text, (text = '') => (
            text?.split(/\n/g)
              .filter(t => t.trim())
              .map(t => `<p>${t}</p>`)
              .join('')
          ))}
        />

        <footer innerHTML={SVGReceiptPartners} />
      </section>
    )
  }

  toSVG = async () => {
    await renderer.preload()

    return renderer.render(this.base, {
      splitText: true,
      rasterizeNestedSVG: true
    })
  }

  toPNG = async () => {
    const svg = await this.toSVG()

    return svgToPng(svg.outerHTML, {
      width: Config.PRINTER.dots,
      background: 'white',
      threshold: Config.PRINTER.darknessThreshold
    })
  }
}
