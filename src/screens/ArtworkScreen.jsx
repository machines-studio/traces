import './ArtworkScreen.scss'

import { Component, Props } from '@tooooools/ui'
import { $, isSignal } from '@tooooools/ui/state'

import { COLORS } from '/app.config'
import I18N from '/data/I18N'
import Caption from '/components/Caption'
import GamepadRow from '/components/GamepadRow'
import Testimony from '/components/Testimony'
import Gamepad from '/controllers/Gamepad'
import widont from '/utils/string-widont'

export default class ArtworkScreen extends Component {
  static props = {
    artwork: Props.required(Props.object),
    language: Props.required(Props.Signal),
    screen: Props.required(Props.Signal),
    question: Props.required(Props.Signal)
  }

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
        { timestamp: Date.now(), location: 'Abby Kortrijk', content: { en: 'Magna nisi arcu euismod pretium habitasse fames cubilia malesuada eget maecenas elementum volutpat ut vestibulum, enim pellentesque nunc eros potenti semper aliquet dolor montes cursus accumsan varius quisque. Dis mattis suspendisse natoque penatibus litora primis purus nam eleifend vivamus sagittis ante nec sem volutpat, felis dignissim taciti iaculis egestas maximus habitant eros conubia inceptos odio vel bibendum habitasse. Mauris sollicitudin sed libero quis a est sapien id vestibulum dictumst luctus, aliquam massa maecenas viverra fringilla purus semper fusce in.' } },
        { timestamp: Date.now(), location: 'Abby Kortrijk', content: { en: 'Magna nisi arcu euismod pretium habitasse fames cubilia malesuada eget maecenas elementum volutpat ut vestibulum, enim pellentesque nunc eros potenti semper aliquet dolor montes cursus accumsan varius quisque. Dis mattis suspendisse natoque penatibus litora primis purus nam eleifend vivamus sagittis ante nec sem volutpat, felis dignissim taciti iaculis egestas maximus habitant eros conubia inceptos odio vel bibendum habitasse. Mauris sollicitudin sed libero quis a est sapien id vestibulum dictumst luctus, aliquam massa maecenas viverra fringilla purus semper fusce in.' } },
        { timestamp: Date.now(), location: 'Abby Kortrijk', content: { en: 'Magna nisi arcu euismod pretium habitasse fames cubilia malesuada eget maecenas elementum volutpat ut vestibulum, enim pellentesque nunc eros potenti semper aliquet dolor montes cursus accumsan varius quisque. Dis mattis suspendisse natoque penatibus litora primis purus nam eleifend vivamus sagittis ante nec sem volutpat, felis dignissim taciti iaculis egestas maximus habitant eros conubia inceptos odio vel bibendum habitasse. Mauris sollicitudin sed libero quis a est sapien id vestibulum dictumst luctus, aliquam massa maecenas viverra fringilla purus semper fusce in.' } },
        { timestamp: Date.now(), location: 'Abby Kortrijk', content: { en: 'Magna nisi arcu euismod pretium habitasse fames cubilia malesuada eget maecenas elementum volutpat ut vestibulum, enim pellentesque nunc eros potenti semper aliquet dolor montes cursus accumsan varius quisque. Dis mattis suspendisse natoque penatibus litora primis purus nam eleifend vivamus sagittis ante nec sem volutpat, felis dignissim taciti iaculis egestas maximus habitant eros conubia inceptos odio vel bibendum habitasse. Mauris sollicitudin sed libero quis a est sapien id vestibulum dictumst luctus, aliquam massa maecenas viverra fringilla purus semper fusce in.' } },
        { timestamp: Date.now(), location: 'Abby Kortrijk', content: { en: 'Magna nisi arcu euismod pretium habitasse fames cubilia malesuada eget maecenas elementum volutpat ut vestibulum, enim pellentesque nunc eros potenti semper aliquet dolor montes cursus accumsan varius quisque. Dis mattis suspendisse natoque penatibus litora primis purus nam eleifend vivamus sagittis ante nec sem volutpat, felis dignissim taciti iaculis egestas maximus habitant eros conubia inceptos odio vel bibendum habitasse. Mauris sollicitudin sed libero quis a est sapien id vestibulum dictumst luctus, aliquam massa maecenas viverra fringilla purus semper fusce in.' } },
        { timestamp: Date.now(), location: 'Abby Kortrijk', content: { en: 'Magna nisi arcu euismod pretium habitasse fames cubilia malesuada eget maecenas elementum volutpat ut vestibulum, enim pellentesque nunc eros potenti semper aliquet dolor montes cursus accumsan varius quisque. Dis mattis suspendisse natoque penatibus litora primis purus nam eleifend vivamus sagittis ante nec sem volutpat, felis dignissim taciti iaculis egestas maximus habitant eros conubia inceptos odio vel bibendum habitasse. Mauris sollicitudin sed libero quis a est sapien id vestibulum dictumst luctus, aliquam massa maecenas viverra fringilla purus semper fusce in.' } },
        { timestamp: Date.now(), location: 'Abby Kortrijk', content: { en: 'Magna nisi arcu euismod pretium habitasse fames cubilia malesuada eget maecenas elementum volutpat ut vestibulum, enim pellentesque nunc eros potenti semper aliquet dolor montes cursus accumsan varius quisque. Dis mattis suspendisse natoque penatibus litora primis purus nam eleifend vivamus sagittis ante nec sem volutpat, felis dignissim taciti iaculis egestas maximus habitant eros conubia inceptos odio vel bibendum habitasse. Mauris sollicitudin sed libero quis a est sapien id vestibulum dictumst luctus, aliquam massa maecenas viverra fringilla purus semper fusce in.' } },
        { timestamp: Date.now(), location: 'Abby Kortrijk', content: { en: 'Magna nisi arcu euismod pretium habitasse fames cubilia malesuada eget maecenas elementum volutpat ut vestibulum, enim pellentesque nunc eros potenti semper aliquet dolor montes cursus accumsan varius quisque. Dis mattis suspendisse natoque penatibus litora primis purus nam eleifend vivamus sagittis ante nec sem volutpat, felis dignissim taciti iaculis egestas maximus habitant eros conubia inceptos odio vel bibendum habitasse. Mauris sollicitudin sed libero quis a est sapien id vestibulum dictumst luctus, aliquam massa maecenas viverra fringilla purus semper fusce in.' } },
        { timestamp: Date.now(), location: 'Abby Kortrijk', content: { en: 'Magna nisi arcu euismod pretium habitasse fames cubilia malesuada eget maecenas elementum volutpat ut vestibulum, enim pellentesque nunc eros potenti semper aliquet dolor montes cursus accumsan varius quisque. Dis mattis suspendisse natoque penatibus litora primis purus nam eleifend vivamus sagittis ante nec sem volutpat, felis dignissim taciti iaculis egestas maximus habitant eros conubia inceptos odio vel bibendum habitasse. Mauris sollicitudin sed libero quis a est sapien id vestibulum dictumst luctus, aliquam massa maecenas viverra fringilla purus semper fusce in.' } },
        { timestamp: Date.now(), location: 'Abby Kortrijk', content: { en: 'Magna nisi arcu euismod pretium habitasse fames cubilia malesuada eget maecenas elementum volutpat ut vestibulum, enim pellentesque nunc eros potenti semper aliquet dolor montes cursus accumsan varius quisque. Dis mattis suspendisse natoque penatibus litora primis purus nam eleifend vivamus sagittis ante nec sem volutpat, felis dignissim taciti iaculis egestas maximus habitant eros conubia inceptos odio vel bibendum habitasse. Mauris sollicitudin sed libero quis a est sapien id vestibulum dictumst luctus, aliquam massa maecenas viverra fringilla purus semper fusce in.' } },
        { timestamp: Date.now(), location: 'Abby Kortrijk', content: { en: 'Magna nisi arcu euismod pretium habitasse fames cubilia malesuada eget maecenas elementum volutpat ut vestibulum, enim pellentesque nunc eros potenti semper aliquet dolor montes cursus accumsan varius quisque. Dis mattis suspendisse natoque penatibus litora primis purus nam eleifend vivamus sagittis ante nec sem volutpat, felis dignissim taciti iaculis egestas maximus habitant eros conubia inceptos odio vel bibendum habitasse. Mauris sollicitudin sed libero quis a est sapien id vestibulum dictumst luctus, aliquam massa maecenas viverra fringilla purus semper fusce in.' } },
        { timestamp: Date.now(), location: 'Abby Kortrijk', content: { en: 'Magna nisi arcu euismod pretium habitasse fames cubilia malesuada eget maecenas elementum volutpat ut vestibulum, enim pellentesque nunc eros potenti semper aliquet dolor montes cursus accumsan varius quisque. Dis mattis suspendisse natoque penatibus litora primis purus nam eleifend vivamus sagittis ante nec sem volutpat, felis dignissim taciti iaculis egestas maximus habitant eros conubia inceptos odio vel bibendum habitasse. Mauris sollicitudin sed libero quis a est sapien id vestibulum dictumst luctus, aliquam massa maecenas viverra fringilla purus semper fusce in.' } },
        { timestamp: Date.now(), location: 'Abby Kortrijk', content: { en: 'Magna nisi arcu euismod pretium habitasse fames cubilia malesuada eget maecenas elementum volutpat ut vestibulum, enim pellentesque nunc eros potenti semper aliquet dolor montes cursus accumsan varius quisque. Dis mattis suspendisse natoque penatibus litora primis purus nam eleifend vivamus sagittis ante nec sem volutpat, felis dignissim taciti iaculis egestas maximus habitant eros conubia inceptos odio vel bibendum habitasse. Mauris sollicitudin sed libero quis a est sapien id vestibulum dictumst luctus, aliquam massa maecenas viverra fringilla purus semper fusce in.' } },
        { timestamp: Date.now(), location: 'Abby Kortrijk', content: { en: 'Magna nisi arcu euismod pretium habitasse fames cubilia malesuada eget maecenas elementum volutpat ut vestibulum, enim pellentesque nunc eros potenti semper aliquet dolor montes cursus accumsan varius quisque. Dis mattis suspendisse natoque penatibus litora primis purus nam eleifend vivamus sagittis ante nec sem volutpat, felis dignissim taciti iaculis egestas maximus habitant eros conubia inceptos odio vel bibendum habitasse. Mauris sollicitudin sed libero quis a est sapien id vestibulum dictumst luctus, aliquam massa maecenas viverra fringilla purus semper fusce in.' } },
        { timestamp: Date.now(), location: 'Abby Kortrijk', content: { en: 'Magna nisi arcu euismod pretium habitasse fames cubilia malesuada eget maecenas elementum volutpat ut vestibulum, enim pellentesque nunc eros potenti semper aliquet dolor montes cursus accumsan varius quisque. Dis mattis suspendisse natoque penatibus litora primis purus nam eleifend vivamus sagittis ante nec sem volutpat, felis dignissim taciti iaculis egestas maximus habitant eros conubia inceptos odio vel bibendum habitasse. Mauris sollicitudin sed libero quis a est sapien id vestibulum dictumst luctus, aliquam massa maecenas viverra fringilla purus semper fusce in.' } },
        { timestamp: Date.now(), location: 'Abby Kortrijk', content: { en: 'Magna nisi arcu euismod pretium habitasse fames cubilia malesuada eget maecenas elementum volutpat ut vestibulum, enim pellentesque nunc eros potenti semper aliquet dolor montes cursus accumsan varius quisque. Dis mattis suspendisse natoque penatibus litora primis purus nam eleifend vivamus sagittis ante nec sem volutpat, felis dignissim taciti iaculis egestas maximus habitant eros conubia inceptos odio vel bibendum habitasse. Mauris sollicitudin sed libero quis a est sapien id vestibulum dictumst luctus, aliquam massa maecenas viverra fringilla purus semper fusce in.' } },
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

