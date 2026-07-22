import './Moderation.scss'

import { Component } from '@tooooools/ui'
import { Button, Toast, Toggles } from '@tooooools/ui/components'
import { $ } from '@tooooools/ui/state'

import * as Icons from '/data/icons'
import API from '/controllers/API'

// No I18N here: runs on a moderator's phone, not the kiosk session.
const resolve = content => (typeof content === 'object' ? content?.en ?? content?.fr ?? content?.nl : content)
const formatDate = timestamp => new Intl.DateTimeFormat('en', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(timestamp))

const STATUSES = [
  { value: 'all', label: 'All', icon: Icons.list },
  { value: 'pending', label: 'Pending', icon: Icons.hourglass },
  { value: 'validated', label: 'Validated', icon: Icons.check },
  { value: 'censored', label: 'Censored', icon: Icons.prohibition }
]

export default class Moderation extends Component {
  $testimonies = $([])
  $filter = $('pending')
  $loading = $(true)

  static async load () {}

  template () {
    return (
      <section class='moderation'>
        <header class='moderation__header'>
          <h1>TRACES&thinsp;/&thinsp;moderation</h1>
          <Toggles value={this.$filter} options={STATUSES} />
        </header>

        <div ref={this.ref('content')} />
      </section>
    )
  }

  afterRender () {
    this.watch([this.$loading, this.$filter, this.$testimonies], this.#update, { immediate: true })
  }

  afterMount () {
    this.#load()
  }

  // template() only runs once; reactive updates go through here (see Toggles).
  #update = () => {
    this.#clear()
    this.render(
      this.$loading.value
        ? <p class='moderation__loading'>Loading…</p>
        : (
          <ul class='moderation__list'>
            {this.#filtered().map(testimony => this.#renderItem(testimony))}
          </ul>
          ),
      this.refs.content
    )
  }

  #clear = () => {
    this.refs.items?.forEach(item => item?.destroy?.())
    delete this.refs.items
    while (this.refs.content.firstChild) this.refs.content.removeChild(this.refs.content.firstChild)
  }

  #load = async () => {
    this.$loading.value = true
    try {
      this.$testimonies.value = await API.fetchAllTestimonies()
    } catch (error) {
      Toast.display(String(error), { tone: 'error', duration: 10_000 })
    } finally {
      this.$loading.value = false
    }
  }

  #filtered = () => (
    this.$filter.value === 'all'
      ? this.$testimonies.value
      : this.$testimonies.value.filter(testimony => testimony.status === this.$filter.value)
  )

  #renderItem = testimony => (
    <li class='moderation__item' data-status={testimony.status}>
      <Button
        ref={this.refArray('items')}
        class='moderation__action'
        icon={Icons.prohibition}
        title='Censor'
        data-color='red'
        disabled={testimony.status === 'censored'}
        event-click={() => this.#moderate(testimony, 'censored')}
      />

      <div class='moderation__body'>
        <div class='moderation__metas'>
          <span>{formatDate(testimony.created_at)}</span>
          {testimony.city && <span>{testimony.city}</span>}
          <span>Artwork #{testimony.artwork_id}</span>
        </div>

        <p class='moderation__content'>{resolve(testimony.content)}</p>
      </div>

      <Button
        ref={this.refArray('items')}
        class='moderation__action'
        icon={Icons.check}
        title='Validate'
        data-color='green'
        disabled={testimony.status === 'validated'}
        event-click={() => this.#moderate(testimony, 'validated')}
      />
    </li>
  )

  #moderate = async (testimony, status) => {
    try {
      const [updated] = await API.moderateTestimony(testimony.id, status)
      // Needs a fresh array — signals only dispatch on reassignment.
      this.$testimonies.value = this.$testimonies.value.map(t => (t.id === testimony.id ? updated : t))
    } catch (error) {
      Toast.display(String(error), { tone: 'error', duration: 10_000 })
    }
  }
}
