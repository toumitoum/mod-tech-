"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://djiosqlexflaqzrtuyqc.supabase.co",
  "sb_publishable_JMN6dsJOA2lUpSLYQcKD8A_3xBlz3bV"
);

type Row = { id: number; section: string; content: any; updated_at: string };
type Status = "idle"|"loading"|"saving"|"error";
type Slide = {
  id?: number;
  title: string;
  description: string;
  image: string;
  sort_order: number;
  is_active: boolean;
  created_at?: string;
};

const teal = "#0d9488";
const tG = "linear-gradient(135deg,#0d9488,#0f766e)";

function ms(dark: boolean) {
  return {
    bg: dark?"#0a0f1a":"#f1f5f9",
    sb: dark?"rgba(15,23,42,0.95)":"#fff",
    card: dark?"rgba(15,23,42,0.8)":"#fff",
    ci: dark?"rgba(20,30,50,0.6)":"#f8fafc",
    tx: dark?"#e2e8f0":"#1e293b",
    sub: dark?"#64748b":"#94a3b8",
    brd: dark?"rgba(51,65,85,0.6)":"#e2e8f0",
    ibg: dark?"rgba(10,15,26,0.8)":"#fff",
    top: dark?"rgba(15,23,42,0.98)":"rgba(255,255,255,0.98)",
    mut: dark?"#94a3b8":"#64748b",
    sbtn:(a:boolean)=>({
      background:a?(dark?"rgba(13,148,136,0.15)":"rgba(13,148,136,0.08)"):"transparent",
      border:a?"1px solid rgba(13,148,136,0.4)":"1px solid transparent",
      borderRadius:10,padding:"11px 14px",textAlign:"left" as const,
      color:a?teal:(dark?"#94a3b8":"#64748b"),
      cursor:"pointer",fontSize:13.5,fontWeight:a?700:500,
      display:"flex",alignItems:"center",justifyContent:"space-between",
      transition:"all 0.15s",width:"100%",
    }),
  };
}

function Field({label,value,onChange,multi,dark}:{label:string;value:string;onChange:(v:string)=>void;multi?:boolean;dark:boolean}) {
  const s=ms(dark);
  const base:React.CSSProperties={background:s.ibg,border:"1px solid "+s.brd,borderRadius:8,padding:"10px 13px",color:s.tx,fontSize:14,width:"100%",outline:"none",fontFamily:"inherit",boxSizing:"border-box"};
  return (
    <div style={{display:"grid",gridTemplateColumns:"130px 1fr",gap:12,alignItems:"start"}}>
      <label style={{fontSize:11,fontWeight:700,color:s.mut,textTransform:"uppercase",letterSpacing:"0.08em",paddingTop:12,fontFamily:"monospace"}}>{label}</label>
      {multi?<textarea rows={3} value={value} onChange={e=>onChange(e.target.value)} style={{...base,resize:"vertical"}}/>:<input value={value} onChange={e=>onChange(e.target.value)} style={base}/>}
    </div>
  );
}

