var E = "INUMBER", F = "IOP1", j = "IOP2", L = "IOP3", A = "IVAR", _ = "IVARNAME", S = "IFUNCALL", D = "IFUNDEF", d = "IEXPR", z = "IEXPREVAL", m = "IMEMBER", V = "IENDSTATEMENT", N = "IARRAY";
function p(e, t) {
  this.type = e, this.value = t ?? 0;
}
p.prototype.toString = function() {
  switch (this.type) {
    case E:
    case F:
    case j:
    case L:
    case A:
    case _:
    case V:
      return this.value;
    case S:
      return "CALL " + this.value;
    case D:
      return "DEF " + this.value;
    case N:
      return "ARRAY " + this.value;
    case m:
      return "." + this.value;
    default:
      return "Invalid Instruction";
  }
};
function B(e) {
  return new p(F, e);
}
function T(e) {
  return new p(j, e);
}
function le(e) {
  return new p(L, e);
}
function Y(e, t, r, s, n) {
  for (var i = [], a = [], u, h, c, l, f = 0; f < e.length; f++) {
    var o = e[f], g = o.type;
    if (g === E || g === _)
      Array.isArray(o.value) ? i.push.apply(i, Y(o.value.map(function(b) {
        return new p(E, b);
      }).concat(new p(N, o.value.length)), t, r, s, n)) : i.push(o);
    else if (g === A && n.hasOwnProperty(o.value))
      o = new p(E, n[o.value]), i.push(o);
    else if (g === j && i.length > 1)
      h = i.pop(), u = i.pop(), l = r[o.value], o = new p(E, l(u.value, h.value)), i.push(o);
    else if (g === L && i.length > 2)
      c = i.pop(), h = i.pop(), u = i.pop(), o.value === "?" ? i.push(u.value ? h.value : c.value) : (l = s[o.value], o = new p(E, l(u.value, h.value, c.value)), i.push(o));
    else if (g === F && i.length > 0)
      u = i.pop(), l = t[o.value], o = new p(E, l(u.value)), i.push(o);
    else if (g === d) {
      for (; i.length > 0; )
        a.push(i.shift());
      a.push(new p(d, Y(o.value, t, r, s, n)));
    } else if (g === m && i.length > 0)
      u = i.pop(), i.push(new p(E, u.value[o.value]));
    else {
      for (; i.length > 0; )
        a.push(i.shift());
      a.push(o);
    }
  }
  for (; i.length > 0; )
    a.push(i.shift());
  return a;
}
function fe(e, t, r) {
  for (var s = [], n = 0; n < e.length; n++) {
    var i = e[n], a = i.type;
    if (a === A && i.value === t)
      for (var u = 0; u < r.tokens.length; u++) {
        var h = r.tokens[u], c;
        h.type === F ? c = B(h.value) : h.type === j ? c = T(h.value) : h.type === L ? c = le(h.value) : c = new p(h.type, h.value), s.push(c);
      }
    else a === d ? s.push(new p(d, fe(i.value, t, r))) : s.push(i);
  }
  return s;
}
function k(e, t, r) {
  var s = [], n, i, a, u, h, c;
  if (K(e))
    return M(e, r);
  for (var l = e.length, f = 0; f < l; f++) {
    var o = e[f], g = o.type;
    if (g === E || g === _)
      s.push(o.value);
    else if (g === j)
      i = s.pop(), n = s.pop(), o.value === "and" ? s.push(n ? !!k(i, t, r) : !1) : o.value === "or" ? s.push(n ? !0 : !!k(i, t, r)) : o.value === "=" ? (u = t.binaryOps[o.value], s.push(u(n, k(i, t, r), r))) : (u = t.binaryOps[o.value], s.push(u(M(n, r), M(i, r))));
    else if (g === L)
      a = s.pop(), i = s.pop(), n = s.pop(), o.value === "?" ? s.push(k(n ? i : a, t, r)) : (u = t.ternaryOps[o.value], s.push(u(M(n, r), M(i, r), M(a, r))));
    else if (g === A)
      if (o.value in t.functions)
        s.push(t.functions[o.value]);
      else if (o.value in t.unaryOps && t.parser.isOperatorEnabled(o.value))
        s.push(t.unaryOps[o.value]);
      else {
        var b = r[o.value];
        if (b !== void 0)
          s.push(b);
        else
          throw new Error("undefined variable: " + o.value);
      }
    else if (g === F)
      n = s.pop(), u = t.unaryOps[o.value], s.push(u(M(n, r)));
    else if (g === S) {
      for (c = o.value, h = []; c-- > 0; )
        h.unshift(M(s.pop(), r));
      if (u = s.pop(), u.apply && u.call)
        s.push(u.apply(void 0, h));
      else
        throw new Error(u + " is not a function");
    } else if (g === D)
      s.push(function() {
        for (var U = s.pop(), I = [], ye = o.value; ye-- > 0; )
          I.unshift(s.pop());
        var re = s.pop(), X = function() {
          for (var se = Object.assign({}, r), Q = 0, we = I.length; Q < we; Q++)
            se[I[Q]] = arguments[Q];
          return k(U, t, se);
        };
        return Object.defineProperty(X, "name", {
          value: re,
          writable: !1
        }), r[re] = X, X;
      }());
    else if (g === d)
      s.push(de(o, t));
    else if (g === z)
      s.push(o);
    else if (g === m)
      n = s.pop(), s.push(n[o.value]);
    else if (g === V)
      s.pop();
    else if (g === N) {
      for (c = o.value, h = []; c-- > 0; )
        h.unshift(s.pop());
      s.push(h);
    } else
      throw new Error("invalid Expression");
  }
  if (s.length > 1)
    throw new Error("invalid Expression (parity)");
  return s[0] === 0 ? 0 : M(s[0], r);
}
function de(e, t, r) {
  return K(e) ? e : {
    type: z,
    value: function(s) {
      return k(e.value, t, s);
    }
  };
}
function K(e) {
  return e && e.type === z;
}
function M(e, t) {
  return K(e) ? e.value(t) : e;
}
function W(e, t) {
  for (var r = [], s, n, i, a, u, h, c = 0; c < e.length; c++) {
    var l = e[c], f = l.type;
    if (f === E)
      typeof l.value == "number" && l.value < 0 ? r.push("(" + l.value + ")") : Array.isArray(l.value) ? r.push("[" + l.value.map(ne).join(", ") + "]") : r.push(ne(l.value));
    else if (f === j)
      n = r.pop(), s = r.pop(), a = l.value, t ? a === "^" ? r.push("Math.pow(" + s + ", " + n + ")") : a === "and" ? r.push("(!!" + s + " && !!" + n + ")") : a === "or" ? r.push("(!!" + s + " || !!" + n + ")") : a === "||" ? r.push("(function(a,b){ return Array.isArray(a) && Array.isArray(b) ? a.concat(b) : String(a) + String(b); }((" + s + "),(" + n + ")))") : a === "==" ? r.push("(" + s + " === " + n + ")") : a === "!=" ? r.push("(" + s + " !== " + n + ")") : a === "[" ? r.push(s + "[(" + n + ") | 0]") : r.push("(" + s + " " + a + " " + n + ")") : a === "[" ? r.push(s + "[" + n + "]") : r.push("(" + s + " " + a + " " + n + ")");
    else if (f === L)
      if (i = r.pop(), n = r.pop(), s = r.pop(), a = l.value, a === "?")
        r.push("(" + s + " ? " + n + " : " + i + ")");
      else
        throw new Error("invalid Expression");
    else if (f === A || f === _)
      r.push(l.value);
    else if (f === F)
      s = r.pop(), a = l.value, a === "-" || a === "+" ? r.push("(" + a + s + ")") : t ? a === "not" ? r.push("(!" + s + ")") : a === "!" ? r.push("fac(" + s + ")") : r.push(a + "(" + s + ")") : a === "!" ? r.push("(" + s + "!)") : r.push("(" + a + " " + s + ")");
    else if (f === S) {
      for (h = l.value, u = []; h-- > 0; )
        u.unshift(r.pop());
      a = r.pop(), r.push(a + "(" + u.join(", ") + ")");
    } else if (f === D) {
      for (n = r.pop(), h = l.value, u = []; h-- > 0; )
        u.unshift(r.pop());
      s = r.pop(), t ? r.push("(" + s + " = function(" + u.join(", ") + ") { return " + n + " })") : r.push("(" + s + "(" + u.join(", ") + ") = " + n + ")");
    } else if (f === m)
      s = r.pop(), r.push(s + "." + l.value);
    else if (f === N) {
      for (h = l.value, u = []; h-- > 0; )
        u.unshift(r.pop());
      r.push("[" + u.join(", ") + "]");
    } else if (f === d)
      r.push("(" + W(l.value, t) + ")");
    else if (f !== V) throw new Error("invalid Expression");
  }
  return r.length > 1 && (t ? r = [r.join(",")] : r = [r.join(";")]), String(r[0]);
}
function ne(e) {
  return typeof e == "string" ? JSON.stringify(e).replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029") : e;
}
function P(e, t) {
  for (var r = 0; r < e.length; r++)
    if (e[r] === t)
      return !0;
  return !1;
}
function J(e, t, r) {
  r = r || {};
  for (var s = !!r.withMembers, n = null, i = 0; i < e.length; i++) {
    var a = e[i];
    a.type === A || a.type === _ ? !s && !P(t, a.value) ? t.push(a.value) : (n !== null && (P(t, n) || t.push(n)), n = a.value) : a.type === m && s && n !== null ? n += "." + a.value : a.type === d ? J(a.value, t, r) : n !== null && (P(t, n) || t.push(n), n = null);
  }
  n !== null && !P(t, n) && t.push(n);
}
function x(e, t) {
  this.tokens = e, this.parser = t, this.unaryOps = t.unaryOps, this.binaryOps = t.binaryOps, this.ternaryOps = t.ternaryOps, this.functions = t.functions;
}
x.prototype.simplify = function(e) {
  return e = e || {}, new x(Y(this.tokens, this.unaryOps, this.binaryOps, this.ternaryOps, e), this.parser);
};
x.prototype.substitute = function(e, t) {
  return t instanceof x || (t = this.parser.parse(String(t))), new x(fe(this.tokens, e, t), this.parser);
};
x.prototype.evaluate = function(e) {
  return e = e || {}, k(this.tokens, this, e);
};
x.prototype.toString = function() {
  return W(this.tokens, !1);
};
x.prototype.symbols = function(e) {
  e = e || {};
  var t = [];
  return J(this.tokens, t, e), t;
};
x.prototype.variables = function(e) {
  e = e || {};
  var t = [];
  J(this.tokens, t, e);
  var r = this.functions;
  return t.filter(function(s) {
    return !(s in r);
  });
};
x.prototype.toJSFunction = function(e, t) {
  var r = this, s = new Function(e, "with(this.functions) with (this.ternaryOps) with (this.binaryOps) with (this.unaryOps) { return " + W(this.simplify(t).tokens, !0) + "; }");
  return function() {
    return s.apply(r, arguments);
  };
};
var q = "TEOF", v = "TOP", G = "TNUMBER", ce = "TSTRING", O = "TPAREN", R = "TBRACKET", $ = "TCOMMA", Z = "TNAME", ee = "TSEMICOLON";
function ve(e, t, r) {
  this.type = e, this.value = t, this.index = r;
}
ve.prototype.toString = function() {
  return this.type + ": " + this.value;
};
function w(e, t) {
  this.pos = 0, this.current = null, this.unaryOps = e.unaryOps, this.binaryOps = e.binaryOps, this.ternaryOps = e.ternaryOps, this.consts = e.consts, this.expression = t, this.savedPosition = 0, this.savedCurrent = null, this.options = e.options, this.parser = e;
}
w.prototype.newToken = function(e, t, r) {
  return new ve(e, t, r ?? this.pos);
};
w.prototype.save = function() {
  this.savedPosition = this.pos, this.savedCurrent = this.current;
};
w.prototype.restore = function() {
  this.pos = this.savedPosition, this.current = this.savedCurrent;
};
w.prototype.next = function() {
  if (this.pos >= this.expression.length)
    return this.newToken(q, "EOF");
  if (this.isWhitespace() || this.isComment())
    return this.next();
  if (this.isRadixInteger() || this.isNumber() || this.isOperator() || this.isString() || this.isParen() || this.isBracket() || this.isComma() || this.isSemicolon() || this.isNamedOp() || this.isConst() || this.isName())
    return this.current;
  this.parseError('Unknown character "' + this.expression.charAt(this.pos) + '"');
};
w.prototype.isString = function() {
  var e = !1, t = this.pos, r = this.expression.charAt(t);
  if (r === "'" || r === '"')
    for (var s = this.expression.indexOf(r, t + 1); s >= 0 && this.pos < this.expression.length; ) {
      if (this.pos = s + 1, this.expression.charAt(s - 1) !== "\\") {
        var n = this.expression.substring(t + 1, s);
        this.current = this.newToken(ce, this.unescape(n), t), e = !0;
        break;
      }
      s = this.expression.indexOf(r, s + 1);
    }
  return e;
};
w.prototype.isParen = function() {
  var e = this.expression.charAt(this.pos);
  return e === "(" || e === ")" ? (this.current = this.newToken(O, e), this.pos++, !0) : !1;
};
w.prototype.isBracket = function() {
  var e = this.expression.charAt(this.pos);
  return (e === "[" || e === "]") && this.isOperatorEnabled("[") ? (this.current = this.newToken(R, e), this.pos++, !0) : !1;
};
w.prototype.isComma = function() {
  var e = this.expression.charAt(this.pos);
  return e === "," ? (this.current = this.newToken($, ","), this.pos++, !0) : !1;
};
w.prototype.isSemicolon = function() {
  var e = this.expression.charAt(this.pos);
  return e === ";" ? (this.current = this.newToken(ee, ";"), this.pos++, !0) : !1;
};
w.prototype.isConst = function() {
  for (var e = this.pos, t = e; t < this.expression.length; t++) {
    var r = this.expression.charAt(t);
    if (r.toUpperCase() === r.toLowerCase() && (t === this.pos || r !== "_" && r !== "." && (r < "0" || r > "9")))
      break;
  }
  if (t > e) {
    var s = this.expression.substring(e, t);
    if (s in this.consts)
      return this.current = this.newToken(G, this.consts[s]), this.pos += s.length, !0;
  }
  return !1;
};
w.prototype.isNamedOp = function() {
  for (var e = this.pos, t = e; t < this.expression.length; t++) {
    var r = this.expression.charAt(t);
    if (r.toUpperCase() === r.toLowerCase() && (t === this.pos || r !== "_" && (r < "0" || r > "9")))
      break;
  }
  if (t > e) {
    var s = this.expression.substring(e, t);
    if (this.isOperatorEnabled(s) && (s in this.binaryOps || s in this.unaryOps || s in this.ternaryOps))
      return this.current = this.newToken(v, s), this.pos += s.length, !0;
  }
  return !1;
};
w.prototype.isName = function() {
  for (var e = this.pos, t = e, r = !1; t < this.expression.length; t++) {
    var s = this.expression.charAt(t);
    if (s.toUpperCase() === s.toLowerCase()) {
      if (t === this.pos && (s === "$" || s === "_")) {
        s === "_" && (r = !0);
        continue;
      } else if (t === this.pos || !r || s !== "_" && (s < "0" || s > "9"))
        break;
    } else
      r = !0;
  }
  if (r) {
    var n = this.expression.substring(e, t);
    return this.current = this.newToken(Z, n), this.pos += n.length, !0;
  }
  return !1;
};
w.prototype.isWhitespace = function() {
  for (var e = !1, t = this.expression.charAt(this.pos); (t === " " || t === "	" || t === `
` || t === "\r") && (e = !0, this.pos++, !(this.pos >= this.expression.length)); )
    t = this.expression.charAt(this.pos);
  return e;
};
var Ee = /^[0-9a-f]{4}$/i;
w.prototype.unescape = function(e) {
  var t = e.indexOf("\\");
  if (t < 0)
    return e;
  for (var r = e.substring(0, t); t >= 0; ) {
    var s = e.charAt(++t);
    switch (s) {
      case "'":
        r += "'";
        break;
      case '"':
        r += '"';
        break;
      case "\\":
        r += "\\";
        break;
      case "/":
        r += "/";
        break;
      case "b":
        r += "\b";
        break;
      case "f":
        r += "\f";
        break;
      case "n":
        r += `
`;
        break;
      case "r":
        r += "\r";
        break;
      case "t":
        r += "	";
        break;
      case "u":
        var n = e.substring(t + 1, t + 5);
        Ee.test(n) || this.parseError("Illegal escape sequence: \\u" + n), r += String.fromCharCode(parseInt(n, 16)), t += 4;
        break;
      default:
        throw this.parseError('Illegal escape sequence: "\\' + s + '"');
    }
    ++t;
    var i = e.indexOf("\\", t);
    r += e.substring(t, i < 0 ? e.length : i), t = i;
  }
  return r;
};
w.prototype.isComment = function() {
  var e = this.expression.charAt(this.pos);
  return e === "/" && this.expression.charAt(this.pos + 1) === "*" ? (this.pos = this.expression.indexOf("*/", this.pos) + 2, this.pos === 1 && (this.pos = this.expression.length), !0) : !1;
};
w.prototype.isRadixInteger = function() {
  var e = this.pos;
  if (e >= this.expression.length - 2 || this.expression.charAt(e) !== "0")
    return !1;
  ++e;
  var t, r;
  if (this.expression.charAt(e) === "x")
    t = 16, r = /^[0-9a-f]$/i, ++e;
  else if (this.expression.charAt(e) === "b")
    t = 2, r = /^[01]$/i, ++e;
  else
    return !1;
  for (var s = !1, n = e; e < this.expression.length; ) {
    var i = this.expression.charAt(e);
    if (r.test(i))
      e++, s = !0;
    else
      break;
  }
  return s && (this.current = this.newToken(G, parseInt(this.expression.substring(n, e), t)), this.pos = e), s;
};
w.prototype.isNumber = function() {
  for (var e = !1, t = this.pos, r = t, s = t, n = !1, i = !1, a; t < this.expression.length && (a = this.expression.charAt(t), a >= "0" && a <= "9" || !n && a === "."); )
    a === "." ? n = !0 : i = !0, t++, e = i;
  if (e && (s = t), a === "e" || a === "E") {
    t++;
    for (var u = !0, h = !1; t < this.expression.length; ) {
      if (a = this.expression.charAt(t), u && (a === "+" || a === "-"))
        u = !1;
      else if (a >= "0" && a <= "9")
        h = !0, u = !1;
      else
        break;
      t++;
    }
    h || (t = s);
  }
  return e ? (this.current = this.newToken(G, parseFloat(this.expression.substring(r, t))), this.pos = t) : this.pos = s, e;
};
w.prototype.isOperator = function() {
  var e = this.pos, t = this.expression.charAt(this.pos);
  if (t === "+" || t === "-" || t === "*" || t === "/" || t === "%" || t === "^" || t === "?" || t === ":" || t === ".")
    this.current = this.newToken(v, t);
  else if (t === "∙" || t === "•")
    this.current = this.newToken(v, "*");
  else if (t === ">")
    this.expression.charAt(this.pos + 1) === "=" ? (this.current = this.newToken(v, ">="), this.pos++) : this.current = this.newToken(v, ">");
  else if (t === "<")
    this.expression.charAt(this.pos + 1) === "=" ? (this.current = this.newToken(v, "<="), this.pos++) : this.current = this.newToken(v, "<");
  else if (t === "|")
    if (this.expression.charAt(this.pos + 1) === "|")
      this.current = this.newToken(v, "||"), this.pos++;
    else
      return !1;
  else if (t === "=")
    this.expression.charAt(this.pos + 1) === "=" ? (this.current = this.newToken(v, "=="), this.pos++) : this.current = this.newToken(v, t);
  else if (t === "!")
    this.expression.charAt(this.pos + 1) === "=" ? (this.current = this.newToken(v, "!="), this.pos++) : this.current = this.newToken(v, t);
  else
    return !1;
  return this.pos++, this.isOperatorEnabled(this.current.value) ? !0 : (this.pos = e, !1);
};
w.prototype.isOperatorEnabled = function(e) {
  return this.parser.isOperatorEnabled(e);
};
w.prototype.getCoordinates = function() {
  var e = 0, t, r = -1;
  do
    e++, t = this.pos - r, r = this.expression.indexOf(`
`, r + 1);
  while (r >= 0 && r < this.pos);
  return {
    line: e,
    column: t
  };
};
w.prototype.parseError = function(e) {
  var t = this.getCoordinates();
  throw new Error("parse error [" + t.line + ":" + t.column + "]: " + e);
};
function y(e, t, r) {
  this.parser = e, this.tokens = t, this.current = null, this.nextToken = null, this.next(), this.savedCurrent = null, this.savedNextToken = null, this.allowMemberAccess = r.allowMemberAccess !== !1;
}
y.prototype.next = function() {
  return this.current = this.nextToken, this.nextToken = this.tokens.next();
};
y.prototype.tokenMatches = function(e, t) {
  return typeof t > "u" ? !0 : Array.isArray(t) ? P(t, e.value) : typeof t == "function" ? t(e) : e.value === t;
};
y.prototype.save = function() {
  this.savedCurrent = this.current, this.savedNextToken = this.nextToken, this.tokens.save();
};
y.prototype.restore = function() {
  this.tokens.restore(), this.current = this.savedCurrent, this.nextToken = this.savedNextToken;
};
y.prototype.accept = function(e, t) {
  return this.nextToken.type === e && this.tokenMatches(this.nextToken, t) ? (this.next(), !0) : !1;
};
y.prototype.expect = function(e, t) {
  if (!this.accept(e, t)) {
    var r = this.tokens.getCoordinates();
    throw new Error("parse error [" + r.line + ":" + r.column + "]: Expected " + (t || e));
  }
};
y.prototype.parseAtom = function(e) {
  var t = this.tokens.unaryOps;
  function r(n) {
    return n.value in t;
  }
  if (this.accept(Z) || this.accept(v, r))
    e.push(new p(A, this.current.value));
  else if (this.accept(G))
    e.push(new p(E, this.current.value));
  else if (this.accept(ce))
    e.push(new p(E, this.current.value));
  else if (this.accept(O, "("))
    this.parseExpression(e), this.expect(O, ")");
  else if (this.accept(R, "["))
    if (this.accept(R, "]"))
      e.push(new p(N, 0));
    else {
      var s = this.parseArrayList(e);
      e.push(new p(N, s));
    }
  else
    throw new Error("unexpected " + this.nextToken);
};
y.prototype.parseExpression = function(e) {
  var t = [];
  this.parseUntilEndStatement(e, t) || (this.parseVariableAssignmentExpression(t), !this.parseUntilEndStatement(e, t) && this.pushExpression(e, t));
};
y.prototype.pushExpression = function(e, t) {
  for (var r = 0, s = t.length; r < s; r++)
    e.push(t[r]);
};
y.prototype.parseUntilEndStatement = function(e, t) {
  return this.accept(ee) ? (this.nextToken && this.nextToken.type !== q && !(this.nextToken.type === O && this.nextToken.value === ")") && t.push(new p(V)), this.nextToken.type !== q && this.parseExpression(t), e.push(new p(d, t)), !0) : !1;
};
y.prototype.parseArrayList = function(e) {
  for (var t = 0; !this.accept(R, "]"); )
    for (this.parseExpression(e), ++t; this.accept($); )
      this.parseExpression(e), ++t;
  return t;
};
y.prototype.parseVariableAssignmentExpression = function(e) {
  for (this.parseConditionalExpression(e); this.accept(v, "="); ) {
    var t = e.pop(), r = [], s = e.length - 1;
    if (t.type === S) {
      if (!this.tokens.isOperatorEnabled("()="))
        throw new Error("function definition is not permitted");
      for (var n = 0, i = t.value + 1; n < i; n++) {
        var a = s - n;
        e[a].type === A && (e[a] = new p(_, e[a].value));
      }
      this.parseVariableAssignmentExpression(r), e.push(new p(d, r)), e.push(new p(D, t.value));
      continue;
    }
    if (t.type !== A && t.type !== m)
      throw new Error("expected variable for assignment");
    this.parseVariableAssignmentExpression(r), e.push(new p(_, t.value)), e.push(new p(d, r)), e.push(T("="));
  }
};
y.prototype.parseConditionalExpression = function(e) {
  for (this.parseOrExpression(e); this.accept(v, "?"); ) {
    var t = [], r = [];
    this.parseConditionalExpression(t), this.expect(v, ":"), this.parseConditionalExpression(r), e.push(new p(d, t)), e.push(new p(d, r)), e.push(le("?"));
  }
};
y.prototype.parseOrExpression = function(e) {
  for (this.parseAndExpression(e); this.accept(v, "or"); ) {
    var t = [];
    this.parseAndExpression(t), e.push(new p(d, t)), e.push(T("or"));
  }
};
y.prototype.parseAndExpression = function(e) {
  for (this.parseComparison(e); this.accept(v, "and"); ) {
    var t = [];
    this.parseComparison(t), e.push(new p(d, t)), e.push(T("and"));
  }
};
var xe = ["==", "!=", "<", "<=", ">=", ">", "in"];
y.prototype.parseComparison = function(e) {
  for (this.parseAddSub(e); this.accept(v, xe); ) {
    var t = this.current;
    this.parseAddSub(e), e.push(T(t.value));
  }
};
var Me = ["+", "-", "||"];
y.prototype.parseAddSub = function(e) {
  for (this.parseTerm(e); this.accept(v, Me); ) {
    var t = this.current;
    this.parseTerm(e), e.push(T(t.value));
  }
};
var Ae = ["*", "/", "%"];
y.prototype.parseTerm = function(e) {
  for (this.parseFactor(e); this.accept(v, Ae); ) {
    var t = this.current;
    this.parseFactor(e), e.push(T(t.value));
  }
};
y.prototype.parseFactor = function(e) {
  var t = this.tokens.unaryOps;
  function r(n) {
    return n.value in t;
  }
  if (this.save(), this.accept(v, r)) {
    if (this.current.value !== "-" && this.current.value !== "+") {
      if (this.nextToken.type === O && this.nextToken.value === "(") {
        this.restore(), this.parseExponential(e);
        return;
      } else if (this.nextToken.type === ee || this.nextToken.type === $ || this.nextToken.type === q || this.nextToken.type === O && this.nextToken.value === ")") {
        this.restore(), this.parseAtom(e);
        return;
      }
    }
    var s = this.current;
    this.parseFactor(e), e.push(B(s.value));
  } else
    this.parseExponential(e);
};
y.prototype.parseExponential = function(e) {
  for (this.parsePostfixExpression(e); this.accept(v, "^"); )
    this.parseFactor(e), e.push(T("^"));
};
y.prototype.parsePostfixExpression = function(e) {
  for (this.parseFunctionCall(e); this.accept(v, "!"); )
    e.push(B("!"));
};
y.prototype.parseFunctionCall = function(e) {
  var t = this.tokens.unaryOps;
  function r(i) {
    return i.value in t;
  }
  if (this.accept(v, r)) {
    var s = this.current;
    this.parseAtom(e), e.push(B(s.value));
  } else
    for (this.parseMemberExpression(e); this.accept(O, "("); )
      if (this.accept(O, ")"))
        e.push(new p(S, 0));
      else {
        var n = this.parseArgumentList(e);
        e.push(new p(S, n));
      }
};
y.prototype.parseArgumentList = function(e) {
  for (var t = 0; !this.accept(O, ")"); )
    for (this.parseExpression(e), ++t; this.accept($); )
      this.parseExpression(e), ++t;
  return t;
};
y.prototype.parseMemberExpression = function(e) {
  for (this.parseAtom(e); this.accept(v, ".") || this.accept(R, "["); ) {
    var t = this.current;
    if (t.value === ".") {
      if (!this.allowMemberAccess)
        throw new Error('unexpected ".", member access is not permitted');
      this.expect(Z), e.push(new p(m, this.current.value));
    } else if (t.value === "[") {
      if (!this.tokens.isOperatorEnabled("["))
        throw new Error('unexpected "[]", arrays are disabled');
      this.parseExpression(e), this.expect(R, "]"), e.push(T("["));
    } else
      throw new Error("unexpected symbol: " + t.value);
  }
};
function Oe(e, t) {
  return Number(e) + Number(t);
}
function Te(e, t) {
  return e - t;
}
function be(e, t) {
  return e * t;
}
function ke(e, t) {
  return e / t;
}
function _e(e, t) {
  return e % t;
}
function me(e, t) {
  return Array.isArray(e) && Array.isArray(t) ? e.concat(t) : "" + e + t;
}
function Ce(e, t) {
  return e === t;
}
function Ie(e, t) {
  return e !== t;
}
function Pe(e, t) {
  return e > t;
}
function Se(e, t) {
  return e < t;
}
function Ne(e, t) {
  return e >= t;
}
function Re(e, t) {
  return e <= t;
}
function Fe(e, t) {
  return !!(e && t);
}
function je(e, t) {
  return !!(e || t);
}
function Le(e, t) {
  return P(t, e);
}
function Ue(e) {
  return (Math.exp(e) - Math.exp(-e)) / 2;
}
function qe(e) {
  return (Math.exp(e) + Math.exp(-e)) / 2;
}
function Qe(e) {
  return e === 1 / 0 ? 1 : e === -1 / 0 ? -1 : (Math.exp(e) - Math.exp(-e)) / (Math.exp(e) + Math.exp(-e));
}
function De(e) {
  return e === -1 / 0 ? e : Math.log(e + Math.sqrt(e * e + 1));
}
function Ve(e) {
  return Math.log(e + Math.sqrt(e * e - 1));
}
function Be(e) {
  return Math.log((1 + e) / (1 - e)) / 2;
}
function ie(e) {
  return Math.log(e) * Math.LOG10E;
}
function Ge(e) {
  return -e;
}
function $e(e) {
  return !e;
}
function Xe(e) {
  return e < 0 ? Math.ceil(e) : Math.floor(e);
}
function He(e) {
  return Math.random() * (e || 1);
}
function ae(e) {
  return te(e + 1);
}
function Ye(e) {
  return isFinite(e) && e === Math.round(e);
}
var ze = 4.7421875, H = [
  0.9999999999999971,
  57.15623566586292,
  -59.59796035547549,
  14.136097974741746,
  -0.4919138160976202,
  3399464998481189e-20,
  4652362892704858e-20,
  -9837447530487956e-20,
  1580887032249125e-19,
  -21026444172410488e-20,
  21743961811521265e-20,
  -1643181065367639e-19,
  8441822398385275e-20,
  -26190838401581408e-21,
  36899182659531625e-22
];
function te(e) {
  var t, r;
  if (Ye(e)) {
    if (e <= 0)
      return isFinite(e) ? 1 / 0 : NaN;
    if (e > 171)
      return 1 / 0;
    for (var s = e - 2, n = e - 1; s > 1; )
      n *= s, s--;
    return n === 0 && (n = 1), n;
  }
  if (e < 0.5)
    return Math.PI / (Math.sin(Math.PI * e) * te(1 - e));
  if (e >= 171.35)
    return 1 / 0;
  if (e > 85) {
    var i = e * e, a = i * e, u = a * e, h = u * e;
    return Math.sqrt(2 * Math.PI / e) * Math.pow(e / Math.E, e) * (1 + 1 / (12 * e) + 1 / (288 * i) - 139 / (51840 * a) - 571 / (2488320 * u) + 163879 / (209018880 * h) + 5246819 / (75246796800 * h * e));
  }
  --e, r = H[0];
  for (var c = 1; c < H.length; ++c)
    r += H[c] / (e + c);
  return t = e + ze + 0.5, Math.sqrt(2 * Math.PI) * Math.pow(t, e + 0.5) * Math.exp(-t) * r;
}
function Ke(e) {
  return Array.isArray(e) ? e.length : String(e).length;
}
function oe() {
  for (var e = 0, t = 0, r = 0; r < arguments.length; r++) {
    var s = Math.abs(arguments[r]), n;
    t < s ? (n = t / s, e = e * n * n + 1, t = s) : s > 0 ? (n = s / t, e += n * n) : e += s;
  }
  return t === 1 / 0 ? 1 / 0 : t * Math.sqrt(e);
}
function ue(e, t, r) {
  return e ? t : r;
}
function We(e, t) {
  return typeof t > "u" || +t == 0 ? Math.round(e) : (e = +e, t = -+t, isNaN(e) || !(typeof t == "number" && t % 1 === 0) ? NaN : (e = e.toString().split("e"), e = Math.round(+(e[0] + "e" + (e[1] ? +e[1] - t : -t))), e = e.toString().split("e"), +(e[0] + "e" + (e[1] ? +e[1] + t : t))));
}
function Je(e, t, r) {
  return r && (r[e] = t), t;
}
function Ze(e, t) {
  return e[t | 0];
}
function et(e) {
  return arguments.length === 1 && Array.isArray(e) ? Math.max.apply(Math, e) : Math.max.apply(Math, arguments);
}
function tt(e) {
  return arguments.length === 1 && Array.isArray(e) ? Math.min.apply(Math, e) : Math.min.apply(Math, arguments);
}
function rt(e, t) {
  if (typeof e != "function")
    throw new Error("First argument to map is not a function");
  if (!Array.isArray(t))
    throw new Error("Second argument to map is not an array");
  return t.map(function(r, s) {
    return e(r, s);
  });
}
function st(e, t, r) {
  if (typeof e != "function")
    throw new Error("First argument to fold is not a function");
  if (!Array.isArray(r))
    throw new Error("Second argument to fold is not an array");
  return r.reduce(function(s, n, i) {
    return e(s, n, i);
  }, t);
}
function nt(e, t) {
  if (typeof e != "function")
    throw new Error("First argument to filter is not a function");
  if (!Array.isArray(t))
    throw new Error("Second argument to filter is not an array");
  return t.filter(function(r, s) {
    return e(r, s);
  });
}
function it(e, t) {
  if (!(Array.isArray(t) || typeof t == "string"))
    throw new Error("Second argument to indexOf is not a string or array");
  return t.indexOf(e);
}
function at(e, t) {
  if (!Array.isArray(t))
    throw new Error("Second argument to join is not an array");
  return t.join(e);
}
function ot(e) {
  return (e > 0) - (e < 0) || +e;
}
var he = 1 / 3;
function ut(e) {
  return e < 0 ? -Math.pow(-e, he) : Math.pow(e, he);
}
function ht(e) {
  return Math.exp(e) - 1;
}
function pt(e) {
  return Math.log(1 + e);
}
function lt(e) {
  return Math.log(e) / Math.LN2;
}
function C(e) {
  this.options = e || {}, this.unaryOps = {
    sin: Math.sin,
    cos: Math.cos,
    tan: Math.tan,
    asin: Math.asin,
    acos: Math.acos,
    atan: Math.atan,
    sinh: Math.sinh || Ue,
    cosh: Math.cosh || qe,
    tanh: Math.tanh || Qe,
    asinh: Math.asinh || De,
    acosh: Math.acosh || Ve,
    atanh: Math.atanh || Be,
    sqrt: Math.sqrt,
    cbrt: Math.cbrt || ut,
    log: Math.log,
    log2: Math.log2 || lt,
    ln: Math.log,
    lg: Math.log10 || ie,
    log10: Math.log10 || ie,
    expm1: Math.expm1 || ht,
    log1p: Math.log1p || pt,
    abs: Math.abs,
    ceil: Math.ceil,
    floor: Math.floor,
    round: Math.round,
    trunc: Math.trunc || Xe,
    "-": Ge,
    "+": Number,
    exp: Math.exp,
    not: $e,
    length: Ke,
    "!": ae,
    sign: Math.sign || ot
  }, this.binaryOps = {
    "+": Oe,
    "-": Te,
    "*": be,
    "/": ke,
    "%": _e,
    "^": Math.pow,
    "||": me,
    "==": Ce,
    "!=": Ie,
    ">": Pe,
    "<": Se,
    ">=": Ne,
    "<=": Re,
    and: Fe,
    or: je,
    in: Le,
    "=": Je,
    "[": Ze
  }, this.ternaryOps = {
    "?": ue
  }, this.functions = {
    random: He,
    fac: ae,
    min: tt,
    max: et,
    hypot: Math.hypot || oe,
    pyt: Math.hypot || oe,
    // backward compat
    pow: Math.pow,
    atan2: Math.atan2,
    if: ue,
    gamma: te,
    roundTo: We,
    map: rt,
    fold: st,
    filter: nt,
    indexOf: it,
    join: at
  }, this.consts = {
    E: Math.E,
    PI: Math.PI,
    true: !0,
    false: !1
  };
}
C.prototype.parse = function(e) {
  var t = [], r = new y(
    this,
    new w(this, e),
    { allowMemberAccess: this.options.allowMemberAccess }
  );
  return r.parseExpression(t), r.expect(q, "EOF"), new x(t, this);
};
C.prototype.evaluate = function(e, t) {
  return this.parse(e).evaluate(t);
};
var ge = new C();
C.parse = function(e) {
  return ge.parse(e);
};
C.evaluate = function(e, t) {
  return ge.parse(e).evaluate(t);
};
var pe = {
  "+": "add",
  "-": "subtract",
  "*": "multiply",
  "/": "divide",
  "%": "remainder",
  "^": "power",
  "!": "factorial",
  "<": "comparison",
  ">": "comparison",
  "<=": "comparison",
  ">=": "comparison",
  "==": "comparison",
  "!=": "comparison",
  "||": "concatenate",
  and: "logical",
  or: "logical",
  not: "logical",
  "?": "conditional",
  ":": "conditional",
  "=": "assignment",
  "[": "array",
  "()=": "fndef"
};
function ft(e) {
  return pe.hasOwnProperty(e) ? pe[e] : e;
}
C.prototype.isOperatorEnabled = function(e) {
  var t = ft(e), r = this.options.operators || {};
  return !(t in r) || !!r[t];
};
window.gform.initializeOnLoaded(function() {
  const e = window.GFCalc;
  window.GFCalc = function(t, r) {
    const s = new e(t, r);
    return s.runCalc = function(n, i) {
      let a = this, u = jQuery(
        "#field_" + i + "_" + n.field_id
      ), h = u.hasClass("gfield_price") ? jQuery(
        "#ginput_base_price_" + i + "_" + n.field_id
      ) : jQuery(
        "#input_" + i + "_" + n.field_id
      ), c = h.val(), l = gform.applyFilters(
        "gform_calculation_formula",
        n.formula,
        n,
        i,
        a
      ), f = a.replaceFieldTags(i, l, n).replace(/(\r\n|\n|\r)/gm, ""), o = "";
      if (this.exprPatt.test(f))
        try {
          o = C.parse(f).evaluate(this.values);
        } catch {
        }
      else
        return;
      isFinite(o) || (o = 0), window.gform_calculation_result && (o = window.gform_calculation_result(
        o,
        n,
        i,
        a
      ), window.console && console.log(
        '"gform_calculation_result" function is deprecated since version 1.8! Use "gform_calculation_result" JS hook instead.'
      )), o = gform.applyFilters(
        "gform_calculation_result",
        o,
        n,
        i,
        a
      );
      const g = gform.applyFilters(
        "gform_calculation_format_result",
        !1,
        o,
        n,
        i,
        a
      ), b = gf_get_field_number_format(
        n.field_id,
        i
      );
      if (g !== !1)
        o = g;
      else if (u.hasClass("gfield_price") || b == "currency")
        o = gformFormatMoney(o || 0, !0);
      else {
        let U = ".", I = ",";
        b == "decimal_comma" && (U = ",", I = "."), o = gformFormatNumber(
          o,
          gform.utils.isNumber(n.rounding) ? n.rounding : -1,
          U,
          I
        );
      }
      o !== c && (u.hasClass("gfield_price") ? (jQuery("#input_" + i + "_" + n.field_id).text(
        o
      ), h.val(o).trigger("change"), h && h.length > 0 && window.gform.utils.trigger({
        event: "change",
        el: h[0],
        native: !0
      }), jQuery(".gfield_label_product").length && !jQuery(".ginput_total").length && (o = jQuery(
        "label[ for=input_" + i + "_" + n.field_id + "_1 ]"
      ).find(".gfield_label_product").text() + " " + o, wp.a11y.speak(o))) : h.val(o).trigger("change"));
    }, s;
  };
});
jQuery(document).on(
  "gform_post_render",
  function(e, t, r) {
    jQuery(document).find("[data-style]").each(function() {
      const n = jQuery(this).data("style");
      jQuery(this).css(n), jQuery(this).removeAttr("data-style");
    });
  }
);
jQuery(document).on("gform_post_render", function() {
  gform.addFilter(
    "gform_file_upload_markup",
    function(e, t, r, s, n, i) {
      const a = /\son([a-z]*)\s*=\s*([\'"])((>\\\\\2|[^\2])*?)\2/g, u = r.settings.multipart_params.form_id, h = r.settings.multipart_params.field_id;
      return [...e.matchAll(a)].forEach(function(l) {
        const f = l[1];
        r.bind("UploadComplete", function() {
          document.querySelector(
            "[data-on" + f + "-handler=upload" + f + "handler_" + u + "_" + h + "]"
          ).addEventListener(f, function() {
            gformDeleteUploadedFile(u, h, this);
          });
        });
      }), e = e.replaceAll(
        a,
        ' data-on$1-handler="upload$1handler_' + u + "_" + h + '"'
      ), e;
    }
  );
});
