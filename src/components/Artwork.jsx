import './Artwork.scss'
import { Component, Props } from '@tooooools/ui'

import Config from '/controllers/Config'
import shuffle from '/utils/array-shuffle'

export default class Artwork extends Component {
  static props = {
    'event-click': Props.required(Props.function),

    // Data structure from API
    date_period: Props.string,
    keywords: Props.string,
    emotions: Props.string,
    media_url: Props.required(Props.string),
    // TODO testimonies count
    // vector: Props.enum('type', 'emotion', 'date', 'description')
  }

  template ({
    /* eslint-disable camelcase */
    date_period = '',
    keywords = '',
    emotions = '',
    media_url // TODO thumbnail, and list of medias
  }) {
    const tags = [
      date_period,
      ...shuffle(keywords.split(/,\s?/g) ?? []).slice(0, 2), // 2 keywords
      ...shuffle(emotions.split(/,\s?/g) ?? []).slice(0, 2) // 2 emotions
    ]

    // WIP[back]
    const vector = 'emotion'

    return (
      <section
        class='artwork'
        event-click={this.props['event-click']}
        data-color={Config.COLORS.vectors[vector]}
      >
        <div class='artwork__wrapper'>
          <img src={media_url} />
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
