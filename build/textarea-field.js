(window.webpackJsonp_wpify_custom_fields=window.webpackJsonp_wpify_custom_fields||[]).push([[26],{24:function(e,t){function n(){return e.exports=n=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var a in n)Object.prototype.hasOwnProperty.call(n,a)&&(e[a]=n[a])}return e},e.exports.default=e.exports,e.exports.__esModule=!0,n.apply(this,arguments)}e.exports=n,e.exports.default=e.exports,e.exports.__esModule=!0},286:function(e,t,n){"use strict";n.r(t);var a=n(24),r=n.n(a),s=n(10),o=n.n(s),i=n(0),c=n(1),l=n.n(c),u=n(2),p=n.n(u),f=n(5),d=n.n(f),m=n(3),g=function(e){var t=e.id,n=e.htmlId,a=void 0===n?function(e){return e}:n,s=e.value,u=e.onChange,p=e.description,f=e.custom_attributes,g=e.className,b=e.group_level,_=void 0===b?0:b,v=Object(c.useState)(s),y=o()(v,2),O=y[0],x=y[1];Object(c.useEffect)((function(){u&&JSON.stringify(s)!==JSON.stringify(O)&&u(O)}),[u,s,O]);var h=p?t+"-description":null;return Object(i.createElement)(l.a.Fragment,null,Object(i.createElement)("textarea",r()({id:a(t),name:0===_&&t,onChange:function(e){x(e.target.value)},"aria-describedby":p&&h,className:d()("large-text",g),rows:10,cols:50},f),O),p&&Object(i.createElement)(m.a,null,Object(i.createElement)("p",{className:"description",id:h,dangerouslySetInnerHTML:{__html:p}})))};g.propTypes={id:p.a.string,htmlId:p.a.func,value:p.a.string,onChange:p.a.func,description:p.a.oneOfType([p.a.string,p.a.element]),suffix:p.a.oneOfType([p.a.string,p.a.element]),custom_attributes:p.a.object,group_level:p.a.number,className:p.a.string,type:p.a.string},t.default=g}}]);