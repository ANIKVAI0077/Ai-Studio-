(()=>{"use strict";
const $=s=>document.querySelector(s), canvas=$("#preview"),ctx=canvas.getContext("2d",{willReadFrequently:true});
const state={items:[],active:0};
const bn=n=>String(n).replace(/\d/g,d=>"০১২৩৪৫৬৭৮৯"[d]);
const item=()=>state.items[state.active]||null;
const defaults=()=>({zoom:1,panX:0,panY:0,rotate:0,brightness:100,contrast:100,saturation:100,warmth:0,result:null});
function outputSize(){
 const dpi=+$("#dpi").value,v=$("#size").value;
 if(v==="original"&&item())return [item().img.naturalWidth,item().img.naturalHeight];
 let w=35,h=45;if(v==="square")w=h=50.8;else if(v==="custom"){w=Math.max(10,+$("#customW").value||35);h=Math.max(10,+$("#customH").value||45)}
 return [Math.round(w/25.4*dpi),Math.round(h/25.4*dpi)];
}
function ratio(){const [w,h]=outputSize();return w/h}
function cropRect(img, targetRatio, controls){
 let iw=img.naturalWidth,ih=img.naturalHeight,rot=controls.rotate*Math.PI/180;
 // Compute in the rotated coordinate system.
 const cos=Math.abs(Math.cos(rot)),sin=Math.abs(Math.sin(rot));
 const rw=iw*cos+ih*sin,rh=iw*sin+ih*cos;
 let cw,ch;if(rw/rh>targetRatio){ch=rh;cw=ch*targetRatio}else{cw=rw;ch=cw/targetRatio}
 cw/=controls.zoom;ch/=controls.zoom;
 const maxX=Math.max(0,(rw-cw)/2),maxY=Math.max(0,(rh-ch)/2);
 const cx=rw/2+(controls.panX/100)*maxX,cy=rh/2+(controls.panY/100)*maxY;
 return {rw,rh,cw,ch,cx,cy};
}
function drawTo(target,im,opts,w,h){
 const c=target.getContext("2d");target.width=w;target.height=h;
 const bg=$("#background").value,colors={white:"#ffffff",blue:"#d9eaff",red:"#f3dddd",gray:"#e8e8e8"};
 if(bg!=="original"){c.fillStyle=colors[bg];c.fillRect(0,0,w,h)}
 const r=cropRect(im,w/h,opts);
 const rotated=document.createElement("canvas");rotated.width=Math.ceil(r.rw);rotated.height=Math.ceil(r.rh);
 const rc=rotated.getContext("2d");rc.translate(rotated.width/2,rotated.height/2);rc.rotate(opts.rotate*Math.PI/180);rc.drawImage(im,-im.naturalWidth/2,-im.naturalHeight/2);
 c.filter=`brightness(${opts.brightness}%) contrast(${opts.contrast}%) saturate(${opts.saturation}%)`;
 c.drawImage(rotated,r.cx-r.cw/2,r.cy-r.ch/2,r.cw,r.ch,0,0,w,h);c.filter="none";
 if(opts.warmth){const d=c.getImageData(0,0,w,h),a=d.data,k=opts.warmth;for(let i=0;i<a.length;i+=4){a[i]=Math.max(0,Math.min(255,a[i]+k*.7));a[i+1]=Math.max(0,Math.min(255,a[i+1]+k*.08));a[i+2]=Math.max(0,Math.min(255,a[i+2]-k*.65))}c.putImageData(d,0,0)}
}
function renderPreview(){
 const it=item();if(!it)return;
 const [w,h]=outputSize(),scale=Math.min(1,900/Math.max(w,h));
 drawTo(canvas,it.img,it,w*scale|0,h*scale|0);
 canvas.hidden=false;$(".empty-preview").hidden=true;
 $("#previewDims").textContent=`${it.img.naturalWidth} × ${it.img.naturalHeight} px`;
 $("#editingLabel").textContent=`ছবি ${bn(state.active+1)} / ${bn(state.items.length)}`;
 const labels={zoom:["#zoomOut",it.zoom.toFixed(2)+"×"],panX:["#panXOut",it.panX],panY:["#panYOut",it.panY],rotate:["#rotateOut",it.rotate+"°"],brightness:["#brightOut",it.brightness+"%"],contrast:["#contrastOut",it.contrast+"%"],saturation:["#satOut",it.saturation+"%"],warmth:["#warmOut",it.warmth]};
 Object.entries(labels).forEach(([k,[sel,val]])=>$(sel).textContent=val);
 updateSizeInfo();
}
function updateSizeInfo(){const [w,h]=outputSize(),dpi=$("#dpi").value,v=$("#size").value;let label=v==="passport"?"৩৫ × ৪৫ মিমি":v==="nid"?"৩৫ × ৪৫ মিমি":v==="square"?"২ × ২ ইঞ্চি":v==="custom"?`${$("#customW").value} × ${$("#customH").value} মিমি`:"অরিজিনাল অনুপাত";$("#sizeInfo").textContent=`${label} · ${dpi} DPI · ${w} × ${h} px`;}
function updateQueue(){
 $("#photoCount").textContent=bn(state.items.length)+" / ২০ ছবি";$("#clearAll").disabled=!state.items.length;$("#generate").disabled=!state.items.length;
 const q=$("#photoQueue");q.innerHTML="";
 if(!state.items.length){q.innerHTML='<div class="queue-empty">এখনো কোনো ছবি যোগ করা হয়নি</div>';return}
 state.items.forEach((it,i)=>{const b=document.createElement("button");b.className="queue-item"+(i===state.active?" active":"");b.innerHTML=`<img src="${it.url}" alt=""><span>${escapeHtml(it.file.name)}</span><button class="remove-photo" type="button" aria-label="ছবি বাদ দিন">×</button>`;b.addEventListener("click",e=>{if(e.target.classList.contains("remove-photo")){removeItem(i);return}state.active=i;syncControls();renderPreview();updateQueue()});q.appendChild(b)});
}
function escapeHtml(s){return s.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function removeItem(i){URL.revokeObjectURL(state.items[i].url);state.items.splice(i,1);state.active=Math.max(0,Math.min(state.active,state.items.length-1));updateQueue();if(item()){syncControls();renderPreview()}else{canvas.hidden=true;$(".empty-preview").hidden=false;$("#editingLabel").textContent="কোনো ছবি নির্বাচন নেই";$("#previewDims").textContent="কোনো ছবি নেই"}}
function addFiles(files){const allowed=["image/jpeg","image/png","image/webp"];for(const f of files){if(state.items.length>=20){alert("একসঙ্গে সর্বোচ্চ ২০টি ছবি আপলোড করা যাবে।");break}if(!allowed.includes(f.type)){alert(f.name+" — JPG, PNG অথবা WEBP ছবি নির্বাচন করুন।");continue}if(f.size>20*1024*1024){alert(f.name+" — ফাইল ২০ MB-এর বেশি।");continue}if(state.items.some(x=>x.file.name===f.name&&x.file.size===f.size)){continue}
 const url=URL.createObjectURL(f),img=new Image();const it={file:f,url,img,...defaults()};img.onload=()=>{updateQueue();if(state.items.indexOf(it)===state.active)renderPreview()};img.onerror=()=>{alert("ছবিটি পড়া যায়নি: "+f.name);removeItem(state.items.indexOf(it))};img.src=url;state.items.push(it)}
 state.active=Math.max(0,state.items.length-1);updateQueue();syncControls();if(item())renderPreview();}
function syncControls(){const it=item();if(!it)return;["zoom","panX","panY","rotate","brightness","contrast","saturation","warmth"].forEach(k=>$("#"+k).value=it[k]);}
$("#photoInput").addEventListener("change",e=>{addFiles([...e.target.files]);e.target.value=""});
const dz=$("#dropzone");["dragenter","dragover"].forEach(n=>dz.addEventListener(n,e=>{e.preventDefault();dz.classList.add("drag")}));["dragleave","drop"].forEach(n=>dz.addEventListener(n,e=>{e.preventDefault();dz.classList.remove("drag")}));dz.addEventListener("drop",e=>addFiles([...e.dataTransfer.files]));
$("#clearAll").onclick=()=>{state.items.forEach(x=>URL.revokeObjectURL(x.url));state.items=[];state.active=0;updateQueue();canvas.hidden=true;$(".empty-preview").hidden=false;$("#editingLabel").textContent="কোনো ছবি নির্বাচন নেই";$("#previewDims").textContent="কোনো ছবি নেই";$("#generate").disabled=true;$("#downloadAll").disabled=true;$("#printSheet").disabled=true;$("#resultsGrid").innerHTML='<div class="results-empty">তৈরি করা ছবিগুলো এখানে দেখা যাবে।</div>';};
["zoom","panX","panY","rotate","brightness","contrast","saturation","warmth"].forEach(k=>$("#"+k).addEventListener("input",()=>{const it=item();if(!it)return;it[k]=+$("#"+k).value;renderPreview()}));
$("#centerCrop").onclick=()=>{const it=item();if(!it)return;it.zoom=1;it.panX=0;it.panY=0;["zoom","panX","panY"].forEach(k=>$("#"+k).value=it[k]);renderPreview()};
$("#rotateReset").onclick=()=>{const it=item();if(!it)return;it.rotate=0;$("#rotate").value=0;renderPreview()};
$("#resetColor").onclick=()=>{const it=item();if(!it)return;it.brightness=100;it.contrast=100;it.saturation=100;it.warmth=0;["brightness","contrast","saturation","warmth"].forEach(k=>$("#"+k).value=it[k]);renderPreview()};
$("#size").onchange=()=>{$("#customFields").hidden=$("#size").value!=="custom";renderPreview()};
["dpi","customW","customH"].forEach(k=>$("#"+k).addEventListener("input",renderPreview));
$("#quality").oninput=()=>$("#qualityOut").textContent=$("#quality").value+"%";
function makeBlob(it){const [w,h]=outputSize();if(w*h>30000000)throw Error("আউটপুট সাইজ অনেক বড়। কম DPI বা ছোট সাইজ নির্বাচন করুন।");const out=document.createElement("canvas");drawTo(out,it.img,it,w,h);return new Promise(resolve=>out.toBlob(resolve,$("#format").value,+$("#quality").value/100))}
function fileExt(){return {"image/jpeg":"jpg","image/png":"png","image/webp":"webp"}[$("#format").value]}
function saveBlob(blob,name){const u=URL.createObjectURL(blob),a=document.createElement("a");a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),2000)}
$("#generate").onclick=async()=>{const btn=$("#generate");btn.disabled=true;btn.textContent="ছবি তৈরি হচ্ছে...";const grid=$("#resultsGrid");grid.innerHTML="";let done=0;try{for(let i=0;i<state.items.length;i++){const it=state.items[i];const blob=await makeBlob(it);if(!blob)throw Error("একটি ছবি তৈরি করা যায়নি");if(it.result?.url)URL.revokeObjectURL(it.result.url);it.result={blob,url:URL.createObjectURL(blob),name:`${String(i+1).padStart(2,"0")}_${it.file.name.replace(/\.[^.]+$/,"")}_passport.${fileExt()}`};const card=document.createElement("article");card.className="result-card";card.innerHTML=`<img src="${it.result.url}" alt="Passport photo"><b>${escapeHtml(it.file.name)}</b><div class="result-status">✓ পাসপোর্ট সাইজ তৈরি হয়েছে</div><div class="result-actions"><button class="btn secondary download-one">ডাউনলোড</button><button class="btn light select-one">এডিট</button></div>`;card.querySelector(".download-one").onclick=()=>saveBlob(it.result.blob,it.result.name);card.querySelector(".select-one").onclick=()=>{state.active=i;syncControls();renderPreview();updateQueue();window.scrollTo({top:$("#photoQueue").getBoundingClientRect().top+window.scrollY-90,behavior:"smooth"})};grid.appendChild(card);done++;$("#resultCount").textContent=bn(done)+"টি তৈরি"}$("#downloadAll").disabled=!done;$("#printSheet").disabled=!done;$("#resultsPanel").scrollIntoView({behavior:"smooth",block:"start"})}catch(e){alert(e.message)}finally{btn.disabled=!state.items.length;btn.textContent="✦　পাসপোর্ট সাইজ তৈরি করুন"}};
$("#downloadAll").onclick=async()=>{const ready=state.items.filter(x=>x.result);if(!ready.length)return;if(!window.JSZip){alert("ZIP লাইব্রেরি লোড হয়নি। প্রতিটি ছবির ডাউনলোড বাটন ব্যবহার করুন অথবা ইন্টারনেট সংযোগ দিন।");return}const zip=new JSZip();ready.forEach(it=>zip.file(it.result.name,it.result.blob));const blob=await zip.generateAsync({type:"blob"});saveBlob(blob,"AI-Photo-Studio-Exports.zip")};
$("#printSheet").onclick=()=>{const it=item();if(!it?.result){alert("প্রিন্ট করার আগে একটি ছবি তৈরি করুন এবং ফলাফল থেকে ছবিটি নির্বাচন করুন।");return}const copies=+$("#copies").value,dpi=300,w=1200,h=1800;const sheet=document.createElement("canvas");sheet.width=w;sheet.height=h;const c=sheet.getContext("2d");c.fillStyle="#fff";c.fillRect(0,0,w,h);const img=new Image();img.onload=()=>{const cols=copies===1?1:2,rows=Math.ceil(copies/cols),cellW=w/cols,cellH=h/rows,iw=413,ih=531;for(let i=0;i<copies;i++){const col=i%cols,row=Math.floor(i/cols),x=col*cellW+(cellW-iw)/2,y=row*cellH+(cellH-ih)/2;c.drawImage(img,x,y,iw,ih)}const url=sheet.toDataURL("image/png"),win=window.open("","_blank");if(!win){alert("প্রিন্টের জন্য পপ-আপ অনুমতি দিন।");return}win.document.write(`<html><head><title>4x6 Passport Print Sheet</title><style>@page{size:4in 6in;margin:0}html,body{margin:0;width:4in;height:6in}img{width:4in;height:6in;display:block}</style></head><body><img src="${url}" onload="setTimeout(()=>window.print(),300)"></body></html>`);win.document.close()};img.src=it.result.url};
$("#dpi").dispatchEvent(new Event("input"));$("#quality").dispatchEvent(new Event("input"));
})();