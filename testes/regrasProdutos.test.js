const { validarProduto, calcularSituacaoEstoque } = require("../src/regrasProdutos");

describe("Validação de produtos", () => {
  test("aceita produto válido", () => {
    expect(validarProduto({nome:"Arroz", codigo:"A001", preco:25.5, quantidade:10})).toEqual([]);
  });
  test("rejeita nome vazio", () => {
    expect(validarProduto({nome:" ", codigo:"A001", preco:2, quantidade:1})).toContain("Informe o nome do produto.");
  });
  test("rejeita preço negativo", () => {
    expect(validarProduto({nome:"Arroz", codigo:"A001", preco:-1, quantidade:1})).toContain("O preço deve ser um número maior ou igual a zero.");
  });
  test("rejeita quantidade fracionada", () => {
    expect(validarProduto({nome:"Arroz", codigo:"A001", preco:2, quantidade:1.5})).toContain("A quantidade deve ser um número inteiro maior ou igual a zero.");
  });
});

describe("Situação do estoque", () => {
  test("indica estoque baixo para cinco unidades", () => {
    expect(calcularSituacaoEstoque(5)).toBe("Estoque baixo");
  });
  test("indica estoque disponível acima de cinco unidades", () => {
    expect(calcularSituacaoEstoque(6)).toBe("Estoque disponível");
  });
  test("rejeita quantidade inválida", () => {
    expect(() => calcularSituacaoEstoque(-1)).toThrow();
  });
});