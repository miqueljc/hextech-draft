import json
import os
S=os.path.dirname(os.path.abspath(__file__))+'/'
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))+'/'
src=open(S+'legacy/desk_v12pre.html',encoding='utf-8').read()
def rep(a,b,cnt=1):
    global src
    assert src.count(a)==cnt,(a,src.count(a)); src=src.replace(a,b)
rep("enemyOtps: ['Katarina', 'Yasuo', 'Nocturne'],","enemyOtps: [],")
rep('placeholder="Ex: Katarina, Yasuo, Draven" value="Katarina, Yasuo, Nocturne"','placeholder="Ex: Katarina, Yasuo, Draven" value=""')
rep('<div id="enemyOtpBadges" style="display:flex;flex-wrap:wrap;gap:4px;margin-top:6px;"></div>','<div id="enemyOtpBadges" style="display:flex;flex-wrap:wrap;gap:4px;margin-top:6px;"></div>\n        <div id="scoutPanel"></div>')
rep("i el 26.23 preview;","i les notes oficials del 26.23;")
rep('<a style="color:var(--blue);" target="_blank" rel="noopener" href="https://gameriv.com/league-of-legends-patch-26-23-preview/">Preview del 26.23 (GameRiv)</a>','<a style="color:var(--blue);" target="_blank" rel="noopener" href="https://www.leagueoflegends.com/en-us/news/game-updates/league-of-legends-patch-26-23-notes/">Notes oficials del 26.23 (Riot)</a>, <a style="color:var(--blue);" target="_blank" rel="noopener" href="https://gameriv.com/league-of-legends-patch-26-23-preview/">preview (GameRiv)</a>')
data=('const OP_PICKS_DEFAULT = '+open(S+'data/op2623.json').read().strip()+';\nconst DD_CAT_DEFAULT = '+open(S+'data/ddcat.json').read().strip()+';\nconst MATCHUPS_DEFAULT = '+open(S+'data/matchups.json').read()+';\nconst DUOWR_DEFAULT = '+open(S+'data/duowr.json').read()+';\nconst ROLE_RATES_DEFAULT = '+open(S+'data/rolerates.json').read()+';\n')
blk=open(S+'blocks/blockP.js',encoding='utf-8').read()+'\n'+open(S+'blocks/blockN.js',encoding='utf-8').read()+'\n'+open(S+'blocks/blockO.js',encoding='utf-8').read()+'\n'+open(S+'blocks/blockQ.js',encoding='utf-8').read()+'\n'+open(S+'blocks/blockR.js',encoding='utf-8').read()+'\n'+open(S+'blocks/blockS.js',encoding='utf-8').read()+'\n'+open(S+'blocks/blockT.js',encoding='utf-8').read()+'\n'+open(S+'blocks/blockU.js',encoding='utf-8').read()+'\n'+open(S+'blocks/blockV.js',encoding='utf-8').read()+'\n'+open(S+'blocks/blockW.js',encoding='utf-8').read()+'\n'+open(S+'blocks/blockX.js',encoding='utf-8').read()
rep('      <!-- Recomanacions immediates -->','      <button class="btn btn-primary" id="matchBtn" onclick="openMatchMode()">🎮 Mode partida (draft ràpid)</button>\n      <!-- Recomanacions immediates -->')
rep('\ninit();\n','\n'+data+blk+'\ninit();\n')
rep("""${c ? `${escapeHtml(c)} <span style="font-size:0.65rem;color:#fff;" onclick="clearSlot(event,'BAN','${side}',${i})">✕</span>` : `${side === 'BLUE' ? 'B' : 'R'}${i + 1}`}""","""${c ? `${champIcon(c, 28, 'ci-ban')}<span class="ban-name">${escapeHtml(c)}</span><span class="ban-x" onclick="clearSlot(event,'BAN','${side}',${i})">✕</span>` : `${side === 'BLUE' ? 'B' : 'R'}${i + 1}`}""")
rep("""          <span class="role-tag">P${i + 1}</span>
          <div>""","""          <span class="role-tag">P${i + 1}</span>
          ${c ? champIcon(c, 40, 'ci-pick') : ''}
          <div>""")
