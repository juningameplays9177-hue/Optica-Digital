/**
 * Estilos injetados no <head> do layout — nao passam por /_next/static.
 * Garante fundo escuro, aviso e botoes de camera visiveis quando CSS do bundle falha (404).
 */
export const CRITICAL_PUPILO_CSS = `
  html, body { background: #09090b !important; color: #e2e8f0 !important; min-height: 100% !important; margin: 0 !important; }
  .pupilo-notice { margin:0; padding:10px 14px; background:#0c4a6e; color:#ecfeff; font-size:13px; line-height:1.4; border-bottom:1px solid #22d3ee; }
  .pupilo-picker-top { max-width:576px; margin:0 auto; padding:16px 16px 12px; border-bottom:4px solid #22d3ee; background:#020617; }
  .pupilo-picker-top-title { text-align:center; font-size:12px; font-weight:800; letter-spacing:0.08em; text-transform:uppercase; color:#a5f3fc; margin:0 0 12px 0; }
  .pupilo-bar-fixed { position:fixed; left:0; right:0; bottom:0; z-index:2147483647; display:flex; flex-direction:column; gap:8px; padding:12px; padding-bottom:max(12px, env(safe-area-inset-bottom, 12px)); background:rgba(2,6,23,0.96); border-top:4px solid #22d3ee; box-shadow:0 -12px 36px rgba(0,0,0,0.65); }
  .pupilo-mb-10 { margin-bottom: 10px; }
`;
