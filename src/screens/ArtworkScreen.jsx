import './ArtworkScreen.scss'

import { Component, Props } from '@tooooools/ui'
import { $, slot, isSignal } from '@tooooools/ui/state'

import Caption from '/components/Caption'
import Eyes from '/components/Eyes'
import GamepadRow from '/components/GamepadRow'
import Recorder from '/components/Recorder'
import Testimony from '/components/Testimony'
import Config from '/controllers/Config'
import Gamepad from '/controllers/Gamepad'
import I18N from '/controllers/I18N'
import lastOf from '/utils/array-last'
import widont from '/utils/string-widont'

export default class ArtworkScreen extends Component {
  static props = {
    artwork: Props.required(Props.object),
    language: Props.required(Props.Signal),
    screen: Props.required(Props.Signal),
    question: Props.required(Props.Signal)
  }

  $currentSection = slot() // Will be content, testimonies, or recorder

  beforeRender () {
    // WIP[back]
    this.props.artwork = {
      vector: 'description',
      tags: [{ fr: 'couleur', en: 'color' }, { fr: 'image', en: 'picture' }, { fr: 'bizarre', en: 'weird' }],
      title: { fr: 'Bébé moche', en: 'Weird Baby with a weird funnel on its weird head' },
      date: 1928,
      text: { fr: 'Le texte en FR', en: 'Auctor ultrices fermentum scelerisque turpis non nibh velit at sit dignissim porta, consequat vitae senectus tempus ad erat quam primis sagittis. Justo sollicitudin finibus neque proin eros euismod class sit tincidunt.' },
      medias: [
        { type: 'image', src: '/images/bb.png', caption: { fr: 'bb moche', en: 'Ugly weird baby' } },
        { type: 'image', src: '/images/bb.png' },
        { type: 'text', content: { en: 'Taciti vivamus turpis enim feugiat eleifend orci elit integer suscipit augue donec volutpat, tristique velit justo ex parturient senectus curae erat convallis lobortis. Adipiscing erat nullam porta pulvinar nascetur malesuada posuere ac a duis, torquent dictumst nam curae vivamus litora nibh elementum vel. In imperdiet pharetra scelerisque morbi adipiscing mi eget ornare dui sagittis ex eros congue volutpat curae finibus, nibh eu justo dis rhoncus accumsan natoque nam facilisis elementum efficitur penatibus himenaeos laoreet arcu.' } },
        // WIP
        // { type: 'video', src: '/images/bb.png' },
        // { type: 'sound', src: '/images/bb.png' }
      ],
      testimonies: [
        { timestamp: Date.now(), location: 'Abby Kortrijk', transcript: 'Proin non ad dis aliquam ultrices aptent justo nibh litora pulvinar risus cursus lacus velit platea consectetur facilisis venenatis orci massa nunc porta morbi ac turpis penatibus tempor luctus neque volutpat dolor. Finibus facilisis mollis turpis purus lectus lorem eu vulputate amet, dignissim dis sociosqu enim himenaeos dictumst quisque integer, eros magnis sem magna metus consequat faucibus ridiculus. Lorem potenti turpis commodo aliquam tempor tristique morbi nec duis ornare senectus, efficitur fames tempus malesuada varius nascetur iaculis ultrices nulla facilisi.', content: { en: 'Magna nisi arcu euismod pretium habitasse fames cubilia malesuada eget maecenas elementum volutpat ut vestibulum, enim pellentesque nunc eros potenti semper aliquet dolor montes cursus accumsan varius quisque. Dis mattis suspendisse natoque penatibus litora primis purus nam eleifend vivamus sagittis ante nec sem volutpat, felis dignissim taciti iaculis egestas maximus habitant eros conubia inceptos odio vel bibendum habitasse. Mauris sollicitudin sed libero quis a est sapien id vestibulum dictumst luctus, aliquam massa maecenas viverra fringilla purus semper fusce in.' } },
        { timestamp: Date.now(), location: 'Abby Kortrijk', transcript: 'Proin non ad dis aliquam ultrices aptent justo nibh litora pulvinar risus cursus lacus velit platea consectetur facilisis venenatis orci massa nunc porta morbi ac turpis penatibus tempor luctus neque volutpat dolor. Finibus facilisis mollis turpis purus lectus lorem eu vulputate amet, dignissim dis sociosqu enim himenaeos dictumst quisque integer, eros magnis sem magna metus consequat faucibus ridiculus. Lorem potenti turpis commodo aliquam tempor tristique morbi nec duis ornare senectus, efficitur fames tempus malesuada varius nascetur iaculis ultrices nulla facilisi.', content: { en: 'Magna nisi arcu euismod pretium habitasse fames cubilia malesuada eget maecenas elementum volutpat ut vestibulum, enim pellentesque nunc eros potenti semper aliquet dolor montes cursus accumsan varius quisque. Dis mattis suspendisse natoque penatibus litora primis purus nam eleifend vivamus sagittis ante nec sem volutpat, felis dignissim taciti iaculis egestas maximus habitant eros conubia inceptos odio vel bibendum habitasse. Mauris sollicitudin sed libero quis a est sapien id vestibulum dictumst luctus, aliquam massa maecenas viverra fringilla purus semper fusce in.' } },
        { timestamp: Date.now(), location: 'Abby Kortrijk', content: { en: 'Magna nisi arcu euismod pretium habitasse fames cubilia malesuada eget maecenas elementum volutpat ut vestibulum, enim pellentesque nunc eros potenti semper aliquet dolor montes cursus accumsan varius quisque. Dis mattis suspendisse natoque penatibus litora primis purus nam eleifend vivamus sagittis ante nec sem volutpat, felis dignissim taciti iaculis egestas maximus habitant eros conubia inceptos odio vel bibendum habitasse. Mauris sollicitudin sed libero quis a est sapien id vestibulum dictumst luctus, aliquam massa maecenas viverra fringilla purus semper fusce in.' } },
        { timestamp: Date.now(), location: 'Abby Kortrijk', transcript: 'Proin non ad dis aliquam ultrices aptent justo nibh litora pulvinar risus cursus lacus velit platea consectetur facilisis venenatis orci massa nunc porta morbi ac turpis penatibus tempor luctus neque volutpat dolor. Finibus facilisis mollis turpis purus lectus lorem eu vulputate amet, dignissim dis sociosqu enim himenaeos dictumst quisque integer, eros magnis sem magna metus consequat faucibus ridiculus. Lorem potenti turpis commodo aliquam tempor tristique morbi nec duis ornare senectus, efficitur fames tempus malesuada varius nascetur iaculis ultrices nulla facilisi.', content: { en: 'Magna nisi arcu euismod pretium habitasse fames cubilia malesuada eget maecenas elementum volutpat ut vestibulum, enim pellentesque nunc eros potenti semper aliquet dolor montes cursus accumsan varius quisque. Dis mattis suspendisse natoque penatibus litora primis purus nam eleifend vivamus sagittis ante nec sem volutpat, felis dignissim taciti iaculis egestas maximus habitant eros conubia inceptos odio vel bibendum habitasse. Mauris sollicitudin sed libero quis a est sapien id vestibulum dictumst luctus, aliquam massa maecenas viverra fringilla purus semper fusce in.' } },
        { timestamp: Date.now(), location: 'Abby Kortrijk', transcript: 'Proin non ad dis aliquam ultrices aptent justo nibh litora pulvinar risus cursus lacus velit platea consectetur facilisis venenatis orci massa nunc porta morbi ac turpis penatibus tempor luctus neque volutpat dolor. Finibus facilisis mollis turpis purus lectus lorem eu vulputate amet, dignissim dis sociosqu enim himenaeos dictumst quisque integer, eros magnis sem magna metus consequat faucibus ridiculus. Lorem potenti turpis commodo aliquam tempor tristique morbi nec duis ornare senectus, efficitur fames tempus malesuada varius nascetur iaculis ultrices nulla facilisi.', content: { en: 'Magna nisi arcu euismod pretium habitasse fames cubilia malesuada eget maecenas elementum volutpat ut vestibulum, enim pellentesque nunc eros potenti semper aliquet dolor montes cursus accumsan varius quisque. Dis mattis suspendisse natoque penatibus litora primis purus nam eleifend vivamus sagittis ante nec sem volutpat, felis dignissim taciti iaculis egestas maximus habitant eros conubia inceptos odio vel bibendum habitasse. Mauris sollicitudin sed libero quis a est sapien id vestibulum dictumst luctus, aliquam massa maecenas viverra fringilla purus semper fusce in.' } },
        { timestamp: Date.now(), location: 'Abby Kortrijk', content: { en: 'Magna nisi arcu euismod pretium habitasse fames cubilia malesuada eget maecenas elementum volutpat ut vestibulum, enim pellentesque nunc eros potenti semper aliquet dolor montes cursus accumsan varius quisque. Dis mattis suspendisse natoque penatibus litora primis purus nam eleifend vivamus sagittis ante nec sem volutpat, felis dignissim taciti iaculis egestas maximus habitant eros conubia inceptos odio vel bibendum habitasse. Mauris sollicitudin sed libero quis a est sapien id vestibulum dictumst luctus, aliquam massa maecenas viverra fringilla purus semper fusce in.' } },
        { timestamp: Date.now(), location: 'Abby Kortrijk', content: { en: 'Magna nisi arcu euismod pretium habitasse fames cubilia malesuada eget maecenas elementum volutpat ut vestibulum, enim pellentesque nunc eros potenti semper aliquet dolor montes cursus accumsan varius quisque. Dis mattis suspendisse natoque penatibus litora primis purus nam eleifend vivamus sagittis ante nec sem volutpat, felis dignissim taciti iaculis egestas maximus habitant eros conubia inceptos odio vel bibendum habitasse. Mauris sollicitudin sed libero quis a est sapien id vestibulum dictumst luctus, aliquam massa maecenas viverra fringilla purus semper fusce in.' } },
        { timestamp: Date.now(), location: 'Abby Kortrijk', content: { en: 'Magna nisi arcu euismod pretium habitasse fames cubilia malesuada eget maecenas elementum volutpat ut vestibulum, enim pellentesque nunc eros potenti semper aliquet dolor montes cursus accumsan varius quisque. Dis mattis suspendisse natoque penatibus litora primis purus nam eleifend vivamus sagittis ante nec sem volutpat, felis dignissim taciti iaculis egestas maximus habitant eros conubia inceptos odio vel bibendum habitasse. Mauris sollicitudin sed libero quis a est sapien id vestibulum dictumst luctus, aliquam massa maecenas viverra fringilla purus semper fusce in.' } },
        { timestamp: Date.now(), location: 'Abby Kortrijk', transcript: 'Proin non ad dis aliquam ultrices aptent justo nibh litora pulvinar risus cursus lacus velit platea consectetur facilisis venenatis orci massa nunc porta morbi ac turpis penatibus tempor luctus neque volutpat dolor. Finibus facilisis mollis turpis purus lectus lorem eu vulputate amet, dignissim dis sociosqu enim himenaeos dictumst quisque integer, eros magnis sem magna metus consequat faucibus ridiculus. Lorem potenti turpis commodo aliquam tempor tristique morbi nec duis ornare senectus, efficitur fames tempus malesuada varius nascetur iaculis ultrices nulla facilisi.', content: { en: 'Magna nisi arcu euismod pretium habitasse fames cubilia malesuada eget maecenas elementum volutpat ut vestibulum, enim pellentesque nunc eros potenti semper aliquet dolor montes cursus accumsan varius quisque. Dis mattis suspendisse natoque penatibus litora primis purus nam eleifend vivamus sagittis ante nec sem volutpat, felis dignissim taciti iaculis egestas maximus habitant eros conubia inceptos odio vel bibendum habitasse. Mauris sollicitudin sed libero quis a est sapien id vestibulum dictumst luctus, aliquam massa maecenas viverra fringilla purus semper fusce in.' } },
        { timestamp: Date.now(), location: 'Abby Kortrijk', transcript: 'Proin non ad dis aliquam ultrices aptent justo nibh litora pulvinar risus cursus lacus velit platea consectetur facilisis venenatis orci massa nunc porta morbi ac turpis penatibus tempor luctus neque volutpat dolor. Finibus facilisis mollis turpis purus lectus lorem eu vulputate amet, dignissim dis sociosqu enim himenaeos dictumst quisque integer, eros magnis sem magna metus consequat faucibus ridiculus. Lorem potenti turpis commodo aliquam tempor tristique morbi nec duis ornare senectus, efficitur fames tempus malesuada varius nascetur iaculis ultrices nulla facilisi.', content: { en: 'Magna nisi arcu euismod pretium habitasse fames cubilia malesuada eget maecenas elementum volutpat ut vestibulum, enim pellentesque nunc eros potenti semper aliquet dolor montes cursus accumsan varius quisque. Dis mattis suspendisse natoque penatibus litora primis purus nam eleifend vivamus sagittis ante nec sem volutpat, felis dignissim taciti iaculis egestas maximus habitant eros conubia inceptos odio vel bibendum habitasse. Mauris sollicitudin sed libero quis a est sapien id vestibulum dictumst luctus, aliquam massa maecenas viverra fringilla purus semper fusce in.' } },
        { timestamp: Date.now(), location: 'Abby Kortrijk', transcript: 'Proin non ad dis aliquam ultrices aptent justo nibh litora pulvinar risus cursus lacus velit platea consectetur facilisis venenatis orci massa nunc porta morbi ac turpis penatibus tempor luctus neque volutpat dolor. Finibus facilisis mollis turpis purus lectus lorem eu vulputate amet, dignissim dis sociosqu enim himenaeos dictumst quisque integer, eros magnis sem magna metus consequat faucibus ridiculus. Lorem potenti turpis commodo aliquam tempor tristique morbi nec duis ornare senectus, efficitur fames tempus malesuada varius nascetur iaculis ultrices nulla facilisi.', content: { en: 'Magna nisi arcu euismod pretium habitasse fames cubilia malesuada eget maecenas elementum volutpat ut vestibulum, enim pellentesque nunc eros potenti semper aliquet dolor montes cursus accumsan varius quisque. Dis mattis suspendisse natoque penatibus litora primis purus nam eleifend vivamus sagittis ante nec sem volutpat, felis dignissim taciti iaculis egestas maximus habitant eros conubia inceptos odio vel bibendum habitasse. Mauris sollicitudin sed libero quis a est sapien id vestibulum dictumst luctus, aliquam massa maecenas viverra fringilla purus semper fusce in.' } },
        { timestamp: Date.now(), location: 'Abby Kortrijk', content: { en: 'Magna nisi arcu euismod pretium habitasse fames cubilia malesuada eget maecenas elementum volutpat ut vestibulum, enim pellentesque nunc eros potenti semper aliquet dolor montes cursus accumsan varius quisque. Dis mattis suspendisse natoque penatibus litora primis purus nam eleifend vivamus sagittis ante nec sem volutpat, felis dignissim taciti iaculis egestas maximus habitant eros conubia inceptos odio vel bibendum habitasse. Mauris sollicitudin sed libero quis a est sapien id vestibulum dictumst luctus, aliquam massa maecenas viverra fringilla purus semper fusce in.' } },
        { timestamp: Date.now(), location: 'Abby Kortrijk', content: { en: 'Magna nisi arcu euismod pretium habitasse fames cubilia malesuada eget maecenas elementum volutpat ut vestibulum, enim pellentesque nunc eros potenti semper aliquet dolor montes cursus accumsan varius quisque. Dis mattis suspendisse natoque penatibus litora primis purus nam eleifend vivamus sagittis ante nec sem volutpat, felis dignissim taciti iaculis egestas maximus habitant eros conubia inceptos odio vel bibendum habitasse. Mauris sollicitudin sed libero quis a est sapien id vestibulum dictumst luctus, aliquam massa maecenas viverra fringilla purus semper fusce in.' } },
        { timestamp: Date.now(), location: 'Abby Kortrijk', content: { en: 'Magna nisi arcu euismod pretium habitasse fames cubilia malesuada eget maecenas elementum volutpat ut vestibulum, enim pellentesque nunc eros potenti semper aliquet dolor montes cursus accumsan varius quisque. Dis mattis suspendisse natoque penatibus litora primis purus nam eleifend vivamus sagittis ante nec sem volutpat, felis dignissim taciti iaculis egestas maximus habitant eros conubia inceptos odio vel bibendum habitasse. Mauris sollicitudin sed libero quis a est sapien id vestibulum dictumst luctus, aliquam massa maecenas viverra fringilla purus semper fusce in.' } },
        { timestamp: Date.now(), location: 'Abby Kortrijk', content: { en: 'Magna nisi arcu euismod pretium habitasse fames cubilia malesuada eget maecenas elementum volutpat ut vestibulum, enim pellentesque nunc eros potenti semper aliquet dolor montes cursus accumsan varius quisque. Dis mattis suspendisse natoque penatibus litora primis purus nam eleifend vivamus sagittis ante nec sem volutpat, felis dignissim taciti iaculis egestas maximus habitant eros conubia inceptos odio vel bibendum habitasse. Mauris sollicitudin sed libero quis a est sapien id vestibulum dictumst luctus, aliquam massa maecenas viverra fringilla purus semper fusce in.' } },
        { timestamp: Date.now(), location: 'Abby Kortrijk', transcript: 'Proin non ad dis aliquam ultrices aptent justo nibh litora pulvinar risus cursus lacus velit platea consectetur facilisis venenatis orci massa nunc porta morbi ac turpis penatibus tempor luctus neque volutpat dolor. Finibus facilisis mollis turpis purus lectus lorem eu vulputate amet, dignissim dis sociosqu enim himenaeos dictumst quisque integer, eros magnis sem magna metus consequat faucibus ridiculus. Lorem potenti turpis commodo aliquam tempor tristique morbi nec duis ornare senectus, efficitur fames tempus malesuada varius nascetur iaculis ultrices nulla facilisi.', content: { en: 'Magna nisi arcu euismod pretium habitasse fames cubilia malesuada eget maecenas elementum volutpat ut vestibulum, enim pellentesque nunc eros potenti semper aliquet dolor montes cursus accumsan varius quisque. Dis mattis suspendisse natoque penatibus litora primis purus nam eleifend vivamus sagittis ante nec sem volutpat, felis dignissim taciti iaculis egestas maximus habitant eros conubia inceptos odio vel bibendum habitasse. Mauris sollicitudin sed libero quis a est sapien id vestibulum dictumst luctus, aliquam massa maecenas viverra fringilla purus semper fusce in.' } },
        { timestamp: Date.now(), location: 'Abby Kortrijk', content: { en: 'Magna nisi arcu euismod pretium habitasse fames cubilia malesuada eget maecenas elementum volutpat ut vestibulum, enim pellentesque nunc eros potenti semper aliquet dolor montes cursus accumsan varius quisque. Dis mattis suspendisse natoque penatibus litora primis purus nam eleifend vivamus sagittis ante nec sem volutpat, felis dignissim taciti iaculis egestas maximus habitant eros conubia inceptos odio vel bibendum habitasse. Mauris sollicitudin sed libero quis a est sapien id vestibulum dictumst luctus, aliquam massa maecenas viverra fringilla purus semper fusce in.' } },
      ]
    }

    // Ensure prop.artwork is not a Signal to avoid unecessary rendering overhead
    this.props.artwork = isSignal(this.props.artwork)
      ? this.props.artwork.value
      : this.props.artwork
  }

