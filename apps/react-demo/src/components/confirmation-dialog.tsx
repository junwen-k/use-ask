export interface ConfirmationDialogProps extends Omit<React.ComponentProps<'dialog'>, 'onClose'> {
  title: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  error?: Error | null;
}

export function ConfirmationDialog({
  title,
  onConfirm,
  onCancel,
  loading,
  error,
  ...props
}: ConfirmationDialogProps) {
  return (
    <dialog onCancel={onCancel} onClose={onCancel} {...props}>
      <p>{title}</p>
      <button onClick={onConfirm} disabled={loading}>
        {loading ? 'Loading...' : 'OK'}
      </button>
      <button onClick={onCancel} disabled={loading}>
        Cancel
      </button>
      {error && <p>{error.message}</p>}
    </dialog>
  );
}
