import{r as n,U,l as A,j as e,S as $,m as I,d as F,b as O,c as R,n as M}from"./index-DQKeeZrZ.js";import{u as X}from"./useAuthRequired-CX6AxpDI.js";function z(){const{isLoading:h,isAuthenticated:y}=X("/register","/profile"),{loading:l,userAuth:g,userData:t}=n.useContext(U),[d,f]=n.useState(!l&&t&&t.expenseControl&&(t==null?void 0:t.expenseControl.budget)||""),[p,b]=n.useState(!l&&t&&t.expenseControl&&(t==null?void 0:t.expenseControl.currency)||"MXN"),[u,j]=n.useState(!l&&t&&t.expenseControl&&(t==null?void 0:t.expenseControl.cutoffDay)||"1"),[s,v]=n.useState(""),[o,m]=n.useState(""),[r,C]=n.useState(""),[c,N]=n.useState(""),k=A(),T=()=>{I(M).then(()=>{k("/"),console.log("Signed out successfully"),window.location.reload()}).catch(a=>{console.log("error")})},w=async a=>{if(a.preventDefault(),t&&t.expenseControl){const i=F(O,"userData",g.username),E={"expenseControl.budget":d,"expenseControl.currency":p,"expenseControl.cutoffDay":u,...s&&o?{[`paymentTypes.${s}`]:o}:{},...r&&c?{[`incomeControl.paymentTypes.${r}`]:c}:{}};try{await R(i,E),console.log("Updated successfully"),setTimeout(()=>location.reload(),1e3)}catch(P){console.error("Error updating budget, currency, and paymentTypes:",P)}}else console.error("userData or expenseControl is not available")},S=a=>{const i=a.target.value;v(i),i!=="other"&&m("")},x=a=>{m(a.target.value)},q=["card1","card2","card3","card4","card5"].filter(a=>!(t!=null&&t.paymentTypes&&t.paymentTypes[a])),D=["type1","type2","type3","type4","type5"].filter(a=>!(t!=null&&t.paymentTypes&&t.paymentTypes[a]));return h||l||!t?e.jsx($,{bgTheme:!0}):y?e.jsxs("div",{children:[e.jsxs("section",{className:"w-full max-w-screen-sm mt-6 py-3 flex flex-col items-center",children:[e.jsx("p",{className:"text-main-dark/50",children:"Profile"}),e.jsx("h1",{className:"text-4xl font-bold text-main-dark my-2",children:t&&t.contactInf.username}),e.jsx("p",{className:"text-main-primary",children:t&&t.contactInf.email})]}),e.jsxs("section",{className:"w-full max-w-screen-sm py-6",children:[e.jsxs("form",{onSubmit:w,children:[e.jsxs("div",{className:"relative rounded-3xl py-2 px-4 mb-4 bg-main-dark/5",children:[e.jsx("label",{htmlFor:"budget",className:"absolute -top-2 text-sm font-medium rounded-full px-1 text-gray-700/50",children:"Presupuesto"}),e.jsxs("div",{className:"flex-center pt-2 py-2",children:["$",e.jsx("input",{name:"gasto",type:"number",placeholder:"$ $",value:d,onChange:a=>f(Number(a.target.value)),className:"w-full pl-1 bg-transparent outline-none text-main-dark placeholder:text-main-dark/50",required:!0}),!l&&t&&t.expenseControl&&(t==null?void 0:t.expenseControl.currency)]})]}),e.jsxs("div",{className:"relative rounded-3xl py-2 px-4 mb-4 bg-main-dark/5",children:[e.jsx("label",{htmlFor:"cutoffDay",className:"absolute -top-2 text-sm font-medium rounded-full px-1 text-gray-700/50",children:"Día de corte"}),e.jsx("div",{className:"flex-center pt-2 py-2",children:e.jsx("input",{name:"cutoffDay",type:"number",placeholder:"Define el día de corte. Ej: 1",value:u,onChange:a=>j(a.target.value),className:"w-full pl-1 bg-transparent outline-none text-main-dark placeholder:text-main-dark/50",required:!0})})]}),e.jsxs("div",{className:"relative rounded-3xl p-4 mb-4 bg-main-dark/5",children:[e.jsx("label",{htmlFor:"currency",className:"absolute -top-2 text-sm font-medium rounded-full px-1 text-gray-700/50",children:"Divisa"}),e.jsxs("select",{name:"currency",value:p,onChange:a=>b(a.target.value),className:"w-full bg-transparent outline-none",children:[e.jsx("option",{value:"MXN",children:"MXN"}),e.jsx("option",{value:"USD",children:"USD"}),e.jsx("option",{value:"EUR",children:"EUR"})]})]}),e.jsxs("div",{className:"relative rounded-3xl py-2 px-4 mb-4 bg-main-dark/5",children:[e.jsx("label",{htmlFor:"paymentTypes",className:"absolute -top-2 text-sm font-medium rounded-full px-1 text-gray-700/50",children:"Tipos de Pago (Control de Gastos)"}),e.jsxs("span",{className:"flex-center pt-2 py-2",children:[e.jsxs("select",{name:"currency",className:"w-1/3 bg-transparent outline-none",value:s,onChange:S,children:[e.jsx("option",{value:"",disabled:!0,children:"Dar de alta"}),q.map(a=>e.jsx("option",{value:a,children:`Tarjeta ${a.charAt(4)}`},a)),e.jsx("option",{value:"other",children:"Otro tipo de pago"})]}),s!==""&&s!=="other"&&e.jsx("input",{name:"gasto",type:"text",placeholder:"Ej: LikeU, AMEX, Débito",value:o,onChange:x,className:"w-full pl-1 bg-transparent outline-none text-main-dark placeholder:text-main-dark/50"}),s==="other"&&e.jsx("input",{name:"gasto",type:"text",placeholder:"Especifica el tipo de pago",value:o,onChange:x,className:"w-full pl-1 bg-transparent outline-none text-main-dark placeholder:text-main-dark/50",required:!0})]}),e.jsx("span",{className:"text-main-dark/50",children:"Por defecto ya está habilitado el tipo de pago en efectivo, no es necesario que lo coloques."})]}),e.jsxs("div",{className:"relative rounded-3xl py-2 px-4 mb-4 bg-main-dark/5",children:[e.jsx("label",{htmlFor:"incomeTypes",className:"absolute -top-2 text-sm font-medium rounded-full px-1 text-gray-700/50",children:"Tipos de Ingreso"}),e.jsxs("span",{className:"flex-center pt-2 py-2",children:[e.jsxs("select",{name:"incomeTypes",className:"w-1/3 bg-transparent outline-none",value:r,onChange:a=>C(a.target.value),children:[e.jsx("option",{value:"",disabled:!0,children:"Dar de alta"}),D.map(a=>e.jsx("option",{value:a,children:`Tipo de ingreso ${a.charAt(4)}`},a)),e.jsx("option",{value:"other",children:"Otro tipo de ingreso"})]}),r&&e.jsx("input",{name:"incomeCategory",type:"text",placeholder:"Ej: Transferencia, Cheque",value:c,onChange:a=>N(a.target.value),className:"w-full pl-1 bg-transparent outline-none text-main-dark placeholder:text-main-dark/50",required:!0})]}),e.jsx("span",{className:"text-main-dark/50",children:"Por defecto ya está habilitado el tipo de ingreso en efectivo, no es necesario que lo coloques."})]}),e.jsx("button",{type:"submit",className:"border rounded-3xl p-4 font-semibold text-main-dark hover:bg-main-highlight/10",children:"Actualizar"})]}),e.jsx("button",{onClick:T,className:"border rounded-3xl p-4 mt-4 mb-12 font-semibold text-main-dark hover:bg-main-highlight/10",children:"Cerrar Sesión"})]})]}):null}export{z as default};