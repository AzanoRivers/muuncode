const ELLIPSIS = '...'

// Plain end-truncation for labels with no meaningful suffix to preserve (repo names).
export function truncateIdeLabel(label: string, maxLength: number): string {
  if (label.length <= maxLength) return label
  return `${label.slice(0, Math.max(maxLength - ELLIPSIS.length, 0))}${ELLIPSIS}`
}

// Truncates the stem but always keeps the extension visible after the ellipsis
// (e.g. "very-long-component-na....tsx"), so the file type stays readable in the
// title pill no matter how long the name is. Falls back to plain truncation when
// there is no extension to preserve.
export function truncateIdeFileName(fileName: string, maxLength: number): string {
  if (fileName.length <= maxLength) return fileName

  const lastDotIndex = fileName.lastIndexOf('.')
  if (lastDotIndex <= 0) return truncateIdeLabel(fileName, maxLength)

  const extension = fileName.slice(lastDotIndex)
  const stemLength = Math.max(maxLength - ELLIPSIS.length - extension.length, 1)
  return `${fileName.slice(0, stemLength)}${ELLIPSIS}${extension}`
}
