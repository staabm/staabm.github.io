import{d,i as p,a as _,u as h,b as u,c as m,e as f,f as n,g as t,t as a,h as o,F as g,r as v,n as x,j as b,o as l,k as y,l as k,m as N,p as w,q as P,_ as S}from"./index-adf09b6b.js";import{N as V}from"./NoteDisplay-59733385.js";const j={class:"m-4"},L={class:"mb-10"},T={class:"text-4xl font-bold mt-2"},B={class:"opacity-50"},C={class:"text-lg"},D={class:"font-bold flex gap-2"},H={class:"opacity-50"},z=t("div",{class:"flex-auto"},null,-1),F={key:0,class:"border-gray-400/50 mb-8"},M=d({__name:"PresenterPrint",setup(q){p(_),h(`
@page {
  size: A4;
  margin-top: 1.5cm;
  margin-bottom: 1cm;
}
* {
  -webkit-print-color-adjust: exact;
}
html,
html body,
html #app,
html #page-root {
  height: auto;
  overflow: auto !important;
}
`),u({title:`Notes - ${m.title}`});const i=f(()=>b.slice(0,-1).map(s=>{var r;return(r=s.meta)==null?void 0:r.slide}).filter(s=>s!==void 0&&s.noteHTML!==""));return(s,r)=>(l(),n("div",{id:"page-root",style:x(o(P))},[t("div",j,[t("div",L,[t("h1",T,a(o(m).title),1),t("div",B,a(new Date().toLocaleString()),1)]),(l(!0),n(g,null,v(o(i),(e,c)=>(l(),n("div",{key:c,class:"flex flex-col gap-4 break-inside-avoid-page"},[t("div",null,[t("h2",C,[t("div",D,[t("div",H,a(e==null?void 0:e.no)+"/"+a(o(y)),1),k(" "+a(e==null?void 0:e.title)+" ",1),z])]),N(V,{"note-html":e.noteHTML,class:"max-w-full"},null,8,["note-html"])]),c<o(i).length-1?(l(),n("hr",F)):w("v-if",!0)]))),128))])],4))}}),R=S(M,[["__file","/Users/staabm/workspace/slide-decks/phpstan-dba@phpugffm/node_modules/@slidev/client/internals/PresenterPrint.vue"]]);export{R as default};
