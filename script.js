(() => {
"use strict";
const $ = (s) => document.querySelector(s);
const canvas=$("#previewCanvas"), ctx=canvas.getContext("2d",{willReadFrequently:true});
const state={img:null,name:"",rotation:0,flip:false,brightness:100,contrast:100,saturation:100,warmth:0,fade:0,preset:"natural"};
const defaults={brightness:100,contrast:100,saturation:100,warmth:0,fade:0};
const presets={natural:{...defaults},studio:{brightness:104,contrast:108,saturation:92,warmth:2,fade:0},vivid:{brightness:104,contrast:115,saturation:138,warmth:0,fade:0},warm:{brightness:103,contrast:105,saturation:110,warmth:22,fade:4},mono:{brightness:103,contrast:115,saturation:0,warmth:0,fade:0},soft:{brightness:108,contrast:92,saturation:95,warmth:7,fade:12}};
let objectUrl=null;
const setText=(s,t)=>{const e=$(s);if(e)e.textContent=t};
function getRatio(){
 const v=$("#sizePreset").value;
 if(v==="passport"||v==="nid")return 35/45;
 if(v==="square")return 1;
 if(v==="4x6")return 4/6;
 if(v==="custom"){const w=+$("#customW").value||35,h=+$("#customH").value||45;return w/h}
 if(!state.img)return 1;
 const r=state.img.width/state.img.height;return state.rotation%180?r?1/r:1:r;
}
function getOutputSize(){
 const dpi=+$("#dpi").value, v=$("#sizePreset").value;
 if(v==="original"&&state.img){let w=state.img.width,h=state.img.height;if(state.rotation%180)[w,h]=[h,w];return [w,h]}
 let mmW=35,mmH=45;
 if(v==="square"){mmW=50.8;mmH=50.8}else if(v==="4x6"){mmW=101.6;mmH=152.4}else if(v==="custom"){mmW=Math.max(10,+$("#customW").value||35);mmH=Math.max(10,+$("#customH").value||45)}
 return [Math.round(mmW/25.4*dpi),Math.round(mmH/25.4*dpi)];
}
function cropSource(){
 const iw=state.img.width,ih=state.img.height,rot=state.rotation%180!==0?ih/iw:iw/ih,ratio=$("#sizePreset").value==="original"?rot:getRatio();
 let sx=0,sy=0,sw=iw,sh=ih;
 const sourceRatio = state.rotation % 180 ? 1/ratio : ratio;
 if(iw/ih>sourceRatio){sw=ih*sourceRatio;sx=(iw-sw)/2}else{sh=iw/sourceRatio;sy=(ih-sh)/2}
 return {sx,sy,sw,sh};
}
function draw(){
 if(!state.img)return;
 const [ow,oh]=getOutputSize(), maxPreview=1400, scale=Math.min(1,maxPreview/Math.max(ow,oh));
 const pw=Math.max(1,Math.round(ow*scale)),ph=Math.max(1,Math.round(oh*scale));
 canvas.width=pw;canvas.height=ph;
 const {sx,sy,sw,sh}=cropSource();
 ctx.save();ctx.clearRect(0,0,pw,ph);
 if($("#bgMode").value==="solid"){ctx.fillStyle=$("#bgColor").value;ctx.fillRect(0,0,pw,ph)}
 ctx.translate(pw/2,ph/2);ctx.rotate(state.rotation*Math.PI/180);ctx.scale(state.flip?-1:1,1);
 // Crop region is calculated in source orientation; rotate image into the target frame.
 const targetRatio=pw/ph;
 let dw=pw,dh=ph;
 ctx.filter=`brightness(${state.brightness}%) contrast(${state.contrast}%) saturate(${state.saturation}%)`;
 ctx.drawImage(state.img,sx,sy,sw,sh,-dw/2,-dh/2,dw,dh);
 ctx.restore();ctx.filter="none";
 if(state.warmth!==0||state.fade!==0||state.preset==="mono"){
  const image=ctx.getImageData(0,0,pw,ph),d=image.data;
  for(let i=0;i<d.length;i+=4){
   let r=d[i],g=d[i+1],b=d[i+2];
   if(state.warmth){r+=state.warmth*.65;b-=state.warmth*.55;g+=state.warmth*.08}
   if(state.fade){r=r*(1-state.fade/100)+state.fade*1.7;g=g*(1-state.fade/100)+state.fade*1.7;b=b*(1-state.fade/100)+state.fade*1.7}
   d[i]=Math.max(0,Math.min(255,r));d[i+1]=Math.max(0,Math.min(255,g));d[i+2]=Math.max(0,Math.min(255,b));
  }ctx.putImageData(image,0,0);
 }
 setText("#imageDimensions",`${state.img.width} × ${state.img.height} px`);
 setText("#sizeReadout",`আউটপুট: ${ow} × ${oh} px · ${$("#dpi").value} DPI`);
}
function loadFile(file){
 if(!file)return;
 if(!/^image\/(jpeg|png|webp)$/.test(file.type)){alert("JPG, PNG অথবা WEBP ছবি নির্বাচন করুন।");return}
 if(file.size>20*1024*1024){alert("ছবির সাইজ ২০ MB-এর মধ্যে রাখুন।");return}
 if(objectUrl)URL.revokeObjectURL(objectUrl);
 objectUrl=URL.createObjectURL(file);const img=new Image();
 img.onload=()=>{state.img=img;state.name=file.name;state.rotation=0;state.flip=false;$("#emptyState").hidden=true;canvas.hidden=false;$("#downloadBtn").disabled=false;$("#printBtn").disabled=false;setText("#fileInfo",`${file.name} · ${(file.size/1024/1024).toFixed(2)} MB`);draw()};
 img.onerror=()=>alert("ছবিটি খোলা যায়নি। অন্য ছবি চেষ্টা করুন।");img.src=objectUrl;
}
$("#photoInput").addEventListener("change",e=>loadFile(e.target.files[0]));
const drop=$("#dropZone");["dragenter","dragover"].forEach(n=>drop.addEventListener(n,e=>{e.preventDefault();drop.classList.add("drag")}));["dragleave","drop"].forEach(n=>drop.addEventListener(n,e=>{e.preventDefault();drop.classList.remove("drag")}));drop.addEventListener("drop",e=>loadFile(e.dataTransfer.files[0]));
document.querySelectorAll("[data-filter]").forEach(input=>input.addEventListener("input",()=>{const k=input.dataset.filter;state[k]=+input.value;setText(`#${k}Out`,input.value);state.preset="custom";draw()}));
function applyPreset(name){Object.assign(state,presets[name]);state.preset=name;document.querySelectorAll("[data-filter]").forEach(el=>{el.value=state[el.dataset.filter];setText(`#${el.dataset.filter}Out`,el.value)});draw()}
document.querySelectorAll("[data-preset]").forEach(b=>b.addEventListener("click",()=>applyPreset(b.dataset.preset)));
$("#resetAdjust").onclick=()=>applyPreset("natural");
$("#sizePreset").addEventListener("change",()=>{$("#customSize").hidden=$("#sizePreset").value!=="custom";draw()});
["dpi","customW","customH","bgMode","bgColor"].forEach(id=>$("#"+id).addEventListener("input",draw));
$("#quality").addEventListener("input",e=>setText("#qualityValue",e.target.value+"%"));
$("#rotateLeft").onclick=()=>{state.rotation=(state.rotation+270)%360;draw()};
$("#rotateRight").onclick=()=>{state.rotation=(state.rotation+90)%360;draw()};
$("#flipBtn").onclick=()=>{state.flip=!state.flip;draw()};
$("#fitBtn").onclick=()=>{if(state.img)draw()};
$("#centerCrop").onclick=draw;
$("#resetCrop").onclick=()=>{$("#sizePreset").value="original";$("#customSize").hidden=true;draw()};
document.querySelectorAll(".tab").forEach(tab=>tab.onclick=()=>{document.querySelectorAll(".tab").forEach(t=>t.classList.toggle("active",t===tab));["adjust","presets","crop"].forEach(id=>$("#tab-"+id).hidden=id!==tab.dataset.tab)});
function renderExport(){
 const [w,h]=getOutputSize();if(w*h>40000000)throw new Error("নির্বাচিত আউটপুট সাইজ খুব বড়। কম DPI নির্বাচন করুন।");
 const out=document.createElement("canvas");out.width=w;out.height=h;const c=out.getContext("2d");
 const {sx,sy,sw,sh}=cropSource();if($("#bgMode").value==="solid"){c.fillStyle=$("#bgColor").value;c.fillRect(0,0,w,h)}
 c.save();c.translate(w/2,h/2);c.rotate(state.rotation*Math.PI/180);c.scale(state.flip?-1:1,1);
 c.filter=`brightness(${state.brightness}%) contrast(${state.contrast}%) saturate(${state.saturation}%)`;
 c.drawImage(state.img,sx,sy,sw,sh,-w/2,-h/2,w,h);c.restore();c.filter="none";
 if(state.warmth||state.fade){const im=c.getImageData(0,0,w,h),d=im.data;for(let i=0;i<d.length;i+=4){let r=d[i],g=d[i+1],b=d[i+2];r+=state.warmth*.65-state.fade*.0;b-=state.warmth*.55;g+=state.warmth*.08;const f=state.fade/100;r=r*(1-f)+state.fade*1.7;g=g*(1-f)+state.fade*1.7;b=b*(1-f)+state.fade*1.7;d[i]=Math.max(0,Math.min(255,r));d[i+1]=Math.max(0,Math.min(255,g));d[i+2]=Math.max(0,Math.min(255,b))}c.putImageData(im,0,0)}
 return out;
}
$("#downloadBtn").onclick=()=>{try{const out=renderExport(),type=$("#format").value,q=+$("#quality").value/100;out.toBlob(blob=>{if(!blob){alert("ফাইল তৈরি করা যায়নি।");return}const a=document.createElement("a"),url=URL.createObjectURL(blob);a.href=url;a.download=(state.name.replace(/\.[^.]+$/,"")||"photo")+"_edited."+({ "image/jpeg":"jpg","image/png":"png","image/webp":"webp"}[type]);a.click();setTimeout(()=>URL.revokeObjectURL(url),1500)},type,q)}catch(e){alert(e.message)}};
$("#printBtn").onclick=()=>{try{const out=renderExport(),url=out.toDataURL("image/png"),win=window.open("","_blank");if(!win){alert("প্রিন্টের জন্য পপ-আপ অনুমতি দিন।");return}win.document.write(`<html><head><title>Photo Print</title><style>@page{margin:10mm}body{margin:0;display:grid;place-items:center;min-height:95vh}img{max-width:100%;max-height:95vh;object-fit:contain}</style></head><body><img src="${url}" onload="setTimeout(()=>window.print(),300)"></body></html>`);win.document.close()}catch(e){alert(e.message)}};
$("#resetAll").onclick=()=>{if(!state.img)return;state.rotation=0;state.flip=false;$("#sizePreset").value="original";$("#customSize").hidden=true;$("#bgMode").value="original";$("#bgColor").value="#ffffff";applyPreset("natural")};
$("#quality").dispatchEvent(new Event("input"));
})();