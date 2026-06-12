import type { DocStatus, DocType } from '../../types';
import { STATUS_CLASS, STATUS_LABEL, TYPE_CLASS, TYPE_LABEL } from '../../utils/helpers';

export function StatusBadge({ status }: { status: DocStatus }) {
  return <span className={STATUS_CLASS[status]}>{STATUS_LABEL[status]}</span>;
}

export function TypeBadge({ type }: { type: DocType }) {
  return <span className={TYPE_CLASS[type]}>{TYPE_LABEL[type]}</span>;
}
