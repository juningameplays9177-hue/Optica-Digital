/**
 * Renderizado no SERVIDOR (sem "use client") — aparece no HTML mesmo se o bundle React nao rodar.
 * Formularios GET funcionam sem JavaScript: recarregam a pagina com ?camera=environment ou user.
 */
export default function ServerCameraPicker() {
  return (
    <>
      <div
        style={{
          maxWidth: 576,
          margin: "0 auto",
          padding: "16px 16px 12px",
          borderBottom: "4px solid #22d3ee",
          backgroundColor: "#020617"
        }}
      >
        <p
          style={{
            margin: "0 0 12px 0",
            textAlign: "center",
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#a5f3fc"
          }}
        >
          Camera do celular
        </p>
        <form method="get" action="/" style={{ marginBottom: 10 }}>
          <button
            type="submit"
            name="camera"
            value="environment"
            style={{
              width: "100%",
              minHeight: 56,
              borderRadius: 14,
              border: "3px solid #0891b2",
              backgroundColor: "#06b6d4",
              color: "#020617",
              fontSize: 18,
              fontWeight: 900,
              cursor: "pointer"
            }}
          >
            USAR CAMERA DE TRAS
          </button>
        </form>
        <form method="get" action="/">
          <button
            type="submit"
            name="camera"
            value="user"
            style={{
              width: "100%",
              minHeight: 48,
              borderRadius: 12,
              border: "2px solid #64748b",
              backgroundColor: "#1e293b",
              color: "#f8fafc",
              fontSize: 16,
              fontWeight: 700,
              cursor: "pointer"
            }}
          >
            USAR CAMERA FRONTAL
          </button>
        </form>
      </div>

      <div
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 2147483647,
          display: "flex",
          flexDirection: "column",
          gap: 8,
          padding: 12,
          paddingBottom: "max(12px, env(safe-area-inset-bottom, 12px))",
          backgroundColor: "rgba(2, 6, 23, 0.96)",
          borderTop: "4px solid #22d3ee",
          boxShadow: "0 -12px 36px rgba(0, 0, 0, 0.65)"
        }}
      >
        <form method="get" action="/">
          <button
            type="submit"
            name="camera"
            value="environment"
            style={{
              width: "100%",
              minHeight: 56,
              borderRadius: 14,
              border: "3px solid #0891b2",
              backgroundColor: "#06b6d4",
              color: "#020617",
              fontSize: 18,
              fontWeight: 900,
              cursor: "pointer"
            }}
          >
            CAMERA TRASEIRA
          </button>
        </form>
        <form method="get" action="/">
          <button
            type="submit"
            name="camera"
            value="user"
            style={{
              width: "100%",
              minHeight: 46,
              borderRadius: 12,
              border: "2px solid #64748b",
              backgroundColor: "#1e293b",
              color: "#f8fafc",
              fontSize: 15,
              fontWeight: 700,
              cursor: "pointer"
            }}
          >
            CAMERA FRONTAL
          </button>
        </form>
      </div>
    </>
  );
}
