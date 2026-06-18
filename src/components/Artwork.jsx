import './Artwork.scss'
import { Component, Props } from '@tooooools/ui'

export default class Artwork extends Component {
  static props = {
    //
  }

  template () {
    return (
      <section
        class='artwork'
        event-click={this.#handleClick}
        data-color='blue'
      >
        <img src='/images/bb.png' />
        <div class='artwork__tag'>picture</div>
        <div class='artwork__tag'>colors</div>
      </section>
    )
  }

  #handleClick = e => {
    this.log('click')
  }
}
