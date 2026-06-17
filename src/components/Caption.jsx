import './Caption.scss'
import { Component, Props } from '@tooooools/ui'
import { $ } from '@tooooools/ui/state'

// TODO play voice sound with animation

export default class Caption extends Component {
  static props = {
    // TODO data-dir
    text: Props.required([Props.string, Props.Signal]),
    cta: [Props.string, Props.Signal]
  }

  template ({ text }) {
    return (
      <section class='caption'>
        <div
          class='caption__text'
          innerHTML={$(text, text => text
            .replace(/\n/g, '<br>')
            .split(/\s/)
            .map(word => {
              this.log(word)
              return `<span class='word'>${word}</span>`
            })
            .join(' ')
          )}
        />
      </section>
    )
  }
}
