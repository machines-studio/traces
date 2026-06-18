import './Artwork.scss'
import { Component, Props } from '@tooooools/ui'

export default class Artwork extends Component {
  static props = {
    //
  }

  template () {
    // TODO dynamic
    const tags = [
      'picture',
      'colors',
      'foo',
      'bar'
    ]
    return (
      <section
        class='artwork'
        event-click={this.#handleClick}
        data-color='blue'
      >
        <div class='artwork__wrapper'>
          <img src='/images/bb.png' />
          <ul class='artwork__tags'>
            {
              tags.map(tag => (
                <li
                  class='artwork__tag'
                  innerText={tag}
                  style={{
                    '--seed': Math.random()
                  }}
                />
              ))
            }
          </ul>
        </div>
      </section>
    )
  }

  #handleClick = e => {
    this.log('click')
  }
}
