/**
 * Check if an element is visually inside a container (defaults to viewport).
 * `container` can be an element or a plain rect ({ top, right, bottom, left })
 */
export default (element, container = null) => {
  const elementRect = element.getBoundingClientRect()
  const containerRect = container
    ? (container.getBoundingClientRect?.() ?? container)
    : { top: 0, left: 0, right: window.innerWidth, bottom: window.innerHeight }

  return (
    elementRect.top >= containerRect.top &&
    elementRect.left >= containerRect.left &&
    elementRect.right <= containerRect.right &&
    elementRect.bottom <= containerRect.bottom
  )
}
