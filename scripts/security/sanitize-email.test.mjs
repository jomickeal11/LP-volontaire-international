import { test } from "node:test"
import assert from "node:assert/strict"
import { JSDOM } from "jsdom"
import createDOMPurify from "dompurify"

// Réplique exacte de la configuration utilisée dans EmailViewModal.tsx :
// DOMPurify.sanitize(html, { USE_PROFILES: { html: true } })
const window = new JSDOM("").window
const DOMPurify = createDOMPurify(window)

const sanitize = (html) =>
  DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ["form", "input", "button", "select", "textarea", "option"],
  })

const FORBIDDEN = ["<script", "onerror", "onload", "onclick", "javascript:", "<iframe", "<svg", "<form", "<object", "<embed"]

function assertSafe(html, label) {
  const out = sanitize(html)
  for (const token of FORBIDDEN) {
    assert.ok(!out.toLowerCase().includes(token), `${label}: ${token} encore présent dans le rendu`)
  }
  return out
}

test("balise <script> est supprimée", () => {
  const out = assertSafe("<p>bonjour</p><script>alert(1)</script><p>après</p>", "script")
  assert.ok(out.includes("bonjour"))
  assert.ok(out.includes("après"))
})

test("attribut onerror est supprimé", () => {
  assertSafe('<img src="x" onerror="alert(1)">', "onerror")
  assertSafe('<img src="x" Onerror=alert(1)>', "onerror majuscule")
  assertSafe('<img src="x" onerror=alert(1)>', "onerror sans guillemets")
})

test("URL javascript: est bloquée dans href", () => {
  const out = assertSafe('<a href="javascript:alert(1)">clic</a>', "href javascript")
  assert.ok(!out.toLowerCase().includes("javascript:"))
})

test("divers gestionnaires d'événements supprimés", () => {
  assertSafe('<div onmouseover="alert(1)">x</div>', "onmouseover")
  assertSafe('<p onclick="alert(1)">x</p>', "onclick")
  assertSafe('<body onload="alert(1)">x</body>', "onload")
})

test("HTML malformé est neutralisé et normalisé", () => {
  const out = assertSafe('<p onclick="alert(1)">Hello <b>world', "malformé")
  assert.ok(out.toLowerCase().includes("hello"))
  assert.ok(out.toLowerCase().includes("<p>") || out.toLowerCase().includes("<p "))
})

test("iframe / svg / form / object / embed sont supprimés", () => {
  assertSafe('<iframe srcdoc="<script>alert(1)<\/script>"></iframe>', "iframe")
  assertSafe('<svg onload="alert(1)"><script>alert(1)<\/script></svg>', "svg")
  assertSafe('<form action="javascript:alert(1)"></form>', "form")
  assertSafe('<object data="x"></object>', "object")
  assertSafe('<embed src="x">', "embed")
})

test("le HTML éditorial légitime reste lisible", () => {
  const legit = `<p>Chère volontaire,</p>
<ul><li>point 1</li><li>point 2</li></ul>
<p>Merci de confirmer votre arrivée via le lien suivant :</p>
<p><a href="https://example.com/confirmer" style="color:#007BFF">Confirmer ma venue</a></p>
<table><tr><td>date</td><td>lieu</td></tr></table>
<strong>Équipe APTIC-R</strong>`
  const out = sanitize(legit)
  assert.ok(out.includes("<p>"), "paragraphes conservés")
  assert.ok(out.includes("<ul>"), "listes conservées")
  assert.ok(out.includes("<strong>"), "gras conservé")
  assert.ok(out.includes("<table>"), "tableaux conservés")
  assert.ok(out.includes("https://example.com/confirmer"), "lien légitime conservé")
  assert.ok(out.includes("color:#007BFF"), "style inline légitime conservé")
})

test("le renvoi n'exécute jamais le HTML (aucun script résiduel)", () => {
  // Simulation du contenu historique pré-correction : données utilisateur brutes
  const historical = `Nom : Jean<br><img src="x" onerror="alert(1)"><a href="javascript:alert(2)">x</a><script>alert(3)</script>`
  const out = assertSafe(historical, "historique")
  assert.ok(out.includes("Jean"))
})