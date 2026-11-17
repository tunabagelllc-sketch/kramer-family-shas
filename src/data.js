// Shas and Mishnayos reference data.
// Gemara units are dafim (blatt), numbered from 2 to the last daf (Vilna Shas, Daf Yomi grouping).
// Mishnayos units are perakim, numbered from 1.

function m(key, name, heb, last, sefaria) {
  return { key, name, heb, last, sefaria };
}

const GEMARA = [
  { name: 'Zeraim', heb: 'זרעים', masechtos: [m('berachos', 'Berachos', 'ברכות', 64, 'Berakhot')] },
  { name: 'Moed', heb: 'מועד', masechtos: [
    m('shabbos', 'Shabbos', 'שבת', 157, 'Shabbat'), m('eruvin', 'Eruvin', 'עירובין', 105, 'Eruvin'),
    m('pesachim', 'Pesachim', 'פסחים', 121, 'Pesachim'), m('shekalim', 'Shekalim', 'שקלים', 22, 'Shekalim'),
    m('yoma', 'Yoma', 'יומא', 88, 'Yoma'), m('sukkah', 'Sukkah', 'סוכה', 56, 'Sukkah'),
    m('beitzah', 'Beitzah', 'ביצה', 40, 'Beitzah'), m('rosh-hashanah', 'Rosh Hashanah', 'ראש השנה', 35, 'Rosh_Hashanah'),
    m('taanis', 'Taanis', 'תענית', 31, 'Taanit'), m('megillah', 'Megillah', 'מגילה', 32, 'Megillah'),
    m('moed-katan', 'Moed Katan', 'מועד קטן', 29, 'Moed_Katan'), m('chagigah', 'Chagigah', 'חגיגה', 27, 'Chagigah') ] },
  { name: 'Nashim', heb: 'נשים', masechtos: [
    m('yevamos', 'Yevamos', 'יבמות', 122, 'Yevamot'), m('kesubos', 'Kesubos', 'כתובות', 112, 'Ketubot'),
    m('nedarim', 'Nedarim', 'נדרים', 91, 'Nedarim'), m('nazir', 'Nazir', 'נזיר', 66, 'Nazir'),
    m('sotah', 'Sotah', 'סוטה', 49, 'Sotah'), m('gittin', 'Gittin', 'גיטין', 90, 'Gittin'),
    m('kiddushin', 'Kiddushin', 'קידושין', 82, 'Kiddushin') ] },
  { name: 'Nezikin', heb: 'נזיקין', masechtos: [
    m('bava-kamma', 'Bava Kamma', 'בבא קמא', 119, 'Bava_Kamma'), m('bava-metzia', 'Bava Metzia', 'בבא מציעא', 119, 'Bava_Metzia'),
    m('bava-basra', 'Bava Basra', 'בבא בתרא', 176, 'Bava_Batra'), m('sanhedrin', 'Sanhedrin', 'סנהדרין', 113, 'Sanhedrin'),
    m('makkos', 'Makkos', 'מכות', 24, 'Makkot'), m('shevuos', 'Shevuos', 'שבועות', 49, 'Shevuot'),
    m('avodah-zarah', 'Avodah Zarah', 'עבודה זרה', 76, 'Avodah_Zarah'), m('horayos', 'Horayos', 'הוריות', 14, 'Horayot') ] },
  { name: 'Kodashim', heb: 'קדשים', masechtos: [
    m('zevachim', 'Zevachim', 'זבחים', 120, 'Zevachim'), m('menachos', 'Menachos', 'מנחות', 110, 'Menachot'),
    m('chullin', 'Chullin', 'חולין', 142, 'Chullin'), m('bechoros', 'Bechoros', 'בכורות', 61, 'Bekhorot'),
    m('arachin', 'Arachin', 'ערכין', 34, 'Arakhin'), m('temurah', 'Temurah', 'תמורה', 34, 'Temurah'),
    m('kereisos', 'Kereisos', 'כריתות', 28, 'Keritot'), m('meilah', 'Meilah, Kinnim, Tamid, Middos', 'מעילה', 37, 'Meilah') ] },
  { name: 'Taharos', heb: 'טהרות', masechtos: [m('niddah', 'Niddah', 'נדה', 73, 'Niddah')] },
];

