import{r as l,U as m,j as e,S as t}from"./index-CfOF9bxd.js";import{u as c}from"./useAuthRequired-_VLSZWmH.js";function x(){const{isLoading:n,isAuthenticated:r}=c("/register","/transactions"),{state:a}=l.useContext(m);return n?e.jsx(t,{bgTheme:!0}):r?e.jsxs("div",{children:[e.jsxs("section",{className:"w-full max-w-screen-sm mt-6 py-3 flex flex-col items-center",children:[e.jsx("p",{className:"text-main-dark/50",children:"Transaccione"}),e.jsx("h1",{className:"text-4xl font-bold text-main-dark my-2",children:"$17,505.00"}),e.jsx("p",{className:"text-main-primary",children:"-$7,000.00"})]}),e.jsxs("section",{className:"w-full max-w-screen-sm py-6",children:[e.jsx("h2",{className:"text-main-dark text-lg font-semibold mb-4",children:"Objetivos Financieros"}),e.jsxs("div",{className:"bg-main-dark/5 rounded-3xl p-4",children:[e.jsx("p",{className:"text-main-dark",children:"Ahorra para un viaje"}),e.jsx("div",{className:"bg-blue-500 rounded-full h-2",style:{width:"60%"}}),e.jsx("p",{className:"text-main-primary font-semibold",children:"Progreso: $600.00 / $1,000.00"})]})]}),e.jsxs("section",{className:"w-full max-w-screen-sm py-3 mb-20",children:[e.jsx("h2",{className:"text-main-dark text-lg font-semibold mb-4",children:"Últimos Gastos"}),a.loading?e.jsx(t,{bgTheme:!0}):a.gastos.length>0?e.jsx("ul",{className:"space-y-3",children:a.gastos.sort((s,i)=>i.createdAt-s.createdAt).map(s=>e.jsxs("li",{className:"flex justify-between items-center bg-main-dark/5 rounded-3xl p-4",children:[e.jsx("span",{className:"text-main-dark font-medium",children:s.title||"Gasto desconocido"}),e.jsxs("span",{className:"text-main-primary font-semibold",children:["-",new Intl.NumberFormat("es-MX",{style:"currency",currency:"MXN"}).format(s.gasto)]})]},s.id))}):e.jsx("li",{className:"flex justify-between items-center bg-main-dark/5 rounded-3xl p-4",children:e.jsx("span",{className:"text-main-dark font-medium",children:"No hay gastos registrados"})})]})]}):null}export{x as default};