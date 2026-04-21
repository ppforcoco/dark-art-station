"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";

interface Analytics { totalDownloads:number;todayDownloads:number;weekDownloads:number;monthDownloads:number;imageDownloads:number;collectionDownloads:number;downloadsPerDay:{date:string;count:number}[];totalPageViews:number;topPageViews:{title:string;slug:string;device:string|null;views:number}[];topWallpapers:{title:string;slug:string;device:string|null;downloads:number}[];topCollections:{title:string;slug:string;downloads:number}[];totalBlogPosts:number;publishedBlogPosts:number;blogPosts:{title:string;slug:string;label:string;date:string;wordCount:number}[];deviceBreakdown:{IPHONE:number;ANDROID:number;PC:number;OTHER:number};recentActivity:{time:string;title:string;slug:string;device:string|null;type:string}[]; }
interface Post { slug:string;title:string;label:string;content?:string;featuredImage?:string|null;createdAt:string; }
interface ImageRecord { id:string;slug:string;title:string;r2Key:string;highResKey:string|null;description:string|null;altText:string|null;tags:string[];isAdult:boolean;deviceType:string|null;viewCount:number;collection?:{title:string}|null; }
interface PageContentRecord { id:string;slug:string;title:string|null;body:string;metaDesc:string|null;updatedAt:string; }

const ALL_LABELS=["Wallpaper Guides","How-To & Tutorials","Device Setup","iPhone Wallpapers","Android Wallpapers","PC & Desktop Wallpapers","Dark Aesthetics","Gothic & Horror","Dark Fantasy","AMOLED Wallpapers","Minimalist Dark","Cyberpunk & Neon","Halloween Special","Seasonal Picks","Top Lists","New Releases","Community Spotlights","News & Updates","Free Wallpapers","HD Wallpapers","Lock Screen Ideas","Dark Psychology","16+ Mature Content"];
const ALL_TAGS=["dark","gothic","horror","fantasy","minimal","amoled","neon","cyberpunk","nature","abstract","skull","moon","forest","city","demon","angel","witch","fire","ice","space","ocean","halloween","anime","street","pattern","texture","portrait","landscape","skeleton","smoke","rose","blood","darkness","void","crimson","black","white","aesthetic","edgy","rebel","grunge","punk","metal","vampire","ghost","reaper","creepy","mysterious","shadow","ethereal","art","illustration","wallpaper","phone","lockscreen","HD","hd","purple","red","green","blue","gold","silver","neon-green"];
const ADSENSE_CHECKLIST=[{done:true,item:"Original content — no copy-paste or AI spam"},{done:true,item:"Privacy Policy page live"},{done:true,item:"About page live"},{done:true,item:"Contact page live"},{done:false,item:"At least 15–20 blog posts published (800+ words each)"},{done:false,item:"Consistent posting — 2–3 posts per week minimum"},{done:false,item:"Site is at least 3–6 months old with traffic history"},{done:false,item:"No broken links, 404s, or console errors"},{done:false,item:"Mobile responsive on all pages"},{done:false,item:"Google Search Console verified + sitemap submitted"},{done:false,item:"No misleading navigation or hidden text"},{done:false,item:"Clear site purpose — wallpaper downloads, clearly stated"}];
const ADULT_IMAGES_TO_MARK=[{title:"Seductive Reaper",device:"IPHONE"},{title:"Gothic Temptress",device:"ANDROID"},{title:"Dark Sensuality",device:"PC"},{title:"Occult Ritual",device:"IPHONE"},{title:"Blood Moon Ritual",device:"ANDROID"},{title:"Forbidden Darkness",device:"PC"}];
const PAGE_SLUGS=[{slug:"home",label:"Home",url:"/"},{slug:"shop",label:"Shop / Collections",url:"/shop"},{slug:"iphone",label:"iPhone Wallpapers",url:"/iphone"},{slug:"android",label:"Android Wallpapers",url:"/android"},{slug:"pc",label:"PC Wallpapers",url:"/pc"},{slug:"collections",label:"Collections",url:"/collections"},{slug:"blog",label:"Blog Index",url:"/blog"},{slug:"faq",label:"FAQ",url:"/faq"},{slug:"about",label:"About",url:"/about"},{slug:"contact",label:"Contact",url:"/contact"},{slug:"privacy",label:"Privacy Policy",url:"/privacy"},{slug:"terms",label:"Terms of Service",url:"/terms"},{slug:"licensing",label:"Licensing",url:"/licensing"},{slug:"dmca",label:"DMCA",url:"/dmca"},{slug:"tools",label:"Tools",url:"/tools"},{slug:"gacha",label:"Gacha",url:"/gacha"},{slug:"search",label:"Search",url:"/search"}];

const CLAUDE_API_URL="https://api.anthropic.com/v1/messages";
const CLAUDE_MODEL="claude-sonnet-4-6";
const ALL_TAG_LIST=["dark","gothic","horror","fantasy","minimal","amoled","neon","cyberpunk","nature","abstract","skull","moon","forest","city","demon","angel","witch","fire","ice","space","ocean","halloween","anime","street","pattern","texture","portrait","landscape"];

async function fileToBase64(file:File):Promise<string>{const reader=new FileReader();return new Promise((resolve,reject)=>{reader.onload=()=>resolve((reader.result as string).split(",")[1]);reader.onerror=reject;reader.readAsDataURL(file);});}
async function urlToBase64(url:string):Promise<{data:string;mediaType:string}>{const res=await fetch(url);if(!res.ok)throw new Error("Could not fetch");const blob=await res.blob();const file=new File([blob],"image.jpg",{type:blob.type||"image/jpeg"});const data=await fileToBase64(file);return{data,mediaType:file.type};}
interface ClaudeImageAnalysis{title:string;description:string;altText:string;tags:string[];}
async function analyzeImageWithClaude(base64:string,mediaType:string):Promise<ClaudeImageAnalysis>{
  const prompt=`You are an SEO expert for "Haunted Wallpapers". Analyze this wallpaper image and return ONLY valid JSON:\n{"title":"Compelling wallpaper title (4-8 words)","description":"SEO description ~200 words, flowing prose","altText":"130-150 characters alt text, no period at end","tags":["3-6 tags from: ${ALL_TAG_LIST.join(", ")}"]}\nReturn ONLY valid JSON, no markdown.`;
  const res=await fetch(CLAUDE_API_URL,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:CLAUDE_MODEL,max_tokens:1000,messages:[{role:"user",content:[{type:"image",source:{type:"base64",media_type:mediaType,data:base64}},{type:"text",text:prompt}]}]})});
  if(!res.ok){const e=await res.text().catch(()=>"");throw new Error(`Claude API error ${res.status}: ${e.slice(0,200)}`);}
  const data=await res.json();const raw=data?.content?.[0]?.text?.trim()??"";
  if(!raw)throw new Error("Claude returned empty response.");
  try{const clean=raw.replace(/^```json\n?|```$/g,"").trim();return JSON.parse(clean) as ClaudeImageAnalysis;}
  catch{throw new Error("Claude response could not be parsed.");}
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

