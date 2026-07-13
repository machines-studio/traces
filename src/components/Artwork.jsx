import './Artwork.scss'
import { Component, Props } from '@tooooools/ui'

import Config from '/controllers/Config'

export default class Artwork extends Component {
  static props = {
    'event-click': Props.required(Props.function),
    thumbnail: Props.string,
    tags: Props.array,
    // TODO testimonies count
    vector: Props.enum('type', 'emotion', 'date', 'description')
  }

  template ({ vector, tags = [], thumbnail = '' }) {
    return (
      <section
        class='artwork'
        event-click={this.props['event-click']}
        data-color={Config.COLORS.vectors[vector]}
      >
        <div class='artwork__wrapper'>
          <img src={thumbnail} />
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
