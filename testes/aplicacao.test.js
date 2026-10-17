const request = require("supertest");
const { criarAplicacao } = require("../src/aplicacao");

describe("API de produtos (integração)", () => {
  let app;
  beforeEach(() => { app = criarAplicacao(); });

  test("informa que a API está disponível", async () => {
    const resposta = await request(app).get("/api/saude");
    expect(resposta.status).toBe(200);
    expect(resposta.body.mensagem).toContain("API NexaVarejo");
  });

  test("cadastra e consulta produto", async () => {
    const cadastro = await request(app).post("/api/produtos").send({
      nome:"Café", codigo:"CAF001", categoria:"Mercearia", preco:18.9, quantidade:12
    });
    expect(cadastro.status).toBe(201);
    expect(cadastro.body.nome).toBe("Café");

    const consulta = await request(app).get("/api/produtos");
    expect(consulta.status).toBe(200);
    expect(consulta.body).toHaveLength(1);
    expect(consulta.body[0].codigo).toBe("CAF001");
  });

  test("não permite código duplicado", async () => {
    const produto = {nome:"Café", codigo:"CAF001", preco:18.9, quantidade:12};
    await request(app).post("/api/produtos").send(produto);
    const resposta = await request(app).post("/api/produtos").send(produto);
    expect(resposta.status).toBe(409);
  });

  test("rejeita produto inválido", async () => {
    const resposta = await request(app).post("/api/produtos").send({
      nome:"", codigo:"CAF002", preco:-2, quantidade:2
    });
    expect(resposta.status).toBe(400);
  });

  test("atualiza estoque", async () => {
    const cadastro = await request(app).post("/api/produtos").send({
      nome:"Feijão", codigo:"FEI001", preco:8, quantidade:10
    });
    const resposta = await request(app).patch(`/api/produtos/${cadastro.body.id}/estoque`).send({quantidade:3});
    expect(resposta.status).toBe(200);
    expect(resposta.body.situacaoEstoque).toBe("Estoque baixo");
  });

  test("retorna 404 ao tentar atualizar produto inexistente", async () => {
    const resposta = await request(app).patch("/api/produtos/999/estoque").send({quantidade:3});
    expect(resposta.status).toBe(404);
  });

  test("exclui produto", async () => {
    const cadastro = await request(app).post("/api/produtos").send({
      nome:"Leite", codigo:"LEI001", preco:5, quantidade:8
    });
    const resposta = await request(app).delete(`/api/produtos/${cadastro.body.id}`);
    expect(resposta.status).toBe(204);
    const consulta = await request(app).get("/api/produtos");
    expect(consulta.body).toHaveLength(0);
  });
});