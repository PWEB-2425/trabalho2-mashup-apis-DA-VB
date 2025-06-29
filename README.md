# Weather App - Mashup de APIs

## Identificação
- Diogo Amorim Vilas Boas nº31860

## Descrição do Projeto
Aplicação web que permite aos usuários consultar informações meteorológicas de diferentes cidades.
O sistema inclui autenticação de usuários e armazena o histórico de pesquisas.

## Tecnologias Utilizadas

### Backend
- Node.js
- Express.js
- MongoDB (com Mongoose)
- Passport.js (autenticação)
- Express-session
- Bcrypt.js (criptografia)
- Connect-flash (mensagens)
- Express-rate-limit (limitação de requisições)
- Helmet (segurança)

### Frontend
- EJS (template engine)
- Tailwind CSS
- HTML5
- JavaScript

### APIs
1. **OpenWeather API**
   - Fornece dados meteorológicos em tempo real
   - Informações de temperatura, humidade, vento, etc.
   - [Documentação](https://openweathermap.org/api)

2. **REST Countries API**
   - Fornece informações detalhadas sobre países
   - Dados como população, capital, bandeira, etc.
   - [Documentação](https://restcountries.com/)

## Configuração e Instalação

### Pré-requisitos
- Node.js (v14 ou superior)
- MongoDB
- Git

### Instalação Local

1. Clone o repositório:
```bash
git clone https://github.com/PWEB-2425/trabalho2-mashup-apis-DA-VB.git
cd trabalho2-mashup-apis-DA-VB
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
Crie um arquivo `.env` na raiz do projeto com o seguinte conteúdo:
```env
MONGODB_URI=sua_url_mongodb
SESSION_SECRET=seu_segredo_sessao
WEATHER_API_KEY=sua_chave_api_openweather
NODE_ENV=development
PORT=3000
```

### Configuração do MongoDB

1. Crie uma conta no [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crie um novo cluster
3. Configure o acesso ao banco:
   - Crie um usuário do banco de dados
   - Configure o IP de acesso (0.0.0.0/0 para acesso de qualquer lugar)
4. Obtenha a string de conexão e adicione ao arquivo `.env`

### Configuração das APIs

1. **OpenWeather API**
   - Crie uma conta em [OpenWeather](https://openweathermap.org/api)
   - Obtenha sua API key
   - Adicione a chave ao arquivo `.env` como `WEATHER_API_KEY`

2. **REST Countries API**
   - Não requer chave de API
   - Acesso público e gratuito
   - Endpoints disponíveis em [RestCountries](https://restcountries.com/)

## Executar localmente

### Desenvolvimento
```bash
npm run dev
```

### Produção
```bash
npm start
```

## Acesso ao Sistema

### Usuário Administrador
- Email: admin@davb.com
- Senha: admin2024

Para criar o admin pela primeira vez, acesse:
```
/auth/create-admin
```

## Deployment

O projeto está deployado no Render.com e pode ser acessado em:
[https://trabalho2-mashup-apis-da-vb.onrender.com](https://trabalho2-mashup-apis-da-vb.onrender.com)