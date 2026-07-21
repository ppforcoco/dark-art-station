"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";

export const dynamic = "force-dynamic";

interface Analytics { totalDownloads:number;todayDownloads:number;weekDownloads:number;monthDownloads:number;downloads5Min:number;downloads30Min:number;downloads24h:number;downloads30Days:number;imageDownloads:number;collectionDownloads:number;downloadsPerDay:{date:string;count:number}[];totalPageViews:number;pageViews5Min:number;pageViews30Min:number;pageViews24h:number;pageViews30Days:number;topPageViews:{title:string;slug:string;device:string|null;views:number}[];topWallpapers:{title:string;slug:string;device:string|null;downloads:number}[];topCollections:{title:string;slug:string;downloads:number}[];totalBlogPosts:number;publishedBlogPosts:number;blogPosts:{title:string;slug:string;label:string;date:string;wordCount:number}[];deviceBreakdown:{IPHONE:number;ANDROID:number;PC:number;OTHER:number};recentActivity:{time:string;title:string;slug:string;device:string|null;type:string}[]; }
interface Post { slug:string;title:string;label:string;content?:string;featuredImage?:string|null;createdAt:string;published?:boolean; }
// UPDATED: added downloadCount field
interface ImageRecord { id:string;slug:string;title:string;r2Key:string;highResKey:string|null;description:string|null;altText:string|null;metaDescription:string|null;tags:string[];isAdult:boolean;isAvatar:boolean;matchingGroupId:string|null;matchingLabel:string|null;deviceType:string|null;viewCount:number;sortOrder?:number|null;collection?:{title:string}|null;downloadCount?:number; }
interface PageContentRecord { id:string;slug:string;title:string|null;body:string;metaDesc:string|null;updatedAt:string; }

const ALL_LABELS=["Wallpaper Guides","How-To & Tutorials","Device Setup","iPhone Wallpapers","Android Wallpapers","PC & Desktop Wallpapers","Dark Aesthetics","Gothic & Horror","Dark Fantasy","AMOLED Wallpapers","Minimalist Dark","Cyberpunk & Neon","Halloween Special","Seasonal Picks","Top Lists","New Releases","Community Spotlights","News & Updates","Free Wallpapers","HD Wallpapers","Lock Screen Ideas","Dark Psychology","16+ Mature Content"];
const ALL_TAGS=["dark","gothic","horror","fantasy","minimal","amoled","neon","cyberpunk","nature","abstract","skull","moon","forest","city","demon","angel","witch","fire","ice","space","ocean","halloween","anime","street","pattern","texture","portrait","landscape","skeleton","smoke","rose","blood","darkness","void","crimson","black","white","aesthetic","edgy","rebel","grunge","punk","metal","vampire","ghost","reaper","creepy","mysterious","shadow","ethereal","art","illustration","wallpaper","phone","lockscreen","HD","hd","purple","red","green","blue","gold","silver","neon-green"];

const BADGE_TAGS = [
  { tag: "badge-premium",   label: "⭐ Premium",   color: "#c9a84c", bg: "rgba(201,168,76,0.15)",  tip: "High-quality exclusive art" },
  { tag: "badge-trending",  label: "🔥 Trending",  color: "#ff6b35", bg: "rgba(255,107,53,0.15)", tip: "Most downloaded this week" },
  { tag: "badge-new",       label: "✨ New",        color: "#4caf50", bg: "rgba(76,175,80,0.15)",  tip: "Recently added" },
  { tag: "badge-hot",       label: "💀 Hot",        color: "#e040fb", bg: "rgba(224,64,251,0.15)", tip: "Community favourite" },
  { tag: "badge-exclusive", label: "🌙 Exclusive",  color: "#42a5f5", bg: "rgba(66,165,245,0.15)", tip: "Only on Haunted Wallpapers" },
  { tag: "badge-limited",   label: "⏳ Limited",    color: "#ff5252", bg: "rgba(255,82,82,0.15)",  tip: "Rare drop — grab it now" },
  { tag: "badge-editors-pick", label: "🎖 Editor's Pick", color: "#e8c97a", bg: "rgba(232,201,122,0.15)", tip: "Hand-picked by the Haunted team" },
];
const ADSENSE_CHECKLIST=[{done:true,item:"Original content — no copy-paste or AI spam"},{done:true,item:"Privacy Policy page live"},{done:true,item:"About page live"},{done:true,item:"Contact page live"},{done:false,item:"At least 15–20 blog posts published (800+ words each)"},{done:false,item:"Consistent posting — 2–3 posts per week minimum"},{done:false,item:"Site is at least 3–6 months old with traffic history"},{done:false,item:"No broken links, 404s, or console errors"},{done:false,item:"Mobile responsive on all pages"},{done:false,item:"Google Search Console verified + sitemap submitted"},{done:false,item:"No misleading navigation or hidden text"},{done:false,item:"Clear site purpose — wallpaper downloads, clearly stated"}];
const ADULT_IMAGES_TO_MARK=[{title:"Seductive Reaper",device:"IPHONE"},{title:"Gothic Temptress",device:"ANDROID"},{title:"Dark Sensuality",device:"PC"},{title:"Occult Ritual",device:"IPHONE"},{title:"Blood Moon Ritual",device:"ANDROID"},{title:"Forbidden Darkness",device:"PC"}];
const PAGE_SLUGS=[{slug:"home",label:"Home",url:"/"},{slug:"collections",label:"Collections",url:"/collections"},{slug:"iphone",label:"iPhone Wallpapers",url:"/iphone"},{slug:"android",label:"Android Wallpapers",url:"/android"},{slug:"pc",label:"PC Wallpapers",url:"/pc"},{slug:"blog",label:"Blog Index",url:"/blog"},{slug:"faq",label:"FAQ",url:"/faq"},{slug:"about",label:"About",url:"/about"},{slug:"contact",label:"Contact",url:"/contact"},{slug:"privacy",label:"Privacy Policy",url:"/privacy"},{slug:"terms",label:"Terms of Service",url:"/terms"},{slug:"licensing",label:"Licensing",url:"/licensing"},{slug:"dmca",label:"DMCA",url:"/dmca"},{slug:"tools",label:"Tools",url:"/tools"},{slug:"search",label:"Search",url:"/search"}];

const ALL_TAG_LIST=["dark","gothic","horror","fantasy","minimal","amoled","neon","cyberpunk","nature","abstract","skull","moon","forest","city","demon","angel","witch","fire","ice","space","ocean","halloween","anime","street","pattern","texture","portrait","landscape"];

async function fileToBase64(file:File):Promise<string>{const reader=new FileReader();return new Promise((resolve,reject)=>{reader.onload=()=>resolve((reader.result as string).split(",")[1]);reader.onerror=reject;reader.readAsDataURL(file);});}
async function urlToBase64(url:string):Promise<{data:string;mediaType:string}>{const res=await fetch(url);if(!res.ok)throw new Error("Could not fetch");const blob=await res.blob();const file=new File([blob],"image.jpg",{type:blob.type||"image/jpeg"});const data=await fileToBase64(file);return{data,mediaType:file.type};}
interface ClaudeImageAnalysis{title:string;description:string;altText:string;metaDescription:string;tags:string[];}
// Calls our own server route (/api/hw-admin/analyze-image), which holds the GLM API key
// server-side and forwards the request to GLM-4.6V-Flash (Z.ai's free vision model).
// Never call a third-party AI API with a key directly from client-side code — it would
// ship the key in the browser bundle for anyone to read.
async function analyzeImageWithClaude(base64:string,mediaType:string,password:string):Promise<ClaudeImageAnalysis>{
  const res=await fetch("/api/hw-admin/analyze-image",{method:"POST",headers:{"Content-Type":"application/json","x-admin-password":password},body:JSON.stringify({imageBase64:base64,mediaType})});
  const json=await res.json().catch(()=>({}));
  if(!res.ok)throw new Error(json.error??`Analysis failed (${res.status})`);
  return json as ClaudeImageAnalysis;
}

const C={bg:"#0d0b14",surface:"#13111e",border:"#2a2535",red:"#c0001a",gold:"#c9a84c",purple:"#7c3aed",textPri:"#e8e4f8",textSec:"#8a809a",textMut:"#4a445a",green:"#4caf50",white:"#ffffff"};
const inp:React.CSSProperties={width:"100%",background:"#0a0812",border:`1px solid ${C.border}`,color:C.textPri,padding:"10px 12px",fontSize:"0.875rem",fontFamily:"monospace",boxSizing:"border-box",outline:"none"};
const lbl:React.CSSProperties={display:"block",color:C.textMut,fontSize:"0.6rem",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:"6px"};
const eyebrow:React.CSSProperties={color:C.textMut,fontSize:"0.6rem",letterSpacing:"0.2em",textTransform:"uppercase",marginBottom:"12px"};

function Btn({children,onClick,disabled,variant="primary",style}:{children:React.ReactNode;onClick?:()=>void;disabled?:boolean;variant?:"primary"|"ghost"|"danger"|"success";style?:React.CSSProperties;}){
  const base:React.CSSProperties={border:"none",cursor:disabled?"not-allowed":"pointer",fontSize:"0.72rem",letterSpacing:"0.1em",textTransform:"uppercase",fontFamily:"monospace",padding:"10px 20px",transition:"opacity 0.15s",opacity:disabled?0.5:1,whiteSpace:"nowrap"};
  const variants:Record<string,React.CSSProperties>={primary:{background:C.red,color:C.white},ghost:{background:"transparent",color:C.textSec,border:`1px solid ${C.border}`},danger:{background:"rgba(192,0,26,0.15)",color:C.red,border:`1px solid ${C.red}`},success:{background:"rgba(76,175,80,0.15)",color:C.green,border:`1px solid ${C.green}`}};
  return<button onClick={onClick} disabled={disabled} style={{...base,...variants[variant],...style}}>{children}</button>;
}
function Card({children,style}:{children:React.ReactNode;style?:React.CSSProperties;}){return<div style={{background:C.surface,border:`1px solid ${C.border}`,padding:"24px",...style}}>{children}</div>;}
function Msg({msg}:{msg:{type:"ok"|"err";text:string}|null}){if(!msg)return null;return<div style={{padding:"10px 14px",marginBottom:"16px",border:`1px solid ${msg.type==="ok"?C.green:C.red}`,color:msg.type==="ok"?C.green:"#ffd080",fontSize:"0.82rem",background:msg.type==="ok"?"rgba(76,175,80,0.08)":"rgba(192,0,26,0.08)"}}>{msg.text}</div>;}
function AdultBadge(){return<span style={{display:"inline-flex",alignItems:"center",background:C.red,color:"#fff",fontFamily:"monospace",fontWeight:900,fontSize:"0.6rem",padding:"2px 7px",border:"1px solid #ff2040",textTransform:"uppercase"}}>⚠ 16+</span>;}

function HtmlToolbar({textareaId,value,onChange,password}:{textareaId:string;value:string;onChange:(v:string)=>void;password?:string;}){
  const tags=[{label:"B",wrap:["<strong>","</strong>"]},{label:"I",wrap:["<em>","</em>"]},{label:"H2",wrap:["<h2>","</h2>"]},{label:"H3",wrap:["<h3>","</h3>"]},{label:"P",wrap:["<p>","</p>"]},{label:"UL",wrap:["<ul>\n  <li>","</li>\n</ul>"]},{label:"LI",wrap:["<li>","</li>"]},{label:"A",wrap:['<a href="">','</a>']},{label:"Red",wrap:['<span style="color:#c0001a">','</span>']},{label:"Gold",wrap:['<span style="color:#c9a84c">','</span>']},{label:"BQ",wrap:['<blockquote style="border-left:3px solid #c0001a;padding:8px 16px;margin:12px 0;font-style:italic;">','</blockquote>']}];
  const imgInputRef=useRef<HTMLInputElement>(null);const[imgUploading,setImgUploading]=useState(false);
  async function handleInlineImageUpload(file:File){
    if(!password)return;
    setImgUploading(true);
    try{
      const form=new FormData();form.append("file",file);
      const res=await fetch("/api/hw-admin/upload-blog-image",{method:"POST",headers:{"x-admin-password":password},body:form});
      const j=await res.json();
      if(res.ok&&j.url){
        const imgTag=`<img src="${j.url}" alt="" style="max-width:100%;height:auto;margin:16px 0;" />`;
        const el=document.getElementById(textareaId) as HTMLTextAreaElement|null;
        if(el){const start=el.selectionStart;const next=value.slice(0,start)+imgTag+value.slice(start);onChange(next);setTimeout(()=>{el.focus();el.setSelectionRange(start+imgTag.length,start+imgTag.length);},10);}
        else onChange(value+imgTag);
      }
    }catch{}
    setImgUploading(false);
    if(imgInputRef.current)imgInputRef.current.value="";
  }
  return<div style={{display:"flex",flexWrap:"wrap",gap:"4px",marginBottom:"6px"}}>
    {tags.map(({label,wrap})=><button key={label} type="button" onClick={()=>{const el=document.getElementById(textareaId) as HTMLTextAreaElement|null;if(!el){onChange(value+wrap[0]+wrap[1]);return;}const start=el.selectionStart,end=el.selectionEnd;const selected=value.slice(start,end);const next=value.slice(0,start)+wrap[0]+selected+wrap[1]+value.slice(end);onChange(next);setTimeout(()=>{el.focus();const pos=start+wrap[0].length+selected.length+wrap[1].length;el.setSelectionRange(pos,pos);},10);}} style={{background:"rgba(124,58,237,0.15)",border:`1px solid ${C.border}`,color:C.purple,padding:"3px 9px",cursor:"pointer",fontSize:"0.62rem",fontFamily:"monospace"}}>{label}</button>)}
    {password&&<><input ref={imgInputRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>{const f=e.target.files?.[0];if(f)handleInlineImageUpload(f);}}/><button type="button" onClick={()=>imgInputRef.current?.click()} disabled={imgUploading} style={{background:imgUploading?"rgba(201,168,76,0.25)":"rgba(201,168,76,0.15)",border:`1px solid ${imgUploading?C.gold:"rgba(201,168,76,0.4)"}`,color:C.gold,padding:"3px 9px",cursor:imgUploading?"not-allowed":"pointer",fontSize:"0.62rem",fontFamily:"monospace",opacity:imgUploading?0.7:1}}>{imgUploading?"⏳":"📷 Img"}</button></>}
  </div>;
}

function PasswordGate({onAuth}:{onAuth:()=>void}){
  const[pw,setPw]=useState("");const[error,setError]=useState("");const[loading,setLoading]=useState(false);
  async function handleLogin(){setLoading(true);setError("");try{const res=await fetch("/api/hw-admin/auth",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({password:pw})});if(res.ok){sessionStorage.setItem("hw-admin-auth",pw);onAuth();}else setError("Wrong password.");}catch{setError("Network error.");}setLoading(false);}
  return<div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:C.bg,fontFamily:"monospace"}}><div style={{border:`1px solid ${C.border}`,padding:"48px",width:"360px",textAlign:"center",background:C.surface}}><p style={{color:C.red,fontSize:"0.65rem",letterSpacing:"0.25em",marginBottom:"8px"}}>HAUNTED WALLPAPERS</p><h1 style={{color:C.textPri,fontSize:"1.4rem",marginBottom:"32px",fontWeight:300}}>Admin Access</h1><input type="password" placeholder="Enter password" value={pw} onChange={e=>setPw(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleLogin()} style={{...inp,marginBottom:"16px",fontSize:"1rem",padding:"12px"}} />{error&&<p style={{color:C.red,marginBottom:"12px",fontSize:"0.85rem"}}>{error}</p>}<Btn onClick={handleLogin} disabled={loading} style={{width:"100%",padding:"12px"}}>{loading?"Checking…":"Enter"}</Btn></div></div>;
}

function Sparkline({data}:{data:{date:string;count:number}[]}){
  const max=Math.max(...data.map(d=>d.count),1);const w=420;const h=60;const pts=data.map((d,i)=>{const x=i*(w/(data.length-1));const y=h-(d.count/max)*h;return`${x},${y}`;}).join(" ");
  return<svg viewBox={`0 0 ${w} ${h}`} style={{width:"100%",height:"60px",overflow:"visible"}}><polyline points={pts} fill="none" stroke={C.red} strokeWidth="2"/>{data.map((d,i)=><circle key={i} cx={i*(w/(data.length-1))} cy={h-(d.count/max)*h} r="3" fill={C.red} opacity="0.6"><title>{d.date}: {d.count}</title></circle>)}</svg>;
}

