class g extends HTMLElement{abortController=null;githubToken="";connectedCallback(){this.abortController=new AbortController;const t=this.getAttribute("data-username"),e=this.getAttribute("data-repo");t&&(e&&e?this.fetchRepoData(t,e,this.abortController.signal):this.fetchUserData(t,this.abortController.signal))}disconnectedCallback(){this.abortController&&(this.abortController.abort(),this.abortController=null)}getRequestOptions(t){const e={Accept:"application/vnd.github.v3+json"};return this.githubToken&&(e.Authorization=`token ${this.githubToken}`),{method:"GET",headers:e,signal:t}}async fetchWithRetry(t,e,r=2){try{const r=await fetch(t,e);if(403===r.status&&"0"===r.headers.get("X-RateLimit-Remaining")){const t=r.headers.get("X-RateLimit-Reset"),e=t?new Date(1e3*parseInt(t)):new Date;throw console.warn(`GitHub API rate limit exceeded. Resets at ${e.toLocaleTimeString()}`),new Error("GitHub API rate limit exceeded")}return r}catch(a){if(r<=0||a instanceof DOMException&&"AbortError"===a.name)throw a;return await new Promise((t=>setTimeout(t,1e3))),this.fetchWithRetry(t,e,r-1)}}getCachedData(t){try{const e=localStorage.getItem(`github-stats:${t}`);if(e){const{data:t,timestamp:r}=JSON.parse(e);if(Date.now()-r<864e5)return t}}catch(t){console.warn("Error reading from cache:",t)}return null}cacheData(t,e){try{localStorage.setItem(`github-stats:${t}`,JSON.stringify({data:e,timestamp:Date.now()}))}catch(t){console.warn("Error writing to cache:",t)}}async fetchRepoData(t,e,r){const a=`repo:${t}/${e}`,o=this.getCachedData(a);if(o)return console.log("Using cached repository data"),this.updateRepoUI(o),void this.renderCommitGraph();this.showLoading();try{const o=`https://api.github.com/repos/${t}/${e}`,s=await this.fetchWithRetry(o,this.getRequestOptions(r));if(!s.ok)throw new Error(`Failed to fetch repository data: ${s.status}`);const i=await s.json();this.cacheData(a,i),this.updateRepoUI(i),this.renderCommitGraph()}catch(t){if(t instanceof DOMException&&"AbortError"===t.name)console.log("Fetch aborted");else{console.error("Error fetching repository data:",t);let e="Failed to load repository data";t instanceof Error&&t.message.includes("rate limit")?e="GitHub API rate limit exceeded. Please try again later.":t instanceof Error&&t.message.includes("403")&&(e="Access to GitHub API is restricted. This might be due to rate limiting."),this.showError(e)}}}async fetchUserData(t,e){const r=`user:${t}`,a=this.getCachedData(r);if(a)return console.log("Using cached user data"),void this.updateUserUI(a.userData,a.totalStars);this.showLoading();try{const a=`https://api.github.com/users/${t}`,o=await this.fetchWithRetry(a,this.getRequestOptions(e));if(!o.ok)throw new Error(`Failed to fetch user data: ${o.status}`);const s=await o.json();let i=0;for(let r=1;r<=5;r++){const a=`https://api.github.com/users/${t}/repos?per_page=100&page=${r}`,o=await this.fetchWithRetry(a,this.getRequestOptions(e));if(!o.ok)break;const s=await o.json();if(0===s.length)break;s.forEach((t=>{i+=t.stargazers_count||0}))}this.cacheData(r,{userData:s,totalStars:i}),this.updateUserUI(s,i)}catch(t){if(t instanceof DOMException&&"AbortError"===t.name)console.log("Fetch aborted");else{console.error("Error fetching user data:",t);let e="Failed to load user data";t instanceof Error&&t.message.includes("rate limit")?e="GitHub API rate limit exceeded. Please try again later.":t instanceof Error&&t.message.includes("403")&&(e="Access to GitHub API is restricted. This might be due to rate limiting."),this.showError(e)}}}showLoading(){}updateRepoUI(t){const e=this.querySelector(".gh-description");if(e&&(e.textContent=t.description||"No description provided"),this.updateTextContent(".gh-stars",this.formatNumber(t.stargazers_count)),this.updateTextContent(".gh-forks",this.formatNumber(t.forks_count)),this.updateTextContent(".gh-watchers",this.formatNumber(t.subscribers_count||t.watchers_count)),t.created_at&&this.updateTextContent(".gh-created",`Created: ${this.formatDate(t.created_at)}`),t.updated_at&&this.updateTextContent(".gh-updated",`Updated: ${this.formatDate(t.updated_at)}`),t.default_branch&&this.updateTextContent(".gh-branch",`Default: ${t.default_branch}`),t.license&&t.license.name){const e=this.querySelector(".gh-license span:last-child");if(e){const r=t.license.name;e.textContent=r,e instanceof HTMLElement&&(e.title=r)}}if(t.owner&&t.owner.avatar_url){const e=this.querySelector(".gh-avatar");e&&(e.src=t.owner.avatar_url)}}updateUserUI(t,e){const r=this.querySelector(".gh-description");if(r&&(r.textContent=t.bio||`GitHub profile for ${t.login}`),this.updateTextContent(".gh-stars",this.formatNumber(e)),this.updateTextContent(".gh-forks",this.formatNumber(t.public_repos)),this.updateTextContent(".gh-watchers",this.formatNumber(t.followers)),t.avatar_url){const e=this.querySelector(".gh-avatar");e&&(e.src=t.avatar_url)}}renderCommitGraph(){const t=this.querySelector(".gh-commit-graph");if(!t)return;const e=t.querySelector(".grid");if(e){e.innerHTML="";for(let t=0;t<56;t++){const t=document.createElement("div"),r=Math.floor(5*Math.random());t.className=`w-3 h-3 rounded-sm bg-primary opacity-${20*r||10}`,t.title=`${r} commits`,e.appendChild(t)}}}showError(t){const e=this.querySelector(".gh-description");e&&(e.textContent=t),this.updateTextContent(".gh-stars","-"),this.updateTextContent(".gh-forks","-"),this.updateTextContent(".gh-watchers","-"),this.updateTextContent(".gh-created","Created: -"),this.updateTextContent(".gh-updated","Updated: -"),this.updateTextContent(".gh-branch","Default: -")}updateTextContent(t,e){const r=this.querySelector(t);r&&(r.textContent=e)}formatNumber(t){return t?t>=1e6?(t/1e6).toFixed(1)+"M":t>=1e3?(t/1e3).toFixed(1)+"K":t.toString():"0"}formatDate(t){return new Date(t).toLocaleDateString("en-US",{year:"numeric",month:"short",day:"numeric"})}}customElements.get("github-stats")||customElements.define("github-stats",g);