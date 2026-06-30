const isScrollableX = element => {
  const { overflowX } = getComputedStyle(element)
  return /(auto|scroll)/.test(overflowX) && element.scrollWidth > element.clientWidth
}

const isScrollableY = element => {
  const { overflowY } = getComputedStyle(element)
  return /(auto|scroll)/.test(overflowY) && element.scrollHeight > element.clientHeight
}

const getScrollContainer = (element, isScrollable) => {
  let parent = element.parentElement
  while (parent && parent !== document.body) {
    if (isScrollable(parent)) return parent
    parent = parent.parentElement
  }
  return document.scrollingElement
}

// Padding can live on the scroll container itself, or on a padded wrapper
// it scrolls (e.g. a flex row with `padding` as its own child) — sum both
const getPadding = (element, container, prop) => {
  const wrapperStyle = element.parentElement !== container
    ? getComputedStyle(element.parentElement)
    : null
  return (parseFloat(getComputedStyle(container)[prop]) || 0) + (parseFloat(wrapperStyle?.[prop]) || 0)
}

/**
 * Scroll the nearest scrollable ancestors by the minimum amount needed to
 * bring `element` into view, independently on each axis. `block`/`inline`
 * accept the native `scrollIntoView` values: `'nearest'` (default), `'start'`
 * and `'end'` align `element` against its scroll container's own padded
 * bounds; `'center'` instead centers `element` against the viewport. Pass
 * `ifNeeded: true` to skip scrolling when the element is already inside.
 */
export default (element, { behavior = 'smooth', block = 'nearest', inline = 'nearest', ifNeeded = false } = {}) => {
  const containerX = getScrollContainer(element, isScrollableX)
  const containerY = getScrollContainer(element, isScrollableY)
  if (!containerX && !containerY) return

  const elementRect = element.getBoundingClientRect()
  const viewportRect = { top: 0, right: window.innerWidth, bottom: window.innerHeight, left: 0 }

  let deltaX = 0
  if (containerX) {
    const containerRect = containerX.getBoundingClientRect()
    const visibleLeft = containerRect.left + getPadding(element, containerX, 'paddingLeft')
    const visibleRight = containerRect.right - getPadding(element, containerX, 'paddingRight')

    const needsScroll = !ifNeeded || inline === 'center' ||
      elementRect.left < visibleLeft || elementRect.right > visibleRight

    if (needsScroll) {
      deltaX = getAxisDelta(inline, elementRect.left, elementRect.right, visibleLeft, visibleRight, viewportRect.left, viewportRect.right)
    }
  }

  let deltaY = 0
  if (containerY) {
    const containerRect = containerY.getBoundingClientRect()
    const visibleTop = containerRect.top + getPadding(element, containerY, 'paddingTop')
    const visibleBottom = containerRect.bottom - getPadding(element, containerY, 'paddingBottom')

    const needsScroll = !ifNeeded || block === 'center' ||
      elementRect.top < visibleTop || elementRect.bottom > visibleBottom

    if (needsScroll) {
      deltaY = getAxisDelta(block, elementRect.top, elementRect.bottom, visibleTop, visibleBottom, viewportRect.top, viewportRect.bottom)
    }
  }

  if (deltaX && containerX) containerX.scrollBy({ left: deltaX, behavior })
  if (deltaY && containerY) containerY.scrollBy({ top: deltaY, behavior })
}

const getAxisDelta = (mode, elementStart, elementEnd, visibleStart, visibleEnd, viewportStart, viewportEnd) => {
  switch (mode) {
    case 'start':
      return elementStart - visibleStart
    case 'end':
      return elementEnd - visibleEnd
    case 'center':
      return (elementStart + elementEnd) / 2 - (viewportStart + viewportEnd) / 2
    case 'nearest':
    default:
      if (elementStart < visibleStart) return elementStart - visibleStart
      if (elementEnd > visibleEnd) return Math.min(elementEnd - visibleEnd, elementStart - visibleStart)
      return 0
  }
}
