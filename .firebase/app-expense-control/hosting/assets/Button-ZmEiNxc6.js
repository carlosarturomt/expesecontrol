import{r as b,j as e,I as r,N as y}from"./index-CfeFimoS.js";const j=({onClick:i,disabled:t,text:l,bgColor:a,isSubmit:m})=>e.jsx("button",{type:m?"submit":"button",className:`${a||"bg-main-blue/80"} ${a&&a.includes("bg-main-light")?"text-main-prusia":"text-white"} w-full flex-center gap-1 text-sm font-semibold bg-main-highlight/70 text-white rounded-3xl p-3 transition-colors duration-200 hover:bg-main-primary-dark`,onClick:i,disabled:t,children:l});function w({context:i,data:t,onEdit:l,onDelete:a,expandedGastoId:m,onCardClick:x}){const[s,c]=b.useState(0),h=-50,o=-150,d=n=>{n.currentTarget.startX=n.touches[0].clientX},p=n=>{const u=n.touches[0].clientX-n.currentTarget.startX,g=Math.max(Math.min(u,0),o);c(g)},f=()=>{s<=o?(a(),c(0)):(s<=h&&l(),c(0))};return e.jsxs("div",{className:"relative flex items-center bg-main-dark/5 rounded-3xl overflow-hidden",children:[e.jsxs("div",{className:"relative w-full transition-transform duration-300 rounded-3xl",style:{transform:`translateX(${s}px)`},onTouchStart:d,onTouchMove:p,onTouchEnd:f,children:[e.jsxs("div",{className:`flex justify-between items-center p-4 ${s==-150&&"w-11/12"}`,onClick:()=>x(t.id),children:[e.jsx("span",{className:"text-main-dark font-medium",children:t.title}),e.jsxs("span",{className:"text-main-primary font-semibold",children:["-",new Intl.NumberFormat("es-MX",{style:"currency",currency:"MXN"}).format(t.gasto)]})]}),m===t.id&&e.jsxs("div",{className:"px-4 pb-4 text-sm text-main-dark/60",children:[t.createdAt&&e.jsxs("p",{className:"flex flex-col pb-2 border-b border-main-dark/20",children:[e.jsx("strong",{className:"font-medium text-main-dark",children:"Fecha"}),t.createdAt.toDate().toLocaleDateString()]}),t.remarks&&e.jsxs("p",{className:"flex flex-col py-2 border-b border-main-dark/20",children:[e.jsx("strong",{className:"font-medium text-main-dark",children:"Notas"}),t.remarks]}),e.jsxs("div",{className:"flex items-center pt-3 gap-2 flex-wrap",children:[t.type&&e.jsx("p",{className:"w-fit flex flex-col py-1 px-2 rounded-3xl text-main-light bg-main-highlight",children:t.type.includes("card")&&e.jsxs("span",{className:"flex-center gap-1",children:[e.jsx("i",{className:"w-4 h-4 flex-center",children:r.credit_card.border("#F5F6FA")}),t.type=="card1"&&i.paymentTypes.card1||t.type=="card2"&&i.paymentTypes.card2||t.type=="cash"&&"efectivo"]})}),t.category&&e.jsx("p",{className:"w-fit flex flex-col py-1 px-2 rounded-3xl text-main-light bg-main-primary",children:t.category=="feeding"&&e.jsxs("span",{className:"flex-center gap-1",children:[e.jsx("i",{className:"w-4 h-4 flex-center",children:r.restaurant.fill("#F5F6FA")}),"Alimentación y Bebidas"]})||t.category=="transportation"&&e.jsxs("span",{className:"flex-center gap-1",children:[e.jsx("i",{className:"w-4 h-4 flex-center",children:r.transportation.border("#F5F6FA")}),"Transporte"]})||t.category=="personalCare"&&e.jsxs("span",{className:"flex-center gap-1",children:[e.jsx("i",{className:"w-4 h-4 flex-center",children:r.care.border("#F5F6FA")}),"Ropa y Cuidado Personal"]})||t.category=="entertainment"&&e.jsxs("span",{className:"flex-center gap-1",children:[e.jsx("i",{className:"w-4 h-4 flex-center",children:r.theater_masks.border("#F5F6FA")}),"Entretenimiento y Ocio"]})||t.category=="housing"&&e.jsxs("span",{className:"flex-center gap-1",children:[e.jsx("i",{className:"w-4 h-4 flex-center",children:r.house.border("#F5F6FA")}),"Vivienda"]})}),t.fileURL&&e.jsxs(y,{to:t.fileURL,target:"_blank",className:"w-fit flex-center gap-1 py-1 px-2 rounded-3xl text-main-light bg-main-dark",children:[e.jsx("i",{className:"w-4 h-4 flex-center",children:r.ticket.border("#F5F6FA")}),"ticket"]})]})]})]}),e.jsx("div",{className:`absolute inset-y-0 bg-main-highlight/70 text-white flex items-center justify-center transition-all duration-300 ${s==-150?"right-1/4":"right-0"}`,style:{width:`${Math.abs(s)>=Math.abs(h)?"25%":"0%"}`,opacity:Math.abs(s)>=Math.abs(h)?1:0},onClick:l,children:"Editar"}),e.jsx("div",{className:"absolute inset-y-0 right-0 bg-main-primary/70 text-white flex items-center justify-center transition-all duration-300",style:{width:`${Math.abs(s)>=Math.abs(o)?"25%":"0%"}`,opacity:Math.abs(s)>=Math.abs(o)?1:0},onClick:a,children:"Eliminar"})]})}export{w as S,j as a};