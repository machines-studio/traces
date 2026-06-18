import './Artwork.scss'
import { Component, Props } from '@tooooools/ui'

// Assign a color to each vector
const COLORS = {
  type: 'green',
  emotion: 'red',
  date: 'yellow',
  description: 'blue'
}

export default class Artwork extends Component {
  static props = {
    tags: Props.array,
    vector: Props.enum('type', 'emotion', 'date', 'description')
  }

  template ({ vector, tags = [] }) {
    return (
      <section
        class='artwork'
        event-click={this.#handleClick}
        data-color={COLORS[vector]}
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