function ImgUpload({
  label,
  cur,
  path,
  onDone,
  dark,
  height = 100
}: {
  label: string;
  cur: string;
  path: string;
  onDone: (u: string) => void;
  dark: boolean;
  height?: number;
}) {
  const s = ms(dark);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(cur);
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPreview(cur);
  }, [cur]);

  const upload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("الملف يجب أن يكون صورة");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("حجم الصورة يجب أن يكون أقل من 2MB");
      return;
    }

    setUploading(true);

    const ext = file.name.split(".").pop();
    const fileName = `${path}-${crypto.randomUUID()}.${ext}`;

    const { error } = await supabase.storage
      .from("site-images")
      .upload(fileName, file, { upsert: true });

    if (error) {
      alert("Upload error: " + error.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage
      .from("site-images")
      .getPublicUrl(fileName);

    setPreview(data.publicUrl);
    onDone(data.publicUrl);
    setUploading(false);
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "130px 1fr", gap: 12 }}>
      <label style={{
        fontSize: 11,
        fontWeight: 700,
        color: s.mut,
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        paddingTop: 12,
        fontFamily: "monospace"
      }}>
        {label}
      </label>

      <div>
        {preview ? (
          <div style={{
            marginBottom: 10,
            borderRadius: 10,
            overflow: "hidden",
            border: "1px solid " + s.brd,
            position: "relative"
          }}>
            <img src={preview} style={{
              width: "100%",
              height,
              objectFit: "cover"
            }} />

            <button
              onClick={() => {
                setPreview("");
                onDone("");
              }}
              style={{
                position: "absolute",
                top: 6,
                right: 6,
                background: "red",
                border: "none",
                borderRadius: 6,
                color: "#fff",
                cursor: "pointer",
                fontSize: 11,
                padding: "3px 8px"
              }}
            >
              ✕
            </button>
          </div>
        ) : (
          <div style={{
            marginBottom: 10,
            borderRadius: 10,
            border: "1px dashed " + s.brd,
            height,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: s.sub,
            fontSize: 12
          }}>
            لا توجد صورة
          </div>
        )}

        <input
          ref={ref}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={e => {
            const file = e.target.files?.[0];
            if (file) upload(file);
          }}
        />

        <button
          onClick={() => ref.current?.click()}
          disabled={uploading}
          style={{
            background: "rgba(13,148,136,0.1)",
            border: "1px dashed rgba(13,148,136,0.4)",
            borderRadius: 8,
            padding: "8px 16px",
            color: "#0d9488",
            fontSize: 13,
            fontWeight: 600,
            cursor: uploading ? "not-allowed" : "pointer"
          }}
        >
          {uploading ? "Uploading..." : "Upload image"}
        </button>
      </div>
    </div>
  );
}

// ── SLIDER MANAGER ──────────────────────────────────────────────────────────
function SliderEd({ data, onChange, dark }: { data: Slide[]; onChange: (d: Slide[]) => void; dark: boolean }) {
  const s = ms(dark);
  
  const updateSlide = (index: number, field: keyof Slide, value: any) => {
    const newData = [...data];
    newData[index] = { ...newData[index], [field]: value };
    onChange(newData);
  };

  const deleteSlide = (index: number) => {
    const newData = data.filter((_, i) => i !== index);
    onChange(newData);
  };

  const addSlide = () => {
    const newSlide: Slide = {
      id: Date.now(),
      title: "New Slide",
      description: "Slide description",
      image: "",
      sort_order: data.length,
      is_active: true
    };
    onChange([...data, newSlide]);
  };

  const moveSlide = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === data.length - 1)) return;
    
    const newData = [...data];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [newData[index], newData[newIndex]] = [newData[newIndex], newData[index]];
    
    // Update sort_order
    newData.forEach((slide, i) => {
      slide.sort_order = i;
    });
    
    onChange(newData);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {data.map((slide, index) => (
        <div
          key={slide.id || index}
          style={{
            background: s.ci,
            border: "1px solid " + s.brd,
            borderRadius: 16,
            padding: 20,
            opacity: slide.is_active ? 1 : 0.6
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 24 }}>🖼️</span>
              <div>
                <span style={{ fontSize: 14, fontWeight: 700, color: teal, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                  Slide {index + 1}
                </span>
                <div style={{ fontSize: 11, color: s.sub, marginTop: 2 }}>
                  Order: {slide.sort_order}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => moveSlide(index, 'up')}
                disabled={index === 0}
                style={{
                  background: "transparent",
                  border: "1px solid " + s.brd,
                  borderRadius: 6,
                  padding: "4px 10px",
                  color: s.tx,
                  cursor: index === 0 ? "not-allowed" : "pointer",
                  opacity: index === 0 ? 0.3 : 1
                }}
              >
                ↑
              </button>
              <button
                onClick={() => moveSlide(index, 'down')}
                disabled={index === data.length - 1}
                style={{
                  background: "transparent",
                  border: "1px solid " + s.brd,
                  borderRadius: 6,
                  padding: "4px 10px",
                  color: s.tx,
                  cursor: index === data.length - 1 ? "not-allowed" : "pointer",
                  opacity: index === data.length - 1 ? 0.3 : 1
                }}
              >
                ↓
              </button>
              <button
                onClick={() => deleteSlide(index)}
                style={{
                  background: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.2)",
                  color: "#f87171",
                  borderRadius: 6,
                  padding: "4px 12px",
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 600
                }}
              >
                ✕ Delete
              </button>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Field
              label="Title"
              value={slide.title || ""}
              onChange={(v) => updateSlide(index, "title", v)}
              dark={dark}
            />
            
            <Field
              label="Description"
              value={slide.description || ""}
              onChange={(v) => updateSlide(index, "description", v)}
              multi
              dark={dark}
            />

            <ImgUpload
              label="Image"
              cur={slide.image || ""}
              path={`slide-${index}`}
              onDone={(v) => updateSlide(index, "image", v)}
              dark={dark}
              height={160}
            />

            <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8 }}>
              <label style={{ fontSize: 13, color: s.tx, display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  type="checkbox"
                  checked={slide.is_active}
                  onChange={(e) => updateSlide(index, "is_active", e.target.checked)}
                  style={{ width: 16, height: 16 }}
                />
                Active
              </label>
            </div>
          </div>
        </div>
      ))}

      <button
        onClick={addSlide}
        style={{
          border: "2px dashed rgba(13,148,136,0.3)",
          background: "transparent",
          color: teal,
          borderRadius: 12,
          padding: 20,
          cursor: "pointer",
          fontSize: 14,
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8
        }}
      >
        <span style={{ fontSize: 20 }}>+</span> Add New Slide
      </button>

      {data.length === 0 && (
        <div style={{ textAlign: "center", padding: 40, color: s.sub, border: "1px dashed " + s.brd, borderRadius: 12 }}>
          No slides yet. Click the button above to add your first slide.
        </div>
      )}
    </div>
  );
}

