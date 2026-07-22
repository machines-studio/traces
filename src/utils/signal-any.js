import { $ } from '@tooooools/ui/state'

export default (...signals) => $(signals, signals => signals.find(Boolean))
