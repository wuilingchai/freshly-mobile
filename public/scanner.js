/* Local image OCR: Tesseract.js runs in the browser. Photos are not sent to Freshly's backend. */
(function(root){
'use strict';
const CDN='https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js';
const CATEGORIES=[
 ['Medicine',/\b(tablets?|capsules?|mg|paracetamol|ibuprofen|antibiotic|supplement|vitamin|medicine|pharmacy|oral suspension|cough syrup|dosage)\b/i],
 ['Skincare & Beauty',/\b(shampoo|conditioner|serum|moisturi[sz]er|sunscreen|spf|cleanser|lipstick|foundation|toner|skincare|face cream|body lotion|cosmetic|fragrance|mascara)\b/i],
 ['Household',/\b(detergent|disinfectant|bleach|laundry|fabric softener|dishwashing|floor cleaner|toilet cleaner|air freshener|surface cleaner)\b/i],
 ['Food & Drinks',/\b(milk|yogurt|chocolate|biscuits?|cookies?|juice|coffee|tea|rice|noodles?|bread|cheese|cereal|snack|sauce|water|drink|sugar|flour|chips|nutritional facts|ingredients)\b/i]
];
function cleanLine(s){return s.replace(/[^\p{L}\p{N} &'().,/\-:+]/gu,' ').replace(/\s+/g,' ').trim()}
function extract(text){
 const lines=String(text||'').split(/\r?\n/).map(cleanLine).filter(Boolean);
 const combined=lines.join(' ');
 let category='Other';for(const [name,re] of CATEGORIES)if(re.test(combined)){category=name;break;}
 const skipped=/^(ingredients|nutrition|nutrition facts|expiry|expires|exp date|exp\b|best before|bb\b|manufactured|mfg\b|net wt|net weight|volume|batch|lot|made in|warning|directions|storage|barcode|www\.|https?:|keep refrigerated|serving|contains|product of|use by)/i;
 const candidates=lines.filter(x=>x.length>=3&&x.length<=65&&/[a-zA-Z\p{L}]{3}/u.test(x)&&!skipped.test(x)&&!/^\d/.test(x)&&!(/^(?:\d+\s*)?(?:ml|mg|g|kg|oz|l)\b/i.test(x)));
 const name=(candidates[0]||'').slice(0,80);
 let expiry='';
 const labelled=/(?:exp(?:iry|iration|ires)?\.?|best\s*before|use\s*by|bb\.?|b\/b)\s*(?:date)?\s*[:\-]?\s*(\d{1,4}[.\/-]\d{1,2}(?:[.\/-]\d{2,4})?)/ig;
 let match;while((match=labelled.exec(combined))){const date=parseDate(match[1]);if(date){expiry=date;break;}}
 return {name,category,expiry};
}
function parseDate(s){const x=s.split(/[.\/-]/).map(Number);if(x.length!==3)return '';
 let [a,b,c]=x,y,m,d;
 if(a>1900){y=a;m=b;d=c}else{d=a;m=b;y=c<100?2000+c:c}
 if(y<2020||y>2100||m<1||m>12||d<1||d>31)return '';
 const z=new Date(Date.UTC(y,m-1,d));if(z.getUTCFullYear()!==y||z.getUTCMonth()!==m-1||z.getUTCDate()!==d)return '';
 return `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
}
let loadPromise;
async function recognize(file,onProgress){
 if(!root.document)throw Error('OCR only works in a browser');
 if(!loadPromise)loadPromise=new Promise((resolve,reject)=>{const tag=root.document.createElement('script');tag.src=CDN;tag.crossOrigin='anonymous';tag.onload=resolve;tag.onerror=()=>reject(Error('Could not load OCR library. Check your internet connection.'));root.document.head.appendChild(tag)}).catch(e=>{loadPromise=null;throw e});
 await loadPromise;
 const worker=await root.Tesseract.createWorker('eng',1,{logger:msg=>{if(msg.status==='recognizing text'&&onProgress)onProgress(msg.progress)}});
 try{const result=await worker.recognize(file);return result.data.text||''}finally{await worker.terminate()}
}
const api={extract,recognize,parseDate};root.FreshlyScanner=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
