// "Gui, o guardião": mascote original do Antigolpe, desenhado em SVG.
// É ele quem fala com a pessoa no tutorial.

import Svg, { Circle, Defs, Ellipse, LinearGradient, Path, Stop } from 'react-native-svg';

export type HumorGui = 'feliz' | 'alerta';

interface Props {
  tamanho?: number;
  humor?: HumorGui;
}

export function Gui({ tamanho = 120, humor = 'feliz' }: Props) {
  const contorno = '#7C2D12';
  return (
    <Svg width={tamanho} height={tamanho * (140 / 120)} viewBox="0 0 120 140" accessibilityLabel="Gui, o guardião">
      <Defs>
        <LinearGradient id="gui-corpo" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#FFD45C" />
          <Stop offset="1" stopColor="#FF7A29" />
        </LinearGradient>
      </Defs>

      {/* brilhos em volta */}
      <Path d="M8 14 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3z" fill="#FFC93C" />
      <Path d="M108 4 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2z" fill="#FFC93C" />

      {/* escudo */}
      <Path
        d="M60 8 L106 24 C106 72 90 108 60 132 C30 108 14 72 14 24 Z"
        fill="url(#gui-corpo)"
        stroke={contorno}
        strokeWidth={4}
        strokeLinejoin="round"
      />
      <Path d="M60 18 L96 30 C96 44 94 56 90 66" stroke="#FFFFFF" strokeOpacity={0.55} strokeWidth={5} fill="none" strokeLinecap="round" />

      {/* olhos */}
      <Ellipse cx={44} cy={60} rx={10} ry={humor === 'alerta' ? 12 : 10} fill="#FFFFFF" stroke={contorno} strokeWidth={3} />
      <Ellipse cx={76} cy={60} rx={10} ry={humor === 'alerta' ? 12 : 10} fill="#FFFFFF" stroke={contorno} strokeWidth={3} />
      <Circle cx={46} cy={62} r={4.5} fill={contorno} />
      <Circle cx={78} cy={62} r={4.5} fill={contorno} />
      <Circle cx={47.5} cy={60} r={1.5} fill="#FFFFFF" />
      <Circle cx={79.5} cy={60} r={1.5} fill="#FFFFFF" />

      {/* bochechas */}
      <Circle cx={34} cy={80} r={6} fill="#FF6B6B" fillOpacity={0.45} />
      <Circle cx={86} cy={80} r={6} fill="#FF6B6B" fillOpacity={0.45} />

      {/* boca */}
      {humor === 'alerta' ? (
        <Ellipse cx={60} cy={86} rx={7} ry={8} fill={contorno} />
      ) : (
        <Path d="M46 82 Q60 98 74 82" stroke={contorno} strokeWidth={4} fill="none" strokeLinecap="round" />
      )}
    </Svg>
  );
}
