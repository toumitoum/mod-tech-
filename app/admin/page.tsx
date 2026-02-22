"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/supabase";

type Row    = { id: number; section: string; content: any; updated_at: string };
type Slide  = { id: number; title: string; description: string; image: string; sort_order: number; is_active: boolean };
type Status = "idle"|"loading"|"saving"|"error";

const teal = "#0d9488";
const tG   = "linear-gradient(135deg,#0d9488,#0f766e)";

function ms(dark: boolean) {
  return {
    bg:   dark?"#0a0f1a":"#f1f5f9",
    sb:   dark?"rgba(15,23,42,0.95)":"#fff",
    card: dark?"rgba(15,23,42,0.8)":"#fff",
    ci:   dark?"rgba(20,30,50,0.6)":"#f8fafc",
    tx:   dark?"#e2e8f0":"#1e293b",
    sub:  dark?"#64748b":"#94a3b8",
    brd:  dark?"rgba(51,65,85,0.6)":"#e2e8f0",
    ibg:  dark?"rgba(10,15,26,0.8)":"#fff",
    top:  dark?"rgba(15,23,42,0.98)":"rgba(255,255,255,0.98)",
    mut:  dark?"#94a3b8":"#64748b",
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

// ── SHARED COMPONENTS ────────────────────────────────────────────────────────

function Field({label,value,onChange,multi,dark}:{label:string;value:string;onChange:(v:string)=>void;multi?:boolean;dark:boolean}) {
  const s  = ms(dark);
  const base: React.CSSProperties = {background:s.ibg,border:"1px solid "+s.brd,borderRadius:8,padding:"10px 13px",color:s.tx,fontSize:14,width:"100%",outline:"none",fontFamily:"inherit",boxSizing:"border-box"};
  return (
    <div style={{display:"grid",gridTemplateColumns:"130px 1fr",gap:12,alignItems:"start"}}>
      <label style={{fontSize:11,fontWeight:700,color:s.mut,textTransform:"uppercase",letterSpacing:"0.08em",paddingTop:12,fontFamily:"monospace"}}>{label}</label>
      {multi
        ? <textarea rows={3} value={value} onChange={e=>onChange(e.target.value)} style={{...base,resize:"vertical"}}/>
        : <input value={value} onChange={e=>onChange(e.target.value)} style={base}/>
      }
    </div>
  );
}

function ImgUpload({label,cur,path,onDone,dark,height=100}:{label:string;cur:string;path:string;onDone:(u:string)=>void;dark:boolean;height?:number}) {
  const s = ms(dark);
  const [uploading,setUploading] = useState(false);
  const [preview,setPreview]     = useState(cur);
  const ref = useRef<HTMLInputElement>(null);
  useEffect(()=>{ setPreview(cur); },[cur]);

  const upload = async (file: File) => {
    setUploading(true);
    const ext = file.name.split(".").pop();
    const fp  = `${path}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("site-images").upload(fp, file, { upsert:true });
    if (error) { alert("Upload error: "+error.message); setUploading(false); return; }
    const { data } = supabase.storage.from("site-images").getPublicUrl(fp);
    setPreview(data.publicUrl);
    onDone(data.publicUrl);
    setUploading(false);
  };

  return (
    <div style={{display:"grid",gridTemplateColumns:"130px 1fr",gap:12,alignItems:"start"}}>
      <label style={{fontSize:11,fontWeight:700,color:s.mut,textTransform:"uppercase",letterSpacing:"0.08em",paddingTop:12,fontFamily:"monospace"}}>{label}</label>
      <div>
        {preview
          ? <div style={{marginBottom:10,borderRadius:10,overflow:"hidden",border:"1px solid "+s.brd,position:"relative"}}>
              <img src={preview} alt="" style={{width:"100%",height,objectFit:"cover",display:"block"}}/>
              <button onClick={()=>{setPreview("");onDone("");}} style={{position:"absolute",top:6,right:6,background:"rgba(239,68,68,0.9)",border:"none",borderRadius:6,color:"#fff",cursor:"pointer",fontSize:11,fontWeight:700,padding:"3px 8px"}}>✕</button>
            </div>
          : <div style={{marginBottom:10,borderRadius:10,border:"1px dashed "+s.brd,height,display:"flex",alignItems:"center",justifyContent:"center",color:s.sub,fontSize:12}}>Aucune image</div>
        }
        <input ref={ref} type="file" accept="image/*" style={{display:"none"}} onChange={e=>e.target.files?.[0]&&upload(e.target.files[0])}/>
        <button onClick={()=>ref.current?.click()} disabled={uploading}
          style={{background:"rgba(13,148,136,0.1)",border:"1px dashed rgba(13,148,136,0.4)",borderRadius:8,padding:"8px 16px",color:teal,fontSize:13,fontWeight:600,cursor:uploading?"not-allowed":"pointer"}}>
          {uploading?"⏳ Upload...":"📁 Choisir image"}
        </button>
      </div>
    </div>
  );
}

// ── HERO ─────────────────────────────────────────────────────────────────────
function HeroEd({data,onChange,dark}:{data:any;onChange:(d:any)=>void;dark:boolean}) {
  const f = (k:string,v:string) => onChange({...data,[k]:v});
  return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <Field label="Titre"          value={data.title??""} onChange={v=>f("title",v)} dark={dark}/>
      <Field label="Highlight"      value={data.titleHighlight??""} onChange={v=>f("titleHighlight",v)} dark={dark}/>
      <Field label="Sous-titre"     value={data.subtitle??""} onChange={v=>f("subtitle",v)} multi dark={dark}/>
      <Field label="Badge"          value={data.badge??""} onChange={v=>f("badge",v)} dark={dark}/>
      <Field label="Btn Principal"  value={data.btnPrimary??""} onChange={v=>f("btnPrimary",v)} dark={dark}/>
      <Field label="Btn Secondaire" value={data.btnSecondary??""} onChange={v=>f("btnSecondary",v)} dark={dark}/>
      <ImgUpload label="Image Hero" cur={data.bgImage??""} path="hero-bg" onDone={v=>f("bgImage",v)} dark={dark} height={140}/>
      <ImgUpload label="Logo"       cur={data.logoUrl??""} path="logo" onDone={v=>f("logoUrl",v)} dark={dark} height={80}/>
    </div>
  );
}

// ── SERVICES ─────────────────────────────────────────────────────────────────
function ServicesEd({data,onChange,dark}:{data:any[];onChange:(d:any[])=>void;dark:boolean}) {
  const s   = ms(dark);
  const upd = (i:number,k:string,v:string) => onChange(data.map((x,j)=>j===i?{...x,[k]:v}:x));
  const del = (i:number) => onChange(data.filter((_,j)=>j!==i));
  const add = () => onChange([...data,{id:Date.now(),title:"Nouveau service",description:"",icon:"⚙️",image:""}]);
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
            <Field label="Icône"       value={svc.icon??""} onChange={v=>upd(i,"icon",v)} dark={dark}/>
            <Field label="Titre"       value={svc.title??""} onChange={v=>upd(i,"title",v)} dark={dark}/>
            <Field label="Description" value={svc.description??""} onChange={v=>upd(i,"description",v)} multi dark={dark}/>
            <ImgUpload label="Photo"   cur={svc.image??""} path={"service-"+i} onDone={v=>upd(i,"image",v)} dark={dark} height={120}/>
          </div>
        </div>
      ))}
      <button onClick={add} style={{border:"2px dashed rgba(13,148,136,0.3)",background:"transparent",color:teal,borderRadius:12,padding:14,cursor:"pointer",fontSize:14,fontWeight:600}}>+ Ajouter un service</button>
    </div>
  );
}

// ── ABOUT ────────────────────────────────────────────────────────────────────
function AboutEd({data,onChange,dark}:{data:any;onChange:(d:any)=>void;dark:boolean}) {
  const s = ms(dark);
  const f = (k:string,v:string) => onChange({...data,[k]:v});
  return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <Field label="Titre"       value={data.title??""} onChange={v=>f("title",v)} dark={dark}/>
      <Field label="Description" value={data.description??""} onChange={v=>f("description",v)} multi dark={dark}/>
      <Field label="Mission"     value={data.mission??""} onChange={v=>f("mission",v)} multi dark={dark}/>
      <div style={{borderTop:"1px solid "+s.brd,paddingTop:16}}>
        <div style={{fontSize:11,fontWeight:700,color:s.mut,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:14}}>Statistiques</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
          {([["years","Années"],["clients","Clients"],["projects","Projets"]] as [string,string][]).map(([k,l])=>(
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

// ── CONTACT + SOCIAL ─────────────────────────────────────────────────────────
function ContactEd({data,onChange,dark}:{data:any;onChange:(d:any)=>void;dark:boolean}) {
  const s = ms(dark);
  const f = (k:string,v:string) => onChange({...data,[k]:v});
  const socialFields = [
    {key:"facebook", label:"Facebook", placeholder:"https://facebook.com/...", color:"#1877f2", icon:"f"},
    {key:"instagram",label:"Instagram",placeholder:"https://instagram.com/...",color:"#e1306c", icon:"📷"},
    {key:"linkedin", label:"LinkedIn", placeholder:"https://linkedin.com/...", color:"#0077b5", icon:"in"},
  ];
  return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <Field label="Téléphone 1" value={data.phone1??""} onChange={v=>f("phone1",v)} dark={dark}/>
      <Field label="Téléphone 2" value={data.phone2??""} onChange={v=>f("phone2",v)} dark={dark}/>
      <Field label="Email"       value={data.email??""} onChange={v=>f("email",v)} dark={dark}/>
      <Field label="Adresse"     value={data.address??""} onChange={v=>f("address",v)} dark={dark}/>
      <Field label="WhatsApp"    value={data.whatsapp??""} onChange={v=>f("whatsapp",v)} dark={dark}/>
      <div style={{borderTop:"1px solid "+s.brd,paddingTop:20,marginTop:4}}>
        <div style={{fontSize:11,fontWeight:700,color:s.mut,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:16}}>Réseaux Sociaux</div>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          {socialFields.map(({key,label,placeholder,color,icon})=>(
            <div key={key} style={{display:"grid",gridTemplateColumns:"130px 1fr",gap:12,alignItems:"center"}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <div style={{width:28,height:28,borderRadius:8,background:color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:"#fff",fontWeight:800,flexShrink:0}}>{icon}</div>
                <label style={{fontSize:11,fontWeight:700,color:s.mut,textTransform:"uppercase",letterSpacing:"0.08em",fontFamily:"monospace"}}>{label}</label>
              </div>
              <input value={data[key]??""} onChange={e=>f(key,e.target.value)} placeholder={placeholder}
                style={{background:s.ibg,border:"1px solid "+s.brd,borderRadius:8,padding:"10px 13px",color:s.tx,fontSize:13,width:"100%",outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
            </div>
          ))}
        </div>
        {(data.facebook||data.instagram||data.linkedin)&&(
          <div style={{marginTop:16,display:"flex",gap:10,flexWrap:"wrap"}}>
            {data.facebook  &&<a href={data.facebook}  target="_blank" rel="noreferrer" style={{fontSize:12,color:"#1877f2",textDecoration:"none",padding:"4px 12px",background:"rgba(24,119,242,0.1)",borderRadius:20,border:"1px solid rgba(24,119,242,0.2)"}}>🔗 Facebook</a>}
            {data.instagram &&<a href={data.instagram} target="_blank" rel="noreferrer" style={{fontSize:12,color:"#e1306c",textDecoration:"none",padding:"4px 12px",background:"rgba(225,48,108,0.1)",borderRadius:20,border:"1px solid rgba(225,48,108,0.2)"}}>🔗 Instagram</a>}
            {data.linkedin  &&<a href={data.linkedin}  target="_blank" rel="noreferrer" style={{fontSize:12,color:"#0077b5",textDecoration:"none",padding:"4px 12px",background:"rgba(0,119,181,0.1)",borderRadius:20,border:"1px solid rgba(0,119,181,0.2)"}}>🔗 LinkedIn</a>}
          </div>
        )}
      </div>
    </div>
  );
}

// ── SLIDER MANAGER ───────────────────────────────────────────────────────────
function SliderEd({slides,onReload,dark}:{slides:Slide[];onReload:()=>void;dark:boolean}) {
  const s = ms(dark);
  const [saving,setSaving]   = useState<number|null>(null);
  const [adding,setAdding]   = useState(false);
  const [newSlide,setNewSlide] = useState({title:"",description:"",image:"",sort_order:slides.length+1});

  const uploadImg = async (file:File, path:string): Promise<string> => {
    const ext = file.name.split(".").pop();
    const fp  = `${path}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("site-images").upload(fp, file, {upsert:true});
    if (error) throw error;
    return supabase.storage.from("site-images").getPublicUrl(fp).data.publicUrl;
  };

  const updateField = async (id:number, field:string, value:any) => {
    setSaving(id);
    await supabase.from("slider_slides").update({[field]:value}).eq("id",id);
    setSaving(null);
    onReload();
  };

  const toggleActive = async (slide:Slide) => {
    await supabase.from("slider_slides").update({is_active:!slide.is_active}).eq("id",slide.id);
    onReload();
  };

  const deleteSlide = async (id:number) => {
    if (!confirm("Supprimer cette slide ?")) return;
    await supabase.from("slider_slides").delete().eq("id",id);
    onReload();
  };

  const addSlide = async () => {
    if (!newSlide.image) { alert("Image obligatoire"); return; }
    setSaving(-1);
    await supabase.from("slider_slides").insert([{...newSlide}]);
    setNewSlide({title:"",description:"",image:"",sort_order:slides.length+2});
    setAdding(false); setSaving(null); onReload();
  };

  function SlideImgBtn({cur,slideId}:{cur:string;slideId:number}) {
    const [prev,setPrev] = useState(cur);
    const [up,setUp]     = useState(false);
    const ref = useRef<HTMLInputElement>(null);
    const handle = async (file:File) => {
      setUp(true);
      try {
        const url = await uploadImg(file,`slide-${slideId}`);
        setPrev(url);
        await supabase.from("slider_slides").update({image:url}).eq("id",slideId);
        onReload();
      } catch(e:any) { alert("Erreur: "+e.message); }
      setUp(false);
    };
    return (
      <div style={{position:"relative",borderRadius:"12px 12px 0 0",overflow:"hidden",cursor:"pointer"}} onClick={()=>ref.current?.click()}>
        <img src={prev||"/images/1.jpg"} alt="" style={{width:"100%",height:150,objectFit:"cover",display:"block"}}/>
        <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.45)",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <span style={{color:"#fff",fontWeight:700,fontSize:13,background:"rgba(13,148,136,0.85)",padding:"7px 16px",borderRadius:8}}>
            {up?"⏳ Upload...":"📷 Changer l'image"}
          </span>
        </div>
        <input ref={ref} type="file" accept="image/*" style={{display:"none"}} onChange={e=>e.target.files?.[0]&&handle(e.target.files[0])}/>
      </div>
    );
  }

  function NewImgBtn() {
    const [prev,setPrev] = useState("");
    const [up,setUp]     = useState(false);
    const ref = useRef<HTMLInputElement>(null);
    const handle = async (file:File) => {
      setUp(true);
      try {
        const url = await uploadImg(file,"slide-new");
        setPrev(url); setNewSlide(n=>({...n,image:url}));
      } catch(e:any) { alert("Erreur: "+e.message); }
      setUp(false);
    };
    return (
      <div>
        {prev
          ? <div style={{borderRadius:10,overflow:"hidden",border:"1px solid "+s.brd,marginBottom:10,position:"relative"}}>
              <img src={prev} alt="" style={{width:"100%",height:120,objectFit:"cover",display:"block"}}/>
              <button onClick={()=>{setPrev("");setNewSlide(n=>({...n,image:""}));}}
                style={{position:"absolute",top:6,right:6,background:"rgba(239,68,68,0.9)",border:"none",borderRadius:6,color:"#fff",cursor:"pointer",fontSize:11,padding:"3px 8px"}}>✕</button>
            </div>
          : <div style={{borderRadius:10,border:"2px dashed rgba(13,148,136,0.3)",height:100,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:10,color:s.sub,fontSize:12,flexDirection:"column",gap:4}}>
              <span style={{fontSize:28}}>🖼️</span><span>Aucune image sélectionnée</span>
            </div>
        }
        <input ref={ref} type="file" accept="image/*" style={{display:"none"}} onChange={e=>e.target.files?.[0]&&handle(e.target.files[0])}/>
        <button onClick={()=>ref.current?.click()} disabled={up}
          style={{background:"rgba(13,148,136,0.1)",border:"1px dashed rgba(13,148,136,0.4)",borderRadius:8,padding:"8px 16px",color:teal,fontSize:13,fontWeight:600,cursor:up?"not-allowed":"pointer"}}>
          {up?"⏳ Upload...":"📁 Choisir image *"}
        </button>
      </div>
    );
  }

  return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <div style={{background:dark?"rgba(13,148,136,0.06)":"rgba(13,148,136,0.04)",border:"1px solid rgba(13,148,136,0.2)",borderRadius:12,padding:"12px 16px",fontSize:13,color:s.sub}}>
        <span style={{color:teal,fontWeight:700}}>{slides.length} slide{slides.length!==1?"s":""}</span>
        {" · "}
        <span style={{color:"#10b981",fontWeight:600}}>{slides.filter(x=>x.is_active).length} active{slides.filter(x=>x.is_active).length!==1?"s":""}</span>
        {" — Cliquez sur l'image pour la remplacer."}
      </div>

      {[...slides].sort((a,b)=>a.sort_order-b.sort_order).map(slide=>(
        <div key={slide.id} style={{background:s.card,border:"1px solid "+(slide.is_active?s.brd:"rgba(239,68,68,0.25)"),borderRadius:16,overflow:"hidden",opacity:slide.is_active?1:0.55,transition:"opacity 0.2s"}}>
          <SlideImgBtn cur={slide.image} slideId={slide.id}/>
          <div style={{padding:"16px 20px",display:"flex",flexDirection:"column",gap:10}}>
            <div style={{display:"grid",gridTemplateColumns:"70px 1fr",gap:10,alignItems:"center"}}>
              <label style={{fontSize:11,fontWeight:700,color:s.mut,textTransform:"uppercase",letterSpacing:"0.08em",fontFamily:"monospace"}}>Titre</label>
              <input defaultValue={slide.title} onBlur={e=>updateField(slide.id,"title",e.target.value)}
                style={{background:s.ibg,border:"1px solid "+s.brd,borderRadius:8,padding:"8px 12px",color:s.tx,fontSize:14,outline:"none",fontFamily:"inherit",width:"100%",boxSizing:"border-box"}}/>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"70px 1fr",gap:10,alignItems:"start"}}>
              <label style={{fontSize:11,fontWeight:700,color:s.mut,textTransform:"uppercase",letterSpacing:"0.08em",paddingTop:8,fontFamily:"monospace"}}>Texte</label>
              <textarea defaultValue={slide.description} onBlur={e=>updateField(slide.id,"description",e.target.value)} rows={2}
                style={{background:s.ibg,border:"1px solid "+s.brd,borderRadius:8,padding:"8px 12px",color:s.tx,fontSize:14,outline:"none",fontFamily:"inherit",width:"100%",boxSizing:"border-box",resize:"vertical"}}/>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:8,marginTop:4}}>
              <label style={{fontSize:11,fontWeight:700,color:s.mut,textTransform:"uppercase",letterSpacing:"0.08em",fontFamily:"monospace"}}>Ordre</label>
              <input type="number" defaultValue={slide.sort_order} onBlur={e=>updateField(slide.id,"sort_order",parseInt(e.target.value)||0)}
                style={{background:s.ibg,border:"1px solid "+s.brd,borderRadius:8,padding:"6px 10px",color:teal,fontSize:14,outline:"none",fontFamily:"inherit",fontWeight:700,textAlign:"center",width:70,boxSizing:"border-box"}}/>
              <div style={{flex:1}}/>
              {saving===slide.id && <span style={{fontSize:12,color:teal}}>⏳ Sauvegarde...</span>}
              <button onClick={()=>toggleActive(slide)}
                style={{background:slide.is_active?"rgba(16,185,129,0.1)":"rgba(239,68,68,0.08)",border:"1px solid "+(slide.is_active?"rgba(16,185,129,0.3)":"rgba(239,68,68,0.2)"),borderRadius:8,padding:"6px 14px",color:slide.is_active?"#10b981":"#f87171",fontSize:12,fontWeight:700,cursor:"pointer"}}>
                {slide.is_active?"✓ Active":"✗ Désactivée"}
              </button>
              <button onClick={()=>deleteSlide(slide.id)}
                style={{background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.2)",borderRadius:8,padding:"6px 12px",color:"#f87171",fontSize:12,fontWeight:600,cursor:"pointer"}}>🗑</button>
            </div>
          </div>
        </div>
      ))}

      {adding ? (
        <div style={{background:s.card,border:"2px dashed rgba(13,148,136,0.4)",borderRadius:16,padding:24}}>
          <div style={{fontSize:13,fontWeight:700,color:teal,marginBottom:16,textTransform:"uppercase",letterSpacing:"0.08em"}}>➕ Nouvelle slide</div>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <NewImgBtn/>
            <input placeholder="Titre" value={newSlide.title} onChange={e=>setNewSlide(n=>({...n,title:e.target.value}))}
              style={{background:s.ibg,border:"1px solid "+s.brd,borderRadius:8,padding:"10px 13px",color:s.tx,fontSize:14,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
            <textarea placeholder="Description" value={newSlide.description} onChange={e=>setNewSlide(n=>({...n,description:e.target.value}))} rows={2}
              style={{background:s.ibg,border:"1px solid "+s.brd,borderRadius:8,padding:"10px 13px",color:s.tx,fontSize:14,outline:"none",fontFamily:"inherit",boxSizing:"border-box",resize:"vertical"}}/>
            <div style={{display:"flex",gap:8}}>
              <button onClick={addSlide} disabled={saving===-1}
                style={{background:tG,border:"none",borderRadius:9,padding:"10px 22px",color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer"}}>
                {saving===-1?"⏳ Ajout...":"✅ Ajouter la slide"}
              </button>
              <button onClick={()=>setAdding(false)}
                style={{background:"transparent",border:"1px solid "+s.brd,borderRadius:9,padding:"10px 16px",color:s.sub,fontSize:13,fontWeight:600,cursor:"pointer"}}>Annuler</button>
            </div>
          </div>
        </div>
      ) : (
        <button onClick={()=>setAdding(true)}
          style={{border:"2px dashed rgba(13,148,136,0.3)",background:"transparent",color:teal,borderRadius:12,padding:16,cursor:"pointer",fontSize:14,fontWeight:600}}>
          ➕ Ajouter une slide
        </button>
      )}
    </div>
  );
}

// ── NAV ──────────────────────────────────────────────────────────────────────
const NAV = [
  {key:"hero",    label:"Hero",     icon:"🏠", desc:"Titre, images, boutons"},
  {key:"services",label:"Services", icon:"🛠", desc:"Cartes + photos"},
  {key:"about",   label:"À propos", icon:"ℹ️",  desc:"Stats & description"},
  {key:"contact", label:"Contact",  icon:"📞", desc:"Tél, email, réseaux sociaux"},
  {key:"slider",  label:"Slider",   icon:"🖼️", desc:"Images du carrousel"},
];

// ── MAIN ─────────────────────────────────────────────────────────────────────
export default function AdminPage() {
  const router = useRouter();
  const [rows,setRows]         = useState<Row[]>([]);
  const [slides,setSlides]     = useState<Slide[]>([]);
  const [active,setActive]     = useState("hero");
  const [drafts,setDrafts]     = useState<Record<string,any>>({});
  const [status,setStatus]     = useState<Status>("loading");
  const [msg,setMsg]           = useState("");
  const [mok,setMok]           = useState(true);
  const [dark,setDark]         = useState(true);
  const [open,setOpen]         = useState(true);
  const [connOk,setConnOk]     = useState<boolean|null>(null);
  const [userEmail,setUserEmail] = useState("");

  useEffect(()=>{
    // Supabase Auth session check
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.push("/login");
      } else {
        setUserEmail(data.session.user.email ?? "");
      }
    });
    const t = localStorage.getItem("mt_theme");
    if (t) setDark(t === "dark");
  },[router]);

  const s = ms(dark);

  const loadSlides = useCallback(async()=>{
    const { data } = await supabase.from("slider_slides").select("*").order("sort_order");
    setSlides(data??[]);
  },[]);

  const load = useCallback(async()=>{
    setStatus("loading");
    const { data,error } = await supabase.from("site_content").select("*").order("id");
    if (error) { setStatus("error"); setConnOk(false); return; }
    setConnOk(true);
    setRows(data??[]);
    const d: Record<string,any> = {};
    (data??[]).forEach((r:Row)=>{ d[r.section] = JSON.parse(JSON.stringify(r.content)); });
    setDrafts(d);
    await loadSlides();
    setStatus("idle");
  },[loadSlides]);

  useEffect(()=>{ load(); },[load]);

  const notify = (text:string, ok=true) => { setMsg(text); setMok(ok); setTimeout(()=>setMsg(""),3500); };

  const save = async () => {
    setStatus("saving");
    const { error } = await supabase.from("site_content")
      .update({content:drafts[active], updated_at:new Date().toISOString()})
      .eq("section",active);
    if (error) notify("❌ "+error.message, false);
    else { notify("✅ Sauvegardé !"); await load(); }
    setStatus("idle");
  };

  // Supabase Auth logout
  const logout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const togTheme = () => { const nd=!dark; setDark(nd); localStorage.setItem("mt_theme",nd?"dark":"light"); };

  const aRow      = rows.find(r=>r.section===active);
  const dirty     = active!=="slider" && JSON.stringify(drafts[active])!==JSON.stringify(aRow?.content);
  const nDirty    = NAV.filter(n=>n.key!=="slider"&&JSON.stringify(drafts[n.key])!==JSON.stringify(rows.find(r=>r.section===n.key)?.content)).length;
  const setD      = (v:any) => setDrafts(d=>({...d,[active]:v}));
  const reset     = () => setDrafts(d=>({...d,[active]:JSON.parse(JSON.stringify(aRow?.content))}));
  const activeNav = NAV.find(n=>n.key===active);

  return (
    <div style={{minHeight:"100vh",background:s.bg,color:s.tx,fontFamily:"'Segoe UI',system-ui,sans-serif",transition:"background 0.3s"}}>

      {/* ── Topbar ── */}
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
          {userEmail&&<div style={{fontSize:12,color:s.sub,background:s.ci,border:"1px solid "+s.brd,borderRadius:8,padding:"5px 12px",maxWidth:200,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>👤 {userEmail}</div>}
          <button onClick={togTheme} style={{background:dark?"rgba(51,65,85,0.4)":"rgba(226,232,240,0.8)",border:"1px solid "+s.brd,borderRadius:9,padding:"7px 12px",cursor:"pointer",color:s.tx,fontSize:17}}>{dark?"☀️":"🌙"}</button>
          <button onClick={logout} style={{background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.2)",borderRadius:9,padding:"7px 14px",cursor:"pointer",color:"#f87171",fontSize:13,fontWeight:600}}>🚪 Déconnexion</button>
        </div>
      </div>

      <div style={{display:"flex",minHeight:"calc(100vh - 62px)"}}>

        {/* ── Sidebar ── */}
        <div style={{width:open?250:0,overflow:"hidden",transition:"width 0.25s",background:s.sb,borderRight:"1px solid "+s.brd,display:"flex",flexDirection:"column",flexShrink:0}}>
          <div style={{padding:"20px 14px",display:"flex",flexDirection:"column",gap:4,flex:1}}>
            <div style={{fontSize:10,fontWeight:700,color:s.sub,textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:8,paddingLeft:4}}>Sections</div>
            {NAV.map(({key,label,icon,desc})=>{
              const row = rows.find(r=>r.section===key);
              const d   = key!=="slider" && JSON.stringify(drafts[key])!==JSON.stringify(row?.content);
              return (
                <button key={key} onClick={()=>setActive(key)} style={s.sbtn(active===key)}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <span style={{fontSize:18}}>{icon}</span>
                    <div style={{textAlign:"left"}}>
                      <div style={{fontWeight:active===key?700:500,whiteSpace:"nowrap"}}>{label}</div>
                      <div style={{fontSize:10,color:s.sub,whiteSpace:"nowrap"}}>{desc}</div>
                    </div>
                  </div>
                  {d && <span style={{width:7,height:7,borderRadius:"50%",background:"#f59e0b",flexShrink:0}}/>}
                  {key==="slider" && <span style={{fontSize:10,fontWeight:700,color:teal,background:"rgba(13,148,136,0.1)",borderRadius:10,padding:"1px 7px"}}>{slides.filter(x=>x.is_active).length}</span>}
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

        {/* ── Editor ── */}
        <div style={{flex:1,overflowY:"auto",padding:32}}>
          {status==="loading" ? (
            <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:300,flexDirection:"column",gap:16,color:s.sub}}>
              <div style={{width:44,height:44,border:"3px solid rgba(13,148,136,0.2)",borderTop:"3px solid "+teal,borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>
              <span>Chargement...</span>
            </div>
          ) : status==="error" ? (
            <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:300,flexDirection:"column",gap:16}}>
              <div style={{fontSize:48}}>❌</div>
              <div style={{fontSize:18,fontWeight:700,color:"#f87171"}}>Erreur de connexion</div>
              <button onClick={load} style={{background:tG,border:"none",borderRadius:10,padding:"10px 24px",color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer",marginTop:8}}>🔄 Réessayer</button>
            </div>
          ) : (
            <div style={{maxWidth:800}}>
              {/* Section header */}
              <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:28,paddingBottom:20,borderBottom:"1px solid "+s.brd}}>
                <div>
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
                    <span style={{fontSize:26}}>{activeNav?.icon}</span>
                    <h1 style={{margin:0,fontSize:22,fontWeight:800}}>{activeNav?.label}</h1>
                    {dirty && <span style={{fontSize:11,fontWeight:700,color:"#f59e0b",background:"rgba(245,158,11,0.12)",border:"1px solid rgba(245,158,11,0.25)",borderRadius:20,padding:"2px 10px"}}>Non sauvegardé</span>}
                    {active==="slider" && <span style={{fontSize:11,fontWeight:700,color:teal,background:"rgba(13,148,136,0.1)",border:"1px solid rgba(13,148,136,0.25)",borderRadius:20,padding:"2px 10px"}}>💾 Auto-save</span>}
                  </div>
                  {aRow&&active!=="slider" && <div style={{fontSize:12,color:s.sub}}>Modifié : {new Date(aRow.updated_at).toLocaleString("fr-DZ")}</div>}
                  {active==="slider" && <div style={{fontSize:12,color:s.sub}}>{slides.length} slide(s) · modifications sauvegardées automatiquement</div>}
                </div>
                {active!=="slider" && (
                  <div style={{display:"flex",gap:8}}>
                    {dirty && <button onClick={reset} style={{background:"transparent",border:"1px solid "+s.brd,color:s.sub,borderRadius:9,padding:"9px 16px",cursor:"pointer",fontSize:13,fontWeight:600}}>↺ Annuler</button>}
                    <button onClick={save} disabled={!dirty||status==="saving"}
                      style={{background:dirty?tG:"rgba(51,65,85,0.3)",border:"none",borderRadius:9,padding:"9px 22px",color:dirty?"#fff":s.sub,fontSize:14,fontWeight:700,cursor:dirty?"pointer":"not-allowed"}}>
                      {status==="saving"?"⏳ Sauvegarde...":"💾 Sauvegarder"}
                    </button>
                  </div>
                )}
              </div>

              {/* Section content */}
              <div style={{background:active==="slider"?"transparent":s.card,border:active==="slider"?"none":"1px solid "+s.brd,borderRadius:16,padding:active==="slider"?0:28}}>
                {active==="hero"     && drafts.hero     && <HeroEd     data={drafts.hero}     onChange={setD} dark={dark}/>}
                {active==="services" && drafts.services  && <ServicesEd data={drafts.services} onChange={setD} dark={dark}/>}
                {active==="about"    && drafts.about     && <AboutEd    data={drafts.about}    onChange={setD} dark={dark}/>}
                {active==="contact"  && drafts.contact   && <ContactEd  data={drafts.contact}  onChange={setD} dark={dark}/>}
                {active==="slider"   && <SliderEd slides={slides} onReload={loadSlides} dark={dark}/>}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        *{box-sizing:border-box;}
        input:focus,textarea:focus{border-color:rgba(13,148,136,0.7)!important;box-shadow:0 0 0 3px rgba(13,148,136,0.12)!important;}
        @keyframes spin{to{transform:rotate(360deg);}}
        ::-webkit-scrollbar{width:6px;}
        ::-webkit-scrollbar-thumb{background:rgba(100,116,139,0.3);border-radius:4px;}
        a:hover{opacity:0.8;}
      `}</style>
    </div>
  );
}