import { useUsuario } from '../contexts/UsuarioContext';
import { paletas, type PaletaPerfil } from './index';

/** Paleta do perfil de quem está usando o app (laranja antes da identificação). */
export function useTema(): PaletaPerfil {
  const { usuario } = useUsuario();
  return paletas[usuario?.perfil ?? 'idoso'];
}
