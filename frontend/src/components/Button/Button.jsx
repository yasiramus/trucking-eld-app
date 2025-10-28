
export default function Button({
    type = "button",
    onClick,
    className = "",
    children,
    loading = false,
}) {
    return (
        <button
            type={type}
            onClick={onClick}
            className={className}
            disabled={loading}
            aria-busy={loading}
        >
            {loading ? "Calculating..." : children}
        </button>
    );
}