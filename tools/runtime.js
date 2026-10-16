/* Kleine Render-Laufzeit für Design-Component-Vorlagen ({{…}}, <sc-for>, <sc-if>).
   Parst die Vorlage einmal, rendert bei jedem setState einen virtuellen Baum und
   gleicht ihn mit dem echten DOM ab (Eingabefelder behalten Fokus und Cursor). */
var DC_VOID = { input: 1, img: 1, br: 1, hr: 1, meta: 1, link: 1, source: 1, area: 1, col: 1, embed: 1, wbr: 1 };
var DC_ENT = { amp: '&', lt: '<', gt: '>', quot: '"', '#39': "'", nbsp: ' ' };
var DC_HOLE = /\{\{\s*([^}]+?)\s*\}\}/g;
var DC_WHOLE = /^\{\{\s*([^}]+?)\s*\}\}$/;
var DC_SVG_NS = 'http://www.w3.org/2000/svg';

function dcDecode(s) { return s.replace(/&(amp|lt|gt|quot|#39|nbsp);/g, function (m, e) { return DC_ENT[e]; }); }

function dcParse(html) {
  var root = { tag: '#root', name: '#root', attrs: [], children: [] };
  var stack = [root];
  var re = /<!--[\s\S]*?-->|<\/([a-zA-Z][\w:-]*)\s*>|<([a-zA-Z][\w:-]*)((?:\s+[^\s=>\/]+(?:\s*=\s*(?:"[^"]*"|'[^']*'))?)*)\s*(\/?)>|([^<]+)/g;
  var m;
  while ((m = re.exec(html))) {
    if (m[0].lastIndexOf('<!--', 0) === 0) continue;
    var top = stack[stack.length - 1];
    if (m[1]) {
      var ct = m[1].toLowerCase();
      for (var i = stack.length - 1; i > 0; i--) { if (stack[i].tag === ct) { stack.length = i; break; } }
    } else if (m[2]) {
      var t = m[2].toLowerCase(), attrs = [], ar = /([^\s=>\/]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'))?/g, a;
      while ((a = ar.exec(m[3]))) attrs.push([a[1], dcDecode(a[2] !== undefined ? a[2] : (a[3] !== undefined ? a[3] : ''))]);
      var node = { tag: t, name: m[2], attrs: attrs, children: [] };
      top.children.push(node);
      if (!DC_VOID[t] && !m[4]) stack.push(node);
    } else if (m[5] !== undefined) {
      top.children.push({ text: dcDecode(m[5]) });
    }
  }
  return root;
}

function dcLookup(expr, scope) {
  expr = expr.trim();
  if (expr === 'true') return true;
  if (expr === 'false') return false;
  if (expr === 'null') return null;
  if (/^-?\d+(\.\d+)?$/.test(expr)) return Number(expr);
  if (/^'.*'$|^".*"$/.test(expr)) return expr.slice(1, -1);
  var parts = expr.split('.'), cur, found = false;
  for (var i = scope.length - 1; i >= 0; i--) {
    var s = scope[i];
    if (s != null && Object.prototype.hasOwnProperty.call(s, parts[0])) { cur = s[parts[0]]; found = true; break; }
  }
  if (!found) return undefined;
  for (var j = 1; j < parts.length; j++) { if (cur == null) return undefined; cur = cur[parts[j]]; }
  return cur;
}

function dcInterp(str, scope) {
  return str.replace(DC_HOLE, function (m, e) { var v = dcLookup(e, scope); return v == null ? '' : String(v); });
}

function dcAttr(node, name) { for (var i = 0; i < node.attrs.length; i++) if (node.attrs[i][0] === name) return node.attrs[i][1]; return null; }

function dcBuild(node, scope, out, svg) {
  if (node.text !== undefined) { out.push({ text: node.text.indexOf('{{') >= 0 ? dcInterp(node.text, scope) : node.text }); return; }
  var t = node.tag, i;
  if (t === 'helmet') return;
  if (t === 'x-dc' || t === '#root') { for (i = 0; i < node.children.length; i++) dcBuild(node.children[i], scope, out, svg); return; }
  if (t === 'sc-for') {
    var lm = DC_WHOLE.exec(dcAttr(node, 'list') || ''), list = lm ? dcLookup(lm[1], scope) : [], as = dcAttr(node, 'as') || 'item';
    (list || []).forEach(function (it, idx) {
      var frame = { $index: idx }; frame[as] = it;
      var sc = scope.concat([frame]);
      for (var k = 0; k < node.children.length; k++) dcBuild(node.children[k], sc, out, svg);
    });
    return;
  }
  if (t === 'sc-if') {
    var raw = dcAttr(node, 'value') || '', vm = DC_WHOLE.exec(raw), val = vm ? dcLookup(vm[1], scope) : raw;
    if (val) for (i = 0; i < node.children.length; i++) dcBuild(node.children[i], scope, out, svg);
    return;
  }
  var isSvg = svg || t === 'svg';
  var v = { tag: node.name, svg: isSvg, attrs: {}, props: {}, events: {}, children: [] };
  for (i = 0; i < node.attrs.length; i++) {
    var k = node.attrs[i][0], s = node.attrs[i][1];
    if (k.lastIndexOf('hint-', 0) === 0) continue;
    var wm = DC_WHOLE.exec(s), r = wm ? dcLookup(wm[1], scope) : (s.indexOf('{{') >= 0 ? dcInterp(s, scope) : s);
    if (/^on[A-Z]/.test(k)) { if (typeof r === 'function') v.events[k.slice(2).toLowerCase()] = r; continue; }
    if (k === 'value' || k === 'checked') { v.props[k] = r; continue; }
    var name = k === 'className' ? 'class' : k === 'htmlFor' ? 'for' : k === 'tabIndex' ? 'tabindex' : k;
    if (r === false || r == null) continue;
    v.attrs[name] = r === true ? '' : String(r);
  }
  for (i = 0; i < node.children.length; i++) dcBuild(node.children[i], scope, v.children, isSvg);
  out.push(v);
}

function dcCreate(v) {
  if (v.text !== undefined) return document.createTextNode(v.text);
  var el = v.svg ? document.createElementNS(DC_SVG_NS, v.tag) : document.createElement(v.tag);
  el.__tag = v.tag; el.__svg = v.svg; el.__a = {}; el.__l = {}; el.__h = {};
  dcPatch(el, v);
  return el;
}

function dcEventType(el, type) {
  if (type === 'change' && el.localName === 'input' && el.type !== 'checkbox' && el.type !== 'radio') return 'input';
  return type;
}

function dcPatch(el, v) {
  var old = el.__a, k;
  for (k in v.attrs) if (old[k] !== v.attrs[k]) el.setAttribute(k, v.attrs[k]);
  for (k in old) if (!(k in v.attrs)) el.removeAttribute(k);
  el.__a = v.attrs;
  el.__h = {};
  for (k in v.events) {
    var type = dcEventType(el, k);
    el.__h[type] = v.events[k];
    if (!el.__l[type]) {
      el.__l[type] = true;
      (function (tp) { el.addEventListener(tp, function (e) { var h = el.__h[tp]; if (h) h(e); }); })(type);
    }
  }
  dcMorph(el, v.children);
  if ('value' in v.props) { var nv = v.props.value == null ? '' : String(v.props.value); if (el.value !== nv) el.value = nv; }
  if ('checked' in v.props) el.checked = !!v.props.checked;
}

function dcMorph(parent, vs) {
  var kids = parent.childNodes;
  for (var i = 0; i < vs.length; i++) {
    var v = vs[i], ex = kids[i];
    if (!ex) { parent.appendChild(dcCreate(v)); continue; }
    if (v.text !== undefined) {
      if (ex.nodeType === 3) { if (ex.data !== v.text) ex.data = v.text; } else parent.replaceChild(dcCreate(v), ex);
      continue;
    }
    if (ex.nodeType === 1 && ex.__tag === v.tag && ex.__svg === v.svg) dcPatch(ex, v);
    else parent.replaceChild(dcCreate(v), ex);
  }
  while (kids.length > vs.length) parent.removeChild(parent.lastChild);
}

var dcSchedule = function () {};

class DCLogic {
  constructor(props) { this.props = props || {}; this.state = {}; }
  setState(patch) {
    var p = typeof patch === 'function' ? patch(this.state, this.props) : patch;
    this.state = Object.assign({}, this.state, p);
    dcSchedule();
  }
  forceUpdate() { dcSchedule(); }
}

function mountDC(ComponentClass, templateText, container) {
  var tree = dcParse(templateText);
  var comp = new ComponentClass({});
  var queued = false;
  function render() {
    queued = false;
    var out = [];
    dcBuild(tree, [comp.renderVals()], out, false);
    dcMorph(container, out);
  }
  dcSchedule = function () { if (!queued) { queued = true; Promise.resolve().then(render); } };
  render();
  if (typeof comp.componentDidMount === 'function') comp.componentDidMount();
  return comp;
}
