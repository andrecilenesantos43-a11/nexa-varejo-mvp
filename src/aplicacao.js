const express = require("express");
const path = require("path");
const { validarProduto, calcularSituacaoEstoque } = require("./regrasProdutos");

function criarAplicacao() {
  const app = express();
  app.use(express.json());
  app.use(express.static(path.join(__dirname, "..", "publico")));
  let produtos = [];
  let proximoId = 1;

  app.get("/api/saude", (req, res) => res.json({ estado: "funcionando", mensagem: "API NexaVarejo disponível" }));

  app.get("/api/produtos", (req, res) => res.json(produtos.map(p => ({
    ...p, situacaoEstoque: calcularSituacaoEstoque(p.quantidade)
  }))));

  app.post("/api/produtos", (req, res) => {
    const erros = validarProduto(req.body);
    if (erros.length) return res.status(400).json({ erros });

    if (produtos.some(p => p.codigo === req.body.codigo.trim())) {
      return res.status(409).json({ erro: "Já existe um produto com esse código." });
    }

    const produto = {
      id: proximoId++,
      nome: req.body.nome.trim(),
      codigo: req.body.codigo.trim(),
      categoria: String(req.body.categoria || "").trim(),
      preco: Number(req.body.preco),
      quantidade: Number(req.body.quantidade)
    };
    produtos.push(produto);
    return res.status(201).json({
      ...produto, situacaoEstoque: calcularSituacaoEstoque(produto.quantidade)
    });
  });

  app.patch("/api/produtos/:id/estoque", (req, res) => {
    const produto = produtos.find(p => p.id === Number(req.params.id));
    if (!produto) return res.status(404).json({ erro: "Produto não encontrado." });
    const quantidade = Number(req.body.quantidade);
    if (!Number.isInteger(quantidade) || quantidade < 0) {
      return res.status(400).json({ erro: "A quantidade deve ser um número inteiro maior ou igual a zero." });
    }
    produto.quantidade = quantidade;
    return res.json({ ...produto, situacaoEstoque: calcularSituacaoEstoque(produto.quantidade) });
  });

  app.delete("/api/produtos/:id", (req, res) => {
    const indice = produtos.findIndex(p => p.id === Number(req.params.id));
    if (indice === -1) return res.status(404).json({ erro: "Produto não encontrado." });
    produtos.splice(indice, 1);
    return res.status(204).end();
  });

  return app;
}

module.exports = { criarAplicacao };