rep("""      <div style="font-weight:700;">${escapeHtml(champ)}</div>
      <div class="badges">
        ${rank && !isDis ? `<span class="badge-rec">⭐ Rec #${rank}</span>` : ''}
        ${bestTier(champ) ? `<span class="badge-tier" title="Tier 26.22 (millor rol)">${bestTier(champ)}</span>` : ''}
        ${PATCH_CHANGES[champ] ? `<span class="${PATCH_CHANGES[champ].delta > 0 ? 'badge-buff' : 'badge-nerf'}" title="${escapeHtml(PATCH_CHANGES[champ].note)}">${PATCH_CHANGES[champ].delta > 0 ? '▲' : '▼'} 26.23</span>` : ''}
        ${wrInfo ? `<span class="badge-wr">🔥 OP.GG</span>` : (inPool ? `<span class="badge-pool">Pool</span>` : '')}
        ${isTarget ? `<span class="badge-target">Ban Rival</span>` : ''}
      </div>""","""      <div class="cc-top">${champIcon(champ, 0, 'ci-grid')}
        ${rank && !isDis ? `<span class="cc-tag cc-rec" title="Recomanat #${rank}">⭐${rank}</span>` : ''}
        ${bestTier(champ) ? `<span class="cc-tag cc-tier" title="Tier 26.22 (millor rol)">${bestTier(champ)}</span>` : ''}
        ${PATCH_CHANGES[champ] ? `<span class="cc-tag cc-patch ${PATCH_CHANGES[champ].delta > 0 ? 'up' : 'down'}" title="${escapeHtml(PATCH_CHANGES[champ].note)}">${PATCH_CHANGES[champ].delta > 0 ? '▲' : '▼'}</span>` : ''}
        ${wrInfo ? `<span class="cc-tag cc-pool cc-hot" title="Bon WR a l'op.gg de l'equip">🔥</span>` : (inPool ? `<span class="cc-tag cc-pool" title="Al pool de l'equip">Pool</span>` : '')}</div>
      <div class="cc-name">${escapeHtml(champ)}</div>
""")
rep("""<div class="champ-chip ${isDis ? 'disabled' : ''}" data-champ""","""<div class="champ-chip ${isDis ? 'disabled' : ''} ${isTarget ? 'cc-target' : ''} ${inPool ? 'cc-inpool' : ''}" data-champ""")
rep("""    if (q && !champ.toLowerCase().includes(q)) return false;""","""    if (q && !champ.toLowerCase().includes(q)) return false;
    if (state.tagFilters && state.tagFilters.size && ![...state.tagFilters].every(t => hasTag(champ, t))) return false;""")
