import { useState, useRef, useEffect } from "react";
import { deleteStorageFile } from "./firebase";

// ═══════════════════════════════════════════════════════════════
// STATIC BASES (used in Avatar lookup – always present)
// ═══════════════════════════════════════════════════════════════
const BASES_STATIC = [
  { id:1, name:"HQ – Johannesburg",  short:"JHB", color:"#00C9FF" },
  { id:2, name:"Cape Town Base",      short:"CPT", color:"#FF6B6B" },
  { id:3, name:"Durban Base",         short:"DBN", color:"#FBBF24" },
  { id:4, name:"Pretoria Base",       short:"PTA", color:"#A78BFA" },
  { id:5, name:"Port Elizabeth Base", short:"PE",  color:"#34D399" },
  { id:6, name:"Bloemfontein Base",   short:"BFN", color:"#F97316" },
  { id:7, name:"East London Base",    short:"EL",  color:"#EC4899" },
  { id:8, name:"Polokwane Base",      short:"PLK", color:"#EF4444" },
];

// ═══════════════════════════════════════════════════════════════
// SEED DATA
// ═══════════════════════════════════════════════════════════════
const td = new Date();
const d = (off,h=10,m=0)=>{ const x=new Date(td); x.setDate(x.getDate()+off); x.setHours(h,m,0,0); return x.toISOString(); };

const EVENTS_INIT = [
  { id:1,  baseId:1, title:"Annual Strategy Summit",    description:"Full-day leadership alignment session covering Q3/Q4 objectives, budget reviews and departmental presentations.", date:d(1,9),  endDate:d(1,17),  venue:"Conference Hall A, JHB HQ",           type:"Conference",   invited:["All Management","Department Heads"], media:{type:"image",url:"https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80"}, color:"#00C9FF" },
  { id:2,  baseId:2, title:"Cape Town Client Showcase", description:"Quarterly showcase for premium clients. Product demos, networking lunch, and keynote from regional director.",   date:d(2,14), endDate:d(2,18),  venue:"V&A Waterfront Convention Centre",      type:"Client Event", invited:["Sales Team","Key Clients"],           media:{type:"image",url:"https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&q=80"}, color:"#FF6B6B" },
  { id:3,  baseId:3, title:"Durban Team Building",      description:"Outdoor adventure team building at uShaka Marine World. Surfing lessons and beach relay races.",                 date:d(3,8),  endDate:d(3,16),  venue:"uShaka Marine World, Durban",           type:"Team Building",invited:["All Durban Staff"],              media:{type:"image",url:"https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80"}, color:"#FBBF24" },
  { id:4,  baseId:4, title:"Pretoria HR Workshop",      description:"Mandatory HR compliance training covering updated labour laws, workplace safety and diversity & inclusion.",      date:d(4,9),  endDate:d(4,13),  venue:"Training Room 2, Pretoria Base",        type:"Workshop",     invited:["All PTA Staff"],                  media:{type:"image",url:"https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80"}, color:"#A78BFA" },
  { id:5,  baseId:1, title:"Product Launch – NexGen",   description:"Official launch of our next-generation platform. Press conference, live demo and cocktail reception.",           date:d(5,18), endDate:d(5,21),  venue:"Sandton Convention Centre",             type:"Launch",       invited:["All Staff","Press","Partners"],       media:{type:"image",url:"https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&q=80"}, color:"#34D399" },
  { id:6,  baseId:5, title:"PE Regional Meeting",       description:"Bi-annual regional operations meeting. Performance review, KPI tracking and 6-month forecast.",                  date:d(6,10), endDate:d(6,15),  venue:"Board Room, PE Base",                   type:"Meeting",      invited:["Regional Managers"],                 media:{type:"image",url:"https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&q=80"}, color:"#F97316" },
  { id:7,  baseId:6, title:"Bloemfontein Staff Gala",   description:"Annual staff appreciation gala. Awards ceremony, dinner and live entertainment.",                                date:d(22,19),endDate:d(22,23), venue:"Bloem Show Grounds, Grand Hall",         type:"Gala",         invited:["All BFN Staff","Spouses Welcome"],    media:{type:"image",url:"https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80"}, color:"#EC4899" },
  { id:8,  baseId:7, title:"East London Safety Drill",  description:"Mandatory annual fire and emergency safety drill. All staff must attend. Evacuation routes will be tested.",     date:d(28,7), endDate:d(28,9),  venue:"EL Base – All Floors",                  type:"Mandatory",    invited:["All EL Staff"],                      media:{type:"image",url:"https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80"}, color:"#EF4444" },
  { id:9,  baseId:2, title:"CPT Innovation Day",        description:"Innovation pitches, hackathon and awards for best new ideas from staff.",                                         date:d(35,9), endDate:d(35,17), venue:"Cape Town Base – Open Floor",            type:"Conference",   invited:["All CPT Staff"],                     media:{type:"image",url:"https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=80"}, color:"#FF6B6B" },
  { id:10, baseId:8, title:"Polokwane Wellness Day",    description:"Company wellness day with health screenings, yoga sessions and motivational talks.",                              date:d(50,8), endDate:d(50,15), venue:"PLK Base Grounds",                       type:"Wellness",     invited:["All PLK Staff"],                     media:{type:"image",url:"https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80"}, color:"#EF4444" },
];

const ANNOUNCEMENTS_INIT = [
  { id:1, baseId:1, title:"Parking Bay Changes from Monday",    body:"New parking allocations effective Monday. Collect your new bay sticker from reception.",   time:"2 hours ago", urgent:true  },
  { id:2, baseId:2, title:"Office Closure – Friday Afternoon",  body:"CPT office closes 13:00 this Friday for deep cleaning. Remote work approved.",             time:"4 hours ago", urgent:false },
  { id:3, baseId:3, title:"Canteen Menu Updated",                body:"New healthy meal options now available. See updated menu on the noticeboard.",             time:"Yesterday",   urgent:false },
  { id:4, baseId:1, title:"IT Maintenance Tonight 22:00–02:00", body:"Core systems offline for scheduled maintenance. Save all work before 21:30.",              time:"1 hour ago",  urgent:true  },
  { id:5, baseId:4, title:"New Access Cards Ready",              body:"Updated access cards for PTA base ready for collection at reception.",                     time:"3 hours ago", urgent:false },
];

const USERS_INIT = [
  { id:1, name:"Admin User",     forceNumber:"00000001", password:"admin123", role:"admin", baseId:1, avatar:null, firstLogin:false },
  { id:2, name:"Thabo Nkosi",    forceNumber:"13008976", password:"OTP12345", role:"user",  baseId:1, avatar:null, firstLogin:true  },
  { id:3, name:"Zanele Dlamini", forceNumber:"13009012", password:"OTP67890", role:"user",  baseId:2, avatar:null, firstLogin:true  },
  { id:4, name:"Sipho Mthembu",  forceNumber:"13011234", password:"OTP11111", role:"user",  baseId:3, avatar:null, firstLogin:false },
];

const BASES_INIT = [
  { id:1, name:"HQ – Johannesburg",  short:"JHB", color:"#00C9FF" },
  { id:2, name:"Cape Town Base",      short:"CPT", color:"#FF6B6B" },
  { id:3, name:"Durban Base",         short:"DBN", color:"#FBBF24" },
  { id:4, name:"Pretoria Base",       short:"PTA", color:"#A78BFA" },
  { id:5, name:"Port Elizabeth Base", short:"PE",  color:"#34D399" },
  { id:6, name:"Bloemfontein Base",   short:"BFN", color:"#F97316" },
  { id:7, name:"East London Base",    short:"EL",  color:"#EC4899" },
  { id:8, name:"Polokwane Base",      short:"PLK", color:"#EF4444" },
];

const NEWS_INIT = [
  { id:1, title:"Strategy Summit Recap",              body:"The Annual Strategy Summit was a resounding success. Over 200 leaders aligned on Q3/Q4 goals, with key decisions on budget allocations and new departmental structures.", image:"https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80", baseId:1, date:new Date(Date.now()-2*86400000).toISOString(), author:"Admin User", published:true },
  { id:2, title:"Product Launch Highlights",          body:"The NexGen Platform launch exceeded all expectations. Media coverage, live demos and client feedback were overwhelmingly positive.",                                       image:"https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&q=80", baseId:1, date:new Date(Date.now()-5*86400000).toISOString(), author:"Admin User", published:true },
  { id:3, title:"Cape Town Team Wins Innovation Award",body:"Our CPT team took home gold at the regional innovation awards. Congratulations to everyone involved!",                                                                   image:"https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&q=80", baseId:2, date:new Date(Date.now()-8*86400000).toISOString(), author:"Admin User", published:true },
];

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════
const fmtDate  = iso => new Date(iso).toLocaleDateString("en-ZA",{weekday:"short",day:"numeric",month:"short",year:"numeric"});
const fmtTime  = iso => new Date(iso).toLocaleTimeString("en-ZA",{hour:"2-digit",minute:"2-digit"});
const within2Mo= iso => { const diff=(new Date(iso)-new Date())/86400000; return diff>=0&&diff<=60; };
const next2Wk  = iso => { const diff=(new Date(iso)-new Date())/86400000; return diff>=0&&diff<=14; };
const initials = n   => (n||"?").split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();

// ═══════════════════════════════════════════════════════════════
// DESIGN TOKENS
// ═══════════════════════════════════════════════════════════════
const G = {
  bg:"#070B14", surface:"#0D1220", card:"#111827",
  border:"#1A2540", borderHov:"#2A3A5C",
  accent:"#00C9FF", accent2:"#FF6B6B", gold:"#FBBF24",
  text:"#E8EDF5", muted:"#5A6A8A", mutedL:"#8899BB",
  ok:"#34D399", danger:"#EF4444", purple:"#A78BFA",
};

// ═══════════════════════════════════════════════════════════════
// GLOBAL CSS
// ═══════════════════════════════════════════════════════════════
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
html{overflow-x:hidden;max-width:100vw;}
body{background:${G.bg};color:${G.text};font-family:'DM Sans',sans-serif;min-height:100vh;overflow-x:hidden;max-width:100vw;}
::-webkit-scrollbar{width:4px;height:4px;}
::-webkit-scrollbar-track{background:transparent;}
::-webkit-scrollbar-thumb{background:${G.border};border-radius:4px;}