function HtmlToolbar({textareaId,value,onChange}:{textareaId:string;value:string;onChange:(v:string)=>void;}){
  const tags=[{label:"B",wrap:["<strong>","</strong>"]},{label:"I",wrap:["<em>","</em>"]},{label:"H2",wrap:["<h2>","</h2>"]},{label:"H3",wrap:["<h3>","</h3>"]},{label:"P",wrap:["<p>","</p>"]},{label:"UL",wrap:["<ul>\n  <li>","</li>\n</ul>"]},{label:"LI",wrap:["<li>","</li>"]},{label:"A",wrap:['<a href="">','</a>']},{label:"Red",wrap:['<span style="color:#c0001a">','</span>']},{label:"Gold",wrap:['<span style="color:#c9a84c">','</span>']},{label:"BQ",wrap:['<blockquote style="border-left:3px solid #c0001a;padding:8px 16px;margin:12px 0;font-style:italic;">','</blockquote>']}];
  return<div style={{display:"flex",flexWrap:"wrap",gap:"4px",marginBottom:"6px"}}>{tags.map(({label,wrap})=><button key={label} type="button" onClick={()=>{const el=document.getElementById(textareaId) as HTMLTextAreaElement|null;if(!el){onChange(value+wrap[0]+wrap[1]);return;}const start=el.selectionStart,end=el.selectionEnd;const selected=value.slice(start,end);const next=value.slice(0,start)+wrap[0]+selected+wrap[1]+value.slice(end);onChange(next);setTimeout(()=>{el.focus();const pos=start+wrap[0].length+selected.length+wrap[1].length;el.setSelectionRange(pos,pos);},10);}} style={{background:"rgba(124,58,237,0.15)",border:`1px solid ${C.border}`,color:C.purple,padding:"3px 9px",cursor:"pointer",fontSize:"0.62rem",fontFamily:"monospace"}}>{label}</button>)}</div>;
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
    {/* KPI row */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"12px",marginBottom:"24px"}}>
      {[{label:"Total Downloads",value:data.totalDownloads.toLocaleString(),sub:"all time"},{label:"This Month",value:data.monthDownloads.toLocaleString(),sub:"last 30 days"},{label:"This Week",value:data.weekDownloads.toLocaleString(),sub:"last 7 days"},{label:"Today",value:data.todayDownloads.toLocaleString(),sub:"since midnight"}].map(s=><Card key={s.label} style={{textAlign:"center",padding:"20px 12px"}}><p style={{...eyebrow,marginBottom:"6px"}}>{s.label}</p><p style={{color:C.red,fontSize:"1.8rem",fontWeight:700,lineHeight:1}}>{s.value}</p><p style={{color:C.textMut,fontSize:"0.6rem",marginTop:"4px"}}>{s.sub}</p></Card>)}
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"12px",marginBottom:"24px"}}>
      {[{label:"Image Downloads",value:data.imageDownloads.toLocaleString(),sub:"individual wallpapers"},{label:"Collection Downloads",value:data.collectionDownloads.toLocaleString(),sub:"full packs"},{label:"Total Page Views",value:data.totalPageViews.toLocaleString(),sub:"cumulative views"}].map(s=><Card key={s.label} style={{textAlign:"center",padding:"16px 12px"}}><p style={{...eyebrow,marginBottom:"4px"}}>{s.label}</p><p style={{color:C.gold,fontSize:"1.4rem",fontWeight:700,lineHeight:1}}>{s.value}</p><p style={{color:C.textMut,fontSize:"0.6rem",marginTop:"3px"}}>{s.sub}</p></Card>)}
    </div>

    {/* Sparkline */}
    <Card style={{marginBottom:"24px",padding:"20px"}}>
      <p style={{...eyebrow,marginBottom:"12px"}}>Downloads — last 14 days</p>
      <Sparkline data={data.downloadsPerDay}/>
      <div style={{display:"flex",justifyContent:"space-between",marginTop:"4px"}}><span style={{color:C.textMut,fontSize:"0.58rem"}}>{data.downloadsPerDay[0]?.date}</span><span style={{color:C.textMut,fontSize:"0.58rem"}}>{data.downloadsPerDay[data.downloadsPerDay.length-1]?.date}</span></div>
    </Card>

    {/* Section tabs */}
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

    {/* Recent downloads */}
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
    {/* Sidebar */}
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
        <p style={{color:C.textMut,fontSize:"0.65rem",marginBottom:"8px",lineHeight:1.6}}>For collections:<br/><code style={{color:C.purple}}>shop/your-slug</code><br/>For events:<br/><code style={{color:C.purple}}>halloween</code></p>
        <input value={customSlug} onChange={e=>setCustomSlug(e.target.value.toLowerCase().replace(/[^a-z0-9/-]/g,""))} onFocus={()=>setUseCustom(true)} placeholder="shop/skeleton-card" style={{...inp,fontSize:"0.75rem",marginBottom:"6px"}}/>
        <Btn onClick={()=>{setUseCustom(true);setMsg(null);}} variant="ghost" style={{width:"100%",padding:"7px"}}>Load Custom</Btn>
      </div>
    </Card></div>

    {/* Editor */}
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
  const[file,setFile]=useState<File|null>(null);const[highResFile,setHighResFile]=useState<File|null>(null);const[preview,setPreview]=useState("");const[dragging,setDragging]=useState(false);const[slug,setSlug]=useState("");const[title,setTitle]=useState("");const[altText,setAltText]=useState("");const[description,setDescription]=useState("");const[deviceType,setDeviceType]=useState<"IPHONE"|"ANDROID"|"PC"|"">("");const[selectedTags,setSelectedTags]=useState<string[]>([]);const[customTags,setCustomTags]=useState<string[]>([]);const[newTagInput,setNewTagInput]=useState("");const[collectionId,setCollectionId]=useState("");const[isAdult,setIsAdult]=useState(false);const[descMode,setDescMode]=useState<"html"|"preview">("html");const[uploading,setUploading]=useState(false);const[generating,setGenerating]=useState(false);const[message,setMessage]=useState<{type:"ok"|"err";text:string}|null>(null);const[uploadedUrl,setUploadedUrl]=useState("");const dropRef=useRef<HTMLDivElement>(null);const fileInputRef=useRef<HTMLInputElement>(null);const highResInputRef=useRef<HTMLInputElement>(null);
  function slugify(name:string){return name.toLowerCase().replace(/\.[^.]+$/,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");}
  function handleFileSelect(f:File){setFile(f);setSlug(slugify(f.name));if(!title)setTitle(f.name.replace(/\.[^.]+$/,"").replace(/[-_]/g," ").replace(/\b\w/g,c=>c.toUpperCase()));setPreview(URL.createObjectURL(f));setMessage(null);setUploadedUrl("");}
  function onDrop(e:React.DragEvent){e.preventDefault();setDragging(false);const f=e.dataTransfer.files[0];if(f?.type.startsWith("image/"))handleFileSelect(f);}
  function toggleTag(tag:string){setSelectedTags(prev=>prev.includes(tag)?prev.filter(t=>t!==tag):[...prev,tag]);}
  async function handleGenerateAll(){if(!file)return;setGenerating(true);setMessage(null);try{const base64=await fileToBase64(file);const result=await analyzeImageWithClaude(base64,file.type);if(result.title){setTitle(result.title);setSlug(result.title.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,""));}if(result.description)setDescription(result.description);if(result.altText)setAltText(result.altText);if(result.tags?.length)setSelectedTags(result.tags.filter(t=>ALL_TAGS.includes(t)));setMessage({type:"ok",text:"✓ Claude AI generated title, description, alt text & tags!"});}catch(err){setMessage({type:"err",text:`⚠ AI generation failed: ${(err as Error).message}`});}setGenerating(false);}
  async function handleUpload(){if(!file||!slug||!title){setMessage({type:"err",text:"File, slug, and title are required."});return;}setUploading(true);setMessage(null);try{const form=new FormData();form.append("file",file);if(highResFile)form.append("highResFile",highResFile);form.append("slug",slug);form.append("title",title);form.append("altText",altText);form.append("description",description);form.append("tags",JSON.stringify(selectedTags));form.append("isAdult",String(isAdult));if(deviceType)form.append("deviceType",deviceType);if(collectionId.trim())form.append("collectionId",collectionId.trim());const res=await fetch("/api/hw-admin/upload-image",{method:"POST",headers:{"x-admin-password":password},body:form});const json=await res.json();if(res.ok){setUploadedUrl(json.url);setMessage({type:"ok",text:`✓ Uploaded! Slug: ${json.slug}${json.hasHighRes?" | 4K upscaled stored":""}`});setFile(null);setHighResFile(null);setPreview("");setSlug("");setTitle("");setDescription("");setAltText("");setDeviceType("");setSelectedTags([]);setCollectionId("");setIsAdult(false);if(fileInputRef.current)fileInputRef.current.value="";if(highResInputRef.current)highResInputRef.current.value="";}else setMessage({type:"err",text:json.error??"Upload failed."});}catch{setMessage({type:"err",text:"Network error."});}setUploading(false);}
  const altOk=altText.length>=130&&altText.length<=150;const descWords=description.replace(/<[^>]*>/g," ").split(/\s+/).filter(Boolean).length;const descOk=descWords>=180&&descWords<=220;
  return<div style={{display:"flex",flexDirection:"column",gap:"20px"}}>
    <Card style={{padding:"14px 18px",borderColor:C.red}}><strong style={{color:C.gold}}>📤 Image Uploader</strong><span style={{color:C.textSec,marginLeft:"8px",fontSize:"0.82rem"}}>Drop thumbnail → optionally add 4K file → fill in details → upload.</span></Card>
    <Msg msg={message}/>

    {/* Thumbnail drop zone */}
    <div>
      <label style={{...lbl,marginBottom:"8px"}}>Thumbnail Image (required — shown in gallery &amp; cards)</label>
      <div ref={dropRef} onDragOver={e=>{e.preventDefault();setDragging(true);}} onDragLeave={()=>setDragging(false)} onDrop={onDrop} onClick={()=>fileInputRef.current?.click()} style={{border:`2px dashed ${dragging?C.red:file?C.green:C.border}`,background:dragging?"rgba(192,0,26,0.06)":C.surface,padding:"32px 24px",textAlign:"center",cursor:"pointer",transition:"all 0.2s"}}>
        <input ref={fileInputRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>{const f=e.target.files?.[0];if(f)handleFileSelect(f);}}/>
        {preview?<div style={{display:"flex",gap:"24px",alignItems:"flex-start",justifyContent:"center",flexWrap:"wrap"}}><img src={preview} alt="Preview" style={{maxHeight:"180px",maxWidth:"160px",objectFit:"contain",border:`1px solid ${C.border}`}}/><div style={{textAlign:"left"}}><p style={{color:C.green,fontSize:"0.75rem",marginBottom:"6px"}}>✓ Thumbnail ready</p><p style={{color:C.textPri,fontSize:"0.85rem",marginBottom:"4px"}}>{file?.name}</p><p style={{color:C.textSec,fontSize:"0.75rem"}}>{file?(file.size/1024/1024).toFixed(2)+" MB":""}</p><p style={{color:C.textMut,fontSize:"0.68rem",marginTop:"6px"}}>Used in gallery cards and image pages.<br/>Recommended: 720–1080px wide.</p><p style={{color:C.textMut,fontSize:"0.68rem",marginTop:"4px"}}>Click to replace</p></div></div>:<><p style={{fontSize:"2rem",marginBottom:"10px"}}>🖼️</p><p style={{color:C.textPri,fontSize:"0.9rem",marginBottom:"6px"}}>{dragging?"Drop it!":"Drag & drop thumbnail here"}</p><p style={{color:C.textSec,fontSize:"0.75rem"}}>or click to browse · JPG, PNG, WEBP</p></>}
      </div>
    </div>

    {/* 4K / High-res upload */}
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
        <div><p style={{color:C.gold,fontSize:"0.75rem",marginBottom:"4px"}}>✨ AI Auto-Fill (Claude Vision)</p><p style={{color:C.textSec,fontSize:"0.68rem"}}>Generates title, 200-word description, SEO alt text & tags.</p></div>
        <Btn onClick={handleGenerateAll} disabled={generating}>{generating?"✨ Analysing…":"✨ Generate All Fields"}</Btn>
      </Card>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"16px"}}>
        <Card style={{padding:"16px"}}><label style={lbl}>Image Title</label><input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Dark Gothic Forest" style={inp}/></Card>
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
          <Btn onClick={async()=>{if(!file)return;setGenerating(true);try{const{altText:at}=await analyzeImageWithClaude(await fileToBase64(file),file.type);setAltText(at);}catch(err){setMessage({type:"err",text:(err as Error).message});}setGenerating(false);}} disabled={generating} variant="ghost" style={{fontSize:"0.65rem",padding:"5px 14px"}}>{generating?"✨ Analysing…":"✨ AI Generate"}</Btn>
        </div>
        <input value={altText} onChange={e=>setAltText(e.target.value)} placeholder="Dark gothic forest wallpaper with moonlit trees — free HD download" style={inp}/>
      </Card>
      <Card style={{padding:"14px 18px",borderColor:isAdult?C.red:C.border,background:isAdult?"rgba(192,0,26,0.08)":C.surface}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:"16px"}}>
          <div><p style={{color:C.textSec,fontSize:"0.72rem",marginBottom:"4px"}}>{isAdult&&<><AdultBadge/>{" "}</>}16+ Adult / Mature Content</p><p style={{color:C.textMut,fontSize:"0.68rem"}}>Shows 16+ badge and requires age confirmation.</p></div>
          <Btn onClick={()=>setIsAdult(!isAdult)} variant={isAdult?"danger":"ghost"} style={{flexShrink:0}}>{isAdult?"✓ 16+ ON":"Mark as 16+"}</Btn>
        </div>
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
          <div style={{display:"flex",flexWrap:"wrap",gap:"6px",marginBottom:"10px"}}>
          {[...ALL_TAGS,...customTags].map(tag=><button key={tag} type="button" onClick={()=>toggleTag(tag)} style={{background:selectedTags.includes(tag)?"rgba(192,0,26,0.2)":"transparent",border:`1px solid ${selectedTags.includes(tag)?C.red:C.border}`,color:selectedTags.includes(tag)?C.textPri:C.textSec,padding:"5px 12px",cursor:"pointer",fontSize:"0.65rem",letterSpacing:"0.08em",fontFamily:"monospace"}}>{selectedTags.includes(tag)?"✓ ":""}{tag}</button>)}
        </div>
        <div style={{display:"flex",gap:"8px"}}>
          <input placeholder="Add custom tag…" value={newTagInput} onChange={e=>setNewTagInput(e.target.value.toLowerCase().replace(/\s+/g,"-"))} onKeyDown={e=>{if(e.key==="Enter"&&newTagInput.trim()){const v=newTagInput.trim();setCustomTags(prev=>prev.includes(v)?prev:[...prev,v]);setSelectedTags(prev=>prev.includes(v)?prev:[...prev,v]);setNewTagInput("");}}} style={{...inp,flex:1,fontSize:"0.75rem"}}/>
          <Btn onClick={()=>{if(!newTagInput.trim())return;const v=newTagInput.trim();setCustomTags(prev=>prev.includes(v)?prev:[...prev,v]);setSelectedTags(prev=>prev.includes(v)?prev:[...prev,v]);setNewTagInput("");}} variant="ghost">Add</Btn>
        </div>
      </Card>
      <Card style={{padding:"16px"}}><label style={lbl}>Collection ID (optional — leave blank for standalone)</label><input value={collectionId} onChange={e=>setCollectionId(e.target.value)} placeholder="UUID of the collection" style={inp}/></Card>

      {/* Upload summary */}
      <Card style={{padding:"14px 16px",background:"rgba(124,58,237,0.06)",borderColor:"rgba(124,58,237,0.3)"}}>
        <p style={{color:C.purple,fontSize:"0.72rem",marginBottom:"8px"}}>✦ Upload summary</p>
        <div style={{display:"flex",flexDirection:"column",gap:"4px",fontSize:"0.7rem",color:C.textSec}}>
          <span>📷 Thumbnail: {file?`${file.name} (${(file.size/1024/1024).toFixed(1)} MB)`:"Not set"} → stored at <code style={{color:C.gold}}>thumbnails/{slug}/</code></span>
          <span>{highResFile?`🖼 4K file: ${highResFile.name} (${(highResFile.size/1024/1024).toFixed(1)} MB)`:` 4K file: none — thumbnail will be used for downloads`} → stored at <code style={{color:C.gold}}>high-res/{slug}/</code></span>
          <span style={{color:C.textMut,fontSize:"0.65rem",marginTop:"4px"}}>Users see the thumbnail everywhere. Clicking Download serves the 4K file via a secure signed URL.</span>
        </div>
      </Card>

      <Btn onClick={handleUpload} disabled={uploading} style={{padding:"14px 32px",fontSize:"0.82rem"}}>{uploading?"⏳ Uploading…":"📤 Upload Image"}</Btn>
      {uploadedUrl&&<Card style={{padding:"14px 16px",borderColor:C.green,background:"rgba(76,175,80,0.08)"}}><p style={{color:C.green,fontSize:"0.8rem",marginBottom:"6px"}}>✓ Uploaded successfully</p><a href={uploadedUrl} target="_blank" rel="noopener noreferrer" style={{color:C.gold,fontSize:"0.75rem",wordBreak:"break-all"}}>{uploadedUrl}</a></Card>}
    </>}
  </div>;
}

