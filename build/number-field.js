(window.webpackJsonp_wpify_custom_fields=window.webpackJsonp_wpify_custom_fields||[]).push([[18],{275:function(e,t,a){"use strict";a.r(t);var n=a(6),s=a.n(n),r=a(0),i=(a(1),a(5)),c=a.n(i),l=a(51),u=a(2),o=a.n(u),m=a(3),f=function(e){var t=e.className,a=e.custom_attributes.max;return Object(r.createElement)(m.a,null,Object(r.createElement)(l.a,s()({},e,{type:"number",className:c()(t,{"small-text":a<9999||!a})})))};f.propTypes={className:o.a.string,custom_attributes:o.a.object},t.default=f},51:function(e,t,a){"use strict";var n=a(6),s=a.n(n),r=a(10),i=a.n(r),c=a(0),l=a(1),u=a.n(l),o=a(2),m=a.n(o),f=a(3),p=u.a.forwardRef((function(e,t){var a=e.id,n=e.htmlId,r=void 0===n?function(e){return e}:n,o=e.value,m=e.onChange,p=e.description,d=e.suffix,b=e.custom_attributes,g=void 0===b?{}:b,v=e.group_level,y=void 0===v?0:v,_=e.className,O=e.type,w=Object(l.useState)(o),j=i()(w,2),N=j[0],h=j[1];Object(l.useEffect)((function(){m&&JSON.stringify(o)!==JSON.stringify(N)&&m(N)}),[m,o,N]);var E=p?a+"-description":null;return Object(c.createElement)(u.a.Fragment,null,Object(c.createElement)("input",s()({type:O,id:r(a),name:0===y&&a,value:N,onChange:function(e){h(e.target.value)},"aria-describedby":E,className:_,ref:t},g)),d&&" "+d,p&&Object(c.createElement)(f.a,null,Object(c.createElement)("p",{className:"description",id:E,dangerouslySetInnerHTML:{__html:p}})))}));p.propTypes={id:m.a.string,htmlId:m.a.func,value:m.a.string,onChange:m.a.func,description:m.a.oneOfType([m.a.string,m.a.element]),suffix:m.a.oneOfType([m.a.string,m.a.element]),custom_attributes:m.a.object,group_level:m.a.number,className:m.a.string,type:m.a.oneOf(["color","date","datetime-local","email","month","number","password","tel","text","time","url","week"])},t.a=p}}]);