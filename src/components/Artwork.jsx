import './Artwork.scss'
import { Component, Props } from '@tooooools/ui'
import { random } from 'missing-math'

import * as Icons from '/data/icons'
import API from '/controllers/API'
import Config, { DEBUG } from '/controllers/Config'
import I18N from '/controllers/I18N'
import shuffle from '/utils/array-shuffle'

export default class Artwork extends Component {
  static props = {
    'event-click': Props.function,

    // Data structure from API
    date_period: Props.string,
    keywords: [Props.object, Props.string],
    emotions: Props.array,
    thumbnail_url: Props.string,
    testimonies: Props.required(Props.array),
    criterion: Props.enum(
      'random',
      'year_scoring',
      'type_of_object_scoring',
      'emotions_scoring',
      'description_vector_scoring'
    )
  }

  beforeRender () {
    if (DEBUG.includes('artworks')) {
      this.log(this.props)
    }
  }

  template ({
    /* eslint-disable camelcase */
    date_period = '',
    keywords = '',
    emotions = '',
    testimonies = [],
    criterion = 'random',
    thumbnail_url: thumbnailUrl
  }) {
    const tags = [
      date_period,
      ...shuffle(I18N.resolve(keywords).split(/,\s?/g) ?? []).slice(0, Config.ARTWORK.maxKeywords),
      ...shuffle(emotions.map(emotion => I18N.resolve(emotion))).slice(0, Config.ARTWORK.maxEmotions)
    ]

    return (
      <section
        class={['artwork', this.props.class]}
        style={this.props.style}
        event-click={this.props['event-click']}
        data-color={Config.COLORS.criterions[criterion]}
      >
        <div class='artwork__wrapper'>
          <img
            src={API.assets(thumbnailUrl)}
            event-error={this.#handleThumbnailError}
          />
          <ul class='artwork__tags'>
            {
              tags.map(tag => (
                <li
                  class='artwork__tag'
                  innerText={I18N.resolve(tag)}
                  style={{ '--seed': random() }}
                />
              ))
            }

            {
              testimonies.slice(0, Config.ARTWORK.maxTestimonies).map(testimony => (
                <li
                  class='artwork__tag'
                  innerHTML={Icons.testimony}
                  style={{ '--seed': random() }}
                />
              ))
            }
          </ul>
        </div>
      </section>
    )
  }

  #handleThumbnailError = e => {
    e.target.classList.add('has-error')
    e.target.src = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='
  }
}
