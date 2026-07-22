import './Testimonies.scss'

import { Component, Props } from '@tooooools/ui'
import { Button } from '@tooooools/ui/components'
import { $, slot } from '@tooooools/ui/state'

import GamepadRow from '/components/GamepadRow'
import Testimony from '/components/Testimony'
import Config from '/controllers/Config'
import I18N from '/controllers/I18N'

export default class Testimonies extends Component {
  static props = {
    testimonies: Props.required(Props.array),
    page: [Props.number, Props.Signal]
  }

  $page = $(this.props.page ?? 0)
  $pageCount = $(this.$page, () => Config.TESTIMONIES.pageSize
    ? Math.ceil(this.props.testimonies.length / Config.TESTIMONIES.pageSize)
    : 1
  )

  $hasFocus = slot()

  hasRow = row => (this.refs.nav ? [...this.refs.rows, this.refs.nav] : this.refs.rows).includes(row)

  template ({ testimonies }) {
    const paginated = Config.TESTIMONIES.pageSize < testimonies.length

    const isOnPage = (index, page) => {
      const start = page * Config.TESTIMONIES.pageSize
      return index >= start && index < start + Config.TESTIMONIES.pageSize
    }

    const isFirstOfPage = index => index === 0 || (Config.TESTIMONIES.pageSize && index % Config.TESTIMONIES.pageSize === 0)

    return (
      <section class={['testimonies', { 'has-focus': this.$hasFocus }]}>
        <h1 innerText={I18N('artwork.' + (testimonies.length === 1 ? 'testimony' : 'testimonies'), { count: testimonies.length })} />

        <div class='testimonies__page'>
          {
            testimonies.map((testimony, index) => (
              <GamepadRow
                initial='start'
                scroll={
                  isFirstOfPage(index)
                    ? { block: 'center' }
                    : { block: 'end', ifNeeded: true }
                }
                ignore={paginated ? $(this.$page, page => !isOnPage(index, page)) : false}
                ref={this.refArray('rows')}
                style={{
                  '--animation-fade-in-stagger': `${(index % Config.TESTIMONIES.pageSize) * 50}ms`
                }}
              >
                <Testimony
                  index={index}
                  {...testimony}
                />
              </GamepadRow>
            ))
          }
        </div>

        {paginated && (
          <GamepadRow
            class='testimonies__nav'
            initial='end'
            scroll={{ block: 'end', ifNeeded: true }}
            ref={this.ref('nav')}
          >
            <Button
              label={I18N('artwork.testimonies.prev', { count: Config.TESTIMONIES.pageSize })}
              disabled={$(this.$page, page => page === 0)}
              event-click={this.#handlePrev}
            />

            <div class='page-count' data-gamepad-ignore>
              <span innerText={$(this.$page, p => p + 1)} />
              <span innerText={this.$pageCount} />
            </div>

            <Button
              label={I18N('artwork.testimonies.next', { count: Config.TESTIMONIES.pageSize })}
              disabled={$([this.$page, this.$pageCount], ([page, pageCount]) => page === pageCount - 1)}
              event-click={this.#handleNext}
            />
          </GamepadRow>
        )}
      </section>
    )
  }

  afterRender () {
    this.watch(GamepadRow.$INDEX, index => {
      this.$hasFocus.value = this.hasRow(GamepadRow.$ROWS.value[index])
    }, { immediate: true })
  }

  // Focus the current page's first row, since paging can leave $INDEX pointing at a
  // row that just became ignored (its own $hasFocus turns false, but nothing else
  // automatically claims focus in its place).
  #focusCurrentPage = () => {
    const start = this.$page.value * Config.TESTIMONIES.pageSize
    const row = this.refs.rows[start] ?? this.refs.nav
    if (row) GamepadRow.$INDEX.value = GamepadRow.$ROWS.value.indexOf(row)
  }

  #handlePrev = () => {
    this.$page.value = Math.max(0, this.$page.value - 1)
    // this.#focusCurrentPage()
  }

  #handleNext = () => {
    this.$page.value = Math.min(this.$page.value + 1, this.$pageCount.value - 1)
    // this.#focusCurrentPage()
  }
}
