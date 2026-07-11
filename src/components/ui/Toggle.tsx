interface ToggleProps {
  checked:   boolean;
  onChange:  (v: boolean) => void;
  label?:    string;
  description?: string;
  disabled?: boolean;
}

export function Toggle({ checked, onChange, disabled = false }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={[
        'toggle-track flex-shrink-0',
        checked ? 'toggle-track-on' : 'toggle-track-off',
        disabled ? 'opacity-50 cursor-not-allowed' : '',
      ].join(' ')}
    >
      <span
        aria-hidden="true"
        className={['toggle-thumb', checked ? 'toggle-thumb-on' : 'toggle-thumb-off'].join(' ')}
      />
    </button>
  );
}