function AnalyticsTab({password}:{password:string}){
  const[data,setData]=useState<Analytics|null>(null);const[loading,setLoading]=useState(true);const[error,setError]=useState("");const[section,setSection]=useState<"downloads"|"pages"|"blog"|"device">("downloads");
  const load=useCallback(async()=>{setLoading(true);setError("");try{const res=await fetch("/api/hw-admin/analytics",{headers:{"x-admin-password":password}});if(!res.ok)throw new Error("Failed");setData(await res.json());}catch{setError("Could not load analytics.");}setLoading(false);},[password]);
  useEffect(()=>{load();},[load]);
  if(loading)return<p style={{color:C.textSec,padding:"40px 0",textAlign:"center"}}>Loading analytics…</p>;
  if(error)return<p style={{color:C.red}}>{error}</p>;
  if(!data)return null;
  const devTotal=data.deviceBreakdown.IPHONE+data.deviceBreakdown.ANDROID+data.deviceBreakdown.PC+data.deviceBreakdown.OTHER||1;
  return<div>
    <p style={{...eyebrow,marginBottom:"10px"}}>Downloads</p>
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"12px",marginBottom:"20px"}}>
      {[{label:"5 Minutes",value:data.downloads5Min.toLocaleString(),sub:"live"},{label:"30 Minutes",value:data.downloads30Min.toLocaleString(),sub:"live"},{label:"24 Hours",value:data.downloads24h.toLocaleString(),sub:"rolling"},{label:"30 Days",value:data.downloads30Days.toLocaleString(),sub:"rolling"}].map(s=><Card key={s.label} style={{textAlign:"center",padding:"20px 12px"}}><p style={{...eyebrow,marginBottom:"6px"}}>{s.label}</p><p style={{color:C.red,fontSize:"1.8rem",fontWeight:700,lineHeight:1}}>{s.value}</p><p style={{color:C.textMut,fontSize:"0.6rem",marginTop:"4px"}}>{s.sub}</p></Card>)}
    </div>
    <p style={{...eyebrow,marginBottom:"10px"}}>Page Views</p>
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"12px",marginBottom:"24px"}}>
      {[{label:"5 Minutes",value:data.pageViews5Min.toLocaleString(),sub:"live"},{label:"30 Minutes",value:data.pageViews30Min.toLocaleString(),sub:"live"},{label:"24 Hours",value:data.pageViews24h.toLocaleString(),sub:"rolling"},{label:"30 Days",value:data.pageViews30Days.toLocaleString(),sub:"rolling"}].map(s=><Card key={s.label} style={{textAlign:"center",padding:"20px 12px"}}><p style={{...eyebrow,marginBottom:"6px"}}>{s.label}</p><p style={{color:C.gold,fontSize:"1.8rem",fontWeight:700,lineHeight:1}}>{s.value}</p><p style={{color:C.textMut,fontSize:"0.6rem",marginTop:"4px"}}>{s.sub}</p></Card>)}
    </div>
    <p style={{...eyebrow,marginBottom:"10px"}}>All-Time Totals</p>
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"12px",marginBottom:"24px"}}>
      {[{label:"Total Downloads",value:data.totalDownloads.toLocaleString(),sub:"all time"},{label:"Image Downloads",value:data.imageDownloads.toLocaleString(),sub:"individual wallpapers"},{label:"Collection Downloads",value:data.collectionDownloads.toLocaleString(),sub:"full packs"},{label:"Total Page Views",value:data.totalPageViews.toLocaleString(),sub:"cumulative views"}].map(s=><Card key={s.label} style={{textAlign:"center",padding:"16px 12px"}}><p style={{...eyebrow,marginBottom:"4px"}}>{s.label}</p><p style={{color:C.purple,fontSize:"1.4rem",fontWeight:700,lineHeight:1}}>{s.value}</p><p style={{color:C.textMut,fontSize:"0.6rem",marginTop:"3px"}}>{s.sub}</p></Card>)}
    </div>
    <Card style={{marginBottom:"24px",padding:"20px"}}>
      <p style={{...eyebrow,marginBottom:"12px"}}>Downloads — last 14 days</p>
      <Sparkline data={data.downloadsPerDay}/>
      <div style={{display:"flex",justifyContent:"space-between",marginTop:"4px"}}><span style={{color:C.textMut,fontSize:"0.58rem"}}>{data.downloadsPerDay[0]?.date}</span><span style={{color:C.textMut,fontSize:"0.58rem"}}>{data.downloadsPerDay[data.downloadsPerDay.length-1]?.date}</span></div>
    </Card>
    <div style={{display:"flex",gap:"6px",marginBottom:"20px",flexWrap:"wrap"}}>
      {(["downloads","pages","blog","device"] as const).map(s=><button key={s} onClick={()=>setSection(s)} style={{background:section===s?C.red:"transparent",border:`1px solid ${section===s?C.red:C.border}`,color:section===s?"#fff":C.textSec,padding:"7px 16px",cursor:"pointer",fontSize:"0.7rem",fontFamily:"monospace",letterSpacing:"0.08em",textTransform:"uppercase"}}>{s==="downloads"?"🔽 Top Downloads":s==="pages"?"👁 Most Viewed":s==="blog"?"📖 Blog Posts":"📱 By Device"}</button>)}
    </div>
    {section==="downloads"&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"20px",marginBottom:"24px"}}>
      <Card><p style={eyebrow}>Top Downloaded Wallpapers</p>{data.topWallpapers.map((w,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${C.border}`,fontSize:"0.82rem"}}><div><span style={{color:C.textPri}}>{w.title}</span>{w.device&&<span style={{color:C.textMut,fontSize:"0.6rem",marginLeft:"8px"}}>{w.device}</span>}</div><span style={{color:C.red,fontWeight:700,flexShrink:0,marginLeft:"8px"}}>{w.downloads}</span></div>)}</Card>
      <Card><p style={eyebrow}>Top Downloaded Collections</p>{data.topCollections.map((c,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${C.border}`,fontSize:"0.82rem"}}><span style={{color:C.textPri,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flex:1}}>{c.title}</span><span style={{color:C.red,fontWeight:700,flexShrink:0,marginLeft:"8px"}}>{c.downloads}</span></div>)}</Card>
    </div>}
    {section==="pages"&&<Card style={{marginBottom:"24px"}}><p style={eyebrow}>Most Viewed Wallpaper Pages</p><p style={{color:C.textMut,fontSize:"0.65rem",marginBottom:"12px"}}>View counts are incremented each time a wallpaper detail page loads.</p>{data.topPageViews.map((p,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:`1px solid ${C.border}`,fontSize:"0.82rem"}}><div style={{flex:1,minWidth:0}}><span style={{color:C.textPri}}>{p.title}</span>{p.device&&<span style={{color:C.textMut,fontSize:"0.6rem",marginLeft:"8px"}}>{p.device}</span>}<br/><code style={{color:C.textMut,fontSize:"0.58rem"}}>/{p.device?.toLowerCase()??""}/{p.slug}</code></div><div style={{textAlign:"right",flexShrink:0,marginLeft:"12px"}}><span style={{color:C.gold,fontWeight:700}}>{p.views.toLocaleString()}</span><span style={{color:C.textMut,fontSize:"0.6rem",display:"block"}}>views</span></div></div>)}</Card>}
    {section==="blog"&&<Card style={{marginBottom:"24px"}}><p style={eyebrow}>Blog Posts ({data.publishedBlogPosts} published)</p>{data.blogPosts.length===0?<p style={{color:C.textMut,padding:"20px 0",textAlign:"center"}}>No blog posts yet.</p>:data.blogPosts.map((p,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:`1px solid ${C.border}`,gap:"12px"}}><div style={{flex:1,minWidth:0}}><p style={{color:C.textPri,fontSize:"0.82rem",marginBottom:"3px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.title}</p><div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}><span style={{background:"rgba(124,58,237,0.2)",color:C.purple,padding:"1px 7px",fontSize:"0.58rem"}}>{p.label}</span><span style={{color:C.textMut,fontSize:"0.6rem"}}>{p.date}</span><span style={{color:p.wordCount>=800?C.green:C.gold,fontSize:"0.6rem"}}>{p.wordCount} words{p.wordCount>=800?" ✓":""}</span></div></div><a href={`https://hauntedwallpapers.com/blog/${p.slug}`} target="_blank" rel="noopener noreferrer" style={{color:C.textMut,fontSize:"0.65rem",textDecoration:"none",flexShrink:0}}>↗</a></div>)}</Card>}
    {section==="device"&&<Card style={{marginBottom:"24px"}}><p style={eyebrow}>Downloads by Device (last 30 days)</p><div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:"16px",marginTop:"12px"}}>{[["📱 iPhone","IPHONE",C.red],["🤖 Android","ANDROID",C.purple],["🖥 PC","PC",C.gold],["❓ Other","OTHER",C.textMut]].map(([label,key,color])=>{const count=data.deviceBreakdown[key as keyof typeof data.deviceBreakdown];const pct=Math.round(count/devTotal*100);return<div key={key} style={{padding:"16px",border:`1px solid ${C.border}`,background:"rgba(255,255,255,0.02)"}}><p style={{color:C.textSec,fontSize:"0.7rem",marginBottom:"6px"}}>{label as string}</p><p style={{color:color as string,fontSize:"1.6rem",fontWeight:700,lineHeight:1}}>{count.toLocaleString()}</p><p style={{color:C.textMut,fontSize:"0.6rem",marginTop:"4px"}}>{pct}% of total</p></div>;})}
    </div></Card>}
    <Card style={{marginBottom:"24px"}}><p style={eyebrow}>Recent Downloads</p>{data.recentActivity.map((a,i)=><div key={i} style={{display:"flex",gap:"12px",padding:"8px 0",borderBottom:`1px solid ${C.border}`,fontSize:"0.78rem",alignItems:"center"}}><span style={{color:C.textMut,flexShrink:0,fontSize:"0.65rem"}}>{a.time}</span><span style={{flex:1,color:C.textPri,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{a.title}</span>{a.device&&<span style={{color:C.textMut,fontSize:"0.6rem",flexShrink:0}}>{a.device}</span>}<span style={{color:a.type==="image"?C.gold:C.purple,fontSize:"0.58rem",flexShrink:0}}>{a.type}</span></div>)}</Card>
    <div style={{display:"flex",gap:"12px",marginBottom:"32px"}}>
      <Btn onClick={load} variant="ghost">↻ Refresh</Btn>
      <a href="https://analytics.google.com" target="_blank" rel="noopener noreferrer" style={{display:"inline-flex",alignItems:"center",background:C.red,color:"#fff",padding:"10px 20px",textDecoration:"none",fontSize:"0.72rem",letterSpacing:"0.1em",textTransform:"uppercase",fontFamily:"monospace"}}>Open GA4 →</a>
    </div>
    <Card><p style={eyebrow}>AdSense Approval Checklist</p>{ADSENSE_CHECKLIST.map((item,i)=><div key={i} style={{display:"flex",gap:"10px",padding:"8px 0",borderBottom:`1px solid ${C.border}`,fontSize:"0.82rem"}}><span style={{color:item.done?C.green:C.red,flexShrink:0}}>{item.done?"✅":"☐"}</span><span style={{color:item.done?"rgba(76,175,80,0.8)":C.textSec}}>{item.item}</span></div>)}<div style={{marginTop:"16px",background:"rgba(192,0,26,0.08)",padding:"12px 16px",borderLeft:`3px solid ${C.red}`,fontSize:"0.8rem",color:C.textSec}}>💡 <strong style={{color:C.gold}}>Pro tip:</strong> Publish 20 high-quality blog posts (800+ words) over 6–8 weeks before applying.</div></Card>
  </div>;
}

function PageContentTab({password}:{password:string}){
  const[selectedSlug,setSelectedSlug]=useState("home");
  const[customSlug,setCustomSlug]=useState("");
  const[useCustom,setUseCustom]=useState(false);
  const[title,setTitle]=useState("");
  const[body,setBody]=useState("");
  const[metaDesc,setMetaDesc]=useState("");
  const[viewMode,setViewMode]=useState<"html"|"preview">("html");
  const[loading,setLoading]=useState(false);
  const[saving,setSaving]=useState(false);
  const[deleting,setDeleting]=useState(false);
  const[msg,setMsg]=useState<{type:"ok"|"err";text:string}|null>(null);
  const[allRecords,setAllRecords]=useState<PageContentRecord[]>([]);
  const[recordsLoaded,setRecordsLoaded]=useState(false);
  const activeSlug=useCustom?customSlug.trim():selectedSlug;

  useEffect(()=>{
    async function loadAll(){try{const res=await fetch("/api/hw-admin/page-content",{headers:{"x-admin-password":password}});if(res.ok){const j=await res.json();setAllRecords(j.records??[]);setRecordsLoaded(true);}}catch{}}
    loadAll();
  },[password]);

  useEffect(()=>{
    if(!activeSlug)return;
    setLoading(true);setMsg(null);
    fetch(`/api/hw-admin/page-content?slug=${encodeURIComponent(activeSlug)}`,{headers:{"x-admin-password":password}})
      .then(r=>r.json()).then(j=>{const rec:PageContentRecord|null=j.record;setTitle(rec?.title??"");setBody(rec?.body??"");setMetaDesc(rec?.metaDesc??"");})
      .catch(()=>setMsg({type:"err",text:"Failed to load."})).finally(()=>setLoading(false));
  },[activeSlug,password]);

  async function handleSave(){
    if(!activeSlug||!body.trim()){setMsg({type:"err",text:"Slug and body are required."});return;}
    setSaving(true);setMsg(null);
    try{const res=await fetch("/api/hw-admin/page-content",{method:"POST",headers:{"Content-Type":"application/json","x-admin-password":password},body:JSON.stringify({slug:activeSlug,title:title||null,body,metaDesc:metaDesc||null})});
      const j=await res.json();
      if(res.ok){setMsg({type:"ok",text:`✓ Saved content for "${activeSlug}"`});setAllRecords(prev=>{const exists=prev.find(r=>r.slug===activeSlug);const updated={id:j.record?.id??activeSlug,slug:activeSlug,title:title||null,body,metaDesc:metaDesc||null,updatedAt:new Date().toISOString()};return exists?prev.map(r=>r.slug===activeSlug?updated:r):[...prev,updated];});}
      else setMsg({type:"err",text:j.error??"Save failed."});}
    catch{setMsg({type:"err",text:"Network error."});}
    setSaving(false);
  }

  async function handleDelete(){
    if(!activeSlug||!confirm(`Delete content for "${activeSlug}"?`))return;
    setDeleting(true);
    try{const res=await fetch("/api/hw-admin/page-content",{method:"DELETE",headers:{"Content-Type":"application/json","x-admin-password":password},body:JSON.stringify({slug:activeSlug})});
      if(res.ok){setMsg({type:"ok",text:`✓ Deleted content for "${activeSlug}"`});setBody("");setTitle("");setMetaDesc("");setAllRecords(prev=>prev.filter(r=>r.slug!==activeSlug));}}
    catch{setMsg({type:"err",text:"Delete failed."});}
    setDeleting(false);
  }

  const hasContent=(slug:string)=>allRecords.some(r=>r.slug===slug);
  const wordCount=body.replace(/<[^>]*>/g," ").replace(/\s+/g," ").trim().split(" ").filter(Boolean).length;
  const pageInfo=PAGE_SLUGS.find(p=>p.slug===activeSlug);
  const liveUrl=pageInfo?.url?`https://hauntedwallpapers.com${pageInfo.url}`:null;

  return<div style={{display:"grid",gridTemplateColumns:"240px 1fr",gap:"24px",alignItems:"start"}}>
    <div><Card style={{padding:"0",overflow:"hidden"}}>
      <div style={{padding:"14px 16px",borderBottom:`1px solid ${C.border}`}}><p style={eyebrow}>Static Pages</p></div>
      {PAGE_SLUGS.map(({slug,label})=>{
        const active=!useCustom&&selectedSlug===slug;const saved=recordsLoaded&&hasContent(slug);
        return<button key={slug} onClick={()=>{setUseCustom(false);setSelectedSlug(slug);setMsg(null);}} style={{display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",padding:"10px 16px",background:active?"rgba(192,0,26,0.15)":"transparent",border:"none",borderBottom:`1px solid ${C.border}`,borderLeft:`3px solid ${active?C.red:"transparent"}`,color:active?C.textPri:C.textSec,cursor:"pointer",fontSize:"0.78rem",textAlign:"left"}}>
          <span>{label}</span>
          {saved&&<span style={{width:"6px",height:"6px",borderRadius:"50%",background:C.green,flexShrink:0}}/>}
        </button>;
      })}
      <div style={{padding:"14px 16px",borderTop:`1px solid ${C.border}`}}>
        <p style={{...eyebrow,marginBottom:"8px"}}>Custom Slug</p>
        <p style={{color:C.textMut,fontSize:"0.65rem",marginBottom:"8px",lineHeight:1.6}}>For collections:<br/><code style={{color:C.purple}}>collections/your-slug</code><br/>For events:<br/><code style={{color:C.purple}}>halloween</code></p>
        <input value={customSlug} onChange={e=>setCustomSlug(e.target.value.toLowerCase().replace(/[^a-z0-9/-]/g,""))} onFocus={()=>setUseCustom(true)} placeholder="collections/skeleton-card" style={{...inp,fontSize:"0.75rem",marginBottom:"6px"}}/>
        <Btn onClick={()=>{setUseCustom(true);setMsg(null);}} variant="ghost" style={{width:"100%",padding:"7px"}}>Load Custom</Btn>
      </div>
    </Card></div>
    <div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"20px",flexWrap:"wrap",gap:"12px"}}>
        <div>
          <p style={{color:C.red,fontSize:"0.65rem",letterSpacing:"0.2em",textTransform:"uppercase",marginBottom:"4px"}}>Editing</p>
          <code style={{color:C.gold,fontSize:"1rem"}}>{activeSlug||"—"}</code>
          {liveUrl&&<a href={liveUrl} target="_blank" rel="noopener noreferrer" style={{marginLeft:"12px",color:C.textMut,fontSize:"0.65rem",textDecoration:"none"}}>↗ View Live</a>}
        </div>
        <div style={{display:"flex",gap:"8px"}}>
          <Btn onClick={handleSave} disabled={saving||!activeSlug}>{saving?"Saving…":"💾 Save"}</Btn>
          {hasContent(activeSlug)&&<Btn onClick={handleDelete} disabled={deleting} variant="ghost" style={{color:C.red,borderColor:"rgba(192,0,26,0.4)"}}>{deleting?"…":"Delete"}</Btn>}
        </div>
      </div>
      <Msg msg={msg}/>
      {loading?<p style={{color:C.textSec}}>Loading…</p>:<div style={{display:"flex",flexDirection:"column",gap:"16px"}}>
        <Card style={{padding:"16px"}}>
          <label style={lbl}>Page Title Override (optional)</label>
          <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Leave blank to use default title" style={inp}/>
        </Card>
        <Card style={{padding:"16px"}}>
          <label style={lbl}>Meta Description Override (optional) <span style={{color:metaDesc.length>155?C.red:C.textMut}}>({metaDesc.length}/155)</span></label>
          <input value={metaDesc} onChange={e=>setMetaDesc(e.target.value)} placeholder="Leave blank to use default meta description" style={inp}/>
        </Card>
        <Card style={{padding:"16px"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"10px",flexWrap:"wrap",gap:"8px"}}>
            <label style={{...lbl,marginBottom:0}}>Page Body (HTML) <span style={{color:wordCount>=100?C.green:C.textMut}}>({wordCount} words{wordCount>=100?" ✓":" — aim for 100+"})</span></label>
            <div style={{display:"flex",gap:"4px"}}>
              {(["html","preview"] as const).map(m=><button key={m} type="button" onClick={()=>setViewMode(m)} style={{background:viewMode===m?(m==="preview"?C.red:"#2a2535"):"transparent",border:`1px solid ${C.border}`,color:viewMode===m?C.white:C.textSec,padding:"4px 12px",cursor:"pointer",fontSize:"0.65rem",fontFamily:"monospace"}}>{m==="preview"?"👁 Preview":"HTML"}</button>)}
            </div>
          </div>
          <HtmlToolbar textareaId="page-body-ta" value={body} onChange={setBody}/>
          {viewMode==="html"?<textarea id="page-body-ta" value={body} onChange={e=>setBody(e.target.value)} rows={16} placeholder={"<h2>About This Section</h2>\n<p>Write your content here…</p>"} spellCheck={false} style={{...inp,resize:"vertical",lineHeight:"1.6",fontFamily:"monospace",fontSize:"0.8rem"}}/>:<div style={{minHeight:"300px",border:`1px solid ${C.border}`,padding:"24px",background:"#08060f",lineHeight:"1.9",fontSize:"0.95rem",color:C.textPri}} dangerouslySetInnerHTML={{__html:body||`<p style='color:${C.textMut}'>Nothing to preview yet…</p>`}}/>}
          <p style={{color:C.textMut,fontSize:"0.62rem",marginTop:"6px"}}>ℹ HTML is saved and rendered on your website. Use &lt;h2&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;strong&gt;, etc.</p>
        </Card>
        <Card style={{padding:"14px 16px",background:"rgba(124,58,237,0.08)",borderColor:"rgba(124,58,237,0.3)"}}>
          <p style={{color:C.purple,fontSize:"0.75rem",marginBottom:"4px"}}>✦ How this works</p>
          <p style={{color:C.textSec,fontSize:"0.72rem",lineHeight:1.7}}>After saving, your page at <code style={{color:C.gold}}>/{activeSlug}</code> will automatically render this content. If no content is saved, the hardcoded default text shows instead.</p>
        </Card>
      </div>}
    </div>
  </div>;
}

function ImageUploaderTab({password}:{password:string}){
  const[collections,setCollections]=useState<{id:string;title:string;slug:string}[]>([]);useEffect(()=>{fetch("/api/hw-admin/collections",{headers:{"x-admin-password":password}}).then(r=>r.json()).then(j=>setCollections(j.collections??[])).catch(()=>{});},[password]);
  const[file,setFile]=useState<File|null>(null);const[highResFile,setHighResFile]=useState<File|null>(null);const[preview,setPreview]=useState("");const[dragging,setDragging]=useState(false);const[slug,setSlug]=useState("");const[title,setTitle]=useState("");const[altText,setAltText]=useState("");const[metaDescription,setMetaDescription]=useState("");const[description,setDescription]=useState("");const[deviceType,setDeviceType]=useState<"IPHONE"|"ANDROID"|"PC"|"">("");const[selectedTags,setSelectedTags]=useState<string[]>([]);const[customTags,setCustomTags]=useState<string[]>([]);const[newTagInput,setNewTagInput]=useState("");const[collectionId,setCollectionId]=useState("");const[isAdult,setIsAdult]=useState(false);const[commentsEnabled,setCommentsEnabled]=useState(false);const[isAvatar,setIsAvatar]=useState(false);const[descMode,setDescMode]=useState<"html"|"preview">("html");const[uploading,setUploading]=useState(false);const[generating,setGenerating]=useState(false);const[message,setMessage]=useState<{type:"ok"|"err";text:string}|null>(null);const[uploadedUrl,setUploadedUrl]=useState("");const dropRef=useRef<HTMLDivElement>(null);const fileInputRef=useRef<HTMLInputElement>(null);const highResInputRef=useRef<HTMLInputElement>(null);
  // ── Matching pair (e.g. "soulmate" / bestfriend avatars) — two files, one shared story ──
  const[isPair,setIsPair]=useState(false);const[pairFile,setPairFile]=useState<File|null>(null);const[pairPreview,setPairPreview]=useState("");const[pairDragging,setPairDragging]=useState(false);const[labelA,setLabelA]=useState("Him");const[labelB,setLabelB]=useState("Her");const pairFileInputRef=useRef<HTMLInputElement>(null);const[pairHighResFile,setPairHighResFile]=useState<File|null>(null);const pairHighResInputRef=useRef<HTMLInputElement>(null);
  function handlePairFileSelect(f:File){setPairFile(f);setPairPreview(URL.createObjectURL(f));setMessage(null);}
  function onPairDrop(e:React.DragEvent){e.preventDefault();setPairDragging(false);const f=e.dataTransfer.files[0];if(f?.type.startsWith("image/"))handlePairFileSelect(f);}
  function slugify(name:string){return name.toLowerCase().replace(/\.[^.]+$/,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");}
  function handleFileSelect(f:File){setFile(f);setSlug(slugify(f.name));if(!title)setTitle(f.name.replace(/\.[^.]+$/,"").replace(/[-_]/g," ").replace(/\b\w/g,c=>c.toUpperCase()));setPreview(URL.createObjectURL(f));setMessage(null);setUploadedUrl("");}
  function onDrop(e:React.DragEvent){e.preventDefault();setDragging(false);const f=e.dataTransfer.files[0];if(f?.type.startsWith("image/"))handleFileSelect(f);}
  function toggleTag(tag:string){setSelectedTags(prev=>prev.includes(tag)?prev.filter(t=>t!==tag):[...prev,tag]);}
  async function handleGenerateAll(){if(!file)return;setGenerating(true);setMessage(null);try{const base64=await fileToBase64(file);const result=await analyzeImageWithClaude(base64,file.type,password);if(result.title){setTitle(result.title);setSlug(result.title.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,""));}if(result.description)setDescription(result.description);if(result.altText)setAltText(result.altText);if(result.metaDescription)setMetaDescription(result.metaDescription);if(result.tags?.length)setSelectedTags(result.tags.filter(t=>ALL_TAGS.includes(t)));setMessage({type:"ok",text:"✓ AI generated title, description, alt text, meta description & tags!"});}catch(err){setMessage({type:"err",text:`⚠ AI generation failed: ${(err as Error).message}`});}setGenerating(false);}
  async function postOneImage(f:File,hrFile:File|null,slugVal:string,titleVal:string,extra:{matchingGroupId?:string;matchingLabel?:string}={}){const form=new FormData();form.append("file",f);if(hrFile)form.append("highResFile",hrFile);form.append("slug",slugVal);form.append("title",titleVal);form.append("altText",altText);form.append("metaDescription",metaDescription);form.append("description",description);const tagsToSend=newTagInput.trim()?[...new Set([...selectedTags,newTagInput.trim()])]:selectedTags;form.append("tags",JSON.stringify(tagsToSend));form.append("isAdult",String(isAdult));form.append("commentsEnabled",String(commentsEnabled));form.append("isAvatar",String(isPair?true:isAvatar));if(extra.matchingGroupId)form.append("matchingGroupId",extra.matchingGroupId);if(extra.matchingLabel)form.append("matchingLabel",extra.matchingLabel);if(deviceType)form.append("deviceType",deviceType);if(collectionId.trim())form.append("collectionId",collectionId.trim());const res=await fetch("/api/hw-admin/upload-image",{method:"POST",headers:{"x-admin-password":password},body:form});const json=await res.json();if(!res.ok)throw new Error(json.error??"Upload failed.");return json;}
  function resetUploadForm(){setFile(null);setHighResFile(null);setPreview("");setPairFile(null);setPairPreview("");setPairHighResFile(null);setSlug("");setTitle("");setDescription("");setMetaDescription("");setAltText("");setDeviceType("");setSelectedTags([]);setCollectionId("");setIsAdult(false);setCommentsEnabled(false);setIsAvatar(false);setIsPair(false);setLabelA("Him");setLabelB("Her");if(fileInputRef.current)fileInputRef.current.value="";if(highResInputRef.current)highResInputRef.current.value="";if(pairFileInputRef.current)pairFileInputRef.current.value="";if(pairHighResInputRef.current)pairHighResInputRef.current.value="";}
  async function handleUpload(){
    if(isPair){
      if(!file||!pairFile||!slug||!title||!labelA.trim()||!labelB.trim()){setMessage({type:"err",text:"Both images, a shared title, slug, and both labels are required for a matching pair."});return;}
      setUploading(true);setMessage(null);
      try{
        const groupId=(typeof crypto!=="undefined"&&"randomUUID"in crypto)?crypto.randomUUID():`pair-${Date.now()}`;
        const slugBit=(s:string)=>s.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
        const jsonA=await postOneImage(file,highResFile,`${slug}-${slugBit(labelA)}`,`${title} — ${labelA}`,{matchingGroupId:groupId,matchingLabel:labelA});
        await postOneImage(pairFile,pairHighResFile,`${slug}-${slugBit(labelB)}`,`${title} — ${labelB}`,{matchingGroupId:groupId,matchingLabel:labelB});
        setUploadedUrl(jsonA.url);
        setMessage({type:"ok",text:`✓ Matching pair uploaded! "${labelA}" + "${labelB}" will appear together as one slideshow card on /avatars.`});
        resetUploadForm();
      }catch(err){setMessage({type:"err",text:(err as Error).message||"Upload failed."});}
      setUploading(false);
      return;
    }
    if(!file||!slug||!title){setMessage({type:"err",text:"File, slug, and title are required."});return;}
    setUploading(true);setMessage(null);
    try{
      const json=await postOneImage(file,highResFile,slug,title);
      setUploadedUrl(json.url);
      setMessage({type:"ok",text:`✓ Uploaded! Slug: ${json.slug}${json.hasHighRes?" | 4K upscaled stored":""}`});
      resetUploadForm();
    }catch(err){setMessage({type:"err",text:(err as Error).message||"Upload failed."});}
    setUploading(false);
  }
  const altOk=altText.length>=130&&altText.length<=150;const descWords=description.replace(/<[^>]*>/g," ").split(/\s+/).filter(Boolean).length;const descOk=descWords>=180&&descWords<=220;
  return<div style={{display:"flex",flexDirection:"column",gap:"20px"}}>
    <Card style={{padding:"14px 18px",borderColor:C.red}}><strong style={{color:C.gold}}>📤 Image Uploader</strong><span style={{color:C.textSec,marginLeft:"8px",fontSize:"0.82rem"}}>Drop thumbnail → optionally add 4K file → fill in details → upload.</span></Card>
    <Msg msg={message}/>
    <div>
      <label style={{...lbl,marginBottom:"8px"}}>{isPair?`Partner A — "${labelA||"first"}" Image (required)`:"Thumbnail Image (required — shown in gallery & cards)"}</label>
      <div ref={dropRef} onDragOver={e=>{e.preventDefault();setDragging(true);}} onDragLeave={()=>setDragging(false)} onDrop={onDrop} onClick={()=>fileInputRef.current?.click()} style={{border:`2px dashed ${dragging?C.red:file?C.green:C.border}`,background:dragging?"rgba(192,0,26,0.06)":C.surface,padding:"32px 24px",textAlign:"center",cursor:"pointer",transition:"all 0.2s"}}>
        <input ref={fileInputRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>{const f=e.target.files?.[0];if(f)handleFileSelect(f);}}/>
        {preview?<div style={{display:"flex",gap:"24px",alignItems:"flex-start",justifyContent:"center",flexWrap:"wrap"}}><img src={preview} alt="Preview" style={{maxHeight:"180px",maxWidth:"160px",objectFit:"contain",border:`1px solid ${C.border}`}}/><div style={{textAlign:"left"}}><p style={{color:C.green,fontSize:"0.75rem",marginBottom:"6px"}}>✓ Thumbnail ready</p><p style={{color:C.textPri,fontSize:"0.85rem",marginBottom:"4px"}}>{file?.name}</p><p style={{color:C.textSec,fontSize:"0.75rem"}}>{file?(file.size/1024/1024).toFixed(2)+" MB":""}</p><p style={{color:C.textMut,fontSize:"0.68rem",marginTop:"6px"}}>Used in gallery cards and image pages.<br/>Recommended: 720–1080px wide.</p><p style={{color:C.textMut,fontSize:"0.68rem",marginTop:"4px"}}>Click to replace</p></div></div>:<><p style={{fontSize:"2rem",marginBottom:"10px"}}>🖼️</p><p style={{color:C.textPri,fontSize:"0.9rem",marginBottom:"6px"}}>{dragging?"Drop it!":"Drag & drop thumbnail here"}</p><p style={{color:C.textSec,fontSize:"0.75rem"}}>or click to browse · JPG, PNG, WEBP</p></>}
      </div>
    </div>
    <Card style={{padding:"16px",borderColor:highResFile?C.gold:C.border,background:highResFile?"rgba(201,168,76,0.05)":C.surface}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"12px"}}>
        <div>
          <label style={{...lbl,marginBottom:"4px"}}>4K / Upscaled Image (optional — what users actually download)</label>
          <p style={{color:C.textSec,fontSize:"0.68rem",lineHeight:1.6}}>Upload the full-resolution version. Users download this via signed URL.<br/>If omitted, the thumbnail is used as the download file instead.</p>
        </div>
        <div style={{flexShrink:0}}>
          <input ref={highResInputRef} type="file" accept="image/*" id="highres-input" style={{display:"none"}} onChange={e=>{const f=e.target.files?.[0];if(f)setHighResFile(f);}}/>
          <label htmlFor="highres-input" style={{display:"inline-flex",alignItems:"center",gap:"8px",background:"transparent",border:`1px solid ${highResFile?C.gold:C.border}`,color:highResFile?C.gold:C.textSec,padding:"8px 16px",cursor:"pointer",fontSize:"0.7rem",fontFamily:"monospace",letterSpacing:"0.08em"}}>
            {highResFile?"✓ 4K Ready":"📁 Browse 4K File"}
          </label>
        </div>
      </div>
      {highResFile&&<div style={{marginTop:"12px",display:"flex",alignItems:"center",gap:"12px",flexWrap:"wrap"}}>
        <p style={{color:C.gold,fontSize:"0.78rem"}}>✓ {highResFile.name}</p>
        <p style={{color:C.textSec,fontSize:"0.72rem"}}>{(highResFile.size/1024/1024).toFixed(1)} MB</p>
        <button onClick={()=>{setHighResFile(null);if(highResInputRef.current)highResInputRef.current.value="";}} style={{background:"transparent",border:`1px solid ${C.border}`,color:C.red,padding:"4px 10px",cursor:"pointer",fontSize:"0.65rem",fontFamily:"monospace"}}>Remove</button>
      </div>}
    </Card>
    {file&&<>
      <Card style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:"16px",flexWrap:"wrap",padding:"16px 18px",borderColor:"rgba(192,0,26,0.4)",background:"rgba(192,0,26,0.06)"}}>
        <div><p style={{color:C.gold,fontSize:"0.75rem",marginBottom:"4px"}}>✨ AI Auto-Fill (GLM Vision)</p><p style={{color:C.textSec,fontSize:"0.68rem"}}>Generates title, 200-word description, SEO alt text, meta description & tags.</p></div>
        <Btn onClick={handleGenerateAll} disabled={generating}>{generating?"✨ Analysing…":"✨ Generate All Fields"}</Btn>
      </Card>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"16px"}}>
        <Card style={{padding:"16px"}}><label style={lbl}>Image Title</label><input value={title} onChange={e=>{const v=e.target.value;setTitle(v);setSlug(v.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,""));}} placeholder="Dark Gothic Forest" style={inp}/></Card>
        <Card style={{padding:"16px"}}><label style={lbl}>URL Slug</label><input value={slug} onChange={e=>setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g,""))} placeholder="dark-gothic-forest" style={inp}/></Card>
      </div>
      <Card style={{padding:"16px"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"8px",flexWrap:"wrap",gap:"8px"}}>
          <label style={{...lbl,marginBottom:0}}>Description (HTML) <span style={{color:descOk?C.green:descWords>0?C.gold:C.textMut}}>({descWords} words{descOk?" ✓":" — aim for ~200"})</span></label>
          <div style={{display:"flex",gap:"4px"}}>{(["html","preview"] as const).map(m=><button key={m} type="button" onClick={()=>setDescMode(m)} style={{background:descMode===m?(m==="preview"?C.red:"#2a2535"):"transparent",border:`1px solid ${C.border}`,color:descMode===m?C.white:C.textSec,padding:"3px 10px",cursor:"pointer",fontSize:"0.65rem",fontFamily:"monospace"}}>{m==="preview"?"👁 Preview":"HTML"}</button>)}</div>
        </div>
        <HtmlToolbar textareaId="img-desc-ta" value={description} onChange={setDescription}/>
        {descMode==="html"?<textarea id="img-desc-ta" value={description} onChange={e=>setDescription(e.target.value)} placeholder={"<h2>About This Wallpaper</h2>\n<p>Your description here...</p>"} rows={8} spellCheck={false} style={{...inp,resize:"vertical",lineHeight:"1.6",fontFamily:"monospace",fontSize:"0.8rem"}}/>:<div style={{minHeight:"200px",border:`1px solid ${C.border}`,padding:"20px",background:"#08060f",lineHeight:"1.9",color:C.textPri}} dangerouslySetInnerHTML={{__html:description||`<p style='color:${C.textMut}'>Nothing to preview yet…</p>`}}/>}
      </Card>
      <Card style={{padding:"16px"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"8px",flexWrap:"wrap",gap:"8px"}}>
          <label style={{...lbl,marginBottom:0}}>Alt Text (SEO) <span style={{color:altOk?C.green:altText.length>0?C.gold:C.textMut}}>({altText.length}/150{altOk?" ✓":" — aim for 130–150"})</span></label>
          <Btn onClick={async()=>{if(!file)return;setGenerating(true);try{const{altText:at}=await analyzeImageWithClaude(await fileToBase64(file),file.type,password);setAltText(at);}catch(err){setMessage({type:"err",text:(err as Error).message});}setGenerating(false);}} disabled={generating} variant="ghost" style={{fontSize:"0.65rem",padding:"5px 14px"}}>{generating?"✨ Analysing…":"✨ AI Generate"}</Btn>
        </div>
        <input value={altText} onChange={e=>setAltText(e.target.value)} placeholder="Dark gothic forest wallpaper with moonlit trees — free HD download" style={inp}/>
      </Card>
      <Card style={{padding:"16px"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"8px",flexWrap:"wrap",gap:"8px"}}>
          <label style={{...lbl,marginBottom:0}}>Meta Description (Google snippet) <span style={{color:metaDescription.length>155?C.red:metaDescription.length>=130?C.green:C.textMut}}>({metaDescription.length}/155{metaDescription.length>=130&&metaDescription.length<=155?" ✓":""})</span></label>
          <Btn onClick={async()=>{if(!file)return;setGenerating(true);try{const{metaDescription:md}=await analyzeImageWithClaude(await fileToBase64(file),file.type,password);setMetaDescription(md);}catch(err){setMessage({type:"err",text:(err as Error).message});}setGenerating(false);}} disabled={generating} variant="ghost" style={{fontSize:"0.65rem",padding:"5px 14px"}}>{generating?"✨ Analysing…":"✨ AI Generate"}</Btn>
        </div>
        <input value={metaDescription} onChange={e=>setMetaDescription(e.target.value)} placeholder="130–155 chars · keyword-rich · what Google shows in search results" style={{...inp,borderColor:metaDescription.length>155?C.red:metaDescription.length>=130&&metaDescription.length<=155?C.green:C.border}}/>
        <p style={{color:C.textMut,fontSize:"0.62rem",marginTop:"6px"}}>Leave blank to auto-generate from the description. Visible in Google search results only.</p>
      </Card>
      <Card style={{padding:"16px"}}>
        <label style={lbl}>FOMO Badges (optional)</label>
        <p style={{color:C.textMut,fontSize:"0.65rem",marginBottom:"10px"}}>Badges show on the wallpaper card to drive downloads. Pick one or more.</p>
        <div style={{display:"flex",flexWrap:"wrap",gap:"8px"}}>
          {BADGE_TAGS.map(({tag,label,color,bg})=>{
            const active=selectedTags.includes(tag);
            return<button key={tag} type="button" onClick={()=>setSelectedTags(prev=>active?prev.filter(t=>t!==tag):[...prev,tag])} style={{background:active?bg:"transparent",border:`1px solid ${active?color:C.border}`,color:active?color:C.textMut,padding:"6px 14px",cursor:"pointer",fontSize:"0.72rem",fontFamily:"monospace",transition:"all 0.15s"}}>{label}</button>;
          })}
        </div>
        {BADGE_TAGS.some(b=>selectedTags.includes(b.tag))&&<p style={{color:C.gold,fontSize:"0.6rem",marginTop:"8px"}}>Active: {BADGE_TAGS.filter(b=>selectedTags.includes(b.tag)).map(b=>b.label).join(", ")}</p>}
      </Card>
      <Card style={{padding:"14px 18px",borderColor:isAdult?C.red:C.border,background:isAdult?"rgba(192,0,26,0.08)":C.surface}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:"16px"}}>
          <div><p style={{color:C.textSec,fontSize:"0.72rem",marginBottom:"4px"}}>{isAdult&&<><AdultBadge/>{" "}</>}16+ Adult / Mature Content</p><p style={{color:C.textMut,fontSize:"0.68rem"}}>Shows 16+ badge and requires age confirmation.</p></div>
          <Btn onClick={()=>setIsAdult(!isAdult)} variant={isAdult?"danger":"ghost"} style={{flexShrink:0}}>{isAdult?"✓ 16+ ON":"Mark as 16+"}</Btn>
        </div>
      </Card>
      <Card style={{padding:"14px 18px",borderColor:commentsEnabled?"rgba(201,168,76,0.5)":C.border,background:commentsEnabled?"rgba(201,168,76,0.06)":C.surface}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:"16px"}}>
          <div>
            <p style={{color:commentsEnabled?C.gold:C.textSec,fontSize:"0.72rem",marginBottom:"4px"}}>💬 Birthday Wishes / Comments Section</p>
            <p style={{color:C.textMut,fontSize:"0.68rem",lineHeight:1.6}}>Allow visitors to leave birthday wishes on this wallpaper&apos;s page.<br/>Wishes require your approval before appearing publicly.</p>
          </div>
          <Btn onClick={()=>setCommentsEnabled(!commentsEnabled)} variant={commentsEnabled?"success":"ghost"} style={{flexShrink:0}}>{commentsEnabled?"✓ Comments ON":"Enable Comments"}</Btn>
        </div>
      </Card>
      <Card style={{padding:"14px 18px",borderColor:isAvatar?"rgba(99,179,237,0.5)":C.border,background:isAvatar?"rgba(99,179,237,0.06)":C.surface}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:"16px"}}>
          <div>
            <p style={{color:isAvatar?"#63b3ed":C.textSec,fontSize:"0.72rem",marginBottom:"4px"}}>🎭 Discord Avatar / Profile Picture</p>
            <p style={{color:C.textMut,fontSize:"0.68rem",lineHeight:1.6}}>Show on <a href="/avatars" target="_blank" rel="noopener" style={{color:"#63b3ed"}}>/avatars</a> — displays as a perfect 1:1 square pfp.</p>
          </div>
          <Btn onClick={()=>setIsAvatar(!isAvatar)} variant={isAvatar?"success":"ghost"} style={{flexShrink:0,borderColor:isAvatar?"#63b3ed":undefined,color:isAvatar?"#63b3ed":undefined}}>{isAvatar?"✓ Avatar ON":"Mark as Avatar"}</Btn>
        </div>
      </Card>
      <Card style={{padding:"14px 18px",borderColor:selectedTags.includes("lock-screen-wallpaper")||selectedTags.includes("home-screen-wallpaper")?"rgba(201,168,76,0.5)":C.border,background:selectedTags.includes("lock-screen-wallpaper")||selectedTags.includes("home-screen-wallpaper")?"rgba(201,168,76,0.06)":C.surface}}>
        <div>
          <p style={{color:C.gold,fontSize:"0.72rem",marginBottom:"4px"}}>🔒🏠 Lock Screen / Home Screen Pages</p>
          <p style={{color:C.textMut,fontSize:"0.68rem",lineHeight:1.6,marginBottom:"10px"}}>Show this wallpaper on the dedicated <code>/iphone/lock-screen-wallpapers</code> or <code>/home-screen-wallpapers</code> pages (and the Android equivalents). Pick one, both, or neither.</p>
          <div style={{display:"flex",gap:"10px",flexWrap:"wrap"}}>
            <Btn onClick={()=>setSelectedTags(prev=>prev.includes("lock-screen-wallpaper")?prev.filter(t=>t!=="lock-screen-wallpaper"):[...prev,"lock-screen-wallpaper"])} variant={selectedTags.includes("lock-screen-wallpaper")?"success":"ghost"} style={{borderColor:selectedTags.includes("lock-screen-wallpaper")?"#c9a84c":undefined,color:selectedTags.includes("lock-screen-wallpaper")?"#c9a84c":undefined}}>{selectedTags.includes("lock-screen-wallpaper")?"🔒 Lock Screen ON":"Mark as Lock Screen"}</Btn>
            <Btn onClick={()=>setSelectedTags(prev=>prev.includes("home-screen-wallpaper")?prev.filter(t=>t!=="home-screen-wallpaper"):[...prev,"home-screen-wallpaper"])} variant={selectedTags.includes("home-screen-wallpaper")?"success":"ghost"} style={{borderColor:selectedTags.includes("home-screen-wallpaper")?"#c9a84c":undefined,color:selectedTags.includes("home-screen-wallpaper")?"#c9a84c":undefined}}>{selectedTags.includes("home-screen-wallpaper")?"🏠 Home Screen ON":"Mark as Home Screen"}</Btn>
          </div>
        </div>
      </Card>
      <Card style={{padding:"14px 18px",borderColor:isPair?"rgba(236,72,153,0.5)":C.border,background:isPair?"rgba(236,72,153,0.06)":C.surface}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:"16px"}}>
          <div>
            <p style={{color:isPair?"#ec48a9":C.textSec,fontSize:"0.72rem",marginBottom:"4px"}}>💞 Matching Pair (soulmate / bestfriend avatars)</p>
            <p style={{color:C.textMut,fontSize:"0.68rem",lineHeight:1.6}}>Upload two images that share one story. They show as a single card on <a href="/avatars" target="_blank" rel="noopener" style={{color:"#ec48a9"}}>/avatars</a> with a slideshow between them — each half downloads separately. Automatically marked as Avatar.</p>
          </div>
          <Btn onClick={()=>{const next=!isPair;setIsPair(next);if(next)setIsAvatar(true);}} variant={isPair?"success":"ghost"} style={{flexShrink:0,borderColor:isPair?"#ec48a9":undefined,color:isPair?"#ec48a9":undefined}}>{isPair?"✓ Pair ON":"Mark as Matching Pair"}</Btn>
        </div>
        {isPair&&<div style={{marginTop:"16px",display:"flex",flexDirection:"column",gap:"12px"}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px"}}>
            <div><label style={{...lbl,fontSize:"0.65rem"}}>Slideshow Label — Image 1 (above)</label><input value={labelA} onChange={e=>setLabelA(e.target.value)} placeholder="Him" style={inp}/></div>
            <div><label style={{...lbl,fontSize:"0.65rem"}}>Slideshow Label — Image 2 (below)</label><input value={labelB} onChange={e=>setLabelB(e.target.value)} placeholder="Her" style={inp}/></div>
          </div>
          <div>
            <label style={{...lbl,marginBottom:"8px"}}>{`Partner B — "${labelB||"second"}" Image (required)`}</label>
            <div onDragOver={e=>{e.preventDefault();setPairDragging(true);}} onDragLeave={()=>setPairDragging(false)} onDrop={onPairDrop} onClick={()=>pairFileInputRef.current?.click()} style={{border:`2px dashed ${pairDragging?"#ec48a9":pairFile?C.green:C.border}`,background:pairDragging?"rgba(236,72,153,0.06)":C.surface,padding:"28px 24px",textAlign:"center",cursor:"pointer",transition:"all 0.2s"}}>
              <input ref={pairFileInputRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>{const f=e.target.files?.[0];if(f)handlePairFileSelect(f);}}/>
              {pairPreview?<div style={{display:"flex",gap:"24px",alignItems:"flex-start",justifyContent:"center",flexWrap:"wrap"}}><img src={pairPreview} alt="Partner B preview" style={{maxHeight:"160px",maxWidth:"140px",objectFit:"contain",border:`1px solid ${C.border}`}}/><div style={{textAlign:"left"}}><p style={{color:C.green,fontSize:"0.75rem",marginBottom:"6px"}}>✓ Partner B ready</p><p style={{color:C.textPri,fontSize:"0.85rem"}}>{pairFile?.name}</p><p style={{color:C.textMut,fontSize:"0.65rem",marginTop:"6px"}}>Click to replace</p></div></div>:<><p style={{fontSize:"1.7rem",marginBottom:"8px"}}>🖼️</p><p style={{color:C.textPri,fontSize:"0.85rem"}}>{pairDragging?"Drop it!":`Drag & drop "${labelB||"Partner B"}"'s image here`}</p><p style={{color:C.textSec,fontSize:"0.72rem"}}>or click to browse</p></>}
            </div>
          </div>
          <p style={{color:C.textMut,fontSize:"0.62rem",lineHeight:1.6}}>Title, slug, description, tags, and badges above are shared by both halves — each just gets its label appended (e.g. &ldquo;{title||"Your Title"} — {labelA||"Him"}&rdquo;). Write the lore note once; it covers the whole pair.</p>
          <div style={{marginTop:"12px",padding:"12px 14px",border:`1px solid ${pairHighResFile?C.gold:C.border}`,background:pairHighResFile?"rgba(201,168,76,0.05)":C.surface}}>
            <label style={{...lbl,marginBottom:"6px",fontSize:"0.65rem"}}>4K / Upscaled Image for &ldquo;{labelB||"Her"}&rdquo; (optional)</label>
            <input ref={pairHighResInputRef} type="file" accept="image/*" id="pair-highres-input" style={{display:"none"}} onChange={e=>{const f=e.target.files?.[0];if(f)setPairHighResFile(f);}}/>
            <label htmlFor="pair-highres-input" style={{display:"inline-flex",alignItems:"center",gap:"8px",background:"transparent",border:`1px solid ${pairHighResFile?C.gold:C.border}`,color:pairHighResFile?C.gold:C.textSec,padding:"7px 14px",cursor:"pointer",fontSize:"0.68rem",fontFamily:"monospace",letterSpacing:"0.08em"}}>
              {pairHighResFile?"✓ 4K Ready — click to replace":"📁 Browse 4K File for Partner B"}
            </label>
            {pairHighResFile&&<div style={{marginTop:"8px",display:"flex",alignItems:"center",gap:"12px",flexWrap:"wrap"}}>
              <p style={{color:C.gold,fontSize:"0.75rem"}}>✓ {pairHighResFile.name}</p>
              <p style={{color:C.textSec,fontSize:"0.7rem"}}>{(pairHighResFile.size/1024/1024).toFixed(1)} MB</p>
              <button onClick={()=>{setPairHighResFile(null);if(pairHighResInputRef.current)pairHighResInputRef.current.value="";}} style={{background:"transparent",border:`1px solid ${C.border}`,color:C.red,padding:"3px 10px",cursor:"pointer",fontSize:"0.62rem",fontFamily:"monospace"}}>Remove</button>
            </div>}
          </div>
        </div>}
      </Card>
      <Card style={{padding:"16px"}}>
        <label style={lbl}>Device Type</label>
        <div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}>
          {(["","IPHONE","ANDROID","PC"] as const).map(d=><button key={d} type="button" onClick={()=>setDeviceType(d)} style={{background:deviceType===d?C.red:"transparent",border:`1px solid ${deviceType===d?C.red:C.border}`,color:deviceType===d?C.white:C.textSec,padding:"8px 20px",cursor:"pointer",fontSize:"0.7rem",letterSpacing:"0.1em",textTransform:"uppercase",fontFamily:"monospace"}}>{d===""?"Any":d==="IPHONE"?"📱 iPhone":d==="ANDROID"?"🤖 Android":"🖥️ PC"}</button>)}
        </div>
      </Card>
      <Card style={{padding:"16px"}}>
        <label style={lbl}>Tags ({selectedTags.length} selected)</label>
          <div style={{display:"flex",gap:"8px",marginBottom:"10px",alignItems:"center"}}>
            <input placeholder="Paste tags separated by commas: dark, gothic, horror, skull…" style={{...inp,flex:1,fontSize:"0.75rem",borderColor:"rgba(201,168,76,0.4)"}} onKeyDown={e=>{if(e.key==="Enter"){const raw=(e.target as HTMLInputElement).value;const parsed=raw.split(",").map(t=>t.trim().toLowerCase().replace(/\s+/g,"-")).filter(Boolean);const known=parsed.filter(t=>ALL_TAGS.includes(t));const unknown=parsed.filter(t=>!ALL_TAGS.includes(t));setSelectedTags(prev=>[...new Set([...prev,...known])]);setCustomTags(prev=>[...new Set([...prev,...unknown])]);setSelectedTags(prev=>[...new Set([...prev,...unknown])]);(e.target as HTMLInputElement).value="";e.preventDefault();}}} onPaste={e=>{setTimeout(()=>{const raw=(e.target as HTMLInputElement).value;const parsed=raw.split(",").map(t=>t.trim().toLowerCase().replace(/\s+/g,"-")).filter(Boolean);if(parsed.length>1){const known=parsed.filter(t=>ALL_TAGS.includes(t));const unknown=parsed.filter(t=>!ALL_TAGS.includes(t));setSelectedTags(prev=>[...new Set([...prev,...known])]);setCustomTags(prev=>[...new Set([...prev,...unknown])]);setSelectedTags(prev=>[...new Set([...prev,...unknown])]);(e.target as HTMLInputElement).value="";}},50);}}/>
            <Btn onClick={()=>{if(selectedTags.length>0){setSelectedTags([]);setCustomTags([]);}}} variant="ghost" style={{fontSize:"0.65rem",padding:"8px 12px",flexShrink:0}}>Clear</Btn>
          </div>
          <ResidentTagPicker selectedTags={selectedTags} onToggle={(tag)=>setSelectedTags(prev=>prev.includes(tag)?prev.filter(t=>t!==tag):[...prev,tag])} password={password}/>
          <div style={{display:"flex",flexWrap:"wrap",gap:"6px",marginBottom:"10px"}}>
          {[...ALL_TAGS,...customTags].map(tag=><button key={tag} type="button" onClick={()=>toggleTag(tag)} style={{background:selectedTags.includes(tag)?"rgba(192,0,26,0.2)":"transparent",border:`1px solid ${selectedTags.includes(tag)?C.red:C.border}`,color:selectedTags.includes(tag)?C.textPri:C.textSec,padding:"5px 12px",cursor:"pointer",fontSize:"0.65rem",letterSpacing:"0.08em",fontFamily:"monospace"}}>{selectedTags.includes(tag)?"✓ ":""}{tag}</button>)}
        </div>
        <div style={{display:"flex",gap:"8px"}}>
          <input placeholder="Add custom tag…" value={newTagInput} onChange={e=>setNewTagInput(e.target.value.toLowerCase().replace(/\s+/g,"-"))} onKeyDown={e=>{if(e.key==="Enter"&&newTagInput.trim()){const v=newTagInput.trim();setCustomTags(prev=>prev.includes(v)?prev:[...prev,v]);setSelectedTags(prev=>prev.includes(v)?prev:[...prev,v]);setNewTagInput("");}}} style={{...inp,flex:1,fontSize:"0.75rem"}}/>
          <Btn onClick={()=>{if(!newTagInput.trim())return;const v=newTagInput.trim();setCustomTags(prev=>prev.includes(v)?prev:[...prev,v]);setSelectedTags(prev=>prev.includes(v)?prev:[...prev,v]);setNewTagInput("");}} variant="ghost">Add</Btn>
        </div>
      </Card>
      <Card style={{padding:"16px"}}><label style={lbl}>Collection (optional)</label><select value={collectionId} onChange={e=>setCollectionId(e.target.value)} style={{...inp,cursor:"pointer"}}><option value="">— Standalone (no collection) —</option>{collections.map(c=><option key={c.id} value={c.id}>{c.title} ({c.slug})</option>)}</select></Card>
      <Card style={{padding:"14px 16px",background:"rgba(124,58,237,0.06)",borderColor:"rgba(124,58,237,0.3)"}}>
        <p style={{color:C.purple,fontSize:"0.72rem",marginBottom:"8px"}}>✦ Upload summary</p>
        <div style={{display:"flex",flexDirection:"column",gap:"4px",fontSize:"0.7rem",color:C.textSec}}>
          <span>📷 {isPair?`Image 1 ("${labelA||"Him"}")`:"Thumbnail"}: {file?`${file.name} (${(file.size/1024/1024).toFixed(1)} MB)`:"Not set"} → stored at <code style={{color:C.gold}}>thumbnails/{slug}/</code></span>
          {isPair?<><span>📷 Image 2 (&ldquo;{labelB||"Her"}&rdquo;): {pairFile?`${pairFile.name} (${(pairFile.size/1024/1024).toFixed(1)} MB)`:"Not set"} → stored at <code style={{color:C.gold}}>thumbnails/{slug}-{(labelB||"her").toLowerCase()}/</code></span><span>{pairHighResFile?`🖼 4K for "${labelB||"Her"}": ${pairHighResFile.name} (${(pairHighResFile.size/1024/1024).toFixed(1)} MB)`:`4K for "${labelB||"Her"}": none — thumbnail used for downloads`} → stored at <code style={{color:C.gold}}>high-res/{slug}-{(labelB||"her").toLowerCase()}/</code></span></>:<span>{highResFile?`🖼 4K file: ${highResFile.name} (${(highResFile.size/1024/1024).toFixed(1)} MB)`:` 4K file: none — thumbnail will be used for downloads`} → stored at <code style={{color:C.gold}}>high-res/{slug}/</code></span>}
          <span style={{color:C.textMut,fontSize:"0.65rem",marginTop:"4px"}}>{isPair?"Two image rows will be created, linked by a shared pair id, with the same title/description/tags and each label appended.":"Users see the thumbnail everywhere. Clicking Download serves the 4K file via a secure signed URL."}</span>
        </div>
      </Card>
      <Btn onClick={handleUpload} disabled={uploading} style={{padding:"14px 32px",fontSize:"0.82rem"}}>{uploading?"⏳ Uploading…":isPair?"💞 Upload Matching Pair":"📤 Upload Image"}</Btn>
      {uploadedUrl&&<Card style={{padding:"14px 16px",borderColor:C.green,background:"rgba(76,175,80,0.08)"}}><p style={{color:C.green,fontSize:"0.8rem",marginBottom:"6px"}}>✓ Uploaded successfully</p><a href={uploadedUrl} target="_blank" rel="noopener noreferrer" style={{color:C.gold,fontSize:"0.75rem",wordBreak:"break-all"}}>{uploadedUrl}</a></Card>}
    </>}
  </div>;
}

