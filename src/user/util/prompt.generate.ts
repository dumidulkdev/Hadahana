// දත්ත සඳහා Interface එක
export interface AstrologicalDataPayload {
  reading: any;
  currentNakshatraInfo: any;
}

export function buildAstrologyPrompt(data: AstrologicalDataPayload): string {
  const { reading, currentNakshatraInfo } = data;
  const {
    birth_details,
    current_running_dasha,
    planetary_positions,
    current_transits,
  } = reading;

  // ග්‍රහ පිහිටීම් ටික ලස්සනට ලැයිස්තුවක් (List) විදිහට සකස් කිරීම
  const planetsList = Object.values(planetary_positions)
    .map((p: any) => {
      let status = '';
      if (p.is_retrograde) status += ' (වක්‍ර වී ඇත / Retrograde)';
      if (p.is_combust) status += ' (මූඪ වී ඇත / Combust)';
      return `- ${p.planet}: ${p.rashi} රාශියේ, ලග්නයෙන් ${p.house} වන භාවයේ සිටී.${status}`;
    })
    .join('\n');

  return `
ඔබ වසර 20කට වඩා අත්දැකීම් ඇති ප්‍රවීණ වෛදික ජ්‍යොතිෂ්‍යවේදියෙකි (Expert Vedic Astrologer). ඔබගේ කාර්යය වන්නේ පහත ලබා දී ඇති තාරකා විද්‍යාත්මක දත්ත පමණක් පදනම් කරගෙන, මෙම පුද්ගලයාගේ ජීවිතය පිළිබඳව ඉතාමත් ගැඹුරු, නිවැරදි සහ ප්‍රායෝගික පලාපල විස්තරයක් සිංහල භාෂාවෙන් (Sinhala Language) ලබා දීමයි.

පහත දත්ත හොඳින් විශ්ලේෂණය කරන්න:

1. මූලික කේන්දර සටහන (Birth Chart Details):
- ස්ත්‍රී/පුරුෂ භාවය: ${birth_details.gender === 'male' ? 'පුරුෂ' : 'ස්ත්‍රී'}
- ලග්නය: ${birth_details.lagnaya}
- නවාංශක ලග්නය (D9): ${birth_details.navamsha_lagnaya}
- චන්ද්‍ර රාශිය: ${birth_details.moon_sign}

2. නැකැත් තොරතුරු (Nakshatra Details):
- උපන් නැකත: ${currentNakshatraInfo.name} (පාදය ${birth_details.paadaya})
- ගණය: ${currentNakshatraInfo.gana}
- යෝනිය: ${currentNakshatraInfo.yoni}
- වෘක්ෂය: ${currentNakshatraInfo.wruksha}
- පක්ෂියා: ${currentNakshatraInfo.pakshi}
- නාඩිය: ${currentNakshatraInfo.nadi}

3. ග්‍රහ පිහිටීම් සහ විශේෂ තත්වයන් (Planetary Positions):
(භාව අංකය යනු ලග්නයෙන් කීවෙනි කොටුවේ සිටීද යන්නයි. මූඪ සහ වක්‍ර තත්වයන් කෙරෙහි විශේෂ අවධානය යොමු කරන්න)
${planetsList}

4. වර්තමාන කාලය සහ ගෝචර (Current Period & Transits):
- අද දිනට ගතවන මහ දශාව: ${current_running_dasha.mahadasha}
- අද දිනට ගතවන අතුරු දශාව: ${current_running_dasha.antardasha}
- වර්තමාන ගෝචර ගමන්: සෙනසුරු ලග්නයෙන් ${current_transits.ශනි_house} වන භාවයේද, බ්‍රහස්පති ලග්නයෙන් ${current_transits.ගුරු_house} වන භාවයේද ගමන් කරයි.

කරුණාකර පහත මාතෘකා යටතේ සවිස්තරාත්මක වාර්තාවක් (Comprehensive Reading) සපයන්න:

1. චරිත ස්වභාවය, ශක්තීන් සහ දුර්වලතා: (ලග්නය, චන්ද්‍ර රාශිය සහ නැකතේ යෝනිය/පක්ෂියා ඇසුරෙන් පුද්ගලයාගේ යහපත් ගතිගුණ මෙන්ම, ඔවුන් විසින් නිවැරදි කරගත යුතු දුර්වලතා සහ අඩුපාඩු ද සමබරව විස්තර කරන්න)
2. අධ්‍යාපනය සහ වෘත්තීය ජීවිතය: (10 වන භාවය, එහි සිටින ග්‍රහයන් සහ මූඪ වූ ග්‍රහයන්ගේ බලපෑම් ඇතුලත්ව)
3. විවාහය සහ පවුල් ජීවිතය: (7 වන භාවය සහ නවාංශක ලග්නය ඇසුරෙන්)
4. ආර්ථිකය සහ සමස්ත ඉදිරි අනාගතය: (කේන්දරයේ ඇති ග්‍රහ පිහිටීම් අනුව ජීවිතයේ සමස්ත දියුණුව, ධනය ඉපයීමේ හැකියාව සහ අනාගතයේදී ඔවුන්ට යා හැකි දුර පිළිබඳ පුළුල් විග්‍රහයක් ලබා දෙන්න)
5. වර්තමාන තත්වය සහ ඉදිරි වසර 2 සඳහා අනාවැකි: (දැනට ගතවන ${current_running_dasha.mahadasha} මහ දශාව සහ ගෝචර ගමන් ඇසුරෙන් වර්තමාන තත්වය සහ ආසන්න අනාගතය විස්තර කරන්න)
6. ජ්‍යොතිෂ්‍යමය උපදෙස් සහ පිළියම්: (අපල තත්වයන් ඇත්නම් කළ යුතු ප්‍රායෝගික ශාන්තිකර්ම. විශේෂයෙන් ${currentNakshatraInfo.wruksha} ගසට සාත්තු කිරීම හෝ අදාල ශාන්තිකර්ම යෝජනා කරන්න)

උපදෙස්:
* භාෂාව වෘත්තීය, කාරුණික සහ සාම්ප්‍රදායික ජ්‍යොතිෂ්‍ය වචන සහිත විය යුතුය.
* බිය ගන්වන සුළු වචන (උදා: මරණය, සම්පූර්ණ විනාශය, බරපතල අනතුරු) කිසිසේත් භාවිතා නොකරන්න. ඒ වෙනුවට "අභියෝගාත්මක විය හැක", "බාධා පැමිණිය හැක", "කල්පනාකාරී වන්න" ලෙස දක්වන්න.
* පිළිතුර කියවීමට පහසු වන සේ පැහැදිලි ඡේද සහ Bullet points සහිතව ලස්සනට සකස් කරන්න.
  `;
}