    const text = I18N.translate(artwork.text)

    return (
      <section
        class='artwork-screen screen'
        data-color={COLORS.vectors[artwork.vector]}
      >
        <header class='artwork-screen__header'>
          {/* TODO constellation */}

          <Caption
            position='top'
            text={$(question, question => widont(I18N.translate(question)))}
          />
        </header>

        <GamepadRow
          initial='start'
          scroll={{ inline: 'nearest', block: 'center', ifNeeded: true }}
          class='artwork-screen__content'
        >
          <article ref={this.ref('article')}>
            <header>
              <h1>{I18N.translate(artwork.title)}</h1>
              <ul class='metas'>
                <li>{I18N.translate(artwork.date)}</li>
              </ul>
            </header>

            <section ref={this.ref('prose')} class='prose' innerHTML={text} />

            <footer>
              {artwork.tags.map(tag => (<span innerText={I18N.translate(tag)} />))}
            </footer>
          </article>

          {
            artwork.medias.map(({ type, src, caption, content }) => {
              switch (type) {
                case 'image': return src && (
                  <figure>
                    <img src={src} />
                    <figcaption innerText={I18N.translate(caption)} />
                  </figure>
                )

                case 'text': return I18N.translate(content) && (
                  <figure>
                    <article>{I18N.translate(content)}</article>
                  </figure>
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
            artwork.testimonies.map(testimony => (
              <GamepadRow
                initial='start'
                scroll={{ block: 'center' }}
              >
                <Testimony
                  transcript={I18N.translate(testimony.content)}
                  timestamp={testimony.timestamp}
                  location={I18N.translate(testimony.location)}
                />
              </GamepadRow>
            ))
          }
        </section>
      </section>
    )
  }

  afterMount () {
    // Set the number of columns based on how much the text overflows
    const overflowRatio = this.refs.prose.scrollHeight / this.refs.prose.clientHeight
    this.refs.article.classList.toggle('is-large', overflowRatio > 1)
    this.refs.article.style.setProperty('--cols', Math.ceil(overflowRatio + 0.5))

    Gamepad.on('b', this.#handleGamepadB)
  }

  // Scroll top
  #handleGamepadB = () => { GamepadRow.$INDEX.value = 0 }
}
