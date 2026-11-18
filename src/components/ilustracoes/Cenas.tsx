// Ilustrações originais das telas, desenhadas em SVG.
// Por serem vetores, ficam nítidas em qualquer celular e não pesam no app.

import Svg, { Circle, G, Path, Rect } from 'react-native-svg';

import { aparenciaVeredito } from '../../theme';
import type { Veredito } from '../../types';

/** Celular com uma mensagem suspeita: usado na tela do idoso. */
export function CelularAlerta({ tamanho = 130 }: { tamanho?: number }) {
  return (
    <Svg width={tamanho} height={tamanho} viewBox="0 0 140 140" accessibilityLabel="Celular com mensagem suspeita">
      <Rect x={34} y={10} width={64} height={116} rx={14} fill="#2A1E17" />
      <Rect x={40} y={22} width={52} height={92} rx={6} fill="#FFF7EC" />
      <Rect x={58} y={14} width={16} height={4} rx={2} fill="#5E4B3C" />
      <Rect x={46} y={32} width={34} height={12} rx={6} fill="#E9D8C4" />
      <Rect x={52} y={50} width={34} height={12} rx={6} fill="#FFE3D1" />
      <Rect x={46} y={68} width={28} height={12} rx={6} fill="#E9D8C4" />
      {/* balão de alerta saindo do celular */}
      <Path d="M84 46 h40 a10 10 0 0 1 10 10 v26 a10 10 0 0 1 -10 10 h-22 l-12 12 v-12 h-6 a10 10 0 0 1 -10 -10 v-26 a10 10 0 0 1 10 -10z" fill="#C62828" />
      <Rect x={101} y={56} width={8} height={20} rx={4} fill="#FFFFFF" />
      <Circle cx={105} cy={83} r={4.5} fill="#FFFFFF" />
      <Circle cx={22} cy={30} r={6} fill="#FFC93C" />
      <Circle cx={14} cy={100} r={4} fill="#FF8A3D" />
    </Svg>
  );
}

/** Duas pessoas e um coração: usado na tela da família. */
export function FamiliaUnida({ tamanho = 140 }: { tamanho?: number }) {
  return (
    <Svg width={tamanho} height={tamanho * 0.8} viewBox="0 0 160 128" accessibilityLabel="Família unida">
      {/* pessoa mais velha */}
      <Circle cx={52} cy={44} r={18} fill="#F3C9A5" />
      <Path d="M34 40 q18 -26 36 0 q-4 -16 -18 -16 q-14 0 -18 16z" fill="#E7E2DA" />
      <Path d="M22 120 q2 -46 30 -48 q28 2 30 48z" fill="#FF8A3D" />
      {/* pessoa mais nova */}
      <Circle cx={108} cy={50} r={16} fill="#C68A5E" />
      <Path d="M92 46 q16 -24 32 0 q0 -14 -16 -14 q-16 0 -16 14z" fill="#3B2416" />
      <Path d="M82 120 q2 -40 26 -42 q24 2 26 42z" fill="#7C4DFF" />
      {/* coração */}
      <G transform="translate(68 4)">
        <Path d="M12 22 C-6 10 2 -4 12 4 C22 -4 30 10 12 22z" fill="#E53950" />
      </G>
      <Circle cx={142} cy={20} r={5} fill="#FFC93C" />
      <Circle cx={10} cy={64} r={4} fill="#9B6BFF" />
    </Svg>
  );
}

/** Ícone grande do resultado: escudo com X, triângulo com ! ou escudo com ✓. */
export function IconeVeredito({ veredito, tamanho = 84 }: { veredito: Veredito; tamanho?: number }) {
  const { cor } = aparenciaVeredito[veredito];
  const escudo = 'M50 6 L88 20 C88 60 74 86 50 96 C26 86 12 60 12 20 Z';
  return (
    <Svg width={tamanho} height={tamanho} viewBox="0 0 100 100" accessibilityElementsHidden>
      {veredito === 'suspeito' ? (
        <>
          <Path d="M50 8 L94 88 H6 Z" fill={cor} stroke="#FFFFFF" strokeWidth={4} strokeLinejoin="round" />
          <Rect x={45} y={36} width={10} height={28} rx={5} fill="#FFFFFF" />
          <Circle cx={50} cy={74} r={6} fill="#FFFFFF" />
        </>
      ) : (
        <>
          <Path d={escudo} fill={cor} stroke="#FFFFFF" strokeWidth={4} strokeLinejoin="round" />
          {veredito === 'golpe' ? (
            <Path d="M36 36 L64 64 M64 36 L36 64" stroke="#FFFFFF" strokeWidth={10} strokeLinecap="round" />
          ) : (
            <Path d="M33 50 L46 63 L68 38" stroke="#FFFFFF" strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          )}
        </>
      )}
    </Svg>
  );
}
