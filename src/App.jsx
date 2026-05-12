import { useState, useRef, useEffect } from "react";

// ─── TOKENS ────────────────────────────────────────────────────────────────────
const FONT_DISPLAY = "'Optima', 'Optima Nova', 'Palatino', serif";
const FONT_BODY    = "'Manrope', system-ui, -apple-system, sans-serif";
const C = {
  bg:     "#0B0D1A",
  indigo: "#1A1F38",
  peach:  "#FBBEB4",
  gold:   "#D4A574",
  border: "rgba(212,165,116,0.25)",
};

// ─── GLOBAL CSS ────────────────────────────────────────────────────────────────
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { margin: 0; background: #0B0D1A; cursor: none; }
  * { cursor: none !important; }
  a { text-decoration: none; }

  .cursor-ring {
    position: fixed; pointer-events: none; z-index: 9999;
    width: 34px; height: 34px; border: 1px solid #D4A574;
    border-radius: 50%; transform: translate(-50%,-50%);
    mix-blend-mode: difference; transition: width .15s, height .15s;
  }
  .cursor-dot {
    position: fixed; pointer-events: none; z-index: 9999;
    width: 4px; height: 4px; background: #FBBEB4;
    border-radius: 50%; transform: translate(-50%,-50%);
  }

  /* ─ Scanline glitch ─ */
  @keyframes scanline {
    0%   { transform: translateY(-100%); }
    100% { transform: translateY(200%); }
  }
  @keyframes glitch-1 {
    0%,100% { clip-path:inset(0 0 95% 0);  transform:translateX(0); }
    25%     { clip-path:inset(10% 0 80% 0); transform:translateX(-5px); }
    50%     { clip-path:inset(40% 0 50% 0); transform:translateX(4px); }
    75%     { clip-path:inset(70% 0 20% 0); transform:translateX(-3px); }
  }
  @keyframes glitch-2 {
    0%,100% { clip-path:inset(80% 0 5% 0);  transform:translateX(0); }
    20%     { clip-path:inset(60% 0 30% 0); transform:translateX(5px); }
    60%     { clip-path:inset(20% 0 65% 0); transform:translateX(-4px); }
  }
  @keyframes fadeUp   { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeIn   { from{opacity:0} to{opacity:1} }
  @keyframes arrowBounce { 0%,100%{transform:translateX(0)} 50%{transform:translateX(5px)} }
  @keyframes pulse    { 0%,100%{opacity:1} 50%{opacity:.3} }
  @keyframes barGrow  { from{width:0} to{width:var(--w)} }

  /* ─ Mosaïque ─ */
  .mosaic-cell { position:relative; overflow:hidden; cursor:pointer; border-radius:8px; }
  .cell-image  {
    position:absolute; inset:0; background-size:cover; background-position:center;
    transition: transform .6s cubic-bezier(.4,0,.2,1), filter .4s ease;
    filter: brightness(.55) saturate(.8);
  }
  .mosaic-cell:hover .cell-image { transform:scale(1.06); filter:brightness(.22) saturate(.35); }
  .mosaic-scanline {
    position:absolute; inset:0; z-index:2; pointer-events:none; overflow:hidden; opacity:0;
    transition: opacity .2s;
  }
  .mosaic-scanline::after {
    content:''; position:absolute; left:0; right:0; height:35%;
    background: linear-gradient(transparent,rgba(251,190,180,.07),transparent);
    animation: scanline 1.6s linear infinite;
  }
  .mosaic-cell:hover .mosaic-scanline { opacity:1; }
  .glitch-layer { position:absolute; inset:0; background-size:cover; background-position:center; opacity:0; pointer-events:none; }
  .mosaic-cell:hover .glitch-layer-1 {
    opacity:.35; animation: glitch-1 .55s steps(1) infinite;
    filter: hue-rotate(25deg) saturate(3) brightness(1.4); mix-blend-mode:screen;
  }
  .mosaic-cell:hover .glitch-layer-2 {
    opacity:.25; animation: glitch-2 .8s steps(1) infinite;
    filter: hue-rotate(-25deg) saturate(3) brightness(1.4); mix-blend-mode:screen;
  }
  .mosaic-bottom-default { transition: opacity .3s ease, transform .3s ease; }
  .mosaic-cell:hover .mosaic-bottom-default { opacity:0; transform:translateY(6px); pointer-events:none; }
  .mosaic-hover-content {
    position:absolute; inset:0; z-index:4; display:flex; flex-direction:column;
    justify-content:flex-end; padding: clamp(18px,3vw,28px);
    opacity:0; transition: opacity .35s ease; pointer-events:none;
  }
  .mosaic-cell:hover .mosaic-hover-content { opacity:1; pointer-events:auto; }

  /* ─ Carousel ─ */
  .carousel-track {
    display:flex; gap:20px; cursor:grab; user-select:none;
    padding-bottom:16px; overflow-x:auto;
    scrollbar-width:none; -ms-overflow-style:none;
  }
  .carousel-track::-webkit-scrollbar { display:none; }
  .carousel-track.dragging { cursor:grabbing; }

  /* ─ Page transition ─ */
  .page-enter { animation: fadeIn .4s ease both; }
`;

// ─── DATA ──────────────────────────────────────────────────────────────────────
const FEATURED = [
  {
    id:1, title:"Canal+U", category:"Design d'Innovation", year:"2023",
    image:"/projets/canalu/cover.jpg",
    // ↓ Ajoute ici autant d'images que tu veux pour la galerie de ce projet
    images: [
  "/projets/canalu/cover.jpg",
  "/projets/canalu/team.jpg",
  "/projets/canalu/display.jpg",  
  "/projets/canalu/media.jpg",
],
    tags:[{label:"3D",cat:"domain"},{label:"Unreal Engine 5",cat:"tool"},{label:"Blender",cat:"tool"},{label:"Direction artistique",cat:"domain"},{label:"Gestion de projet",cat:"domain"}],
    accent:"#FBBEB4", desc:"Plateforme de Streaming innovanter, immersif, participatic & interactif pour Canal+",
    role:"Lead Designer", team:"20 personnes", duration:"2 semaines",
    contexte: "Canal+ cherchait à créer une expérience live immersive pour l'événement de lancement de leur offre jeunesse. Le défi était de concevoir un dispositif 3D interactif utilisable en temps réel par le public.",
    contribution: "J'ai assuré la direction artistique complète du projet et piloté une équipe de 20 personnes. J'ai défini le style visuel sous Unreal Engine 5, supervisé la modélisation 3D avec Blender, et géré le planning sur 2 semaines de production intensive.",
    resultats: "Livraison dans les délais malgré la contrainte de 2 semaines. L'expérience a accueilli plus de 500 visiteurs lors de l'événement. Retours très positifs de Canal+ qui a reconduit la collaboration.",
  },

  {
    id:2, title:"Digital Event", category:"Plateforme SaaS", year:"2025",
    image:"https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    images:[
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=85",
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&q=85",
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=85",
    ],
    tags:[{label:"UI/UX",cat:"domain"},{label:"Figma",cat:"tool"},{label:"Stratégie produit",cat:"domain"},{label:"Gestion de projet",cat:"domain"}],
    accent:"#D4A574", desc:"Dashboard analytique pour artistes indépendants. 8 mois, lead d'une équipe de 12.",
    role:"Project Lead", team:"12 personnes", duration:"8 mois",
    contexte:"[Décris ici le contexte de Digital Event : pour qui, quel besoin, quel marché…]",
    contribution:"[Décris ici ton rôle de Project Lead : coordination des 12 personnes, pilotage, livrables, méthodo…]",
    resultats:"[Décris ici les résultats obtenus : satisfaction client, métriques, délais, impact produit…]",
  },
  {
    id:3, title:"Disney", category:"Application mobile", year:"2023",
    image:"https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&q=80",
    images:[
      "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=1200&q=85",
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&q=85",
      "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=1200&q=85",
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&q=85",
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&q=85",
    ],
    tags:[{label:"UI/UX",cat:"domain"},{label:"Motion design",cat:"domain"},{label:"Figma",cat:"tool"},{label:"After Effects",cat:"tool"}],
    accent:"#FBBEB4", desc:"App de méditation immersive avec sound design custom. Coordination de 5 personnes.",
    role:"Product Designer", team:"5 personnes", duration:"4 mois",
    contexte:"[Décris ici le contexte du projet Disney : brief, enjeux, public cible, contraintes…]",
    contribution:"[Décris ici ta contribution : design des écrans, animations, coordination de l'équipe de 5…]",
    resultats:"[Décris ici les résultats : retours utilisateurs, métriques d'engagement, retour client…]",
  },
  {
    id:4, title:"Test", category:"Direction artistique", year:"2024",
    image:"https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
    images:[
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=85",
      "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=1200&q=85",
    ],
    tags:[{label:"Illustration",cat:"domain"},{label:"Print",cat:"domain"},{label:"Illustrator",cat:"tool"},{label:"InDesign",cat:"tool"}],
    accent:"#D4A574", desc:"Série de posters expérimentaux sur la perception géométrique.",
    role:"Designer solo", team:"Solo", duration:"3 mois",
    contexte:"[Décris ici le contexte de ce projet de direction artistique : commanditaire, objectif, contraintes créatives…]",
    contribution:"[Décris ici ton travail : concept, illustrations, choix typographiques, production…]",
    resultats:"[Décris ici les résultats : diffusion, retours, récompenses éventuelles…]",
  },
];

const CAROUSEL = [
  {id:5,title:"Liminal",category:"Recherche UX",year:"2025",image:"https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80",tags:[{label:"UX Research",cat:"domain"},{label:"Stratégie",cat:"domain"}],accent:"#FBBEB4"},
  {id:6,title:"Kintsugi",category:"Webdesign",year:"2024",image:"https://images.unsplash.com/photo-1493397212122-2b85dda8106b?w=600&q=80",tags:[{label:"Webdesign",cat:"domain"},{label:"Webflow",cat:"tool"}],accent:"#D4A574"},
  {id:7,title:"Lumen",category:"Design system",year:"2026",image:"https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=600&q=80",tags:[{label:"Design system",cat:"domain"},{label:"Figma",cat:"tool"}],accent:"#FBBEB4"},
  {id:8,title:"Sansei",category:"Édition",year:"2026",image:"https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=80",tags:[{label:"Édition",cat:"domain"},{label:"InDesign",cat:"tool"}],accent:"#D4A574"},
  {id:9,title:"Mirage",category:"Portfolio",year:"2025",image:"https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=600&q=80",tags:[{label:"Webdesign",cat:"domain"},{label:"React",cat:"tool"}],accent:"#FBBEB4"},
  {id:10,title:"Helix",category:"Branding",year:"2024",image:"https://images.unsplash.com/photo-1634942537034-2531766767d1?w=600&q=80",tags:[{label:"Branding",cat:"domain"},{label:"Illustrator",cat:"tool"}],accent:"#D4A574"},
];

// ─── ROUTER (mini router interne sans dépendance) ────────────────────────────
export default function App() {
  const [page, setPage] = useState("home");
  const [cursorPos, setCursorPos] = useState({x:-200,y:-200});
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const check = () => {
      setIsMobile(window.innerWidth < 640);
      setIsTablet(window.innerWidth >= 640 && window.innerWidth < 1024);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (isMobile) return;
    const move = (e) => setCursorPos({x:e.clientX, y:e.clientY});
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [isMobile]);

  // Scroll to top when page changes
  useEffect(() => { window.scrollTo(0, 0); }, [page]);

  const navigate = (target) => setPage(target);

  const shared = { isMobile, isTablet, navigate, page };

  return (
    <div style={{ background: C.bg, color: C.peach, minHeight: "100vh", fontFamily: FONT_DISPLAY, overflowX: "hidden" }}>
      <style>{GLOBAL_CSS}</style>

      {/* Curseur custom desktop */}
      {!isMobile && <>
        <div className="cursor-ring" style={{left:cursorPos.x, top:cursorPos.y}} />
        <div className="cursor-dot"  style={{left:cursorPos.x, top:cursorPos.y}} />
      </>}

      {/* Fond hexagonal global */}
      <svg style={{position:"fixed",inset:0,width:"100%",height:"100%",opacity:.04,pointerEvents:"none",zIndex:0}}>
        <defs>
          <pattern id="hexbg" width="52" height="45" patternUnits="userSpaceOnUse">
            <polygon points="26,2 48,14 48,38 26,50 4,38 4,14" fill="none" stroke={C.peach} strokeWidth=".5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hexbg)"/>
      </svg>

      {/* Glows ambiants */}
      <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0}}>
        <div style={{position:"absolute",top:"-15%",left:"-10%",width:"50vw",height:"50vw",background:"radial-gradient(circle,rgba(251,190,180,.07) 0%,transparent 70%)",borderRadius:"50%"}}/>
        <div style={{position:"absolute",bottom:"-15%",right:"-10%",width:"55vw",height:"55vw",background:"radial-gradient(circle,rgba(212,165,116,.05) 0%,transparent 70%)",borderRadius:"50%"}}/>
      </div>

      {/* Header commun */}
      <Header {...shared} />

      {/* Pages */}
      <div className="page-enter" key={page}>
        {page === "home"         && <PageHome         {...shared} />}
        {page === "profil"       && <PageProfil        {...shared} />}
        {page === "competences"  && <PageCompetences   {...shared} />}
        {page === "parcours"     && <PageParcours       {...shared} />}
        {page === "projet-1"     && <PageProjet project={FEATURED[0]} {...shared} />}
        {page === "projet-2"     && <PageProjet project={FEATURED[1]} {...shared} />}
        {page === "projet-3"     && <PageProjet project={FEATURED[2]} {...shared} />}
        {page === "projet-4"     && <PageProjet project={FEATURED[3]} {...shared} />}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// HEADER
// ═══════════════════════════════════════════════════════════════════════════════
function Header({ page, navigate, isMobile }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const links = [
    { id:"home",        label:"Projets",     type:"anchor", anchor:"#projets" },
    { id:"profil",      label:"Profil",      type:"page" },
    { id:"competences", label:"Compétences", type:"page" },
    { id:"parcours",    label:"Parcours",    type:"page" },
  ];

  const handleClick = (e, l) => {
    e.preventDefault();
    setMenuOpen(false);
    if (l.type === "page") {
      navigate(l.id);
    } else {
      // anchor → si on est sur home, scroll ; sinon revenir home puis scroll
      if (page === "home") {
        const el = document.querySelector(l.anchor);
        if (el) el.scrollIntoView({ behavior:"smooth" });
      } else {
        navigate("home");
        setTimeout(() => {
          const el = document.querySelector(l.anchor);
          if (el) el.scrollIntoView({ behavior:"smooth" });
        }, 300);
      }
    }
  };

  const isActive = (l) => l.id === page || (l.id === "home" && page === "home");

  return (
    <header style={{
      position:"fixed", zIndex:500,
      top: scrolled ? 12 : 0,
      left: scrolled ? "50%" : 0,
      right: scrolled ? "auto" : 0,
      width: scrolled ? (isMobile ? "calc(100% - 32px)" : "min(920px,calc(100% - 64px))") : "100%",
      transform: scrolled ? "translateX(-50%)" : "none",
      borderRadius: scrolled ? 12 : 0,
      transition: "all .5s cubic-bezier(.4,0,.2,1)",
      background: scrolled ? "rgba(11,13,26,.82)" : "rgba(11,13,26,0)",
      backdropFilter: scrolled ? "blur(28px) saturate(1.8)" : "none",
      WebkitBackdropFilter: scrolled ? "blur(28px) saturate(1.8)" : "none",
      border: scrolled ? `1px solid ${C.border}` : "1px solid transparent",
      boxShadow: scrolled ? "0 8px 40px rgba(0,0,0,.5)" : "none",
    }}>
      <div style={{
        display:"flex", justifyContent:"space-between", alignItems:"center",
        padding: scrolled ? (isMobile ? "12px 18px" : "14px 24px") : (isMobile ? "18px 24px" : "22px 64px"),
        transition:"padding .5s ease",
      }}>
        {/* Logo → home */}
        <button onClick={() => navigate("home")} style={{
          background:"transparent", border:"none", cursor:"pointer",
          display:"flex", alignItems:"center", gap:10, padding:0,
        }}>
          <svg width="28" height="28" viewBox="0 0 32 32">
            <polygon points="16,3 28,10 28,22 16,29 4,22 4,10" fill="none" stroke={C.gold} strokeWidth="1.2"/>
            <polygon points="16,9 24,13 24,21 16,25 8,21 8,13" fill={C.gold} opacity=".18"/>
          </svg>
          {!isMobile && (
            <span style={{fontFamily:FONT_BODY, fontSize:12, color:C.gold, letterSpacing:2.5, fontWeight:700, textTransform:"uppercase"}}>
              Bryan PHV
            </span>
          )}
        </button>

        {/* Desktop nav */}
        {!isMobile && (
          <nav style={{display:"flex", gap:2, alignItems:"center"}}>
            {links.map(l => (
              <a key={l.id} href="#" onClick={(e) => handleClick(e, l)} style={{
                fontFamily:FONT_BODY, fontSize:11,
                fontWeight: isActive(l) ? 700 : 500,
                letterSpacing:2, textTransform:"uppercase",
                color: isActive(l) ? C.gold : "rgba(251,190,180,.7)",
                padding:"8px 14px", borderRadius:6,
                background: isActive(l) ? "rgba(212,165,116,.1)" : "transparent",
                border:`1px solid ${isActive(l) ? "rgba(212,165,116,.4)" : "transparent"}`,
                transition:"all .2s", position:"relative",
                display:"flex", alignItems:"center", gap:5,
              }}>
                {l.label}
                {l.type === "page" && <span style={{fontSize:9, opacity:.5}}>↗</span>}
                {isActive(l) && (
                  <span style={{
                    position:"absolute", bottom:3, left:"50%",
                    transform:"translateX(-50%)",
                    width:4, height:4, borderRadius:"50%",
                    background:C.gold, boxShadow:`0 0 8px ${C.gold}`,
                  }}/>
                )}
              </a>
            ))}
          </nav>
        )}

        {/* Burger mobile */}
        {isMobile && (
          <button onClick={() => setMenuOpen(!menuOpen)} style={{
            background:"transparent", border:`1px solid ${C.border}`,
            borderRadius:6, padding:"8px 12px", cursor:"pointer",
            display:"flex", flexDirection:"column", gap:4,
          }}>
            {[0,1,2].map(i => (
              <span key={i} style={{
                display:"block", width:20, height:1.5, background:C.gold,
                transition:"all .3s",
                transform: menuOpen
                  ? i===0 ? "rotate(45deg) translate(4px,4px)"
                    : i===2 ? "rotate(-45deg) translate(4px,-4px)"
                      : "scaleX(0)"
                  : "none",
              }}/>
            ))}
          </button>
        )}
      </div>

      {/* Menu mobile */}
      {isMobile && menuOpen && (
        <div style={{padding:"12px 24px 20px", borderTop:`1px solid ${C.border}`, display:"flex", flexDirection:"column", gap:2}}>
          {links.map(l => (
            <a key={l.id} href="#" onClick={(e) => handleClick(e, l)} style={{
              fontFamily:FONT_BODY, fontSize:13,
              fontWeight: isActive(l) ? 700 : 500,
              letterSpacing:2, textTransform:"uppercase",
              color: isActive(l) ? C.gold : "rgba(251,190,180,.8)",
              padding:"12px 0",
              borderBottom:"1px solid rgba(212,165,116,.1)",
              display:"flex", justifyContent:"space-between", alignItems:"center",
            }}>
              <span>{l.label}</span>
              <span style={{color:C.gold, fontSize:12}}>
                {l.type==="page" ? "↗" : isActive(l) ? "→" : ""}
              </span>
            </a>
          ))}
        </div>
      )}
    </header>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE HOME (Landing)
// ═══════════════════════════════════════════════════════════════════════════════
function PageHome({ isMobile, isTablet, navigate }) {
  return (
    <main style={{position:"relative", zIndex:1}}>

      {/* ── HERO ── */}
      <section style={{
        padding: isMobile ? "120px 24px 64px" : isTablet ? "140px 40px 72px" : "160px 64px 80px",
        maxWidth:1400, margin:"0 auto",
      }}>
        <div style={{animation:"fadeUp .9s ease both"}}>
          {/* Nom discret */}
          <div style={{display:"flex", alignItems:"center", gap:12, marginBottom:20}}>
            <div style={{height:1, width:24, background:C.gold, opacity:.5}}/>
            <span style={{fontFamily:FONT_BODY, fontSize:isMobile?11:12, letterSpacing:3.5, color:"rgba(251,190,180,.55)", textTransform:"uppercase", fontWeight:600}}>
              PHAN VAN HO Bryan
            </span>
          </div>

          {/* Poste — grand titre */}
          <h1 style={{
            fontFamily:FONT_DISPLAY,
            fontSize: isMobile ? "clamp(36px,9vw,54px)" : isTablet ? "clamp(46px,7vw,74px)" : "clamp(54px,6.5vw,100px)",
            fontWeight:400, lineHeight:1.0, letterSpacing:"-0.025em", color:C.peach, marginBottom:28,
          }}>
            <span style={{display:"block", fontStyle:"italic"}}>Creative Designer</span>
            <span style={{display:"block"}}>&amp; <span style={{color:C.gold}}>Digital Project</span></span>
            <span style={{display:"block", color:C.gold}}>Manager.</span>
          </h1>

          <p style={{fontFamily:FONT_BODY, fontSize:isMobile?14:16, lineHeight:1.75, color:"rgba(251,190,180,.72)", maxWidth:480}}>
            Je transforme des briefs complexes en expériences mémorables, et des équipes en machines bien huilées.
          </p>
        </div>
      </section>

      {/* ── MOSAÏQUE 2×2 ── */}
      <section id="projets" style={{
        padding: isMobile?"0 16px 72px": isTablet?"0 40px 80px":"0 64px 96px",
        maxWidth:1400, margin:"0 auto",
      }}>
        <RevealHeader label="01 · Projets sélectionnés" title={<>Mes <em>projets</em> phares.</>} isMobile={isMobile}/>
        <div style={{
          display:"grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          gridTemplateRows: isMobile ? "repeat(4,300px)" : isTablet ? "340px 340px" : "420px 420px",
          gap: isMobile ? 12 : 16,
        }}>
          {FEATURED.map((p,i) => <MosaicCell key={p.id} project={p} delay={i*80} isMobile={isMobile} navigate={navigate}/>)}
        </div>
      </section>

      {/* ── CARROUSEL ── */}
      <section style={{padding: isMobile?"0 0 80px":"0 0 120px"}}>
        <div style={{padding: isMobile?"0 16px": isTablet?"0 40px":"0 64px", maxWidth:1400, margin:"0 auto"}}>
          <RevealHeader label="02 · Autres travaux" title={<>Glisse pour <em>explorer.</em></>} sub="Drag → pour faire défiler" isMobile={isMobile}/>
        </div>
        <DragCarousel items={CAROUSEL} isMobile={isMobile}/>
      </section>
    </main>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE PROFIL
// ═══════════════════════════════════════════════════════════════════════════════
function PageProfil({ isMobile, isTablet, navigate }) {
  return (
    <main style={{position:"relative", zIndex:1, padding: isMobile?"100px 24px 80px": isTablet?"120px 40px 80px":"120px 64px 80px", maxWidth:1200, margin:"0 auto"}}>

      <div style={{animation:"fadeUp .7s ease both"}}>
        <PageLabel label="Profil" num="02"/>

        <div style={{display:"grid", gridTemplateColumns: isMobile?"1fr": isTablet?"1fr":"1fr 1fr", gap: isMobile?48:80, marginTop:56, alignItems:"start"}}>

          {/* Colonne gauche — portrait + infos */}
          <div>
           {/* Portrait */}
            <div style={{
              width:"100%", aspectRatio:"3/4", maxWidth:380,
              border:`1px solid ${C.border}`, borderRadius:8,
              marginBottom:32, position:"relative", overflow:"hidden",
            }}>
              <img
                src="/bryan-profile.jpg"
                alt="Bryan Phan Van Ho"
                style={{
                  width:"100%", height:"100%",
                  objectFit:"cover", objectPosition:"center top",
                  display:"block",
                }}
              />
              <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom, transparent 65%, rgba(11,13,26,0.45) 100%)",pointerEvents:"none"}}/>
              <CornerOrnaments/>
            </div>

            {/* Infos contact */}
            <div style={{display:"flex", flexDirection:"column", gap:12}}>
              {[
                {icon:"◉", label:"Numéros", value:"06.14.28.19.09, France"},
                {icon:"◆", label:"Email", value:"phanvanhobryan@gmail.com", href:"mailto:phanvanhobryan@gmail.com"},
                {icon:"⬢", label:"LinkedIn", value:"bryanphanvanho", href:"https://www.linkedin.com/in/bryan-phan-van-ho-6bbb931b3/"},
                {icon:"★", label:"Instagram",  value:"tenshi.blossom",        href:"https://www.instagram.com/tenshi.blossom/"},
              ].map((item) => (
                <div key={item.label} style={{
                  display:"flex", alignItems:"center", gap:14,
                  padding:"12px 16px",
                  background:"rgba(26,31,56,.5)",
                  border:`1px solid rgba(212,165,116,.15)`,
                  borderRadius:6,
                }}>
                  <span style={{color:C.gold, fontSize:14, width:20, textAlign:"center"}}>{item.icon}</span>
                  <div>
                    <div style={{fontFamily:FONT_BODY, fontSize:9, letterSpacing:2, color:"rgba(251,190,180,.5)", textTransform:"uppercase", fontWeight:700}}>{item.label}</div>
                     {item.href ? (
                      <a href={item.href} target="_blank" rel="noopener noreferrer" style={{fontFamily:FONT_BODY, fontSize:13, color:C.gold, textDecoration:"none", borderBottom:`1px solid ${C.gold}50`, paddingBottom:1}}>
                        {item.value}
                      </a>
                    ) : (
                    <div style={{fontFamily:FONT_BODY, fontSize:13, color:C.peach, marginTop:2}}>{item.value}</div>
                    )}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Colonne droite — bio */}
          <div>
            <h1 style={{fontFamily:FONT_DISPLAY, fontSize:isMobile?40:56, fontWeight:400, lineHeight:1, color:C.peach, marginBottom:8}}>
              <span style={{fontStyle:"italic"}}>Bonjour,</span><br/>
              <span style={{color:C.gold}}>je suis Bryan.</span>
            </h1>
            <div style={{width:48, height:1, background:C.gold, margin:"24px 0 32px"}}/>

            <div style={{display:"flex", flexDirection:"column", gap:20}}>
              <p style={{fontFamily:FONT_BODY, fontSize:16, lineHeight:1.8, color:"rgba(251,190,180,.85)"}}>
                [Ta bio ici] — Je suis Creative Designer et Digital Project Manager basé à Paris, passionné par la création d'expériences visuelles qui allient esthétique et performance.
              </p>
              <p style={{fontFamily:FONT_BODY, fontSize:15, lineHeight:1.8, color:"rgba(251,190,180,.7)"}}>
                Mon approche est au carrefour du design et de la gestion de projet : je conçois des interfaces mémorables tout en pilotant les équipes créatives pour livrer dans les délais et avec impact.
              </p>
              <p style={{fontFamily:FONT_BODY, fontSize:15, lineHeight:1.8, color:"rgba(251,190,180,.7)"}}>
                [Ajoute ici ta formation, tes valeurs, ce qui te motive…]
              </p>
            </div>

            {/* Stats */}
            <div style={{
              display:"grid", gridTemplateColumns:"repeat(3,1fr)",
              gap:16, marginTop:40,
              paddingTop:32, borderTop:`1px solid rgba(212,165,116,.2)`,
            }}>
              {[
                {value:"X+", label:"Années d'XP"},
                {value:"XX", label:"Projets livrés"},
                {value:"XX", label:"Clients"},
              ].map(s => (
                <div key={s.label}>
                  <div style={{fontFamily:FONT_DISPLAY, fontSize:40, color:C.gold, lineHeight:1}}>{s.value}</div>
                  <div style={{fontFamily:FONT_BODY, fontSize:10, letterSpacing:2, color:"rgba(251,190,180,.55)", textTransform:"uppercase", marginTop:6, fontWeight:600}}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* CTA vers projets */}
            <button onClick={() => navigate("home")} style={{
              marginTop:40,
              fontFamily:FONT_BODY, fontSize:12, fontWeight:700,
              letterSpacing:2.5, textTransform:"uppercase",
              color:C.bg,
              background:`linear-gradient(135deg, ${C.gold} 0%, ${C.peach} 100%)`,
              border:"none", borderRadius:4, padding:"14px 28px",
              cursor:"pointer", boxShadow:"0 4px 24px rgba(212,165,116,.3)",
              display:"inline-flex", alignItems:"center", gap:10,
            }}>
              ▶ Voir mes projets
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE COMPÉTENCES
// ═══════════════════════════════════════════════════════════════════════════════
function PageCompetences({ isMobile, isTablet }) {
  const domainTags = [
    "UI/UX Design","Direction artistique","Design graphique","Branding","3D","Motion design",
    "Illustration","Webdesign","App mobile","Print","Édition","Recherche utilisateur",
    "Stratégie produit","Gestion de projet",
  ];
  const toolTags = [
    "Figma","Adobe XD","Photoshop","Illustrator","InDesign","After Effects",
    "Premiere Pro","Blender","Cinema 4D","Unreal Engine 5","Webflow","Framer","React",
  ];

  const categories = [
    {
      icon:"◆", title:"Design créatif", color:C.peach,
      items:["Direction artistique","UI/UX Design","Design graphique","Branding","3D & Motion","Illustration"],
    },
    {
      icon:"⬢", title:"Gestion de projet", color:C.gold,
      items:["Pilotage d'équipes (jusqu'à 12 pers.)","Planification & roadmap","Coordination créative","Gestion des délais","Brief & livrables","Relation client"],
    },
    {
      icon:"★", title:"Stratégie & produit", color:"#FFD700",
      items:["Stratégie produit","Recherche utilisateur","Design system","Audit UX","Storytelling visuel","Positionnement de marque"],
    },
  ];

  return (
    <main style={{position:"relative", zIndex:1, padding: isMobile?"100px 24px 80px": isTablet?"120px 40px 80px":"120px 64px 80px", maxWidth:1200, margin:"0 auto"}}>
      <div style={{animation:"fadeUp .7s ease both"}}>
        <PageLabel label="Compétences" num="03"/>

        <h1 style={{fontFamily:FONT_DISPLAY, fontSize:isMobile?40:60, fontWeight:400, color:C.peach, lineHeight:1, marginTop:16, marginBottom:48}}>
          Ce que je <span style={{fontStyle:"italic", color:C.gold}}>maîtrise.</span>
        </h1>

        {/* Blocs de compétences */}
        <div style={{display:"grid", gridTemplateColumns: isMobile?"1fr": isTablet?"1fr 1fr":"repeat(3,1fr)", gap:20, marginBottom:64}}>
          {categories.map((cat) => (
            <div key={cat.title} style={{
              padding:28,
              background:"rgba(26,31,56,.5)",
              border:`1px solid rgba(212,165,116,.2)`,
              borderRadius:8,
              backdropFilter:"blur(20px)",
              position:"relative", overflow:"hidden",
            }}>
              <CornerOrnaments color={cat.color}/>
              <div style={{fontSize:32, color:cat.color, marginBottom:16}}>{cat.icon}</div>
              <h3 style={{fontFamily:FONT_DISPLAY, fontSize:22, fontWeight:400, color:C.peach, fontStyle:"italic", marginBottom:20}}>
                {cat.title}
              </h3>
              <ul style={{listStyle:"none", display:"flex", flexDirection:"column", gap:10}}>
                {cat.items.map(item => (
                  <li key={item} style={{
                    display:"flex", alignItems:"center", gap:10,
                    fontFamily:FONT_BODY, fontSize:13, color:"rgba(251,190,180,.8)",
                    paddingBottom:10, borderBottom:"1px solid rgba(212,165,116,.08)",
                  }}>
                    <span style={{color:cat.color, fontSize:8}}>▶</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Outils & logiciels */}
        <div style={{marginBottom:56}}>
          <div style={{display:"flex", alignItems:"center", gap:14, marginBottom:24}}>
            <div style={{height:1, width:28, background:C.gold, opacity:.6}}/>
            <span style={{fontFamily:FONT_BODY, fontSize:11, letterSpacing:3, color:C.gold, textTransform:"uppercase", fontWeight:700}}>
              Outils & logiciels
            </span>
          </div>
          <div style={{display:"flex", flexWrap:"wrap", gap:8}}>
            {toolTags.map(t => <Tag key={t} label={t} cat="tool"/>)}
          </div>
        </div>

        {/* Domaines */}
        <div>
          <div style={{display:"flex", alignItems:"center", gap:14, marginBottom:24}}>
            <div style={{height:1, width:28, background:C.gold, opacity:.6}}/>
            <span style={{fontFamily:FONT_BODY, fontSize:11, letterSpacing:3, color:C.gold, textTransform:"uppercase", fontWeight:700}}>
              Domaines d'expertise
            </span>
          </div>
          <div style={{display:"flex", flexWrap:"wrap", gap:8}}>
            {domainTags.map(t => <Tag key={t} label={t} cat="domain"/>)}
          </div>
        </div>
      </div>
    </main>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE PARCOURS
// ═══════════════════════════════════════════════════════════════════════════════
function PageParcours({ isMobile, isTablet }) {
  const experiences = [
    {
      type:"exp",
      period:"2024 — Présent",
      role:"Creative Designer & Digital Project Manager",
      org:"[Entreprise actuelle]",
      desc:"[Décris ici ton poste : missions, équipe, résultats clés, projets phares…]",
      tags:[{label:"Direction artistique",cat:"domain"},{label:"Gestion de projet",cat:"domain"},{label:"Figma",cat:"tool"}],
    },
    {
      type:"exp",
      period:"2022 — 2024",
      role:"UI/UX Designer",
      org:"[Entreprise précédente]",
      desc:"[Décris ton poste précédent : missions, livrables, contexte…]",
      tags:[{label:"UI/UX",cat:"domain"},{label:"Figma",cat:"tool"},{label:"After Effects",cat:"tool"}],
    },
    {
      type:"edu",
      period:"2019 — 2022",
      role:"[Ton diplôme]",
      org:"[Ton école]",
      desc:"[Ta formation : spécialisation, projets marquants, mémoire…]",
      tags:[{label:"Design graphique",cat:"domain"},{label:"Illustrator",cat:"tool"}],
    },
    {
      type:"edu",
      period:"2017 — 2019",
      role:"[Formation précédente]",
      org:"[École / Université]",
      desc:"[Description de cette formation…]",
      tags:[{label:"Print",cat:"domain"}],
    },
  ];

  return (
    <main style={{position:"relative", zIndex:1, padding: isMobile?"100px 24px 80px": isTablet?"120px 40px 80px":"120px 64px 80px", maxWidth:1100, margin:"0 auto"}}>
      <div style={{animation:"fadeUp .7s ease both"}}>
        <PageLabel label="Parcours" num="04"/>

        <h1 style={{fontFamily:FONT_DISPLAY, fontSize:isMobile?40:60, fontWeight:400, color:C.peach, lineHeight:1, marginTop:16, marginBottom:56}}>
          Mon <span style={{fontStyle:"italic", color:C.gold}}>chemin.</span>
        </h1>

        {/* Timeline */}
        <div style={{position:"relative"}}>
          {/* Ligne verticale */}
          {!isMobile && (
            <div style={{
              position:"absolute", left:140, top:0, bottom:0,
              width:1, background:`linear-gradient(${C.gold}60, ${C.gold}10)`,
            }}/>
          )}

          <div style={{display:"flex", flexDirection:"column", gap:isMobile?32:0}}>
            {experiences.map((exp, i) => (
              <div key={i} style={{
                display:"grid",
                gridTemplateColumns: isMobile ? "1fr" : "140px 1fr",
                gap: isMobile ? 12 : 48,
                paddingBottom: isMobile ? 0 : 48,
                animation:`fadeUp .6s ${i*100}ms ease both`,
              }}>
                {/* Date */}
                <div style={{
                  paddingTop: isMobile ? 0 : 4,
                  textAlign: isMobile ? "left" : "right",
                }}>
                  <span style={{
                    fontFamily:FONT_BODY, fontSize:11, letterSpacing:1.5,
                    color: exp.type==="exp" ? C.gold : "rgba(251,190,180,.55)",
                    fontWeight:700,
                  }}>
                    {exp.period}
                  </span>
                </div>

                {/* Contenu */}
                <div style={{position:"relative"}}>
                  {/* Dot sur la timeline */}
                  {!isMobile && (
                    <div style={{
                      position:"absolute", left:-55, top:6,
                      width:10, height:10, borderRadius:"50%",
                      background: exp.type==="exp" ? C.gold : C.indigo,
                      border:`1.5px solid ${C.gold}`,
                      boxShadow: exp.type==="exp" ? `0 0 12px ${C.gold}80` : "none",
                    }}/>
                  )}

                  <div style={{
                    padding:"20px 24px",
                    background:"rgba(26,31,56,.5)",
                    border:`1px solid ${exp.type==="exp" ? "rgba(212,165,116,.3)" : "rgba(212,165,116,.12)"}`,
                    borderRadius:8,
                    backdropFilter:"blur(20px)",
                    position:"relative",
                  }}>
                    {/* Type badge */}
                    <div style={{
                      position:"absolute", top:16, right:16,
                      fontFamily:FONT_BODY, fontSize:9, letterSpacing:2,
                      color: exp.type==="exp" ? C.gold : "rgba(251,190,180,.4)",
                      textTransform:"uppercase", fontWeight:700,
                      padding:"2px 8px",
                      border:`0.5px solid ${exp.type==="exp" ? C.gold+"60" : "rgba(251,190,180,.2)"}`,
                      borderRadius:2,
                    }}>
                      {exp.type==="exp" ? "Expérience" : "Formation"}
                    </div>

                    <h3 style={{fontFamily:FONT_DISPLAY, fontSize:isMobile?18:22, fontWeight:400, color:C.peach, fontStyle:"italic", marginBottom:4, paddingRight:90}}>
                      {exp.role}
                    </h3>
                    <div style={{fontFamily:FONT_BODY, fontSize:13, color:C.gold, fontWeight:600, marginBottom:12}}>
                      {exp.org}
                    </div>
                    <p style={{fontFamily:FONT_BODY, fontSize:13, color:"rgba(251,190,180,.7)", lineHeight:1.65, marginBottom:14}}>
                      {exp.desc}
                    </p>
                    <div style={{display:"flex", flexWrap:"wrap", gap:5}}>
                      {exp.tags.map(t => <Tag key={t.label} label={t.label} cat={t.cat}/>)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPOSANTS PARTAGÉS
// ═══════════════════════════════════════════════════════════════════════════════

function PageLabel({ label, num }) {
  return (
    <div style={{display:"flex", alignItems:"center", gap:12}}>
      <span style={{
        fontFamily:FONT_BODY, fontSize:11, color:C.gold, letterSpacing:2,
        textTransform:"uppercase", fontWeight:700,
        padding:"4px 10px",
        background:"rgba(212,165,116,.1)",
        border:`1px solid ${C.gold}`, borderRadius:4,
      }}>
        {num}
      </span>
      <span style={{fontFamily:FONT_BODY, fontSize:11, color:"rgba(212,165,116,.7)", letterSpacing:3, textTransform:"uppercase", fontWeight:600}}>
        {label}
      </span>
    </div>
  );
}

function RevealHeader({ label, title, sub, isMobile }) {
  return (
    <div style={{marginBottom: isMobile?28:40}}>
      <div style={{display:"flex", alignItems:"center", gap:12, marginBottom:10}}>
        <div style={{height:1, width:28, background:C.gold, opacity:.6}}/>
        <span style={{fontFamily:FONT_BODY, fontSize:11, letterSpacing:3, color:C.gold, textTransform:"uppercase", fontWeight:700}}>{label}</span>
      </div>
      <h2 style={{fontFamily:FONT_DISPLAY, fontSize: isMobile?"clamp(30px,8vw,46px)":"clamp(36px,5vw,64px)", fontWeight:400, color:C.peach, lineHeight:1, letterSpacing:"-0.02em"}}>
        {title}
      </h2>
      {sub && <p style={{fontFamily:FONT_BODY, fontSize:12, color:"rgba(251,190,180,.5)", letterSpacing:1.5, textTransform:"uppercase", fontWeight:600, marginTop:8}}>{sub}</p>}
    </div>
  );
}

function Tag({ label, cat }) {
  const cfg = {
    domain:{color:C.peach, icon:"◆"},
    tool:  {color:C.gold,  icon:"⬢"},
    context:{color:"#6B8E8A",icon:"▲"},
  }[cat] || {color:C.peach,icon:"◆"};
  return (
    <span style={{
      fontFamily:FONT_BODY, fontSize:9, padding:"3px 8px",
      background:`${cfg.color}12`, border:`0.5px solid ${cfg.color}55`,
      borderRadius:2, color:cfg.color, letterSpacing:1.5,
      textTransform:"uppercase", fontWeight:700,
      display:"inline-flex", alignItems:"center", gap:4, whiteSpace:"nowrap",
    }}>
      <span style={{fontSize:6}}>{cfg.icon}</span>{label}
    </span>
  );
}

function CornerOrnaments({ color=C.gold }) {
  return (
    <>
      {[{t:8,l:8,r:0},{t:8,ri:8,r:90},{b:8,ri:8,r:180},{b:8,l:8,r:270}].map((c,i) => (
        <svg key={i} width="12" height="12" viewBox="0 0 14 14" style={{
          position:"absolute", top:c.t, left:c.l, right:c.ri, bottom:c.b,
          transform:`rotate(${c.r}deg)`, pointerEvents:"none", zIndex:10,
        }}>
          <path d="M1 5L1 1L5 1" stroke={color} strokeWidth="1.2" fill="none"/>
        </svg>
      ))}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// LIGHTBOX
// ═══════════════════════════════════════════════════════════════════════════════
function Lightbox({ images, startIndex, onClose }) {
  const [current, setCurrent] = useState(startIndex);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setCurrent(c => (c + 1) % images.length);
      if (e.key === "ArrowLeft")  setCurrent(c => (c - 1 + images.length) % images.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [images.length, onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position:"fixed", inset:0, zIndex:9000,
        background:"rgba(11,13,26,0.96)",
        backdropFilter:"blur(20px)",
        display:"flex", alignItems:"center", justifyContent:"center",
        animation:"fadeIn .25s ease both",
      }}
    >
      {/* Image */}
      <img
        src={images[current]}
        alt=""
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth:"88vw", maxHeight:"85vh",
          objectFit:"contain",
          borderRadius:6,
          boxShadow:"0 32px 80px rgba(0,0,0,0.7)",
          animation:"fadeUp .3s ease both",
        }}
      />

      {/* Fermer */}
      <button
        onClick={onClose}
        style={{
          position:"fixed", top:24, right:32,
          background:"transparent", border:"none",
          color:C.peach, fontSize:28, lineHeight:1,
          fontFamily:FONT_BODY, fontWeight:300, opacity:0.7,
        }}
      >
        ✕
      </button>

      {/* Navigation gauche/droite */}
      {images.length > 1 && <>
        <button
          onClick={(e)=>{e.stopPropagation(); setCurrent(c=>(c-1+images.length)%images.length);}}
          style={{
            position:"fixed", left:24, top:"50%", transform:"translateY(-50%)",
            background:"rgba(26,31,56,0.7)", border:`1px solid ${C.border}`,
            borderRadius:4, color:C.peach, fontSize:20,
            width:48, height:48, display:"flex", alignItems:"center", justifyContent:"center",
            backdropFilter:"blur(12px)",
          }}
        >←</button>
        <button
          onClick={(e)=>{e.stopPropagation(); setCurrent(c=>(c+1)%images.length);}}
          style={{
            position:"fixed", right:24, top:"50%", transform:"translateY(-50%)",
            background:"rgba(26,31,56,0.7)", border:`1px solid ${C.border}`,
            borderRadius:4, color:C.peach, fontSize:20,
            width:48, height:48, display:"flex", alignItems:"center", justifyContent:"center",
            backdropFilter:"blur(12px)",
          }}
        >→</button>
      </>}

      {/* Compteur + pastilles */}
      <div style={{
        position:"fixed", bottom:28, left:"50%", transform:"translateX(-50%)",
        display:"flex", flexDirection:"column", alignItems:"center", gap:10,
      }}>
        <div style={{display:"flex", gap:6}}>
          {images.map((_, i) => (
            <button
              key={i}
              onClick={(e)=>{e.stopPropagation(); setCurrent(i);}}
              style={{
                width: i === current ? 20 : 6,
                height:6,
                borderRadius:3,
                background: i === current ? C.gold : "rgba(251,190,180,0.35)",
                border:"none",
                transition:"all .2s ease",
              }}
            />
          ))}
        </div>
        <span style={{fontFamily:FONT_BODY, fontSize:11, color:"rgba(251,190,180,0.5)", letterSpacing:2}}>
          {current + 1} / {images.length}
        </span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE PROJET DÉTAILLÉE
// ═══════════════════════════════════════════════════════════════════════════════
function PageProjet({ project: p, isMobile, isTablet, navigate }) {
  const [lightbox, setLightbox] = useState(null); // index image ouverte, null = fermée
  if (!p) return null;
  const imgs = p.images || [p.image];

  return (
    <main style={{position:"relative", zIndex:1, minHeight:"100vh"}}>
      {/* Lightbox */}
      {lightbox !== null && (
        <Lightbox images={imgs} startIndex={lightbox} onClose={() => setLightbox(null)} />
      )}

      {/* ── HERO IMAGE ── */}
      <div style={{position:"relative", height: isMobile ? "55vh" : "70vh", overflow:"hidden"}}>
        <div style={{
          position:"absolute", inset:0,
          backgroundImage:`url(${p.image})`,
          backgroundSize:"cover", backgroundPosition:"center",
          filter:"brightness(0.4) saturate(0.7)",
          transform:"scale(1.05)",
        }}/>
        <div style={{
          position:"absolute", inset:0,
          background:"linear-gradient(to bottom, transparent 30%, #0B0D1A 100%)",
        }}/>

        {/* Bouton retour */}
        <button onClick={() => navigate("home")} style={{
          position:"absolute", top: isMobile ? 90 : 100, left: isMobile ? 24 : 64,
          fontFamily:FONT_BODY, fontSize:11, letterSpacing:2.5, textTransform:"uppercase", fontWeight:700,
          color:C.peach, background:"rgba(11,13,26,0.6)",
          border:`1px solid ${C.border}`, borderRadius:4, padding:"10px 18px",
          backdropFilter:"blur(12px)",
          display:"inline-flex", alignItems:"center", gap:8,
        }}>
          ← Retour
        </button>

        {/* Titre */}
        <div style={{
          position:"absolute", bottom:0, left:0, right:0,
          padding: isMobile ? "0 24px 40px" : "0 64px 56px",
        }}>
          <div style={{fontFamily:FONT_BODY, fontSize:11, letterSpacing:3, color:p.accent, textTransform:"uppercase", fontWeight:700, marginBottom:12}}>
            {p.category} · {p.year}
          </div>
          <h1 style={{
            fontFamily:FONT_DISPLAY,
            fontSize: isMobile ? "clamp(40px,10vw,60px)" : "clamp(56px,8vw,96px)",
            fontWeight:400, lineHeight:0.95,
            color:C.peach, fontStyle:"italic", letterSpacing:"-0.025em",
          }}>
            {p.title}
          </h1>
        </div>
      </div>

      {/* ── CONTENU ── */}
      <div style={{
        maxWidth:1100, margin:"0 auto",
        padding: isMobile ? "48px 24px 80px" : isTablet ? "56px 40px 80px" : "64px 64px 100px",
      }}>
        <div style={{display:"grid", gridTemplateColumns: isMobile ? "1fr" : "2fr 1fr", gap: isMobile ? 48 : 64, alignItems:"start"}}>

          {/* ── COLONNE PRINCIPALE ── */}
          <div>

            {/* Description */}
            <div style={{
              padding:"28px 32px",
              background:"rgba(26,31,56,0.5)",
              border:`1px solid rgba(212,165,116,0.2)`,
              borderRadius:8, backdropFilter:"blur(20px)",
              marginBottom:40, position:"relative",
            }}>
              <CornerOrnaments color={p.accent}/>
              <div style={{fontFamily:FONT_BODY, fontSize:10, letterSpacing:2.5, color:p.accent, textTransform:"uppercase", fontWeight:700, marginBottom:14}}>
                À propos du projet
              </div>
              <p style={{fontFamily:FONT_BODY, fontSize:16, lineHeight:1.85, color:"rgba(251,190,180,0.85)", margin:0}}>
                {p.desc}
              </p>
              <p style={{fontFamily:FONT_BODY, fontSize:15, lineHeight:1.8, color:"rgba(251,190,180,0.6)", marginTop:16}}>
    
              </p>
            </div>


            {/* ── DÉTAIL & PROCESSUS ── */}
            <div style={{
              padding:'28px 32px',
              background:'rgba(26,31,56,0.5)',
              border:'1px solid rgba(212,165,116,0.2)',
              borderRadius:8, backdropFilter:'blur(20px)',
              marginBottom:40, position:'relative',
            }}>
              <CornerOrnaments color={p.accent}/>

              <div style={{fontFamily:FONT_BODY, fontSize:10, letterSpacing:2.5, color:p.accent, textTransform:'uppercase', fontWeight:700, marginBottom:24}}>
                Détail & processus
              </div>

              {/* Contexte */}
              <div style={{marginBottom:24}}>
                <h4 style={{fontFamily:FONT_DISPLAY, fontSize:18, fontWeight:400, color:C.peach, fontStyle:'italic', marginBottom:10}}>
                  Contexte
                </h4>
                <p style={{fontFamily:FONT_BODY, fontSize:14, lineHeight:1.8, color:'rgba(251,190,180,0.75)', margin:0}}>
                  {p.contexte || '[Décris le contexte du projet…]'}
                </p>
              </div>

              <div style={{height:1, background:'rgba(212,165,116,0.12)', marginBottom:24}}/>

              {/* Ce que j ai fait */}
              <div style={{marginBottom:24}}>
                <h4 style={{fontFamily:FONT_DISPLAY, fontSize:18, fontWeight:400, color:C.peach, fontStyle:'italic', marginBottom:10}}>
                  Ce que j&apos;ai fait
                </h4>
                <p style={{fontFamily:FONT_BODY, fontSize:14, lineHeight:1.8, color:'rgba(251,190,180,0.75)', margin:0}}>
                  {p.contribution || '[Décris ton rôle et tes contributions…]'}
                </p>
              </div>

              <div style={{height:1, background:'rgba(212,165,116,0.12)', marginBottom:24}}/>

              {/* Résultats */}
              <div>
                <h4 style={{fontFamily:FONT_DISPLAY, fontSize:18, fontWeight:400, color:C.peach, fontStyle:'italic', marginBottom:10}}>
                  Résultats & impact
                </h4>
                <p style={{fontFamily:FONT_BODY, fontSize:14, lineHeight:1.8, color:'rgba(251,190,180,0.75)', margin:0}}>
                  {p.resultats || '[Décris les résultats obtenus…]'}
                </p>
              </div>

            </div>

            {/* ── GALERIE ── */}
            <div style={{fontFamily:FONT_BODY, fontSize:10, letterSpacing:2.5, color:p.accent, textTransform:"uppercase", fontWeight:700, marginBottom:16}}>
              Galerie · {imgs.length} visuel{imgs.length > 1 ? "s" : ""}
            </div>

            {/*
              GRILLE ADAPTATIVE :
              - 1 image  → pleine largeur
              - 2 images → 2 colonnes égales
              - 3 images → 1 grande + 2 petites
              - 4+ images → grille 2 colonnes, première image en pleine largeur
            */}
            <div style={{display:"flex", flexDirection:"column", gap:10}}>

              {/* Première image — toujours grande */}
              <div
                onClick={() => setLightbox(0)}
                style={{
                  width:"100%",
                  borderRadius:6, overflow:"hidden",
                  border:`1px solid rgba(212,165,116,0.15)`,
                  cursor:"zoom-in", position:"relative",
                  background:"rgba(11,13,26,0.6)",
                  display:"flex", alignItems:"center", justifyContent:"center",
                }}
              >
                <img src={imgs[0]} alt="" loading="lazy" style={{width:"100%", height:"auto", objectFit:"contain", display:"block", transition:"transform .4s ease, filter .4s ease"}}                  onMouseEnter={e=>{e.currentTarget.style.transform="scale(1.04)";e.currentTarget.style.filter="brightness(1.1)";}}
                  onMouseLeave={e=>{e.currentTarget.style.transform="scale(1)";e.currentTarget.style.filter="brightness(1)";}}
                />
                <div style={{
                  position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center",
                  opacity:0, transition:"opacity .3s",
                  background:"rgba(11,13,26,0.3)",
                }}
                  onMouseEnter={e=>e.currentTarget.style.opacity=1}
                  onMouseLeave={e=>e.currentTarget.style.opacity=0}
                >
                  <div style={{
                    width:48, height:48, borderRadius:"50%",
                    background:"rgba(11,13,26,0.7)", backdropFilter:"blur(10px)",
                    border:`1px solid ${p.accent}60`,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:20, color:p.accent,
                  }}>⊕</div>
                </div>
              </div>

              {/* Images suivantes — grille 2 colonnes */}
              {imgs.length > 1 && (
                <div style={{
                  display:"grid",
                  gridTemplateColumns: imgs.length === 2 ? "1fr" : "1fr 1fr",
                  gap:10,
                }}>
                  {imgs.slice(1).map((src, i) => (
                    <div
                      key={i}
                      onClick={() => setLightbox(i + 1)}
                      style={{
                        borderRadius:6, overflow:"hidden",
                        border:`1px solid rgba(212,165,116,0.15)`,
                        cursor:"zoom-in", position:"relative",
                        background:"rgba(11,13,26,0.6)",
                        display:"flex", alignItems:"center", justifyContent:"center",
                      }}
                    >
<img src={src} alt="" loading="lazy" style={{width:"100%", height:"auto", objectFit:"contain", display:"block", transition:"transform .4s ease, filter .4s ease"}}                        onMouseEnter={e=>{e.currentTarget.style.transform="scale(1.06)";e.currentTarget.style.filter="brightness(1.1)";}}
                        onMouseLeave={e=>{e.currentTarget.style.transform="scale(1)";e.currentTarget.style.filter="brightness(1)";}}
                      />
                      <div style={{
                        position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center",
                        opacity:0, transition:"opacity .3s",
                        background:"rgba(11,13,26,0.3)",
                      }}
                        onMouseEnter={e=>e.currentTarget.style.opacity=1}
                        onMouseLeave={e=>e.currentTarget.style.opacity=0}
                      >
                        <div style={{
                          width:40, height:40, borderRadius:"50%",
                          background:"rgba(11,13,26,0.7)", backdropFilter:"blur(10px)",
                          border:`1px solid ${p.accent}60`,
                          display:"flex", alignItems:"center", justifyContent:"center",
                          fontSize:18, color:p.accent,
                        }}>⊕</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── COLONNE LATÉRALE ── */}
          <div style={{display:"flex", flexDirection:"column", gap:16}}>

            {/* Tags domaines */}
            <div style={{padding:"20px 24px", background:"rgba(26,31,56,0.5)", border:`1px solid rgba(212,165,116,0.2)`, borderRadius:8, backdropFilter:"blur(20px)"}}>
              <div style={{fontFamily:FONT_BODY, fontSize:10, letterSpacing:2.5, color:"rgba(251,190,180,0.5)", textTransform:"uppercase", fontWeight:700, marginBottom:12}}>
                Domaines
              </div>
              <div style={{display:"flex", flexWrap:"wrap", gap:6}}>
                {p.tags.filter(t=>t.cat==="domain").map(t=><Tag key={t.label} label={t.label} cat={t.cat}/>)}
              </div>
            </div>

            {/* Tags outils */}
            <div style={{padding:"20px 24px", background:"rgba(26,31,56,0.5)", border:`1px solid rgba(212,165,116,0.2)`, borderRadius:8, backdropFilter:"blur(20px)"}}>
              <div style={{fontFamily:FONT_BODY, fontSize:10, letterSpacing:2.5, color:"rgba(251,190,180,0.5)", textTransform:"uppercase", fontWeight:700, marginBottom:12}}>
                Outils
              </div>
              <div style={{display:"flex", flexWrap:"wrap", gap:6}}>
                {p.tags.filter(t=>t.cat==="tool").map(t=><Tag key={t.label} label={t.label} cat={t.cat}/>)}
              </div>
            </div>

            {/* Infos projet */}
            <div style={{padding:"20px 24px", background:"rgba(26,31,56,0.5)", border:`1px solid rgba(212,165,116,0.2)`, borderRadius:8, backdropFilter:"blur(20px)"}}>
              <div style={{fontFamily:FONT_BODY, fontSize:10, letterSpacing:2.5, color:"rgba(251,190,180,0.5)", textTransform:"uppercase", fontWeight:700, marginBottom:16}}>
                Infos
              </div>
              <div style={{display:"flex", flexDirection:"column", gap:10}}>
                {[
                  {label:"Année",    value:p.year},
                  {label:"Catégorie",value:p.category},
                  {label:"Rôle",     value:p.role     || "[Ton rôle]"},
                  {label:"Équipe",   value:p.team     || "[Taille équipe]"},
                  {label:"Durée",    value:p.duration || "[Durée]"},
                ].map(item=>(
                  <div key={item.label} style={{display:"flex", justifyContent:"space-between", alignItems:"baseline", paddingBottom:10, borderBottom:"1px solid rgba(212,165,116,0.1)"}}>
                    <span style={{fontFamily:FONT_BODY, fontSize:11, color:"rgba(251,190,180,0.5)", fontWeight:600}}>{item.label}</span>
                    <span style={{fontFamily:FONT_BODY, fontSize:13, color:C.peach, fontWeight:500, textAlign:"right", maxWidth:"55%"}}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation entre projets */}
            <div style={{display:"flex", gap:8}}>
              {p.id > 1 && (
                <button onClick={() => navigate(`projet-${p.id-1}`)} style={{
                  flex:1, fontFamily:FONT_BODY, fontSize:11, letterSpacing:2, textTransform:"uppercase", fontWeight:700,
                  color:C.peach, background:"rgba(26,31,56,0.5)", border:`1px solid rgba(212,165,116,0.2)`,
                  borderRadius:4, padding:"12px 8px",
                  display:"flex", alignItems:"center", justifyContent:"center", gap:6,
                }}>← Préc.</button>
              )}
              {p.id < 4 && (
                <button onClick={() => navigate(`projet-${p.id+1}`)} style={{
                  flex:1, fontFamily:FONT_BODY, fontSize:11, letterSpacing:2, textTransform:"uppercase", fontWeight:700,
                  color:C.peach, background:"rgba(26,31,56,0.5)", border:`1px solid rgba(212,165,116,0.2)`,
                  borderRadius:4, padding:"12px 8px",
                  display:"flex", alignItems:"center", justifyContent:"center", gap:6,
                }}>Suiv. →</button>
              )}
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}


// ─── MOSAIC CELL ────────────────────────────────────────────────────────────────
function MosaicCell({ project:p, delay, isMobile, navigate }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="mosaic-cell"
      onMouseEnter={() => !isMobile && setHovered(true)}
      onMouseLeave={() => !isMobile && setHovered(false)}
      onClick={() => isMobile ? setHovered(h=>!h) : navigate && navigate(`projet-${p.id}`)}
      style={{
        border:`1px solid ${hovered ? p.accent+"55" : "rgba(212,165,116,.12)"}`,
        boxShadow: hovered ? `0 0 48px ${p.accent}18` : "none",
        transition:"border-color .4s, box-shadow .4s",
        animation:`fadeUp .7s ${delay}ms ease both`,
      }}
    >
      <div className="cell-image" style={{backgroundImage:`url(${p.image})`}}/>
      <div style={{position:"absolute",inset:0,zIndex:1,background:`linear-gradient(135deg,${p.accent}15 0%,rgba(11,13,26,.3) 100%)`,transition:"opacity .4s",opacity:hovered?0:1}}/>
      <div className="mosaic-scanline"/>
      <div className="glitch-layer glitch-layer-1" style={{backgroundImage:`url(${p.image})`}}/>
      <div className="glitch-layer glitch-layer-2" style={{backgroundImage:`url(${p.image})`}}/>
      <div style={{position:"absolute",bottom:0,left:0,right:0,height:"70%",background:"linear-gradient(transparent,rgba(11,13,26,.95))",zIndex:2}}/>
      <div style={{position:"absolute",inset:0,zIndex:3,display:"flex",flexDirection:"column",justifyContent:"flex-end",padding:"clamp(18px,3vw,28px)"}}>
        <div className="mosaic-bottom-default">
          <div style={{fontFamily:FONT_BODY,fontSize:10,letterSpacing:2.5,color:p.accent,textTransform:"uppercase",fontWeight:700,marginBottom:8}}>{p.category} · {p.year}</div>
          <h3 style={{fontFamily:FONT_DISPLAY,fontSize:"clamp(22px,3vw,30px)",fontWeight:400,color:C.peach,fontStyle:"italic",lineHeight:1.1}}>{p.title}</h3>
        </div>
      </div>
      <div className="mosaic-hover-content">
        <div style={{position:"relative",zIndex:5}}>
          <div style={{fontFamily:FONT_BODY,fontSize:10,letterSpacing:2.5,color:p.accent,textTransform:"uppercase",fontWeight:700,marginBottom:8}}>{p.category} · {p.year}</div>
          <h3 style={{fontFamily:FONT_DISPLAY,fontSize:"clamp(22px,3vw,30px)",fontWeight:400,color:C.peach,fontStyle:"italic",lineHeight:1.1,marginBottom:10}}>{p.title}</h3>
          <p style={{fontFamily:FONT_BODY,fontSize:13,color:"rgba(251,190,180,.8)",lineHeight:1.6,marginBottom:14}}>{p.desc}</p>
          <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:18}}>
            {p.tags.map(t => <Tag key={t.label} label={t.label} cat={t.cat}/>)}
          </div>
          <button onClick={(e)=>{e.stopPropagation();navigate&&navigate(`projet-${p.id}`)}} style={{display:"inline-flex",alignItems:"center",gap:8,fontFamily:FONT_BODY,fontSize:11,letterSpacing:2.5,textTransform:"uppercase",fontWeight:700,color:p.accent,borderBottom:`1px solid ${p.accent}50`,paddingBottom:2,background:"transparent",border:"none"}}>
            Voir le projet <span style={{animation:"arrowBounce 1.5s ease infinite"}}>→</span>
          </button>
        </div>
      </div>
      <CornerOrnaments color={p.accent}/>
    </div>
  );
}

// ─── DRAG CAROUSEL ────────────────────────────────────────────────────────────
function DragCarousel({ items, isMobile }) {
  const trackRef = useRef(null);
  const drag = useRef({on:false, startX:0, scrollStart:0, vel:0, lastX:0});
  const raf  = useRef(null);

  const down = (e) => {
    const x = e.touches?.[0]?.pageX ?? e.pageX;
    drag.current = {on:true, startX:x, scrollStart:trackRef.current.scrollLeft, vel:0, lastX:x};
    trackRef.current.classList.add("dragging");
    cancelAnimationFrame(raf.current);
  };
  const move = (e) => {
    if (!drag.current.on) return;
    if (!e.touches) e.preventDefault();
    const x = e.touches?.[0]?.pageX ?? e.pageX;
    drag.current.vel = x - drag.current.lastX;
    drag.current.lastX = x;
    trackRef.current.scrollLeft = drag.current.scrollStart - (x - drag.current.startX);
  };
  const up = () => {
    if (!drag.current.on) return;
    drag.current.on = false;
    trackRef.current.classList.remove("dragging");
    const glide = () => {
      if (Math.abs(drag.current.vel) < .4) return;
      trackRef.current.scrollLeft -= drag.current.vel * .91;
      drag.current.vel *= .91;
      raf.current = requestAnimationFrame(glide);
    };
    raf.current = requestAnimationFrame(glide);
  };

  return (
    <div style={{position:"relative"}}>
      {!isMobile && <>
        <div style={{position:"absolute",top:0,bottom:0,left:0,width:80,zIndex:2,background:`linear-gradient(to right,${C.bg},transparent)`,pointerEvents:"none"}}/>
        <div style={{position:"absolute",top:0,bottom:0,right:0,width:80,zIndex:2,background:`linear-gradient(to left,${C.bg},transparent)`,pointerEvents:"none"}}/>
      </>}
      <div style={{position:"absolute",bottom:-8,left:"50%",transform:"translateX(-50%)",fontFamily:FONT_BODY,fontSize:10,letterSpacing:2,color:"rgba(212,165,116,.45)",textTransform:"uppercase",fontWeight:600,zIndex:3,whiteSpace:"nowrap"}}>
        ← glisse pour explorer →
      </div>
      <div ref={trackRef} className="carousel-track"
        onMouseDown={down} onMouseMove={move} onMouseUp={up} onMouseLeave={up}
        onTouchStart={down} onTouchMove={move} onTouchEnd={up}
        style={{paddingLeft:isMobile?16:64, paddingRight:isMobile?16:64}}
      >
        {items.map((item,i) => <CarouselCard key={item.id} item={item} index={i} isMobile={isMobile}/>)}
        <div style={{minWidth:4,flexShrink:0}}/>
      </div>
    </div>
  );
}

function CarouselCard({ item, index, isMobile }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => !isMobile && setHovered(true)}
      onMouseLeave={() => !isMobile && setHovered(false)}
      style={{
        minWidth:isMobile?240:280, height:isMobile?300:340,
        background:C.indigo,
        border:`1px solid ${hovered?item.accent+"55":"rgba(212,165,116,.15)"}`,
        borderRadius:8, display:"flex", flexDirection:"column", justifyContent:"space-between",
        position:"relative", overflow:"hidden", cursor:"pointer", flexShrink:0,
        transform:hovered?"translateY(-6px) scale(1.02)":"translateY(0) scale(1)",
        boxShadow:hovered?`0 16px 48px rgba(0,0,0,.5),0 0 24px ${item.accent}20`:"0 4px 16px rgba(0,0,0,.3)",
        transition:"all .3s cubic-bezier(.4,0,.2,1)",
        animation:`fadeUp .6s ${index*60}ms ease both`,
      }}
    >
      <div style={{position:"absolute",inset:0,backgroundImage:`url(${item.image})`,backgroundSize:"cover",backgroundPosition:"center",filter:"brightness(.35) saturate(.6)",transition:"filter .3s"}}/>
      <div style={{position:"absolute",inset:0,background:"linear-gradient(180deg,rgba(26,31,56,.3) 0%,rgba(11,13,26,.95) 65%)"}}/>
      {hovered && <div style={{position:"absolute",top:-40,right:-40,width:180,height:180,background:`radial-gradient(circle,${item.accent}20 0%,transparent 70%)`,pointerEvents:"none"}}/>}
      <CornerOrnaments color={item.accent}/>
      <div style={{position:"relative",zIndex:2,display:"flex",flexDirection:"column",justifyContent:"space-between",height:"100%",padding:20}}>
        <div>
          <div style={{fontFamily:FONT_BODY,fontSize:9,letterSpacing:2.5,color:item.accent,textTransform:"uppercase",fontWeight:700,marginBottom:10}}>{item.category} · {item.year}</div>
          <h3 style={{fontFamily:FONT_DISPLAY,fontSize:22,fontWeight:400,color:C.peach,fontStyle:"italic",lineHeight:1.15}}>{item.title}</h3>
        </div>
        <div>
          <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:14}}>
            {item.tags.map(t=><Tag key={t.label} label={t.label} cat={t.cat}/>)}
          </div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingTop:14,borderTop:`1px solid ${item.accent}25`}}>
            <span style={{fontFamily:FONT_BODY,fontSize:10,letterSpacing:2,color:"rgba(251,190,180,.5)",textTransform:"uppercase",fontWeight:600}}>Voir le projet</span>
            <span style={{color:item.accent,fontSize:18,transform:hovered?"translateX(4px)":"translateX(0)",transition:"transform .2s"}}>→</span>
          </div>
        </div>
      </div>
    </div>
  );
}
