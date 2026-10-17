const { criarAplicacao } = require("./aplicacao");
const porta = process.env.PORT || 3000;
const app = criarAplicacao();
app.listen(porta, () => console.log(`NexaVarejo disponível em http://localhost:${porta}`));