/* empty css                                   */import{c as a,a as t,r as e,b as s,m as r}from"../../chunks/astro/server_Cr3L-o0H.mjs";import{$ as i,a as o}from"../../chunks/CardGroup_BwAz8DNY.mjs";import{b as l,a as c}from"../../chunks/BaseLayout_CQzFYZn-.mjs";import{$ as d}from"../../chunks/Pagination_CDohsJUq.mjs";import{g as n}from"../../chunks/_astro_content_Cp5fOLG1.mjs";import{t as g}from"../../chunks/config_BS5eD5l5.mjs";export{renderers}from"../../renderers.mjs";const p=a("https://frosti.saroprock.com");const u=t((async(a,t,n)=>{const h=a.createAstro(p,t,n);h.self=u;const{page:m}=h.props;const v=Math.ceil(m.total/m.size),b=function(a){const t={active:[],hidden:[]};if(a>3){t.active.push("1"),t.active.push("..."),t.active.push(a.toString());for(let e=2;e<=a-1;e++)t.hidden.push(e.toString())}else for(let e=1;e<=a;e++)t.active.push(e.toString());return t}(v);return s`${e(a,"BaseLayout",l,{title:"Blog"},{default:async a=>s`  ${r()}<div class="grid grid-cols-1 md:grid-cols-2 gap-4"> <!-- Archives Card --> <a href="/blog/archives" class="card bg-base-100 shadow-lg hover:shadow-xl transition-transform duration-300 ease-in-out hover:-translate-y-1"> <div class="card-body p-4"> <div class="flex items-center gap-3"> <div class="rounded-full bg-accent/10 p-3"> ${e(a,"Icon",c,{name:"lucide:archive",class:"w-6 h-6 text-accent"})} </div> <div> <h2 class="card-title text-lg">${g("label.archivePage")}</h2> <p class="text-sm opacity-75">${g("label.archivesPageDescription")}</p> </div> </div> </div> </a> <!-- Categories Card --> <a href="/blog/categories" class="card bg-base-100 shadow-lg hover:shadow-xl transition-transform duration-300 ease-in-out hover:-translate-y-1"> <div class="card-body p-4"> <div class="flex items-center gap-3"> <div class="rounded-full bg-primary/10 p-3"> ${e(a,"Icon",c,{name:"lucide:folder",class:"w-6 h-6 text-primary"})} </div> <div> <h2 class="card-title text-lg">${g("label.categoryPage")}</h2> <p class="text-sm opacity-75">${g("label.categoriesPageDescription")}</p> </div> </div> </div> </a> <!-- Tags Card --> <a href="/blog/tags" class="card bg-base-100 shadow-lg hover:shadow-xl transition-transform duration-300 ease-in-out hover:-translate-y-1"> <div class="card-body p-4"> <div class="flex items-center gap-3"> <div class="rounded-full bg-secondary/10 p-3"> ${e(a,"Icon",c,{name:"lucide:tag",class:"w-6 h-6 text-secondary"})} </div> <div> <h2 class="card-title text-lg">${g("label.tagPage")}</h2> <p class="text-sm opacity-75">${g("label.tagsPageDescription")}</p> </div> </div> </div> </a> <!-- Search Card --> <a href="/blog/search" class="card bg-base-100 shadow-lg hover:shadow-xl transition-transform duration-300 ease-in-out hover:-translate-y-1"> <div class="card-body p-4"> <div class="flex items-center gap-3"> <div class="rounded-full bg-info/10 p-3"> ${e(a,"Icon",c,{name:"lucide:search",class:"w-6 h-6 text-info"})} </div> <div> <h2 class="card-title text-lg">${g("label.searchPage")}</h2> <p class="text-sm opacity-75">${g("label.searchPageDescription")}</p> </div> </div> </div> </a> </div>  ${e(a,"CardGroup",i,{cols:"1",gap:"6"},{default:async a=>s`${m.data.map((t=>s`${e(a,"PostCard",o,{title:t.data.title,image:t.data.image,description:t.data.description,url:"/blog/"+t.slug,pubDate:t.data.pubDate,badge:t.data.badge,categories:t.data.categories,tags:t.data.tags,word:t.remarkPluginFrontmatter.totalCharCount,time:t.remarkPluginFrontmatter.readingTime})}`))}`})} ${e(a,"Pagination",d,{page:m,totalPages:v,pageLinks:b,baseUrl:"/blog"})} `})}`}),"D:/我滴作业/blog/Frosti/src/pages/blog/[...page].astro",void 0),h=Object.freeze(Object.defineProperty({__proto__:null,default:u,file:"D:/我滴作业/blog/Frosti/src/pages/blog/[...page].astro",getStaticPaths:async function({paginate:a}){const t=(await n("blog")).filter((a=>!a.data.draft)),e=t.filter((a=>"Pin"===a.data.badge)),s=t.filter((a=>"Pin"!==a.data.badge));e.sort(((a,t)=>t.data.pubDate.valueOf()-a.data.pubDate.valueOf())),s.sort(((a,t)=>t.data.pubDate.valueOf()-a.data.pubDate.valueOf()));const r=[...e,...s];return a(await Promise.all(r.map((async a=>{const{remarkPluginFrontmatter:t}=await a.render();return{...a,remarkPluginFrontmatter:{readingTime:t.readingTime,totalCharCount:t.totalCharCount}}}))),{pageSize:8})},url:"/blog/[...page]"},Symbol.toStringTag,{value:"Module"})),m=()=>h;export{m as page};