@keyframes shimmer{0%{background-position:-400% 0}100%{background-position:400% 0}}
@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes scaleIn{from{opacity:0;transform:scale(.94)}to{opacity:1;transform:scale(1)}}
@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(1.5)}}
@keyframes floatY{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes tickerMove{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
@keyframes expandDown{from{opacity:0;max-height:0}to{opacity:1;max-height:600px}}

.shimmer{background:linear-gradient(90deg,transparent,rgba(255,255,255,.035),transparent);background-size:400% 100%;animation:shimmer 3s infinite;}
.fade-up{animation:fadeUp .4s ease forwards;}
.fade-in{animation:fadeIn .3s ease forwards;}
.scale-in{animation:scaleIn .25s cubic-bezier(.25,.8,.25,1) forwards;}
.glass{background:rgba(13,18,32,.78);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);border:1px solid rgba(255,255,255,.06);}
.pulse-dot{width:8px;height:8px;border-radius:50%;background:${G.danger};animation:pulse 1.5s ease infinite;flex-shrink:0;}
.expand-down{animation:expandDown .3s ease forwards;overflow:hidden;}

.h-card{transition:transform .32s cubic-bezier(.25,.8,.25,1),box-shadow .32s ease,border-color .25s;cursor:pointer;}
.h-card:hover{transform:translateY(-8px) scale(1.016);box-shadow:0 30px 70px rgba(0,0,0,.6),0 0 0 1px rgba(0,201,255,.22);border-color:rgba(0,201,255,.24)!important;}
.h-row{transition:background .2s,border-color .2s,transform .2s;cursor:pointer;}
.h-row:hover{background:rgba(0,201,255,.05)!important;border-color:rgba(0,201,255,.18)!important;transform:translateX(3px);}
.h-stat{transition:all .25s ease;cursor:pointer;}
.h-stat:hover{transform:translateY(-5px);box-shadow:0 18px 44px rgba(0,0,0,.45);border-color:rgba(255,255,255,.1)!important;}

.btn{display:inline-flex;align-items:center;gap:7px;padding:10px 20px;border-radius:10px;border:none;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:600;cursor:pointer;transition:all .2s;white-space:nowrap;}
.btn:disabled{opacity:.5;cursor:not-allowed;}
.btn-p{background:linear-gradient(135deg,#00C9FF,#007ACC);color:#fff;box-shadow:0 4px 20px rgba(0,201,255,.25);}
.btn-p:hover:not(:disabled){opacity:.9;transform:translateY(-1px);box-shadow:0 8px 30px rgba(0,201,255,.4);}
.btn-d{background:rgba(239,68,68,.1);color:${G.danger};border:1px solid rgba(239,68,68,.24);}
.btn-d:hover{background:rgba(239,68,68,.22);}
.btn-g{background:rgba(255,255,255,.04);color:${G.text};border:1px solid ${G.border};}
.btn-g:hover{background:rgba(255,255,255,.09);border-color:${G.borderHov};}
.btn-gold{background:rgba(251,191,36,.1);color:${G.gold};border:1px solid rgba(251,191,36,.24);}
.btn-gold:hover{background:rgba(251,191,36,.22);}
.btn-sm{padding:6px 13px;font-size:12px;}

.ntab{padding:8px 14px;border-radius:9px;font-size:13px;font-weight:500;cursor:pointer;transition:all .2s;border:none;background:transparent;color:${G.muted};white-space:nowrap;font-family:'DM Sans',sans-serif;}
.ntab.on{background:rgba(0,201,255,.12);color:${G.accent};font-weight:600;}
.ntab:hover:not(.on){color:${G.text};background:rgba(255,255,255,.05);}

input,textarea,select{background:rgba(255,255,255,.04);border:1px solid ${G.border};color:${G.text};border-radius:10px;padding:11px 14px;font-family:'DM Sans',sans-serif;font-size:14px;width:100%;outline:none;transition:border-color .2s,background .2s;}
input::placeholder,textarea::placeholder{color:${G.muted};}
input:focus,textarea:focus,select:focus{border-color:${G.accent};background:rgba(0,201,255,.04);}
select option{background:${G.surface};}
textarea{resize:vertical;}
label{font-size:11px;color:${G.muted};display:block;margin-bottom:5px;font-weight:500;}

.badge{display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;white-space:nowrap;}

.overlay{position:fixed;inset:0;background:rgba(0,0,0,.82);backdrop-filter:blur(10px);z-index:2000;display:flex;align-items:center;justify-content:center;padding:16px;}
.modal{background:${G.card};border:1px solid ${G.border};border-radius:22px;padding:28px;width:100%;max-width:600px;max-height:92vh;overflow-y:auto;animation:scaleIn .25s ease;}

.cday{aspect-ratio:1;display:flex;flex-direction:column;align-items:center;justify-content:center;border-radius:9px;font-size:13px;cursor:pointer;position:relative;transition:background .15s;}
.cday:hover:not(.emp){background:rgba(255,255,255,.07);}
.cday.tod{background:rgba(0,201,255,.18);color:${G.accent};font-weight:700;}
.cday.sel{background:rgba(0,201,255,.22);color:${G.accent};font-weight:700;border:1px solid rgba(0,201,255,.38);}
.cday.hev::after{content:'';position:absolute;bottom:3px;width:4px;height:4px;border-radius:50%;background:${G.accent};}
.cday.oth{color:${G.muted};opacity:.35;}
.cday.emp{cursor:default;}

.star{background:none;border:none;cursor:pointer;font-size:19px;transition:transform .2s;padding:4px;line-height:1;flex-shrink:0;}
.star:hover{transform:scale(1.35);}

.chips{display:flex;gap:8px;overflow-x:auto;padding-bottom:4px;}
.chips::-webkit-scrollbar{display:none;}
.chip{padding:6px 14px;border-radius:20px;font-size:12px;font-weight:600;cursor:pointer;border:1px solid ${G.border};background:rgba(255,255,255,.04);color:${G.muted};transition:all .2s;white-space:nowrap;}
.chip.on{border-color:var(--cc,${G.accent});background:rgba(0,201,255,.08);color:var(--cc,${G.accent});}
.chip:hover:not(.on){color:${G.text};background:rgba(255,255,255,.08);}

.ticker-wrap{overflow:hidden;border-top:1px solid ${G.border};border-bottom:1px solid ${G.border};background:rgba(0,201,255,.04);padding:9px 0;}
.ticker-inner{display:flex;width:max-content;animation:tickerMove 30s linear infinite;}
.ticker-inner:hover{animation-play-state:paused;}
.ticker-item{display:flex;align-items:center;gap:8px;padding:0 40px;font-size:13px;white-space:nowrap;color:${G.mutedL};}
.ticker-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0;}

.aside-item{display:flex;align-items:center;gap:10px;padding:11px 16px;border-radius:11px;cursor:pointer;font-size:14px;font-weight:500;color:${G.muted};transition:all .2s;border:1px solid transparent;}
.aside-item:hover{background:rgba(255,255,255,.05);color:${G.text};}
.aside-item.on{background:rgba(0,201,255,.1);color:${G.accent};border-color:rgba(0,201,255,.2);font-weight:600;}

/* ── Responsive helpers ── */
.row-wrap{display:flex;flex-wrap:wrap;gap:12px;}
.row-wrap>*{flex:1;min-width:140px;}
.card-text{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:100%;}
.card-body{min-width:0;flex:1;overflow:hidden;}

/* ── Upload zone ── */
.upload-zone{border-radius:14px;overflow:hidden;border:2px dashed ${G.border};cursor:pointer;min-height:130px;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,.02);transition:border-color .2s;}
.upload-zone:hover{border-color:${G.accent};}

.orb{position:absolute;border-radius:50%;filter:blur(80px);pointer-events:none;}

/* ── Swipe scroll ── */
.swipe-scroll{display:flex;gap:14px;overflow-x:auto;padding-bottom:8px;scroll-snap-type:x mandatory;}
.swipe-scroll::-webkit-scrollbar{display:none;}
.swipe-scroll>*{scroll-snap-align:start;flex-shrink:0;}

/* ── News card ── */
.news-card{background:${G.card};border-radius:18px;overflow:hidden;border:1px solid ${G.border};transition:transform .3s,box-shadow .3s,border-color .25s;}
.news-card:hover{transform:translateY(-5px);box-shadow:0 20px 50px rgba(0,0,0,.5);border-color:rgba(0,201,255,.2);}

/* ── Mobile tweaks ── */
@media(max-width:640px){
  .modal{padding:20px;border-radius:18px;}
  .hide-mobile{display:none!important;}
  .admin-layout{flex-direction:column!important;}
  .admin-sidebar{width:100%!important;position:static!important;}
  .aside-item{padding:9px 12px;font-size:13px;}
  .swipe-scroll>*{width:260px;}
}

/* ── Scroll-snap carousel ── */
.carousel-wrap{position:relative;width:100%;max-width:100%;overflow-x:clip;overflow-y:visible;}
.carousel-track{display:flex;gap:18px;overflow-x:scroll;overflow-y:hidden;scroll-snap-type:x mandatory;scroll-behavior:smooth;-webkit-overflow-scrolling:touch;padding-bottom:4px;width:100%;}
.carousel-track::-webkit-scrollbar{display:none;height:0;}
.carousel-track>*{scroll-snap-align:start;flex-shrink:0;}
.carousel-edge-left{pointer-events:none;position:absolute;left:0;top:0;bottom:4px;width:40px;background:linear-gradient(to right,#070B14 0%,transparent 100%);z-index:2;}
.carousel-edge-right{pointer-events:none;position:absolute;right:0;top:0;bottom:4px;width:60px;background:linear-gradient(to left,#070B14 0%,transparent 100%);z-index:2;}
.carousel-dots{display:flex;gap:6px;justify-content:center;margin-top:14px;}
.carousel-dot{width:6px;height:6px;border-radius:50%;background:#1A2540;transition:all .25s ease;cursor:pointer;}
.carousel-dot.on{width:20px;border-radius:3px;background:#00C9FF;}

/* ── Slide-up modal variant ── */
@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:none}}
.ann-modal{background:#111827;border:1px solid #1A2540;border-radius:20px;padding:26px;width:100%;max-width:520px;max-height:88vh;overflow-y:auto;animation:slideUp .28s ease;}

/* ── Overview widget grid ── */
.overview-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12;width:100%;box-sizing:border-box;}
@media(min-width:640px){.overview-grid{grid-template-columns:repeat(3,1fr);}}
@media(min-width:900px){.overview-grid{grid-template-columns:repeat(5,1fr);}}
`;

// ═══════════════════════════════════════════════════════════════
// SHARED COMPONENTS
// ═══════════════════════════════════════════════════════════════
function Avatar({ user, size=38, bases }) {
  const allBases = bases || BASES_STATIC;
  const base = allBases.find(b=>b.id===user?.baseId);
  const color = base?.color||G.accent;
  return (
    <div style={{width:size,height:size,borderRadius:Math.round(size*.28),overflow:"hidden",flexShrink:0,border:`2px solid ${color}44`,background:`linear-gradient(135deg,${color}1A,${color}0D)`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:size*.34,color,fontFamily:"Syne,sans-serif"}}>
      {user?.avatar?<img src={user.avatar} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:initials(user?.name)}
    </div>
  );
}

function SectionHeader({ title, subtitle, action, actionLabel }) {
  return (
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20,flexWrap:"wrap",gap:10}}>
      <div>
        <h2 style={{fontFamily:"Syne",fontSize:22,fontWeight:800,marginBottom:4,lineHeight:1.2}}>{title}</h2>
        {subtitle&&<p style={{color:G.muted,fontSize:13}}>{subtitle}</p>}
      </div>
      {action&&<button className="btn btn-p btn-sm" onClick={action}>{actionLabel}</button>}
    </div>
  );
}

function UploadZone({ preview, mediaType, onUpload, accept="image/*,video/*", label="📁 Click or drag to upload photo/video", hint="JPG, PNG, MP4, MOV — HD/4K supported", progress=0, uploading=false }) {
  const ref = useRef();
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = e => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (!file) return;
    // Synthesise a fake event so the existing handler signature works
    onUpload({ target: { files: [file] } });
  };

  return (
    <div>
      <div
        className="upload-zone"
        onClick={() => ref.current.click()}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        style={{ borderColor: dragOver ? G.accent : undefined, background: dragOver ? "rgba(0,201,255,0.06)" : undefined }}
      >
        {preview
          ? (mediaType === "video"
              ? <video src={preview} style={{ width:"100%", height:180, objectFit:"cover" }} controls onClick={e => e.stopPropagation()}/>
              : <img src={preview} alt="" style={{ width:"100%", height:180, objectFit:"cover" }}/>)
          : <div style={{ textAlign:"center", color:G.muted, padding:24 }}>
              <div style={{ fontSize:32, marginBottom:8 }}>📁</div>
              <div style={{ fontSize:13, fontWeight:600, marginBottom:4 }}>{label}</div>
              <div style={{ fontSize:11 }}>{hint}</div>
              {dragOver && <div style={{ fontSize:12, color:G.accent, marginTop:8, fontWeight:700 }}>Drop to upload</div>}
            </div>}
        <input ref={ref} type="file" accept={accept} style={{ display:"none" }} onChange={onUpload}/>
      </div>

      {/* Upload progress bar */}
      {uploading && (
        <div style={{ marginTop:8 }}>
          <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:G.muted, marginBottom:4 }}>
            <span>Uploading…</span><span>{progress}%</span>
          </div>
          <div style={{ height:4, background:G.border, borderRadius:2, overflow:"hidden" }}>
            <div style={{ height:"100%", width:`${progress}%`, background:`linear-gradient(90deg,${G.accent},#007ACC)`, borderRadius:2, transition:"width .2s" }}/>
          </div>
        </div>
      )}

      {preview && !uploading && (
        <div style={{ display:"flex", gap:8, marginTop:8, alignItems:"center" }}>
          <span style={{ fontSize:12, color:G.ok }}>✓ {mediaType === "video" ? "Video" : "Image"} uploaded</span>
          <button className="btn btn-g btn-sm" onClick={e => { e.stopPropagation(); ref.current.click(); }}>Replace</button>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// CAROUSEL — horizontal scroll-snap with dots + edge fade
// ═══════════════════════════════════════════════════════════════
function Carousel({ items, renderItem, cardWidth=300 }) {
  const trackRef = useRef();
  const [active, setActive] = useState(0);

  // Update active dot on scroll
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const onScroll = () => {
      const idx = Math.round(el.scrollLeft / (cardWidth + 18));
      setActive(Math.min(idx, items.length - 1));
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [items.length, cardWidth]);

  const goTo = i => {
    trackRef.current?.scrollTo({ left: i * (cardWidth + 18), behavior: "smooth" });
    setActive(i);
  };

  return (
    <div>
      <div className="carousel-wrap">
        <div className="carousel-edge-left"/>
        <div className="carousel-track" ref={trackRef}>
          {items.map((item, i) => (
            <div key={i} style={{ width: cardWidth }}>
              {renderItem(item, i)}
            </div>
          ))}
          {/* Peek spacer so last card doesn't hug the edge */}
          <div style={{ width: 20, flexShrink: 0 }}/>
        </div>
        <div className="carousel-edge-right"/>
      </div>
      {items.length > 1 && (
        <div className="carousel-dots">
          {items.map((_, i) => (
            <div key={i} className={`carousel-dot${active === i ? " on" : ""}`} onClick={() => goTo(i)}/>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// NEWS MODAL — full-view popup for a news post
// ═══════════════════════════════════════════════════════════════
function NewsModal({ post, bases, onClose }) {
  if (!post) return null;
  const base = bases.find(b => b.id === post.baseId);
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal scale-in" style={{ maxWidth: 640 }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
          <button className="btn btn-g btn-sm" onClick={onClose}>✕ Close</button>
        </div>
        {post.image && (
          <img src={post.image} alt={post.title}
            style={{ width: "100%", height: 220, objectFit: "cover", borderRadius: 14, marginBottom: 18 }}/>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
          <span className="badge" style={{ background: "rgba(52,211,153,.12)", color: G.ok, border: "1px solid rgba(52,211,153,.25)" }}>📰 News</span>
          {base && <span className="badge" style={{ background: `${base.color}18`, color: base.color, border: `1px solid ${base.color}30` }}>{base.short}</span>}
        </div>
        <h2 style={{ fontFamily: "Syne", fontSize: 22, fontWeight: 800, marginBottom: 10, lineHeight: 1.25 }}>{post.title}</h2>
        <p style={{ color: G.muted, lineHeight: 1.8, fontSize: 14, marginBottom: 16 }}>{post.body}</p>
        <div style={{ fontSize: 12, color: G.mutedL, borderTop: `1px solid ${G.border}`, paddingTop: 12 }}>
          {fmtDate(post.date)} · {post.author}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ANNOUNCEMENT MODAL — popup for a single notification
// ═══════════════════════════════════════════════════════════════
function AnnouncementModal({ ann, bases, onClose }) {
  if (!ann) return null;
  const base = bases.find(b => b.id === ann.baseId);
  return (
    <div className="overlay" onClick={onClose}>
      <div className="ann-modal" onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {ann.urgent && <div className="pulse-dot"/>}
            <span className="badge" style={{ background: ann.urgent ? "rgba(239,68,68,.12)" : "rgba(0,201,255,.1)", color: ann.urgent ? G.danger : G.accent, border: `1px solid ${ann.urgent ? "rgba(239,68,68,.3)" : "rgba(0,201,255,.25)"}` }}>
              {ann.urgent ? "🚨 Urgent" : "🔔 Notice"}
            </span>
            {base && <span className="badge" style={{ background: `${base.color}18`, color: base.color, border: `1px solid ${base.color}30` }}>{base.short}</span>}
          </div>
          <button className="btn btn-g btn-sm" onClick={onClose}>✕</button>
        </div>
        <h3 style={{ fontFamily: "Syne", fontSize: 19, fontWeight: 800, marginBottom: 12, lineHeight: 1.3 }}>{ann.title}</h3>
        <p style={{ color: G.muted, lineHeight: 1.8, fontSize: 14, marginBottom: 16 }}>{ann.body}</p>
        <div style={{ fontSize: 12, color: G.mutedL, borderTop: `1px solid ${G.border}`, paddingTop: 12 }}>
          {ann.time}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// EVENT CARD & MODAL
// ═══════════════════════════════════════════════════════════════
const TYPE_COLORS = {Conference:"#00C9FF","Client Event":"#FF6B6B","Team Building":"#FBBF24",Workshop:"#A78BFA",Launch:"#34D399",Meeting:"#F97316",Gala:"#EC4899",Mandatory:"#EF4444",Wellness:"#34D399"};

function EventCard({ ev, bases, onPin, pins, onClick }) {
  const base=bases.find(b=>b.id===ev.baseId);
  const pinned=pins.includes(ev.id);
  const color=TYPE_COLORS[ev.type]||ev.color||G.accent;
  return (
    <div className="h-card shimmer" style={{borderRadius:20,overflow:"hidden",background:`linear-gradient(160deg,${G.card},#0D1525)`,border:`1px solid ${G.border}`,boxShadow:"0 8px 40px rgba(0,0,0,.38),inset 0 1px 0 rgba(255,255,255,.04)"}}>
      <div style={{height:3,background:`linear-gradient(90deg,${color},transparent)`}}/>
      <div style={{height:188,overflow:"hidden",position:"relative",cursor:"pointer"}} onClick={()=>onClick(ev)}>
        {ev.media.type==="video"
          ?<video src={ev.media.url} style={{width:"100%",height:"100%",objectFit:"cover"}} muted/>
          :<img src={ev.media.url} alt={ev.title} style={{width:"100%",height:"100%",objectFit:"cover",transition:"transform .5s ease"}}
              onMouseOver={e=>e.target.style.transform="scale(1.08)"}
              onMouseOut={e=>e.target.style.transform="scale(1)"}/>}
        <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(7,11,20,.93),transparent 55%)"}}/>
        <span className="badge" style={{position:"absolute",bottom:10,left:12,background:`${color}22`,color,border:`1px solid ${color}44`}}>{ev.type}</span>
        <span style={{position:"absolute",top:10,left:12,background:"rgba(0,0,0,.55)",backdropFilter:"blur(8px)",borderRadius:7,padding:"3px 9px",fontSize:11,color:"#aabbcc",fontWeight:700}}>{base?.short}</span>
      </div>
      <div style={{padding:"14px 16px 16px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6,gap:8}}>
          <h3 onClick={()=>onClick(ev)} style={{fontFamily:"Syne",fontSize:15,fontWeight:700,lineHeight:1.3,flex:1,cursor:"pointer",overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>{ev.title}</h3>
          <button className="star" onClick={e=>{e.stopPropagation();onPin(ev.id);}}>{pinned?"⭐":"☆"}</button>
        </div>
        <p style={{fontSize:13,color:G.muted,marginBottom:12,lineHeight:1.6,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{ev.description}</p>
        <div style={{display:"flex",flexDirection:"column",gap:4}}>
          <div style={{fontSize:12,color:G.mutedL,display:"flex",gap:6,alignItems:"center"}}><span style={{flexShrink:0}}>📅</span><span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{fmtDate(ev.date)} · {fmtTime(ev.date)}</span></div>
          <div style={{fontSize:12,color:G.mutedL,display:"flex",gap:6,alignItems:"center"}}><span style={{flexShrink:0}}>📍</span><span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{ev.venue}</span></div>
        </div>
      </div>
    </div>
  );
}

function EventModal({ ev, bases, onClose, onPin, pins }) {
  if(!ev) return null;
  const base=bases.find(b=>b.id===ev.baseId);
  const pinned=pins.includes(ev.id);
  const color=TYPE_COLORS[ev.type]||ev.color||G.accent;
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" style={{maxWidth:680}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18,gap:10,flexWrap:"wrap"}}>
          <span className="badge" style={{background:`${color}22`,color,border:`1px solid ${color}44`}}>{ev.type}</span>
          <div style={{display:"flex",gap:8}}>
            <button className="star" onClick={()=>onPin(ev.id)}>{pinned?"⭐":"☆"}</button>
            <button className="btn btn-g btn-sm" onClick={onClose}>✕ Close</button>
          </div>
        </div>
        {ev.media.type==="video"
          ?<video src={ev.media.url} controls style={{width:"100%",height:220,objectFit:"cover",borderRadius:14,marginBottom:18}}/>
          :<img src={ev.media.url} alt={ev.title} style={{width:"100%",height:220,objectFit:"cover",borderRadius:14,marginBottom:18}}/>}
        <h2 style={{fontFamily:"Syne",fontSize:22,fontWeight:800,marginBottom:8,lineHeight:1.2}}>{ev.title}</h2>
        <p style={{color:G.muted,marginBottom:18,lineHeight:1.75,fontSize:14}}>{ev.description}</p>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:10,marginBottom:16}}>
          {[["📅 Date",fmtDate(ev.date)],["⏰ Time",`${fmtTime(ev.date)} – ${fmtTime(ev.endDate)}`],["📍 Venue",ev.venue],["🏢 Base",base?.name]].map(([l,v])=>(
            <div key={l} style={{background:"rgba(255,255,255,.03)",borderRadius:12,padding:"12px 14px",border:`1px solid ${G.border}`}}>
              <div style={{fontSize:11,color:G.muted,marginBottom:4}}>{l}</div>
              <div style={{fontSize:13,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{v}</div>
            </div>
          ))}
        </div>
        {ev.invited?.length>0&&(
          <div><div style={{fontSize:12,color:G.muted,marginBottom:8}}>👥 Invited</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
              {ev.invited.map(i=><span key={i} className="badge" style={{background:"rgba(255,255,255,.06)",color:G.text,border:`1px solid ${G.border}`}}>{i}</span>)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// TICKER
// ═══════════════════════════════════════════════════════════════
function Ticker({ events, bases }) {
  const items=events.filter(e=>next2Wk(e.date)).slice(0,12);
  if(!items.length) return null;
  const doubled=[...items,...items];
  return (
    <div className="ticker-wrap">
      <div className="ticker-inner">
        {doubled.map((e,i)=>{
          const base=bases.find(b=>b.id===e.baseId);
          return (
            <div key={i} className="ticker-item">
              <div className="ticker-dot" style={{background:e.color||G.accent}}/>
              <span style={{fontWeight:700,color:G.text}}>{e.title}</span>
              <span>·</span><span>{base?.short}</span>
              <span>·</span><span>{fmtDate(e.date)}</span>
              <span style={{color:G.border,marginLeft:20}}>|</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// BASE PICKER MODAL
// ═══════════════════════════════════════════════════════════════
function BasePickerModal({ bases, onSelect, onClose }) {
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal scale-in" style={{maxWidth:500}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <h3 style={{fontFamily:"Syne",fontWeight:800,fontSize:20}}>🏢 Select a Base</h3>
          <button className="btn btn-g btn-sm" onClick={onClose}>✕</button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:12}}>
          {bases.map(b=>(
            <div key={b.id} className="h-row" onClick={()=>onSelect(b)}
              style={{background:G.surface,borderRadius:14,padding:"14px 16px",border:`1px solid ${G.border}`,display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:38,height:38,borderRadius:11,background:`${b.color}16`,border:`1px solid ${b.color}30`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:11,color:b.color,fontFamily:"Syne,sans-serif",flexShrink:0}}>{b.short}</div>
              <div style={{minWidth:0}}>
                <div style={{fontWeight:700,fontSize:13,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{b.name}</div>
                <div style={{fontSize:11,color:G.muted}}>Base {b.id}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// CALENDAR
// ═══════════════════════════════════════════════════════════════
function CalendarView({ events, bases }) {
  const [cur,setCur]=useState(new Date());
  const [sel,setSel]=useState(null);
  const yr=cur.getFullYear(), mo=cur.getMonth();
  const fd=new Date(yr,mo,1).getDay(), dim=new Date(yr,mo+1,0).getDate(), pd=new Date(yr,mo,0).getDate();
  const cells=[];
  for(let i=fd-1;i>=0;i--) cells.push({day:pd-i,curr:false});
  for(let i=1;i<=dim;i++) cells.push({day:i,curr:true});
  while(cells.length<42) cells.push({day:cells.length-dim-fd+1,curr:false});
  const evDay=c=>!c.curr?[]:events.filter(e=>{const x=new Date(e.date);return x.getFullYear()===yr&&x.getMonth()===mo&&x.getDate()===c.day;});
  const isToday=c=>c.curr&&c.day===td.getDate()&&mo===td.getMonth()&&yr===td.getFullYear();
  return (
    <div className="fade-up">
      <div style={{background:G.card,borderRadius:20,padding:22,border:`1px solid ${G.border}`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
          <button className="btn btn-g btn-sm" onClick={()=>setCur(new Date(yr,mo-1,1))}>‹</button>
          <h3 style={{fontFamily:"Syne",fontWeight:800,fontSize:17}}>{cur.toLocaleDateString("en-ZA",{month:"long",year:"numeric"})}</h3>
          <button className="btn btn-g btn-sm" onClick={()=>setCur(new Date(yr,mo+1,1))}>›</button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3,marginBottom:6}}>
          {["Su","Mo","Tu","We","Th","Fr","Sa"].map(x=><div key={x} style={{textAlign:"center",fontSize:11,color:G.muted,fontWeight:700,padding:"4px 0"}}>{x}</div>)}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3}}>
          {cells.map((c,i)=>{
            const has=evDay(c).length>0, isSel=sel?.day===c.day&&c.curr;
            return <div key={i} className={`cday${isToday(c)?" tod":""}${isSel&&!isToday(c)?" sel":""}${has?" hev":""}${!c.curr?" oth":""}`} onClick={()=>c.curr&&setSel(c)}>{c.day}</div>;
          })}
        </div>
      </div>
      {sel&&(
        <div style={{marginTop:18}} className="expand-down">
          <h4 style={{fontFamily:"Syne",marginBottom:12,color:G.muted,fontSize:12,textTransform:"uppercase",letterSpacing:1}}>{sel.day} {cur.toLocaleDateString("en-ZA",{month:"long"})} {yr}</h4>
          {evDay(sel).length===0
            ?<p style={{color:G.muted,fontSize:14,padding:"12px 0"}}>No events this day.</p>
            :evDay(sel).map(e=>{
              const base=bases.find(b=>b.id===e.baseId);
              return (
                <div key={e.id} style={{background:G.card,borderRadius:13,padding:14,border:`1px solid ${G.border}`,borderLeft:`3px solid ${e.color||G.accent}`,marginBottom:10}}>
                  <div style={{fontWeight:700,marginBottom:3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{e.title}</div>
                  <div style={{fontSize:12,color:G.muted}}>{base?.name} · {fmtTime(e.date)}</div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// CHANGE PASSWORD
// ═══════════════════════════════════════════════════════════════
function ChangePwModal({ onSave }) {
  const [pw,setPw]=useState(""), [pw2,setPw2]=useState(""), [err,setErr]=useState("");
  const go=()=>{ if(pw.length<6){setErr("Minimum 6 characters.");return;} if(pw!==pw2){setErr("Passwords do not match.");return;} onSave(pw); };
  return (
    <div className="overlay">
      <div className="modal scale-in" style={{maxWidth:400}}>
        <div style={{textAlign:"center",marginBottom:24}}>
          <div style={{fontSize:44,marginBottom:12,display:"inline-block",animation:"floatY 3s ease infinite"}}>🔐</div>
          <h3 style={{fontFamily:"Syne",fontWeight:800,fontSize:22,marginBottom:6}}>Welcome!</h3>
          <p style={{color:G.muted,fontSize:14}}>You've logged in with an OTP. Please set a personal password to continue.</p>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <div><label>New Password</label><input type="password" placeholder="Minimum 6 characters" value={pw} onChange={e=>{setPw(e.target.value);setErr("");}} onKeyDown={e=>e.key==="Enter"&&go()}/></div>
          <div><label>Confirm Password</label><input type="password" placeholder="Repeat password" value={pw2} onChange={e=>{setPw2(e.target.value);setErr("");}} onKeyDown={e=>e.key==="Enter"&&go()}/></div>
          {err&&<p style={{color:G.danger,fontSize:13}}>{err}</p>}
          <button className="btn btn-p" style={{justifyContent:"center",padding:14,fontSize:15,marginTop:4}} onClick={go}>Set Password & Continue →</button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// PROFILE MODAL
// ═══════════════════════════════════════════════════════════════
function ProfileModal({ user, bases, onSave, onClose }) {
  const [name,setName]=useState(user.name);
  const [avatar,setAvatar]=useState(user.avatar);
  const [pw,setPw]=useState(""), [pw2,setPw2]=useState(""), [err,setErr]=useState("");
  const fileRef=useRef();
  const base=bases.find(b=>b.id===user.baseId);
  const handleImg=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>setAvatar(ev.target.result);r.readAsDataURL(f);};
  const save=()=>{ if(pw&&pw.length<6){setErr("Min 6 chars.");return;} if(pw&&pw!==pw2){setErr("Passwords don't match.");return;} onSave({...user,name,avatar,...(pw?{password:pw}:{})});};
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal scale-in" style={{maxWidth:440}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <h3 style={{fontFamily:"Syne",fontWeight:800,fontSize:20}}>My Profile</h3>
          <button className="btn btn-g btn-sm" onClick={onClose}>✕</button>
        </div>
        <div style={{textAlign:"center",marginBottom:20}}>
          <div style={{position:"relative",display:"inline-block"}}>
            <div style={{width:80,height:80,borderRadius:22,overflow:"hidden",background:`linear-gradient(135deg,${base?.color}22,${base?.color}0D)`,border:`2px solid ${base?.color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,fontFamily:"Syne",fontWeight:700,color:base?.color,margin:"0 auto"}}>
              {avatar?<img src={avatar} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:initials(name)}
            </div>
            <button onClick={()=>fileRef.current.click()} style={{position:"absolute",bottom:-4,right:-4,width:28,height:28,borderRadius:9,background:G.accent,border:"none",cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 2px 8px rgba(0,201,255,.4)"}}>📷</button>
            <input ref={fileRef} type="file" accept="image/*" capture="user" style={{display:"none"}} onChange={handleImg}/>
          </div>
          <p style={{fontSize:11,color:G.muted,marginTop:10}}>Tap 📷 to change photo (camera or gallery)</p>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <div><label>Full Name</label><input value={name} onChange={e=>setName(e.target.value)}/></div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <div><label>Force Number</label><input value={user.forceNumber} disabled style={{opacity:.45}}/></div>
            <div><label>Base</label><input value={base?.name||""} disabled style={{opacity:.45}}/></div>
          </div>
          <div style={{borderTop:`1px solid ${G.border}`,paddingTop:14}}>
            <div><label>New Password (blank = keep current)</label><input type="password" placeholder="New password" value={pw} onChange={e=>{setPw(e.target.value);setErr("");}}/></div>
          </div>
          <div><label>Confirm New Password</label><input type="password" placeholder="Confirm" value={pw2} onChange={e=>{setPw2(e.target.value);setErr("");}}/></div>
          {err&&<p style={{color:G.danger,fontSize:13}}>{err}</p>}
          <button className="btn btn-p" style={{justifyContent:"center",padding:13}} onClick={save}>Save Profile</button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ██  ADMIN SYSTEM  ██
// ═══════════════════════════════════════════════════════════════

function AdminLogin({ users, onLogin, onBack }) {
  const [fn,setFn]=useState(""), [pw,setPw]=useState(""), [err,setErr]=useState(""), [loading,setLoading]=useState(false);
  const go=()=>{
    if(!fn||!pw){setErr("Fill in all fields.");return;}
    setLoading(true);
    setTimeout(()=>{
      const u=users.find(u=>u.forceNumber===fn&&u.password===pw&&u.role==="admin");
      if(u) onLogin(u); else {setErr("Invalid credentials or not an admin account.");setLoading(false);}
    },800);
  };
  return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:20,background:G.bg,position:"relative",overflow:"hidden"}}>
      <div className="orb" style={{width:500,height:500,background:"radial-gradient(circle,rgba(255,107,107,.08),transparent 70%)",top:-150,left:-100}}/>
      <div className="orb" style={{width:350,height:350,background:"radial-gradient(circle,rgba(167,139,250,.08),transparent 70%)",bottom:-80,right:-60}}/>
      <div className="fade-up glass" style={{width:"100%",maxWidth:400,borderRadius:26,padding:"40px 34px"}}>
        <button onClick={onBack} style={{background:"none",border:"none",cursor:"pointer",color:G.muted,fontSize:13,marginBottom:20,display:"flex",alignItems:"center",gap:6}}>← Back to User Login</button>
        <div style={{textAlign:"center",marginBottom:30}}>
          <div style={{width:64,height:64,borderRadius:18,background:"linear-gradient(135deg,#FF6B6B,#A78BFA)",margin:"0 auto 14px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,boxShadow:"0 12px 36px rgba(255,107,107,.35)"}}>⚙️</div>
          <h1 style={{fontFamily:"Syne",fontSize:24,fontWeight:800,marginBottom:4}}>Admin Access</h1>
          <p style={{color:G.muted,fontSize:13}}>Restricted — Authorised Personnel Only</p>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div><label>Admin Force Number</label><input placeholder="8-digit force number" value={fn} maxLength={8} onChange={e=>{setFn(e.target.value.replace(/\D/g,""));setErr("");}} onKeyDown={e=>e.key==="Enter"&&go()}/></div>
          <div><label>Password</label><input type="password" placeholder="Admin password" value={pw} onChange={e=>{setPw(e.target.value);setErr("");}} onKeyDown={e=>e.key==="Enter"&&go()}/></div>
          {err&&<p style={{color:G.danger,fontSize:13,textAlign:"center"}}>{err}</p>}
          <button className="btn btn-p" onClick={go} disabled={loading} style={{width:"100%",justifyContent:"center",padding:14,fontSize:15,marginTop:4,borderRadius:12,background:"linear-gradient(135deg,#FF6B6B,#A78BFA)"}}>
            {loading?<span style={{animation:"spin .8s linear infinite",display:"inline-block"}}>⏳</span>:"Admin Sign In →"}
          </button>
        </div>
        <div style={{marginTop:20,padding:"12px 14px",background:"rgba(255,255,255,.03)",borderRadius:12,border:`1px solid ${G.border}`}}>
          <p style={{fontSize:11,color:G.muted,marginBottom:6,fontWeight:700,textTransform:"uppercase",letterSpacing:.5}}>Demo Admin</p>
          <div onClick={()=>{setFn("00000001");setPw("admin123");setErr("");}} style={{fontSize:12,color:G.muted,cursor:"pointer",display:"flex",gap:8,alignItems:"center"}}>
            <span style={{color:"#FF6B6B"}}>●</span><span style={{color:G.text,fontWeight:600}}>Admin User</span><span>· #00000001 · admin123</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Admin Dashboard ──────────────────────────────────────────────────────────
function AdminDashboard({ admin, events, setEvents, users, setUsers, announcements, setAnnouncements, bases, setBases, news, setNews, uploadFile, onLogout }) {
  const [section,setSection]=useState("overview");
  const [editEv,setEditEv]=useState(null);
  const [mediaPreview,setMediaPreview]=useState(null);
  const [uploadProgress,setUploadProgress]=useState(0);
  const [uploading,setUploading]=useState(false);
  const [editUser,setEditUser]=useState(null);
  const [isNewUser,setIsNewUser]=useState(false);
  const [newAnn,setNewAnn]=useState({title:"",body:"",baseId:1,urgent:false});
  const [editBase,setEditBase]=useState(null);
  const [isNewBase,setIsNewBase]=useState(false);
  const [editMedia,setEditMedia]=useState(null);
  const [editNews,setEditNews]=useState(null);
  const [isNewNews,setIsNewNews]=useState(false);
  const [userSearch,setUserSearch]=useState("");
  const avatarRef=useRef(), newsImgRef=useRef(), replaceMediaRef=useRef();

  const blankUser={id:null,name:"",forceNumber:"",password:"OTP00000",role:"user",baseId:1,avatar:null,firstLogin:true};
  const blankBase={id:null,name:"",short:"",color:"#00C9FF"};
  const blankNews={id:null,title:"",body:"",image:"",baseId:1,date:new Date().toISOString(),author:admin.name,published:true};

  // Upload handler — uses Firebase Storage if available, falls back to base64
  const doUpload = async (file, folder, onDone) => {
    if (!file) return;
    setUploading(true); setUploadProgress(0);
    try {
      if (uploadFile) {
        const result = await uploadFile(file, folder);
        onDone(result.url, result.type);
      } else {
        // Local fallback
        const reader = new FileReader();
        reader.onload = ev => {
          const type = file.type.startsWith("video") ? "video" : "image";
          onDone(ev.target.result, type);
        };
        reader.readAsDataURL(file);
      }
    } catch (e) { console.warn("Upload error:", e); }
    finally { setUploading(false); setUploadProgress(100); }
  };

  const handleMedia=e=>{const f=e.target.files[0];if(!f)return;doUpload(f,"events",(url,type)=>{setMediaPreview(url);setEditEv(p=>({...p,media:{type,url}}));});};
  const handleAvatar=e=>{const f=e.target.files[0];if(!f)return;doUpload(f,"avatars",(url)=>{setEditUser(p=>({...p,avatar:url}));});};
  const handleNewsImg=e=>{const f=e.target.files[0];if(!f)return;doUpload(f,"news",(url)=>{setEditNews(p=>({...p,image:url}));});};
  const handleReplaceMedia=e=>{const f=e.target.files[0];if(!f)return;doUpload(f,"events",(url,type)=>{setEditMedia(p=>({...p,media:{type,url}}));});};

  const saveEvent=()=>{
    if(!editEv?.title)return;
    const isNew=!editEv.id||editEv.id==="new";
    if(isNew) setEvents(p=>[...p,{...editEv,id:Date.now(),color:editEv.color||"#00C9FF",media:editEv.media||{type:"image",url:"https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80"},invited:[]}]);
    else setEvents(p=>p.map(x=>x.id===editEv.id?editEv:x));
    setEditEv(null);setMediaPreview(null);
  };
  const saveUser=()=>{
    if(!editUser?.name||!editUser?.forceNumber)return;
    if(isNewUser) setUsers(p=>[...p,{...editUser,id:Date.now()}]);
    else setUsers(p=>p.map(u=>u.id===editUser.id?editUser:u));
    setEditUser(null);setIsNewUser(false);
  };
  const saveBase=()=>{
    if(!editBase?.name||!editBase?.short)return;
    if(isNewBase) setBases(p=>[...p,{...editBase,id:Date.now()}]);
    else setBases(p=>p.map(b=>b.id===editBase.id?editBase:b));
    setEditBase(null);setIsNewBase(false);
  };
  const saveMedia=()=>{
    if(!editMedia)return;
    setEvents(p=>p.map(e=>e.id===editMedia.id?editMedia:e));
    setEditMedia(null);
  };
  const saveNews=()=>{
    if(!editNews?.title||!editNews?.body)return;
    if(isNewNews) setNews(p=>[...p,{...editNews,id:Date.now(),date:new Date().toISOString()}]);
    else setNews(p=>p.map(n=>n.id===editNews.id?editNews:n));
    setEditNews(null);setIsNewNews(false);
  };
  const sendAnn=()=>{
    if(!newAnn.title||!newAnn.body)return;
    setAnnouncements(p=>[...p,{...newAnn,id:Date.now(),time:"Just now"}]);
    setNewAnn({title:"",body:"",baseId:1,urgent:false});
  };

  const filteredUsers=users.filter(u=>u.name.toLowerCase().includes(userSearch.toLowerCase())||u.forceNumber.includes(userSearch));

  const SECTIONS=[
    {key:"overview",icon:"📊",label:"Overview"},
    {key:"events",  icon:"📋",label:"Events"},
    {key:"users",   icon:"👥",label:"Users"},
    {key:"notifs",  icon:"📢",label:"Announcements"},
    {key:"bases",   icon:"🏢",label:"Bases"},
    {key:"media",   icon:"🖼️", label:"Media Library"},
    {key:"news",    icon:"📰",label:"News"},
  ];

  return (
    <div style={{minHeight:"100vh",background:G.bg,display:"flex",flexDirection:"column"}}>
      {/* Admin topbar */}
      <div style={{background:"rgba(7,11,20,.97)",backdropFilter:"blur(24px)",borderBottom:`1px solid ${G.border}`,position:"sticky",top:0,zIndex:500}}>
        <div style={{maxWidth:1400,margin:"0 auto",padding:"0 16px",display:"flex",alignItems:"center",gap:10,height:56}}>
          <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
            <div style={{width:30,height:30,borderRadius:9,background:"linear-gradient(135deg,#FF6B6B,#A78BFA)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>⚙️</div>
            <span style={{fontFamily:"Syne",fontWeight:800,fontSize:15}}>EventHub <span style={{color:"#FF6B6B",fontSize:11}}>ADMIN</span></span>
          </div>
          <div style={{flex:1}}/>
          <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
            <span style={{fontSize:12,color:G.muted}} className="hide-mobile">Signed in as <strong style={{color:G.text}}>{admin.name}</strong></span>
            <Avatar user={admin} size={30} bases={bases}/>
            <button className="btn btn-g btn-sm" onClick={onLogout}>Sign Out</button>
          </div>
        </div>
      </div>

      <div className="admin-layout" style={{maxWidth:1400,margin:"0 auto",padding:"24px 16px",display:"flex",gap:20,flex:1,width:"100%",alignItems:"flex-start"}}>

        {/* Sidebar */}
        <div className="admin-sidebar" style={{width:210,flexShrink:0}}>
          <div style={{background:G.card,borderRadius:18,padding:14,border:`1px solid ${G.border}`,position:"sticky",top:76}}>
            <div style={{marginBottom:14,padding:"12px 14px",background:"rgba(255,107,107,.08)",borderRadius:12,border:"1px solid rgba(255,107,107,.16)"}}>
              <div style={{fontSize:11,color:G.muted,marginBottom:2}}>Logged in as</div>
              <div style={{fontWeight:700,fontSize:14,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{admin.name}</div>
              <div style={{fontSize:11,color:"#FF6B6B",marginTop:2}}>Administrator</div>
            </div>
            {SECTIONS.map(s=>(
              <div key={s.key} className={`aside-item${section===s.key?" on":""}`} onClick={()=>setSection(s.key)}>
                <span style={{fontSize:15,flexShrink:0}}>{s.icon}</span>
                <span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.label}</span>
              </div>
            ))}
            <div style={{borderTop:`1px solid ${G.border}`,marginTop:10,paddingTop:10}}>
              <div className="aside-item" onClick={onLogout} style={{color:G.danger}}><span>🚪</span>Sign Out</div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div style={{flex:1,minWidth:0}}>

          {/* ── OVERVIEW ── */}
          {section==="overview"&&(
            <div className="fade-up">
              <SectionHeader title="📊 Admin Overview" subtitle={`Welcome back, ${admin.name}. Platform snapshot.`}/>

              {/* Stat widgets — responsive grid, max 2 cols mobile / 3 cols desktop */}
              <div className="overview-grid" style={{marginBottom:32}}>
                {[
                  {icon:"📋",count:events.length,      label:"Total Events",   color:G.accent,  action:()=>setSection("events")},
                  {icon:"👥",count:users.length,       label:"Total Users",    color:G.gold,    action:()=>setSection("users")},
                  {icon:"📢",count:announcements.length,label:"Announcements", color:G.accent2, action:()=>setSection("notifs")},
                  {icon:"🏢",count:bases.length,       label:"Active Bases",   color:G.purple,  action:()=>setSection("bases")},
                  {icon:"📰",count:news.length,        label:"News Posts",     color:G.ok,      action:()=>setSection("news")},
                ].map(s=>(
                  <div key={s.label} className="h-stat" onClick={s.action} style={{
                    background:"rgba(17,24,39,0.6)",
                    backdropFilter:"blur(16px)",
                    WebkitBackdropFilter:"blur(16px)",
                    borderRadius:18,
                    padding:"18px 16px",
                    border:`1px solid rgba(255,255,255,0.07)`,
                    boxShadow:`0 4px 24px rgba(0,0,0,0.35), 0 0 0 1px ${s.color}18`,
                    minWidth:0,
                    width:"100%",
                    boxSizing:"border-box",
                    overflow:"hidden",
                  }}>
                    <div style={{fontSize:22,marginBottom:8}}>{s.icon}</div>
                    <div style={{fontFamily:"Syne",fontSize:26,fontWeight:800,color:s.color,lineHeight:1}}>{s.count}</div>
                    <div style={{fontSize:12,color:G.muted,marginTop:4,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{s.label}</div>
                    <div style={{fontSize:10,color:s.color,marginTop:6,opacity:.8}}>Manage →</div>
                  </div>
                ))}
              </div>

              {/* Recent Events — vertical list */}
              <div>
                <h3 style={{fontFamily:"Syne",fontSize:16,fontWeight:700,marginBottom:14}}>Recent Events</h3>
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  {events.slice(0,8).map(e=>{
                    const base=bases.find(b=>b.id===e.baseId);
                    const color=e.color||G.accent;
                    return (
                      <div key={e.id} className="h-row" onClick={()=>setSection("events")} style={{
                        display:"flex",
                        alignItems:"center",
                        gap:14,
                        padding:"12px 16px",
                        borderRadius:16,
                        border:`1px solid rgba(255,255,255,0.06)`,
                        borderLeft:`3px solid ${color}`,
                        background:"rgba(17,24,39,0.6)",
                        backdropFilter:"blur(16px)",
                        WebkitBackdropFilter:"blur(16px)",
                        boxShadow:"0 4px 20px rgba(0,0,0,0.28)",
                        cursor:"pointer",
                        minWidth:0,
                      }}>
                        <img src={e.media.url} alt="" style={{width:48,height:48,borderRadius:10,objectFit:"cover",flexShrink:0}}/>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontWeight:700,fontSize:14,marginBottom:3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{e.title}</div>
                          <div style={{fontSize:12,color:G.muted,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{base?.name} · {fmtDate(e.date)}</div>
                        </div>
                        <span className="badge" style={{background:`${color}22`,color,border:`1px solid ${color}44`,flexShrink:0,fontSize:10}}>{e.type}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ── EVENTS ── */}
          {section==="events"&&(
            <div className="fade-up">
              <SectionHeader title="📋 Manage Events" subtitle={`${events.length} events total`} action={()=>{setEditEv({id:"new",title:"",description:"",date:new Date().toISOString(),endDate:new Date().toISOString(),venue:"",type:"Conference",baseId:1,color:"#00C9FF"});setMediaPreview(null);}} actionLabel="+ New Event"/>
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {events.map(e=>{
                  const base=bases.find(b=>b.id===e.baseId);
                  return (
                    <div key={e.id} className="h-row" style={{background:G.card,borderRadius:14,padding:"12px 16px",border:`1px solid ${G.border}`,display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
                      <img src={e.media.url} alt="" style={{width:50,height:50,borderRadius:10,objectFit:"cover",flexShrink:0}}/>
                      <div style={{flex:1,minWidth:120}}>
                        <div style={{fontWeight:700,fontSize:14,marginBottom:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{e.title}</div>
                        <div style={{fontSize:12,color:G.muted,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{base?.name} · {fmtDate(e.date)} · <span style={{color:e.color||G.accent}}>{e.type}</span></div>
                      </div>
                      <div style={{display:"flex",gap:8,flexShrink:0}}>
                        <button className="btn btn-g btn-sm" onClick={()=>{setEditEv(e);setMediaPreview(e.media?.url);}}>Edit</button>
                        <button className="btn btn-d btn-sm" onClick={()=>setEvents(p=>p.filter(x=>x.id!==e.id))}>Delete</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── USERS ── */}
          {section==="users"&&(
            <div className="fade-up">
              <SectionHeader title="👥 Manage Users" subtitle={`${users.length} users registered`} action={()=>{setEditUser({...blankUser});setIsNewUser(true);}} actionLabel="+ Add User"/>
              <div style={{marginBottom:14}}>
                <input placeholder="🔍 Search by name or force number…" value={userSearch} onChange={e=>setUserSearch(e.target.value)}/>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {filteredUsers.map(u=>(
                  <div key={u.id} className="h-row" style={{background:G.card,borderRadius:14,padding:"14px 16px",border:`1px solid ${G.border}`,display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
                    <Avatar user={u} size={44} bases={bases}/>
                    <div style={{flex:1,minWidth:120}}>
                      <div style={{fontWeight:700,fontSize:14,marginBottom:3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{u.name}</div>
                      <div style={{fontSize:12,color:G.muted,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                        #{u.forceNumber} · {bases.find(b=>b.id===u.baseId)?.short}
                        {" · "}<span style={{color:u.role==="admin"?G.gold:G.accent}}>{u.role}</span>
                        {u.firstLogin&&<span style={{color:G.danger,marginLeft:6}}>⚠ First login</span>}
                      </div>
                    </div>
                    <div style={{display:"flex",gap:8,flexShrink:0}}>
                      <button className="btn btn-g btn-sm" onClick={()=>{setEditUser(u);setIsNewUser(false);}}>Edit</button>
                      <button className="btn btn-d btn-sm" onClick={()=>setUsers(p=>p.filter(x=>x.id!==u.id))}>Delete</button>
                    </div>
                  </div>
                ))}
                {filteredUsers.length===0&&<p style={{color:G.muted,textAlign:"center",padding:"24px 0"}}>No users match your search.</p>}
              </div>
            </div>
          )}

          {/* ── ANNOUNCEMENTS ── */}
          {section==="notifs"&&(
            <div className="fade-up">
              <SectionHeader title="📢 Announcements" subtitle="Send and manage base notifications"/>
              <div style={{background:G.card,borderRadius:18,padding:20,border:`1px solid ${G.border}`,marginBottom:20}}>
                <h4 style={{fontFamily:"Syne",fontWeight:700,fontSize:15,marginBottom:14}}>Send New Announcement</h4>
                <div style={{display:"flex",flexDirection:"column",gap:12}}>
                  <input placeholder="Title" value={newAnn.title} onChange={e=>setNewAnn(p=>({...p,title:e.target.value}))}/>
                  <textarea placeholder="Message body…" rows={3} value={newAnn.body} onChange={e=>setNewAnn(p=>({...p,body:e.target.value}))}/>
                  <div className="row-wrap" style={{alignItems:"center"}}>
                    <select value={newAnn.baseId} onChange={e=>setNewAnn(p=>({...p,baseId:+e.target.value}))}>
                      {bases.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                    <label style={{display:"flex",alignItems:"center",gap:7,cursor:"pointer",fontSize:13,color:G.muted,marginBottom:0,whiteSpace:"nowrap",flex:"none"}}>
                      <input type="checkbox" checked={newAnn.urgent} onChange={e=>setNewAnn(p=>({...p,urgent:e.target.checked}))} style={{width:"auto"}}/>
                      🚨 Urgent
                    </label>
                    <button className="btn btn-p btn-sm" onClick={sendAnn} style={{flex:"none"}}>Send 🔔</button>
                  </div>
                </div>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {announcements.map(a=>(
                  <div key={a.id} className="h-row" style={{background:G.card,borderRadius:14,padding:"14px 16px",border:`1px solid ${G.border}`,borderLeft:`3px solid ${a.urgent?G.danger:G.accent}`,display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12,flexWrap:"wrap"}}>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontWeight:700,fontSize:14,marginBottom:3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{a.title}</div>
                      <div style={{fontSize:12,color:G.muted,marginBottom:4,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{bases.find(b=>b.id===a.baseId)?.name} · {a.time}{a.urgent?" · 🚨":""}</div>
                      <div style={{fontSize:13,color:G.mutedL,lineHeight:1.5}}>{a.body}</div>
                    </div>
                    <button className="btn btn-d btn-sm" style={{flexShrink:0}} onClick={()=>setAnnouncements(p=>p.filter(x=>x.id!==a.id))}>Delete</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── BASES ── */}
          {section==="bases"&&(
            <div className="fade-up">
              <SectionHeader title="🏢 Manage Bases" subtitle={`${bases.length} bases active`} action={()=>{setEditBase({...blankBase});setIsNewBase(true);}} actionLabel="+ Add Base"/>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:14}}>
                {bases.map(b=>{
                  const bEvs=events.filter(e=>e.baseId===b.id);
                  const bUsrs=users.filter(u=>u.baseId===b.id);
                  return (
                    <div key={b.id} style={{background:G.card,borderRadius:18,padding:18,border:`1px solid ${G.border}`,borderTop:`3px solid ${b.color}`}}>
                      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
                        <div style={{width:42,height:42,borderRadius:12,background:`${b.color}16`,border:`1px solid ${b.color}30`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:11,color:b.color,fontFamily:"Syne,sans-serif",flexShrink:0}}>{b.short}</div>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontWeight:700,fontSize:14,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{b.name}</div>
                          <div style={{fontSize:11,color:G.muted}}>ID: {b.id}</div>
                        </div>
                      </div>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>
                        <div style={{textAlign:"center",background:"rgba(255,255,255,.03)",borderRadius:10,padding:"8px 4px",border:`1px solid ${G.border}`}}>
                          <div style={{fontFamily:"Syne",fontWeight:800,fontSize:20,color:b.color}}>{bEvs.length}</div>
                          <div style={{fontSize:11,color:G.muted}}>Events</div>
                        </div>
                        <div style={{textAlign:"center",background:"rgba(255,255,255,.03)",borderRadius:10,padding:"8px 4px",border:`1px solid ${G.border}`}}>
                          <div style={{fontFamily:"Syne",fontWeight:800,fontSize:20,color:b.color}}>{bUsrs.length}</div>
                          <div style={{fontSize:11,color:G.muted}}>Users</div>
                        </div>
                      </div>
                      <div style={{display:"flex",gap:8}}>
                        <button className="btn btn-g btn-sm" style={{flex:1,justifyContent:"center"}} onClick={()=>{setEditBase(b);setIsNewBase(false);}}>Edit</button>
                        <button className="btn btn-d btn-sm" style={{flex:1,justifyContent:"center"}} onClick={()=>setBases(p=>p.filter(x=>x.id!==b.id))}>Delete</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── MEDIA LIBRARY ── */}
          {section==="media"&&(
            <div className="fade-up">
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20,flexWrap:"wrap",gap:10}}>
                <div>
                  <h2 style={{fontFamily:"Syne",fontSize:22,fontWeight:800,marginBottom:4}}>🖼️ Media Library</h2>
                  <p style={{color:G.muted,fontSize:13}}>Manage event media. Edit titles, replace files.</p>
                </div>
                <button className="btn btn-p btn-sm" onClick={()=>{
                  // Add new media: create a blank event media entry via the edit event modal
                  setSection("events");
                  setTimeout(()=>setEditEv({id:"new",title:"",description:"",date:new Date().toISOString(),endDate:new Date().toISOString(),venue:"",type:"Conference",baseId:1,color:"#00C9FF"}),50);
                }}>+ Add New Media</button>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:14}}>
                {events.map(e=>(
                  <div key={e.id} style={{borderRadius:16,overflow:"hidden",border:`1px solid ${G.border}`,background:G.card}}>
                    {e.media.type==="video"
                      ?<video src={e.media.url} style={{width:"100%",height:140,objectFit:"cover"}} muted/>
                      :<img src={e.media.url} alt="" style={{width:"100%",height:140,objectFit:"cover"}}/>}
                    <div style={{padding:"10px 12px"}}>
                      <div style={{fontSize:12,fontWeight:700,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",marginBottom:4}}>{e.title}</div>
                      <div style={{fontSize:11,color:G.muted,marginBottom:10}}>{e.media.type==="video"?"🎬 Video":"📸 Image"} · {bases.find(b=>b.id===e.baseId)?.short}</div>
                      <div style={{display:"flex",gap:6}}>
                        <button className="btn btn-g btn-sm" style={{flex:1,justifyContent:"center"}} onClick={()=>setEditMedia({...e})}>✏️ Edit</button>
                        <button className="btn btn-d btn-sm" style={{flex:1,justifyContent:"center"}} onClick={()=>{
                          // Delete from Firebase Storage if URL is a storage path
                          if(e.media?.url && e.media.url.includes("firebasestorage")) {
                            deleteStorageFile(e.media.url).catch(console.warn);
                          }
                          setEvents(p=>p.filter(x=>x.id!==e.id));
                        }}>🗑️ Delete</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── NEWS ── */}
          {section==="news"&&(
            <div className="fade-up">
              <SectionHeader title="📰 News Posts" subtitle={`${news.length} posts published`} action={()=>{setEditNews({...blankNews});setIsNewNews(true);}} actionLabel="+ New Post"/>
              <div style={{display:"flex",flexDirection:"column",gap:12}}>
                {news.map(n=>{
                  const base=bases.find(b=>b.id===n.baseId);
                  return (
                    <div key={n.id} className="h-row" style={{background:G.card,borderRadius:14,padding:"12px 16px",border:`1px solid ${G.border}`,display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
                      {n.image&&<img src={n.image} alt="" style={{width:52,height:52,borderRadius:10,objectFit:"cover",flexShrink:0}}/>}
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontWeight:700,fontSize:14,marginBottom:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{n.title}</div>
                        <div style={{fontSize:12,color:G.muted,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{base?.short} · {fmtDate(n.date)} · {n.published?"✅ Published":"📝 Draft"}</div>
                      </div>
                      <div style={{display:"flex",gap:8,flexShrink:0}}>
                        <button className="btn btn-g btn-sm" onClick={()=>{setEditNews(n);setIsNewNews(false);}}>Edit</button>
                        <button className="btn btn-d btn-sm" onClick={()=>setNews(p=>p.filter(x=>x.id!==n.id))}>Delete</button>
                      </div>
                    </div>
                  );
                })}
                {news.length===0&&<p style={{color:G.muted,textAlign:"center",padding:"24px 0"}}>No news posts yet.</p>}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── EDIT EVENT MODAL ── */}
      {editEv&&(
        <div className="overlay">
          <div className="modal" style={{maxWidth:640}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
              <h3 style={{fontFamily:"Syne",fontWeight:800,fontSize:19}}>{editEv.id==="new"?"✨ New Event":"✏️ Edit Event"}</h3>
              <button className="btn btn-g btn-sm" onClick={()=>{setEditEv(null);setMediaPreview(null);}}>✕</button>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <div>
                <label>📸 Photo or 🎬 Video (max 30 sec)</label>
                <UploadZone
                  preview={mediaPreview}
                  mediaType={editEv.media?.type}
                  onUpload={handleMedia}
                  uploading={uploading}
                  progress={uploadProgress}
                />
              </div>
              <div><label>Event Title *</label><input placeholder="e.g. Annual Strategy Summit" value={editEv.title||""} onChange={e=>setEditEv(p=>({...p,title:e.target.value}))}/></div>
              <div><label>Description</label><textarea placeholder="What is this event about?" rows={3} value={editEv.description||""} onChange={e=>setEditEv(p=>({...p,description:e.target.value}))}/></div>
              <div><label>Venue / Location</label><input placeholder="e.g. Conference Hall A" value={editEv.venue||""} onChange={e=>setEditEv(p=>({...p,venue:e.target.value}))}/></div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <div><label>Start Date & Time</label><input type="datetime-local" value={editEv.date?.slice(0,16)||""} onChange={e=>setEditEv(p=>({...p,date:new Date(e.target.value).toISOString()}))}/></div>
                <div><label>End Date & Time</label><input type="datetime-local" value={editEv.endDate?.slice(0,16)||""} onChange={e=>setEditEv(p=>({...p,endDate:new Date(e.target.value).toISOString()}))}/></div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <div><label>Base</label><select value={editEv.baseId} onChange={e=>setEditEv(p=>({...p,baseId:+e.target.value}))}>{bases.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}</select></div>
                <div><label>Event Type</label><select value={editEv.type||"Conference"} onChange={e=>setEditEv(p=>({...p,type:e.target.value}))}>{["Conference","Client Event","Team Building","Workshop","Launch","Meeting","Gala","Mandatory","Wellness"].map(t=><option key={t}>{t}</option>)}</select></div>
              </div>
            </div>
            <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:20}}>
              <button className="btn btn-g" onClick={()=>{setEditEv(null);setMediaPreview(null);}}>Cancel</button>
              <button className="btn btn-p" onClick={saveEvent}>Save Event ✓</button>
            </div>
          </div>
        </div>
      )}

      {/* ── EDIT/ADD USER MODAL ── */}
      {editUser&&(
        <div className="overlay">
          <div className="modal scale-in" style={{maxWidth:480}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
              <h3 style={{fontFamily:"Syne",fontWeight:800,fontSize:19}}>{isNewUser?"➕ Add New User":"✏️ Edit User"}</h3>
              <button className="btn btn-g btn-sm" onClick={()=>{setEditUser(null);setIsNewUser(false);}}>✕</button>
            </div>
            <div style={{textAlign:"center",marginBottom:18}}>
              <div style={{position:"relative",display:"inline-block"}}>
                <div style={{width:72,height:72,borderRadius:20,overflow:"hidden",background:"rgba(255,255,255,.06)",border:`1px solid ${G.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,fontFamily:"Syne",fontWeight:700,color:G.text,margin:"0 auto"}}>
                  {editUser.avatar?<img src={editUser.avatar} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:initials(editUser.name||"?")}
                </div>
                <button onClick={()=>avatarRef.current.click()} style={{position:"absolute",bottom:-4,right:-4,width:26,height:26,borderRadius:8,background:G.accent,border:"none",cursor:"pointer",fontSize:12,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 2px 8px rgba(0,201,255,.4)"}}>📷</button>
                <input ref={avatarRef} type="file" accept="image/*" style={{display:"none"}} onChange={handleAvatar}/>
              </div>
              <p style={{fontSize:11,color:G.muted,marginTop:8}}>Tap 📷 to upload profile photo</p>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              <div><label>Full Name *</label><input placeholder="e.g. John Smith" value={editUser.name} onChange={e=>setEditUser(p=>({...p,name:e.target.value}))}/></div>
              <div><label>Force Number * (8 digits)</label><input placeholder="e.g. 13008976" value={editUser.forceNumber} maxLength={8} onChange={e=>setEditUser(p=>({...p,forceNumber:e.target.value.replace(/\D/g,"")}))}/></div>
              <div><label>OTP / Password</label><input placeholder="e.g. OTP12345" value={editUser.password} onChange={e=>setEditUser(p=>({...p,password:e.target.value}))}/></div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <div><label>Base</label><select value={editUser.baseId} onChange={e=>setEditUser(p=>({...p,baseId:+e.target.value}))}>{bases.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}</select></div>
                <div><label>Role</label><select value={editUser.role} onChange={e=>setEditUser(p=>({...p,role:e.target.value}))}><option value="user">User</option><option value="admin">Admin</option></select></div>
              </div>
              <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",fontSize:13,color:G.muted,marginBottom:0}}>
                <input type="checkbox" checked={editUser.firstLogin} onChange={e=>setEditUser(p=>({...p,firstLogin:e.target.checked}))} style={{width:"auto"}}/>
                Force password change on first login
              </label>
            </div>
            <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:20}}>
              <button className="btn btn-g" onClick={()=>{setEditUser(null);setIsNewUser(false);}}>Cancel</button>
              <button className="btn btn-p" onClick={saveUser}>{isNewUser?"Add User":"Save Changes"}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── EDIT BASE MODAL ── */}
      {editBase&&(
        <div className="overlay">
          <div className="modal scale-in" style={{maxWidth:400}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
              <h3 style={{fontFamily:"Syne",fontWeight:800,fontSize:19}}>{isNewBase?"➕ Add Base":"✏️ Edit Base"}</h3>
              <button className="btn btn-g btn-sm" onClick={()=>{setEditBase(null);setIsNewBase(false);}}>✕</button>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              <div><label>Base Name *</label><input placeholder="e.g. Cape Town Base" value={editBase.name} onChange={e=>setEditBase(p=>({...p,name:e.target.value}))}/></div>
              <div><label>Short Code * (3 letters)</label><input placeholder="e.g. CPT" maxLength={4} value={editBase.short} onChange={e=>setEditBase(p=>({...p,short:e.target.value.toUpperCase()}))}/></div>
              <div>
                <label>Colour</label>
                <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
                  {["#00C9FF","#FF6B6B","#FBBF24","#A78BFA","#34D399","#F97316","#EC4899","#EF4444"].map(c=>(
                    <div key={c} onClick={()=>setEditBase(p=>({...p,color:c}))} style={{width:28,height:28,borderRadius:8,background:c,cursor:"pointer",border:editBase.color===c?`3px solid #fff`:"3px solid transparent",transition:"border .15s"}}/>
                  ))}
                  <input type="color" value={editBase.color} onChange={e=>setEditBase(p=>({...p,color:e.target.value}))} style={{width:36,height:36,padding:2,borderRadius:8,cursor:"pointer"}}/>
                </div>
              </div>
            </div>
            <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:20}}>
              <button className="btn btn-g" onClick={()=>{setEditBase(null);setIsNewBase(false);}}>Cancel</button>
              <button className="btn btn-p" onClick={saveBase}>{isNewBase?"Add Base":"Save"}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── EDIT MEDIA MODAL ── */}
      {editMedia&&(
        <div className="overlay">
          <div className="modal scale-in" style={{maxWidth:520}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
              <h3 style={{fontFamily:"Syne",fontWeight:800,fontSize:19}}>✏️ Edit Media</h3>
              <button className="btn btn-g btn-sm" onClick={()=>setEditMedia(null)}>✕</button>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <div>
                <label>Current Media</label>
                {editMedia.media?.type==="video"
                  ?<video src={editMedia.media.url} style={{width:"100%",height:160,objectFit:"cover",borderRadius:12}} controls/>
                  :<img src={editMedia.media.url} alt="" style={{width:"100%",height:160,objectFit:"cover",borderRadius:12}}/>}
              </div>
              <div>
                <label>Replace Media</label>
                <UploadZone preview={null} mediaType={null} onUpload={handleReplaceMedia} label="📁 Upload replacement photo or video"/>
                <input ref={replaceMediaRef} type="file" accept="image/*,video/*" style={{display:"none"}} onChange={handleReplaceMedia}/>
              </div>
              <div><label>Event Title</label><input value={editMedia.title||""} onChange={e=>setEditMedia(p=>({...p,title:e.target.value}))}/></div>
            </div>
            <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:20}}>
              <button className="btn btn-g" onClick={()=>setEditMedia(null)}>Cancel</button>
              <button className="btn btn-p" onClick={saveMedia}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* ── EDIT NEWS MODAL ── */}
      {editNews&&(
        <div className="overlay">
          <div className="modal scale-in" style={{maxWidth:580}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
              <h3 style={{fontFamily:"Syne",fontWeight:800,fontSize:19}}>{isNewNews?"✨ New Post":"✏️ Edit Post"}</h3>
              <button className="btn btn-g btn-sm" onClick={()=>{setEditNews(null);setIsNewNews(false);}}>✕</button>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <div>
                <label>📸 Cover Image</label>
                <div className="upload-zone" onClick={()=>newsImgRef.current.click()}>
                  {editNews.image
                    ?<img src={editNews.image} alt="" style={{width:"100%",height:160,objectFit:"cover"}}/>
                    :<div style={{textAlign:"center",color:G.muted,padding:20}}><div style={{fontSize:28,marginBottom:6}}>🖼️</div><div style={{fontSize:13}}>Click to upload cover image</div></div>}
                  <input ref={newsImgRef} type="file" accept="image/*" style={{display:"none"}} onChange={handleNewsImg}/>
                </div>
              </div>
              <div><label>Title *</label><input placeholder="News headline" value={editNews.title||""} onChange={e=>setEditNews(p=>({...p,title:e.target.value}))}/></div>
              <div><label>Body *</label><textarea placeholder="Article content…" rows={4} value={editNews.body||""} onChange={e=>setEditNews(p=>({...p,body:e.target.value}))}/></div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <div><label>Base</label><select value={editNews.baseId} onChange={e=>setEditNews(p=>({...p,baseId:+e.target.value}))}>{bases.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}</select></div>
                <div style={{display:"flex",alignItems:"flex-end",paddingBottom:2}}>
                  <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",fontSize:13,color:G.muted,marginBottom:0}}>
                    <input type="checkbox" checked={editNews.published} onChange={e=>setEditNews(p=>({...p,published:e.target.checked}))} style={{width:"auto"}}/>
                    Published
                  </label>
                </div>
              </div>
            </div>
            <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:20}}>
              <button className="btn btn-g" onClick={()=>{setEditNews(null);setIsNewNews(false);}}>Cancel</button>
              <button className="btn btn-p" onClick={saveNews}>{isNewNews?"Publish Post":"Save Changes"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// USER LOGIN
// ═══════════════════════════════════════════════════════════════
function UserLogin({ users, onLogin, onAdminLogin }) {
  const [fn,setFn]=useState(""), [pw,setPw]=useState(""), [err,setErr]=useState(""), [loading,setLoading]=useState(false);
  const go=()=>{
    if(!fn||!pw){setErr("Please fill in all fields.");return;}
    setLoading(true);
    setTimeout(()=>{
      const u=users.find(u=>u.forceNumber===fn&&u.password===pw);
      if(u) onLogin(u); else {setErr("Invalid force number or password.");setLoading(false);}
    },800);
  };
  return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:20,background:G.bg,position:"relative",overflow:"hidden"}}>
      <div className="orb" style={{width:600,height:600,background:"radial-gradient(circle,rgba(0,201,255,.07),transparent 70%)",top:-200,left:-150}}/>
      <div className="orb" style={{width:400,height:400,background:"radial-gradient(circle,rgba(167,139,250,.07),transparent 70%)",bottom:-100,right:-80}}/>
      <div className="fade-up glass" style={{width:"100%",maxWidth:420,borderRadius:26,padding:"40px 36px"}}>
        <div style={{textAlign:"center",marginBottom:34}}>
          <div style={{width:70,height:70,borderRadius:22,background:"linear-gradient(135deg,#00C9FF,#A78BFA)",margin:"0 auto 16px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:32,boxShadow:"0 14px 44px rgba(0,201,255,.38)",animation:"floatY 3s ease infinite"}}>📅</div>
          <h1 style={{fontFamily:"Syne",fontSize:28,fontWeight:800,marginBottom:5}}>EventHub</h1>
          <p style={{color:G.muted,fontSize:13}}>Enterprise Event Management Platform</p>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div><label>Force Number</label><input placeholder="8-digit force number" value={fn} maxLength={8} onChange={e=>{setFn(e.target.value.replace(/\D/g,""));setErr("");}} onKeyDown={e=>e.key==="Enter"&&go()}/></div>
          <div><label>Password / OTP</label><input type="password" placeholder="Enter your password or OTP" value={pw} onChange={e=>{setPw(e.target.value);setErr("");}} onKeyDown={e=>e.key==="Enter"&&go()}/></div>
          {err&&<p style={{color:G.danger,fontSize:13,textAlign:"center"}}>{err}</p>}
          <button className="btn btn-p" onClick={go} disabled={loading} style={{width:"100%",justifyContent:"center",padding:14,fontSize:15,marginTop:4,borderRadius:12}}>
            {loading?<span style={{animation:"spin .8s linear infinite",display:"inline-block"}}>⏳</span>:"Sign In →"}
          </button>
          <button onClick={onAdminLogin} style={{background:"none",border:"1px solid rgba(255,107,107,.25)",borderRadius:10,padding:"10px",color:"#FF6B6B",fontSize:13,fontWeight:600,cursor:"pointer",transition:"all .2s",fontFamily:"DM Sans,sans-serif"}} onMouseOver={e=>e.currentTarget.style.background="rgba(255,107,107,.08)"} onMouseOut={e=>e.currentTarget.style.background="none"}>
            ⚙️ Admin Login
          </button>
        </div>
        <div style={{marginTop:22,padding:"14px 16px",background:"rgba(255,255,255,.03)",borderRadius:14,border:`1px solid ${G.border}`}}>
          <p style={{fontSize:11,color:G.muted,marginBottom:8,fontWeight:700,textTransform:"uppercase",letterSpacing:.5}}>Demo Accounts</p>
          {[["13008976","OTP12345","Thabo – JHB (first login)",G.accent],["13011234","OTP11111","Sipho – DBN",G.gold],["13009012","OTP67890","Zanele – CPT (first login)",G.accent2]].map(([f,p,lbl,c])=>(
            <div key={f} onClick={()=>{setFn(f);setPw(p);setErr("");}} style={{fontSize:12,color:G.muted,marginBottom:6,cursor:"pointer",display:"flex",gap:8,alignItems:"center"}}>
              <span style={{color:c,fontSize:10}}>●</span><span style={{color:G.text,fontWeight:600}}>{lbl}</span><span>· #{f}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// USER APP
// ═══════════════════════════════════════════════════════════════
function UserApp({ user, setUser, events, users, setUsers, announcements, bases, news }) {
  const [tab,setTab]=useState("home");
  const [pins,setPins]=useState([5]);
  const [filterBase,setFilterBase]=useState("all");
  const [filterType,setFilterType]=useState("all");
  const [search,setSearch]=useState("");
  const [selEv,setSelEv]=useState(null);
  const [selNews,setSelNews]=useState(null);
  const [selAnn,setSelAnn]=useState(null);
  const [showBasePicker,setShowBasePicker]=useState(false);
  const [pickerTarget,setPickerTarget]=useState(null);
  const [showProfile,setShowProfile]=useState(false);

  const myBase=bases.find(b=>b.id===user.baseId);
  const myNotifs=announcements.filter(a=>a.baseId===user.baseId);
  const upcoming=events.filter(e=>next2Wk(e.date)).sort((a,b)=>new Date(a.date)-new Date(b.date));
  const filtered=events.filter(e=>within2Mo(e.date)).filter(e=>filterBase==="all"||e.baseId===+filterBase).filter(e=>filterType==="all"||e.type===filterType).filter(e=>e.title.toLowerCase().includes(search.toLowerCase())).sort((a,b)=>new Date(a.date)-new Date(b.date));
  const pinned=events.filter(e=>pins.includes(e.id));
  const types=[...new Set(events.map(e=>e.type))];
  const publishedNews=news.filter(n=>n.published).sort((a,b)=>new Date(b.date)-new Date(a.date));

  const togglePin=id=>setPins(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id]);
  const handleProfileSave=updated=>{setUsers(p=>p.map(u=>u.id===updated.id?updated:u));setUser(updated);setShowProfile(false);};

  const NAV=[
    {key:"home",    icon:"🏠", label:"Home"},
    {key:"events",  icon:"📋", label:"All Events"},
    {key:"notifs",  icon:"🔔", label:"Notifications", badge:myNotifs.length},
    {key:"bases",   icon:"🏢", label:"Bases"},
    {key:"calendar",icon:"📆", label:"Calendar"},
    {key:"news",    icon:"📰", label:"News"},
    {key:"profile", icon:"👤", label:"Profile"},
  ];

  return (
    <>
      {/* PERSISTENT NAV */}
      <div style={{position:"sticky",top:0,zIndex:500,background:"rgba(7,11,20,.97)",backdropFilter:"blur(24px)",borderBottom:`1px solid ${G.border}`}}>
        <div style={{maxWidth:1300,margin:"0 auto",padding:"0 14px",display:"flex",alignItems:"center",gap:6,height:56}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginRight:8,flexShrink:0}}>
            <div style={{width:28,height:28,borderRadius:8,background:"linear-gradient(135deg,#00C9FF,#A78BFA)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13}}>📅</div>
            <span style={{fontFamily:"Syne",fontWeight:800,fontSize:15}} className="hide-mobile">EventHub</span>
          </div>
          <div className="chips" style={{flex:1,paddingBottom:0}}>
            {NAV.map(n=>(
              <button key={n.key}
                className={`ntab${tab===n.key?" on":""}`}
                onClick={()=>n.key==="profile"?setShowProfile(true):setTab(n.key)}
                style={{position:"relative",paddingRight:n.badge>0?20:undefined}}>
                <span>{n.icon}</span>
                <span className="hide-mobile">{" "}{n.label}</span>
                {n.badge>0&&<span style={{position:"absolute",top:2,right:3,background:G.danger,color:"#fff",borderRadius:"50%",width:14,height:14,fontSize:9,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center"}}>{n.badge>9?"9+":n.badge}</span>}
              </button>
            ))}
          </div>
          <div style={{display:"flex",alignItems:"center",gap:7,flexShrink:0,marginLeft:4}}>
            <div style={{display:"flex",alignItems:"center",gap:5,padding:"3px 10px",borderRadius:8,background:`${myBase?.color}14`,border:`1px solid ${myBase?.color}28`,cursor:"pointer"}} onClick={()=>setTab("bases")}>
              <div style={{width:6,height:6,borderRadius:"50%",background:myBase?.color}}/>
              <span style={{fontSize:11,fontWeight:700,color:myBase?.color}}>{myBase?.short}</span>
            </div>
            <div style={{cursor:"pointer"}} onClick={()=>setShowProfile(true)}><Avatar user={user} size={30} bases={bases}/></div>
            <button className="btn btn-g btn-sm" onClick={()=>setUser(null)}>Out</button>
          </div>
        </div>
      </div>

      {/* TICKER */}
      <Ticker events={events} bases={bases}/>

      {/* CONTENT */}
      <div style={{maxWidth:1300,margin:"0 auto",padding:"26px 16px 80px"}}>

        {/* HOME */}
        {tab==="home"&&(
          <div className="fade-up">
            <div style={{marginBottom:26}}>
              <p style={{fontSize:13,color:G.muted,marginBottom:4}}>{new Date().toLocaleDateString("en-ZA",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</p>
              <h1 style={{fontFamily:"Syne",fontSize:28,fontWeight:800,marginBottom:10,lineHeight:1.2}}>Welcome back, {user.name.split(" ")[0]} 👋</h1>
              <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                <div style={{display:"flex",alignItems:"center",gap:6,padding:"5px 12px",borderRadius:20,background:`${myBase?.color}12`,border:`1px solid ${myBase?.color}28`}}>
                  <div style={{width:6,height:6,borderRadius:"50%",background:myBase?.color,boxShadow:`0 0 6px ${myBase?.color}`}}/>
                  <span style={{fontSize:12,fontWeight:700,color:myBase?.color}}>{myBase?.name}</span>
                </div>
                <span style={{fontSize:12,color:G.muted}}>Force #{user.forceNumber}</span>
                <span className="badge" style={{background:`${G.accent}18`,color:G.accent,border:`1px solid ${G.accent}30`}}>{user.role}</span>
              </div>
            </div>

            {/* Stats */}
            <div className="swipe-scroll" style={{marginBottom:28}}>
              {[
                {icon:"⚡",count:upcoming.length,label:"Upcoming",color:G.accent,action:()=>setTab("events")},
                {icon:"🏢",count:bases.length,label:"Active Bases",color:G.gold,action:()=>setTab("bases")},
                {icon:"🔔",count:myNotifs.length,label:"Notifications",color:G.accent2,action:()=>setTab("notifs")},
                {icon:"⭐",count:pinned.length,label:"Pinned",color:G.purple,action:()=>document.getElementById("pin-sec")?.scrollIntoView({behavior:"smooth"})},
              ].map((s,i)=>(
                <div key={s.label} className="h-stat fade-up" style={{background:G.card,borderRadius:18,padding:"16px 18px",border:`1px solid ${G.border}`,minWidth:140,flexShrink:0,animationDelay:`${i*.07}s`}} onClick={s.action}>
                  <div style={{fontSize:20,marginBottom:7}}>{s.icon}</div>
                  <div style={{fontFamily:"Syne",fontSize:24,fontWeight:800,color:s.color}}>{s.count}</div>
                  <div style={{fontSize:12,color:G.muted,marginTop:2,whiteSpace:"nowrap"}}>{s.label}</div>
                  <div style={{fontSize:10,color:s.color,marginTop:4,opacity:.8}}>Tap →</div>
                </div>
              ))}
            </div>

            {/* Notifications */}
            <div style={{marginBottom:30}}>
              <h2 style={{fontFamily:"Syne",fontSize:17,fontWeight:800,marginBottom:12,display:"flex",alignItems:"center",gap:8}}>
                🔔 Notifications
                <span className="badge" style={{background:`${myBase?.color}18`,color:myBase?.color,border:`1px solid ${myBase?.color}30`}}>{myBase?.short}</span>
              </h2>
              {myNotifs.length===0
                ?<p style={{color:G.muted,fontSize:14}}>No notifications for your base.</p>
                :myNotifs.map(a=>(
                  <div key={a.id} className="h-row glass" style={{borderRadius:14,padding:"13px 16px",marginBottom:10,borderLeft:`3px solid ${a.urgent?G.danger:G.accent}`,display:"flex",gap:12,alignItems:"flex-start"}}
                    onClick={()=>setSelAnn(a)}>
                    {a.urgent&&<div className="pulse-dot" style={{marginTop:5}}/>}
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontWeight:700,fontSize:14,marginBottom:3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{a.title}</div>
                      <div style={{fontSize:13,color:G.muted,lineHeight:1.5}}>{a.body}</div>
                    </div>
                    <span style={{fontSize:11,color:G.muted,whiteSpace:"nowrap",flexShrink:0}}>{a.time}</span>
                  </div>
                ))}
            </div>

            {/* Upcoming events */}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,gap:8}}>
              <h2 style={{fontFamily:"Syne",fontSize:17,fontWeight:800}}>⚡ Next 2 Weeks</h2>
              <button className="btn btn-g btn-sm" onClick={()=>setTab("events")}>View All →</button>
            </div>
            {upcoming.length===0
              ?<div style={{textAlign:"center",padding:"40px 20px",color:G.muted}}><div style={{fontSize:36,marginBottom:10}}>📭</div><p>No events in the next 2 weeks.</p></div>
              :<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:18,marginBottom:32}}>
                {upcoming.map((e,i)=>(
                  <div key={e.id} className="fade-up" style={{animationDelay:`${i*.05}s`}}>
                    <EventCard ev={e} bases={bases} onPin={togglePin} pins={pins} onClick={setSelEv}/>
                  </div>
                ))}
              </div>}

            {/* Pinned */}
            {pinned.length>0&&(
              <div id="pin-sec" style={{marginBottom:32}}>
                <h2 style={{fontFamily:"Syne",fontSize:17,fontWeight:800,marginBottom:14}}>⭐ Pinned Events</h2>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:18}}>
                  {pinned.map((e,i)=>(
                    <div key={e.id} className="fade-up" style={{animationDelay:`${i*.05}s`}}>
                      <EventCard ev={e} bases={bases} onPin={togglePin} pins={pins} onClick={setSelEv}/>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* News on homepage — carousel */}
            {publishedNews.length>0&&(
              <div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                  <h2 style={{fontFamily:"Syne",fontSize:17,fontWeight:800}}>📰 Latest News</h2>
                </div>
                <Carousel
                  items={publishedNews}
                  cardWidth={300}
                  renderItem={(n)=>{
                    const base=bases.find(b=>b.id===n.baseId);
                    return (
                      <div className="news-card shimmer" style={{cursor:"pointer"}} onClick={()=>setSelNews(n)}>
                        {n.image&&<img src={n.image} alt={n.title} style={{width:"100%",height:180,objectFit:"cover"}}/>}
                        <div style={{padding:"14px 16px 18px"}}>
                          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8,flexWrap:"wrap"}}>
                            <span className="badge" style={{background:"rgba(52,211,153,.12)",color:G.ok,border:"1px solid rgba(52,211,153,.25)"}}>📰 News</span>
                            <span style={{fontSize:11,color:G.muted}}>{base?.short}</span>
                          </div>
                          <h3 style={{fontFamily:"Syne",fontSize:15,fontWeight:700,marginBottom:6,lineHeight:1.3,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>{n.title}</h3>
                          <p style={{fontSize:13,color:G.muted,lineHeight:1.6,marginBottom:10,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:3,WebkitBoxOrient:"vertical"}}>{n.body}</p>
                          <div style={{fontSize:11,color:G.mutedL}}>{fmtDate(n.date)} · {n.author}</div>
                        </div>
                      </div>
                    );
                  }}
                />
              </div>
            )}
          </div>
        )}

        {/* ALL EVENTS */}
        {tab==="events"&&(
          <div className="fade-up">
            <h2 style={{fontFamily:"Syne",fontSize:24,fontWeight:800,marginBottom:6}}>All Events</h2>
            <p style={{color:G.muted,fontSize:13,marginBottom:18}}>Next 2 months · ☆ star to pin · tap to view</p>
            <div style={{display:"flex",gap:10,marginBottom:12,flexWrap:"wrap"}}>
              <input placeholder="🔍 Search…" value={search} onChange={e=>setSearch(e.target.value)} style={{maxWidth:240}}/>
              <button className="btn btn-g btn-sm" style={{padding:"10px 14px"}} onClick={()=>{setPickerTarget("filter");setShowBasePicker(true);}}>🏢 {filterBase==="all"?"All Bases":bases.find(b=>b.id===+filterBase)?.short} ▾</button>
              <select value={filterType} onChange={e=>setFilterType(e.target.value)} style={{maxWidth:150}}>
                <option value="all">All Types</option>
                {types.map(t=><option key={t}>{t}</option>)}
              </select>
              {(filterBase!=="all"||filterType!=="all"||search)&&<button className="btn btn-g btn-sm" onClick={()=>{setFilterBase("all");setFilterType("all");setSearch("");}}>✕ Clear</button>}
            </div>
            <div className="chips" style={{marginBottom:20}}>
              <div className={`chip${filterBase==="all"?" on":""}`} style={{"--cc":G.accent}} onClick={()=>setFilterBase("all")}>All</div>
              {bases.map(b=><div key={b.id} className={`chip${filterBase===String(b.id)?" on":""}`} style={{"--cc":b.color}} onClick={()=>setFilterBase(String(b.id))}>{b.short}</div>)}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:18}}>
              {filtered.map((e,i)=><div key={e.id} className="fade-up" style={{animationDelay:`${Math.min(i,8)*.04}s`}}><EventCard ev={e} bases={bases} onPin={togglePin} pins={pins} onClick={setSelEv}/></div>)}
            </div>
            {filtered.length===0&&<div style={{textAlign:"center",padding:"50px 20px",color:G.muted}}><div style={{fontSize:38,marginBottom:10}}>🔍</div><p>No events match your filters.</p></div>}
          </div>
        )}

        {/* NOTIFICATIONS */}
        {tab==="notifs"&&(
          <div className="fade-up">
            <div style={{marginBottom:22}}>
              <h2 style={{fontFamily:"Syne",fontSize:24,fontWeight:800,marginBottom:6}}>🔔 Notifications</h2>
              <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                <span style={{fontSize:13,color:G.muted}}>Showing for</span>
                <span className="badge" style={{background:`${myBase?.color}18`,color:myBase?.color,border:`1px solid ${myBase?.color}30`}}>{myBase?.name}</span>
              </div>
            </div>
            {myNotifs.length===0
              ?<div style={{textAlign:"center",padding:"60px 20px",color:G.muted}}><div style={{fontSize:44,marginBottom:12}}>🔕</div><p style={{fontSize:15,fontWeight:600,marginBottom:6}}>All caught up</p><p style={{fontSize:13}}>No notifications for your base.</p></div>
              :<div style={{display:"flex",flexDirection:"column",gap:12}}>
                {myNotifs.map((a,i)=>(
                  <div key={a.id} className="h-row glass fade-up" style={{borderRadius:16,padding:"15px 18px",borderLeft:`4px solid ${a.urgent?G.danger:G.accent}`,display:"flex",gap:12,alignItems:"flex-start",animationDelay:`${i*.06}s`}}
                    onClick={()=>setSelAnn(a)}>
                    {a.urgent&&<div className="pulse-dot" style={{marginTop:5}}/>}
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4,flexWrap:"wrap"}}>
                        <span style={{fontWeight:700,fontSize:15,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{a.title}</span>
                        {a.urgent&&<span className="badge" style={{background:"rgba(239,68,68,.12)",color:G.danger,border:"1px solid rgba(239,68,68,.25)",flexShrink:0}}>🚨 Urgent</span>}
                      </div>
                      <p style={{fontSize:13,color:G.muted,lineHeight:1.6}}>{a.body}</p>
                    </div>
                    <span style={{fontSize:11,color:G.muted,whiteSpace:"nowrap",flexShrink:0,marginTop:2}}>{a.time}</span>
                  </div>
                ))}
              </div>}
          </div>
        )}

        {/* NEWS TAB */}
        {tab==="news"&&(
          <div className="fade-up">
            <div style={{marginBottom:22}}>
              <h2 style={{fontFamily:"Syne",fontSize:24,fontWeight:800,marginBottom:6}}>📰 News</h2>
              <p style={{fontSize:13,color:G.muted}}>Latest news and updates. Tap any card to read more.</p>
            </div>
            {publishedNews.length===0
              ?<div style={{textAlign:"center",padding:"60px 20px",color:G.muted}}><div style={{fontSize:44,marginBottom:12}}>📭</div><p style={{fontSize:15,fontWeight:600,marginBottom:6}}>No news yet</p><p style={{fontSize:13}}>Check back soon.</p></div>
              :<Carousel
                  items={publishedNews}
                  cardWidth={320}
                  renderItem={n=>{
                    const base=bases.find(b=>b.id===n.baseId);
                    return (
                      <div className="news-card shimmer" style={{cursor:"pointer"}} onClick={()=>setSelNews(n)}>
                        {n.image&&<img src={n.image} alt={n.title} style={{width:"100%",height:200,objectFit:"cover"}}/>}
                        <div style={{padding:"16px 18px 20px"}}>
                          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10,flexWrap:"wrap"}}>
                            <span className="badge" style={{background:"rgba(52,211,153,.12)",color:G.ok,border:"1px solid rgba(52,211,153,.25)"}}>📰 News</span>
                            {base&&<span style={{fontSize:11,color:G.muted}}>{base.short}</span>}
                          </div>
                          <h3 style={{fontFamily:"Syne",fontSize:16,fontWeight:700,marginBottom:8,lineHeight:1.3,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>{n.title}</h3>
                          <p style={{fontSize:13,color:G.muted,lineHeight:1.65,marginBottom:12,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:4,WebkitBoxOrient:"vertical"}}>{n.body}</p>
                          <div style={{fontSize:11,color:G.mutedL}}>{fmtDate(n.date)} · {n.author}</div>
                        </div>
                      </div>
                    );
                  }}
                />}
          </div>
        )}

        {/* BASES */}
        {tab==="bases"&&(
          <div className="fade-up">
            <div style={{marginBottom:22}}>
              <h2 style={{fontFamily:"Syne",fontSize:24,fontWeight:800,marginBottom:6}}>🏢 All Bases</h2>
              <p style={{fontSize:13,color:G.muted}}>Tap a base to filter events for that base.</p>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(230px,1fr))",gap:16}}>
              {bases.map((b,i)=>{
                const bEvs=events.filter(e=>within2Mo(e.date)&&e.baseId===b.id);
                const isMyBase=b.id===user.baseId;
                const bNotifs=announcements.filter(a=>a.baseId===b.id);
                return (
                  <div key={b.id} className="h-stat fade-up" style={{background:G.card,borderRadius:20,padding:18,border:`1px solid ${isMyBase?b.color+"44":G.border}`,borderTop:`3px solid ${b.color}`,animationDelay:`${i*.05}s`,position:"relative"}}
                    onClick={()=>{setFilterBase(String(b.id));setTab("events");}}>
                    {isMyBase&&<div style={{position:"absolute",top:12,right:12}}><span className="badge" style={{background:`${b.color}18`,color:b.color,border:`1px solid ${b.color}30`,fontSize:10}}>My Base</span></div>}
                    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
                      <div style={{width:42,height:42,borderRadius:12,background:`${b.color}16`,border:`1px solid ${b.color}30`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:12,color:b.color,fontFamily:"Syne,sans-serif",flexShrink:0}}>{b.short}</div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontWeight:700,fontSize:14,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{b.name}</div>
                        <div style={{fontSize:11,color:G.muted}}>Base ID: {b.id}</div>
                      </div>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
                      <div style={{textAlign:"center",background:"rgba(255,255,255,.03)",borderRadius:10,padding:"8px 4px",border:`1px solid ${G.border}`}}>
                        <div style={{fontFamily:"Syne",fontWeight:800,fontSize:20,color:b.color}}>{bEvs.length}</div>
                        <div style={{fontSize:11,color:G.muted}}>Events</div>
                      </div>
                      <div style={{textAlign:"center",background:"rgba(255,255,255,.03)",borderRadius:10,padding:"8px 4px",border:`1px solid ${G.border}`}}>
                        <div style={{fontFamily:"Syne",fontWeight:800,fontSize:20,color:b.color}}>{bNotifs.length}</div>
                        <div style={{fontSize:11,color:G.muted}}>Alerts</div>
                      </div>
                    </div>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                      <span style={{fontSize:12,color:b.color,fontWeight:600}}>View events →</span>
                      {bNotifs.some(n=>n.urgent)&&<div className="pulse-dot"/>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* CALENDAR */}
        {tab==="calendar"&&(
          <div className="fade-up">
            <h2 style={{fontFamily:"Syne",fontSize:24,fontWeight:800,marginBottom:6}}>📆 Calendar</h2>
            <p style={{color:G.muted,fontSize:13,marginBottom:22}}>Tap any date to see events. Covers the next 2 months.</p>
            <div style={{maxWidth:520}}><CalendarView events={events.filter(e=>within2Mo(e.date))} bases={bases}/></div>
          </div>
        )}
      </div>

      {selEv&&<EventModal ev={selEv} bases={bases} onClose={()=>setSelEv(null)} onPin={togglePin} pins={pins}/>}
      {selNews&&<NewsModal post={selNews} bases={bases} onClose={()=>setSelNews(null)}/>}
      {selAnn&&<AnnouncementModal ann={selAnn} bases={bases} onClose={()=>setSelAnn(null)}/>}
      {showBasePicker&&<BasePickerModal bases={bases} onClose={()=>setShowBasePicker(false)} onSelect={b=>{if(pickerTarget==="filter"){setFilterBase(String(b.id));setTab("events");}setShowBasePicker(false);}}/>}
      {showProfile&&<ProfileModal user={user} bases={bases} onSave={handleProfileSave} onClose={()=>setShowProfile(false)}/>}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
// EXPORTS — seed data for Firebase seeding in App.js
// ═══════════════════════════════════════════════════════════════
export { EVENTS_INIT, ANNOUNCEMENTS_INIT, USERS_INIT, BASES_INIT, NEWS_INIT };

// ═══════════════════════════════════════════════════════════════
// ROOT — AUTH ROUTER
// Accepts optional Firebase props from App.js wrapper.
// Falls back to local seed data if props not provided.
// ═══════════════════════════════════════════════════════════════
export default function EventApp({
  initialEvents,
  initialAnnouncements,
  initialUsers,
  initialBases,
  initialNews,
  uploadFile,       // async (file, folder) => { url, type }
  onEventSave,      // async (event) => void
  onEventDelete,    // async (event) => void
  onAnnouncementSave,
  onAnnouncementDelete,
  onUserSave,
  onUserDelete,
  onBaseSave,
  onBaseDelete,
  onNewsSave,
  onNewsDelete,
} = {}) {
  const [events,        setEventsRaw]        = useState(initialEvents        || EVENTS_INIT);
  const [announcements, setAnnouncementsRaw] = useState(initialAnnouncements || ANNOUNCEMENTS_INIT);
  const [users,         setUsersRaw]         = useState(initialUsers         || USERS_INIT);
  const [bases,         setBasesRaw]         = useState(initialBases         || BASES_INIT);
  const [news,          setNewsRaw]          = useState(initialNews          || NEWS_INIT);
  const [user,          setUser]          = useState(null);
  const [adminUser,     setAdminUser]     = useState(null);
  const [screen,        setScreen]        = useState("user-login");

  // Sync from parent if Firebase provides updated data
  useEffect(() => { if (initialEvents)        setEventsRaw(initialEvents); },        [initialEvents]);
  useEffect(() => { if (initialAnnouncements) setAnnouncementsRaw(initialAnnouncements); }, [initialAnnouncements]);
  useEffect(() => { if (initialUsers)         setUsersRaw(initialUsers); },          [initialUsers]);
  useEffect(() => { if (initialBases)         setBasesRaw(initialBases); },          [initialBases]);
  useEffect(() => { if (initialNews)          setNewsRaw(initialNews); },            [initialNews]);

  // Wrapped setters that also persist to Firestore
  const setEvents = cb => setEventsRaw(prev => {
    const next = typeof cb === "function" ? cb(prev) : cb;
    // Detect added/changed item and persist
    const changed = next.find(n => !prev.find(p => p.id === n.id && JSON.stringify(p) === JSON.stringify(n)));
    if (changed && onEventSave) onEventSave(changed).catch(console.warn);
    return next;
  });
  const setAnnouncements = cb => setAnnouncementsRaw(prev => {
    const next = typeof cb === "function" ? cb(prev) : cb;
    const changed = next.find(n => !prev.find(p => p.id === n.id && JSON.stringify(p) === JSON.stringify(n)));
    if (changed && onAnnouncementSave) onAnnouncementSave(changed).catch(console.warn);
    return next;
  });
  const setUsers = cb => setUsersRaw(prev => {
    const next = typeof cb === "function" ? cb(prev) : cb;
    const changed = next.find(n => !prev.find(p => p.id === n.id && JSON.stringify(p) === JSON.stringify(n)));
    if (changed && onUserSave) onUserSave(changed).catch(console.warn);
    return next;
  });
  const setBases = cb => setBasesRaw(prev => {
    const next = typeof cb === "function" ? cb(prev) : cb;
    const changed = next.find(n => !prev.find(p => p.id === n.id && JSON.stringify(p) === JSON.stringify(n)));
    if (changed && onBaseSave) onBaseSave(changed).catch(console.warn);
    return next;
  });
  const setNews = cb => setNewsRaw(prev => {
    const next = typeof cb === "function" ? cb(prev) : cb;
    const changed = next.find(n => !prev.find(p => p.id === n.id && JSON.stringify(p) === JSON.stringify(n)));
    if (changed && onNewsSave) onNewsSave(changed).catch(console.warn);
    return next;
  });

  const handleUserLogin  = u => { if(u.firstLogin){setUser(u);setScreen("first-login");}else{setUser(u);setScreen("user-app");} };
  const handleFirstLogin = pw => { setUsers(p=>p.map(u=>u.id===user.id?{...u,password:pw,firstLogin:false}:u)); setUser(p=>({...p,password:pw,firstLogin:false})); setScreen("user-app"); };
  const handleAdminLogin = a => { setAdminUser(a); setScreen("admin-app"); };
  const handleAdminLogout= () => { setAdminUser(null); setScreen("user-login"); };
  const handleUserLogout = () => { setUser(null); setScreen("user-login"); };

  return (
    <>
      <style>{CSS}</style>
      {screen==="user-login"  && <UserLogin  users={users} onLogin={handleUserLogin} onAdminLogin={()=>setScreen("admin-login")}/>}
      {screen==="admin-login" && <AdminLogin users={users} onLogin={handleAdminLogin} onBack={()=>setScreen("user-login")}/>}
      {screen==="first-login" && <ChangePwModal onSave={handleFirstLogin}/>}
      {screen==="user-app"    && <UserApp user={user} setUser={u=>{if(!u)handleUserLogout();else setUser(u);}} events={events} users={users} setUsers={setUsers} announcements={announcements} bases={bases} news={news}/>}
      {screen==="admin-app"   && <AdminDashboard admin={adminUser} events={events} setEvents={setEvents} users={users} setUsers={setUsers} announcements={announcements} setAnnouncements={setAnnouncements} bases={bases} setBases={setBases} news={news} setNews={setNews} uploadFile={uploadFile} onLogout={handleAdminLogout}/>}
    </>
  );
}