// ── HERO ──────────────────────────────────────────────────────────────────────
function HeroEd({data,onChange,dark}:{data:any;onChange:(d:any)=>void;dark:boolean}) {
  const f=(k:string,v:string)=>onChange({...data,[k]:v});
  return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <Field label="Titre" value={data.title??""} onChange={v=>f("title",v)} dark={dark}/>
      <Field label="Highlight" value={data.titleHighlight??""} onChange={v=>f("titleHighlight",v)} dark={dark}/>
      <Field label="Sous-titre" value={data.subtitle??""} onChange={v=>f("subtitle",v)} multi dark={dark}/>
      <Field label="Badge" value={data.badge??""} onChange={v=>f("badge",v)} dark={dark}/>
      <Field label="Btn Principal" value={data.btnPrimary??""} onChange={v=>f("btnPrimary",v)} dark={dark}/>
      <Field label="Btn Secondaire" value={data.btnSecondary??""} onChange={v=>f("btnSecondary",v)} dark={dark}/>
      <ImgUpload label="Image Hero" cur={data.bgImage??""} path="hero-bg" onDone={v=>f("bgImage",v)} dark={dark} height={140}/>
      <ImgUpload label="Logo" cur={data.logoUrl??""} path="logo" onDone={v=>f("logoUrl",v)} dark={dark} height={80}/>
    </div>
  );
}

