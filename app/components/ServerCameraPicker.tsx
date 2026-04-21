/**
 * Renderizado no SERVIDOR (sem "use client") — aparece no HTML mesmo se o bundle React nao rodar.
 * Formularios GET funcionam sem JavaScript: recarregam a pagina com ?camera=environment ou user.
 */
export default function ServerCameraPicker() {
  return (
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
        Camera do exame
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
          Camera frontal (selfie)
        </button>
      </form>
      <p style={{ margin: "12px 0 0 0", textAlign: "center", fontSize: 11, color: "#64748b" }}>
        Se os botoes do app nao aparecerem, use estes — funcionam sem JavaScript.
      </p>
    </div>
  );
}
