import './EndScreen.scss'

import { Component } from '@tooooools/ui'

import Caption from '/components/Caption'
import Constellation from '/components/Constellation'
import Receipt from '/components/Receipt'
import API from '/controllers/API'
import Config from '/controllers/Config'
import I18N from '/controllers/I18N'
import Session from '/controllers/Session'
import delay from '/utils/delay'
import widont from '/utils/string-widont'

export default class EndScreen extends Component {
  template () {
    return (
      <section
        class='end-screen screen'
      >
        <Constellation
          seed={Session.seed}
          length={Config.SESSION.rounds}
          artworks={Session.trace}
          ref={this.ref('constellation')}
        />

        <Caption
          skippable
          position='bottom'
          text={widont(I18N('end', {}, null))}
          hint={widont(I18N('end.hint', {}, null))}
          ref={this.ref('caption')}
        />

        <Receipt
          text={Session.$summary}
          ref={this.ref('receipt')}
        />
      </section>
    )
  }

  async afterMount () {
    // Attach the animation listener now, in parallel with printing: printing can easily
    // outlast the caption's word-reveal animation, and waitForAnimationEnd() would then
    // miss the (already fired) event and hang forever if awaited only after the print.
    const captionDone = this.refs.caption.waitForAnimationEnd()

    await Session.prefetchSummary()

    try {
      await API.print(await this.refs.receipt.toPNG())
    } catch (error) {
      console.error(error)
      throw new Error('Cannot print receipt', { cause: error })
    }

    await captionDone
    await delay(Config.END.displayDuration)

    this.base.classList.add('is-leaving')
    Session.$screen.value = 'credits'
  }
}