  template ({ artwork, question }) {
    if (!artwork) return 'No artwork found.'

    const text = I18N.resolve(artwork.text)

    return (
      <section
        class='artwork-screen screen'
        data-section={this.$currentSection}
        data-color={Config.COLORS.vectors[artwork.vector]}
      >
        <header class='artwork-screen__header'>
          {/* TODO constellation */}

          <Caption
            position='top'
            text={$([this.$currentSection, question], ([section, question]) => {
              switch (section) {
                case 'content':
                case 'testimonies': return I18N.resolve(question)

                case 'recorder': return I18N('artwork.record.0', { question: I18N.resolve(question) })
              }
              widont(I18N.resolve(question))
            })}
            hint={$(this.$currentSection, section => {
              switch (section) {
                case 'content': return I18N('artwork.hint.explore')
                case 'testimonies': return I18N('artwork.hint.scroll-top')
                case 'recorder': return I18N('TODO')
              }
            })}
          />
        </header>

        <GamepadRow
          class='artwork-screen__content'
          initial='start'
          scroll={{ inline: 'nearest', ifNeeded: true }}
          event-focus={() => window.scrollTo(0, 0)}
          ref={this.refMap('rows', 'content')}
        >
          <div class='panel'>
            <article ref={this.ref('article')}>
              <header>
                <h1>{I18N.resolve(artwork.title)}</h1>
                <ul class='metas'>
                  <li>{I18N.resolve(artwork.date)}</li>
                </ul>
              </header>

              <section ref={this.ref('prose')} class='prose' innerHTML={text} />

              <footer>
                {artwork.tags.map(tag => (<span innerText={I18N.resolve(tag)} />))}
              </footer>
            </article>
          </div>

          {
            artwork.medias.map(({ type, src, caption, content }) => {
              switch (type) {
                case 'image': return src && (
                  <div class='panel'>
                    <figure>
                      <img src={src} />
                      <figcaption innerText={I18N.resolve(caption)} />
                    </figure>
                  </div>
                )

                case 'text': return I18N.resolve(content) && (
                  <div class='panel'>
                    <figure>
                      <article>{I18N.resolve(content)}</article>
                    </figure>
                  </div>
                )

                // TODO
                case 'video':
                case 'sound':
                default:
                  return null
              }
            })
          }
        </GamepadRow>

        <section class='artwork-screen__testimonies'>
          {
            artwork.testimonies.map((testimony, index) => (
              <GamepadRow
                initial='start'
                scroll={{ block: 'center' }}
                ref={this.refMap('rows', 'testimonies', { multiple: true })}
              >
                <Testimony
                  index={index}
                  transcript={I18N.translate(testimony.content)}
                  translation={testimony.transcript}
                  timestamp={testimony.timestamp}
                  location={I18N.resolve(testimony.location)}
                />
              </GamepadRow>
            ))
          }
        </section>

        <GamepadRow
          class='artwork-screen__recorder'
          scroll={{ block: 'center' }}
          ref={this.refMap('rows', 'recorder')}
        >
          <Recorder ref={this.ref('recorder')} />
          <Eyes />
        </GamepadRow>
      </section>
    )
  }