function BlogTab({password,prefillTitle,prefillLabel,onPrefillUsed}:{password:string;prefillTitle:string;prefillLabel:string;onPrefillUsed:()=>void}){
  const[mode,setMode]=useState<"list"|"new"|"edit">("list");const[posts,setPosts]=useState<Post[]>([]);const[loading,setLoading]=useState(true);const[editPost,setEditPost]=useState<Post|null>(null);const[title,setTitle]=useState("");const[slug,setSlug]=useState("");const[label,setLabel]=useState("Wallpaper Guides");const[content,setContent]=useState("");const[featImg,setFeatImg]=useState("");const[saving,setSaving]=useState(false);const[deleting,setDeleting]=useState<string|null>(null);const[msg,setMsg]=useState<{type:"ok"|"err";text:string}|null>(null);const[contentMode,setContentMode]=useState<"html"|"preview">("html");
  const load=useCallback(async()=>{setLoading(true);try{const res=await fetch("/api/hw-admin/blogs",{headers:{"x-admin-password":password}});if(res.ok){const j=await res.json();setPosts(j.posts??[]);}}catch{}setLoading(false);},[password]);
  useEffect(()=>{load();},[load]);
  useEffect(()=>{if(prefillTitle){setTitle(prefillTitle);setSlug(prefillTitle.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,""));setLabel(prefillLabel||"Wallpaper Guides");setMode("new");onPrefillUsed();}},[prefillTitle,prefillLabel,onPrefillUsed]);
  function openNew(){setTitle("");setSlug("");setLabel("Wallpaper Guides");setContent("");setFeatImg("");setEditPost(null);setMsg(null);setMode("new");}
  function openEdit(p:Post){setEditPost(p);setTitle(p.title);setSlug(p.slug);setLabel(p.label);setContent(p.content??"");setFeatImg(p.featuredImage??"");setMsg(null);setMode("edit");}
  async function handleSave(){if(!title||!slug||!content){setMsg({type:"err",text:"Title, slug, and content are required."});return;}setSaving(true);setMsg(null);const isEdit=mode==="edit"&&editPost;try{const res=await fetch("/api/hw-admin/blogs",{method:isEdit?"PATCH":"POST",headers:{"Content-Type":"application/json","x-admin-password":password},body:JSON.stringify({slug,title,content,label,featuredImage:featImg||null})});const j=await res.json();if(res.ok){setMsg({type:"ok",text:`✓ ${isEdit?"Updated":"Published"}: "${title}"`});load();setMode("list");}else setMsg({type:"err",text:j.error??"Save failed."});}catch{setMsg({type:"err",text:"Network error."});}setSaving(false);}
  async function handleDelete(p:Post){if(!confirm(`Delete "${p.title}"?`))return;setDeleting(p.slug);try{await fetch("/api/hw-admin/blogs",{method:"DELETE",headers:{"Content-Type":"application/json","x-admin-password":password},body:JSON.stringify({slug:p.slug})});load();}catch{}setDeleting(null);}
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
      <Card style={{padding:"16px"}}><label style={lbl}>Featured Image URL (optional)</label><input value={featImg} onChange={e=>setFeatImg(e.target.value)} placeholder="https://assets.hauntedwallpapers.com/..." style={inp}/></Card>
    </div>
    <Card style={{padding:"16px"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"8px",flexWrap:"wrap",gap:"8px"}}>
        <label style={{...lbl,marginBottom:0}}>Content (HTML) <span style={{color:wordCount>=800?C.green:wordCount>0?C.gold:C.textMut}}>({wordCount} words{wordCount>=800?" ✓":" — aim for 800+"})</span></label>
        <div style={{display:"flex",gap:"4px"}}>{(["html","preview"] as const).map(m=><button key={m} onClick={()=>setContentMode(m)} style={{background:contentMode===m?(m==="preview"?C.red:"#2a2535"):"transparent",border:`1px solid ${C.border}`,color:contentMode===m?C.white:C.textSec,padding:"3px 10px",cursor:"pointer",fontSize:"0.65rem",fontFamily:"monospace"}}>{m==="preview"?"👁 Preview":"HTML"}</button>)}</div>
      </div>
      <HtmlToolbar textareaId="blog-content-ta" value={content} onChange={setContent}/>
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
    {loading?<p style={{color:C.textSec}}>Loading posts…</p>:posts.length===0?<Card style={{textAlign:"center",padding:"48px"}}><p style={{color:C.textMut,marginBottom:"16px"}}>No posts yet.</p><Btn onClick={openNew}>Write Your First Post</Btn></Card>:<div style={{display:"flex",flexDirection:"column",gap:"8px"}}>{posts.map(p=><Card key={p.slug} style={{padding:"16px 18px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:"16px",flexWrap:"wrap"}}><div style={{flex:1,minWidth:0}}><p style={{color:C.textPri,fontWeight:500,marginBottom:"4px",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{p.title}</p><div style={{display:"flex",gap:"12px",fontSize:"0.7rem",color:C.textMut}}><span style={{background:"rgba(124,58,237,0.2)",color:C.purple,padding:"1px 8px"}}>{p.label}</span><span>{new Date(p.createdAt).toLocaleDateString()}</span><span>/blog/{p.slug}</span></div></div><div style={{display:"flex",gap:"8px",flexShrink:0}}><Btn onClick={()=>openEdit(p)} variant="ghost" style={{padding:"7px 14px",fontSize:"0.68rem"}}>✏️ Edit</Btn><Btn onClick={()=>handleDelete(p)} disabled={deleting===p.slug} variant="danger" style={{padding:"7px 14px",fontSize:"0.68rem"}}>{deleting===p.slug?"…":"Delete"}</Btn></div></Card>)}</div>}
  </div>;
}

function PublishedImagesTab({password}:{password:string}){
  const[images,setImages]=useState<ImageRecord[]>([]);const[total,setTotal]=useState(0);const[pages,setPages]=useState(1);const[page,setPage]=useState(1);const[q,setQ]=useState("");const[loading,setLoading]=useState(true);const[editing,setEditing]=useState<ImageRecord|null>(null);const[saving,setSaving]=useState(false);const[deleting,setDeleting]=useState<string|null>(null);const[msg,setMsg]=useState<{type:"ok"|"err";text:string}|null>(null);const[eTitle,setETitle]=useState("");const[eDesc,setEDesc]=useState("");const[eAlt,setEAlt]=useState("");const[eTags,setETags]=useState<string[]>([]);const[eAdult,setEAdult]=useState(false);const[eDevice,setEDevice]=useState("");const[aiLoading,setAiLoading]=useState(false);const r2Base=process.env.NEXT_PUBLIC_R2_PUBLIC_URL??"";
  const load=useCallback(async(p=page,search=q)=>{setLoading(true);try{const res=await fetch(`/api/hw-admin/images?page=${p}&q=${encodeURIComponent(search)}`,{headers:{"x-admin-password":password}});if(!res.ok)throw new Error("Failed");const data=await res.json();setImages(data.images??[]);setTotal(data.total??0);setPages(data.pages??1);}catch{setMsg({type:"err",text:"Could not load images."});}setLoading(false);},[password,page,q]);
  useEffect(()=>{load();},[load]);
  function openEdit(img:ImageRecord){setEditing(img);setETitle(img.title);setEDesc(img.description??"");setEAlt(img.altText??"");setETags(img.tags.filter(t=>t!=="16plus"));setEAdult(img.isAdult);setEDevice(img.deviceType??"");setMsg(null);}
  async function handleAiRegenerate(){if(!editing)return;setAiLoading(true);try{const imgUrl=thumbUrl(editing.r2Key);const{data,mediaType}=await urlToBase64(imgUrl);const result=await analyzeImageWithClaude(data,mediaType);if(result.title)setETitle(result.title);if(result.description)setEDesc(result.description);if(result.altText)setEAlt(result.altText);if(result.tags?.length)setETags(result.tags.filter(t=>ALL_TAGS.includes(t)));setMsg({type:"ok",text:"✓ AI regenerated title, description, alt text & tags!"});}catch(err){setMsg({type:"err",text:`⚠ AI failed: ${(err as Error).message}`});}setAiLoading(false);}
  async function handleSave(){if(!editing)return;setSaving(true);const tags=eAdult?[...eTags,"16plus"]:eTags;try{const res=await fetch(`/api/hw-admin/images/${editing.id}`,{method:"PATCH",headers:{"Content-Type":"application/json","x-admin-password":password},body:JSON.stringify({title:eTitle,description:eDesc,altText:eAlt,tags,isAdult:eAdult,deviceType:eDevice||null})});if(!res.ok)throw new Error("Save failed");setMsg({type:"ok",text:`✓ Saved "${eTitle}"`});setEditing(null);load(page,q);}catch{setMsg({type:"err",text:"Save failed."});}setSaving(false);}
  async function handleDelete(img:ImageRecord){if(!confirm(`Delete "${img.title}"?\n\nThis removes from R2 and database permanently.`))return;setDeleting(img.id);try{const res=await fetch(`/api/hw-admin/images/${img.id}`,{method:"DELETE",headers:{"x-admin-password":password}});if(!res.ok)throw new Error("Delete failed");setMsg({type:"ok",text:`✓ Deleted "${img.title}"`});load(page,q);}catch{setMsg({type:"err",text:"Delete failed."});}setDeleting(null);}
  const thumbUrl=(key:string)=>r2Base?`${r2Base}/${key}`:`/api/r2-proxy/${key}`;
  const altOk=eAlt.length>=130&&eAlt.length<=150;
  return<div>
    <Card style={{padding:"14px 18px",marginBottom:"20px",borderColor:C.red}}><strong style={{color:C.gold}}>📸 Published Images</strong><span style={{color:C.textSec,marginLeft:"8px",fontSize:"0.82rem"}}>View, edit, or delete. Delete removes from R2 CDN + database permanently.</span></Card>
    <Msg msg={msg}/>
    <div style={{display:"flex",gap:"12px",marginBottom:"20px",flexWrap:"wrap"}}><input value={q} onChange={e=>{setQ(e.target.value);setPage(1);}} onKeyDown={e=>e.key==="Enter"&&load(1,q)} placeholder="Search by title or slug…" style={{...inp,maxWidth:"320px",flex:1}}/><Btn onClick={()=>load(1,q)}>Search</Btn><span style={{color:C.textMut,fontSize:"0.72rem",marginLeft:"auto",alignSelf:"center"}}>{total} images total</span></div>
    {editing&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",zIndex:1000,display:"flex",alignItems:"flex-start",justifyContent:"center",padding:"40px 16px",overflowY:"auto"}}><div style={{background:C.surface,border:`1px solid ${C.border}`,width:"100%",maxWidth:"720px",padding:"28px",fontFamily:"monospace"}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:"20px"}}><p style={{...eyebrow,marginBottom:0}}>✏️ Edit Image</p><button onClick={()=>setEditing(null)} style={{background:"none",border:"none",cursor:"pointer",color:C.textSec,fontSize:"1.4rem"}}>×</button></div>

      {/* Image preview + AI button */}
      <div style={{display:"flex",gap:"16px",marginBottom:"20px",alignItems:"flex-start"}}>
        <img src={thumbUrl(editing.r2Key)} alt={editing.title} style={{width:"80px",height:"120px",objectFit:"cover",border:`1px solid ${C.border}`,flexShrink:0}} onError={e=>{(e.target as HTMLImageElement).style.display="none";}}/>
        <div style={{flex:1}}>
          <p style={lbl}>Slug (read-only)</p>
          <p style={{color:C.purple,fontSize:"0.8rem",marginBottom:"12px"}}>{editing.slug}</p>
          <div style={{background:"rgba(192,0,26,0.06)",border:`1px solid rgba(192,0,26,0.25)`,padding:"12px 16px"}}>
            <p style={{color:C.gold,fontSize:"0.72rem",marginBottom:"4px"}}>✨ AI Auto-Fill (Claude Vision)</p>
            <p style={{color:C.textSec,fontSize:"0.65rem",marginBottom:"10px"}}>Regenerates title, 200-word description, SEO alt text & tags from the image.</p>
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
      <div style={{marginBottom:"14px"}}><label style={lbl}>Description (HTML)</label><textarea value={eDesc} onChange={e=>setEDesc(e.target.value)} rows={6} style={{...inp,resize:"vertical",lineHeight:"1.6",fontSize:"0.82rem"}}/></div>
      <div style={{marginBottom:"14px"}}><label style={lbl}>SEO Tags ({eTags.length})</label>
        <div style={{display:"flex",gap:"8px",marginBottom:"8px"}}><input placeholder="Paste tags by commas: dark, gothic, horror…" style={{...inp,flex:1,fontSize:"0.72rem",borderColor:"rgba(201,168,76,0.4)"}} onKeyDown={e=>{if(e.key==="Enter"){const raw=(e.target as HTMLInputElement).value;const parsed=raw.split(",").map(t=>t.trim().toLowerCase().replace(/\s+/g,"-")).filter(Boolean);setETags(prev=>[...new Set([...prev,...parsed])]);(e.target as HTMLInputElement).value="";e.preventDefault();}}} onPaste={e=>{setTimeout(()=>{const raw=(e.target as HTMLInputElement).value;const parsed=raw.split(",").map(t=>t.trim().toLowerCase().replace(/\s+/g,"-")).filter(Boolean);if(parsed.length>1){setETags(prev=>[...new Set([...prev,...parsed])]);(e.target as HTMLInputElement).value="";}},50);}}/><Btn onClick={()=>setETags([])} variant="ghost" style={{fontSize:"0.65rem",padding:"6px 10px",flexShrink:0}}>Clear</Btn></div>
        <div style={{display:"flex",flexWrap:"wrap",gap:"6px"}}>{ALL_TAGS.map(tag=><button key={tag} onClick={()=>setETags(prev=>prev.includes(tag)?prev.filter(t=>t!==tag):[...prev,tag])} style={{background:eTags.includes(tag)?C.red:"transparent",border:`1px solid ${eTags.includes(tag)?C.red:C.border}`,color:eTags.includes(tag)?C.white:C.textSec,padding:"4px 12px",cursor:"pointer",fontSize:"0.65rem",fontFamily:"monospace"}}>{eTags.includes(tag)?"✓ ":""}{tag}</button>)}</div></div>
      <div style={{marginBottom:"20px",display:"flex",alignItems:"center",gap:"12px"}}><Btn onClick={()=>setEAdult(a=>!a)} variant={eAdult?"danger":"ghost"} style={{padding:"6px 16px"}}>{eAdult?"⚠ 16+ ON":"16+ OFF"}</Btn><span style={{color:C.textSec,fontSize:"0.7rem"}}>Mark as adult/mature</span></div>
      <div style={{display:"flex",gap:"10px"}}><Btn onClick={handleSave} disabled={saving}>{saving?"Saving…":"💾 Save"}</Btn><Btn onClick={()=>setEditing(null)} variant="ghost">Cancel</Btn></div>
    </div></div>}
    {loading?<p style={{color:C.textSec,textAlign:"center",padding:"40px"}}>Loading images…</p>:images.length===0?<p style={{color:C.textSec}}>No images found.</p>:<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:"14px",marginBottom:"32px"}}>{images.map(img=><div key={img.id} style={{border:`1px solid ${C.border}`,background:C.surface}}><div style={{position:"relative",aspectRatio:"9/16",background:"#0d0b14",overflow:"hidden"}}><img src={thumbUrl(img.r2Key)} alt={img.title} style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}} onError={e=>{(e.target as HTMLImageElement).style.display="none";}}/>{img.isAdult&&<span style={{position:"absolute",top:"6px",left:"6px",background:C.red,color:"#fff",fontSize:"0.55rem",fontFamily:"monospace",fontWeight:900,padding:"2px 6px"}}>16+</span>}{img.deviceType&&<span style={{position:"absolute",top:"6px",right:"6px",background:"rgba(0,0,0,0.7)",color:C.gold,fontSize:"0.55rem",fontFamily:"monospace",padding:"2px 6px"}}>{img.deviceType}</span>}{!img.altText&&<span style={{position:"absolute",bottom:"6px",left:"6px",background:"rgba(192,0,26,0.85)",color:"#fff",fontSize:"0.5rem",fontFamily:"monospace",padding:"2px 5px"}}>no alt</span>}</div><div style={{padding:"10px"}}><p style={{color:C.textPri,fontSize:"0.72rem",fontWeight:600,marginBottom:"4px",lineHeight:1.3,wordBreak:"break-word"}}>{img.title}</p><p style={{color:C.textMut,fontSize:"0.58rem",marginBottom:"6px"}}>👁 {img.viewCount}</p><div style={{display:"flex",gap:"6px"}}><button onClick={()=>openEdit(img)} style={{flex:1,background:"rgba(124,58,237,0.1)",border:`1px solid ${C.border}`,color:C.textSec,padding:"6px",cursor:"pointer",fontSize:"0.62rem",fontFamily:"monospace"}}>✏️ Edit</button><button onClick={()=>handleDelete(img)} disabled={deleting===img.id} style={{flex:1,background:"rgba(192,0,26,0.08)",border:"1px solid rgba(192,0,26,0.4)",color:C.red,padding:"6px",cursor:deleting===img.id?"not-allowed":"pointer",fontSize:"0.62rem",fontFamily:"monospace"}}>{deleting===img.id?"…":"🗑 Del"}</button></div></div></div>)}</div>}
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
    <div style={{display:"flex",flexDirection:"column",gap:"8px",marginBottom:"32px"}}>{ADULT_IMAGES_TO_MARK.map(item=>{const res=results[item.title];const isLoading=loadingMap[item.title];return<Card key={item.title} style={{padding:"14px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",gap:"16px",flexWrap:"wrap",borderColor:res?.status==="ok"?C.green:res?.status==="err"?C.red:C.border}}><div><p style={{color:C.textPri,marginBottom:"4px"}}>{item.title}</p><div style={{display:"flex",gap:"8px",alignItems:"center"}}><span style={{background:"rgba(124,58,237,0.2)",color:C.purple,padding:"2px 8px",fontSize:"0.62rem",fontFamily:"monospace"}}>{item.device}</span><AdultBadge/>{res&&<span style={{color:res.status==="ok"?C.green:"#ff8080",fontSize:"0.72rem"}}>{res.msg}</span>}</div></div><Btn onClick={()=>markAdult(item.title)} disabled={isLoading||res?.status==="ok"} variant={res?.status==="ok"?"success":"ghost"} style={{fontSize:"0.68rem"}}>{res?.status==="ok"?"✓ Done":isLoading?"Updating…":"Mark 16+"}</Btn></Card>;})}</div>
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
  const QUICK_LINKS=[{label:"Home",url:"/"},{label:"Blog",url:"/blog"},{label:"iPhone",url:"/iphone"},{label:"Android",url:"/android"},{label:"PC",url:"/pc"},{label:"Shop",url:"/shop"},{label:"Collections",url:"/collections"},{label:"About",url:"/about"},{label:"FAQ",url:"/faq"},{label:"Contact",url:"/contact"},{label:"Tools",url:"/tools"}];
  function navigate(url:string){const full=url.startsWith("http")?url:`https://hauntedwallpapers.com${url}`;setActiveUrl(url);if(iframeRef.current)iframeRef.current.src=full;}
  return<div>
    <Card style={{padding:"14px 18px",marginBottom:"16px",borderColor:C.red}}><strong style={{color:C.gold}}>🌐 Live Site Preview</strong><span style={{color:C.textSec,marginLeft:"8px",fontSize:"0.82rem"}}>Browse your live site in-panel.</span></Card>
    <div style={{display:"flex",flexWrap:"wrap",gap:"6px",marginBottom:"12px"}}>{QUICK_LINKS.map(({label,url})=><button key={url} onClick={()=>navigate(url)} style={{background:activeUrl===url?C.red:"transparent",border:`1px solid ${activeUrl===url?C.red:C.border}`,color:activeUrl===url?C.white:C.textSec,padding:"5px 12px",cursor:"pointer",fontSize:"0.68rem",fontFamily:"monospace"}}>{label}</button>)}</div>
    <div style={{display:"flex",gap:"8px",marginBottom:"14px"}}><input value={customUrl} onChange={e=>setCustomUrl(e.target.value)} onKeyDown={e=>e.key==="Enter"&&navigate(customUrl)} placeholder="/blog/your-slug or full URL" style={{...inp,flex:1}}/><Btn onClick={()=>navigate(customUrl||"/blog")}>Go →</Btn><a href={`https://hauntedwallpapers.com${activeUrl.startsWith("/")?activeUrl:"/"+activeUrl}`} target="_blank" rel="noopener noreferrer" style={{display:"flex",alignItems:"center",background:"transparent",border:`1px solid ${C.border}`,color:C.textSec,padding:"10px 14px",textDecoration:"none",fontSize:"0.7rem",fontFamily:"monospace"}}>↗</a></div>
    <div style={{border:`1px solid ${C.border}`,overflow:"hidden"}}><iframe ref={iframeRef} src="https://hauntedwallpapers.com/blog" style={{width:"100%",height:"720px",border:"none",display:"block"}} title="Live site preview"/></div>
    <p style={{color:C.textMut,fontSize:"0.65rem",marginTop:"8px"}}>⚠ Some pages may block iframe embedding. Use ↗ to open in a new tab.</p>
  </div>;
}

