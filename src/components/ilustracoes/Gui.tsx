// Mascote original do app: o Alethos, o guardião, desenhado em SVG.
// É um escudo hoplita grego (aspis) de bronze, com elmo coríntio de penacho,
// borda em grega (o padrão "meandro" dos vasos gregos) e ramos de louro,
// o símbolo grego da vitória. É ele quem fala com a pessoa no tutorial.

import Svg, { Circle, Defs, Ellipse, G, Line, LinearGradient, Path, Stop } from 'react-native-svg';

export type HumorGui = 'feliz' | 'alerta';

interface Props {
  tamanho?: number;
  humor?: HumorGui;
}

const CONTORNO = '#5C2A0E';
const CENTRO = { x: 60, y: 84 };
const RAIO_ESCUDO = 42;

// Penacho do elmo: semicírculo com listras que partem da base.
const PENACHO = { cx: 61, base: 34, raio: 27 };
const LISTRAS_PENACHO = [40, 47, 54, 61, 68, 75, 82];
const alturaListra = (x: number) =>
  PENACHO.base - Math.sqrt(Math.max(PENACHO.raio ** 2 - (x - PENACHO.cx) ** 2, 0)) + 3;

// Grega (meandro): o mesmo "gancho" repetido em volta do escudo.
const PECAS_GREGA = 18;
const ANGULOS_GREGA = Array.from({ length: PECAS_GREGA }, (_, i) => (360 / PECAS_GREGA) * i);
const GANCHO_GREGA = 'M55.5 51 V45.5 H64.5 V49.8 H59 V47.8 H61.5';

// Folhas dos ramos de louro (lado esquerdo; o direito é espelhado).
const FOLHAS_LOURO = [
  { x: 25, y: 120, angulo: -30 },
  { x: 18, y: 108, angulo: -50 },
  { x: 14, y: 95, angulo: -70 },
  { x: 13, y: 82, angulo: -88 },
  { x: 31, y: 112, angulo: 30 },
  { x: 25, y: 99, angulo: 15 },
  { x: 22, y: 86, angulo: 0 },
];

export function Gui({ tamanho = 120, humor = 'feliz' }: Props) {
  const alturaOlho = humor === 'alerta' ? 10 : 8.5;

  return (
    <Svg width={tamanho} height={tamanho * (140 / 120)} viewBox="0 0 120 140" accessibilityLabel="Alethos, o guardião">
      <Defs>
        <LinearGradient id="gui-bronze" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#FFE08A" />
          <Stop offset="0.55" stopColor="#F2A93B" />
          <Stop offset="1" stopColor="#C46A18" />
        </LinearGradient>
        <LinearGradient id="gui-penacho" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#E8503A" />
          <Stop offset="1" stopColor="#A82C1E" />
        </LinearGradient>
      </Defs>

      {/* ramos de louro atrás do escudo */}
      {[1, -1].map((lado) => (
        <G key={lado} transform={lado === -1 ? 'translate(120 0) scale(-1 1)' : undefined}>
          <Path d="M34 128 Q14 110 16 76" stroke="#3F6B22" strokeWidth={3} fill="none" strokeLinecap="round" />
          {FOLHAS_LOURO.map((folha) => (
            <Ellipse
              key={`${folha.x}-${folha.y}`}
              cx={folha.x}
              cy={folha.y}
              rx={7}
              ry={3.6}
              fill="#5E9A35"
              stroke="#3F6B22"
              strokeWidth={1}
              transform={`rotate(${folha.angulo} ${folha.x} ${folha.y})`}
            />
          ))}
        </G>
      ))}

      {/* penacho (crista) do elmo */}
      <Path
        d={`M${PENACHO.cx - PENACHO.raio} ${PENACHO.base} A${PENACHO.raio} ${PENACHO.raio} 0 0 1 ${PENACHO.cx + PENACHO.raio} ${PENACHO.base} Z`}
        fill="url(#gui-penacho)"
        stroke={CONTORNO}
        strokeWidth={3}
        strokeLinejoin="round"
      />
      {LISTRAS_PENACHO.map((x) => (
        <Line key={x} x1={x} y1={PENACHO.base} x2={x} y2={alturaListra(x)} stroke="#7A1E14" strokeWidth={1.4} strokeOpacity={0.6} />
      ))}

      {/* elmo coríntio */}
      <Path d="M35 50 Q35 30 61 30 Q87 30 87 50 Z" fill="url(#gui-bronze)" stroke={CONTORNO} strokeWidth={3} strokeLinejoin="round" />
      <Path d="M44 36 Q52 32 60 32" stroke="#FFFFFF" strokeOpacity={0.6} strokeWidth={3} fill="none" strokeLinecap="round" />

      {/* escudo hoplita (aspis) */}
      <Circle cx={CENTRO.x} cy={CENTRO.y} r={RAIO_ESCUDO} fill="url(#gui-bronze)" stroke={CONTORNO} strokeWidth={4} />
      <Circle cx={CENTRO.x} cy={CENTRO.y} r={33} fill="none" stroke={CONTORNO} strokeWidth={1.5} strokeOpacity={0.55} />
      {ANGULOS_GREGA.map((angulo) => (
        <Path
          key={angulo}
          d={GANCHO_GREGA}
          stroke={CONTORNO}
          strokeWidth={1.6}
          strokeOpacity={0.75}
          fill="none"
          strokeLinejoin="miter"
          transform={`rotate(${angulo} ${CENTRO.x} ${CENTRO.y})`}
        />
      ))}
      <Path d="M28 70 Q34 52 52 46" stroke="#FFFFFF" strokeOpacity={0.55} strokeWidth={4} fill="none" strokeLinecap="round" />

      {/* olhos */}
      <Ellipse cx={48} cy={80} rx={8} ry={alturaOlho} fill="#FFFFFF" stroke={CONTORNO} strokeWidth={2.5} />
      <Ellipse cx={72} cy={80} rx={8} ry={alturaOlho} fill="#FFFFFF" stroke={CONTORNO} strokeWidth={2.5} />
      <Circle cx={49.5} cy={81.5} r={3.8} fill={CONTORNO} />
      <Circle cx={73.5} cy={81.5} r={3.8} fill={CONTORNO} />
      <Circle cx={50.8} cy={80} r={1.3} fill="#FFFFFF" />
      <Circle cx={74.8} cy={80} r={1.3} fill="#FFFFFF" />

      {/* bochechas */}
      <Circle cx={40} cy={94} r={5} fill="#FF6B6B" fillOpacity={0.45} />
      <Circle cx={80} cy={94} r={5} fill="#FF6B6B" fillOpacity={0.45} />

      {/* boca */}
      {humor === 'alerta' ? (
        <Ellipse cx={60} cy={99} rx={5.5} ry={6.5} fill={CONTORNO} />
      ) : (
        <Path d="M49 95 Q60 107 71 95" stroke={CONTORNO} strokeWidth={3.5} fill="none" strokeLinecap="round" />
      )}
    </Svg>
  );
}