// ── SERVICES ──────────────────────────────────────────────────────────────────
function ServicesEd({data,onChange,dark}:{data:any[];onChange:(d:any[])=>void;dark:boolean}) {
  const s=ms(dark);
  const upd=(i:number,k:string,v:string)=>onChange(data.map((x,j)=>j===i?{...x,[k]:v}:x));
  const del=(i:number)=>onChange(data.filter((_,j)=>j!==i));
  const add=()=>onChange([...data,{id:Date.now(),title:"Nouveau service",description:"",icon:"⚙️",image:""}]);

  return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      {data.map((svc,i)=>(
        <div key={svc.id??i} style={{background:s.ci,border:"1px solid "+s.brd,borderRadius:14,padding:20}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:24}}>{svc.icon}</span>
              <span style={{fontSize:11,fontWeight:700,color:teal,textTransform:"uppercase",letterSpacing:"0.1em"}}>Service {i+1}</span>
            </div>
            <button onClick={()=>del(i)} style={{background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.2)",color:"#f87171",borderRadius:7,padding:"4px 12px",cursor:"pointer",fontSize:12,fontWeight:600}}>✕ Supprimer</button>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <Field label="Icône" value={svc.icon??""} onChange={v=>upd(i,"icon",v)} dark={dark}/>
            <Field label="Titre" value={svc.title??""} onChange={v=>upd(i,"title",v)} dark={dark}/>
            <Field label="Description" value={svc.description??""} onChange={v=>upd(i,"description",v)} multi dark={dark}/>
            <ImgUpload
              label="Photo"
              cur={svc.image??""}
              path={"service-"+i}
              onDone={v=>upd(i,"image",v)}
              dark={dark}
              height={120}
            />
          </div>
        </div>
      ))}
      <button onClick={add} style={{border:"2px dashed rgba(13,148,136,0.3)",background:"transparent",color:teal,borderRadius:12,padding:14,cursor:"pointer",fontSize:14,fontWeight:600}}>+ Ajouter un service</button>
    </div>
  );
}

