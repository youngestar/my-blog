import{c as t,a as o,m as s,f as r,b as a,r as e,o as i,d as l}from"./astro/server_Cr3L-o0H.mjs";import{$ as c}from"./_astro_assets_Cenp1MQy.mjs";import n from"dayjs";import{D as d}from"./config_BS5eD5l5.mjs";import{a as p,$ as m}from"./PostFilter_DUbZqfoq.mjs";import{$ as f,a as g}from"./BaseLayout_CQzFYZn-.mjs";/* empty css                         */const u=t("https://frosti.saroprock.com"),v=o(((t,o,e)=>{const i=t.createAstro(u,o,e);i.self=v;const{url:l,title:c}=i.props;return a`${s()}<a${r(l,"href")} target="_self" class="block hover:-translate-y-0.5 transition-transform duration-300"> <h2${r(c,"id")} class="frosti-heading"> ${c} </h2> </a>`}),"D:/我滴作业/blog/Frosti/src/components/widgets/Heading.astro",void 0),$=t("https://frosti.saroprock.com"),b=o(((t,o,i)=>{const l=t.createAstro($,o,i);l.self=b;const{title:u,image:h,pubDate:w,description:x,badge:_,categories:j=[],tags:y=[],word:k="0",time:D="0",url:C=decodeURIComponent(l.url.toString())}=l.props,F=w?n(w).format(d):"";return a`${e(t,"Card",f,{class:"overflow-hidden"},{default:t=>a` ${s()}<div class="flex flex-col lg:flex-row"> <!-- Content Section --> <div class="flex-1 p-6 overflow-hidden bg-base-100 lg:order-1 order-2 flex flex-col justify-between"> <div> ${e(t,"PostInfo",p,{pubDate:F,badge:_,word:k,time:D})} ${e(t,"Heading",v,{url:C,title:u},{default:t=>a`${u}`})} <p class="text-sm text-base-content/70 mb-4">${x}</p> </div> ${e(t,"PostFilter",m,{categories:j,tags:y})} </div> <!-- Image Section --> ${h&&a`<a${r(C,"href")} class="relative lg:w-2/5 aspect-video lg:aspect-auto overflow-hidden lg:order-2 order-1 group"> <div class="absolute inset-0 bg-black/0 group-hover:bg-black/60 z-10 transition-all duration-300 flex items-center justify-center"> ${e(t,"Icon",g,{name:"lucide:arrow-right",class:"w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-2"})} </div> ${e(t,"Image",c,{src:h,alt:u,width:800,height:400,format:"webp",loading:"eager",class:"w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"})} </a>`} </div> `})}`}),"D:/我滴作业/blog/Frosti/src/components/PostCard.astro",void 0),h=t("https://frosti.saroprock.com"),w=o(((t,o,e)=>{const c=t.createAstro(h,o,e);c.self=w;const{class:n="",gap:d="4",cols:p="2"}=c.props,m=i([{gap:d,cols:p}]);return a`${s()}<div${r(`card-group ${n}`,"class")} data-astro-cid-v7qmzqza${r(m,"style")}> ${l(t,e.default)} </div> `}),"D:/我滴作业/blog/Frosti/src/components/temple/CardGroup.astro",void 0);export{w as $,b as a};