function BlogTab({password,prefillTitle,prefillLabel,onPrefillUsed}:{password:string;prefillTitle:string;prefillLabel:string;onPrefillUsed:()=>void}){
  const[mode,setMode]=useState<"list"|"new"|"edit">("list");const[posts,setPosts]=useState<Post[]>([]);const[loading,setLoading]=useState(true);const[editPost,setEditPost]=useState<Post|null>(null);const[title,setTitle]=useState("");const[slug,setSlug]=useState("");const[label,setLabel]=useState("Wallpaper Guides");const[content,setContent]=useState("");const[featImg,setFeatImg]=useState("");const[saving,setSaving]=useState(false);const[deleting,setDeleting]=useState<string|null>(null);const[msg,setMsg]=useState<{type:"ok"|"err";text:string}|null>(null);const[contentMode,setContentMode]=useState<"html"|"preview">("html");
  const[blogImgFile,setBlogImgFile]=useState<File|null>(null);const[blogImgUploading,setBlogImgUploading]=useState(false);const[blogImgMsg,setBlogImgMsg]=useState<{type:"ok"|"err";text:string}|null>(null);const blogImgInputRef=useRef<HTMLInputElement>(null);
  async function handleBlogImageUpload(file:File){setBlogImgUploading(true);setBlogImgMsg(null);try{const form=new FormData();form.append("file",file);const res=await fetch("/api/hw-admin/upload-blog-image",{method:"POST",headers:{"x-admin-password":password},body:form});const j=await res.json();if(res.ok){setFeatImg(j.url);setBlogImgMsg({type:"ok",text:"✓ Image uploaded — URL filled in below"});}else setBlogImgMsg({type:"err",text:j.error??"Upload failed"});}catch{setBlogImgMsg({type:"err",text:"Network error."});}setBlogImgUploading(false);}
  const load=useCallback(async()=>{setLoading(true);try{const res=await fetch("/api/hw-admin/blogs",{headers:{"x-admin-password":password}});if(res.ok){const j=await res.json();setPosts(j.posts??[]);}}catch{}setLoading(false);},[password]);
  useEffect(()=>{load();},[load]);
  useEffect(()=>{if(prefillTitle){setTitle(prefillTitle);setSlug(prefillTitle.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,""));setLabel(prefillLabel||"Wallpaper Guides");setMode("new");onPrefillUsed();}},[prefillTitle,prefillLabel,onPrefillUsed]);
  function openNew(){setTitle("");setSlug("");setLabel("Wallpaper Guides");setContent("");setFeatImg("");setEditPost(null);setMsg(null);setMode("new");}
  function openEdit(p:Post){setEditPost(p);setTitle(p.title);setSlug(p.slug);setLabel(p.label);setContent(p.content??"");setFeatImg(p.featuredImage??"");setMsg(null);setMode("edit");}
  async function handleSave(){if(!title||!slug||!content){setMsg({type:"err",text:"Title, slug, and content are required."});return;}setSaving(true);setMsg(null);const isEdit=mode==="edit"&&editPost;try{const res=await fetch("/api/hw-admin/blogs",{method:isEdit?"PATCH":"POST",headers:{"Content-Type":"application/json","x-admin-password":password},body:JSON.stringify({slug,title,content,label,featuredImage:featImg||null})});const j=await res.json();if(res.ok){await load();setMode("list");setMsg({type:"ok",text:`✓ ${isEdit?"Updated":"Published"}: "${title}"`});}else setMsg({type:"err",text:j.error??"Save failed."});}catch{setMsg({type:"err",text:"Network error."});}setSaving(false);}
  async function handleDelete(p:Post){if(!confirm(`Delete "${p.title}"?`))return;setDeleting(p.slug);try{await fetch("/api/hw-admin/blogs",{method:"DELETE",headers:{"Content-Type":"application/json","x-admin-password":password},body:JSON.stringify({slug:p.slug})});load();}catch{}setDeleting(null);}
  async function handleTogglePost(p:Post){setMsg(null);try{const newVal=!(p as Post&{published?:boolean}).published;const res=await fetch("/api/hw-admin/blogs",{method:"PATCH",headers:{"Content-Type":"application/json","x-admin-password":password},body:JSON.stringify({slug:p.slug,published:newVal})});if(res.ok){setMsg({type:"ok",text:newVal?`✓ "${p.title}" is now LIVE`:`✓ "${p.title}" UNPUBLISHED`});setPosts(prev=>prev.map(x=>x.slug===p.slug?{...x,published:newVal}:x));}else setMsg({type:"err",text:"Toggle failed."});}catch{setMsg({type:"err",text:"Network error."});}}
  const wordCount=content.replace(/<[^>]*>/g," ").split(/\s+/).filter(Boolean).length;
  if(mode==="new"||mode==="edit")return<div style={{display:"flex",flexDirection:"column",gap:"16px"}}>
    <div style={{display:"flex",alignItems:"center",gap:"16px",marginBottom:"4px"}}><Btn onClick={()=>{setMode("list");setMsg(null);}} variant="ghost">← Back</Btn><h2 style={{color:C.textPri,fontSize:"1rem",fontWeight:400,margin:0}}>{mode==="edit"?`Editing: ${editPost?.title}`:"New Blog Post"}</h2></div>
    <Msg msg={msg}/>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"16px"}}>
      <Card style={{padding:"16px"}}><label style={lbl}>Title</label><input value={title} onChange={e=>{setTitle(e.target.value);if(mode==="new")setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,""));}} placeholder="Best Dark Wallpapers for iPhone 2026" style={inp}/></Card>
      <Card style={{padding:"16px"}}><label style={lbl}>URL Slug</label><input value={slug} onChange={e=>setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g,""))} disabled={mode==="edit"} placeholder="best-dark-wallpapers-iphone-2026" style={{...inp,opacity:mode==="edit"?0.5:1}}/></Card>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"16px"}}>
      <Card style={{padding:"16px"}}><label style={lbl}>Category Label</label><select value={label} onChange={e=>setLabel(e.target.value)} style={{...inp,appearance:"none"}}>{ALL_LABELS.map(l=><option key={l} value={l}>{l}</option>)}</select></Card>
      <Card style={{padding:"16px",borderColor:featImg?"rgba(201,168,76,0.4)":C.border,background:featImg?"rgba(201,168,76,0.04)":C.surface}}>
        <label style={{...lbl,marginBottom:"10px",color:C.gold}}>🖼 Featured Image (optional)</label>
        <p style={{color:C.textMut,fontSize:"0.65rem",marginBottom:"12px",lineHeight:1.6}}>Upload directly from your local machine → gets stored in R2 → public URL filled in automatically.</p>
        {blogImgMsg&&<Msg msg={blogImgMsg}/>}
        <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"10px",flexWrap:"wrap"}}>
          <input ref={blogImgInputRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>{const f=e.target.files?.[0];if(f){setBlogImgFile(f);handleBlogImageUpload(f);}}}/>
          <label onClick={()=>blogImgInputRef.current?.click()} style={{display:"inline-flex",alignItems:"center",gap:"8px",background:"transparent",border:`1px solid ${blogImgFile?C.gold:C.border}`,color:blogImgFile?C.gold:C.textSec,padding:"8px 16px",cursor:"pointer",fontSize:"0.7rem",fontFamily:"monospace",letterSpacing:"0.08em",flexShrink:0}}>
            {blogImgUploading?"⏳ Uploading…":blogImgFile?"✓ "+blogImgFile.name:"📁 Choose Image File"}
          </label>
          {featImg&&<a href={featImg} target="_blank" rel="noopener noreferrer" style={{color:C.gold,fontSize:"0.65rem",textDecoration:"none",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:"240px"}}>↗ {featImg}</a>}
        </div>
        <label style={{...lbl,marginBottom:"4px",color:C.textMut}}>Or paste URL manually</label>
        <input value={featImg} onChange={e=>setFeatImg(e.target.value)} placeholder="https://assets.hauntedwallpapers.com/blog/..." style={inp}/>
      </Card>
    </div>
    <Card style={{padding:"16px"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"8px",flexWrap:"wrap",gap:"8px"}}>
        <label style={{...lbl,marginBottom:0}}>Content (HTML) <span style={{color:wordCount>=800?C.green:wordCount>0?C.gold:C.textMut}}>({wordCount} words{wordCount>=800?" ✓":" — aim for 800+"})</span></label>
        <div style={{display:"flex",gap:"4px"}}>{(["html","preview"] as const).map(m=><button key={m} onClick={()=>setContentMode(m)} style={{background:contentMode===m?(m==="preview"?C.red:"#2a2535"):"transparent",border:`1px solid ${C.border}`,color:contentMode===m?C.white:C.textSec,padding:"3px 10px",cursor:"pointer",fontSize:"0.65rem",fontFamily:"monospace"}}>{m==="preview"?"👁 Preview":"HTML"}</button>)}</div>
      </div>
      <HtmlToolbar textareaId="blog-content-ta" value={content} onChange={setContent} password={password}/>
      {contentMode==="html"?<textarea id="blog-content-ta" value={content} onChange={e=>setContent(e.target.value)} placeholder={"<h2>Introduction</h2>\n<p>Your article content here…</p>"} rows={20} spellCheck={false} style={{...inp,resize:"vertical",lineHeight:"1.6",fontFamily:"monospace",fontSize:"0.8rem"}}/>:<div style={{minHeight:"400px",border:`1px solid ${C.border}`,padding:"24px",background:"#08060f",lineHeight:"1.9",color:C.textPri}} dangerouslySetInnerHTML={{__html:content||`<p style='color:${C.textMut}'>Nothing to preview yet…</p>`}}/>}
    </Card>
    <div style={{display:"flex",gap:"10px"}}>
      <Btn onClick={handleSave} disabled={saving}>{saving?"Saving…":"💾 Publish Post"}</Btn>
      <Btn onClick={()=>{setMode("list");setMsg(null);}} variant="ghost">Cancel</Btn>
      {mode==="edit"&&editPost&&<a href={`https://hauntedwallpapers.com/blog/${editPost.slug}`} target="_blank" rel="noopener noreferrer" style={{display:"inline-flex",alignItems:"center",padding:"10px 16px",border:`1px solid ${C.green}`,color:C.green,textDecoration:"none",fontSize:"0.7rem",fontFamily:"monospace"}}>👁 View Live →</a>}
    </div>
  </div>;
  return<div>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"24px"}}><div><p style={eyebrow}>Blog Posts</p><p style={{color:C.textSec,fontSize:"0.82rem"}}>{posts.length} posts published</p></div><Btn onClick={openNew}>+ New Post</Btn></div>
    <Msg msg={msg}/>
    {loading?<p style={{color:C.textSec}}>Loading posts…</p>:posts.length===0?<Card style={{textAlign:"center",padding:"48px"}}><p style={{color:C.textMut,marginBottom:"16px"}}>No posts yet.</p><Btn onClick={openNew}>Write Your First Post</Btn></Card>:<div style={{display:"flex",flexDirection:"column",gap:"8px"}}>{posts.map(p=><Card key={p.slug} style={{padding:"16px 18px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:"16px",flexWrap:"wrap",borderColor:p.published===false?"rgba(192,0,26,0.4)":C.border,background:p.published===false?"rgba(192,0,26,0.04)":C.surface}}><div style={{flex:1,minWidth:0}}><p style={{color:C.textPri,fontWeight:500,marginBottom:"4px",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{p.title}</p><div style={{display:"flex",gap:"12px",fontSize:"0.7rem",color:C.textMut,flexWrap:"wrap"}}><span style={{background:"rgba(124,58,237,0.2)",color:C.purple,padding:"1px 8px"}}>{p.label}</span><span>{new Date(p.createdAt).toLocaleDateString()}</span><span>/blog/{p.slug}</span>{p.published===false&&<span style={{background:"rgba(192,0,26,0.15)",color:C.red,padding:"1px 8px",fontSize:"0.6rem"}}>● HIDDEN</span>}</div></div><div style={{display:"flex",gap:"8px",flexShrink:0}}><Btn onClick={()=>handleTogglePost(p)} variant={p.published===false?"success":"danger"} style={{padding:"7px 14px",fontSize:"0.68rem"}}>{p.published===false?"⬆ Publish":"⬇ Unpublish"}</Btn><Btn onClick={()=>openEdit(p)} variant="ghost" style={{padding:"7px 14px",fontSize:"0.68rem"}}>✏️ Edit</Btn><Btn onClick={()=>handleDelete(p)} disabled={deleting===p.slug} variant="danger" style={{padding:"7px 14px",fontSize:"0.68rem"}}>{deleting===p.slug?"…":"Delete"}</Btn></div></Card>)}</div>}
  </div>;
}

// ── UPDATED: PublishedImagesTab with Most Downloads sort ──────────────────────

function ResidentTagPicker({selectedTags,onToggle,password}:{selectedTags:string[];onToggle:(tag:string)=>void;password:string}){
  const[residents,setResidents]=React.useState<{slug:string;name:string}[]>([]);
  React.useEffect(()=>{
    fetch("/api/hw-admin/residents",{headers:{"x-admin-password":password}})
      .then(r=>r.json()).then(d=>setResidents(d.residents??[])).catch(()=>{});
  },[password]);
  if(residents.length===0)return null;
  return(
    <div style={{marginTop:"12px",borderTop:"1px solid rgba(157,78,221,0.2)",paddingTop:"12px"}}>
      <p style={{fontFamily:"monospace",fontSize:"0.62rem",letterSpacing:"0.15em",textTransform:"uppercase",color:"#9d4edd",marginBottom:"8px"}}>👥 Assign to Resident</p>
      <div style={{display:"flex",flexWrap:"wrap",gap:"6px"}}>
        {residents.map(r=>{const tag=`resident:${r.slug}`;const active=selectedTags.includes(tag);return(
          <button key={r.slug} type="button" onClick={()=>onToggle(tag)} style={{background:active?"rgba(157,78,221,0.25)":"transparent",border:`1px solid ${active?"#9d4edd":"rgba(157,78,221,0.3)"}`,color:active?"#c77dff":"rgba(157,78,221,0.7)",padding:"5px 14px",cursor:"pointer",fontSize:"0.68rem",fontFamily:"monospace"}}>
            {active?"✓ ":""}{r.name}
          </button>
        );})}
      </div>
    </div>
  );
}

function PublishedImagesTab({password}:{password:string}){
  const[images,setImages]=useState<ImageRecord[]>([]);
  const[total,setTotal]=useState(0);
  const[pages,setPages]=useState(1);
  const[page,setPage]=useState(1);
  const[q,setQ]=useState("");
  const[loading,setLoading]=useState(true);
  const[editing,setEditing]=useState<ImageRecord|null>(null);
  const[saving,setSaving]=useState(false);
  const[deleting,setDeleting]=useState<string|null>(null);
  const[msg,setMsg]=useState<{type:"ok"|"err";text:string}|null>(null);
  const[eTitle,setETitle]=useState("");
  const[eDesc,setEDesc]=useState("");
  const[eAlt,setEAlt]=useState("");
  const[eMetaDesc,setEMetaDesc]=useState("");
  const[eTags,setETags]=useState<string[]>([]);
  const[eAdult,setEAdult]=useState(false);const[eAvatar,setEAvatar]=useState(false);
  const[eDevice,setEDevice]=useState("");
  const[aiLoading,setAiLoading]=useState(false);
  // UPDATED: expanded sort type to include downloads
  const[sortBy,setSortBy]=useState<"default"|"views-desc"|"views-asc"|"downloads-desc">("default");
  // NEW: download counts fetched from analytics
  const[downloadCounts,setDownloadCounts]=useState<Record<string,number>>({});
  const[loadingDownloads,setLoadingDownloads]=useState(false);
  const r2Base=process.env.NEXT_PUBLIC_R2_PUBLIC_URL??"";

  const load=useCallback(async(p=page,search=q)=>{setLoading(true);try{const res=await fetch(`/api/hw-admin/images?page=${p}&q=${encodeURIComponent(search)}`,{headers:{"x-admin-password":password}});if(!res.ok)throw new Error("Failed");const data=await res.json();setImages(data.images??[]);setTotal(data.total??0);setPages(data.pages??1);}catch{setMsg({type:"err",text:"Could not load images."});}setLoading(false);},[password,page,q]);

  useEffect(()=>{load();},[load]);

  // NEW: fetch download counts from analytics when downloads sort is selected
  useEffect(()=>{
    if(sortBy!=="downloads-desc")return;
    setLoadingDownloads(true);
    fetch("/api/hw-admin/analytics",{headers:{"x-admin-password":password}})
      .then(r=>r.json())
      .then(data=>{
        const map:Record<string,number>={};
        (data.topWallpapers??[]).forEach((w:{slug:string;downloads:number})=>{
          map[w.slug]=w.downloads;
        });
        setDownloadCounts(map);
      })
      .catch(()=>{})
      .finally(()=>setLoadingDownloads(false));
  },[sortBy,password]);

  function openEdit(img:ImageRecord){setEditing(img);setETitle(img.title);setEDesc(img.description??"");setEAlt(img.altText??"");setEMetaDesc(img.metaDescription??"");setETags(img.tags.filter(t=>t!=="16plus"));setEAdult(img.isAdult);setEAvatar(img.isAvatar??false);setEDevice(img.deviceType??"");setMsg(null);}
  async function handleAiRegenerate(){if(!editing)return;setAiLoading(true);try{const imgUrl=thumbUrl(editing.r2Key);const{data,mediaType}=await urlToBase64(imgUrl);const result=await analyzeImageWithClaude(data,mediaType,password);if(result.title)setETitle(result.title);if(result.description)setEDesc(result.description);if(result.altText)setEAlt(result.altText);if(result.metaDescription)setEMetaDesc(result.metaDescription);if(result.tags?.length)setETags(result.tags.filter(t=>ALL_TAGS.includes(t)));setMsg({type:"ok",text:"✓ AI regenerated title, description, alt text, meta description & tags!"});}catch(err){setMsg({type:"err",text:`⚠ AI failed: ${(err as Error).message}`});}setAiLoading(false);}
  async function handleSave(){if(!editing)return;setSaving(true);const tags=eAdult?[...eTags,"16plus"]:eTags;try{const res=await fetch(`/api/hw-admin/images/${editing.id}`,{method:"PATCH",headers:{"Content-Type":"application/json","x-admin-password":password},body:JSON.stringify({title:eTitle,description:eDesc,altText:eAlt,metaDescription:eMetaDesc||null,tags,isAdult:eAdult,isAvatar:eAvatar,deviceType:eDevice||null})});const json=await res.json().catch(()=>({}));if(!res.ok){setMsg({type:"err",text:json.error??`Save failed (${res.status})`});setSaving(false);return;}setMsg({type:"ok",text:`✓ Saved "${eTitle}"`});setEditing(null);load(page,q);}catch(err){setMsg({type:"err",text:`Network error: ${(err as Error).message}`});}setSaving(false);}
  async function handleDelete(img:ImageRecord){if(!confirm(`Delete "${img.title}"?\n\nThis removes from R2 and database permanently.`))return;setDeleting(img.id);try{const res=await fetch(`/api/hw-admin/images/${img.id}`,{method:"DELETE",headers:{"x-admin-password":password}});if(!res.ok)throw new Error("Delete failed");setMsg({type:"ok",text:`✓ Deleted "${img.title}"`});load(page,q);}catch{setMsg({type:"err",text:"Delete failed."});}setDeleting(null);}
  const thumbUrl=(key:string)=>r2Base?`${r2Base}/${key}`:`/api/r2-proxy/${key}`;
  const altOk=eAlt.length>=130&&eAlt.length<=150;

  return<div>
    <Card style={{padding:"14px 18px",marginBottom:"20px",borderColor:C.red}}><strong style={{color:C.gold}}>📸 Published Images</strong><span style={{color:C.textSec,marginLeft:"8px",fontSize:"0.82rem"}}>View, edit, or delete. Delete removes from R2 CDN + database permanently.</span></Card>
    <Msg msg={msg}/>
    <div style={{display:"flex",gap:"12px",marginBottom:"20px",flexWrap:"wrap",alignItems:"center"}}>
      <input value={q} onChange={e=>{setQ(e.target.value);setPage(1);}} onKeyDown={e=>e.key==="Enter"&&load(1,q)} placeholder="Search by title or slug…" style={{...inp,maxWidth:"320px",flex:1}}/>
      <Btn onClick={()=>load(1,q)}>Search</Btn>
      {/* UPDATED: expanded sort dropdown with downloads option */}
      <select value={sortBy} onChange={e=>setSortBy(e.target.value as "default"|"views-desc"|"views-asc"|"downloads-desc")} style={{...inp,width:"auto",padding:"10px 12px",cursor:"pointer",color:sortBy!=="default"?C.gold:C.textSec,border:`1px solid ${sortBy!=="default"?"rgba(201,168,76,0.6)":C.border}`}}>
        <option value="default">Sort: Default</option>
        <option value="views-desc">👁 Most Views First</option>
        <option value="views-asc">👁 Least Views First</option>
        <option value="downloads-desc">⬇ Most Downloads First</option>
      </select>
      {loadingDownloads&&<span style={{color:C.textMut,fontSize:"0.7rem",fontFamily:"monospace"}}>Loading download data…</span>}
      <span style={{color:C.textMut,fontSize:"0.72rem",marginLeft:"auto",alignSelf:"center"}}>{total} images total</span>
    </div>

    {/* Download sort info banner */}
    {sortBy==="downloads-desc"&&!loadingDownloads&&<Card style={{padding:"10px 14px",marginBottom:"16px",borderColor:"rgba(192,0,26,0.3)",background:"rgba(192,0,26,0.06)"}}>
      <p style={{color:C.textSec,fontSize:"0.7rem"}}>⬇ Showing your heroes — sorted by all-time downloads. Wallpapers with <span style={{color:C.red}}>0</span> may not appear in analytics yet or have no downloads recorded.</p>
    </Card>}

    {editing&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",zIndex:1000,display:"flex",alignItems:"flex-start",justifyContent:"center",padding:"40px 16px",overflowY:"auto"}}><div style={{background:C.surface,border:`1px solid ${C.border}`,width:"100%",maxWidth:"720px",padding:"28px",fontFamily:"monospace"}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:"20px"}}><p style={{...eyebrow,marginBottom:0}}>✏️ Edit Image</p><button onClick={()=>setEditing(null)} style={{background:"none",border:"none",cursor:"pointer",color:C.textSec,fontSize:"1.4rem"}}>×</button></div>
      <div style={{display:"flex",gap:"16px",marginBottom:"20px",alignItems:"flex-start"}}>
        <img src={thumbUrl(editing.r2Key)} alt={editing.title} style={{width:"80px",height:"120px",objectFit:"cover",border:`1px solid ${C.border}`,flexShrink:0}} onError={e=>{(e.target as HTMLImageElement).style.display="none";}}/>
        <div style={{flex:1}}>
          <p style={lbl}>Slug (read-only)</p>
          <p style={{color:C.purple,fontSize:"0.8rem",marginBottom:"12px"}}>{editing.slug}</p>
          <div style={{background:"rgba(192,0,26,0.06)",border:`1px solid rgba(192,0,26,0.25)`,padding:"12px 16px"}}>
            <p style={{color:C.gold,fontSize:"0.72rem",marginBottom:"4px"}}>✨ AI Auto-Fill (GLM Vision)</p>
            <p style={{color:C.textSec,fontSize:"0.65rem",marginBottom:"10px"}}>Regenerates title, 200-word description, SEO alt text, meta description & tags from the image.</p>
            <Btn onClick={handleAiRegenerate} disabled={aiLoading} style={{fontSize:"0.68rem",padding:"8px 16px"}}>{aiLoading?"✨ Analysing…":"✨ Regenerate All with AI"}</Btn>
          </div>
        </div>
      </div>
      <div style={{marginBottom:"14px"}}><label style={lbl}>Title</label><input value={eTitle} onChange={e=>setETitle(e.target.value)} style={inp}/></div>
      <div style={{marginBottom:"14px"}}><label style={lbl}>Device Type</label><div style={{display:"flex",gap:"8px"}}>{["","IPHONE","ANDROID","PC"].map(d=><button key={d} onClick={()=>setEDevice(d)} style={{background:eDevice===d?C.red:"transparent",border:`1px solid ${eDevice===d?C.red:C.border}`,color:eDevice===d?C.white:C.textSec,padding:"5px 14px",cursor:"pointer",fontSize:"0.7rem",fontFamily:"monospace"}}>{d||"Any"}</button>)}</div></div>
      <div style={{marginBottom:"14px"}}>
        <label style={lbl}>Alt Text (SEO) <span style={{color:altOk?C.green:eAlt.length>0?C.gold:C.textMut}}>({eAlt.length}/150{altOk?" ✓":" — aim for 130–150"})</span></label>
        <input value={eAlt} onChange={e=>setEAlt(e.target.value)} placeholder="Dark gothic forest wallpaper with moonlit trees — free HD download" style={inp}/>
      </div>
      <div style={{marginBottom:"14px"}}>
        <label style={lbl}>Meta Description (Google snippet) <span style={{color:eMetaDesc.length>155?C.red:eMetaDesc.length>=130?C.green:C.textMut}}>({eMetaDesc.length}/155{eMetaDesc.length>=130&&eMetaDesc.length<=155?" ✓":""})</span></label>
        <input value={eMetaDesc} onChange={e=>setEMetaDesc(e.target.value)} placeholder="130–155 chars · keyword-rich · what Google shows in search results" style={{...inp,borderColor:eMetaDesc.length>155?C.red:eMetaDesc.length>=130&&eMetaDesc.length<=155?C.green:C.border}}/>
        <p style={{color:C.textMut,fontSize:"0.62rem",marginTop:"4px"}}>Leave blank to auto-generate from description.</p>
      </div>
      <div style={{marginBottom:"14px"}}><label style={lbl}>Description (HTML)</label><textarea value={eDesc} onChange={e=>setEDesc(e.target.value)} rows={6} style={{...inp,resize:"vertical",lineHeight:"1.6",fontSize:"0.82rem"}}/></div>
      <div style={{marginBottom:"14px"}}><label style={lbl}>SEO Tags ({eTags.length})</label>
        <div style={{display:"flex",gap:"8px",marginBottom:"8px"}}><input placeholder="Paste tags by commas: dark, gothic, horror…" style={{...inp,flex:1,fontSize:"0.72rem",borderColor:"rgba(201,168,76,0.4)"}} onKeyDown={e=>{if(e.key==="Enter"){const raw=(e.target as HTMLInputElement).value;const parsed=raw.split(",").map(t=>t.trim().toLowerCase().replace(/\s+/g,"-")).filter(Boolean);setETags(prev=>[...new Set([...prev,...parsed])]);(e.target as HTMLInputElement).value="";e.preventDefault();}}} onPaste={e=>{setTimeout(()=>{const raw=(e.target as HTMLInputElement).value;const parsed=raw.split(",").map(t=>t.trim().toLowerCase().replace(/\s+/g,"-")).filter(Boolean);if(parsed.length>1){setETags(prev=>[...new Set([...prev,...parsed])]);(e.target as HTMLInputElement).value="";}},50);}}/><Btn onClick={()=>setETags([])} variant="ghost" style={{fontSize:"0.65rem",padding:"6px 10px",flexShrink:0}}>Clear</Btn></div>
        <div style={{display:"flex",flexWrap:"wrap",gap:"6px"}}>{ALL_TAGS.map(tag=><button key={tag} onClick={()=>setETags(prev=>prev.includes(tag)?prev.filter(t=>t!==tag):[...prev,tag])} style={{background:eTags.includes(tag)?C.red:"transparent",border:`1px solid ${eTags.includes(tag)?C.red:C.border}`,color:eTags.includes(tag)?C.white:C.textSec,padding:"4px 12px",cursor:"pointer",fontSize:"0.65rem",fontFamily:"monospace"}}>{eTags.includes(tag)?"✓ ":""}{tag}</button>)}</div><ResidentTagPicker selectedTags={eTags} onToggle={(tag)=>setETags(prev=>prev.includes(tag)?prev.filter(t=>t!==tag):[...prev,tag])} password={password}/></div>
      <div style={{marginBottom:"16px"}}>
        <label style={lbl}>FOMO Badges</label>
        <div style={{display:"flex",flexWrap:"wrap",gap:"8px",marginTop:"4px"}}>
          {BADGE_TAGS.map(({tag,label,color,bg})=>{
            const active=eTags.includes(tag);
            return<button key={tag} type="button" onClick={()=>setETags(prev=>active?prev.filter(t=>t!==tag):[...prev,tag])} style={{background:active?bg:"transparent",border:`1px solid ${active?color:C.border}`,color:active?color:C.textMut,padding:"5px 12px",cursor:"pointer",fontSize:"0.68rem",fontFamily:"monospace",transition:"all 0.15s"}}>{label}</button>;
          })}
        </div>
      </div>
      <div style={{marginBottom:"20px",display:"flex",alignItems:"center",gap:"12px"}}><Btn onClick={()=>setEAdult(a=>!a)} variant={eAdult?"danger":"ghost"} style={{padding:"6px 16px"}}>{eAdult?"⚠ 16+ ON":"16+ OFF"}</Btn><span style={{color:C.textSec,fontSize:"0.7rem"}}>Mark as adult/mature</span></div>
      <div style={{marginBottom:"20px",display:"flex",alignItems:"center",gap:"12px"}}><Btn onClick={()=>setEAvatar(a=>!a)} variant={eAvatar?"success":"ghost"} style={{padding:"6px 16px",borderColor:eAvatar?"#63b3ed":undefined,color:eAvatar?"#63b3ed":undefined}}>{eAvatar?"🎭 Avatar ON":"Avatar OFF"}</Btn><span style={{color:C.textSec,fontSize:"0.7rem"}}>Show on /avatars Discord pfp page</span></div>
      <div style={{marginBottom:"20px",display:"flex",alignItems:"center",gap:"12px",flexWrap:"wrap"}}>
        <Btn onClick={()=>setETags(prev=>prev.includes("lock-screen-wallpaper")?prev.filter(t=>t!=="lock-screen-wallpaper"):[...prev,"lock-screen-wallpaper"])} variant={eTags.includes("lock-screen-wallpaper")?"success":"ghost"} style={{padding:"6px 16px",borderColor:eTags.includes("lock-screen-wallpaper")?"#c9a84c":undefined,color:eTags.includes("lock-screen-wallpaper")?"#c9a84c":undefined}}>{eTags.includes("lock-screen-wallpaper")?"🔒 Lock Screen ON":"Lock Screen OFF"}</Btn>
        <Btn onClick={()=>setETags(prev=>prev.includes("home-screen-wallpaper")?prev.filter(t=>t!=="home-screen-wallpaper"):[...prev,"home-screen-wallpaper"])} variant={eTags.includes("home-screen-wallpaper")?"success":"ghost"} style={{padding:"6px 16px",borderColor:eTags.includes("home-screen-wallpaper")?"#c9a84c":undefined,color:eTags.includes("home-screen-wallpaper")?"#c9a84c":undefined}}>{eTags.includes("home-screen-wallpaper")?"🏠 Home Screen ON":"Home Screen OFF"}</Btn>
        <span style={{color:C.textSec,fontSize:"0.7rem"}}>Show on the dedicated lock/home screen pages</span>
      </div>
      <Msg msg={msg}/>
      <div style={{display:"flex",gap:"10px"}}><Btn onClick={handleSave} disabled={saving}>{saving?"Saving…":"💾 Save"}</Btn><Btn onClick={()=>setEditing(null)} variant="ghost">Cancel</Btn></div>
    </div></div>}

    {loading?<p style={{color:C.textSec,textAlign:"center",padding:"40px"}}>Loading images…</p>:images.length===0?<p style={{color:C.textSec}}>No images found.</p>:
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:"14px",marginBottom:"32px"}}>
      {/* UPDATED: sort logic includes downloads-desc */}
      {[...images].sort((a,b)=>
        sortBy==="views-desc"?b.viewCount-a.viewCount:
        sortBy==="views-asc"?a.viewCount-b.viewCount:
        sortBy==="downloads-desc"?(downloadCounts[b.slug]??0)-(downloadCounts[a.slug]??0):
        0
      ).map((img,rank)=><div key={img.id} style={{border:`1px solid ${C.border}`,background:C.surface}}>
        <div style={{position:"relative",aspectRatio:"9/16",background:"#0d0b14",overflow:"hidden"}}>
          <img src={thumbUrl(img.r2Key)} alt={img.title} style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}} onError={e=>{(e.target as HTMLImageElement).style.display="none";}}/>
          {img.isAdult&&<span style={{position:"absolute",top:"6px",left:"6px",background:C.red,color:"#fff",fontSize:"0.55rem",fontFamily:"monospace",fontWeight:900,padding:"2px 6px"}}>16+</span>}{img.isAvatar&&<span style={{position:"absolute",top:"6px",right:"6px",background:"rgba(99,179,237,0.9)",color:"#fff",fontSize:"0.5rem",fontFamily:"monospace",fontWeight:900,padding:"2px 6px"}}>🎭 PFP</span>}{img.matchingGroupId&&<span style={{position:"absolute",bottom:"6px",right:"6px",background:"rgba(236,72,153,0.92)",color:"#fff",fontSize:"0.5rem",fontFamily:"monospace",fontWeight:900,padding:"2px 6px"}}>💞 {img.matchingLabel||"Pair"}</span>}
          {/* NEW: rank badge when sorted by downloads */}
          {sortBy==="downloads-desc"&&(downloadCounts[img.slug]??0)>0&&<span style={{position:"absolute",top:"6px",left:"6px",background:"rgba(192,0,26,0.9)",color:"#fff",fontSize:"0.55rem",fontFamily:"monospace",fontWeight:900,padding:"2px 6px"}}>#{rank+1}</span>}
          {BADGE_TAGS.filter(b=>img.tags.includes(b.tag)).slice(0,2).map(b=><span key={b.tag} style={{position:"absolute",bottom:"6px",left:"6px",background:b.bg,border:`1px solid ${b.color}`,color:b.color,fontSize:"0.5rem",fontFamily:"monospace",padding:"2px 5px",marginBottom:`${BADGE_TAGS.filter(bx=>img.tags.includes(bx.tag)).indexOf(b)*18}px`}}>{b.label}</span>)}
          {img.deviceType&&<span style={{position:"absolute",top:"6px",right:"6px",background:"rgba(0,0,0,0.7)",color:C.gold,fontSize:"0.55rem",fontFamily:"monospace",padding:"2px 6px"}}>{img.deviceType}</span>}
          {!img.altText&&<span style={{position:"absolute",bottom:"6px",left:"6px",background:"rgba(192,0,26,0.85)",color:"#fff",fontSize:"0.5rem",fontFamily:"monospace",padding:"2px 5px"}}>no alt</span>}
        </div>
        <div style={{padding:"10px"}}>
          <p style={{color:C.textPri,fontSize:"0.72rem",fontWeight:600,marginBottom:"4px",lineHeight:1.3,wordBreak:"break-word"}}>{img.title}</p>
          {/* UPDATED: show download count badge when in downloads sort mode */}
          <p style={{color:C.textMut,fontSize:"0.58rem",marginBottom:"6px"}}>
            👁 {img.viewCount}
            {sortBy==="downloads-desc"&&<span style={{color:(downloadCounts[img.slug]??0)>0?C.red:C.textMut,marginLeft:"8px",fontWeight:(downloadCounts[img.slug]??0)>0?700:400}}>⬇ {downloadCounts[img.slug]??0}</span>}
          </p>
          <div style={{display:"flex",gap:"6px"}}>
            <button onClick={()=>openEdit(img)} style={{flex:1,background:"rgba(124,58,237,0.1)",border:`1px solid ${C.border}`,color:C.textSec,padding:"6px",cursor:"pointer",fontSize:"0.62rem",fontFamily:"monospace"}}>✏️ Edit</button>
            <button onClick={()=>handleDelete(img)} disabled={deleting===img.id} style={{flex:1,background:"rgba(192,0,26,0.08)",border:"1px solid rgba(192,0,26,0.4)",color:C.red,padding:"6px",cursor:deleting===img.id?"not-allowed":"pointer",fontSize:"0.62rem",fontFamily:"monospace"}}>{deleting===img.id?"…":"🗑 Del"}</button>
          </div>
        </div>
      </div>)}
    </div>}

    {pages>1&&<div style={{display:"flex",gap:"8px",alignItems:"center",justifyContent:"center"}}><Btn onClick={()=>{const p=Math.max(1,page-1);setPage(p);load(p,q);}} disabled={page<=1} variant="ghost">← Prev</Btn><span style={{color:C.textSec,fontSize:"0.75rem"}}>Page {page} / {pages}</span><Btn onClick={()=>{const p=Math.min(pages,page+1);setPage(p);load(p,q);}} disabled={page>=pages} variant="ghost">Next →</Btn></div>}
  </div>;
}

function Manage18Tab({password}:{password:string}){
  const[results,setResults]=useState<Record<string,{status:string;msg:string}>>({});const[loadingMap,setLoadingMap]=useState<Record<string,boolean>>({});const[allDone,setAllDone]=useState(false);const[titleInput,setTitleInput]=useState("");const[manualResult,setManualResult]=useState<{status:string;msg:string}|null>(null);const[manualLoading,setManualLoading]=useState(false);
  async function markAdult(title:string){setLoadingMap(prev=>({...prev,[title]:true}));try{const res=await fetch("/api/hw-admin/mark-adult",{method:"POST",headers:{"Content-Type":"application/json","x-admin-password":password},body:JSON.stringify({title})});const json=await res.json();setResults(prev=>({...prev,[title]:res.ok?{status:"ok",msg:`✓ Marked 16+ (${json.updated} updated)`}:{status:"err",msg:json.error??"Failed"}}));}catch{setResults(prev=>({...prev,[title]:{status:"err",msg:"Network error"}}));}setLoadingMap(prev=>({...prev,[title]:false}));}
  async function markAll(){setAllDone(false);for(const item of ADULT_IMAGES_TO_MARK){await markAdult(item.title);await new Promise(r=>setTimeout(r,300));}setAllDone(true);}
  async function handleManual(){if(!titleInput.trim())return;setManualLoading(true);setManualResult(null);try{const res=await fetch("/api/hw-admin/mark-adult",{method:"POST",headers:{"Content-Type":"application/json","x-admin-password":password},body:JSON.stringify({title:titleInput.trim()})});const json=await res.json();setManualResult(res.ok?{status:"ok",msg:`✓ Marked 16+ (${json.updated} updated)`}:{status:"err",msg:json.error??"Failed"});}catch{setManualResult({status:"err",msg:"Network error"});}setManualLoading(false);}
  const doneCount=Object.values(results).filter(r=>r.status==="ok").length;
  return<div>
    <Card style={{padding:"14px 18px",marginBottom:"24px",borderColor:"rgba(192,0,26,0.5)",background:"rgba(192,0,26,0.06)"}}><p style={{color:C.gold,fontSize:"0.78rem",marginBottom:"4px"}}>⚠ 16+ Content Manager</p><p style={{color:C.textSec,fontSize:"0.72rem"}}>Mark images as 16+ mature themes. Searches by title (partial match).</p></Card>
    <div style={{display:"flex",gap:"12px",marginBottom:"20px",flexWrap:"wrap",alignItems:"center"}}><Btn onClick={markAll} variant="danger">⚠ Mark All as 16+</Btn>{doneCount>0&&<span style={{color:C.green,fontSize:"0.75rem"}}>✓ {doneCount} / {ADULT_IMAGES_TO_MARK.length} done{allDone?" — All done!":""}</span>}</div>
    <div style={{display:"flex",flexDirection:"column",gap:"8px",marginBottom:"32px"}}>{ADULT_IMAGES_TO_MARK.map(item=>{const res=results[item.title];const isLoading=loadingMap[item.title];return<Card key={item.title} style={{padding:"14px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",gap:"16px",flexWrap:"wrap",borderColor:res?.status==="ok"?C.green:res?.status==="err"?C.red:C.border}}><div><p style={{color:C.textPri,marginBottom:"4px"}}>{item.title}</p><div style={{display:"flex",gap:"8px",alignItems:"center"}}><span style={{background:"rgba(124,58,237,0.2)",color:C.purple,padding:"2px 8px",fontSize:"0.62rem",fontFamily:"monospace"}}>{item.device}</span><AdultBadge/>{res&&<span style={{color:res.status==="ok"?C.green:"#ff8080",fontSize:"0.72rem"}}>{res.msg}</span>}</div></div><Btn onClick={()=>markAdult(item.title)} disabled={isLoading||res?.status==="ok"} variant={res?.status==="ok"?"success":"ghost"} style={{fontSize:"0.68rem"}}>{res?.status==="ok"?"✓ Done":isLoading?"Updating…":"Mark 16+"}</Btn></Card>;})}
    </div>
    <Card style={{padding:"20px"}}><p style={eyebrow}>Mark Any Image by Title</p><div style={{display:"flex",gap:"8px",flexWrap:"wrap",alignItems:"flex-end"}}><div style={{flex:1,minWidth:"200px"}}><label style={lbl}>Search by title (partial match)</label><input value={titleInput} onChange={e=>setTitleInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleManual()} placeholder="e.g. Skull King" style={inp}/></div><Btn onClick={handleManual} disabled={manualLoading}>{manualLoading?"Updating…":"Mark 16+"}</Btn>{manualResult&&<span style={{color:manualResult.status==="ok"?C.green:"#ff8080",fontSize:"0.78rem"}}>{manualResult.msg}</span>}</div></Card>
  </div>;
}

function BackdateTab({password}:{password:string}){
  const[posts,setPosts]=useState<Post[]>([]);const[loading,setLoading]=useState(true);const[saving,setSaving]=useState(false);const[message,setMessage]=useState<{type:"ok"|"err";text:string}|null>(null);const[dates,setDates]=useState<Record<string,string>>({});const[thumbEditing,setThumbEditing]=useState<string|null>(null);const[thumbUrl,setThumbUrl]=useState("");const[thumbSaving,setThumbSaving]=useState(false);
  function suggestDates(slugList:string[]){const start=new Date("2026-03-10T10:00:00Z"),end=new Date("2026-03-26T18:00:00Z");const range=end.getTime()-start.getTime();const step=slugList.length>1?range/(slugList.length-1):0;const map:Record<string,string>={};slugList.forEach((slug,i)=>{const d=new Date(start.getTime()+step*i);map[slug]=d.toISOString().slice(0,16);});return map;}
  useEffect(()=>{async function load(){setLoading(true);try{const res=await fetch("/api/hw-admin/blogs",{headers:{"x-admin-password":password}});if(res.ok){const j=await res.json();const postList:Post[]=j.posts??[];setPosts(postList);setDates(suggestDates(postList.map(p=>p.slug)));}}catch{}setLoading(false);}load();},[password]);
  async function handleSaveThumb(slug:string){setThumbSaving(true);try{const res=await fetch("/api/hw-admin/blogs",{method:"PATCH",headers:{"Content-Type":"application/json","x-admin-password":password},body:JSON.stringify({slug,featuredImage:thumbUrl.trim()||null})});if(res.ok){setPosts(prev=>prev.map(p=>p.slug===slug?{...p,featuredImage:thumbUrl.trim()||null}:p));setMessage({type:"ok",text:`✓ Thumbnail saved for "${slug}"`});setThumbEditing(null);setThumbUrl("");}else{const j=await res.json();setMessage({type:"err",text:j.error??"Failed."});}}catch{setMessage({type:"err",text:"Network error."});}setThumbSaving(false);}
  async function handleApplyAll(){setSaving(true);setMessage(null);const updates=posts.map(p=>({slug:p.slug,createdAt:new Date(dates[p.slug]??p.createdAt).toISOString()}));try{const res=await fetch("/api/hw-admin/blogs",{method:"PATCH",headers:{"Content-Type":"application/json","x-admin-password":password},body:JSON.stringify({updates})});const json=await res.json();if(res.ok||res.status===207){const failed=(json.results??[]).filter((r:{ok:boolean})=>!r.ok);setMessage(failed.length===0?{type:"ok",text:`✓ All ${updates.length} posts backdated!`}:{type:"err",text:`⚠ ${failed.length} failed.`});}else setMessage({type:"err",text:json.error??"Failed."});}catch{setMessage({type:"err",text:"Network error."});}setSaving(false);}
  if(loading)return<p style={{color:C.textSec}}>Loading posts…</p>;
  return<div>
    <Card style={{padding:"14px 18px",marginBottom:"24px",borderColor:"rgba(192,0,26,0.4)",background:"rgba(192,0,26,0.06)"}}><p style={{color:C.gold,fontSize:"0.78rem",marginBottom:"4px"}}>📅 Backdate Blog Posts</p><p style={{color:C.textSec,fontSize:"0.72rem",lineHeight:1.6}}>Spread posts over the last few weeks. Pre-filled: <strong style={{color:C.textPri}}>March 10 → March 26</strong>.</p></Card>
    {posts.length===0?<p style={{color:C.textSec}}>No blog posts found.</p>:<><div style={{display:"flex",gap:"12px",marginBottom:"20px",flexWrap:"wrap"}}><Btn onClick={handleApplyAll} disabled={saving}>{saving?"Saving…":`📅 Apply All ${posts.length} Dates`}</Btn><Btn onClick={()=>setDates(suggestDates(posts.map(p=>p.slug)))} variant="ghost">↺ Reset</Btn></div><Msg msg={message}/><div style={{display:"flex",flexDirection:"column",gap:"8px"}}>{posts.map((p,i)=><Card key={p.slug} style={{padding:"14px 16px"}}><div style={{display:"flex",alignItems:"center",gap:"16px",flexWrap:"wrap"}}><span style={{color:C.textMut,fontSize:"0.65rem",minWidth:"20px"}}>#{i+1}</span><div style={{flex:1,minWidth:0}}><p style={{color:C.textPri,fontSize:"0.85rem",marginBottom:"2px",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{p.title}</p><code style={{color:C.textMut,fontSize:"0.65rem"}}>/blog/{p.slug}</code></div><input type="datetime-local" value={dates[p.slug]??""} onChange={e=>setDates(prev=>({...prev,[p.slug]:e.target.value}))} style={{...inp,maxWidth:"200px",fontSize:"0.75rem",color:C.gold}}/><button onClick={()=>{setThumbEditing(thumbEditing===p.slug?null:p.slug);setThumbUrl(p.featuredImage??"");}} style={{background:"transparent",border:`1px solid ${C.border}`,color:C.textMut,padding:"6px 12px",cursor:"pointer",fontSize:"0.65rem",fontFamily:"monospace"}}>🖼️ Thumb</button></div>{thumbEditing===p.slug&&<div style={{marginTop:"12px",display:"flex",gap:"8px",alignItems:"center",flexWrap:"wrap"}}><input value={thumbUrl} onChange={e=>setThumbUrl(e.target.value)} placeholder="https://..." style={{...inp,flex:1,fontSize:"0.75rem"}}/><Btn onClick={()=>handleSaveThumb(p.slug)} disabled={thumbSaving} style={{fontSize:"0.68rem",padding:"8px 14px"}}>{thumbSaving?"…":"Save"}</Btn></div>}</Card>)}</div></>}
  </div>;
}

function LivePreviewTab(){
  const[activeUrl,setActiveUrl]=useState("/blog");const[customUrl,setCustomUrl]=useState("");const iframeRef=useRef<HTMLIFrameElement>(null);
  const QUICK_LINKS=[{label:"Home",url:"/"},{label:"Blog",url:"/blog"},{label:"iPhone",url:"/iphone"},{label:"Android",url:"/android"},{label:"PC",url:"/pc"},{label:"Collections",url:"/collections"},{label:"About",url:"/about"},{label:"FAQ",url:"/faq"},{label:"Contact",url:"/contact"},{label:"Tools",url:"/tools"}];
  function navigate(url:string){const full=url.startsWith("http")?url:`https://hauntedwallpapers.com${url}`;setActiveUrl(url);if(iframeRef.current)iframeRef.current.src=full;}
  return<div>
    <Card style={{padding:"14px 18px",marginBottom:"16px",borderColor:C.red}}><strong style={{color:C.gold}}>🌐 Live Site Preview</strong><span style={{color:C.textSec,marginLeft:"8px",fontSize:"0.82rem"}}>Browse your live site in-panel.</span></Card>
    <div style={{display:"flex",flexWrap:"wrap",gap:"6px",marginBottom:"12px"}}>{QUICK_LINKS.map(({label,url})=><button key={url} onClick={()=>navigate(url)} style={{background:activeUrl===url?C.red:"transparent",border:`1px solid ${activeUrl===url?C.red:C.border}`,color:activeUrl===url?C.white:C.textSec,padding:"5px 12px",cursor:"pointer",fontSize:"0.68rem",fontFamily:"monospace"}}>{label}</button>)}</div>
    <div style={{display:"flex",gap:"8px",marginBottom:"14px"}}><input value={customUrl} onChange={e=>setCustomUrl(e.target.value)} onKeyDown={e=>e.key==="Enter"&&navigate(customUrl)} placeholder="/blog/your-slug or full URL" style={{...inp,flex:1}}/><Btn onClick={()=>navigate(customUrl||"/blog")}>Go →</Btn><a href={`https://hauntedwallpapers.com${activeUrl.startsWith("/")?activeUrl:"/"+activeUrl}`} target="_blank" rel="noopener noreferrer" style={{display:"flex",alignItems:"center",background:"transparent",border:`1px solid ${C.border}`,color:C.textSec,padding:"10px 14px",textDecoration:"none",fontSize:"0.7rem",fontFamily:"monospace"}}>↗</a></div>
    <div style={{border:`1px solid ${C.border}`,overflow:"hidden"}}><iframe ref={iframeRef} src="https://hauntedwallpapers.com/blog" style={{width:"100%",height:"720px",border:"none",display:"block"}} title="Live site preview"/></div>
    <p style={{color:C.textMut,fontSize:"0.65rem",marginTop:"8px"}}>⚠ Some pages may block iframe embedding. Use ↗ to open in a new tab.</p>
  </div>;
}

interface CollectionRecord{id:string;slug:string;title:string;category:string;description:string;metaDescription:string|null;thumbnail:string|null;isPublished:boolean;rootSlug:boolean;_count:{images:number};}

function CollectionsTab({password}:{password:string}){
  const[collections,setCollections]=useState<CollectionRecord[]>([]);
  const[loading,setLoading]=useState(true);
  const[selected,setSelected]=useState<CollectionRecord|null>(null);
  const[desc,setDesc]=useState("");
  const[metaDesc,setMetaDesc]=useState("");
  const[editTitle,setEditTitle]=useState("");
  const[editSlug,setEditSlug]=useState("");
  const[descMode,setDescMode]=useState<"html"|"preview">("html");
  const[saving,setSaving]=useState(false);
  const[msg,setMsg]=useState<{type:"ok"|"err";text:string}|null>(null);
  const[search,setSearch]=useState("");
  const[showCreate,setShowCreate]=useState(false);
  const[createTitle,setCreateTitle]=useState("");
  const[createSlug,setCreateSlug]=useState("");
  const[createCategory,setCreateCategory]=useState("General");
  const[createIcon,setCreateIcon]=useState("🖤");
  const[createTag,setCreateTag]=useState("Collection");
  const[createFeatured,setCreateFeatured]=useState(false);
  const[createRootSlug,setCreateRootSlug]=useState(false);
  const[createMsg,setCreateMsg]=useState<{type:"ok"|"err";text:string}|null>(null);
  const[creating,setCreating]=useState(false);
  const[editRootSlug,setEditRootSlug]=useState(false);
  const[deleting,setDeleting]=useState(false);
  const[thumbFile,setThumbFile]=useState<File|null>(null);
  const[thumbPreview,setThumbPreview]=useState("");
  const[thumbDragging,setThumbDragging]=useState(false);
  const[thumbUploading,setThumbUploading]=useState(false);
  const[thumbMsg,setThumbMsg]=useState<{type:"ok"|"err";text:string}|null>(null);
  const thumbInputRef=useRef<HTMLInputElement>(null);
  const r2Base=typeof process!=="undefined"?(process.env.NEXT_PUBLIC_R2_PUBLIC_URL??""):"";

  async function handleCreate(){
    if(!createTitle.trim()||!createSlug.trim())return;
    setCreating(true);setCreateMsg(null);
    try{const res=await fetch("/api/hw-admin/collections",{method:"POST",headers:{"Content-Type":"application/json","x-admin-password":password},body:JSON.stringify({title:createTitle.trim(),slug:createSlug.trim(),category:createCategory.trim()||"General",icon:createIcon.trim()||"🖤",tag:createTag.trim()||"Collection",featured:createFeatured,rootSlug:createRootSlug})});
      const j=await res.json();
      if(res.ok){setCreateMsg({type:"ok",text:`✓ Created "${createTitle}"`});setCreateTitle("");setCreateSlug("");setCreateCategory("General");setCreateIcon("🖤");setCreateTag("Collection");setCreateFeatured(false);setCreateRootSlug(false);setShowCreate(false);load();}
      else setCreateMsg({type:"err",text:j.error??"Create failed."});}
    catch{setCreateMsg({type:"err",text:"Network error."});}setCreating(false);
  }

  const load=useCallback(async()=>{
    setLoading(true);
    try{const res=await fetch("/api/hw-admin/collections",{headers:{"x-admin-password":password}});
      if(res.ok){const j=await res.json();setCollections(j.collections??[]);}}
    catch{}setLoading(false);
  },[password]);

  useEffect(()=>{load();},[load]);

  function openCollection(c:CollectionRecord){
    setSelected(c);setDesc(c.description??"");setMetaDesc(c.metaDescription??"");
    setEditTitle(c.title);setEditSlug(c.slug);setEditRootSlug(!!c.rootSlug);
    setMsg(null);setDescMode("html");
    setThumbFile(null);setThumbPreview("");setThumbMsg(null);
    if(thumbInputRef.current)thumbInputRef.current.value="";
  }

  const[toggling,setToggling]=useState(false);

  async function handleTogglePublish(){
    if(!selected)return;setToggling(true);setMsg(null);
    try{const res=await fetch("/api/hw-admin/collections",{method:"PATCH",headers:{"Content-Type":"application/json","x-admin-password":password},body:JSON.stringify({slug:selected.slug,isPublished:!selected.isPublished})});
      const j=await res.json();
      if(res.ok){const newVal=!selected.isPublished;setMsg({type:"ok",text:newVal?`✓ "${selected.title}" is now LIVE`:`✓ "${selected.title}" UNPUBLISHED — hidden from site & sitemap`});setCollections(prev=>prev.map(c=>c.slug===selected.slug?{...c,isPublished:newVal}:c));setSelected(s=>s?{...s,isPublished:newVal}:null);}
      else setMsg({type:"err",text:j.error??"Toggle failed."});}
    catch{setMsg({type:"err",text:"Network error."});}setToggling(false);
  }

  async function handleSave(){
    if(!selected)return;setSaving(true);setMsg(null);
    try{const res=await fetch("/api/hw-admin/collections",{method:"PATCH",headers:{"Content-Type":"application/json","x-admin-password":password},body:JSON.stringify({slug:selected.slug,newSlug:editSlug!==selected.slug?editSlug:undefined,title:editTitle!==selected.title?editTitle:undefined,description:desc,metaDescription:metaDesc||null,rootSlug:editRootSlug})});
      const j=await res.json();
      if(res.ok){setMsg({type:"ok",text:`✓ Saved "${editTitle}"`});setCollections(prev=>prev.map(c=>c.slug===selected.slug?{...c,title:editTitle,slug:editSlug,description:desc,metaDescription:metaDesc||null,rootSlug:editRootSlug}:c));setSelected(s=>s?{...s,title:editTitle,slug:editSlug,description:desc,metaDescription:metaDesc||null,rootSlug:editRootSlug}:null);}
      else setMsg({type:"err",text:j.error??"Save failed."});}
    catch{setMsg({type:"err",text:"Network error."});}setSaving(false);
  }

  async function handleDeleteCollection(){
    if(!selected)return;
    const imgCount=selected._count.images;
    const warning=imgCount>0
      ?`Delete "${selected.title}"?\n\nThis PERMANENTLY deletes the collection AND all ${imgCount} image record${imgCount===1?"":"s"} inside it from the database. This cannot be undone.\n\nType-check yourself: are you sure?`
      :`Delete "${selected.title}"?\n\nThis permanently removes the collection from the database. This cannot be undone.`;
    if(!confirm(warning))return;
    setDeleting(true);setMsg(null);
    try{
      const res=await fetch("/api/hw-admin/collections",{method:"DELETE",headers:{"Content-Type":"application/json","x-admin-password":password},body:JSON.stringify({slug:selected.slug})});
      const j=await res.json();
      if(res.ok){
        setCollections(prev=>prev.filter(c=>c.slug!==selected.slug));
        setSelected(null);
        setMsg(null);
      }else{
        setMsg({type:"err",text:j.error??"Delete failed."});
      }
    }catch{setMsg({type:"err",text:"Network error."});}
    setDeleting(false);
  }

  async function handleThumbUpload(){
    if(!thumbFile||!selected)return;
    setThumbUploading(true);setThumbMsg(null);
    try{
      const form=new FormData();
      form.append("file",thumbFile);
      form.append("slug",selected.slug);
      const res=await fetch("/api/hw-admin/collections/upload-thumbnail",{method:"POST",headers:{"x-admin-password":password},body:form});
      const j=await res.json();
      if(res.ok){
        setThumbMsg({type:"ok",text:"✓ Thumbnail uploaded — live on homepage & obsessions page!"});
        const newThumb=j.thumbnail;
        setCollections(prev=>prev.map(c=>c.slug===selected.slug?{...c,thumbnail:newThumb}:c));
        setSelected(s=>s?{...s,thumbnail:newThumb}:null);
        setThumbFile(null);setThumbPreview("");
        if(thumbInputRef.current)thumbInputRef.current.value="";
      }else setThumbMsg({type:"err",text:j.error??"Upload failed."});
    }catch{setThumbMsg({type:"err",text:"Network error."});}
    setThumbUploading(false);
  }

  const filtered=collections.filter(c=>!search||c.title.toLowerCase().includes(search.toLowerCase())||c.slug.includes(search.toLowerCase()));
  const wordCount=desc.replace(/<[^>]*>/g," ").replace(/\s+/g," ").trim().split(" ").filter(Boolean).length;
  const isHtml=/<[a-z][\s\S]*>/i.test(desc);
  const thumbUrl=(key:string|null)=>key&&r2Base?`${r2Base}/${key}`:"";

  return<div style={{display:"grid",gridTemplateColumns:"280px 1fr",gap:"24px",alignItems:"start"}}>
    <div><Card style={{padding:"0",overflow:"hidden"}}>
      <div style={{padding:"10px 14px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",gap:"8px"}}>
        <p style={{color:C.gold,fontSize:"0.72rem",fontWeight:700,margin:0}}>Collections</p>
        <button onClick={()=>setShowCreate(v=>!v)} style={{background:showCreate?"#1a1625":C.purple,color:"#fff",border:"none",borderRadius:"5px",padding:"4px 10px",fontSize:"0.7rem",cursor:"pointer",fontWeight:600}}>{showCreate?"✕ Cancel":"＋ New"}</button>
      </div>
      {showCreate&&<div style={{padding:"12px 14px",borderBottom:`1px solid ${C.border}`,background:"#0d0a1a"}}>
        <p style={{color:C.purple,fontSize:"0.65rem",fontWeight:700,margin:"0 0 8px",letterSpacing:"0.1em",textTransform:"uppercase"}}>Create Collection</p>
        <input value={createTitle} onChange={e=>{setCreateTitle(e.target.value);setCreateSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,""));}} placeholder="Title (e.g. The Classic District)" style={{...inp,fontSize:"0.78rem",marginBottom:"6px"}}/>
        <input value={createSlug} onChange={e=>setCreateSlug(e.target.value)} placeholder="slug (auto-filled)" style={{...inp,fontSize:"0.78rem",fontFamily:"monospace",marginBottom:"6px"}}/>
        <input value={createCategory} onChange={e=>setCreateCategory(e.target.value)} placeholder="Category (e.g. Themes, Aesthetic)" style={{...inp,fontSize:"0.78rem",marginBottom:"6px"}}/>
        <div style={{display:"flex",gap:"6px",marginBottom:"6px"}}>
          <input value={createIcon} onChange={e=>setCreateIcon(e.target.value)} placeholder="Icon emoji 🖤" style={{...inp,fontSize:"0.85rem",width:"70px",textAlign:"center",flexShrink:0}}/>
          <input value={createTag} onChange={e=>setCreateTag(e.target.value)} placeholder="Tag label (e.g. Gothic)" style={{...inp,fontSize:"0.78rem",flex:1}}/>
        </div>
        <label style={{display:"flex",alignItems:"center",gap:"8px",cursor:"pointer",marginBottom:"8px"}}>
          <input type="checkbox" checked={createFeatured} onChange={e=>setCreateFeatured(e.target.checked)} style={{accentColor:C.gold}}/>
          <span style={{color:C.textSec,fontSize:"0.72rem"}}>Featured (shows at top)</span>
        </label>
        <label style={{display:"flex",alignItems:"center",gap:"8px",cursor:"pointer",marginBottom:"8px"}}>
          <input type="checkbox" checked={createRootSlug} onChange={e=>setCreateRootSlug(e.target.checked)} style={{accentColor:C.gold}}/>
          <span style={{color:C.textSec,fontSize:"0.72rem"}}>Root-level URL (e.g. hauntedwallpapers.com/{createSlug||"slug"} instead of /collections/{createSlug||"slug"})</span>
        </label>
        {createMsg&&<p style={{fontSize:"0.72rem",color:createMsg.type==="ok"?C.green:C.red,margin:"0 0 6px"}}>{createMsg.text}</p>}
        <Btn onClick={handleCreate} disabled={creating||!createTitle.trim()||!createSlug.trim()}>{creating?"Creating…":"Create Collection"}</Btn>
      </div>}
      <div style={{padding:"10px 14px",borderBottom:`1px solid ${C.border}`}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search collections…" style={{...inp,fontSize:"0.78rem"}}/>
      </div>
      {loading?<p style={{color:C.textSec,padding:"16px",fontSize:"0.8rem"}}>Loading…</p>:
        <div style={{maxHeight:"70vh",overflowY:"auto"}}>
          {filtered.length===0&&<p style={{color:C.textMut,padding:"16px",fontSize:"0.75rem"}}>No collections found.</p>}
          {filtered.map(c=>{
            const active=selected?.slug===c.slug;
            const hasContent=c.description&&c.description.length>20;
            const hasHtml=/<[a-z][\s\S]*>/i.test(c.description??"");
            const hasThumb=!!c.thumbnail;
            return<button key={c.slug} onClick={()=>openCollection(c)} style={{display:"flex",alignItems:"center",gap:"10px",width:"100%",padding:"10px 14px",background:active?"rgba(192,0,26,0.15)":"transparent",border:"none",borderBottom:`1px solid ${C.border}`,borderLeft:`3px solid ${active?C.red:"transparent"}`,cursor:"pointer",textAlign:"left"}}>
              {thumbUrl(c.thumbnail)?<img src={thumbUrl(c.thumbnail)} alt="" style={{width:"32px",height:"48px",objectFit:"cover",flexShrink:0,border:`1px solid ${C.border}`}} onError={e=>{(e.target as HTMLImageElement).style.display="none";}}/>:<div style={{width:"32px",height:"48px",background:"#1a1625",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.9rem",border:`1px dashed ${C.border}`}}>🖤</div>}
              <div style={{flex:1,minWidth:0}}>
                <p style={{color:active?C.textPri:C.textSec,fontSize:"0.78rem",fontWeight:active?600:400,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{c.title}</p>
                <p style={{color:C.textMut,fontSize:"0.6rem",marginTop:"2px"}}>{c._count.images} images · {c.category}</p>
                <div style={{display:"flex",gap:"6px",marginTop:"2px",flexWrap:"wrap"}}>
                  {!c.isPublished&&<p style={{color:C.red,fontSize:"0.55rem",margin:0,background:"rgba(192,0,26,0.15)",padding:"1px 5px"}}>● HIDDEN</p>}
                  {c.rootSlug&&<p style={{color:C.gold,fontSize:"0.55rem",margin:0,background:"rgba(201,168,76,0.15)",padding:"1px 5px"}}>◆ ROOT</p>}
                  {hasThumb&&<p style={{color:C.gold,fontSize:"0.55rem",margin:0}}>🖼 thumb</p>}
                  {hasContent&&<p style={{color:hasHtml?C.purple:C.green,fontSize:"0.55rem",margin:0}}>{hasHtml?"● HTML":"● desc"}</p>}
                </div>
              </div>
            </button>;})}
        </div>}
      <div style={{padding:"10px 14px",borderTop:`1px solid ${C.border}`}}>
        <p style={{color:C.textMut,fontSize:"0.6rem"}}>{filtered.length} / {collections.length} collections</p>
      </div>
    </Card></div>

    {!selected
      ?<Card style={{padding:"48px",textAlign:"center"}}><p style={{color:C.textMut,fontSize:"0.85rem"}}>← Select a collection to edit it</p></Card>
      :<div style={{display:"flex",flexDirection:"column",gap:"16px"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"12px"}}>
          <div>
            <p style={{color:C.red,fontSize:"0.6rem",letterSpacing:"0.2em",textTransform:"uppercase",marginBottom:"4px"}}>Editing Collection</p>
            <input value={editTitle} onChange={e=>setEditTitle(e.target.value)} style={{...inp,fontSize:"1rem",fontWeight:500,color:C.gold,marginBottom:"6px",width:"100%"}}/>
            <input value={editSlug} onChange={e=>setEditSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g,"-"))} style={{...inp,fontSize:"0.65rem",color:C.textMut,marginBottom:"4px",width:"100%"}}/>
            <div style={{display:"flex",gap:"12px",marginTop:"4px",alignItems:"center",flexWrap:"wrap"}}>
              <a href={`https://hauntedwallpapers.com/${editRootSlug?editSlug:`collections/${editSlug}`}`} target="_blank" rel="noopener noreferrer" style={{color:C.textMut,fontSize:"0.65rem",textDecoration:"none"}}>↗ View Live</a>
              <label style={{display:"flex",alignItems:"center",gap:"6px",cursor:"pointer"}}>
                <input type="checkbox" checked={editRootSlug} onChange={e=>setEditRootSlug(e.target.checked)} style={{accentColor:C.gold}}/>
                <span style={{color:C.textSec,fontSize:"0.65rem"}}>Root-level URL (hauntedwallpapers.com/{editSlug} instead of /collections/{editSlug})</span>
              </label>
            </div>
          </div>
          <div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}>
            <Btn onClick={handleTogglePublish} disabled={toggling} variant={selected.isPublished?"danger":"success"} style={{minWidth:"140px"}}>
              {toggling?"…":selected.isPublished?"⬇ Unpublish":"⬆ Publish"}
            </Btn>
            <Btn onClick={handleSave} disabled={saving}>{saving?"Saving…":"💾 Save Description"}</Btn>
            <Btn onClick={handleDeleteCollection} disabled={deleting} variant="danger" style={{background:"transparent",color:C.red,borderColor:"rgba(192,0,26,0.5)"}}>
              {deleting?"…":"🗑 Delete Collection"}
            </Btn>
          </div>
        </div>
        <Msg msg={msg}/>
        <Card style={{padding:"16px",borderColor:selected.thumbnail?C.gold:"rgba(201,168,76,0.3)",background:selected.thumbnail?"rgba(201,168,76,0.04)":C.surface}}>
          <p style={{...lbl,marginBottom:"10px",color:C.gold}}>🖼 Obsession Card Thumbnail</p>
          <p style={{color:C.textMut,fontSize:"0.65rem",marginBottom:"14px",lineHeight:1.6}}>This image appears on the <strong style={{color:C.textSec}}>Homepage grid</strong> and <strong style={{color:C.textSec}}>/collections</strong> page as the card background. Recommended: portrait 3:4 ratio, min 600px wide. JPG/PNG/WEBP.</p>
          {selected.thumbnail&&thumbUrl(selected.thumbnail)&&(
            <div style={{display:"flex",gap:"16px",alignItems:"flex-start",marginBottom:"16px",padding:"12px",background:"rgba(0,0,0,0.3)",border:`1px solid ${C.border}`}}>
              <img src={thumbUrl(selected.thumbnail)} alt="Current thumbnail" style={{width:"60px",height:"80px",objectFit:"cover",border:`1px solid ${C.gold}`,flexShrink:0}} onError={e=>{(e.target as HTMLImageElement).style.opacity="0.2";}}/>
              <div>
                <p style={{color:C.gold,fontSize:"0.7rem",marginBottom:"4px"}}>✓ Current thumbnail</p>
                <p style={{color:C.textMut,fontSize:"0.6rem",wordBreak:"break-all"}}>{selected.thumbnail}</p>
                <p style={{color:C.textMut,fontSize:"0.6rem",marginTop:"4px"}}>Upload a new image below to replace it.</p>
              </div>
            </div>
          )}
          <div
            onDragOver={e=>{e.preventDefault();setThumbDragging(true);}}
            onDragLeave={()=>setThumbDragging(false)}
            onDrop={e=>{
              e.preventDefault();setThumbDragging(false);
              const f=e.dataTransfer.files[0];
              if(f?.type.startsWith("image/")){setThumbFile(f);setThumbPreview(URL.createObjectURL(f));setThumbMsg(null);}
            }}
            onClick={()=>thumbInputRef.current?.click()}
            style={{border:`2px dashed ${thumbDragging?C.gold:thumbFile?C.green:C.border}`,background:thumbDragging?"rgba(201,168,76,0.06)":C.surface,padding:"24px",textAlign:"center",cursor:"pointer",transition:"all 0.2s",marginBottom:"10px"}}
          >
            <input ref={thumbInputRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>{const f=e.target.files?.[0];if(f){setThumbFile(f);setThumbPreview(URL.createObjectURL(f));setThumbMsg(null);}}}/>
            {thumbPreview
              ?<div style={{display:"flex",gap:"16px",alignItems:"flex-start",justifyContent:"center",flexWrap:"wrap"}}>
                  <img src={thumbPreview} alt="New thumbnail preview" style={{width:"80px",height:"106px",objectFit:"cover",border:`2px solid ${C.green}`}}/>
                  <div style={{textAlign:"left"}}>
                    <p style={{color:C.green,fontSize:"0.72rem",marginBottom:"4px"}}>✓ Ready to upload</p>
                    <p style={{color:C.textPri,fontSize:"0.8rem",marginBottom:"3px"}}>{thumbFile?.name}</p>
                    <p style={{color:C.textSec,fontSize:"0.7rem"}}>{thumbFile?(thumbFile.size/1024/1024).toFixed(2)+" MB":""}</p>
                    <p style={{color:C.textMut,fontSize:"0.6rem",marginTop:"6px"}}>Click to replace</p>
                  </div>
                </div>
              :<>
                <p style={{fontSize:"1.8rem",marginBottom:"8px"}}>🖼</p>
                <p style={{color:C.textPri,fontSize:"0.85rem",marginBottom:"4px"}}>{thumbDragging?"Drop it!":"Drag & drop obsession thumbnail"}</p>
                <p style={{color:C.textSec,fontSize:"0.7rem"}}>or click to browse · JPG, PNG, WEBP · portrait preferred</p>
              </>
            }
          </div>
          {thumbMsg&&<Msg msg={thumbMsg}/>}
          {thumbFile&&(
            <div style={{display:"flex",gap:"8px",alignItems:"center"}}>
              <Btn onClick={handleThumbUpload} disabled={thumbUploading} style={{background:C.gold,color:"#000"}}>
                {thumbUploading?"Uploading…":"⬆ Upload Thumbnail"}
              </Btn>
              <Btn onClick={()=>{setThumbFile(null);setThumbPreview("");setThumbMsg(null);if(thumbInputRef.current)thumbInputRef.current.value="";}} variant="ghost" disabled={thumbUploading}>
                Cancel
              </Btn>
            </div>
          )}
          {!thumbFile&&!selected.thumbnail&&(
            <p style={{color:"rgba(192,0,26,0.7)",fontSize:"0.65rem",marginTop:"4px"}}>⚠ No thumbnail — card shows icon placeholder on homepage &amp; obsessions page.</p>
          )}
        </Card>
        <Card style={{padding:"16px"}}>
          <label style={lbl}>Meta Description (Google search snippet) <span style={{color:metaDesc.length>155?C.red:C.textMut}}>({metaDesc.length}/155)</span></label>
          <input value={metaDesc} onChange={e=>setMetaDesc(e.target.value)} placeholder="130–155 char keyword-rich description for Google" style={inp}/>
          <p style={{color:C.textMut,fontSize:"0.62rem",marginTop:"6px"}}>Leave blank to auto-use the main description.</p>
        </Card>
        <Card style={{padding:"16px"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"10px",flexWrap:"wrap",gap:"8px"}}>
            <label style={{...lbl,marginBottom:0}}>
              Description (HTML) <span style={{color:wordCount>=100?C.green:wordCount>0?C.gold:C.textMut}}>({wordCount} words{wordCount>=100?" ✓":" — aim for 100–200"})</span>
              {isHtml&&<span style={{color:C.purple,fontSize:"0.58rem",marginLeft:"8px"}}>● HTML active</span>}
            </label>
            <div style={{display:"flex",gap:"4px"}}>
              {(["html","preview"] as const).map(m=><button key={m} type="button" onClick={()=>setDescMode(m)} style={{background:descMode===m?(m==="preview"?C.red:"#2a2535"):"transparent",border:`1px solid ${C.border}`,color:descMode===m?C.white:C.textSec,padding:"4px 12px",cursor:"pointer",fontSize:"0.65rem",fontFamily:"monospace"}}>{m==="preview"?"👁 Preview":"HTML"}</button>)}
            </div>
          </div>
          <HtmlToolbar textareaId="coll-desc-ta" value={desc} onChange={setDesc}/>
          {descMode==="html"
            ?<textarea id="coll-desc-ta" value={desc} onChange={e=>setDesc(e.target.value)} rows={14} placeholder={"<h2>About This Collection</h2>\n<p>Describe what makes this collection unique…</p>\n<p>Include keywords: dark wallpapers, free download, gothic art, etc.</p>"} spellCheck={false} style={{...inp,resize:"vertical",lineHeight:"1.6",fontFamily:"monospace",fontSize:"0.8rem"}}/>
            :<div style={{minHeight:"280px",border:`1px solid ${C.border}`,padding:"24px",background:"#08060f",lineHeight:"1.9",fontSize:"0.95rem",color:C.textPri}} dangerouslySetInnerHTML={{__html:desc||`<p style='color:${C.textMut}'>Nothing to preview yet…</p>`}}/>}
          <p style={{color:C.textMut,fontSize:"0.62rem",marginTop:"6px"}}>ℹ HTML renders directly on the collection page. Plain text also works. 100–200 words ideal for SEO.</p>
        </Card>
        <Card style={{padding:"14px 16px",background:"rgba(124,58,237,0.08)",borderColor:"rgba(124,58,237,0.3)"}}>
          <p style={{color:C.purple,fontSize:"0.75rem",marginBottom:"4px"}}>✦ How this works</p>
          <p style={{color:C.textSec,fontSize:"0.72rem",lineHeight:1.7}}>The <strong style={{color:C.gold}}>thumbnail</strong> shows as the card background on the homepage and /collections page. The <strong style={{color:C.gold}}>description</strong> renders at <code style={{color:C.gold}}>/collections/{selected.slug}</code> as the editorial intro. Meta description goes in &lt;head&gt; for Google only.</p>
        </Card>
      </div>}
  </div>;
}

const DISTRICTS_LIST=[{id:"classic",tag:"classic-district",label:"The Classic District",emoji:"🏚️",desc:"Old houses, vintage portraits, Victorian furniture.",accent:"#8B6914"},{id:"city",tag:"city-center",label:"The City Center",emoji:"🌆",desc:"Rainy streets, dark skyscrapers, neon signs.",accent:"#1a6ecf"},{id:"bone",tag:"bone-street",label:"Bone Street",emoji:"💀",desc:"Skulls, skeletons & anatomical art.",accent:"#c0c0c0"},{id:"nature",tag:"nature-trail",label:"The Nature Trail",emoji:"🌲",desc:"Dark forests, fog, dead trees.",accent:"#2d6a4f"},{id:"minimal",tag:"minimalist-row",label:"Minimalist Row",emoji:"◼",desc:"AMOLED blacks & thin lines.",accent:"#555555"},{id:"character",tag:"character-ward",label:"The Character Ward",emoji:"🎭",desc:"Hooded figures, masks, shadow people.",accent:"#7b2d8b"}] as const;
type DistrictId=typeof DISTRICTS_LIST[number]["id"];
interface DistrictImg{id:string;title:string|null;slug:string;r2Key:string;tags:string[];}
function DistrictsTab({password}:{password:string}){
  const[activeId,setActiveId]=useState<DistrictId>("classic");
  const[counts,setCounts]=useState<Record<string,number>>({});
  const[images,setImages]=useState<DistrictImg[]>([]);
  const[loading,setLoading]=useState(false);
  const[selected,setSelected]=useState<Set<string>>(new Set());
  const[uploadMsg,setUploadMsg]=useState<{type:"ok"|"err";text:string}|null>(null);
  const[removing,setRemoving]=useState(false);
  const[districtDeviceType,setDistrictDeviceType]=useState<"IPHONE"|"ANDROID"|"PC"|"">("IPHONE");
  const fileRef=useRef<HTMLInputElement>(null);
  const r2Base=process.env.NEXT_PUBLIC_R2_PUBLIC_URL??"";
  const active=DISTRICTS_LIST.find(d=>d.id===activeId)!;

  const load=useCallback(async(d:typeof DISTRICTS_LIST[number])=>{
    setLoading(true);setImages([]);
    try{const res=await fetch(`/api/admin/districts?tag=${encodeURIComponent(d.tag)}&limit=50`,{headers:{"x-admin-password":password}});
      if(res.ok){const j=await res.json();setImages(j.images??[]);setCounts((prev:Record<string,number>)=>({...prev,[d.id]:j.total??0}));}}
    catch{}setLoading(false);
  },[password]);

  useEffect(()=>{load(active);setSelected(new Set());},[active,load]);

  async function handleUpload(e:React.ChangeEvent<HTMLInputElement>){
    const files=e.target.files;if(!files||files.length===0)return;
    setUploadMsg({type:"ok",text:"Uploading..."});
    const form=new FormData();
    Array.from(files).forEach(f=>form.append("files",f));
    form.append("tags",active.tag);form.append("districtId",active.id);if(districtDeviceType)form.append("deviceType",districtDeviceType);
    try{const res=await fetch("/api/admin/districts/upload",{method:"POST",headers:{"x-admin-password":password},body:form});
      if(!res.ok)throw new Error((await res.json()).message??"Upload failed");
      const j=await res.json();setUploadMsg({type:"ok",text:`Uploaded ${j.count} image(s)`});await load(active);}
    catch(err:unknown){setUploadMsg({type:"err",text:err instanceof Error?err.message:"Upload failed"});}
    if(fileRef.current)fileRef.current.value="";
    setTimeout(()=>setUploadMsg(null),4000);
  }

  async function handleRemove(){
    if(selected.size===0||!confirm(`Remove ${selected.size} image(s) from ${active.label}?`))return;
    setRemoving(true);
    try{await fetch("/api/admin/districts/untag",{method:"POST",headers:{"Content-Type":"application/json","x-admin-password":password},body:JSON.stringify({imageIds:Array.from(selected),tag:active.tag})});
      setSelected(new Set());await load(active);}
    catch{}setRemoving(false);
  }

  const toggle=(id:string)=>setSelected(prev=>{const n=new Set(prev);n.has(id)?n.delete(id):n.add(id);return n;});

  return <div style={{display:"grid",gridTemplateColumns:"220px 1fr",gap:"20px",alignItems:"start"}}>
    <div style={{background:"#0d0d12",border:`1px solid ${C.border}`,borderRadius:"10px",overflow:"hidden",position:"sticky",top:"1rem"}}>
      <p style={{color:C.textMut,fontSize:"0.65rem",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",padding:"10px 14px 6px",margin:0}}>The 6 Districts</p>
      {DISTRICTS_LIST.map(d=>{
        const isActive=d.id===activeId;
        return <button key={d.id} onClick={()=>setActiveId(d.id)} style={{width:"100%",display:"flex",alignItems:"center",gap:"8px",padding:"9px 14px",background:isActive?"rgba(123,45,139,0.15)":"transparent",border:"none",borderLeft:`3px solid ${isActive?d.accent:"transparent"}`,cursor:"pointer",textAlign:"left",transition:"all 0.15s"}}>
          <span style={{fontSize:"1.1rem",flexShrink:0}}>{d.emoji}</span>
          <div style={{flex:1,minWidth:0}}>
            <p style={{color:isActive?C.textPri:C.textSec,fontSize:"0.76rem",fontWeight:isActive?600:400,margin:0,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{d.label}</p>
            <p style={{color:C.textMut,fontSize:"0.62rem",fontFamily:"monospace",margin:0}}>#{d.tag}</p>
          </div>
          <span style={{fontSize:"0.7rem",fontWeight:700,color:d.accent,background:`${d.accent}22`,padding:"1px 6px",borderRadius:"9px",flexShrink:0}}>{counts[d.id]??"–"}</span>
        </button>;
      })}
    </div>
    <div style={{display:"flex",flexDirection:"column",gap:"16px"}}>
      <Card style={{padding:"16px 20px",borderTop:`3px solid ${active.accent}`}}>
        <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"8px"}}>
          <span style={{fontSize:"2rem"}}>{active.emoji}</span>
          <div><p style={{color:C.textPri,fontWeight:700,fontSize:"1.1rem",margin:0}}>{active.label}</p><p style={{color:C.textSec,fontSize:"0.8rem",margin:0}}>{active.desc}</p></div>
        </div>
        <code style={{color:active.accent,fontSize:"0.72rem",background:"#0d0d12",padding:"2px 8px",borderRadius:"4px",border:`1px solid ${C.border}`}}>tag: {active.tag}</code>
        <span style={{color:C.textMut,fontSize:"0.72rem",marginLeft:"12px"}}>{counts[active.id]??0} images</span>
      </Card>
      <Card style={{padding:"16px",border:`2px dashed ${C.border}`}}>
        <div style={{display:"flex",alignItems:"center",gap:"12px",flexWrap:"wrap"}}>
          <span style={{fontSize:"1.6rem"}}>📁</span>
          <div style={{flex:1,color:C.textSec,fontSize:"0.82rem",lineHeight:1.6}}><strong style={{color:C.textPri}}>Drop images here</strong> or click Choose Files<br/><small>PNG · JPEG · WEBP · Max 20MB · Auto-tagged as <code style={{color:C.purple}}>{active.tag}</code></small></div>
          <select value={districtDeviceType} onChange={e=>setDistrictDeviceType(e.target.value as "IPHONE"|"ANDROID"|"PC"|"")} style={{background:"#1a1020",border:`1px solid ${C.border}`,color:C.textPri,padding:"7px 10px",borderRadius:"6px",fontSize:"0.76rem",cursor:"pointer"}}><option value="">No Device</option><option value="IPHONE">iPhone</option><option value="ANDROID">Android</option><option value="PC">PC</option></select>
          <label style={{background:C.purple,color:"#fff",padding:"8px 16px",borderRadius:"6px",cursor:"pointer",fontSize:"0.78rem",fontWeight:600,display:"inline-block"}} htmlFor="district-upload-inline">Choose Files</label>
          <input id="district-upload-inline" type="file" accept="image/*" multiple ref={fileRef} onChange={handleUpload} style={{display:"none"}}/>
        </div>
        {uploadMsg&&<p style={{marginTop:"10px",padding:"6px 12px",borderRadius:"6px",fontSize:"0.8rem",background:uploadMsg.type==="ok"?"#0f2a1a":"#2a0f0f",color:uploadMsg.type==="ok"?"#4ade80":"#f87171",border:`1px solid ${uploadMsg.type==="ok"?"#166534":"#991b1b"}`}}>{uploadMsg.text}</p>}
      </Card>
      {selected.size>0&&<div style={{display:"flex",alignItems:"center",gap:"10px",background:"#1a1205",border:`1px solid #4a3200`,borderRadius:"8px",padding:"8px 14px",fontSize:"0.8rem",color:"#c0a000",flexWrap:"wrap"}}>
        <span>{selected.size} selected</span>
        <Btn onClick={handleRemove} disabled={removing}>{removing?"Removing...":"Remove from district"}</Btn>
        <Btn onClick={()=>setSelected(new Set())}>Deselect all</Btn>
      </div>}
      {loading
        ?<p style={{color:C.textSec,padding:"2rem",textAlign:"center",fontSize:"0.85rem"}}>Loading district images…</p>
        :images.length>0
          ?<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:"12px"}}>
            {images.map(img=>{
              const isSel=selected.has(img.id);
              return <div key={img.id} onClick={()=>toggle(img.id)} style={{background:"#111",border:`2px solid ${isSel?"#7b2d8b":"#1e1e1e"}`,borderRadius:"8px",overflow:"hidden",cursor:"pointer",position:"relative",boxShadow:isSel?"0 0 0 2px #7b2d8b55":"none",transition:"border-color 0.15s"}}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`${r2Base}/${img.r2Key}`} alt={img.title??img.slug} loading="lazy" style={{width:"100%",aspectRatio:"3/4",objectFit:"cover",display:"block"}}/>
                <div style={{position:"absolute",top:"6px",right:"6px",width:"22px",height:"22px",borderRadius:"50%",border:"2px solid #fff",background:isSel?"#7b2d8b":"rgba(0,0,0,0.6)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.7rem",color:"#fff",fontWeight:700}}>{isSel?"✓":""}</div>
                <div style={{padding:"6px 8px"}}><p style={{color:C.textSec,fontSize:"0.7rem",margin:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{img.title??img.slug}</p></div>
              </div>;
            })}
          </div>
          :<div style={{textAlign:"center",padding:"3rem",background:"#0d0d12",border:`1px dashed ${C.border}`,borderRadius:"10px"}}>
            <div style={{fontSize:"2.5rem",marginBottom:"12px"}}>{active.emoji}</div>
            <p style={{color:C.textSec,fontSize:"0.9rem",fontWeight:600,margin:"0 0 6px"}}>This district is empty</p>
            <p style={{color:C.textMut,fontSize:"0.8rem",margin:0}}>Upload images above — they will be auto-tagged <code style={{color:C.purple}}>{active.tag}</code></p>
          </div>}
    </div>
  </div>;
}

function BulkAiTab({password}:{password:string}){
  const[collections,setCollections]=useState<CollectionRecord[]>([]);const[loadingColls,setLoadingColls]=useState(true);const[selectedColl,setSelectedColl]=useState<CollectionRecord|null>(null);const[images,setImages]=useState<ImageRecord[]>([]);const[loadingImgs,setLoadingImgs]=useState(false);const[statuses,setStatuses]=useState<Record<string,{state:"idle"|"running"|"done"|"err";msg?:string}>>({});const[running,setRunning]=useState(false);const[overallMsg,setOverallMsg]=useState<{type:"ok"|"err";text:string}|null>(null);const[search,setSearch]=useState("");const r2Base=process.env.NEXT_PUBLIC_R2_PUBLIC_URL??"";

  useEffect(()=>{async function load(){setLoadingColls(true);try{const res=await fetch("/api/hw-admin/collections",{headers:{"x-admin-password":password}});if(res.ok){const j=await res.json();setCollections(j.collections??[]);}}catch{}setLoadingColls(false);}load();},[password]);

  async function loadCollectionImages(coll:CollectionRecord){setSelectedColl(coll);setLoadingImgs(true);setStatuses({});setOverallMsg(null);try{const res=await fetch(`/api/hw-admin/images?page=1&q=&collectionId=${coll.id}&limit=200`,{headers:{"x-admin-password":password}});if(res.ok){const j=await res.json();const imgs:ImageRecord[]=j.images??[];setImages(imgs);const init:Record<string,{state:"idle"}>={}; imgs.forEach(i=>{init[i.id]={state:"idle"};});setStatuses(init);}else{setImages([]);}}catch{setImages([]);}setLoadingImgs(false);}

  async function runOnImage(img:ImageRecord):Promise<void>{
    setStatuses(prev=>({...prev,[img.id]:{state:"running"}}));
    try{
      const imgUrl=r2Base?`${r2Base}/${img.r2Key}`:`/api/r2-proxy/${img.r2Key}`;
      const{data,mediaType}=await urlToBase64(imgUrl);
      const result=await analyzeImageWithClaude(data,mediaType,password);
      const tags=img.isAdult?[...result.tags.filter((t:string)=>ALL_TAGS.includes(t)),"16plus"]:result.tags.filter((t:string)=>ALL_TAGS.includes(t));
      const res=await fetch(`/api/hw-admin/images/${img.id}`,{method:"PATCH",headers:{"Content-Type":"application/json","x-admin-password":password},body:JSON.stringify({title:result.title,description:result.description,altText:result.altText,metaDescription:result.metaDescription,tags})});
      if(!res.ok)throw new Error("Save failed");
      setStatuses(prev=>({...prev,[img.id]:{state:"done",msg:result.title}}));
    }catch(err){setStatuses(prev=>({...prev,[img.id]:{state:"err",msg:(err as Error).message}}));}
  }

  async function handleRunAll(){
    if(!images.length||running)return;
    if(!confirm(`AI-regenerate title, description, alt text & tags for all ${images.length} images in "${selectedColl?.title}"?\n\nThis will overwrite existing data.`))return;
    setRunning(true);setOverallMsg(null);
    let done=0,failed=0;
    for(const img of images){
      await runOnImage(img);
      await new Promise(r=>setTimeout(r,600));
      const st=statuses[img.id]?.state;
      if(st==="done")done++;else if(st==="err")failed++;
    }
    setRunning(false);
    setOverallMsg({type:failed===0?"ok":"err",text:failed===0?`✓ All ${images.length} images updated!`:`⚠ ${images.length-failed} updated, ${failed} failed.`});
  }

  async function handleRunOne(img:ImageRecord){await runOnImage(img);}

  const filtered=collections.filter(c=>!search||c.title.toLowerCase().includes(search.toLowerCase())||c.slug.includes(search.toLowerCase()));
  const doneCount=Object.values(statuses).filter(s=>s.state==="done").length;
  const errCount=Object.values(statuses).filter(s=>s.state==="err").length;
  const runningCount=Object.values(statuses).filter(s=>s.state==="running").length;
  const thumbUrl=(key:string)=>r2Base?`${r2Base}/${key}`:`/api/r2-proxy/${key}`;

  return<div style={{display:"grid",gridTemplateColumns:"280px 1fr",gap:"24px",alignItems:"start"}}>
    <div><Card style={{padding:"0",overflow:"hidden"}}>
      <div style={{padding:"12px 14px",borderBottom:`1px solid ${C.border}`}}>
        <p style={{...eyebrow,marginBottom:"8px"}}>Select Collection</p>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search…" style={{...inp,fontSize:"0.78rem"}}/>
      </div>
      {loadingColls?<p style={{color:C.textSec,padding:"16px",fontSize:"0.8rem"}}>Loading…</p>:
        <div style={{maxHeight:"70vh",overflowY:"auto"}}>
          {filtered.map(c=>{const active=selectedColl?.slug===c.slug;return<button key={c.slug} onClick={()=>loadCollectionImages(c)} style={{display:"flex",alignItems:"center",gap:"10px",width:"100%",padding:"10px 14px",background:active?"rgba(192,0,26,0.15)":"transparent",border:"none",borderBottom:`1px solid ${C.border}`,borderLeft:`3px solid ${active?C.red:"transparent"}`,cursor:"pointer",textAlign:"left"}}>
            <div style={{flex:1,minWidth:0}}>
              <p style={{color:active?C.textPri:C.textSec,fontSize:"0.78rem",fontWeight:active?600:400,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{c.title}</p>
              <p style={{color:C.textMut,fontSize:"0.6rem",marginTop:"2px"}}>{c._count.images} images</p>
            </div>
          </button>;})}
        </div>}
    </Card></div>
    {!selectedColl?<Card style={{padding:"48px",textAlign:"center"}}><p style={{color:C.textMut,fontSize:"0.85rem"}}>← Pick a collection to bulk-update its images with AI</p></Card>:
    <div style={{display:"flex",flexDirection:"column",gap:"16px"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"12px"}}>
        <div>
          <p style={{color:C.red,fontSize:"0.6rem",letterSpacing:"0.2em",textTransform:"uppercase",marginBottom:"4px"}}>Bulk AI Update</p>
          <p style={{color:C.gold,fontSize:"1rem",fontWeight:500}}>{selectedColl.title}</p>
          <p style={{color:C.textMut,fontSize:"0.65rem",marginTop:"4px"}}>{images.length} images · {doneCount} done · {errCount} errors {runningCount>0?`· ${runningCount} running…`:""}</p>
        </div>
        <Btn onClick={handleRunAll} disabled={running||loadingImgs||images.length===0} style={{background:running?"rgba(192,0,26,0.4)":C.red}}>{running?`⏳ Running (${doneCount}/${images.length})…`:`✨ AI Update All ${images.length} Images`}</Btn>
      </div>
      <Card style={{padding:"14px 16px",borderColor:"rgba(201,168,76,0.3)",background:"rgba(201,168,76,0.05)"}}>
        <p style={{color:C.gold,fontSize:"0.72rem",marginBottom:"4px"}}>⚠ What this does</p>
        <p style={{color:C.textSec,fontSize:"0.68rem",lineHeight:1.7}}>GLM Vision analyses each image and <strong style={{color:C.textPri}}>overwrites</strong> the title, description (~200 words), alt text (130–150 chars), meta description, and tags. It processes them one by one with a short delay. This cannot be undone — use with care.</p>
      </Card>
      <Msg msg={overallMsg}/>
      {loadingImgs?<p style={{color:C.textSec,textAlign:"center",padding:"40px"}}>Loading images…</p>:images.length===0?<Card style={{padding:"32px",textAlign:"center"}}><p style={{color:C.textMut}}>No images found in this collection.</p></Card>:
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:"12px"}}>
        {images.map(img=>{
          const st=statuses[img.id]??{state:"idle"};
          const borderColor=st.state==="done"?C.green:st.state==="err"?C.red:st.state==="running"?C.gold:C.border;
          return<div key={img.id} style={{border:`1px solid ${borderColor}`,background:C.surface,transition:"border-color 0.3s"}}>
            <div style={{position:"relative",aspectRatio:"9/16",background:"#0d0b14",overflow:"hidden"}}>
              <img src={thumbUrl(img.r2Key)} alt={img.title} style={{width:"100%",height:"100%",objectFit:"cover",display:"block",opacity:st.state==="running"?0.5:1,transition:"opacity 0.3s"}} onError={e=>{(e.target as HTMLImageElement).style.display="none";}}/>
              {st.state==="running"&&<div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.5)",fontSize:"1.4rem"}}>✨</div>}
              {st.state==="done"&&<div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(76,175,80,0.25)",fontSize:"1.4rem"}}>✓</div>}
              {st.state==="err"&&<div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(192,0,26,0.25)",fontSize:"1.4rem"}}>✗</div>}
            </div>
            <div style={{padding:"8px"}}>
              <p style={{color:st.state==="done"?C.green:st.state==="err"?"#ff8080":C.textPri,fontSize:"0.65rem",fontWeight:600,lineHeight:1.3,wordBreak:"break-word",marginBottom:"6px"}}>{st.state==="done"?st.msg:st.state==="err"?`⚠ ${st.msg}`:img.title}</p>
              {st.state==="idle"&&<button onClick={()=>handleRunOne(img)} style={{width:"100%",background:"rgba(124,58,237,0.1)",border:`1px solid ${C.border}`,color:C.textSec,padding:"5px",cursor:"pointer",fontSize:"0.58rem",fontFamily:"monospace"}}>✨ AI Update</button>}
            </div>
          </div>;
        })}
      </div>}
    </div>}
  </div>;
}

function HighResUploadTab({password}:{password:string}){
  const[collections,setCollections]=useState<CollectionRecord[]>([]);const[loadingColls,setLoadingColls]=useState(true);const[selectedColl,setSelectedColl]=useState<CollectionRecord|null>(null);const[images,setImages]=useState<ImageRecord[]>([]);const[loadingImgs,setLoadingImgs]=useState(false);const[search,setSearch]=useState("");const[uploadStates,setUploadStates]=useState<Record<string,{state:"idle"|"uploading"|"done"|"err";msg?:string}>>({});const[overallMsg,setOverallMsg]=useState<{type:"ok"|"err";text:string}|null>(null);const r2Base=process.env.NEXT_PUBLIC_R2_PUBLIC_URL??"";

  useEffect(()=>{async function load(){setLoadingColls(true);try{const res=await fetch("/api/hw-admin/collections",{headers:{"x-admin-password":password}});if(res.ok){const j=await res.json();const filtered=(j.collections??[]).filter((c:CollectionRecord)=>{const cat=c.category?.toLowerCase()??"";return cat.includes("iphone")||cat.includes("android")||cat.includes("mobile")||cat.includes("phone");});setCollections(filtered.length>0?filtered:j.collections??[]);}}catch{}setLoadingColls(false);}load();},[password]);

  async function loadCollectionImages(coll:CollectionRecord){setSelectedColl(coll);setImages([]);setLoadingImgs(true);setUploadStates({});setOverallMsg(null);try{const res=await fetch(`/api/hw-admin/images?collectionId=${coll.id}&limit=500`,{headers:{"x-admin-password":password}});if(res.ok){const j=await res.json();const imgs:ImageRecord[]=j.images??[];setImages(imgs);const init:Record<string,{state:"idle"}>={}; imgs.forEach(i=>{init[i.id]={state:"idle"};});setUploadStates(init);}}catch{}setLoadingImgs(false);}

  async function handleFileUpload(img:ImageRecord,file:File){
    setUploadStates(prev=>({...prev,[img.id]:{state:"uploading"}}));
    try{
      const form=new FormData();
      form.append("imageId",img.id);
      form.append("slug",img.slug);
      form.append("file",file);
      const res=await fetch("/api/hw-admin/upload-highres",{method:"POST",headers:{"x-admin-password":password},body:form});
      const j=await res.json();
      if(res.ok){setUploadStates(prev=>({...prev,[img.id]:{state:"done",msg:j.highResKey}}));setImages(prev=>prev.map(i=>i.id===img.id?{...i,highResKey:j.highResKey}:i));}
      else{setUploadStates(prev=>({...prev,[img.id]:{state:"err",msg:j.error??"Upload failed"}}));}
    }catch(err){setUploadStates(prev=>({...prev,[img.id]:{state:"err",msg:(err as Error).message}}));}
  }

  const filtered=collections.filter(c=>!search||c.title.toLowerCase().includes(search.toLowerCase())||c.slug.includes(search.toLowerCase()));
  const doneCount=Object.values(uploadStates).filter(s=>s.state==="done").length;
  const errCount=Object.values(uploadStates).filter(s=>s.state==="err").length;
  const thumbUrl=(key:string)=>r2Base?`${r2Base}/${key}`:`/api/r2-proxy/${key}`;
  const has4k=(img:ImageRecord)=>img.highResKey?.includes("-4k");

  return<div style={{display:"grid",gridTemplateColumns:"280px 1fr",gap:"24px",alignItems:"start"}}>
    <div><Card style={{padding:"0",overflow:"hidden"}}>
      <div style={{padding:"12px 14px",borderBottom:`1px solid ${C.border}`}}>
        <p style={{...eyebrow,marginBottom:"8px"}}>Collections</p>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search…" style={{...inp,fontSize:"0.78rem"}}/>
      </div>
      {loadingColls?<p style={{color:C.textSec,padding:"16px",fontSize:"0.8rem"}}>Loading…</p>:
        <div style={{maxHeight:"70vh",overflowY:"auto"}}>
          {filtered.length===0&&<p style={{color:C.textMut,padding:"16px",fontSize:"0.75rem"}}>No collections found.</p>}
          {filtered.map(c=>{const active=selectedColl?.slug===c.slug;return<button key={c.slug} onClick={()=>loadCollectionImages(c)} style={{display:"flex",alignItems:"center",gap:"10px",width:"100%",padding:"10px 14px",background:active?"rgba(192,0,26,0.15)":"transparent",border:"none",borderBottom:`1px solid ${C.border}`,borderLeft:`3px solid ${active?C.red:"transparent"}`,cursor:"pointer",textAlign:"left"}}>
            <div style={{flex:1,minWidth:0}}>
              <p style={{color:active?C.textPri:C.textSec,fontSize:"0.78rem",fontWeight:active?600:400,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{c.title}</p>
              <p style={{color:C.textMut,fontSize:"0.6rem",marginTop:"2px"}}>{c._count.images} images · {c.category}</p>
            </div>
          </button>;})}
        </div>}
    </Card></div>
    {!selectedColl
      ?<Card style={{padding:"48px",textAlign:"center"}}>
        <p style={{fontSize:"2rem",marginBottom:"12px"}}>🖼️</p>
        <p style={{color:C.textPri,fontSize:"0.9rem",marginBottom:"8px"}}>Upload 4K versions for existing images</p>
        <p style={{color:C.textMut,fontSize:"0.72rem",lineHeight:1.7}}>← Pick a collection, then drop a 4K file onto each image card.<br/>The upscaled version gets stored in R2 and users will download it instead of the thumbnail.</p>
      </Card>
      :<div style={{display:"flex",flexDirection:"column",gap:"16px"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"12px"}}>
          <div>
            <p style={{color:C.red,fontSize:"0.6rem",letterSpacing:"0.2em",textTransform:"uppercase",marginBottom:"4px"}}>4K Upload</p>
            <p style={{color:C.gold,fontSize:"1rem",fontWeight:500}}>{selectedColl.title}</p>
            <p style={{color:C.textMut,fontSize:"0.65rem",marginTop:"4px"}}>{images.length} images · <span style={{color:C.green}}>{doneCount} uploaded this session</span>{errCount>0&&<span style={{color:C.red}}> · {errCount} errors</span>}</p>
          </div>
        </div>
        <Card style={{padding:"14px 16px",borderColor:"rgba(201,168,76,0.3)",background:"rgba(201,168,76,0.04)"}}>
          <p style={{color:C.gold,fontSize:"0.72rem",marginBottom:"4px"}}>ℹ How it works</p>
          <p style={{color:C.textSec,fontSize:"0.68rem",lineHeight:1.7}}>Drop or click a 4K file on any image card below. It uploads to <code style={{color:C.purple}}>high-res/{"{slug}"}/{"{slug}"}-4k.ext</code> on R2 and updates the database. Users downloading that wallpaper will now receive the 4K version via signed URL. Images already with a 4K file are marked <span style={{color:C.green}}>✓ 4K</span>.</p>
        </Card>
        <Msg msg={overallMsg}/>
        {loadingImgs
          ?<p style={{color:C.textSec,textAlign:"center",padding:"40px"}}>Loading images…</p>
          :images.length===0
            ?<Card style={{padding:"32px",textAlign:"center"}}><p style={{color:C.textMut}}>No images found in this collection.</p></Card>
            :<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:"14px"}}>
              {images.map(img=>{
                const st=uploadStates[img.id]??{state:"idle"};
                const already4k=has4k(img);
                const borderColor=st.state==="done"?C.green:st.state==="err"?C.red:already4k?"rgba(76,175,80,0.4)":C.border;
                return<div key={img.id} style={{border:`1px solid ${borderColor}`,background:C.surface,transition:"border-color 0.3s"}}>
                  <div style={{position:"relative",aspectRatio:"9/16",background:"#0d0b14",overflow:"hidden"}}>
                    <img src={thumbUrl(img.r2Key)} alt={img.title} style={{width:"100%",height:"100%",objectFit:"cover",display:"block",opacity:st.state==="uploading"?0.4:1,transition:"opacity 0.3s"}} onError={e=>{(e.target as HTMLImageElement).style.display="none";}}/>
                    {st.state==="uploading"&&<div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.6)",gap:"8px"}}><div style={{fontSize:"1.6rem"}}>⏳</div><p style={{color:C.gold,fontSize:"0.6rem",fontFamily:"monospace"}}>Uploading…</p></div>}
                    {st.state==="done"&&<div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"rgba(76,175,80,0.25)",gap:"4px"}}><div style={{fontSize:"1.6rem"}}>✓</div><p style={{color:C.green,fontSize:"0.6rem",fontFamily:"monospace"}}>Uploaded!</p></div>}
                    {st.state==="err"&&<div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"rgba(192,0,26,0.35)",gap:"4px",padding:"8px"}}><div style={{fontSize:"1.4rem"}}>✗</div><p style={{color:"#ff8080",fontSize:"0.58rem",fontFamily:"monospace",textAlign:"center",wordBreak:"break-word"}}>{st.msg}</p></div>}
                    {(already4k||st.state==="done")&&<span style={{position:"absolute",top:"6px",right:"6px",background:"rgba(76,175,80,0.9)",color:"#fff",fontSize:"0.5rem",fontFamily:"monospace",fontWeight:900,padding:"2px 6px",letterSpacing:"0.05em"}}>✓ 4K</span>}
                    {img.deviceType&&<span style={{position:"absolute",top:"6px",left:"6px",background:"rgba(0,0,0,0.7)",color:C.gold,fontSize:"0.5rem",fontFamily:"monospace",padding:"2px 6px"}}>{img.deviceType}</span>}
                  </div>
                  <div style={{padding:"10px"}}>
                    <p style={{color:C.textPri,fontSize:"0.7rem",fontWeight:600,lineHeight:1.3,marginBottom:"6px",wordBreak:"break-word"}}>{img.title}</p>
                    <p style={{color:C.textMut,fontSize:"0.58rem",marginBottom:"8px",fontFamily:"monospace"}}>{img.slug}</p>
                    <label style={{display:"block",border:`2px dashed ${st.state==="done"||already4k?C.green:C.border}`,padding:"10px 8px",textAlign:"center",cursor:st.state==="uploading"?"not-allowed":"pointer",background:st.state==="uploading"?"rgba(255,255,255,0.02)":"transparent",transition:"all 0.2s"}}>
                      <input type="file" accept="image/*" style={{display:"none"}} disabled={st.state==="uploading"} onChange={e=>{const f=e.target.files?.[0];if(f)handleFileUpload(img,f);e.target.value="";}}/>
                      <p style={{color:st.state==="done"||already4k?C.green:C.textSec,fontSize:"0.62rem",fontFamily:"monospace",lineHeight:1.5}}>
                        {st.state==="uploading"?"Uploading…":st.state==="done"?"✓ Replace 4K":already4k?"✓ Has 4K — click to replace":"📁 Drop 4K file here"}
                      </p>
                      {!already4k&&st.state==="idle"&&<p style={{color:C.textMut,fontSize:"0.55rem",marginTop:"3px"}}>JPG · PNG · WEBP</p>}
                    </label>
                  </div>
                </div>;
              })}
            </div>
        }
      </div>
    }
  </div>;
}

function PinTab({password}:{password:string}){
  const DEVICES=["IPHONE","ANDROID","PC"] as const;
  type DeviceType=typeof DEVICES[number];
  const[device,setDevice]=useState<DeviceType>("IPHONE");
  const[search,setSearch]=useState("");
  const[images,setImages]=useState<ImageRecord[]>([]);
  const[pinned,setPinned]=useState<ImageRecord[]>([]);
  const[loading,setLoading]=useState(false);
  const[saving,setSaving]=useState<string|null>(null);
  const[msg,setMsg]=useState<{type:"ok"|"err";text:string}|null>(null);

  const load=useCallback(async()=>{
    setLoading(true);setMsg(null);
    try{
      const qs=new URLSearchParams({device,page:"1",limit:"60",...(search?{q:search}:{})});
      const res=await fetch(`/api/hw-admin/images?${qs}`,{headers:{"x-admin-password":password}});
      if(!res.ok)throw new Error("Failed");
      const data=await res.json();
      const all:ImageRecord[]=data.images??[];
      setPinned(all.filter((i:ImageRecord)=>typeof i.sortOrder==="number"&&i.sortOrder<0).sort((a,b)=>(a.sortOrder??0)-(b.sortOrder??0)));
      setImages(all.filter((i:ImageRecord)=>!i.sortOrder||i.sortOrder>=0));
    }catch{setMsg({type:"err",text:"Could not load images."});}
    setLoading(false);
  },[device,search,password]);

  useEffect(()=>{load();},[load]);

  async function pin(img:ImageRecord,slot:number){
    setSaving(img.id);setMsg(null);
    const so=(slot-4);
    try{
      const res=await fetch(`/api/hw-admin/images/${img.id}`,{method:"PATCH",headers:{"Content-Type":"application/json","x-admin-password":password},body:JSON.stringify({sortOrder:so})});
      if(!res.ok)throw new Error("Failed");
      setMsg({type:"ok",text:`✓ Pinned "${img.title}" as #${slot} for ${device}`});
      load();
    }catch{setMsg({type:"err",text:"Pin failed."});}
    setSaving(null);
  }

  async function unpin(img:ImageRecord){
    setSaving(img.id);setMsg(null);
    try{
      const res=await fetch(`/api/hw-admin/images/${img.id}`,{method:"PATCH",headers:{"Content-Type":"application/json","x-admin-password":password},body:JSON.stringify({sortOrder:0})});
      if(!res.ok)throw new Error("Failed");
      setMsg({type:"ok",text:`✓ Unpinned "${img.title}"`});
      load();
    }catch{setMsg({type:"err",text:"Unpin failed."});}
    setSaving(null);
  }

  const deviceLabel:Record<DeviceType,string>={IPHONE:"iPhone",ANDROID:"Android",PC:"PC"};

  return<div>
    <Card style={{padding:"14px 18px",marginBottom:"20px",borderColor:C.red}}>
      <strong style={{color:C.gold}}>📌 Pin Wallpapers — The Most Haunted</strong>
      <span style={{color:C.textSec,marginLeft:"8px",fontSize:"0.82rem"}}>Pin up to 3 wallpapers per device. They appear at the top of the listing page under &quot;The Most Haunted&quot; heading.</span>
    </Card>
    <div style={{display:"flex",gap:"8px",marginBottom:"20px"}}>
      {DEVICES.map(d=><button key={d} onClick={()=>{setDevice(d);setSearch("");}} style={{background:device===d?C.red:"transparent",border:`1px solid ${device===d?C.red:C.border}`,color:device===d?"#fff":C.textSec,padding:"8px 20px",cursor:"pointer",fontSize:"0.72rem",fontFamily:"monospace",letterSpacing:"0.08em",textTransform:"uppercase"}}>{deviceLabel[d]}</button>)}
    </div>
    <Msg msg={msg}/>
    <Card style={{marginBottom:"24px"}}>
      <p style={eyebrow}>Currently Pinned — {deviceLabel[device]} (max 3)</p>
      {pinned.length===0
        ?<p style={{color:C.textMut,fontSize:"0.78rem",padding:"12px 0"}}>No wallpapers pinned for {deviceLabel[device]} yet. Search below and click a slot to pin.</p>
        :<div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"12px",marginTop:"12px"}}>
          {[1,2,3].map(slot=>{
            const img=pinned.find(p=>p.sortOrder===(slot-4));
            return<div key={slot} style={{border:`1px solid ${img?C.red:C.border}`,padding:"12px",textAlign:"center",background:img?"rgba(192,0,26,0.06)":"rgba(255,255,255,0.01)"}}>
              <p style={{color:C.textMut,fontSize:"0.58rem",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:"8px"}}>Slot #{slot}</p>
              {img
                ?<>
                  <p style={{color:C.textPri,fontSize:"0.78rem",marginBottom:"8px",lineHeight:1.3,overflow:"hidden",textOverflow:"ellipsis",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical" as const}}>{img.title}</p>
                  <img src={`https://pub-ba82ea76f3604402b8760527cc87149c.r2.dev/${img.r2Key}`} alt={img.title} style={{width:"100%",aspectRatio:device==="PC"?"16/9":"9/16",objectFit:"cover",marginBottom:"8px",maxHeight:device==="PC"?"90px":"140px"}}/>
                  <Btn variant="danger" onClick={()=>unpin(img)} disabled={saving===img.id} style={{width:"100%",fontSize:"0.62rem",padding:"6px"}}>{saving===img.id?"…":"Unpin"}</Btn>
                </>
                :<p style={{color:C.textMut,fontSize:"0.7rem",padding:"20px 0"}}>Empty</p>
              }
            </div>;
          })}
        </div>
      }
    </Card>
    <Card>
      <p style={eyebrow}>Search & Pin a Wallpaper</p>
      <div style={{display:"flex",gap:"8px",marginBottom:"16px"}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} onKeyDown={e=>e.key==="Enter"&&load()} placeholder="Search by title…" style={{...inp,flex:1,fontSize:"0.8rem"}}/>
        <Btn onClick={load} disabled={loading}>{loading?"…":"Search"}</Btn>
      </div>
      {images.length===0&&!loading&&<p style={{color:C.textMut,fontSize:"0.78rem"}}>No results.</p>}
      <div style={{display:"flex",flexDirection:"column",gap:"6px",maxHeight:"480px",overflowY:"auto"}}>
        {images.map(img=><div key={img.id} style={{display:"flex",alignItems:"center",gap:"12px",padding:"10px",border:`1px solid ${C.border}`,background:"rgba(255,255,255,0.01)"}}>
          <img src={`https://pub-ba82ea76f3604402b8760527cc87149c.r2.dev/${img.r2Key}`} alt={img.title} style={{flexShrink:0,width:device==="PC"?"80px":"44px",height:device==="PC"?"45px":"80px",objectFit:"cover",borderRadius:"2px"}}/>
          <div style={{flex:1,minWidth:0}}>
            <p style={{color:C.textPri,fontSize:"0.82rem",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{img.title}</p>
            <p style={{color:C.textMut,fontSize:"0.62rem",marginTop:"2px"}}>{img.tags?.slice(0,3).join(", ")}</p>
          </div>
          <div style={{display:"flex",gap:"6px",flexShrink:0}}>
            {[1,2,3].map(slot=><button key={slot} onClick={()=>pin(img,slot)} disabled={!!saving} style={{background:"rgba(192,0,26,0.12)",border:`1px solid rgba(192,0,26,0.4)`,color:C.red,padding:"5px 10px",cursor:saving?"not-allowed":"pointer",fontSize:"0.65rem",fontFamily:"monospace",opacity:saving?0.5:1}}>#{slot}</button>)}
          </div>
        </div>)}
      </div>
    </Card>
  </div>;
}

function NukeTab({password}:{password:string}){
  const PHRASE="DELETE EVERYTHING";
  const[input,setInput]=useState("");
  const[nuking,setNuking]=useState(false);
  const[result,setResult]=useState<{type:"ok"|"err";text:string}|null>(null);
  const[armed,setArmed]=useState(false);

  async function handleNuke(){
    if(input!==PHRASE){setResult({type:"err",text:`Type exactly: ${PHRASE}`});return;}
    if(!armed){setArmed(true);setResult({type:"err",text:"⚠ Click NUKE again to confirm. This is irreversible."});return;}
    setNuking(true);setResult(null);
    try{
      const res=await fetch("/api/hw-admin/nuke-all",{method:"POST",headers:{"Content-Type":"application/json","x-admin-password":password},body:JSON.stringify({confirmPhrase:PHRASE})});
      const j=await res.json();
      if(res.ok){setResult({type:"ok",text:`✓ Done. Deleted ${j.db.imagesDeleted} images, ${j.db.collectionsDeleted} collections, ${j.db.downloadsDeleted} downloads from DB. R2: ${j.r2.deleted} files deleted, ${j.r2.errors} errors.`});setArmed(false);setInput("");}
      else setResult({type:"err",text:j.error??"Nuke failed."});
    }catch{setResult({type:"err",text:"Network error."});}
    setNuking(false);
  }

  return<div style={{maxWidth:"560px",display:"flex",flexDirection:"column",gap:"20px"}}>
    <Card style={{padding:"20px",borderColor:C.red,background:"rgba(192,0,26,0.08)"}}>
      <p style={{color:C.red,fontSize:"0.85rem",fontWeight:600,marginBottom:"8px"}}>💣 Nuke Everything</p>
      <p style={{color:C.textSec,fontSize:"0.78rem",lineHeight:1.7}}>This permanently deletes <strong style={{color:C.textPri}}>all images, all collections, and all download records</strong> from the database, and wipes every file from R2 storage.</p>
      <p style={{color:C.red,fontSize:"0.72rem",marginTop:"8px",lineHeight:1.6}}>⚠ There is no undo. Back up your database before proceeding.</p>
    </Card>
    <Msg msg={result}/>
    <Card style={{padding:"16px"}}>
      <label style={lbl}>Type <code style={{color:C.red,background:"rgba(192,0,26,0.15)",padding:"2px 6px"}}>{PHRASE}</code> to unlock</label>
      <input value={input} onChange={e=>{setInput(e.target.value);setArmed(false);}} placeholder={PHRASE} style={{...inp,borderColor:input===PHRASE?C.red:C.border,color:input===PHRASE?C.red:C.textPri}}/>
    </Card>
    <button onClick={handleNuke} disabled={nuking||input!==PHRASE} style={{padding:"14px 32px",background:input===PHRASE?"rgba(192,0,26,0.9)":"rgba(80,0,0,0.3)",border:`1px solid ${input===PHRASE?C.red:"rgba(80,0,0,0.5)"}`,color:input===PHRASE?C.white:"rgba(255,255,255,0.3)",cursor:input===PHRASE&&!nuking?"pointer":"not-allowed",fontSize:"0.85rem",fontFamily:"monospace",letterSpacing:"0.12em",fontWeight:700,transition:"all 0.2s"}}>
      {nuking?"💣 NUKING…":armed?"💣 CONFIRM — NUKE EVERYTHING":"💣 NUKE EVERYTHING"}
    </button>
  </div>;
}

function CommentsTab({password}:{password:string}){
  const[comments,setComments]=useState<{id:string;name:string;message:string;status:string;likes:number;createdAt:string;ipHash:string|null;image:{slug:string;title:string}|null}[]>([]);
  const[loading,setLoading]=useState(true);const[filter,setFilter]=useState<"pending"|"approved"|"all">("pending");const[msg,setMsg]=useState<{type:"ok"|"err";text:string}|null>(null);const[acting,setActing]=useState<string|null>(null);

  const load=useCallback(async()=>{
    setLoading(true);setMsg(null);
    try{
      const urls=filter==="all"?["/api/admin/comments?status=pending","/api/admin/comments?status=approved"]:[`/api/admin/comments?status=${filter}`];
      const results=await Promise.all(urls.map(u=>fetch(u,{headers:{"x-admin-password":password}}).then(r=>r.json())));
      setComments(results.flat());
    }catch{setMsg({type:"err",text:"Failed to load comments."});}
    setLoading(false);
  },[filter,password]);

  useEffect(()=>{load();},[load]);

  async function act(id:string,action:"approve"|"delete"){
    setActing(id);setMsg(null);
    try{
      const res=await fetch("/api/admin/comments",{method:"PATCH",headers:{"Content-Type":"application/json","x-admin-password":password},body:JSON.stringify({id,action})});
      if(res.ok){setMsg({type:"ok",text:action==="approve"?"✓ Wish approved and is now public!":"✓ Wish deleted."});setComments(prev=>prev.filter(c=>c.id!==id));}
      else setMsg({type:"err",text:"Action failed."});
    }catch{setMsg({type:"err",text:"Network error."});}
    setActing(null);
  }

  const pending=comments.filter(c=>c.status==="pending");
  const approved=comments.filter(c=>c.status==="approved");
  const shown=filter==="pending"?pending:filter==="approved"?approved:comments;

  return<div style={{display:"flex",flexDirection:"column",gap:"20px"}}>
    <Card style={{padding:"14px 18px",borderColor:"rgba(201,168,76,0.4)",background:"rgba(201,168,76,0.05)"}}>
      <strong style={{color:C.gold}}>💬 Birthday Wishes Moderation</strong>
      <span style={{color:C.textSec,marginLeft:"8px",fontSize:"0.82rem"}}>Approve or delete visitor wishes before they go public.</span>
    </Card>
    <Msg msg={msg}/>
    <div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}>
      {(["pending","approved","all"] as const).map(f=><button key={f} onClick={()=>setFilter(f)} style={{background:filter===f?"rgba(192,0,26,0.15)":"transparent",border:`1px solid ${filter===f?C.red:C.border}`,color:filter===f?C.textPri:C.textSec,padding:"8px 18px",cursor:"pointer",fontSize:"0.72rem",fontFamily:"monospace",letterSpacing:"0.08em",textTransform:"uppercase"}}>{f==="pending"?`⏳ Pending (${pending.length})`:f==="approved"?`✓ Approved (${approved.length})`:"All"}</button>)}
      <button onClick={load} style={{background:"transparent",border:`1px solid ${C.border}`,color:C.textSec,padding:"8px 14px",cursor:"pointer",fontSize:"0.72rem",fontFamily:"monospace",marginLeft:"auto"}}>↻ Refresh</button>
    </div>
    {loading&&<p style={{color:C.textSec,padding:"32px 0",textAlign:"center"}}>Loading wishes…</p>}
    {!loading&&shown.length===0&&<Card style={{padding:"48px",textAlign:"center"}}><p style={{color:C.textMut,fontSize:"0.85rem"}}>No {filter} wishes found.</p></Card>}
    {!loading&&shown.map(c=><Card key={c.id} style={{padding:"18px 20px",borderColor:c.status==="pending"?"rgba(201,168,76,0.3)":C.border,background:c.status==="pending"?"rgba(201,168,76,0.04)":C.surface}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:"16px",flexWrap:"wrap"}}>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"8px",flexWrap:"wrap"}}>
            <span style={{color:C.textPri,fontSize:"0.85rem",fontWeight:600}}>{c.name}</span>
            <span style={{color:C.textMut,fontSize:"0.65rem",fontFamily:"monospace"}}>{new Date(c.createdAt).toLocaleString()}</span>
            <span style={{background:c.status==="pending"?"rgba(201,168,76,0.15)":"rgba(76,175,80,0.15)",border:`1px solid ${c.status==="pending"?C.gold:C.green}`,color:c.status==="pending"?C.gold:C.green,fontSize:"0.6rem",padding:"2px 8px",fontFamily:"monospace",textTransform:"uppercase"}}>{c.status}</span>
            <span style={{color:C.textMut,fontSize:"0.65rem"}}>♥ {c.likes}</span>
          </div>
          <p style={{color:C.textSec,fontSize:"0.88rem",lineHeight:1.65,fontStyle:"italic",margin:"0 0 8px"}}>"{c.message}"</p>
          {c.image&&<p style={{color:C.textMut,fontSize:"0.65rem",fontFamily:"monospace"}}>On: <a href={`/iphone/${c.image.slug}`} target="_blank" rel="noopener noreferrer" style={{color:C.gold,textDecoration:"none"}}>{c.image.title}</a></p>}
        </div>
        <div style={{display:"flex",gap:"8px",flexShrink:0}}>
          {c.status==="pending"&&<Btn onClick={()=>act(c.id,"approve")} disabled={acting===c.id} variant="success" style={{fontSize:"0.68rem",padding:"8px 14px"}}>{acting===c.id?"…":"✓ Approve"}</Btn>}
          <Btn onClick={()=>act(c.id,"delete")} disabled={acting===c.id} variant="danger" style={{fontSize:"0.68rem",padding:"8px 14px"}}>{acting===c.id?"…":"✕ Delete"}</Btn>
        </div>
      </div>
    </Card>)}
  </div>;
}

const ALL_LW_TAGS=["dark","gothic","horror","fantasy","amoled","neon","cyberpunk","nature","abstract","skull","moon","forest","city","demon","anime","fire","space","ocean","aesthetic","minimal"];

function LiveWallpapersTab({password}:{password:string}){
  const[view,setView]=useState<"upload"|"manage">("upload");
  const[videoFile,setVideoFile]=useState<File|null>(null);const[thumbFile,setThumbFile]=useState<File|null>(null);const[title,setTitle]=useState("");const[slug,setSlug]=useState("");const[description,setDescription]=useState("");const[hasSound,setHasSound]=useState(false);const[tags,setTags]=useState<string[]>([]);const[uploading,setUploading]=useState(false);const[uploadMsg,setUploadMsg]=useState<{type:"ok"|"err";text:string}|null>(null);const[progress,setProgress]=useState("");
  const[items,setItems]=useState<{id:string;slug:string;title:string;videoUrl:string;thumbnailUrl:string|null;hasSound:boolean;tags:string[];viewCount:number;isPublished:boolean;createdAt:string}[]>([]);const[loadingList,setLoadingList]=useState(false);const[manageMsg,setManageMsg]=useState<{type:"ok"|"err";text:string}|null>(null);const[acting,setActing]=useState<string|null>(null);
  const videoInputRef=useRef<HTMLInputElement>(null);const thumbInputRef=useRef<HTMLInputElement>(null);

  function handleTitleChange(v:string){setTitle(v);setSlug(v.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,""));}
  function toggleTag(tag:string){setTags(prev=>prev.includes(tag)?prev.filter(t=>t!==tag):[...prev,tag]);}

  async function handleUpload(){
    if(!videoFile||!title||!slug){setUploadMsg({type:"err",text:"Video file, title, and slug are required."});return;}
    setUploading(true);setUploadMsg(null);setProgress("Uploading to R2…");
    try{const form=new FormData();form.append("file",videoFile);if(thumbFile)form.append("thumbnail",thumbFile);form.append("title",title);form.append("slug",slug);form.append("description",description);form.append("hasSound",String(hasSound));form.append("tags",JSON.stringify(tags));
      const res=await fetch("/api/hw-admin/live-wallpapers/upload",{method:"POST",headers:{"x-admin-password":password},body:form});const json=await res.json();
      if(!res.ok)throw new Error(json.error??"Upload failed");
      setUploadMsg({type:"ok",text:`✓ "${title}" uploaded!`});setTitle("");setSlug("");setDescription("");setVideoFile(null);setThumbFile(null);setHasSound(false);setTags([]);setProgress("");
      if(videoInputRef.current)videoInputRef.current.value="";if(thumbInputRef.current)thumbInputRef.current.value="";
    }catch(e){setUploadMsg({type:"err",text:e instanceof Error?e.message:"Upload failed."});setProgress("");}
    setUploading(false);
  }

  async function loadManage(){setLoadingList(true);try{const res=await fetch("/api/hw-admin/live-wallpapers/manage",{headers:{"x-admin-password":password}});if(!res.ok)throw new Error("Failed");setItems(await res.json());}catch{setManageMsg({type:"err",text:"Could not load live wallpapers."});}setLoadingList(false);}
  useEffect(()=>{if(view==="manage")loadManage();},[view]);

  async function togglePublish(item:{id:string;title:string;isPublished:boolean}){
    setActing(item.id);
    try{const res=await fetch("/api/hw-admin/live-wallpapers/manage",{method:"PATCH",headers:{"Content-Type":"application/json","x-admin-password":password},body:JSON.stringify({id:item.id,isPublished:!item.isPublished})});
      if(!res.ok)throw new Error("Failed");setItems(prev=>prev.map(w=>w.id===item.id?{...w,isPublished:!w.isPublished}:w));}catch{setManageMsg({type:"err",text:"Could not update."});}setActing(null);
  }

  async function deleteItem(item:{id:string;title:string}){
    if(!confirm(`Delete "${item.title}"? Removes from R2 and database.`))return;setActing(item.id);
    try{const res=await fetch("/api/hw-admin/live-wallpapers/manage",{method:"DELETE",headers:{"Content-Type":"application/json","x-admin-password":password},body:JSON.stringify({id:item.id})});
      if(!res.ok)throw new Error("Failed");setItems(prev=>prev.filter(w=>w.id!==item.id));setManageMsg({type:"ok",text:`"${item.title}" deleted.`});}catch{setManageMsg({type:"err",text:"Delete failed."});}setActing(null);
  }

  return<div>
    <div style={{display:"flex",gap:"8px",marginBottom:"28px"}}>
      {(["upload","manage"] as const).map(v=><button key={v} onClick={()=>setView(v)} style={{background:view===v?C.red:"transparent",border:`1px solid ${view===v?C.red:C.border}`,color:view===v?"#fff":C.textSec,padding:"9px 22px",cursor:"pointer",fontSize:"0.72rem",fontFamily:"monospace",letterSpacing:"0.1em",textTransform:"uppercase"}}>{v==="upload"?"📤 Upload":"📋 Manage"}</button>)}
      <a href="/live-wallpapers" target="_blank" rel="noopener noreferrer" style={{marginLeft:"auto",color:C.textMut,fontSize:"0.7rem",fontFamily:"monospace",textDecoration:"none",display:"flex",alignItems:"center"}}>View Feed →</a>
    </div>
    {view==="upload"&&<div style={{display:"flex",flexDirection:"column",gap:"20px",maxWidth:"640px"}}>
      <Card style={{borderColor:"rgba(124,58,237,0.3)",background:"rgba(124,58,237,0.04)",padding:"14px 18px"}}><strong style={{color:C.purple}}>🎬 Live Wallpaper Upload</strong><span style={{color:C.textSec,marginLeft:"8px",fontSize:"0.82rem"}}>MP4, H.264, portrait 9:16, under 30MB</span></Card>
      <Msg msg={uploadMsg}/>
      <Card style={{padding:"16px"}}><label style={lbl}>MP4 Video File *</label><input ref={videoInputRef} type="file" accept="video/mp4,video/*" onChange={e=>setVideoFile(e.target.files?.[0]??null)} style={{...inp,padding:"8px"}}/>{videoFile&&<p style={{color:C.textMut,fontSize:"0.72rem",marginTop:"6px",fontFamily:"monospace"}}>{videoFile.name} — {(videoFile.size/1024/1024).toFixed(1)} MB</p>}</Card>
      <Card style={{padding:"16px"}}><label style={lbl}>Poster / Thumbnail Image (optional)</label><input ref={thumbInputRef} type="file" accept="image/*" onChange={e=>setThumbFile(e.target.files?.[0]??null)} style={{...inp,padding:"8px"}}/></Card>
      <Card style={{padding:"16px"}}><label style={lbl}>Title *</label><input style={inp} value={title} onChange={e=>handleTitleChange(e.target.value)} placeholder="Dark Abyss Loop"/></Card>
      <Card style={{padding:"16px"}}><label style={lbl}>Slug * (auto-generated)</label><input style={inp} value={slug} onChange={e=>setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g,""))} placeholder="dark-abyss-loop"/></Card>
      <Card style={{padding:"16px"}}><label style={lbl}>Description (optional)</label><textarea style={{...inp,minHeight:"80px",resize:"vertical"}} value={description} onChange={e=>setDescription(e.target.value)} placeholder="A looping dark animated wallpaper…"/></Card>
      <Card style={{padding:"16px"}}><label style={lbl}>Tags</label><div style={{display:"flex",flexWrap:"wrap",gap:"6px"}}>{ALL_LW_TAGS.map(tag=><button key={tag} type="button" onClick={()=>toggleTag(tag)} style={{background:tags.includes(tag)?"rgba(192,0,26,0.2)":"transparent",border:`1px solid ${tags.includes(tag)?C.red:C.border}`,color:tags.includes(tag)?C.red:C.textSec,padding:"4px 10px",cursor:"pointer",fontSize:"0.68rem",fontFamily:"monospace"}}>{tag}</button>)}</div></Card>
      <Card style={{padding:"16px"}}><label style={lbl}>Audio</label><div style={{display:"flex",alignItems:"center",gap:"12px"}}><input type="checkbox" id="lw-sound" checked={hasSound} onChange={e=>setHasSound(e.target.checked)} style={{cursor:"pointer",width:"16px",height:"16px"}}/><label htmlFor="lw-sound" style={{color:C.textSec,fontSize:"0.82rem",cursor:"pointer"}}>This video has sound / music</label></div></Card>
      {progress&&<p style={{color:C.gold,fontSize:"0.8rem",fontFamily:"monospace"}}>{progress}</p>}
      <Btn onClick={handleUpload} disabled={uploading||!videoFile||!title||!slug} style={{alignSelf:"flex-start"}}>{uploading?"Uploading…":"Upload Live Wallpaper"}</Btn>
    </div>}
    {view==="manage"&&<div style={{display:"flex",flexDirection:"column",gap:"16px"}}>
      <Msg msg={manageMsg}/>
      <div style={{display:"flex",justifyContent:"flex-end"}}><Btn variant="ghost" onClick={loadManage} disabled={loadingList}>↻ Refresh</Btn></div>
      {loadingList&&<p style={{color:C.textSec,padding:"40px 0",textAlign:"center"}}>Loading…</p>}
      {!loadingList&&items.length===0&&<Card style={{padding:"48px",textAlign:"center"}}><p style={{color:C.textMut}}>No live wallpapers uploaded yet.</p></Card>}
      {items.map(item=><Card key={item.id} style={{padding:"16px 20px"}}>
        <div style={{display:"flex",gap:"16px",alignItems:"flex-start"}}>
          {item.thumbnailUrl?<img src={item.thumbnailUrl} alt={item.title} style={{width:"56px",height:"100px",objectFit:"cover",flexShrink:0,border:`1px solid ${C.border}`}}/>:<div style={{width:"56px",height:"100px",background:"#0a0812",border:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"center",color:C.textMut,fontSize:"1.4rem",flexShrink:0}}>🎬</div>}
          <div style={{flex:1,minWidth:0}}>
            <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"6px",flexWrap:"wrap"}}>
              <span style={{color:C.textPri,fontWeight:600,fontSize:"0.88rem"}}>{item.title}</span>
              {item.hasSound&&<span style={{fontSize:"0.6rem",color:C.gold}}>🎵 sound</span>}
              <span style={{background:item.isPublished?"rgba(76,175,80,0.15)":"rgba(192,0,26,0.15)",border:`1px solid ${item.isPublished?C.green:C.red}`,color:item.isPublished?C.green:C.red,fontSize:"0.58rem",padding:"2px 8px",fontFamily:"monospace",textTransform:"uppercase"}}>{item.isPublished?"Published":"Hidden"}</span>
            </div>
            <p style={{color:C.textMut,fontFamily:"monospace",fontSize:"0.65rem",margin:"0 0 4px"}}>{item.slug} · {item.viewCount} views · {new Date(item.createdAt).toLocaleDateString()}</p>
            <div style={{display:"flex",gap:"4px",flexWrap:"wrap"}}>{item.tags.map(t=><span key={t} style={{color:C.textMut,fontSize:"0.62rem",fontFamily:"monospace"}}>#{t}</span>)}</div>
          </div>
          <div style={{display:"flex",gap:"8px",flexShrink:0}}>
            <Btn onClick={()=>togglePublish(item)} disabled={acting===item.id} variant={item.isPublished?"ghost":"success"} style={{fontSize:"0.65rem",padding:"7px 12px"}}>{acting===item.id?"…":item.isPublished?"Hide":"Publish"}</Btn>
            <a href={item.videoUrl} target="_blank" rel="noopener noreferrer" style={{background:"transparent",border:`1px solid ${C.border}`,color:C.textSec,padding:"7px 12px",fontSize:"0.65rem",fontFamily:"monospace",textDecoration:"none",letterSpacing:"0.08em",textTransform:"uppercase"}}>Preview</a>
            <Btn onClick={()=>deleteItem(item)} disabled={acting===item.id} variant="danger" style={{fontSize:"0.65rem",padding:"7px 12px"}}>{acting===item.id?"…":"Delete"}</Btn>
          </div>
        </div>
      </Card>)}
    </div>}
  </div>;
}

interface VisitorPage    { path:string; duration:number|null; enteredAt:string; }
interface VisitorEvent   { type:string; path:string; meta:Record<string,unknown>|null; createdAt:string; }
interface LiveVisitor    { id:string; device:string|null; country:string|null; path:string; lastSeen:string; }
interface SessionRow     { id:string; device:string|null; country:string|null; firstSeen:string; lastSeen:string; pageCount:number; totalDuration:number; pages:VisitorPage[]; events:VisitorEvent[]; }
interface TopPage        { path:string; views:number; avgDuration:number; }
interface TrafficSource  { source:string; count:number; }
interface RefererSample  { referer:string; createdAt:string; }
interface TrafficData    { downloadsToday:number; darkSocialToday:number; darkSocialPct:number; sourcesToday:TrafficSource[]; sourcesWeek:TrafficSource[]; refererSample:RefererSample[]; }
interface SharePlatform  { platform:string; count:number; }
interface ShareSlug      { slug:string; count:number; }
interface ShareData      { today:number; week:number; platforms:SharePlatform[]; topWallpapers:ShareSlug[]; }
interface VisitorsData   { liveCount:number; live:LiveVisitor[]; sessionsToday:number; sessions:SessionRow[]; topPages:TopPage[]; recentEvents:VisitorEvent[]; shares:ShareData; traffic:TrafficData; }

function fmtSecs(s:number|null|undefined):string{
  if(!s||s<=0)return"—";
  if(s<60)return`${s}s`;
  return`${Math.floor(s/60)}m ${s%60}s`;
}
function timeAgo(iso:string):string{
  const ms=Date.now()-new Date(iso).getTime();
  const m=Math.floor(ms/60000);
  if(m<1)return"just now";
  if(m<60)return`${m}m ago`;
  const h=Math.floor(m/60);
  if(h<24)return`${h}h ago`;
  return`${Math.floor(h/24)}d ago`;
}

function TrafficBar({source,count,max,isTop}:{source:string;count:number;max:number;isTop:boolean}){
  const pct=max>0?Math.round((count/max)*100):0;
  const isDark=source==="Direct / Dark Social";
  const color=isTop?C.red:isDark?"#7c3aed":C.gold;
  return<div style={{marginBottom:"10px"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:"4px"}}>
      <span style={{color:isDark?C.purple:C.textPri,fontSize:"0.8rem",fontWeight:isTop?700:400}}>{source}{isTop&&" 🏆"}</span>
      <span style={{color:color,fontSize:"0.78rem",fontWeight:700,flexShrink:0,marginLeft:"12px"}}>{count} download{count!==1?"s":""}</span>
    </div>
    <div style={{height:"4px",background:"rgba(255,255,255,0.06)",borderRadius:"2px"}}>
      <div style={{height:"100%",width:`${pct}%`,background:color,borderRadius:"2px",transition:"width 0.4s ease"}}/>
    </div>
  </div>;
}

function VisitorsTab({password}:{password:string}){
  const[data,setData]=useState<VisitorsData|null>(null);
  const[loading,setLoading]=useState(true);
  const[error,setError]=useState("");
  const[expanded,setExpanded]=useState<string|null>(null);
  const[autoRefresh,setAutoRefresh]=useState(true);
  const[trafficRange,setTrafficRange]=useState<"today"|"week">("today");
  const[showRawReferers,setShowRawReferers]=useState(false);
  const[shareRange,setShareRange]=useState<"today"|"week">("today");

  const load=useCallback(async()=>{
    try{
      const res=await fetch("/api/hw-admin/visitors",{headers:{"x-admin-password":password}});
      if(!res.ok)throw new Error("Failed");
      setData(await res.json());
      setError("");
    }catch{setError("Could not load visitor data.");}
    setLoading(false);
  },[password]);

  useEffect(()=>{load();},[load]);
  useEffect(()=>{
    if(!autoRefresh)return;
    const t=setInterval(load,15000);
    return()=>clearInterval(t);
  },[autoRefresh,load]);

  if(loading)return<p style={{color:C.textSec,padding:"40px 0",textAlign:"center"}}>Loading visitor data…</p>;
  if(error)return<p style={{color:C.red}}>{error}</p>;
  if(!data)return null;

  const t=data.traffic;
  const sh=data.shares;
  const activeSources=trafficRange==="today"?t.sourcesToday:t.sourcesWeek;
  const maxCount=activeSources[0]?.count??1;
  const knownSources=activeSources.filter(s=>s.source!=="Direct / Dark Social"&&s.source!=="Internal (own site)");
  const darkSocialRow=activeSources.find(s=>s.source==="Direct / Dark Social");

  return<div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
      <p style={{color:C.textMut,fontSize:"0.7rem"}}>First-party tracking (Session / PageView / AnalyticsEvent + Download.referer). Immune to ad-blockers. The Traffic Sources section answers why Google Search Console shows almost no clicks.</p>
      <label style={{display:"flex",alignItems:"center",gap:"6px",color:C.textMut,fontSize:"0.65rem",flexShrink:0,marginLeft:"16px",cursor:"pointer"}}>
        <input type="checkbox" checked={autoRefresh} onChange={e=>setAutoRefresh(e.target.checked)}/> Auto-refresh 15s
      </label>
    </div>

    {/* ── Summary cards ── */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:"12px",marginBottom:"24px"}}>
      <Card style={{textAlign:"center",padding:"20px 12px"}}><p style={{...eyebrow,marginBottom:"6px"}}>Live Now</p><p style={{color:C.green,fontSize:"1.8rem",fontWeight:700,lineHeight:1}}>{data.liveCount}</p><p style={{color:C.textMut,fontSize:"0.6rem",marginTop:"4px"}}>active in last 5 min</p></Card>
      <Card style={{textAlign:"center",padding:"20px 12px"}}><p style={{...eyebrow,marginBottom:"6px"}}>Sessions Today</p><p style={{color:C.red,fontSize:"1.8rem",fontWeight:700,lineHeight:1}}>{data.sessionsToday}</p><p style={{color:C.textMut,fontSize:"0.6rem",marginTop:"4px"}}>JS-tracked visitors</p></Card>
      <Card style={{textAlign:"center",padding:"20px 12px"}}><p style={{...eyebrow,marginBottom:"6px"}}>Downloads Today</p><p style={{color:C.gold,fontSize:"1.8rem",fontWeight:700,lineHeight:1}}>{t.downloadsToday}</p><p style={{color:C.textMut,fontSize:"0.6rem",marginTop:"4px"}}>from Download table</p></Card>
      <Card style={{textAlign:"center",padding:"20px 12px"}}><p style={{...eyebrow,marginBottom:"6px"}}>Dark Social</p><p style={{color:C.purple,fontSize:"1.8rem",fontWeight:700,lineHeight:1}}>{t.darkSocialPct}%</p><p style={{color:C.textMut,fontSize:"0.6rem",marginTop:"4px"}}>{t.darkSocialToday} no-referer</p></Card>
      <Card style={{textAlign:"center",padding:"20px 12px"}}><p style={{...eyebrow,marginBottom:"6px"}}>Share Clicks</p><p style={{color:"#4fc3f7",fontSize:"1.8rem",fontWeight:700,lineHeight:1}}>{sh.today}</p><p style={{color:C.textMut,fontSize:"0.6rem",marginTop:"4px"}}>{sh.week} this week</p></Card>
    </div>

    {/* ── Traffic Sources — the key panel ── */}
    <Card style={{marginBottom:"24px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
        <div>
          <p style={eyebrow}>🔍 Traffic Sources — where are downloaders coming from?</p>
          <p style={{color:C.textMut,fontSize:"0.68rem",marginTop:"4px",lineHeight:1.5}}>
            Based on the HTTP <code style={{color:C.purple}}>Referer</code> header logged on every download.
            {t.darkSocialPct>=50&&<span style={{color:C.purple}}> {t.darkSocialPct}% have no referer — strong signal of dark-social sharing (WhatsApp / Telegram / Discord / direct links).</span>}
            {t.darkSocialPct<50&&knownSources.length>0&&<span style={{color:C.gold}}> Top identified source: <strong>{knownSources[0]?.source}</strong>.</span>}
            {t.downloadsToday===0&&<span style={{color:C.textMut}}> No downloads yet today — check the Week view.</span>}
          </p>
        </div>
        <div style={{display:"flex",gap:"4px",flexShrink:0,marginLeft:"16px"}}>
          {(["today","week"] as const).map(r=><button key={r} onClick={()=>setTrafficRange(r)} style={{background:trafficRange===r?C.red:"transparent",border:`1px solid ${trafficRange===r?C.red:C.border}`,color:trafficRange===r?"#fff":C.textSec,padding:"5px 12px",cursor:"pointer",fontSize:"0.65rem",fontFamily:"monospace",letterSpacing:"0.08em",textTransform:"uppercase"}}>{r==="today"?"Today":"7 Days"}</button>)}
        </div>
      </div>

      {activeSources.length===0&&<p style={{color:C.textMut,fontSize:"0.78rem",padding:"12px 0"}}>No downloads in this period yet.</p>}

      {/* Dark social callout first if dominant */}
      {darkSocialRow&&<div style={{background:"rgba(124,58,237,0.08)",border:`1px solid rgba(124,58,237,0.3)`,padding:"12px 16px",marginBottom:"16px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"6px"}}>
          <span style={{color:C.purple,fontSize:"0.78rem",fontWeight:700}}>👻 Direct / Dark Social — {darkSocialRow.count} download{darkSocialRow.count!==1?"s":""}</span>
          <span style={{color:C.purple,fontSize:"0.72rem"}}>{Math.round((darkSocialRow.count/Math.max(t.downloadsToday,1))*100)}% of today</span>
        </div>
        <p style={{color:C.textMut,fontSize:"0.68rem",lineHeight:1.5,margin:0}}>
          No HTTP referer = the link was opened directly (typed, bookmarked, or pasted into a messaging app).
          WhatsApp, Telegram, iMessage, and Discord all strip the referer header — this is your dark-social traffic.
          Google Search Console will never show these. This is normal and expected if people are sharing your wallpapers.
        </p>
      </div>}

      {/* Known sources bar chart */}
      {activeSources.filter(s=>s.source!=="Direct / Dark Social").map((s,i)=>(
        <TrafficBar key={s.source} source={s.source} count={s.count} max={maxCount} isTop={i===0&&s.source!=="Internal (own site)"}/>
      ))}
      {darkSocialRow&&<TrafficBar source={darkSocialRow.source} count={darkSocialRow.count} max={maxCount} isTop={false}/>}

      {/* Diagnosis */}
      <div style={{marginTop:"16px",padding:"12px 14px",background:"rgba(255,255,255,0.02)",borderLeft:`3px solid ${C.border}`}}>
        <p style={{color:C.textMut,fontSize:"0.65rem",margin:0,lineHeight:1.7}}>
          <strong style={{color:C.textSec}}>How to read this:</strong>{" "}
          If "Direct / Dark Social" dominates → people are sharing links privately (WhatsApp groups, Discord servers, Telegram channels). Good sign.{" "}
          If a social platform appears → that's your actual referral source. Check it manually.{" "}
          If an unknown domain appears → it might be a wallpaper aggregator or scraper discovering your site — worth investigating.
        </p>
      </div>

      {/* Raw referer sample toggle */}
      {t.refererSample.length>0&&<>
        <button onClick={()=>setShowRawReferers(v=>!v)} style={{marginTop:"14px",background:"transparent",border:`1px solid ${C.border}`,color:C.textMut,padding:"6px 12px",cursor:"pointer",fontSize:"0.65rem",fontFamily:"monospace"}}>
          {showRawReferers?"▾ Hide":"▸ Show"} raw referer URLs ({t.refererSample.length} today)
        </button>
        {showRawReferers&&<div style={{marginTop:"10px"}}>
          {t.refererSample.map((r,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:`1px solid ${C.border}`,fontSize:"0.68rem",gap:"12px"}}>
            <code style={{color:C.textPri,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flex:1}}>{r.referer}</code>
            <span style={{color:C.textMut,flexShrink:0}}>{timeAgo(r.createdAt)}</span>
          </div>)}
        </div>}
      </>}
    </Card>

    {/* ── Share clicks panel ── */}
    <Card style={{marginBottom:"24px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
        <div>
          <p style={eyebrow}>🔗 Share Clicks — what people share &amp; where</p>
          <p style={{color:C.textMut,fontSize:"0.68rem",marginTop:"4px",lineHeight:1.5}}>
            Tracked when visitors click Pinterest, WhatsApp, X, or Copy Link on any wallpaper page.
            {sh.week===0&&<span style={{color:C.textMut}}> No shares recorded yet — buttons are live, waiting for first click.</span>}
            {sh.week>0&&sh.platforms[0]&&<span style={{color:"#4fc3f7"}}> Most used: <strong>{sh.platforms[0].platform}</strong> ({sh.platforms[0].count}×).</span>}
          </p>
        </div>
        <div style={{display:"flex",gap:"4px",flexShrink:0,marginLeft:"16px"}}>
          {(["today","week"] as const).map(r=><button key={r} onClick={()=>setShareRange(r)} style={{background:shareRange===r?C.red:"transparent",border:`1px solid ${shareRange===r?C.red:C.border}`,color:shareRange===r?"#fff":C.textSec,padding:"5px 12px",cursor:"pointer",fontSize:"0.65rem",fontFamily:"monospace",letterSpacing:"0.08em",textTransform:"uppercase"}}>{r==="today"?"Today":"7 Days"}</button>)}
        </div>
      </div>

      {sh.week===0&&<p style={{color:C.textMut,fontSize:"0.78rem",padding:"8px 0"}}>No share clicks recorded yet. The buttons are live — they&apos;ll appear here as soon as someone clicks.</p>}

      {sh.platforms.length>0&&<>
        <p style={{...eyebrow,marginBottom:"10px"}}>By platform</p>
        {(shareRange==="today"
          ? sh.platforms.map(p=>({...p,count:0})) // today breakdown not stored separately; fall back to week
          : sh.platforms
        ).length===0
          ? <p style={{color:C.textMut,fontSize:"0.75rem"}}>No shares yet today.</p>
          : sh.platforms.map((p,i)=>{
            const label:Record<string,string>={pinterest:"📌 Pinterest",x:"𝕏 Post on X",whatsapp:"💬 WhatsApp",copy_link:"🔗 Copy Link",native:"📤 Native Share",unknown:"❓ Unknown"};
            const color:Record<string,string>={pinterest:C.red,x:C.textPri,whatsapp:"#25d366",copy_link:"#4fc3f7",native:C.gold};
            const max=sh.platforms[0]?.count??1;
            return<div key={p.platform} style={{marginBottom:"10px"}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:"3px"}}>
                <span style={{color:color[p.platform]??C.textSec,fontSize:"0.8rem"}}>{label[p.platform]??p.platform}</span>
                <span style={{color:color[p.platform]??C.textSec,fontSize:"0.78rem",fontWeight:700}}>{p.count}×</span>
              </div>
              <div style={{height:"3px",background:"rgba(255,255,255,0.06)",borderRadius:"2px"}}>
                <div style={{height:"100%",width:`${Math.round((p.count/max)*100)}%`,background:color[p.platform]??C.textMut,borderRadius:"2px"}}/>
              </div>
            </div>;
          })
        }
      </>}

      {sh.topWallpapers.length>0&&<>
        <p style={{...eyebrow,marginTop:"16px",marginBottom:"10px"}}>Most shared wallpapers (7 days)</p>
        {sh.topWallpapers.map((w,i)=><div key={w.slug} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:`1px solid ${C.border}`,fontSize:"0.78rem"}}>
          <span style={{display:"flex",alignItems:"center",gap:"8px"}}>
            <span style={{color:C.textMut,fontSize:"0.65rem",minWidth:"16px"}}>{i+1}.</span>
            <code style={{color:C.textPri}}>{w.slug}</code>
          </span>
          <span style={{color:"#4fc3f7",fontWeight:700,flexShrink:0}}>{w.count} share{w.count!==1?"s":""}</span>
        </div>)}
        <p style={{color:C.textMut,fontSize:"0.65rem",marginTop:"10px",lineHeight:1.5}}>
          💡 Cross-reference these slugs with your Downloads Today data. High shares + high downloads on the same wallpaper = confirmed viral spread.
        </p>
      </>}
    </Card>

    {/* ── Live visitors ── */}
    <Card style={{marginBottom:"24px"}}>
      <p style={eyebrow}>👀 Live Now</p>
      {data.live.length===0&&<p style={{color:C.textMut,fontSize:"0.78rem",padding:"8px 0"}}>Nobody active in the last 5 minutes.</p>}
      {data.live.map(v=><div key={v.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${C.border}`,fontSize:"0.78rem"}}>
        <div style={{display:"flex",alignItems:"center",gap:"10px",minWidth:0}}>
          <span style={{width:"7px",height:"7px",borderRadius:"50%",background:C.green,flexShrink:0,boxShadow:`0 0 6px ${C.green}`}}/>
          <code style={{color:C.textMut,fontSize:"0.68rem"}}>{v.id}</code>
          <span style={{color:C.textSec,fontSize:"0.68rem"}}>{v.country??"?"} · {v.device??"?"}</span>
        </div>
        <code style={{color:C.textPri,fontSize:"0.72rem",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:"260px"}}>{v.path}</code>
      </div>)}
    </Card>

    {/* ── Top pages ── */}
    <Card style={{marginBottom:"24px"}}>
      <p style={eyebrow}>Top Pages Today — views &amp; average time spent</p>
      {data.topPages.length===0&&<p style={{color:C.textMut,fontSize:"0.78rem",padding:"8px 0"}}>No page views recorded yet today.</p>}
      {data.topPages.map((p,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${C.border}`,fontSize:"0.78rem"}}>
        <code style={{color:C.textPri,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flex:1,marginRight:"12px"}}>{p.path}</code>
        <span style={{display:"flex",gap:"16px",flexShrink:0}}>
          <span style={{color:C.gold}}>{p.views} views</span>
          <span style={{color:C.textSec}}>{fmtSecs(p.avgDuration)} avg</span>
        </span>
      </div>)}
    </Card>

    {/* ── Recent events ── */}
    <Card style={{marginBottom:"24px"}}>
      <p style={eyebrow}>Recent Activity — downloads, previews, favorites</p>
      {data.recentEvents.length===0&&<p style={{color:C.textMut,fontSize:"0.78rem",padding:"8px 0"}}>No events logged yet today.</p>}
      {data.recentEvents.map((e,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderBottom:`1px solid ${C.border}`,fontSize:"0.76rem"}}>
        <span style={{color:C.textPri}}>{e.type}</span>
        <code style={{color:C.textMut,fontSize:"0.66rem",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:"220px"}}>{e.path}</code>
        <span style={{color:C.textMut,fontSize:"0.66rem",flexShrink:0}}>{timeAgo(e.createdAt)}</span>
      </div>)}
    </Card>

    {/* ── Session list ── */}
    <Card>
      <p style={eyebrow}>Today&apos;s Sessions — {data.sessions.length} JS-tracked visitors, click to expand</p>
      <p style={{color:C.textMut,fontSize:"0.65rem",marginBottom:"12px",lineHeight:1.5}}>
        Note: This count is lower than Downloads Today because session tracking requires JavaScript to load first.
        Downloads that happen before hydration, or via shared direct links with no page visit, won&apos;t appear here.
      </p>
      {data.sessions.map(s=>{
        const isOpen=expanded===s.id;
        return<div key={s.id} style={{borderBottom:`1px solid ${C.border}`}}>
          <button onClick={()=>setExpanded(isOpen?null:s.id)} style={{width:"100%",display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",background:"transparent",border:"none",cursor:"pointer",textAlign:"left"}}>
            <span style={{display:"flex",alignItems:"center",gap:"10px"}}>
              <span style={{color:C.textMut,fontSize:"0.65rem"}}>{isOpen?"▾":"▸"}</span>
              <code style={{color:C.textSec,fontSize:"0.7rem"}}>{s.id}</code>
              <span style={{color:C.textMut,fontSize:"0.68rem"}}>{s.country??"?"} · {s.device??"?"}</span>
            </span>
            <span style={{display:"flex",gap:"16px",fontSize:"0.72rem"}}>
              <span style={{color:C.textSec}}>{s.pageCount} pages</span>
              <span style={{color:C.gold}}>{fmtSecs(s.totalDuration)} total</span>
              <span style={{color:C.textMut}}>{timeAgo(s.lastSeen)}</span>
            </span>
          </button>
          {isOpen&&<div style={{padding:"4px 0 14px 24px"}}>
            <p style={{...eyebrow,marginBottom:"6px"}}>Pages visited</p>
            {s.pages.map((p,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"4px 0",fontSize:"0.72rem"}}>
              <code style={{color:C.textPri}}>{p.path}</code>
              <span style={{color:C.textMut}}>{fmtSecs(p.duration)}</span>
            </div>)}
            {s.events.length>0&&<>
              <p style={{...eyebrow,marginTop:"10px",marginBottom:"6px"}}>Actions</p>
              {s.events.map((e,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"4px 0",fontSize:"0.72rem"}}>
                <span style={{color:C.red}}>{e.type}</span>
                <code style={{color:C.textMut}}>{e.path}</code>
              </div>)}
            </>}
          </div>}
        </div>;
      })}
    </Card>
  </div>;
}

