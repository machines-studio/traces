import './Artwork.scss'
import { Component, Props } from '@tooooools/ui'

import Config from '/controllers/Config'

export default class Artwork extends Component {
  static props = {
    'event-click': Props.required(Props.function),
    tags: Props.array,
    vector: Props.enum('type', 'emotion', 'date', 'description')
  }

  template ({ vector, tags = [] }) {
    return (
      <section
        class='artwork'
        event-click={this.props['event-click']}
        data-color={Config.COLORS.vectors[vector]}
      >
        <div class='artwork__wrapper'>
          <img src='/images/bb.png' /* WIP[back] */ />
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
}
