/* Shared character art for the training mirror and the competition stage. */
window.CupArt = (() => {
  const ink = "#332738";
  const player = {
    hairstyle: "waves", skin: "#dc9868", shade: "#ad6551", light: "#ffe0a9",
    hair: "#332b38", shorts: "#ef783d", trim: "#ffce75", wrap: "#58ad9d", shirt: "#fff1ca"
  };
  const visitors = [
    {hairstyle:"crop", skin:"#a66749", shade:"#814836", light:"#df9d70", hair:"#322b32", shorts:"#8d70bd", trim:"#e3c2ff", wrap:"#ffc777", shirt:"#f4ddaf"},
    {hairstyle:"bun", skin:"#bd8662", shade:"#985d49", light:"#edbb8e", hair:"#392d31", shorts:"#438f8e", trim:"#a8e6be", wrap:"#efa263", shirt:"#f4e9ce"},
    {hairstyle:"waves", skin:"#e5b392", shade:"#b47a61", light:"#ffdbb2", hair:"#714439", shorts:"#687eaf", trim:"#d5d1f7", wrap:"#66bba9", shirt:"#fff0cf"},
    {hairstyle:"crop", skin:"#8c5d46", shade:"#684433", light:"#c28a63", hair:"#302a2a", shorts:"#d57559", trim:"#ffd990", wrap:"#91c2d2", shirt:"#f9e0c6"}
  ];

  const part = (d, fill) => `<path d="${d}" fill="${fill}"/>`;
  const shade = (d, fill, opacity=1) => `<path d="${d}" fill="${fill}" stroke="none" opacity="${opacity}"/>`;
  const line = (d, color=ink, width=1.25) => `<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}"/>`;
  const oval = (cx,cy,rx,ry,fill) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" stroke="none"/>`;
  const growth = n => .26*Math.sqrt(n/30) + .74*Math.pow(n/30,.83);

  function leg(side, size, p) {
    const knee = 15+size*21;
    const ankle = 19+size*30;
    const outer = 25+size*45;
    const inner = 4-size*4;
    const silhouette = `M ${inner} 132 Q ${outer-4} 122 ${outer} 145
      C ${outer+2} 158 ${knee+9} 165 ${knee+7} 174
      Q ${ankle+14+size*12} 184 ${ankle+6} 201 L ${ankle+4} 210
      L ${ankle-6} 210 Q ${ankle-7} 198 ${knee-6} 186
      Q ${knee-11-size*9} 178 ${knee-5} 169 Q ${inner-6} 151 ${inner} 132Z`;
    let art = part(silhouette,p.skin);
    art += shade(`M ${outer} 147 Q ${outer} 159 ${knee+7} 174
      Q ${ankle+12+size*12} 184 ${ankle+5} 202 L ${ankle} 203
      Q ${knee+8} 181 ${knee+1} 177 Q ${knee-1} 172 ${knee+2} 168
      Q ${outer-5} 164 ${outer} 147Z`,p.shade,.75);
    art += line(`M ${outer-7} 144 Q ${outer-6} 158 ${knee+1} 166 M ${knee-3} 173 q3 4 8 1`,p.shade);
    art += shade(`M ${inner+3} 141 Q ${knee+2} 144 ${knee} 159 Q ${inner+5} 155 ${inner+3} 141Z`,p.light,.57);
    art += part(`M ${ankle-7} 198 L ${ankle+7} 198 L ${ankle+6} 212 L ${ankle-7} 212Z`,"#f8eed7");
    art += line(`M ${ankle-6} 201h12 M ${ankle-6} 204h12`,p.wrap,1.8);
    art += part(`M ${ankle-7} 208 Q ${ankle-1} 211 ${ankle+6} 207
      L ${ankle+11} 213 Q ${ankle+21} 214 ${ankle+19} 220
      Q ${ankle+11} 223 ${ankle-9} 220 L ${ankle-10} 216Z`,"#fff0d1");
    art += shade(`M ${ankle-9} 217 Q ${ankle+7} 220 ${ankle+19} 216 L ${ankle+19} 220 Q ${ankle+9} 223 ${ankle-9} 220Z`,"#59475a");
    art += line(`M ${ankle+1} 211l4-1m-1 4 4-1`,"#685568",1.2);
    return `<g transform="scale(${side} 1)">${art}</g>`;
  }

  function shorts(size,p) {
    const hem=24+size*25;
    let art=part(`M-19 124 Q0 129 19 124 Q ${hem} 132 ${hem+1} 141
      L ${hem-2} 147 Q ${hem-12} 149 5 145 L0 141 L-5 145
      Q -${hem-12} 149 -${hem-2} 147 L -${hem+1} 141 Q -${hem} 132 -19 124Z`,p.shorts);
    art+=shade(`M13 128 Q ${hem-3} 132 ${hem-1} 143 L ${hem-5} 145 Q ${hem-6} 135 13 128Z`,p.trim);
    art+=shade(`M-17 129 Q-${hem-5} 134 -${hem-6} 145 L -${hem-1} 144 Q-${hem-3} 134 -17 129Z`,p.trim);
    art+=part("M-19 124Q0 127 19 124l1 5q-19 4-40 0z",p.shorts);
    art+=line("M-3 130q3 1 5 0m-1 0 2 5m-4-4-2 3",p.light);
    art+=line("M13 136l-5 4m-20-5 4 3",p.shade);
    return art;
  }

  function torso(size,armSize,legSize,p) {
    const shoulder=23+size*23+armSize*3;
    const chest=23+size*39;
    const low=96+size*12;
    let art=part(`M-8 54 L-9 66 Q-13 71 -${shoulder} 73 L-${shoulder+2} 87
      Q -${chest+1} ${low} -20 113 L-18 129 Q0 134 18 129 L20 113
      Q ${chest+1} ${low} ${shoulder+2} 87 L ${shoulder} 73 Q13 71 9 66 L8 54Z`,p.skin);
    art+=shade("M-8 58Q0 64 9 56L9 65 1 71-9 66Z",p.shade,.85);
    art+=part(`M-13 68 Q-16 72 -${shoulder-3} 73 Q -${shoulder-6} 82 -${chest+1} 86
      Q -${chest+4} ${low+4} -22 112 L-19 126 Q0 131 19 126 L22 112
      Q ${chest+4} ${low+4} ${chest+1} 86 Q ${shoulder-6} 82 ${shoulder-3} 73 Q16 72 13 68
      Q11 82 0 83 Q-11 82 -13 68Z`,p.shirt);
    for(const s of [-1,1]){
      const side=shade(`M5 ${low+2} Q ${chest-10} ${low+11} ${chest+1} 90
        Q ${chest+2} ${low+4} 22 112 L18 124 L13 124 Q21 115 16 ${low+7}Z`,"#af8e8f",.53)
        +line(`M3 ${low} Q ${chest-10} ${low+7} ${chest-2} ${low-5}`,"#a89187",1.2)
        +line(`M15 73 Q14 82 6 84`,"#bda18d",1);
      art+=`<g transform="scale(${s} 1)">${side}</g>`;
    }
    art+=line("M-13 119q6 4 10 3m13-5-5 3","#bca695");
    art+=shorts(legSize,p);
    return art;
  }

  function head(p,squeezed) {
    let art=part("M-11 45q-9-4-6 5 2 6 7 5m21-10q9-4 6 5-2 6-7 5",p.skin);
    art+=part("M-12 36q3-11 13-11 12 0 14 13l-2 15q-2 9-11 13-4 1-10-4-6-4-6-12z",p.skin);
    art+=shade("M11 34q4 16-2 23-4 6-12 6 4 5 7 3 9-4 11-13l2-16z",p.shade,.74);
    if(p.hairstyle==="crop"){
      art+=part("M-14 44l-2-9q0-12 11-14 9-3 17 4 5 5 3 15l-3 4-1-10q-9 1-20-1l-2 9z",p.hair);
      art+=line("M-9 29q9-6 17-1","#ad8b72",1.05);
    } else if(p.hairstyle==="bun"){
      art+=part("M2 25q-5-7 0-11 5-6 12-2 9 6 1 13z",p.hair);
      art+=part("M-14 43q-4-10 0-16 7-11 21-7 13 3 10 17l-4 7-1-11q-12 0-20-5-1 9-6 15z",p.hair);
      art+=line("M3 22q6 2 11 1",p.wrap,1.8);
    } else {
      art+=part("M-14 44q-4-5-2-10-4-3-1-9l5 2q0-8 7-8l1 3q6-8 12-3l-1 3q9-3 12 4l-4 1q8 8 0 16l-4-6-5 1 2-6q-5 5-13 6l2-4q-7 3-9 10z",p.hair);
      art+=line("M-10 30q2-4 6-4m4 4q5-5 10-5","#9d7871",1.05);
    }
    art+=line(squeezed?"M-10 44l6-2m8 0 6 2":"M-10 44l6-1m8 0 6 1",p.hair,1.9);
    art+=oval(-6.6,48,1.8,squeezed?2.4:1.8,ink)+oval(6.4,48,1.8,squeezed?2.4:1.8,ink);
    art+=line("M0 48l-1.2 5 2.4 .1",p.shade);
    art+=squeezed?oval(.5,57,2.2,2.6,ink):line("M-4 57q4 3 8-1",ink,1.4);
    return art;
  }

  function arm(side,size,chest,p) {
    // The elbow shifts out and the fist rises. The biceps grow toward the cheek
    // while the hand and tapered forearm stay in front of the upper arm.
    const shoulder=23+chest*23+size*3;
    const elbow=50+size*31+chest*23;
    const elbowY=86-size*5;
    const wrist=elbow-5+size*6;
    const wristY=54-size*19;
    const inner=shoulder+7-size*31;
    const peak=66-size*39;
    let art=part(`M ${shoulder-8} 80 Q ${shoulder-7} 71 ${shoulder+1} 71
      C ${inner+5} ${69-size*14} ${inner-4} ${peak+9} ${inner+8} ${peak+2}
      C ${inner+24} ${peak-7} ${elbow-16} ${peak+2} ${elbow-8} ${elbowY-13}
      Q ${elbow+8} ${elbowY-10} ${elbow+5} ${elbowY+1}
      Q ${elbow+3} ${elbowY+8} ${elbow-8} ${elbowY+9}
      Q ${shoulder+11} ${elbowY+12} ${shoulder+2} 91 Q ${shoulder-8} 93 ${shoulder-8} 80Z`,p.skin);
    art+=shade(`M ${shoulder-5} 86 Q ${shoulder+5} 89 ${shoulder+10} 85
      Q ${elbow-16} ${elbowY+5} ${elbow+4} ${elbowY-4}
      Q ${elbow+6} ${elbowY+8} ${elbow-9} ${elbowY+9}
      Q ${shoulder+12} 98 ${shoulder+1} 91 Q ${shoulder-5} 92 ${shoulder-5} 86Z`,p.shade,.85);
    art+=shade(`M ${inner+4} ${peak+12} Q ${inner+9} ${peak+1} ${inner+20} ${peak+2}
      Q ${inner+25} ${peak+2} ${inner+23} ${peak+5}
      Q ${inner+13} ${peak+4} ${inner+4} ${peak+12}Z`,p.light,.82);
    art+=line(`M ${shoulder-5} 83 Q ${shoulder-3} 76 ${shoulder+3} 75 M ${elbow-19} ${elbowY-2} q4 2 8-2`,p.shade);
    art+=part(`M ${elbow-9} ${elbowY-2} Q ${elbow-12} ${elbowY-9} ${wrist-4} ${wristY+3}
      L ${wrist+5} ${wristY+1} Q ${elbow+10+size*4} ${elbowY-19} ${elbow+6} ${elbowY-2}
      Q ${elbow+2} ${elbowY+8} ${elbow-5} ${elbowY+5}Z`,p.skin);
    art+=shade(`M ${wrist+5} ${wristY+5} Q ${elbow+10+size*3} ${elbowY-16} ${elbow+4} ${elbowY}
      Q ${elbow+2} ${elbowY+5} ${elbow-3} ${elbowY+3} Q ${elbow+4} ${elbowY-9} ${wrist+5} ${wristY+5}Z`,p.shade,.7);
    art+=line(`M ${wrist-2} ${wristY+11} Q ${elbow-6} ${elbowY-13} ${elbow-6} ${elbowY-8}`,p.light,1.6);
    const fist=part("M-5 2-10-3q-3-3 0-6l1-2q-1-5 3-5l2 1q2-4 5-2l1 2q4-2 6 1l1 3q3 0 3 3l-2 7-4 5z",p.skin)
      +shade("M-8-5q4-1 8 3l3 2 5-3-2 7-10 1z",p.shade,.8)
      +line("M-8-8q3-2 6 1l4 3m-7-10 1 4m5-5 1 4m4-2 1 3",ink,1.05)
      +part("M-5 1 7 0l1 7-12 2z",p.wrap)+line("M-3 5l9-2",p.light,1.2);
    art+=`<g transform="translate(${wrist} ${wristY}) rotate(-12)">${fist}</g>`;
    return `<g transform="scale(${side} 1)">${art}</g>`;
  }

  function athlete(counts,p=player) {
    const [a,c,l]=counts.map(growth);
    return `<svg viewBox="-126 2 252 229" aria-hidden="true" preserveAspectRatio="xMidYMax meet">
      ${oval(0,221.5,41+24*l,4,"#211b3266")}
      <g stroke="${ink}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        ${leg(-1,l,p)}${leg(1,l,p)}${torso(c,a,l,p)}${head(p,a>.68)}${arm(-1,a,c,p)}${arm(1,a,c,p)}
      </g></svg>`;
  }

  function portrait(judge) {
    const isImpact=judge==="impact";
    const face=isImpact?
      `${part("M8 84q5-19 21-22l27-1q18 1 23 23","#584155")}
       ${part("M24 39q-9-4-7 6 1 6 9 7m34-13q10-5 8 5-1 7-9 9","#d88b60")}
       ${part("M21 34q3-16 22-16 18 0 21 16l-2 18-9 14-18 1-12-14z","#e49364")}
       ${shade("M60 33q3 25-18 31l10 2 10-14 2-19z","#ba665b")}
       ${part("M18 35q1-14 12-19l1-5 8 3q18-2 23 13l8 2q1 5-11 6-20-5-41 0z","#454064")}
       ${line("M29 38l12 4m8-3 9-3",ink,2.9)}
       ${oval(36,45,2.4,2.4,ink)}${oval(53,44,2.4,2.4,ink)}
       ${part("M31 53q11 4 25-3-3 12-15 10z","#fff1d7")}
       ${line("M40 58l-1-4m9 2v-3","#bc917e",1)}
       ${part("M23 66l12 7 6-6-8-4zm33-2-10 4 6 5 10-8z","#ffce84")}`:
      `${part("M7 84q6-20 25-23l18-1q19 2 27 24","#524771")}
       ${part("M25 40q-8-5-8 4 1 7 9 9m33-14q8-5 8 4-1 6-9 10","#b58263")}
       ${part("M22 34q0-18 18-20 19 0 23 17l-4 20-14 17h-6L25 53z","#bf8768")}
       ${shade("M58 28q6 15-6 28l-11 9 5 1 14-15 4-18z","#986448")}
       ${part("M21 42q-5-14 1-22 7-12 22-11 17 1 22 16 2 7-4 17l-4-12q-14 0-23-8-3 10-14 14z","#423959")}
       ${part("M21 38l17-2 2 4-3 8-12-1z","#f6deb1")}${part("M44 39l17-3-2 10-12 2z","#f6deb1")}
       ${line("M39 40l6-1",ink,2.4)}${oval(32,42,1.8,1.8,ink)}${oval(52,42,1.8,1.8,ink)}
       ${line("M43 44l-2 7 4-.4m-9 6q5 2 11-2",ink,1.4)}
       ${part("M28 64l11 5 5 9 5-10 8-5-1 10-13 9-14-10z","#decdf3")}`;
    return `<svg viewBox="0 0 84 84" aria-hidden="true"><rect width="84" height="84" rx="8" fill="${isImpact?"#f7bc7b":"#c5b9e8"}"/>
      ${shade("M0 64 65 0h12L0 78z",isImpact?"#e5a46d":"#afa0d8")}<g fill="none" stroke="${ink}" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7">${face}</g></svg>`;
  }
  return {athlete,portrait,player,visitors};
})();