interface CollectionRecord{id:string;slug:string;title:string;category:string;description:string;metaDescription:string|null;thumbnail:string|null;_count:{images:number};}

function CollectionsTab({password}:{password:string}){
  const[collections,setCollections]=useState<CollectionRecord[]>([]);
  const[loading,setLoading]=useState(true);
  const[selected,setSelected]=useState<CollectionRecord|null>(null);
  const[desc,setDesc]=useState("");
  const[metaDesc,setMetaDesc]=useState("");
  const[descMode,setDescMode]=useState<"html"|"preview">("html");
  const[saving,setSaving]=useState(false);
  const[msg,setMsg]=useState<{type:"ok"|"err";text:string}|null>(null);
  const[search,setSearch]=useState("");
  const r2Base=typeof process!=="undefined"?(process.env.NEXT_PUBLIC_R2_PUBLIC_URL??""):"";

  const load=useCallback(async()=>{
    setLoading(true);
    try{const res=await fetch("/api/hw-admin/collections",{headers:{"x-admin-password":password}});
      if(res.ok){const j=await res.json();setCollections(j.collections??[]);}}
    catch{}setLoading(false);
  },[password]);

  useEffect(()=>{load();},[load]);

  function openCollection(c:CollectionRecord){setSelected(c);setDesc(c.description??"");setMetaDesc(c.metaDescription??"");setMsg(null);setDescMode("html");}

  async function handleSave(){
    if(!selected)return;setSaving(true);setMsg(null);
    try{const res=await fetch("/api/hw-admin/collections",{method:"PATCH",headers:{"Content-Type":"application/json","x-admin-password":password},body:JSON.stringify({slug:selected.slug,description:desc,metaDescription:metaDesc||null})});
      const j=await res.json();
      if(res.ok){setMsg({type:"ok",text:`✓ Saved "${selected.title}"`});setCollections(prev=>prev.map(c=>c.slug===selected.slug?{...c,description:desc,metaDescription:metaDesc||null}:c));setSelected(s=>s?{...s,description:desc,metaDescription:metaDesc||null}:null);}
      else setMsg({type:"err",text:j.error??"Save failed."});}
    catch{setMsg({type:"err",text:"Network error."});}setSaving(false);
  }

  const filtered=collections.filter(c=>!search||c.title.toLowerCase().includes(search.toLowerCase())||c.slug.includes(search.toLowerCase()));
  const wordCount=desc.replace(/<[^>]*>/g," ").replace(/\s+/g," ").trim().split(" ").filter(Boolean).length;
  const isHtml=/<[a-z][\s\S]*>/i.test(desc);
  const thumbUrl=(key:string|null)=>key&&r2Base?`${r2Base}/${key}`:"";

  return<div style={{display:"grid",gridTemplateColumns:"280px 1fr",gap:"24px",alignItems:"start"}}>
    <div><Card style={{padding:"0",overflow:"hidden"}}>
      <div style={{padding:"12px 14px",borderBottom:`1px solid ${C.border}`}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search collections…" style={{...inp,fontSize:"0.78rem"}}/>
      </div>
      {loading?<p style={{color:C.textSec,padding:"16px",fontSize:"0.8rem"}}>Loading…</p>:
        <div style={{maxHeight:"70vh",overflowY:"auto"}}>
          {filtered.length===0&&<p style={{color:C.textMut,padding:"16px",fontSize:"0.75rem"}}>No collections found.</p>}
          {filtered.map(c=>{
            const active=selected?.slug===c.slug;
            const hasContent=c.description&&c.description.length>20;
            const hasHtml=/<[a-z][\s\S]*>/i.test(c.description??"");
            return<button key={c.slug} onClick={()=>openCollection(c)} style={{display:"flex",alignItems:"center",gap:"10px",width:"100%",padding:"10px 14px",background:active?"rgba(192,0,26,0.15)":"transparent",border:"none",borderBottom:`1px solid ${C.border}`,borderLeft:`3px solid ${active?C.red:"transparent"}`,cursor:"pointer",textAlign:"left"}}>
              {thumbUrl(c.thumbnail)?<img src={thumbUrl(c.thumbnail)} alt="" style={{width:"32px",height:"48px",objectFit:"cover",flexShrink:0,border:`1px solid ${C.border}`}} onError={e=>{(e.target as HTMLImageElement).style.display="none";}}/>:<div style={{width:"32px",height:"48px",background:"#1a1625",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.9rem"}}>🖤</div>}
              <div style={{flex:1,minWidth:0}}>
                <p style={{color:active?C.textPri:C.textSec,fontSize:"0.78rem",fontWeight:active?600:400,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{c.title}</p>
                <p style={{color:C.textMut,fontSize:"0.6rem",marginTop:"2px"}}>{c._count.images} images · {c.category}</p>
                {hasContent&&<p style={{color:hasHtml?C.purple:C.green,fontSize:"0.55rem",marginTop:"2px"}}>{hasHtml?"● HTML desc":"● Text desc"}</p>}
              </div>
            </button>;})}
        </div>}
      <div style={{padding:"10px 14px",borderTop:`1px solid ${C.border}`}}>
        <p style={{color:C.textMut,fontSize:"0.6rem"}}>{filtered.length} / {collections.length} collections</p>
      </div>
    </Card></div>

    {!selected
      ?<Card style={{padding:"48px",textAlign:"center"}}><p style={{color:C.textMut,fontSize:"0.85rem"}}>← Select a collection to edit its description</p></Card>
      :<div style={{display:"flex",flexDirection:"column",gap:"16px"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"12px"}}>
          <div>
            <p style={{color:C.red,fontSize:"0.6rem",letterSpacing:"0.2em",textTransform:"uppercase",marginBottom:"4px"}}>Editing Collection</p>
            <p style={{color:C.gold,fontSize:"1rem",fontWeight:500}}>{selected.title}</p>
            <div style={{display:"flex",gap:"12px",marginTop:"4px"}}>
              <code style={{color:C.textMut,fontSize:"0.65rem"}}>/shop/{selected.slug}</code>
              <a href={`https://hauntedwallpapers.com/shop/${selected.slug}`} target="_blank" rel="noopener noreferrer" style={{color:C.textMut,fontSize:"0.65rem",textDecoration:"none"}}>↗ View Live</a>
            </div>
          </div>
          <Btn onClick={handleSave} disabled={saving}>{saving?"Saving…":"💾 Save Description"}</Btn>
        </div>
        <Msg msg={msg}/>
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
          <p style={{color:C.textSec,fontSize:"0.72rem",lineHeight:1.7}}>Saved description renders at <code style={{color:C.gold}}>/shop/{selected.slug}</code> as the editorial intro — visible to Google and visitors. The meta description goes in &lt;head&gt; for search results only.</p>
        </Card>
      </div>}
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
      const result=await analyzeImageWithClaude(data,mediaType);
      const tags=img.isAdult?[...result.tags.filter((t:string)=>ALL_TAGS.includes(t)),"16plus"]:result.tags.filter((t:string)=>ALL_TAGS.includes(t));
      const res=await fetch(`/api/hw-admin/images/${img.id}`,{method:"PATCH",headers:{"Content-Type":"application/json","x-admin-password":password},body:JSON.stringify({title:result.title,description:result.description,altText:result.altText,tags})});
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
      await new Promise(r=>setTimeout(r,600)); // rate limit buffer
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
    {/* Collection picker */}
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

    {/* Right panel */}
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
        <p style={{color:C.textSec,fontSize:"0.68rem",lineHeight:1.7}}>Claude Vision analyses each image and <strong style={{color:C.textPri}}>overwrites</strong> the title, description (~200 words), alt text (130–150 chars), and tags. It processes them one by one with a short delay. This cannot be undone — use with care.</p>
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

  useEffect(()=>{async function load(){setLoadingColls(true);try{const res=await fetch("/api/hw-admin/collections",{headers:{"x-admin-password":password}});if(res.ok){const j=await res.json();// only show iPhone + Android collections
    const filtered=(j.collections??[]).filter((c:CollectionRecord)=>{const cat=c.category?.toLowerCase()??"";return cat.includes("iphone")||cat.includes("android")||cat.includes("mobile")||cat.includes("phone");});setCollections(filtered.length>0?filtered:j.collections??[]);}}catch{}setLoadingColls(false);}load();},[password]);

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
    {/* Collection picker */}
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

    {/* Right panel */}
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
                  {/* Thumbnail */}
                  <div style={{position:"relative",aspectRatio:"9/16",background:"#0d0b14",overflow:"hidden"}}>
                    <img src={thumbUrl(img.r2Key)} alt={img.title} style={{width:"100%",height:"100%",objectFit:"cover",display:"block",opacity:st.state==="uploading"?0.4:1,transition:"opacity 0.3s"}} onError={e=>{(e.target as HTMLImageElement).style.display="none";}}/>
                    {/* Status overlays */}
                    {st.state==="uploading"&&<div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.6)",gap:"8px"}}><div style={{fontSize:"1.6rem"}}>⏳</div><p style={{color:C.gold,fontSize:"0.6rem",fontFamily:"monospace"}}>Uploading…</p></div>}
                    {st.state==="done"&&<div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"rgba(76,175,80,0.25)",gap:"4px"}}><div style={{fontSize:"1.6rem"}}>✓</div><p style={{color:C.green,fontSize:"0.6rem",fontFamily:"monospace"}}>Uploaded!</p></div>}
                    {st.state==="err"&&<div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"rgba(192,0,26,0.35)",gap:"4px",padding:"8px"}}><div style={{fontSize:"1.4rem"}}>✗</div><p style={{color:"#ff8080",fontSize:"0.58rem",fontFamily:"monospace",textAlign:"center",wordBreak:"break-word"}}>{st.msg}</p></div>}
                    {/* 4K badge */}
                    {(already4k||st.state==="done")&&<span style={{position:"absolute",top:"6px",right:"6px",background:"rgba(76,175,80,0.9)",color:"#fff",fontSize:"0.5rem",fontFamily:"monospace",fontWeight:900,padding:"2px 6px",letterSpacing:"0.05em"}}>✓ 4K</span>}
                    {img.deviceType&&<span style={{position:"absolute",top:"6px",left:"6px",background:"rgba(0,0,0,0.7)",color:C.gold,fontSize:"0.5rem",fontFamily:"monospace",padding:"2px 6px"}}>{img.deviceType}</span>}
                  </div>

                  {/* Info + drop zone */}
                  <div style={{padding:"10px"}}>
                    <p style={{color:C.textPri,fontSize:"0.7rem",fontWeight:600,lineHeight:1.3,marginBottom:"6px",wordBreak:"break-word"}}>{img.title}</p>
                    <p style={{color:C.textMut,fontSize:"0.58rem",marginBottom:"8px",fontFamily:"monospace"}}>{img.slug}</p>

                    {/* File input styled as drop zone */}
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

type Tab="analytics"|"pages"|"collections"|"upload"|"published"|"bulkai"|"highres"|"blog"|"manage18"|"backdate"|"preview"|"feedback";
const NAV_ITEMS:[Tab,string,string][]=[["analytics","📊","Analytics"],["pages","📝","Page Content"],["collections","🗂","Collections"],["upload","📤","Upload Image"],["published","📸","Published"],["bulkai","🤖","Bulk AI Update"],["highres","⬆️","Upload 4K"],["blog","✍️","Blog Posts"],["manage18","⚠","16+ Manage"],["backdate","📅","Backdate"],["preview","🌐","Live Preview"],["feedback","⚑","Reports"]];

export default function AdminClient(){
  const[authed,setAuthed]=useState(false);const[password,setPw]=useState("");const[tab,setTab]=useState<Tab>("analytics");const[sidebarOpen,setSidebarOpen]=useState(true);const[prefillTitle,setPrefillTitle]=useState("");const[prefillLabel,setPrefillLabel]=useState("");
  useEffect(()=>{const saved=sessionStorage.getItem("hw-admin-auth");if(saved){setPw(saved);setAuthed(true);}},[]);
  function handleAuth(){const saved=sessionStorage.getItem("hw-admin-auth")??"";setPw(saved);setAuthed(true);}
  if(!authed)return<PasswordGate onAuth={handleAuth}/>;
  return<div style={{minHeight:"100vh",background:C.bg,fontFamily:"monospace",color:C.textPri,display:"flex",flexDirection:"column"}}>
    {/* Top bar */}
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
      {/* Sidebar */}
      <div style={{width:sidebarOpen?"220px":"56px",flexShrink:0,background:C.surface,borderRight:`1px solid ${C.border}`,transition:"width 0.2s",overflow:"hidden",display:"flex",flexDirection:"column",position:"sticky",top:"52px",alignSelf:"flex-start",height:"calc(100vh - 52px)"}}>
        <nav style={{flex:1,overflowY:"auto",padding:"12px 0"}}>
          {NAV_ITEMS.map(([key,icon,label])=>{const active=tab===key;return<button key={key} onClick={()=>setTab(key)} style={{display:"flex",alignItems:"center",gap:"12px",width:"100%",padding:"11px 18px",background:active?"rgba(192,0,26,0.15)":"transparent",border:"none",borderLeft:`3px solid ${active?C.red:"transparent"}`,color:active?C.textPri:C.textSec,cursor:"pointer",fontSize:"0.78rem",textAlign:"left",transition:"all 0.15s",whiteSpace:"nowrap"}}><span style={{fontSize:"1rem",flexShrink:0}}>{icon}</span>{sidebarOpen&&<span>{label}</span>}</button>;})}
        </nav>
        {sidebarOpen&&<div style={{padding:"16px",borderTop:`1px solid ${C.border}`,fontSize:"0.6rem",color:C.textMut,lineHeight:1.7}}><p style={{color:C.red,marginBottom:"4px"}}>HAUNTED WALLPAPERS</p><p>Admin Panel v2</p></div>}
      </div>
      {/* Main content */}
      <div style={{flex:1,overflowY:"auto",padding:"32px",minWidth:0}}>
        <div style={{marginBottom:"28px",paddingBottom:"16px",borderBottom:`1px solid ${C.border}`}}>
          <h1 style={{fontSize:"1.1rem",fontWeight:400,color:C.textPri,margin:0}}>{NAV_ITEMS.find(n=>n[0]===tab)?.[1]} {NAV_ITEMS.find(n=>n[0]===tab)?.[2]}</h1>
        </div>
        {tab==="analytics"&&<AnalyticsTab password={password}/>}
        {tab==="pages"&&<PageContentTab password={password}/>}
        {tab==="collections"&&<CollectionsTab password={password}/>}
        {tab==="upload"&&<ImageUploaderTab password={password}/>}
        {tab==="published"&&<PublishedImagesTab password={password}/>}
        {tab==="bulkai"&&<BulkAiTab password={password}/>}
        {tab==="highres"&&<HighResUploadTab password={password}/>}
        {tab==="blog"&&<BlogTab password={password} prefillTitle={prefillTitle} prefillLabel={prefillLabel} onPrefillUsed={()=>{setPrefillTitle("");setPrefillLabel("");}}/>}
        {tab==="manage18"&&<Manage18Tab password={password}/>}
        {tab==="backdate"&&<BackdateTab password={password}/>}
        {tab==="preview"&&<LivePreviewTab/>}
        {tab==="feedback"&&<Card style={{padding:"48px",textAlign:"center"}}><p style={{color:C.textMut}}>Feedback reports will appear here when the feedback API route is connected.</p></Card>}
      </div>
    </div>
  </div>;
}