import './Caption.scss'
import { Component, Props } from '@tooooools/ui'
import { $ } from '@tooooools/ui/state'
import { Button } from '@tooooools/ui/components'

// TODO play voice sound with animation

export default class Caption extends Component {
  static props = {
    // TODO data-dir
    text: Props.required([Props.string, Props.Signal]),
    cta: [Props.string, Props.Signal]
  }

  template ({ text, cta }) {
    return (
      <section class='caption'>
        <div
          class='caption__text'
          innerHTML={$(text, text => text
            .replace(/\n/g, '<br>') // Handle line-breaks
            .split(/(<[^>]+>|\s+)/) // Split by words or tags
            .filter(token => token && !/^\s+$/.test(token))
            .map(token => /^<[^>]+>$/.test(token)
              ? token
              : `<span class='word'>${token}</span>`
            )
            .join(' ')
          )}
        />

        <Button text={cta} />
      </section>
    )
  }
}
