function Loader({ message = "Loading..." }) {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 20px",
      color: "var(--text-muted, #94a3b8)"
    }}>
      <div style={{
        width: "38px",
        height: "38px",
        border: "3px solid rgba(219, 39, 119, 0.2)",
        borderTopColor: "#db2777",
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
        marginBottom: "12px"
      }}></div>
      <span>{message}</span>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default Loader;