rep("""recsAll.filter(r => r.why.some(w => w.style === 'vs'))""","""recsAll.filter(r => r.score > 0 && !r.why.some(w => w.txt.startsWith('rol ja cobert')) && r.why.some(w => w.style === 'vs'))""")
rep("""recsAll.filter(r => r.why.some(w => w.style === 'own'))""","""recsAll.filter(r => r.score > 0 && !r.why.some(w => w.txt.startsWith('rol ja cobert')) && r.why.some(w => w.style === 'own'))""")
rep("""    if (ROLE_ORDER.includes(state.roleFilter)) return champRoles(champ).includes(state.roleFilter);""","""    if (ROLE_ORDER.includes(state.roleFilter)) return viableRoles(champ).includes(state.roleFilter);""")
rep("""  Domination: 'Taste of Blood · Eyeball Collection · Treasure Hunter',""","""  Domination: 'Taste of Blood · Grisly Mementos · Treasure Hunter',""")
rep("""  Inspiration: 'Hextech Flashtraption · Magical Footwear · Biscuit Delivery'""","""  Inspiration: 'Magical Footwear · Biscuit Delivery · Cosmic Insight'""")
# StepOn pool (19/11/2026)
rep("""    pool: ["Zaahen", "Evelynn", "Bel'Veth", "Nocturne", "Cho'Gath", "Wukong", "Vi", "Zyra", "Ekko", "Lillia", "Zac", "Fiddlesticks", "Qiyana", "Amumu", "Mordekaiser", "Rammus", "Sejuani", "Sion", "Naafiri", "Lee Sin"]""","""    pool: ["Zaahen", "Mordekaiser", "Fiddlesticks", "Zac", "Qiyana", "Bel'Veth", "Amumu", "Evelynn", "Sion", "Rammus", "Aurelion Sol", "Malphite"]""")
# --- aspecte escriptori (bloc T) ---
rep("""    <h1>HEXTECH DRAFT ROOM — PRO EDITION</h1>""","""    <h1>Hextech Draft Room</h1>""")
rep("""    <button id="btnSideBlue" class="btn btn-active-blue" onclick="setOurSide('BLUE')">🔵 Som BLUE SIDE</button>
    <button id="btnSideRed" class="btn" onclick="setOurSide('RED')">🔴 Som RED SIDE</button>
    <button id="btnModeOrder" class="btn btn-active-blue" onclick="setDraftMode('ORDER')">📋 Ordre Torneig</button>
    <button id="btnModeFree" class="btn" onclick="setDraftMode('FREE')">🖱️ Mode Lliure</button>
    <button id="btnFearless" class="btn" onclick="toggleFearless()">⚔️ Fearless: OFF</button>
    <button class="btn btn-danger" onclick="resetDraft()">🔄 Reiniciar Mapa</button>""","""    <div class="seg" title="El nostre costat"><button id="btnSideBlue" class="btn btn-active-blue" onclick="setOurSide('BLUE')">Som blau</button><button id="btnSideRed" class="btn" onclick="setOurSide('RED')">Som vermell</button></div>
    <div class="seg" title="Ordre del draft"><button id="btnModeOrder" class="btn btn-active-blue" onclick="setDraftMode('ORDER')">Ordre de torneig</button><button id="btnModeFree" class="btn" onclick="setDraftMode('FREE')">Lliure</button></div>
    <button id="btnFearless" class="btn" onclick="toggleFearless()">⚔️ Fearless: OFF</button>
    <button class="btn btn-quiet" onclick="resetDraft()">Reinicia el draft</button>""")
rep("""🎯 Simulador de Draft en Directe</button>""","""Draft</button>""")
rep("""👥 Roster, Pools i Winrates Reals (OP.GG)</button>""","""Equip i pools</button>""")
rep("""📚 Llibre de Composicions (Draft.xlsx)</button>""","""Llibre de comps</button>""")
rep("""🧠 Draft pro i flex</button>""","""Draft pro i flex</button>""")
rep("""🛠️ Dades i Editors</button>""","""Dades</button>""")
rep("""onclick="switchTab('patch', this)">📈 Parc 26.23</button>""","""onclick="switchTab('patch', this)">Parc 26.23</button>""")
rep("""        <span class="blue-title">🔵 BLUE SIDE <span id="blueTag">(NOSALTRES)</span></span>""","""        <span class="blue-title">Costat blau <span id="blueTag">(NOSALTRES)</span></span>""")
rep("""        <span class="red-title">🔴 RED SIDE <span id="redTag">(RIVAL)</span></span>""","""        <span class="red-title">Costat vermell <span id="redTag">(RIVAL)</span></span>""")
rep("""      <div style="font-size:0.72rem;color:var(--text-muted);margin-bottom:4px;">BANS BLUE (5)</div>""","""      <div class="side-lbl">Bans</div>""")
rep("""      <div style="font-size:0.72rem;color:var(--text-muted);margin-bottom:6px;">PICKS BLUE (5)</div>""","""      <div class="side-lbl">Picks</div>""")
rep("""      <div style="font-size:0.72rem;color:var(--text-muted);margin-bottom:4px;">BANS RED (5)</div>""","""      <div class="side-lbl">Bans</div>""")
rep("""      <div style="font-size:0.72rem;color:var(--text-muted);margin-bottom:6px;">PICKS RED (5)</div>""","""      <div class="side-lbl">Picks</div>""")
rep("""          <div style="font-size:0.72rem;color:var(--gold);font-weight:700;">TORN ACTUAL / SELECCIÓ</div>
""","")
rep("""          ${c ? champIcon(c, 40, 'ci-pick') : ''}""","""          ${c ? champIcon(c, 40, 'ci-pick') : ''}${c && IS_DESK ? `<span class="pk-art" style="background-image:url('${champLoadUrl(c)}')"></span>` : ''}""")
rep("""            <div class="player-sub">${c ? `Rols habituals: ${escapeHtml(roles || '—')}` : `Pick ${i + 1}`}</div>""","""            <div class="player-sub">${c ? slotSub(side, c) : `Pick ${i + 1}`}</div>""")
# --- parc 26.23: tier list Skill Capped ---
import re as _re
_t=json.load(open(S+'data/tier2623.json'))['raw']
_lines=['const TIER_RAW = {']
for _i,_L in enumerate(['T','J','M','B','S']):
    _lines.append('  '+_L+': {')
    _ks=['S+','S','A']
    for _j,_k in enumerate(_ks):
        _lines.append("    '"+_k+"': "+json.dumps(_t[_L][_k],ensure_ascii=False)+(',' if _j<2 else ''))
    _lines.append('  }'+(',' if _i<4 else ''))
