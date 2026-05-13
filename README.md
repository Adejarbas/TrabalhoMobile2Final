# DAN Pizzas - Cadastro de Clientes (TrabalhoMobile2Final)
Atividade de Banco de Dados com persistência dupla (MongoDB e SQLite), consumo de API HTTP (ViaCEP) e interface Mobile em React Native (Expo).

---

## 🚀 Como executar o projeto

Você precisará abrir **dois terminais** para rodar o projeto: um para o Servidor (Backend) e outro para o App (Frontend).

### 1. Rodando o Servidor (Backend)
O servidor gerencia a conexão com os bancos de dados MongoDB e SQLite.

1. Abra um terminal e navegue até a pasta do servidor:
   ```bash
   cd ATIVIDADE/Server
   ```
2. Instale as dependências (se for a primeira vez):
   ```bash
   npm install
   ```
3. Inicie o servidor:
   ```bash
   npm start
   ```
> **Nota:** Certifique-se de que o **MongoDB** está rodando localmente na porta `27017` antes de iniciar o servidor.

---

### 2. Rodando o App (Frontend)
O App contém a interface do usuário e consome a API do servidor.

1. Abra um **segundo** terminal e navegue até a pasta do Frontend:
   ```bash
   cd ATIVIDADE/Front
   ```
2. Instale as dependências (se for a primeira vez):
   ```bash
   npm install
   ```
3. Inicie o Expo:
   ```bash
   npx expo start
   ```
4. Baixe o aplicativo **Expo Go** no seu celular e escaneie o QR Code que aparecer no terminal.

---

### ⚠️ Importante: Configuração de IP
Como o aplicativo vai rodar no celular, ele precisa saber qual é o endereço de rede (IP) do seu computador para conectar ao servidor.

1. Quando você rodar o comando `npx expo start`, olhe no terminal a linha que diz algo como:
   `Metro waiting on exp://192.168.1.10:8081`
2. Copie aquele número de IP (no exemplo, `192.168.1.10`).
3. Abra o arquivo `ATIVIDADE/Front/App.js`.
4. Vá até a linha 7 e cole o IP do seu computador na variável `url`:
   ```javascript
   let url = "http://192.168.1.10:3333";
   ```
*(Sempre que sua rede WiFi mudar ou reiniciar, o IP do seu computador pode mudar e você precisará atualizar no App.js novamente)*.
