interface Props {
  isRegistered: boolean;
  isFull: boolean;
  onRegister: () => void;
  onCancel: () => void;
}

export function RegistrationButton({ isRegistered, isFull, onRegister, onCancel }: Props) {
  if (isRegistered) {
    return (
      <button
        onClick={onCancel}
        className="px-4 py-2 text-sm rounded bg-red-100 text-red-700 hover:bg-red-200 border border-red-300"
      >
        Cancel Registration
      </button>
    );
  }
  if (isFull) {
    return (
      <button disabled className="px-4 py-2 text-sm rounded bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed">
        Event Full
      </button>
    );
  }
  return (
    <button
      onClick={onRegister}
      className="px-4 py-2 text-sm rounded bg-blue-600 text-white hover:bg-blue-700"
    >
      Register
    </button>
  );
}
