// ===== cataleg-campions (estat i lògica, separat de ui/icones-campions.js) =====
const DD_VER_DEFAULT = '16.23.1'; // Data Dragon 16.23.x = parc 26.23
try { const v = localStorage.getItem('hextech_ddver_v1'); if (v && /^\d+\.\d+\.\d+$/.test(v)) DD_VER = v; } catch (e) {}
const DD_EXC = { 'Wukong': 'MonkeyKing', "Kai'Sa": 'Kaisa', "Kha'Zix": 'Khazix', "Cho'Gath": 'Chogath', "Vel'Koz": 'Velkoz', "Bel'Veth": 'Belveth', 'LeBlanc': 'Leblanc', 'Nunu & Willump': 'Nunu', 'Renata Glasc': 'Renata', 'Doctor Mundo': 'DrMundo', "Kog'Maw": 'KogMaw', "Rek'Sai": 'RekSai', "K'Sante": 'KSante' };
function ddId(c) { return DD_EXC[c] || String(c).replace(/[^A-Za-z0-9]/g, ''); }
function champImgUrl(c) { return `https://ddragon.leagueoflegends.com/cdn/${DD_VER}/img/champion/${ddId(c)}.png`; }
