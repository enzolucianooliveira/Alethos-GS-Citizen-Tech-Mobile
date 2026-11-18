import { Pressable, StyleSheet, Text, View } from 'react-native';

import { alturaToque, cores, espaco, fonte, raio } from '../theme';

export interface Opcao<T extends string> {
  valor: T;
  rotulo: string;
}

// Componente genérico: funciona para Perfil, Origem ou qualquer lista de opções.
// O TypeScript garante que `aoSelecionar` recebe exatamente o tipo das opções.
export interface SeletorOpcoesProps<T extends string> {
  rotulo: string;
  opcoes: readonly Opcao<T>[];
  selecionado: T | null;
  aoSelecionar: (valor: T) => void;
  erro?: string;
  emColuna?: boolean;
}

export function SeletorOpcoes<T extends string>({
  rotulo,
  opcoes,
  selecionado,
  aoSelecionar,
  erro,
  emColuna = false,
}: SeletorOpcoesProps<T>) {
  return (
    <View style={styles.grupo} accessibilityRole="radiogroup" accessibilityLabel={rotulo}>
      <Text style={styles.rotulo}>{rotulo}</Text>
      <View style={[styles.opcoes, emColuna && styles.emColuna]}>
        {opcoes.map((opcao) => {
          const ativo = opcao.valor === selecionado;
          return (
            <Pressable
              key={opcao.valor}
              onPress={() => aoSelecionar(opcao.valor)}
              accessibilityRole="radio"
              accessibilityState={{ checked: ativo }}
              accessibilityLabel={opcao.rotulo}
              style={[styles.opcao, ativo && styles.opcaoAtiva, erro ? styles.opcaoComErro : null]}
            >
              <Text style={[styles.textoOpcao, ativo && styles.textoAtivo]}>
                {ativo ? '● ' : '○ '}
                {opcao.rotulo}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {erro ? <Text style={styles.erro}>{erro}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  grupo: { gap: espaco.pequeno },
  rotulo: { fontSize: fonte.normal, fontWeight: '700', color: cores.texto },
  opcoes: { flexDirection: 'row', flexWrap: 'wrap', gap: espaco.pequeno },
  emColuna: { flexDirection: 'column' },
  opcao: {
    minHeight: alturaToque - 8,
    justifyContent: 'center',
    paddingHorizontal: espaco.medio,
    borderRadius: raio,
    borderWidth: 2,
    borderColor: cores.borda,
    backgroundColor: cores.superficie,
  },
  opcaoAtiva: { borderColor: cores.primario, backgroundColor: cores.sucessoFundo },
  opcaoComErro: { borderColor: cores.perigo },
  textoOpcao: { fontSize: fonte.normal, color: cores.texto },
  textoAtivo: { fontWeight: '700', color: cores.primario },
  erro: { fontSize: fonte.pequena, fontWeight: '600', color: cores.perigo },
});
