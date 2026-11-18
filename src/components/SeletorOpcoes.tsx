import { Pressable, StyleSheet, Text, View } from 'react-native';

import { cores, espaco, fonte, raio } from '../theme';
import { useTema } from '../theme/useTema';
import { Texto } from './Texto';

export interface Opcao<T extends string> {
  valor: T;
  rotulo: string;
  icone?: string;
  descricao?: string;
}

// Componente genérico: funciona para Perfil, Origem ou qualquer lista de opções.
// O TypeScript garante que `aoSelecionar` recebe exatamente o tipo das opções.
export interface SeletorOpcoesProps<T extends string> {
  rotulo: string;
  opcoes: readonly Opcao<T>[];
  selecionado: T | null;
  aoSelecionar: (valor: T) => void;
  erro?: string;
  /** 'cartao': uma opção grande por linha. 'chip': várias por linha. */
  formato?: 'cartao' | 'chip';
}

export function SeletorOpcoes<T extends string>({
  rotulo,
  opcoes,
  selecionado,
  aoSelecionar,
  erro,
  formato = 'chip',
}: SeletorOpcoesProps<T>) {
  const tema = useTema();
  const cartao = formato === 'cartao';

  return (
    <View style={styles.grupo} accessibilityRole="radiogroup" accessibilityLabel={rotulo}>
      <Texto variante="destaque">{rotulo}</Texto>
      <View style={[styles.opcoes, cartao && styles.emColuna]}>
        {opcoes.map((opcao) => {
          const ativo = opcao.valor === selecionado;
          return (
            <Pressable
              key={opcao.valor}
              onPress={() => aoSelecionar(opcao.valor)}
              accessibilityRole="radio"
              accessibilityState={{ checked: ativo }}
              accessibilityLabel={opcao.descricao ? `${opcao.rotulo}. ${opcao.descricao}` : opcao.rotulo}
              style={({ pressed }) => [
                cartao ? styles.cartao : styles.chip,
                { borderColor: erro ? cores.perigo : ativo ? tema.principal : cores.borda },
                ativo && { backgroundColor: tema.claro },
                pressed && styles.pressionado,
              ]}
            >
              {opcao.icone ? <Text style={cartao ? styles.iconeGrande : styles.icone}>{opcao.icone}</Text> : null}
              <View style={styles.textos}>
                <Texto variante={cartao ? 'subtitulo' : 'destaque'} cor={ativo ? tema.escuro : cores.texto}>
                  {opcao.rotulo}
                </Texto>
                {cartao && opcao.descricao ? (
                  <Texto variante="legenda" cor={cores.textoSuave}>
                    {opcao.descricao}
                  </Texto>
                ) : null}
              </View>
              {cartao ? (
                <View style={[styles.marca, { borderColor: ativo ? tema.principal : cores.bordaForte }, ativo && { backgroundColor: tema.principal }]}>
                  {ativo ? <Text style={styles.check}>✓</Text> : null}
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </View>
      {erro ? (
        <Texto variante="legenda" cor={cores.perigo}>
          ✋ {erro}
        </Texto>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  grupo: { gap: espaco.pequeno },
  opcoes: { flexDirection: 'row', flexWrap: 'wrap', gap: espaco.pequeno },
  emColuna: { flexDirection: 'column', gap: espaco.medio },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.pequeno,
    minHeight: 56,
    paddingHorizontal: espaco.medio,
    borderRadius: raio.grande,
    borderWidth: 3,
    backgroundColor: cores.superficie,
  },
  cartao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.medio,
    padding: espaco.medio,
    borderRadius: raio.medio,
    borderWidth: 3,
    backgroundColor: cores.superficie,
  },
  pressionado: { opacity: 0.85 },
  icone: { fontSize: fonte.grande },
  iconeGrande: { fontSize: 40 },
  textos: { flexShrink: 1, flexGrow: 1 },
  marca: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  check: { color: cores.branco, fontSize: 18, fontWeight: '900' },
});
