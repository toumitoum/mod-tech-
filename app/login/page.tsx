"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]   = useState("");
  const [pw, setPw]         = useState("");
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);
  const [show, setShow]     = useState(false);
  const [dark, setDark]     = useState(true);

  useEffect(() => {
    const t = localStorage.getItem("mt_theme");
    if (t) setDark(t === "dark");
    // تحقق بسيط بدون blocking
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.push("/admin");
    });
  }, [router]);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !pw) return;
    setLoading(true);
    setError("");

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password: pw });
      if (authError) {
        if (authError.message.includes("Invalid login credentials")) setError("البريد الإلكتروني أو كلمة المرور غير صحيحة");
        else if (authError.message.includes("Email not confirmed")) setError("يرجى تأكيد البريد الإلكتروني أولاً");
        else if (authError.message.includes("Too many requests")) setError("محاولات كثيرة، يرجى الانتظار قليلاً");
        else setError("حدث خطأ: " + authError.message);
        setLoading(false);
      } else {
        router.push("/admin");
      }
    } catch (err: any) {
      setError("خطأ في الاتصال: " + err.message);
      setLoading(false);
    }
  };

  const bg   = dark ? "#0a0f1a" : "#f1f5f9";
  const card = dark ? "rgba(15,23,42,0.95)" : "#fff";
  const text = dark ? "#e2e8f0" : "#1e293b";
  const sub  = dark ? "#64748b" : "#94a3b8";
  const brd  = dark ? "rgba(51,65,85,0.6)" : "#e2e8f0";
  const ibg  = dark ? "rgba(15,23,42,0.6)" : "#f8fafc";
  const ready = email.length > 0 && pw.length > 0;

  return (
    <div dir="rtl" style={{minHeight:"100vh",background:bg,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Segoe UI',Tahoma,Arial,sans-serif",position:"relative"}}>
      <div style={{position:"absolute",inset:0,overflow:"hidden",pointerEvents:"none"}}>
        <div style={{position:"absolute",width:400,height:400,borderRadius:"50%",background:"radial-gradient(circle,rgba(13,148,136,0.12) 0%,transparent 70%)",top:"10%",right:"15%"}}/>
        <div style={{position:"absolute",width:300,height:300,borderRadius:"50%",background:"radial-gradient(circle,rgba(20,184,166,0.08) 0%,transparent 70%)",bottom:"15%",left:"20%"}}/>
      </div>

      <button onClick={()=>{const nd=!dark;setDark(nd);localStorage.setItem("mt_theme",nd?"dark":"light");}}
        style={{position:"absolute",top:20,left:20,background:dark?"rgba(51,65,85,0.4)":"rgba(226,232,240,0.8)",border:"1px solid "+brd,borderRadius:10,padding:"8px 14px",cursor:"pointer",color:text,fontSize:14,fontWeight:600}}>
        {dark?"🌙 Dark":"☀️ Light"}
      </button>

      <div style={{background:card,border:"1px solid "+brd,borderRadius:20,padding:"44px 40px",width:"100%",maxWidth:420,boxShadow:dark?"0 25px 60px rgba(0,0,0,0.5)":"0 25px 60px rgba(0,0,0,0.1)",position:"relative",zIndex:1}}>
        <div style={{textAlign:"center",marginBottom:36}}>
          <div style={{width:64,height:64,borderRadius:18,background:"linear-gradient(135deg,#0d9488,#0f766e)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:30,margin:"0 auto 16px",boxShadow:"0 8px 24px rgba(13,148,136,0.35)"}}>⚙️</div>
          <h1 style={{margin:"0 0 6px",fontSize:24,fontWeight:800,color:text}}>لوحة تحكم MOD-TECH</h1>
          <p style={{margin:0,fontSize:13,color:sub}}>أدخل بيانات حسابك للدخول</p>
        </div>

        <form onSubmit={login} style={{display:"flex",flexDirection:"column",gap:18}}>
          <div style={{display:"flex",flexDirection:"column",gap:7}}>
            <label style={{fontSize:12,fontWeight:700,color:sub}}>البريد الإلكتروني</label>
            <input type="email" placeholder="admin@modtech.dz" value={email}
              onChange={e=>{setEmail(e.target.value);setError("");}} autoFocus
              style={{width:"100%",background:ibg,border:"1px solid "+(error?"#ef4444":brd),borderRadius:10,padding:"12px 16px",color:text,fontSize:15,outline:"none",boxSizing:"border-box",fontFamily:"inherit",textAlign:"right"}}/>
          </div>

          <div style={{display:"flex",flexDirection:"column",gap:7}}>
            <label style={{fontSize:12,fontWeight:700,color:sub}}>كلمة المرور</label>
            <div style={{position:"relative"}}>
              <input type={show?"text":"password"} placeholder="••••••••" value={pw}
                onChange={e=>{setPw(e.target.value);setError("");}}
                style={{width:"100%",background:ibg,border:"1px solid "+(error?"#ef4444":brd),borderRadius:10,padding:"12px 46px 12px 16px",color:text,fontSize:15,outline:"none",boxSizing:"border-box",fontFamily:"inherit",textAlign:"right"}}/>
              <button type="button" onClick={()=>setShow(!show)}
                style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",background:"transparent",border:"none",cursor:"pointer",color:sub,fontSize:18,padding:0}}>
                {show?"🙈":"👁️"}
              </button>
            </div>
          </div>

          {error&&(
            <div style={{color:"#f87171",fontSize:13,padding:"10px 14px",background:"rgba(239,68,68,0.1)",borderRadius:8,border:"1px solid rgba(239,68,68,0.2)",textAlign:"center"}}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading||!ready}
            style={{background:ready?"linear-gradient(135deg,#0d9488,#0f766e)":"rgba(51,65,85,0.3)",border:"none",borderRadius:10,padding:"14px",color:ready?"#fff":sub,fontSize:16,fontWeight:700,cursor:ready?"pointer":"not-allowed",marginTop:4,transition:"all 0.2s",boxShadow:ready?"0 4px 16px rgba(13,148,136,0.35)":"none"}}>
            {loading?"⏳ جاري التحقق...":"تسجيل الدخول"}
          </button>
        </form>

        <p style={{textAlign:"center",fontSize:11,color:sub,marginTop:28,marginBottom:0}}>
          MOD-TECHNOLOGIE © {new Date().getFullYear()}
        </p>
      </div>
      <style>{`*{box-sizing:border-box;}input:focus{border-color:rgba(13,148,136,0.7)!important;box-shadow:0 0 0 3px rgba(13,148,136,0.12)!important;}`}</style>
    </div>
  );
}
