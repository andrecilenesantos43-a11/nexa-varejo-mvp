function validarProduto(produto) {
  const erros = [];
  if (!produto || typeof produto.nome !== "string" || !produto.nome.trim()) {
    erros.push("Informe o nome do produto.");
  }
  if (!produto || typeof produto.codigo !== "string" || !produto.codigo.trim()) {
    erros.push("Informe o código do produto.");
  }
  if (!produto || !Number.isFinite(Number(produto.preco)) || Number(produto.preco) < 0) {
    erros.push("O preço deve ser um número maior ou igual a zero.");
  }
  if (!produto || !Number.isInteger(Number(produto.quantidade)) || Number(produto.quantidade) < 0) {
    erros.push("A quantidade deve ser um número inteiro maior ou igual a zero.");
  }
  return erros;
}

function calcularSituacaoEstoque(quantidade) {
  const valor = Number(quantidade);
  if (!Number.isInteger(valor) || valor < 0) {
    throw new Error("A quantidade deve ser um número inteiro maior ou igual a zero.");
  }
  return valor <= 5 ? "Estoque baixo" : "Estoque disponível";
}

module.exports = { validarProduto, calcularSituacaoEstoque };