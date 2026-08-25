import { useTranslation } from 'react-i18next'
import { RepoIcon, VisibilityTag } from '@/components/atoms'
import { formatRelativeTime } from '@/lib/formatRelativeTime'
import styles from './RepoListItem.module.css'

interface RepoListItemProps {
  name: string
  isPrivate: boolean
  isSelected: boolean
  updatedAt: string
  onSelect: () => void
}

// One repository row inside RepoSelector. A real <button>, not a div+onClick, so it is
// reachable and activatable via keyboard (Tab + Enter/Space), not just mouse click.
export function RepoListItem({ name, isPrivate, isSelected, updatedAt, onSelect }: RepoListItemProps) {
  const { i18n } = useTranslation()

  return (
    <button
      type="button"
      className={isSelected ? styles.itemSelected : styles.item}
      aria-pressed={isSelected}
      onClick={onSelect}
    >
      <span className={styles.row}>
        <RepoIcon size={20} />
        <span className={styles.name}>{name}</span>
        <VisibilityTag isPrivate={isPrivate} />
      </span>
      <span className={styles.updated}>{formatRelativeTime(updatedAt, i18n.language)}</span>
    </button>
  )
}