// ── ABOUT ─────────────────────────────────────────────────────────────────────
function AboutEd({data,onChange,dark}:{data:any;onChange:(d:any)=>void;dark:boolean}) {
  const s=ms(dark);
  const f=(k:string,v:string)=>onChange({...data,[k]:v});
  return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <Field label="Titre" value={data.title??""} onChange={v=>f("title",v)} dark={dark}/>
      <Field label="Description" value={data.description??""} onChange={v=>f("description",v)} multi dark={dark}/>
      <Field label="Mission" value={data.mission??""} onChange={v=>f("mission",v)} multi dark={dark}/>
      <div style={{borderTop:"1px solid "+s.brd,paddingTop:16}}>
        <div style={{fontSize:11,fontWeight:700,color:s.mut,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:14}}>Statistiques</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
          {[["years","Années"],["clients","Clients"],["projects","Projets"]].map(([k,l])=>(
            <div key={k} style={{background:s.ci,border:"1px solid "+s.brd,borderRadius:12,padding:14,textAlign:"center"}}>
              <div style={{fontSize:11,color:s.sub,marginBottom:8,fontWeight:600}}>{l}</div>
              <input value={data[k]??""} onChange={e=>f(k,e.target.value)}
                style={{background:"transparent",border:"none",borderBottom:"1px solid "+s.brd,width:80,textAlign:"center",color:teal,fontSize:20,fontWeight:800,outline:"none",fontFamily:"inherit"}}/>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── CONTACT + SOCIAL ──────────────────────────────────────────────────────────
function ContactEd({data,onChange,dark}:{data:any;onChange:(d:any)=>void;dark:boolean}) {
  const s=ms(dark);
  const f=(k:string,v:string)=>onChange({...data,[k]:v});

  const socialFields = [
    { key:"facebook",  label:"Facebook",  placeholder:"https://facebook.com/...",  color:"#1877f2", icon:"𝕗" },
    { key:"instagram", label:"Instagram", placeholder:"https://instagram.com/...", color:"#e1306c", icon:"📷" },
    { key:"linkedin",  label:"LinkedIn",  placeholder:"https://linkedin.com/...",  color:"#0077b5", icon:"in" },
  ];

  return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      {/* Contact info */}
      <Field label="Téléphone 1" value={data.phone1??""} onChange={v=>f("phone1",v)} dark={dark}/>
      <Field label="Téléphone 2" value={data.phone2??""} onChange={v=>f("phone2",v)} dark={dark}/>
      <Field label="Email"       value={data.email??""} onChange={v=>f("email",v)} dark={dark}/>
      <Field label="Adresse"     value={data.address??""} onChange={v=>f("address",v)} dark={dark}/>
      <Field label="WhatsApp"    value={data.whatsapp??""} onChange={v=>f("whatsapp",v)} dark={dark}/>

      {/* Social media */}
      <div style={{borderTop:"1px solid "+s.brd,paddingTop:20,marginTop:4}}>
        <div style={{fontSize:11,fontWeight:700,color:s.mut,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:16}}>
          Réseaux Sociaux
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          {socialFields.map(({key,label,placeholder,color,icon})=>(
            <div key={key} style={{display:"grid",gridTemplateColumns:"130px 1fr",gap:12,alignItems:"center"}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <div style={{width:28,height:28,borderRadius:8,background:color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:"#fff",fontWeight:800,flexShrink:0}}>
                  {icon}
                </div>
                <label style={{fontSize:11,fontWeight:700,color:s.mut,textTransform:"uppercase",letterSpacing:"0.08em",fontFamily:"monospace"}}>{label}</label>
              </div>
              <input
                value={data[key]??""}
                onChange={e=>f(key,e.target.value)}
                placeholder={placeholder}
                style={{background:s.ibg,border:"1px solid "+s.brd,borderRadius:8,padding:"10px 13px",color:s.tx,fontSize:13,width:"100%",outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}
              />
            </div>
          ))}
        </div>

        {/* Preview links */}
        {(data.facebook||data.instagram||data.linkedin) && (
          <div style={{marginTop:16,display:"flex",gap:10,flexWrap:"wrap"}}>
            {data.facebook  && <a href={data.facebook}  target="_blank" rel="noreferrer" style={{fontSize:12,color:"#1877f2",textDecoration:"none",padding:"4px 12px",background:"rgba(24,119,242,0.1)",borderRadius:20,border:"1px solid rgba(24,119,242,0.2)"}}>🔗 Facebook</a>}
            {data.instagram && <a href={data.instagram} target="_blank" rel="noreferrer" style={{fontSize:12,color:"#e1306c",textDecoration:"none",padding:"4px 12px",background:"rgba(225,48,108,0.1)",borderRadius:20,border:"1px solid rgba(225,48,108,0.2)"}}>🔗 Instagram</a>}
            {data.linkedin  && <a href={data.linkedin}  target="_blank" rel="noreferrer" style={{fontSize:12,color:"#0077b5",textDecoration:"none",padding:"4px 12px",background:"rgba(0,119,181,0.1)",borderRadius:20,border:"1px solid rgba(0,119,181,0.2)"}}>🔗 LinkedIn</a>}
          </div>
        )}
      </div>
    </div>
  );
}

// ── NAV ───────────────────────────────────────────────────────────────────────
const NAV=[
  {key:"hero",    label:"Hero",     icon:"🏠", desc:"Titre, images, boutons"},
  {key:"slider",  label:"Slider",   icon:"🖼️", desc:"Images, titres, descriptions"},
  {key:"services",label:"Services", icon:"🛠", desc:"Cartes + photos"},
  {key:"about",   label:"À propos", icon:"ℹ️",  desc:"Stats & description"},
  {key:"contact", label:"Contact",  icon:"📞", desc:"Tél, email, réseaux sociaux"},
];

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function AdminPage() {
  const router=useRouter();
  const [rows,setRows]         = useState<Row[]>([]);
  const [active,setActive]     = useState("hero");
  const [drafts,setDrafts]     = useState<Record<string,any>>({});
  const [status,setStatus]     = useState<Status>("loading");
  const [msg,setMsg]           = useState("");
  const [mok,setMok]           = useState(true);
  const [dark,setDark]         = useState(true);
  const [open,setOpen]         = useState(true);
  const [connOk,setConnOk]     = useState<boolean|null>(null);

  useEffect(()=>{
    if(localStorage.getItem("mt_auth")!=="1") router.push("/login");
    const t=localStorage.getItem("mt_theme");
    if(t) setDark(t==="dark");
  },[router]);

  const s=ms(dark);

  // Load slider slides from the database
  const loadSlides = useCallback(async () => {
    const { data, error } = await supabase
      .from("slider_slides")
      .select("*")
      .order("sort_order", { ascending: true });
    
    if (error) {
      console.error("Error loading slides:", error);
      return [];
    }
    return data || [];
  }, []);

  // Save slider slides to the database
  const saveSlides = useCallback(async (slides: Slide[]) => {
    // First, delete all existing slides
    const { error: deleteError } = await supabase
      .from("slider_slides")
      .delete()
      .neq("id", 0); // Delete all rows
    
    if (deleteError) {
      console.error("Error deleting slides:", deleteError);
      return false;
    }

    // Then insert the new slides
    if (slides.length > 0) {
      const slidesToInsert = slides.map(({ id, created_at, ...slide }) => ({
        ...slide,
        sort_order: slide.sort_order
      }));

      const { error: insertError } = await supabase
        .from("slider_slides")
        .insert(slidesToInsert);
      
      if (insertError) {
        console.error("Error inserting slides:", insertError);
        return false;
      }
    }
    
    return true;
  }, []);

  const load=useCallback(async()=>{
    setStatus("loading");
    
    // Load site_content sections
    const{data,error}=await supabase.from("site_content").select("*").order("id");
    if(error){ setStatus("error"); setConnOk(false); return; }
    
    // Load slider slides
    const slides = await loadSlides();
    
    setConnOk(true);
    setRows(data??[]);
    const d:Record<string,any>={};
    (data??[]).forEach((r:Row)=>{ d[r.section]=JSON.parse(JSON.stringify(r.content)); });
    
    // Add slider slides to drafts
    d.slider = slides;
    
    setDrafts(d);
    setStatus("idle");
  },[loadSlides]);

  useEffect(()=>{ load(); },[load]);

  const notify=(text:string,ok=true)=>{ setMsg(text); setMok(ok); setTimeout(()=>setMsg(""),3500); };

  const save=async()=>{
    setStatus("saving");
    
    if (active === "slider") {
      // Save slider slides
      const success = await saveSlides(drafts.slider || []);
      if (success) {
        notify("✅ Slides sauvegardés !");
        await load();
      } else {
        notify("❌ Erreur lors de la sauvegarde des slides", false);
      }
    } else {
      // Save other sections to site_content
      const{error}=await supabase.from("site_content")
        .update({content:drafts[active],updated_at:new Date().toISOString()})
        .eq("section",active);
      if(error) notify("❌ "+error.message,false);
      else{ notify("✅ Sauvegardé !"); await load(); }
    }
    
    setStatus("idle");
  };

  const logout=()=>{ localStorage.removeItem("mt_auth"); router.push("/login"); };
  const togTheme=()=>{ const nd=!dark; setDark(nd); localStorage.setItem("mt_theme",nd?"dark":"light"); };

  const aRow     = rows.find(r=>r.section===active);
  
  // Fix the dirty check - remove await and use the current drafts
  const dirty = active === "slider" 
    ? JSON.stringify(drafts.slider) !== JSON.stringify(rows.find(r=>r.section==="slider")?.content || [])
    : JSON.stringify(drafts[active]) !== JSON.stringify(aRow?.content);
  
  const nDirty   = NAV.filter(n => {
    if (n.key === "slider") {
      return JSON.stringify(drafts.slider) !== JSON.stringify(rows.find(r=>r.section==="slider")?.content || []);
    }
    return JSON.stringify(drafts[n.key]) !== JSON.stringify(rows.find(r=>r.section===n.key)?.content);
  }).length;
  
  const setD     = (v:any)=>setDrafts(d=>({...d,[active]:v}));
  const reset    = ()=> {
    if (active === "slider") {
      setDrafts(d=>({...d, slider: rows.find(r=>r.section==="slider")?.content || []}));
    } else {
      setDrafts(d=>({...d,[active]:JSON.parse(JSON.stringify(aRow?.content))}));
    }
  };

  return (
    <div style={{minHeight:"100vh",background:s.bg,color:s.tx,fontFamily:"'Segoe UI',system-ui,sans-serif",transition:"background 0.3s"}}>

      {/* Topbar */}
      <div style={{background:s.top,borderBottom:"1px solid "+s.brd,height:62,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 24px",position:"sticky",top:0,zIndex:100,backdropFilter:"blur(12px)"}}>
        <div style={{display:"flex",alignItems:"center",gap:14}}>
          <button onClick={()=>setOpen(!open)} style={{background:"transparent",border:"none",cursor:"pointer",color:s.sub,fontSize:20,padding:4}}>☰</button>
          <div style={{width:34,height:34,borderRadius:9,background:tG,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17}}>⚙️</div>
          <div>
            <div style={{fontWeight:800,fontSize:15}}>MOD-TECH Admin</div>
            <div style={{fontSize:11,color:s.sub}}>Panneau d'administration</div>
          </div>
          {nDirty>0&&<div style={{background:"rgba(245,158,11,0.15)",border:"1px solid rgba(245,158,11,0.3)",borderRadius:20,padding:"3px 10px",fontSize:12,color:"#f59e0b",fontWeight:700}}>{nDirty} modification{nDirty>1?"s":""}</div>}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          {msg&&<div style={{fontSize:13,fontWeight:600,padding:"7px 16px",borderRadius:9,background:mok?"rgba(52,211,153,0.12)":"rgba(239,68,68,0.12)",color:mok?"#34d399":"#f87171",border:"1px solid "+(mok?"rgba(52,211,153,0.25)":"rgba(239,68,68,0.25)")}}>{msg}</div>}
          <button onClick={togTheme} style={{background:dark?"rgba(51,65,85,0.4)":"rgba(226,232,240,0.8)",border:"1px solid "+s.brd,borderRadius:9,padding:"7px 12px",cursor:"pointer",color:s.tx,fontSize:17}}>{dark?"☀️":"🌙"}</button>
          <button onClick={logout} style={{background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.2)",borderRadius:9,padding:"7px 14px",cursor:"pointer",color:"#f87171",fontSize:13,fontWeight:600}}>🚪 Déconnexion</button>
        </div>
      </div>

      <div style={{display:"flex",minHeight:"calc(100vh - 62px)"}}>

        {/* Sidebar */}
        <div style={{width:open?250:0,overflow:"hidden",transition:"width 0.25s",background:s.sb,borderRight:"1px solid "+s.brd,display:"flex",flexDirection:"column",flexShrink:0}}>
          <div style={{padding:"20px 14px",display:"flex",flexDirection:"column",gap:4,flex:1}}>
            <div style={{fontSize:10,fontWeight:700,color:s.sub,textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:8,paddingLeft:4}}>Sections</div>
            {NAV.map(({key,label,icon,desc})=>{
              const row=rows.find(r=>r.section===key);
              const d=key === "slider" 
                ? JSON.stringify(drafts.slider) !== JSON.stringify(row?.content || [])
                : JSON.stringify(drafts[key]) !== JSON.stringify(row?.content);
              return (
                <button key={key} onClick={()=>setActive(key)} style={s.sbtn(active===key)}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <span style={{fontSize:18}}>{icon}</span>
                    <div style={{textAlign:"left"}}>
                      <div style={{fontWeight:active===key?700:500,whiteSpace:"nowrap"}}>{label}</div>
                      <div style={{fontSize:10,color:s.sub,whiteSpace:"nowrap"}}>{desc}</div>
                    </div>
                  </div>
                  {d&&<span style={{width:7,height:7,borderRadius:"50%",background:"#f59e0b",flexShrink:0}}/>}
                </button>
              );
            })}
          </div>

          {/* Supabase status */}
          <div style={{margin:"0 14px 20px",padding:14,background:dark?"rgba(13,148,136,0.06)":"rgba(13,148,136,0.04)",border:"1px solid rgba(13,148,136,0.15)",borderRadius:12}}>
            <div style={{fontSize:10,fontWeight:700,color:teal,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>Supabase</div>
            <div style={{fontSize:11,color:s.sub,marginBottom:6}}>djiosqlexflaqzrtuyqc</div>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <div style={{width:8,height:8,borderRadius:"50%",background:connOk===null?"#f59e0b":connOk?"#10b981":"#ef4444",boxShadow:connOk?"0 0 6px #10b981":"none"}}/>
              <span style={{fontSize:12,fontWeight:600,color:connOk===null?s.sub:connOk?"#10b981":"#ef4444"}}>
                {connOk===null?"Connexion...":connOk?"Connecté ✓":"Erreur ✗"}
              </span>
            </div>
            {connOk&&<button onClick={load} style={{marginTop:10,background:"transparent",border:"1px solid rgba(13,148,136,0.3)",borderRadius:6,padding:"4px 10px",color:teal,fontSize:11,cursor:"pointer",fontWeight:600}}>🔄 Rafraîchir</button>}
          </div>
        </div>

        {/* Editor */}
        <div style={{flex:1,overflowY:"auto",padding:32}}>
          {status==="loading"?(
            <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:300,flexDirection:"column",gap:16,color:s.sub}}>
              <div style={{width:44,height:44,border:"3px solid rgba(13,148,136,0.2)",borderTop:"3px solid "+teal,borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>
              <span>Connexion à Supabase...</span>
            </div>
          ):status==="error"?(
            <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:300,flexDirection:"column",gap:16}}>
              <div style={{fontSize:48}}>❌</div>
              <div style={{fontSize:18,fontWeight:700,color:"#f87171"}}>Erreur de connexion</div>
              <button onClick={load} style={{background:tG,border:"none",borderRadius:10,padding:"10px 24px",color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer",marginTop:8}}>🔄 Réessayer</button>
            </div>
          ):(
            <div style={{maxWidth:800}}>
              <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:28,paddingBottom:20,borderBottom:"1px solid "+s.brd}}>
                <div>
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
                    <span style={{fontSize:26}}>{NAV.find(n=>n.key===active)?.icon}</span>
                    <h1 style={{margin:0,fontSize:22,fontWeight:800}}>{NAV.find(n=>n.key===active)?.label}</h1>
                    {dirty&&<span style={{fontSize:11,fontWeight:700,color:"#f59e0b",background:"rgba(245,158,11,0.12)",border:"1px solid rgba(245,158,11,0.25)",borderRadius:20,padding:"2px 10px"}}>Non sauvegardé</span>}
                  </div>
                  {aRow && active !== "slider" && <div style={{fontSize:12,color:s.sub}}>Modifié : {new Date(aRow.updated_at).toLocaleString("fr-DZ")}</div>}
                </div>
                <div style={{display:"flex",gap:8}}>
                  {dirty&&<button onClick={reset} style={{background:"transparent",border:"1px solid "+s.brd,color:s.sub,borderRadius:9,padding:"9px 16px",cursor:"pointer",fontSize:13,fontWeight:600}}>↺ Annuler</button>}
                  <button onClick={save} disabled={!dirty||status==="saving"} style={{background:dirty?tG:"rgba(51,65,85,0.3)",border:"none",borderRadius:9,padding:"9px 22px",color:dirty?"#fff":s.sub,fontSize:14,fontWeight:700,cursor:dirty?"pointer":"not-allowed"}}>
                    {status==="saving"?"⏳ Sauvegarde...":"💾 Sauvegarder"}
                  </button>
                </div>
              </div>

              <div style={{background:s.card,border:"1px solid "+s.brd,borderRadius:16,padding:28}}>
                {active==="hero"     && drafts.hero     && <HeroEd     data={drafts.hero}     onChange={setD} dark={dark}/>}
                {active==="slider"   && drafts.slider   && <SliderEd   data={drafts.slider}   onChange={setD} dark={dark}/>}
                {active==="services" && drafts.services && <ServicesEd data={drafts.services} onChange={setD} dark={dark}/>}
                {active==="about"    && drafts.about    && <AboutEd    data={drafts.about}    onChange={setD} dark={dark}/>}
                {active==="contact"  && drafts.contact  && <ContactEd  data={drafts.contact}  onChange={setD} dark={dark}/>}
              </div>
            </div>
          )}
        </div>
      </div>
      <style>{`*{box-sizing:border-box;}input:focus,textarea:focus{border-color:rgba(13,148,136,0.7)!important;box-shadow:0 0 0 3px rgba(13,148,136,0.12)!important;}@keyframes spin{to{transform:rotate(360deg);}}::-webkit-scrollbar{width:6px;}::-webkit-scrollbar-thumb{background:rgba(100,116,139,0.3);border-radius:4px;}a:hover{opacity:0.8;}`}</style>
    </div>
  );
}