_lines.append('};')
_n=len(_re.findall(r"const TIER_RAW = \{.*?\n\};",src,_re.S)); assert _n==1
src=_re.sub(r"const TIER_RAW = \{.*?\n\};",lambda m:'\n'.join(_lines),src,flags=_re.S)
rep("""  date: '18/11/2026',""","""  date: '20/11/2026',""")
rep("""  tierNote: 'Tier list del 26.22 (Emerald+, mitjana METAsrc + OP.GG): és la més recent disponible. Els campions que no hi surten són B o inferior (no es coneix el valor exacte).'""","""  tierNote: 'Tier list del 26.23 (Skill Capped, Emerald+): OP → S+, S i A. Els campions que no hi surten són B o inferior.'""")
rep("""  PATCH_META.tierSource = '26.22';""","""  PATCH_META.tierSource = '26.23';""")
rep("""  PATCH_META.tierNote = source === '26.22'
    ? 'Tier list del 26.22 (Emerald+, mitjana METAsrc + OP.GG): és la més recent disponible. Els campions que no hi surten són B o inferior (no es coneix el valor exacte).'""","""  PATCH_META.tierNote = source === '26.23'
    ? 'Tier list del 26.23 (Skill Capped, Emerald+): OP → S+, S i A. Els campions que no hi surten són B o inferior.'""")
rep("""setMsg('tierMsg', 'Restaurada la tier list del 26.22.');""","""setMsg('tierMsg', 'Restaurada la tier list del 26.23.');""")
rep("""  } else rebuildPatchTier(JSON.parse(JSON.stringify(DEFAULTS.tier)), '26.22');""","""  } else rebuildPatchTier(JSON.parse(JSON.stringify(DEFAULTS.tier)), '26.23');""")
rep("""↺ Tier list del 26.22</button>""","""↺ Tier list del 26.23</button>""")
rep("""    if (bt) add(TIER_PTS[bt], `${bt} al meta del 26.22`);""","""    if (bt) add(TIER_PTS[bt], `${bt} al meta del ${PATCH_META.tierSource}`);""")
src=src.replace("notes.push(`meta 26.22: ","notes.push(`meta ${PATCH_META.tierSource}: ")
rep("""label: 'Força al meta (tier 26.22)'""","""label: 'Força al meta (tier del parc)'""")
rep("""title="Tier 26.22 (millor rol)">""","""title="Tier del parc (millor rol)">""")
rep("""<th>Tier 26.22</th>""","""<th>Tier 26.23</th>""")
rep("""Meta per rol (tier list 26.22)</h4>""","""Meta per rol (tier list 26.23, Skill Capped)</h4>""")
rep("""href="https://axeetech.com/lol-tier-list/">Tier list 26.22 (Axeetech)</a></li>""","""href="https://www.skill-capped.com/lol/guides/stats">Tier list 26.23 (Skill Capped, Emerald+)</a></li>""")
open(ROOT+'pc.html','w',encoding='utf-8').write(src)
print('ok',len(src))
