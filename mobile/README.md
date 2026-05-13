# ZERO Mobile

App React Native (Expo) do ZERO Marketplace. Roda em iOS, Android e Web.

## Scripts

| Comando | O que faz |
|---------|-----------|
| `npm run start` | Metro bundler interativo |
| `npm run start:lan` | força modo LAN (Expo Go em celular físico) |
| `npm run start:tunnel` | túnel ngrok (Wi-Fi restrito) |
| `npm run android` | sobe no emulador Android |
| `npm run ios` | sobe no simulador iOS (macOS) |
| `npm run web` | abre no navegador em `localhost:8081` |
| `npm run typecheck` | `tsc --noEmit` |

## Estrutura

```
src/
  api/         clients axios por recurso
  components/  átomos
  contexts/    AuthContext + ThemeContext
  navigation/  RootNavigator (tabs + stacks)
  screens/     17 telas
  theme/       paletas claro/escuro + tokens
  types/       tipos compartilhados
  utils/       storage (SecureStore + AsyncStorage)
```

## Tema claro / escuro

- O hook `useTheme()` em `src/contexts/ThemeContext.tsx` provê `theme`, `mode`, `setMode` e `toggle`.
- Preferência salva no dispositivo (SecureStore no nativo, AsyncStorage no web).
- Por padrão, segue o tema do sistema.
- Toggle disponível em **Perfil → Configurações → Aparência**.

Para criar componentes theme-aware, sempre use o hook:

```tsx
import { useTheme } from '../contexts/ThemeContext';

export function MeuCard() {
  const { theme } = useTheme();
  return <View style={{ backgroundColor: theme.colors.surface }} />;
}
```

## Setup completo

Veja `docs/SETUP.md` na raiz do repositório (instalação do Node, Postgres nativo, IP de LAN para celular físico, etc.).
