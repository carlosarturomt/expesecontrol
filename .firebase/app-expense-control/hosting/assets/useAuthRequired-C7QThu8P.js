import{r,U as c,k as f,t as g}from"./index-BtSGYj8y.js";function p(t,a){const{user:e,loading:o}=r.useContext(c),[u,s]=r.useState(!1),i=f(),n=g();return r.useEffect(()=>{e&&n.pathname!==a?(s(!0),i(a)):!e&&n.pathname!==t?(s(!0),i(t)):s(!1)},[e,i,t,a,n.pathname]),{isLoading:o||u,isAuthenticated:!!e}}export{p as u};