interface ResidentRecord {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  story: string;
  personality: string;
  portraitKey: string;
  order: number;
  isPublished: boolean;
  createdAt: string;
}

function ResidentsTab({ password }: { password: string }) {
  const [residents, setResidents] = useState<ResidentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [view, setView] = useState<"list" | "create" | "edit">("list");
  const [selected, setSelected] = useState<ResidentRecord | null>(null);

  // Create form state
  const [cName, setCName] = useState("");
  const [cSlug, setCSlug] = useState("");
  const [cTagline, setCTagline] = useState("");
  const [cStory, setCStory] = useState("");
  const [cPersonality, setCPersonality] = useState("");
  const [cOrder, setCOrder] = useState(0);
  const [cSaving, setCsaving] = useState(false);

  // Edit form state
  const [eName, setEName] = useState("");
  const [eTagline, setETagline] = useState("");
  const [eStory, setEStory] = useState("");
  const [ePersonality, setEPersonality] = useState("");
  const [eOrder, setEOrder] = useState(0);
  const [eSaving, setEsaving] = useState(false);
  const [storyMode, setStoryMode] = useState<"html" | "preview">("html");
  const [personalityMode, setPersonalityMode] = useState<"html" | "preview">("html");

  // Portrait upload
  const portraitRef = useRef<HTMLInputElement>(null);
  const [portraitFile, setPortraitFile] = useState<File | null>(null);
  const [portraitPreview, setPortraitPreview] = useState("");
  const [portraitUploading, setPortraitUploading] = useState(false);

  const R2_BASE = process.env.NEXT_PUBLIC_R2_PUBLIC_URL ?? "https://pub-ba82ea76f3604402b8760527cc87149c.r2.dev";

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/hw-admin/residents", { headers: { "x-admin-password": password } });
      if (res.ok) { const j = await res.json(); setResidents(j.residents ?? []); }
    } catch { setMsg({ type: "err", text: "Failed to load residents." }); }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openEdit(r: ResidentRecord) {
    setSelected(r);
    setEName(r.name);
    setETagline(r.tagline);
    setEStory(r.story);
    setEPersonality(r.personality);
    setEOrder(r.order);
    setPortraitFile(null);
    setPortraitPreview(r.portraitKey ? `${R2_BASE}/${r.portraitKey}` : "");
    setStoryMode("html");
    setPersonalityMode("html");
    setMsg(null);
    setView("edit");
  }

  function openCreate() {
    setCName(""); setCSlug(""); setCTagline(""); setCStory(""); setCPersonality(""); setCOrder(residents.length);
    setMsg(null);
    setView("create");
  }

  function autoSlug(name: string) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  async function handleCreate() {
    if (!cName.trim() || !cSlug.trim() || !cTagline.trim()) { setMsg({ type: "err", text: "Name, slug, and tagline are required." }); return; }
    setCsaving(true); setMsg(null);
    try {
      const res = await fetch("/api/hw-admin/residents", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-password": password },
        body: JSON.stringify({ slug: cSlug.trim(), name: cName.trim(), tagline: cTagline.trim(), story: cStory, personality: cPersonality, order: cOrder }),
      });
      const j = await res.json();
      if (!res.ok) { setMsg({ type: "err", text: j.error ?? "Failed." }); setCsaving(false); return; }
      setMsg({ type: "ok", text: `✓ Resident "${cName}" created. Now upload their portrait.` });
      await load();
      openEdit(j.resident);
    } catch { setMsg({ type: "err", text: "Network error." }); }
    setCsaving(false);
  }

  async function handleSaveEdit() {
    if (!selected) return;
    setEsaving(true); setMsg(null);
    try {
      const res = await fetch("/api/hw-admin/residents", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-password": password },
        body: JSON.stringify({ slug: selected.slug, name: eName, tagline: eTagline, story: eStory, personality: ePersonality, order: eOrder }),
      });
      const j = await res.json();
      if (!res.ok) { setMsg({ type: "err", text: j.error ?? "Save failed." }); setEsaving(false); return; }
      setMsg({ type: "ok", text: `✓ Saved "${eName}"` });
      setSelected(j.resident);
      setResidents(prev => prev.map(r => r.slug === selected.slug ? j.resident : r));
    } catch { setMsg({ type: "err", text: "Network error." }); }
    setEsaving(false);
  }

  async function handleTogglePublish(r: ResidentRecord) {
    const res = await fetch("/api/hw-admin/residents", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-admin-password": password },
      body: JSON.stringify({ slug: r.slug, isPublished: !r.isPublished }),
    });
    if (res.ok) {
      const j = await res.json();
      setResidents(prev => prev.map(x => x.slug === r.slug ? j.resident : x));
      if (selected?.slug === r.slug) setSelected(j.resident);
    }
  }

  async function handleDelete(r: ResidentRecord) {
    if (!confirm(`Delete "${r.name}"? This cannot be undone.`)) return;
    const res = await fetch("/api/hw-admin/residents", {
      method: "DELETE",
      headers: { "Content-Type": "application/json", "x-admin-password": password },
      body: JSON.stringify({ slug: r.slug }),
    });
    if (res.ok) { setMsg({ type: "ok", text: `✓ Deleted "${r.name}"` }); setView("list"); await load(); }
    else setMsg({ type: "err", text: "Delete failed." });
  }

  async function handlePortraitUpload() {
    if (!portraitFile || !selected) return;
    setPortraitUploading(true); setMsg(null);
    try {
      const form = new FormData();
      form.append("file", portraitFile);
      form.append("slug", selected.slug);
      const res = await fetch("/api/hw-admin/residents/upload-portrait", { method: "POST", headers: { "x-admin-password": password }, body: form });
      const j = await res.json();
      if (!res.ok) { setMsg({ type: "err", text: j.error ?? "Upload failed." }); setPortraitUploading(false); return; }
      setMsg({ type: "ok", text: "✓ Portrait uploaded!" });
      setPortraitPreview(j.url);
      setPortraitFile(null);
      if (portraitRef.current) portraitRef.current.value = "";
      setResidents(prev => prev.map(r => r.slug === selected.slug ? { ...r, portraitKey: j.r2Key } : r));
      setSelected(prev => prev ? { ...prev, portraitKey: j.r2Key } : prev);
    } catch { setMsg({ type: "err", text: "Upload error." }); }
    setPortraitUploading(false);
  }

  const TOOLBAR_TAGS = [
    { label: "B",  wrap: ["<strong>", "</strong>"] },
    { label: "I",  wrap: ["<em>", "</em>"] },
    { label: "H2", wrap: ["<h2>", "</h2>"] },
    { label: "H3", wrap: ["<h3>", "</h3>"] },
    { label: "P",  wrap: ["<p>", "</p>"] },
    { label: "UL", wrap: ["<ul>\n  <li>", "</li>\n</ul>"] },
    { label: "LI", wrap: ["<li>", "</li>"] },
    { label: "Red",  wrap: ['<span style="color:#c0001a">', "</span>"] },
    { label: "Gold", wrap: ['<span style="color:#c9a84c">', "</span>"] },
    { label: "BQ",   wrap: ['<blockquote style="border-left:3px solid #c0001a;padding:8px 16px;margin:12px 0;font-style:italic;">', "</blockquote>"] },
    { label: "HR", wrap: ['<hr style="border:none;border-top:1px solid rgba(255,255,255,0.1);margin:20px 0;" />', ""] },
    { label: "Dim", wrap: ['<span style="color:rgba(255,255,255,0.45)">', "</span>"] },
  ];

  function applyTag(id: string, val: string, setVal: (v: string) => void, open: string, close: string) {
    const el = document.getElementById(id) as HTMLTextAreaElement | null;
    if (!el) { setVal(val + open + close); return; }
    const s = el.selectionStart, e = el.selectionEnd;
    const selected = val.slice(s, e);
    const next = val.slice(0, s) + open + selected + close + val.slice(e);
    setVal(next);
    setTimeout(() => { el.focus(); const pos = s + open.length + selected.length + close.length; el.setSelectionRange(pos, pos); }, 10);
  }

  function HtmlToolbar({ id, val, setVal }: { id: string; val: string; setVal: (v: string) => void }) {
    return (
      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "6px" }}>
        {TOOLBAR_TAGS.map(({ label, wrap }) => (
          <button key={label} type="button"
            onClick={() => applyTag(id, val, setVal, wrap[0], wrap[1])}
            style={{ background: "rgba(124,58,237,0.15)", border: `1px solid ${C.border}`, color: C.purple, padding: "3px 9px", cursor: "pointer", fontSize: "0.62rem", fontFamily: "monospace" }}>
            {label}
          </button>
        ))}
      </div>
    );
  }

  // ── RENDER ────────────────────────────────────────────────────────────────

  if (loading) return <p style={{ color: C.textSec, padding: "40px 0", textAlign: "center" }}>Loading residents…</p>;

  // LIST VIEW
  if (view === "list") return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <Msg msg={msg} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <p style={{ color: C.textSec, fontSize: "0.82rem" }}>{residents.length} residents in the haunted town</p>
        <Btn onClick={openCreate}>+ New Resident</Btn>
      </div>
      {residents.length === 0
        ? <Card style={{ padding: "48px", textAlign: "center" }}><p style={{ color: C.textMut }}>No residents yet. Create the first one.</p></Card>
        : <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {residents.map(r => (
              <Card key={r.id} style={{ display: "flex", gap: "16px", alignItems: "center", padding: "14px 18px" }}>
                {/* Portrait thumbnail */}
                <div style={{ width: "44px", height: "78px", flexShrink: 0, background: "#0a0812", border: `1px solid ${C.border}`, overflow: "hidden", position: "relative" }}>
                  {r.portraitKey
                    ? <img src={`${R2_BASE}/${r.portraitKey}`} alt={r.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : <span style={{ color: C.textMut, fontSize: "0.6rem", position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>No portrait</span>}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ color: C.textPri, fontWeight: 600, marginBottom: "3px" }}>{r.name}</p>
                  <p style={{ color: C.textSec, fontSize: "0.78rem", marginBottom: "4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.tagline}</p>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    <span style={{ color: C.textMut, fontSize: "0.6rem" }}>/{r.slug}</span>
                    <span style={{ background: r.isPublished ? "rgba(76,175,80,0.15)" : "rgba(255,255,255,0.05)", color: r.isPublished ? C.green : C.textMut, padding: "1px 7px", fontSize: "0.58rem", border: `1px solid ${r.isPublished ? C.green : C.border}` }}>
                      {r.isPublished ? "LIVE" : "DRAFT"}
                    </span>
                    <span style={{ color: C.textMut, fontSize: "0.58rem" }}>order: {r.order}</span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                  <Btn variant="ghost" onClick={() => openEdit(r)}>Edit</Btn>
                  <Btn variant={r.isPublished ? "danger" : "success"} onClick={() => handleTogglePublish(r)}>
                    {r.isPublished ? "Unpublish" : "Publish"}
                  </Btn>
                </div>
              </Card>
            ))}
          </div>
      }
    </div>
  );

  // CREATE VIEW
  if (view === "create") return (
    <div style={{ maxWidth: "720px", display: "flex", flexDirection: "column", gap: "20px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <Btn variant="ghost" onClick={() => setView("list")}>← Back</Btn>
        <h2 style={{ color: C.textPri, fontWeight: 400, fontSize: "1rem", margin: 0 }}>New Resident</h2>
      </div>
      <Msg msg={msg} />
      <Card>
        <p style={eyebrow}>Identity</p>
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={lbl}>Name *</label>
            <input style={inp} value={cName} onChange={e => { setCName(e.target.value); setCSlug(autoSlug(e.target.value)); }} placeholder="e.g. The Watcher" />
          </div>
          <div>
            <label style={lbl}>Slug * (auto-filled, editable)</label>
            <input style={inp} value={cSlug} onChange={e => setCSlug(e.target.value)} placeholder="the-watcher" />
          </div>
          <div>
            <label style={lbl}>Tagline * — one-line trait shown on card</label>
            <input style={inp} value={cTagline} onChange={e => setCTagline(e.target.value)} placeholder="e.g. She sees everything. She says nothing." />
          </div>
          <div>
            <label style={lbl}>Sort Order</label>
            <input style={{ ...inp, width: "120px" }} type="number" value={cOrder} onChange={e => setCOrder(Number(e.target.value))} />
          </div>
        </div>
      </Card>
      <Card>
        <p style={eyebrow}>Story (HTML)</p>
        <HtmlToolbar id="create-story" val={cStory} setVal={setCStory} />
        <textarea id="create-story" style={{ ...inp, minHeight: "200px", resize: "vertical" }} value={cStory} onChange={e => setCStory(e.target.value)} placeholder="<p>The story of this resident…</p>" />
      </Card>
      <Card>
        <p style={eyebrow}>Personality (HTML)</p>
        <HtmlToolbar id="create-personality" val={cPersonality} setVal={setCPersonality} />
        <textarea id="create-personality" style={{ ...inp, minHeight: "150px", resize: "vertical" }} value={cPersonality} onChange={e => setCPersonality(e.target.value)} placeholder="<p>Their personality traits…</p>" />
      </Card>
      <div style={{ display: "flex", gap: "12px" }}>
        <Btn onClick={handleCreate} disabled={cSaving}>{cSaving ? "Creating…" : "Create Resident →"}</Btn>
        <Btn variant="ghost" onClick={() => setView("list")}>Cancel</Btn>
      </div>
    </div>
  );

  // EDIT VIEW
  if (view === "edit" && selected) return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
        <Btn variant="ghost" onClick={() => setView("list")}>← Back</Btn>
        <h2 style={{ color: C.textPri, fontWeight: 400, fontSize: "1rem", margin: 0 }}>Editing: {selected.name}</h2>
        <span style={{ background: selected.isPublished ? "rgba(76,175,80,0.15)" : "rgba(255,255,255,0.05)", color: selected.isPublished ? C.green : C.textMut, padding: "2px 10px", fontSize: "0.6rem", border: `1px solid ${selected.isPublished ? C.green : C.border}` }}>
          {selected.isPublished ? "LIVE" : "DRAFT"}
        </span>
        <a href={`/residents/${selected.slug}`} target="_blank" rel="noopener noreferrer" style={{ color: C.textMut, fontSize: "0.65rem", marginLeft: "auto" }}>↗ View page</a>
      </div>
      <Msg msg={msg} />

      {/* Portrait Upload */}
      <Card>
        <p style={eyebrow}>Portrait — 9:16 ratio</p>
        <div style={{ display: "flex", gap: "20px", alignItems: "flex-start", flexWrap: "wrap" }}>
          <div style={{ width: "100px", height: "178px", background: "#0a0812", border: `1px solid ${C.border}`, overflow: "hidden", flexShrink: 0, position: "relative" }}>
            {portraitPreview
              ? <img src={portraitPreview} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : <span style={{ color: C.textMut, fontSize: "0.6rem", position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "8px" }}>No portrait yet</span>}
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "10px" }}>
            <p style={{ color: C.textSec, fontSize: "0.78rem", lineHeight: 1.6 }}>Upload a 9:16 portrait image for this resident. JPG, PNG, or WEBP. This becomes their card background on <code style={{ color: C.purple }}>/residents</code> and the header on their own page.</p>
            <input ref={portraitRef} type="file" accept="image/*" style={{ color: C.textSec, fontSize: "0.78rem" }}
              onChange={e => {
                const f = e.target.files?.[0];
                if (f) { setPortraitFile(f); setPortraitPreview(URL.createObjectURL(f)); }
              }} />
            {portraitFile && (
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <span style={{ color: C.textSec, fontSize: "0.72rem" }}>{portraitFile.name} ({(portraitFile.size / 1024 / 1024).toFixed(1)} MB)</span>
                <Btn onClick={handlePortraitUpload} disabled={portraitUploading}>{portraitUploading ? "Uploading…" : "Upload Portrait"}</Btn>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Identity */}
      <Card>
        <p style={eyebrow}>Identity</p>
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={lbl}>Name</label>
            <input style={inp} value={eName} onChange={e => setEName(e.target.value)} />
          </div>
          <div>
            <label style={lbl}>Slug (read-only)</label>
            <input style={{ ...inp, opacity: 0.5, cursor: "not-allowed" }} value={selected.slug} readOnly />
          </div>
          <div>
            <label style={lbl}>Tagline — one-line shown on grid card</label>
            <input style={inp} value={eTagline} onChange={e => setETagline(e.target.value)} />
          </div>
          <div>
            <label style={lbl}>Sort Order</label>
            <input style={{ ...inp, width: "120px" }} type="number" value={eOrder} onChange={e => setEOrder(Number(e.target.value))} />
          </div>
        </div>
      </Card>

      {/* Story HTML */}
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <p style={eyebrow}>Story</p>
          <div style={{ display: "flex", gap: "6px" }}>
            {(["html", "preview"] as const).map(m => (
              <button key={m} type="button" onClick={() => setStoryMode(m)}
                style={{ background: storyMode === m ? C.red : "transparent", border: `1px solid ${storyMode === m ? C.red : C.border}`, color: storyMode === m ? "#fff" : C.textSec, padding: "3px 12px", cursor: "pointer", fontSize: "0.62rem", fontFamily: "monospace", textTransform: "uppercase" }}>
                {m}
              </button>
            ))}
          </div>
        </div>
        {storyMode === "html"
          ? <>
              <HtmlToolbar id="edit-story" val={eStory} setVal={setEStory} />
              <textarea id="edit-story" style={{ ...inp, minHeight: "300px", resize: "vertical" }} value={eStory} onChange={e => setEStory(e.target.value)} />
            </>
          : <div style={{ background: "#0a0812", border: `1px solid ${C.border}`, padding: "20px", minHeight: "200px", color: C.textPri, lineHeight: 1.8, fontSize: "0.9rem" }} dangerouslySetInnerHTML={{ __html: eStory || "<p style='color:rgba(255,255,255,0.3)'>Nothing written yet…</p>" }} />
        }
      </Card>

      {/* Personality HTML */}
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <p style={eyebrow}>Personality</p>
          <div style={{ display: "flex", gap: "6px" }}>
            {(["html", "preview"] as const).map(m => (
              <button key={m} type="button" onClick={() => setPersonalityMode(m)}
                style={{ background: personalityMode === m ? C.red : "transparent", border: `1px solid ${personalityMode === m ? C.red : C.border}`, color: personalityMode === m ? "#fff" : C.textSec, padding: "3px 12px", cursor: "pointer", fontSize: "0.62rem", fontFamily: "monospace", textTransform: "uppercase" }}>
                {m}
              </button>
            ))}
          </div>
        </div>
        {personalityMode === "html"
          ? <>
              <HtmlToolbar id="edit-personality" val={ePersonality} setVal={setEPersonality} />
              <textarea id="edit-personality" style={{ ...inp, minHeight: "200px", resize: "vertical" }} value={ePersonality} onChange={e => setEPersonality(e.target.value)} />
            </>
          : <div style={{ background: "#0a0812", border: `1px solid ${C.border}`, padding: "20px", minHeight: "150px", color: C.textPri, lineHeight: 1.8, fontSize: "0.9rem" }} dangerouslySetInnerHTML={{ __html: ePersonality || "<p style='color:rgba(255,255,255,0.3)'>Nothing written yet…</p>" }} />
        }
      </Card>

      {/* Wallpapers — tag instructions */}
      <Card style={{ borderColor: "rgba(201,168,76,0.3)", background: "rgba(201,168,76,0.04)" }}>
        <p style={{ ...eyebrow, color: C.gold }}>Assigning Wallpapers to this Resident</p>
        <p style={{ color: C.textSec, fontSize: "0.82rem", lineHeight: 1.7, marginBottom: "10px" }}>
          Go to <strong style={{ color: C.textPri }}>Upload Image</strong> or <strong style={{ color: C.textPri }}>Published</strong> tab and add the tag:
        </p>
        <code style={{ background: "#0a0812", color: C.gold, padding: "8px 14px", display: "inline-block", fontSize: "0.85rem", border: `1px solid ${C.border}`, letterSpacing: "0.05em" }}>
          resident:{selected.slug}
        </code>
        <p style={{ color: C.textMut, fontSize: "0.72rem", marginTop: "10px", lineHeight: 1.6 }}>
          Any image with this tag will automatically appear in their wallpaper grid on <code style={{ color: C.purple }}>/residents/{selected.slug}</code>
        </p>
      </Card>

      {/* Save / Delete */}
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", paddingBottom: "32px" }}>
        <Btn onClick={handleSaveEdit} disabled={eSaving}>{eSaving ? "Saving…" : "Save Changes"}</Btn>
        <Btn variant={selected.isPublished ? "danger" : "success"} onClick={() => handleTogglePublish(selected)}>
          {selected.isPublished ? "Unpublish" : "Publish Live"}
        </Btn>
        <Btn variant="danger" onClick={() => handleDelete(selected)}>Delete Resident</Btn>
      </div>
    </div>
  );

  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 2: In the same file, find the line:
//   type Tab = "analytics" | "visitors" | ... | "nuke";
// Add "residents" to the union:
//   type Tab = "analytics" | ... | "nuke" | "residents";
//
// STEP 3: Find NAV_ITEMS array and add before "nuke":
//   ["residents", "👥", "Residents"],
//
// STEP 4: Find the tab render block and add before the nuke line:
//   {tab === "residents" && <ResidentsTab password={password} />}
// ─────────────────────────────────────────────────────────────────────────────

type Tab="analytics"|"visitors"|"pages"|"collections"|"districts"|"upload"|"published"|"bulkai"|"highres"|"blog"|"manage18"|"backdate"|"preview"|"feedback"|"nuke"|"pin"|"comments"|"livewallpapers"|"residents";
const NAV_ITEMS:[Tab,string,string][]=[["analytics","📊","Analytics"],["visitors","👀","Visitors"],["pages","📝","Page Content"],["collections","🗂","Collections"],["districts","🏚️","Districts"],["upload","📤","Upload Image"],["published","📸","Published"],["bulkai","🤖","Bulk AI Update"],["highres","⬆️","Upload 4K"],["blog","✍️","Blog Posts"],["manage18","⚠","16+ Manage"],["backdate","📅","Backdate"],["preview","🌐","Live Preview"],["feedback","⚑","Reports"],["comments","💬","Wishes"],["pin","📌","Pin Wallpapers"],["livewallpapers","🎬","Live Wallpapers"],["residents","👥","Residents"],["nuke","💣","Nuke Everything"]];

export default function AdminClient(){
  const[authed,setAuthed]=useState(false);const[password,setPw]=useState("");const[tab,setTab]=useState<Tab>("analytics");const[sidebarOpen,setSidebarOpen]=useState(true);const[prefillTitle,setPrefillTitle]=useState("");const[prefillLabel,setPrefillLabel]=useState("");
  useEffect(()=>{const saved=sessionStorage.getItem("hw-admin-auth");if(saved){setPw(saved);setAuthed(true);}},[]);
  function handleAuth(){const saved=sessionStorage.getItem("hw-admin-auth")??"";setPw(saved);setAuthed(true);}
  if(!authed)return<PasswordGate onAuth={handleAuth}/>;
  return<div style={{minHeight:"100vh",background:C.bg,fontFamily:"monospace",color:C.textPri,display:"flex",flexDirection:"column"}}>
    <div style={{borderBottom:`1px solid ${C.border}`,padding:"0 24px",height:"52px",display:"flex",alignItems:"center",justifyContent:"space-between",background:C.surface,flexShrink:0,position:"sticky",top:0,zIndex:100}}>
      <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
        <button onClick={()=>setSidebarOpen(o=>!o)} style={{background:"transparent",border:"none",cursor:"pointer",color:C.textSec,fontSize:"1.1rem",padding:"4px"}}>☰</button>
        <span style={{color:C.red,fontSize:"0.6rem",letterSpacing:"0.25em",textTransform:"uppercase"}}>Haunted Wallpapers</span>
        <span style={{color:C.textMut,fontSize:"0.75rem"}}>/ Admin</span>
      </div>
      <div style={{display:"flex",gap:"16px",alignItems:"center"}}>
        <a href="/" target="_blank" rel="noopener noreferrer" style={{color:C.textMut,fontSize:"0.7rem",textDecoration:"none"}}>View Site →</a>
        <button onClick={()=>{sessionStorage.removeItem("hw-admin-auth");setAuthed(false);}} style={{background:"transparent",border:"none",color:C.textMut,cursor:"pointer",fontSize:"0.72rem"}}>Sign out</button>
      </div>
    </div>
    <div style={{display:"flex",flex:1,overflow:"hidden"}}>
      <div style={{width:sidebarOpen?"220px":"56px",flexShrink:0,background:C.surface,borderRight:`1px solid ${C.border}`,transition:"width 0.2s",overflow:"hidden",display:"flex",flexDirection:"column",position:"sticky",top:"52px",alignSelf:"flex-start",height:"calc(100vh - 52px)"}}>
        <nav style={{flex:1,overflowY:"auto",padding:"12px 0"}}>
          {NAV_ITEMS.map(([key,icon,label])=>{const active=tab===key;return<button key={key} onClick={()=>setTab(key)} style={{display:"flex",alignItems:"center",gap:"12px",width:"100%",padding:"11px 18px",background:active?"rgba(192,0,26,0.15)":"transparent",border:"none",borderLeft:`3px solid ${active?C.red:"transparent"}`,color:active?C.textPri:C.textSec,cursor:"pointer",fontSize:"0.78rem",textAlign:"left",transition:"all 0.15s",whiteSpace:"nowrap"}}><span style={{fontSize:"1rem",flexShrink:0}}>{icon}</span>{sidebarOpen&&<span>{label}</span>}</button>;})}
        </nav>
        {sidebarOpen&&<div style={{padding:"16px",borderTop:`1px solid ${C.border}`,fontSize:"0.6rem",color:C.textMut,lineHeight:1.7}}><p style={{color:C.red,marginBottom:"4px"}}>HAUNTED WALLPAPERS</p><p>Admin Panel v2</p></div>}
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"32px",minWidth:0}}>
        <div style={{marginBottom:"28px",paddingBottom:"16px",borderBottom:`1px solid ${C.border}`}}>
          <h1 style={{fontSize:"1.1rem",fontWeight:400,color:C.textPri,margin:0}}>{NAV_ITEMS.find(n=>n[0]===tab)?.[1]} {NAV_ITEMS.find(n=>n[0]===tab)?.[2]}</h1>
        </div>
        {tab==="analytics"&&<AnalyticsTab password={password}/>}
        {tab==="visitors"&&<VisitorsTab password={password}/>}
        {tab==="pages"&&<PageContentTab password={password}/>}
        {tab==="collections"&&<CollectionsTab password={password}/>}
        {tab==="districts"&&<DistrictsTab password={password}/>}
        {tab==="upload"&&<ImageUploaderTab password={password}/>}
        {tab==="published"&&<PublishedImagesTab password={password}/>}
        {tab==="bulkai"&&<BulkAiTab password={password}/>}
        {tab==="highres"&&<HighResUploadTab password={password}/>}
        {tab==="blog"&&<BlogTab password={password} prefillTitle={prefillTitle} prefillLabel={prefillLabel} onPrefillUsed={()=>{setPrefillTitle("");setPrefillLabel("");}}/>}
        {tab==="manage18"&&<Manage18Tab password={password}/>}
        {tab==="backdate"&&<BackdateTab password={password}/>}
        {tab==="preview"&&<LivePreviewTab/>}
        {tab==="feedback"&&<Card style={{padding:"48px",textAlign:"center"}}><p style={{color:C.textMut}}>Feedback reports will appear here when the feedback API route is connected.</p></Card>}
        {tab==="comments"&&<CommentsTab password={password}/>}
        {tab==="pin"&&<PinTab password={password}/>}
        {tab==="livewallpapers"&&<LiveWallpapersTab password={password}/>}
        {tab==="residents"&&<ResidentsTab password={password}/>}
        {tab==="nuke"&&<NukeTab password={password}/>}
      </div>
    </div>
  </div>;
}