import{r as g,U as se,j as e,I as m,d as E,b as w,h as ne,a as R,s as $,i as oe,k as le,u as ie,g as ce,c as de,e as ue,f as me}from"./index-DQKeeZrZ.js";import{f as B,C as pe,A as ge,p as be,a as he,b as ye,L as xe,c as fe,d as Ce,e as je,B as ke}from"./index-rr2n4boh.js";import{F as ve,S as we}from"./Button-DyHce3oD.js";pe.register(ge,be,he,ye,xe,fe,Ce,je,ke);function De(){const{loading:N,userAuth:x,userData:r,state:l,setState:b}=g.useContext(se),[j,D]=g.useState([]),[I,V]=g.useState({}),[S,A]=g.useState(null),[F,v]=g.useState("current"),[L,U]=g.useState(null),[h,G]=g.useState(""),[J,_]=g.useState(0),[T,Ne]=g.useState(!0),[P,z]=g.useState(!0),[M,q]=g.useState(!0),Y={card1:r&&r.paymentTypes&&r.paymentTypes.card1,card2:r&&r.paymentTypes&&r.paymentTypes.card2,card3:r&&r.paymentTypes&&r.paymentTypes.card3,card4:r&&r.paymentTypes&&r.paymentTypes.card4,card5:r&&r.paymentTypes&&r.paymentTypes.card5,other:r&&r.paymentTypes&&r.paymentTypes.other,cash:"Efectivo"};g.useEffect(()=>{var o;if(!r||!l.gastos||N)return;const a=parseInt((o=r==null?void 0:r.expenseControl)==null?void 0:o.cutoffDay,10)||12,n=new Date,c=n.getDate(),s=n.getMonth(),d=n.getFullYear();let u,p;switch(F){case"previous":u=new Date(d,s-1,a),p=new Date(d,s,a-1,23,59,59);break;case"year":u=new Date(d,0,1),p=new Date(d,11,31);break;case"all":D(l.gastos.filter(t=>t.title.toLowerCase().includes(h.toLowerCase())||t.remarks.toLowerCase().includes(h.toLowerCase())||t.category.toLowerCase().includes(h.toLowerCase())).sort((t,i)=>i.createdAt-t.createdAt));return;default:u=new Date(d,s-(c<a?1:0),a),p=new Date(u.getFullYear(),u.getMonth()+1,a-1,23,59,59)}const k=l.gastos.filter(t=>{const i=t.createdAt instanceof Date?t.createdAt:t.createdAt.toDate();return i>=u&&i<=p});_(k.reduce((t,i)=>t+(parseFloat(i.gasto)||0),0)),D(k.filter(t=>t.title.toLowerCase().includes(h.toLowerCase())||t.remarks.toLowerCase().includes(h.toLowerCase())||t.category.toLowerCase().includes(h.toLowerCase())).sort((t,i)=>i.createdAt-t.createdAt))},[l.gastos,r,F,N,h]),g.useEffect(()=>{if(j.length===0){A(null);return}const a=j.reduce((t,i)=>(t[i.category]||(t[i.category]=0),t[i.category]+=parseFloat(i.gasto)||0,t),{}),n={feeding:"Alimentación y Bebidas",transportation:"Transporte",health:"Salud y Bienestar",educationJob:"Educación o Trabajo",housing:"Vivienda",entertainment:"Entretenimiento y Ocio",personalCare:"Ropa y Cuidado Personal"},s={labels:Object.keys(a).map(t=>n[t]||t),datasets:[{label:"Gastos por Categoría",data:Object.values(a),backgroundColor:["rgba(255, 99, 132, 0.2)","rgba(255, 159, 64, 0.2)","rgba(255, 205, 86, 0.2)","rgba(75, 192, 192, 0.2)","rgba(54, 162, 235, 0.2)","rgba(153, 102, 255, 0.2)","rgba(201, 203, 207, 0.2)"],borderColor:["rgb(255, 99, 132)","rgb(255, 159, 64)","rgb(255, 205, 86)","rgb(75, 192, 192)","rgb(54, 162, 235)","rgb(153, 102, 255)","rgb(201, 203, 207)"],borderWidth:1}]},d=j.reduce((t,i)=>(t[i.type]||(t[i.type]=0),t[i.type]+=parseFloat(i.gasto)||0,t),{}),u=Object.keys(d),p=Object.values(d),o={labels:u.map(t=>Y[t]||t),datasets:[{label:"Gastos por Tipo de Pago",data:p,backgroundColor:["rgba(201, 203, 207, 0.2)","rgba(153, 102, 255, 0.2)","rgba(54, 162, 235, 0.2)","rgba(75, 192, 192, 0.2)","rgba(255, 205, 86, 0.2)","rgba(255, 159, 64, 0.2)","rgba(255, 99, 132, 0.2)"],borderColor:["rgb(201, 203, 207)","rgb(153, 102, 255)","rgb(54, 162, 235)","rgb(75, 192, 192)","rgb(255, 205, 86)","rgb(255, 159, 64)","rgb(255, 99, 132)"],borderWidth:1}]};V(o),A(s)},[j,h]);const X=async a=>{try{const n=E(w,"userPosts",x.username,"gastos",a),c=await ne(n);if(c.exists()){const s=c.data();b(d=>({...d,gasto:(s==null?void 0:s.gasto)||"",title:(s==null?void 0:s.title)||"",remarks:(s==null?void 0:s.remarks)||"",category:(s==null?void 0:s.category)||"",type:(s==null?void 0:s.type)||"",date:s!=null&&s.createdAt?s.createdAt.toDate().toISOString().substring(0,10):"",fileURL:(s==null?void 0:s.fileURL)||"",isModalOpen:!0,currentGastoId:a}))}else console.error(`El gasto con ID: ${a} no existe.`)}catch(n){console.error("Error al obtener los datos del gasto:",n)}},W=async(a,n,c)=>{if(window.confirm(`¿Estás seguro de que deseas eliminar el gasto "${n.title}" de $${n.gasto}?`))try{const d=E(w,"userPosts",x.username,"gastos",a);if(c&&c.trim()!==""){const u=R($,`userFiles/${x.username}/${c}`);try{await oe(u),console.log("Imagen asociada eliminada de Storage.")}catch(p){console.error("Error al eliminar la imagen de Storage: ",p)}}else console.log("No se proporcionó una imagen para eliminar.");await le(d),console.log("Gasto eliminado correctamente."),b(u=>({...u,gastos:u.gastos.filter(p=>p.id!==a)}))}catch(d){console.error("Error al eliminar el gasto: ",d),alert("No se pudo eliminar el gasto. Intenta nuevamente.")}},H=a=>{U(L===a?null:a)},y=a=>{const n=a.target.value;n!==void 0&&G(n)},K=[{slug:()=>v("all"),label:"Todos los gastos",icon:m.all.border("#1C1C1E")},{slug:()=>v("current"),label:"Periodo actual",icon:m.today.border("#1C1C1E")},{slug:()=>v("previous"),label:"Periodo anterior",icon:m.previous.border("#1C1C1E")},{slug:()=>v("year"),label:"Año actual",icon:m.calendar.border("#1C1C1E")}],Q=[{slug:y,label:"Todas las categorías",anchor:"",icon:m.all.border("#1C1C1E")},{slug:y,label:"Alimentación y bebidas",anchor:"feeding",icon:m.restaurant.fill("#1C1C1E")},{slug:y,label:"Transporte",anchor:"transportation",icon:m.transportation.border("#1C1C1E")},{slug:y,label:"Salud y bienestar",anchor:"health",icon:m.care.border("#1C1C1E")},{slug:y,label:"Educación o trabajo",anchor:"educationJob",icon:m.ruler.border("#1C1C1E")},{slug:y,label:"Vivienda",anchor:"housing",icon:m.house.border("#1C1C1E")},{slug:y,label:"Entretenimiento y ocio",anchor:"entertainment",icon:m.theater_masks.border("#1C1C1E")},{slug:y,label:"Ropa y cuidado personal",anchor:"personalCare",icon:m.beauty.border("#1C1C1E")}],Z=()=>b(a=>({...a,isModalOpen:!1})),ee=a=>{const n=a.replace(/[^0-9]/g,"");return n.length===0?"":(parseFloat(n)/100).toLocaleString("es-MX",{style:"decimal",minimumFractionDigits:2,maximumFractionDigits:2})},f=a=>{const{name:n,type:c,value:s,files:d}=a.target;if(c==="file")b(u=>({...u,[n]:d[0]}));else{const u=n==="gasto"?ee(s):s;b(p=>({...p,[n]:u}))}},ae=a=>{const{name:n}=a.target,c=l[n].replace(/[^0-9]/g,""),s=c.length===0?"":parseFloat(c)/100;b(d=>({...d,[n]:s.toLocaleString("es-MX",{style:"decimal",minimumFractionDigits:2,maximumFractionDigits:2})}))},te=async a=>{a.preventDefault(),b(t=>({...t,isSubmitting:!0}));const n=parseFloat((l.gasto||"").toString().replace(/[^0-9.-]+/g,""));if(isNaN(n)||n<=0){b(t=>({...t,error:"Por favor, ingresa un gasto válido.",isSubmitting:!1}));return}const c=l.date?new Date(l.date+"T00:00:00"):new Date,s=c.getFullYear(),d=c.getMonth(),u=c.getDate(),p=(r==null?void 0:r.expenseControl.cutoffDay)||1,k=String(s);let o="";if(u<p)switch(d){case 0:o="diciembreEnero";break;case 1:o="eneroFebrero";break;case 2:o="febreroMarzo";break;case 3:o="marzoAbril";break;case 4:o="abrilMayo";break;case 5:o="mayoJunio";break;case 6:o="junioJulio";break;case 7:o="julioAgosto";break;case 8:o="agostoSeptiembre";break;case 9:o="septiembreOctubre";break;case 10:o="octubreNoviembre";break;case 11:o="noviembreDiciembre";break;default:o="desconocido"}else switch(d){case 0:o="eneroFebrero";break;case 1:o="febreroMarzo";break;case 2:o="marzoAbril";break;case 3:o="abrilMayo";break;case 4:o="mayoJunio";break;case 5:o="junioJulio";break;case 6:o="julioAgosto";break;case 7:o="agostoSeptiembre";break;case 8:o="septiembreOctubre";break;case 9:o="octubreNoviembre";break;case 10:o="noviembreDiciembre";break;case 11:o="diciembreEnero";break;default:o="desconocido"}try{let t=l.fileURL;if(l.file){const C=Date.now(),re=`${l.title}_${C}.${l.file.name.split(".").pop()}`,O=R($,`userFiles/${x.username}/${re}`);await ie(O,l.file),t=await ce(O)}const i={gasto:n,title:l.title,remarks:l.remarks,type:l.type,category:l.category,user:x.username,createdAt:c,year:k,period:o};if(t&&(i.fileURL=t),l.currentGastoId){const C=E(w,"userPosts",x.username,"gastos",String(l.currentGastoId));await de(C,i)}else{const C=ue(w,"userPosts",x.username,"gastos");await me(C,i)}b(C=>({...C,gasto:"",title:"",remarks:"",category:"",type:"",file:null,isModalOpen:!1,error:"",currentGastoId:null})),setTimeout(()=>location.reload(),1e3)}catch(t){console.error("Error al subir datos: ",t),b(i=>({...i,error:"Error al subir los datos: "+t.message,isSubmitting:!1}))}finally{b(t=>({...t,isSubmitting:!1}))}};return e.jsxs("section",{className:"mx-auto p-4 mb-20",children:[e.jsxs("aside",{className:"py-2 mb-2 flex justify-center flex-col gap-2",children:[e.jsxs("div",{className:"w-full flex-center pl-4 rounded-3xl bg-main-dark/5",children:[e.jsx("i",{className:"flex-center w-6 h-6 opacity-40",children:m.search.border("#1C1C1E")}),e.jsx("input",{type:"text",placeholder:"Filtrar gastos...",value:h,onChange:a=>G(a.target.value),className:"w-full h-full pl-1 py-4 bg-transparent outline-none text-main-dark placeholder:text-main-dark/50",required:!0}),e.jsx(ve,{label:e.jsx("i",{className:"flex-center w-6 h-6",children:m.filter.fill("#00A86B")}),titleSectionOne:"Filtrar por periodo",itemsSectionOne:K,titleSectionTwo:"Filtrar por categoría",itemsSectionTwo:Q})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("i",{className:"flex-center w-10 h-10 p-2 rounded-full bg-main-highlight/70 text-main-light",children:m.chart.border("#F5F6FA")}),e.jsx("button",{onClick:()=>z(a=>!a),className:`w-fit flex-center gap-1 h-10 px-4 rounded-3xl ${!T&&"bg-main-dark/5 text-main-dark/50"||(P?"bg-main-highlight/70 text-main-light":"bg-main-dark/5 text-main-dark/50")}`,children:"Categoría"}),e.jsx("button",{onClick:()=>q(a=>!a),className:`w-fit flex-center gap-1 h-10 px-4 rounded-3xl ${!T&&"bg-main-dark/5 text-main-dark/50"||(M?"bg-main-highlight/70 text-main-light":"bg-main-dark/5 text-main-dark/50")}`,children:"Método de pago"})]})]}),e.jsxs("hgroup",{className:"mb-2",children:[e.jsx("h1",{className:"text-main-dark py-2 text-lg font-semibold border-b border-main-dark/20",children:"Detalles de Gastos"}),e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("p",{className:"py-2 text-sm font-light text-main-dark/50",children:[j.length," Resultados"]}),e.jsxs("p",{className:"py-2 text-sm font-light text-main-dark/50",children:["$",J.toLocaleString("es-MX",{style:"decimal",minimumFractionDigits:2,maximumFractionDigits:2})," Gastados"]})]})]}),T&&e.jsx("div",{className:"flex gap-4 mb-3",children:S?e.jsxs("div",{className:"w-full flex-center flex-col space-y-3",children:[P&&e.jsxs("div",{className:"w-full p-4 flex justify-center flex-col rounded-3xl bg-main-dark/5",children:[e.jsx("h2",{className:"font-semibold mb-2",children:"Gastos por categoría"}),e.jsx(B,{data:S,options:{indexAxis:"y",plugins:{legend:{display:!1}}}})]}),M&&e.jsxs("div",{className:"w-full p-4 flex justify-center flex-col rounded-3xl bg-main-dark/5",children:[e.jsx("h2",{className:"font-semibold mb-2",children:"Gastos por tipo de pago"}),e.jsx(B,{data:I,options:{plugins:{legend:{display:!1}}}})]})]}):S==null?e.jsx("p",{className:"text-center text-gray-500",children:"Sin resultados"}):e.jsx("p",{className:"text-center text-gray-500",children:"Cargando gráficos..."})}),e.jsx("ul",{className:"space-y-3",children:j.sort((a,n)=>{const c=a.createdAt instanceof Date?a.createdAt:new Date(a.createdAt);return(n.createdAt instanceof Date?n.createdAt:new Date(n.createdAt))-c}).map(a=>e.jsx(we,{context:r,data:a,onEdit:()=>X(a.id),onDelete:()=>W(a.id,a,a.image&&a.image.name),expandedGastoId:L,onCardClick:H},a.id))}),l.isModalOpen&&e.jsx("div",{className:"fixed inset-0 bg-black/50 flex-center z-50",children:e.jsx("div",{className:"bg-white rounded-lg max-w-lg w-full h-[85vh] relative overflow-hidden",children:e.jsxs("form",{onSubmit:te,className:"space-y-4",children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx("button",{onClick:Z,className:"p-2 text-main-primary",children:"Cancelar"}),e.jsx("button",{type:"submit",disabled:l.isSubmitting,className:"p-2 text-main-highlight rounded hover:bg-main-primary-dark transition",children:l.isSubmitting?"Guardando...":l.currentGastoId?"Actualizar":"Agregar"})]}),e.jsxs("div",{className:"px-2",children:[e.jsxs("hgroup",{className:"rounded-3xl py-2 px-4 mb-4 bg-main-light",children:[e.jsx("input",{name:"title",type:"text",placeholder:"Concepto",value:l.title,onChange:f,className:"w-full py-2 bg-transparent outline-none border-b border-main-dark/20 text-main-dark placeholder:text-main-dark/50",required:!0}),e.jsxs("div",{className:"flex-center pt-2 py-2",children:["$",e.jsx("input",{name:"gasto",type:"text",placeholder:"$ $",value:l.gasto,onChange:f,onBlur:ae,className:"w-full pl-1 bg-transparent outline-none text-main-dark placeholder:text-main-dark/50",required:!0}),!N&&(r==null?void 0:r.expenseControl.currency)]})]}),e.jsx("div",{className:"rounded-3xl p-4 mb-4 bg-main-light",children:e.jsxs("select",{name:"type",value:l.type,onChange:f,className:"w-full bg-transparent outline-none",children:[e.jsx("option",{value:"",hidden:!0,className:"text-main-gray",children:"Pago con"}),r.paymentTypes.card1&&e.jsx("option",{value:"card1",children:r.paymentTypes.card1}),r.paymentTypes.card2&&e.jsx("option",{value:"card2",children:r.paymentTypes.card2}),r.paymentTypes.card3&&e.jsx("option",{value:"card3",children:r.paymentTypes.card3}),r.paymentTypes.card4&&e.jsx("option",{value:"card4",children:r.paymentTypes.card4}),r.paymentTypes.card5&&e.jsx("option",{value:"card5",children:r.paymentTypes.card5}),r.paymentTypes.other&&e.jsx("option",{value:"other",children:r.paymentTypes.other}),e.jsx("option",{value:"cash",children:"Efectivo"})]})}),e.jsx("div",{className:"rounded-3xl p-4 mb-4 bg-main-light",children:e.jsxs("select",{name:"category",value:l.category,onChange:f,className:"w-full bg-transparent outline-none",children:[e.jsx("option",{value:"",hidden:!0,className:"text-main-gray",children:"Categorías"}),e.jsx("option",{value:"feeding",children:"Alimentación y Bebidas"}),e.jsx("option",{value:"transportation",children:"Transporte"}),e.jsx("option",{value:"health",children:"Salud y Bienestar"}),e.jsx("option",{value:"educationJob",children:"Gastos de Educación o Trabajo"}),e.jsx("option",{value:"housing",children:"Vivienda"}),e.jsx("option",{value:"entertainment",children:"Entretenimiento y Ocio"}),e.jsx("option",{value:"personalCare",children:"Ropa y Cuidado Personal"})]})}),e.jsx("div",{className:"rounded-3xl p-4 mb-4 bg-main-light",children:e.jsx("input",{id:"date",name:"date",type:"date",value:l.date,onChange:f,className:"w-full bg-transparent outline-none text-main-dark placeholder:text-main-dark/50"})}),!l.currentGastoId&&e.jsx("div",{className:"rounded-3xl p-4 mb-4 bg-main-light",children:e.jsx("input",{name:"file",type:"file",onChange:f,className:"w-full",accept:"image/*, .pdf"})}),e.jsx("textarea",{name:"remarks",placeholder:"Observaciones",value:l.remarks,onChange:f,rows:"4",className:"w-full rounded-3xl p-4 mb-4 outline-none bg-main-light"})]})]})})})]})}export{De as default};