  afterRender () {
    Gamepad.on('a', this.#handleGamepadA)
    Gamepad.on('b', this.#handleGamepadB)

    // Keep track of currently focused section
    this.$currentSection.fill($([
      this.refs.rows.get('content').$hasFocus,
      ...this.refs.rows.get('testimonies').map(row => row.$hasFocus),
      this.refs.rows.get('recorder').$hasFocus,
    ], (rows) => {
      if (rows[0]) return 'content'
      if (lastOf(rows)) return 'recorder'
      return 'testimonies'
    }))
  }

  afterMount () {
    // Set the number of columns based on how much the text overflows
    const overflowRatio = this.refs.prose.scrollHeight / this.refs.prose.clientHeight
    this.refs.article.classList.toggle('is-large', overflowRatio > 1)
    this.refs.article.style.setProperty('--cols', Math.ceil(overflowRatio + 0.5))

    // DEBUG
    // GamepadRow.$INDEX.value = GamepadRow.$ROWS.value.indexOf(this.refs.rows.get('recorder'))
  }

  #handleGamepadA = () => {
    // // TODO[next] enter a full-screen view of a specific panel (text, video, image, etc…)
    // const selection = this.refs.rows.find(row => row.$hasFocus.value)?.selection
    // if (!selection) return
    // console.log(selection.base ?? selection)
    // ;(selection.base ?? selection).classList.add('is-zoomed')
  }

  #handleGamepadB = () => {
    if (GamepadRow.$INDEX.value > 0) {
      // Scroll top
      GamepadRow.$INDEX.value = 0
    } else {
      // Go back to question screen if already on top
      this.props.screen.value = 'question'
    }
  }

  beforeDestroy () {
    Gamepad.off('a', this.#handleGamepadA)
    Gamepad.off('b', this.#handleGamepadB)
  }
}