const MISHNAH = [
  { name: 'Zeraim', heb: 'זרעים', masechtos: [
    m('berachos', 'Berachos', 'ברכות', 9, 'Mishnah_Berakhot'), m('peah', 'Peah', 'פאה', 8, 'Mishnah_Peah'),
    m('demai', 'Demai', 'דמאי', 7, 'Mishnah_Demai'), m('kilayim', 'Kilayim', 'כלאים', 9, 'Mishnah_Kilayim'),
    m('sheviis', 'Sheviis', 'שביעית', 10, 'Mishnah_Sheviit'), m('terumos', 'Terumos', 'תרומות', 11, 'Mishnah_Terumot'),
    m('maasros', 'Maasros', 'מעשרות', 5, 'Mishnah_Maasrot'), m('maaser-sheni', 'Maaser Sheni', 'מעשר שני', 5, 'Mishnah_Maaser_Sheni'),
    m('challah', 'Challah', 'חלה', 4, 'Mishnah_Challah'), m('orlah', 'Orlah', 'ערלה', 3, 'Mishnah_Orlah'),
    m('bikkurim', 'Bikkurim', 'ביכורים', 3, 'Mishnah_Bikkurim') ] },
  { name: 'Moed', heb: 'מועד', masechtos: [
    m('shabbos', 'Shabbos', 'שבת', 24, 'Mishnah_Shabbat'), m('eruvin', 'Eruvin', 'עירובין', 10, 'Mishnah_Eruvin'),
    m('pesachim', 'Pesachim', 'פסחים', 10, 'Mishnah_Pesachim'), m('shekalim', 'Shekalim', 'שקלים', 8, 'Mishnah_Shekalim'),
    m('yoma', 'Yoma', 'יומא', 8, 'Mishnah_Yoma'), m('sukkah', 'Sukkah', 'סוכה', 5, 'Mishnah_Sukkah'),
    m('beitzah', 'Beitzah', 'ביצה', 5, 'Mishnah_Beitzah'), m('rosh-hashanah', 'Rosh Hashanah', 'ראש השנה', 4, 'Mishnah_Rosh_Hashanah'),
    m('taanis', 'Taanis', 'תענית', 4, 'Mishnah_Taanit'), m('megillah', 'Megillah', 'מגילה', 4, 'Mishnah_Megillah'),
    m('moed-katan', 'Moed Katan', 'מועד קטן', 3, 'Mishnah_Moed_Katan'), m('chagigah', 'Chagigah', 'חגיגה', 3, 'Mishnah_Chagigah') ] },
  { name: 'Nashim', heb: 'נשים', masechtos: [
    m('yevamos', 'Yevamos', 'יבמות', 16, 'Mishnah_Yevamot'), m('kesubos', 'Kesubos', 'כתובות', 13, 'Mishnah_Ketubot'),
    m('nedarim', 'Nedarim', 'נדרים', 11, 'Mishnah_Nedarim'), m('nazir', 'Nazir', 'נזיר', 9, 'Mishnah_Nazir'),
    m('sotah', 'Sotah', 'סוטה', 9, 'Mishnah_Sotah'), m('gittin', 'Gittin', 'גיטין', 9, 'Mishnah_Gittin'),
    m('kiddushin', 'Kiddushin', 'קידושין', 4, 'Mishnah_Kiddushin') ] },
  { name: 'Nezikin', heb: 'נזיקין', masechtos: [
    m('bava-kamma', 'Bava Kamma', 'בבא קמא', 10, 'Mishnah_Bava_Kamma'), m('bava-metzia', 'Bava Metzia', 'בבא מציעא', 10, 'Mishnah_Bava_Metzia'),
    m('bava-basra', 'Bava Basra', 'בבא בתרא', 10, 'Mishnah_Bava_Batra'), m('sanhedrin', 'Sanhedrin', 'סנהדרין', 11, 'Mishnah_Sanhedrin'),
    m('makkos', 'Makkos', 'מכות', 3, 'Mishnah_Makkot'), m('shevuos', 'Shevuos', 'שבועות', 8, 'Mishnah_Shevuot'),
    m('eduyos', 'Eduyos', 'עדיות', 8, 'Mishnah_Eduyot'), m('avodah-zarah', 'Avodah Zarah', 'עבודה זרה', 5, 'Mishnah_Avodah_Zarah'),
    m('avos', 'Avos', 'אבות', 5, 'Pirkei_Avot'), m('horayos', 'Horayos', 'הוריות', 3, 'Mishnah_Horayot') ] },
  { name: 'Kodashim', heb: 'קדשים', masechtos: [
    m('zevachim', 'Zevachim', 'זבחים', 14, 'Mishnah_Zevachim'), m('menachos', 'Menachos', 'מנחות', 13, 'Mishnah_Menachot'),
    m('chullin', 'Chullin', 'חולין', 12, 'Mishnah_Chullin'), m('bechoros', 'Bechoros', 'בכורות', 9, 'Mishnah_Bekhorot'),
    m('arachin', 'Arachin', 'ערכין', 9, 'Mishnah_Arakhin'), m('temurah', 'Temurah', 'תמורה', 7, 'Mishnah_Temurah'),
    m('kereisos', 'Kereisos', 'כריתות', 6, 'Mishnah_Keritot'), m('meilah', 'Meilah', 'מעילה', 6, 'Mishnah_Meilah'),
    m('tamid', 'Tamid', 'תמיד', 7, 'Mishnah_Tamid'), m('middos', 'Middos', 'מדות', 5, 'Mishnah_Middot'),
    m('kinnim', 'Kinnim', 'קנים', 3, 'Mishnah_Kinnim') ] },
  { name: 'Taharos', heb: 'טהרות', masechtos: [
    m('keilim', 'Keilim', 'כלים', 30, 'Mishnah_Kelim'), m('ohalos', 'Ohalos', 'אהלות', 18, 'Mishnah_Oholot'),
    m('negaim', 'Negaim', 'נגעים', 14, 'Mishnah_Negaim'), m('parah', 'Parah', 'פרה', 12, 'Mishnah_Parah'),
    m('taharos', 'Taharos', 'טהרות', 10, 'Mishnah_Tahorot'), m('mikvaos', 'Mikvaos', 'מקואות', 10, 'Mishnah_Mikvaot'),
    m('niddah', 'Niddah', 'נדה', 10, 'Mishnah_Niddah'), m('machshirin', 'Machshirin', 'מכשירין', 6, 'Mishnah_Makhshirin'),
    m('zavim', 'Zavim', 'זבים', 5, 'Mishnah_Zavim'), m('tevul-yom', 'Tevul Yom', 'טבול יום', 4, 'Mishnah_Tevul_Yom'),
    m('yadayim', 'Yadayim', 'ידים', 4, 'Mishnah_Yadayim'), m('uktzin', 'Uktzin', 'עוקצין', 3, 'Mishnah_Oktzin') ] },
];

