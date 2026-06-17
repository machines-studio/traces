import './Caption.scss'
import { Component, Props } from '@tooooools/ui'
import { Button } from '@tooooools/ui/components'
import { $, not } from '@tooooools/ui/state'

import GamepadRow from '/components/GamepadRow'

// ??? play voice sound with caption__text animation ?

export default class Caption extends Component {
  static props = {
    // TODO data-dir
    text: Props.required([Props.string, Props.Signal]),
    hint: [Props.string, Props.Signal],
  }

  template ({ text, hint }) {
    const $tokens = $(text, text => text
      .replace(/\n/g, '<br>') // Handle line-breaks
      .split(/(<[^>]+>|\s+)/) // Split by words or tags
      .filter(token => token && !/^\s+$/.test(token))
      .map((token, index) => /^<[^>]+>$/.test(token)
        ? token
        : `<span style='--token-index: ${index}'>${token}</span>`
      )
    )

    return (
      <section class='caption'>
        <div
          class='caption__text'
          style={{
            '--tokens-length': $($tokens, tokens => tokens.length + 1)
          }}
          innerHTML={$($tokens, tokens => tokens.join(' '))}
        />

        <Button
          class='caption__hint'
          hidden={not($(hint))}
          label={hint}
        />

        <GamepadRow>
          {this.props.children}
        </GamepadRow>
      </section>
    )
  }
}
