interface LogoutButtonProps {
  onClick: () => void;
  isLoading?: boolean;
}

export function LogoutButton({ onClick, isLoading = false }: LogoutButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className="bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-2 rounded-lg font-semibold transition"
    >
      {isLoading ? 'Desconectando...' : 'Logout'}
    </button>
  );
}