// Tehillim: 150 kapitlach in five sefarim. Each sefer is picked like a masechta.
function sefer(n, heb, first, last) {
  return { key: 'sefer-' + n, name: 'Sefer ' + n, heb, first, last, sefaria: 'Psalms' };
}
const TEHILLIM = [
  { name: 'Tehillim', heb: 'תהלים', masechtos: [
    sefer(1, 'ספר ראשון', 1, 41), sefer(2, 'ספר שני', 42, 72), sefer(3, 'ספר שלישי', 73, 89),
    sefer(4, 'ספר רביעי', 90, 106), sefer(5, 'ספר חמישי', 107, 150) ] },
];

const TRACKS = {
  g: { key: 'g', name: 'Gemara', heb: 'תלמוד בבלי', sedarim: GEMARA, first: 2, one: 'daf', many: 'blatt', unitWord: 'Daf',
    prefix: '', rangePrefix: '', tapWord: 'dafim', wholeWord: 'masechta', doneWord: 'learned', rounds: false },
  m: { key: 'm', name: 'Mishnayos', heb: 'ששה סדרי משנה', sedarim: MISHNAH, first: 1, one: 'perek', many: 'perakim', unitWord: 'Perek',
    prefix: 'Mishnayos ', rangePrefix: 'perek ', tapWord: 'perakim', wholeWord: 'masechta', doneWord: 'learned', rounds: false },
  t: { key: 't', name: 'Tehillim', heb: 'תהלים', sedarim: TEHILLIM, first: 1, one: 'kapitel', many: 'kapitlach', unitWord: 'Kapitel',
    prefix: 'Tehillim ', rangePrefix: 'kapitel ', tapWord: 'kapitlach', wholeWord: 'sefer', doneWord: 'said', rounds: true },
};

for (const t of Object.values(TRACKS)) {
  t.byKey = {};
  t.total = 0;
  t.sedarim.forEach((s, si) => {
    s.total = 0;
    s.masechtos.forEach((x) => {
      x.seder = si;
      if (x.first == null) x.first = t.first;
      x.count = x.last - x.first + 1;
      s.total += x.count;
      t.byKey[x.key] = x;
    });
    t.total += s.total;
  });
}

const GENERATIONS = ['Zaidy & Bubby', 'Children', 'Grandchildren', 'Great-grandchildren'];

function hebNum(n) {
  const o = [[400, 'ת'], [300, 'ש'], [200, 'ר'], [100, 'ק'], [90, 'צ'], [80, 'פ'], [70, 'ע'], [60, 'ס'], [50, 'נ'], [40, 'מ'], [30, 'ל'], [20, 'כ'], [10, 'י'], [9, 'ט'], [8, 'ח'], [7, 'ז'], [6, 'ו'], [5, 'ה'], [4, 'ד'], [3, 'ג'], [2, 'ב'], [1, 'א']];
  let s = '';
  for (const [v, c] of o) while (n >= v) { s += c; n -= v; }
  return s.replace(/יה$/, 'טו').replace(/יו$/, 'טז');
}

// "2–40, 45, 50–52"
function ranges(units) {
  const u = [...units].sort((a, b) => a - b);
  const out = [];
  for (let i = 0; i < u.length; i++) {
    let j = i;
    while (j + 1 < u.length && u[j + 1] === u[j] + 1) j++;
    out.push(i === j ? String(u[i]) : `${u[i]}–${u[j]}`);
    i = j;
  }
  return out.join(', ');
}

// Link to the text on Sefaria. Gemara links to amud aleph of the daf.
function sefariaUrl(trackKey, x, unit) {
  if (trackKey === 't') return `https://www.sefaria.org/Psalms.${unit}`;
  if (trackKey === 'm') return `https://www.sefaria.org/${x.sefaria}.${unit}`;
  if (x.key === 'meilah') {
    if (unit <= 22) return `https://www.sefaria.org/Meilah.${unit}a`;
    if (unit >= 26 && unit <= 33) return `https://www.sefaria.org/Tamid.${unit}a`;
    return null;
  }
  return `https://www.sefaria.org/${x.sefaria}.${unit}a`;
}

module.exports = { TRACKS, GENERATIONS, hebNum, ranges, sefariaUrl };
