# 288 • Hub

Painel flutuante para o Discord (web e app desktop) com três módulos:

| Módulo | O que faz | Como liga |
|---|---|---|
| **Auto Quest** | Procura as quests aceitas e as conclui sozinho (vídeo, jogo, stream e atividade). Você escolhe a ordem dos tipos e pode pular a missão atual | Liga automaticamente ao executar |
| **Game Presence** | Mostra você jogando um jogo, com troca automática por tempo | Switch |
| **Fake Stream** | Entra numa call e transmite um vídeo (YouTube, Twitch, Vimeo, Streamable ou link direto) | Switch |

## Como usar

1. Abra o Discord no navegador ou no app desktop e pressione `F12` (ou `Ctrl+Shift+I`) para abrir o console.
2. Cole o comando abaixo e pressione Enter:

```js
fetch("https://raw.githubusercontent.com/Bondzinn/discord-hub/refs/heads/main/Panel").then(r => r.text()).then(t => (0, eval)(t))
```

O painel aparece no canto inferior direito. Rodar o comando de novo substitui a instância anterior.

## Atalhos

| Atalho | Ação |
|---|---|
| `Alt+1` / `Alt+2` / `Alt+3` | Trocar de aba |
| `Alt+Shift+1` / `2` / `3` | Ligar ou desligar o módulo |
| `Alt+H` | Minimizar ou expandir |
| `←` `→` | Navegar entre abas (com foco) |
| Arrastar o título | Mover o painel (duplo clique volta ao canto) |
| `Enter` no campo de link | Liga a Fake Stream |

## Requisitos e limitações

- **App desktop:** necessário para quests de jogo/stream e para a detecção de jogo no Game Presence. No navegador, esses recursos ficam limitados (o painel avisa).
- **Fake Stream:** precisa de um link de vídeo válido, um servidor e um canal de voz. Se a transmissão automática falhar, o painel pede para compartilhar a janela do Discord manualmente.
- **CSP do Discord:** o Discord pode bloquear o `fetch` para o `raw.githubusercontent.com`. Se aparecer erro de CSP no console, rode o script por um userscript (Tampermonkey) ou por um plugin do cliente.
- O Discord pode mudar sua estrutura interna a qualquer momento e quebrar módulos até uma nova versão ser publicada.

## Métricas locais

Na ajuda do painel, os contadores mostram execuções válidas, missões concluídas e confirmadas pelo Discord durante o uso do painel, e sessões de jogo/stream iniciadas. O histórico local registra data, nome de usuário e ID Discord das últimas 20 execuções no `localStorage` deste navegador. Separadamente, a seção **Identificação do HUB (opcional)** permite que o próprio usuário autorize, por botão e confirmação explícita, o envio ao webhook configurado do avatar, display name, username, ID do Discord e data de criação da conta. Nenhum desses dados de identificação é enviado sem essa ação. Para configurar o destino, substitua `COLE_AQUI_UM_WEBHOOK_NOVO` em `HUB_WEBHOOK_URL` por um webhook recém-criado; não publique o token do webhook no repositório. O envio depende do acesso à rede e das permissões CORS do endpoint.

## Aviso

Este projeto usa o cliente do Discord de forma não oficial e automatiza ações (quests, presença, transmissão). Isso pode violar os [Termos de Serviço do Discord](https://discord.com/terms) e resultar em sanções na conta. Use por sua conta e risco.

## Versão

`gh-1.1.2`