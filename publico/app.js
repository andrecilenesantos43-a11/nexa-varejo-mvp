const formulario = document.querySelector("#form-produto");
const lista = document.querySelector("#lista-produtos");
const mensagem = document.querySelector("#mensagem");
const pesquisa = document.querySelector("#pesquisa");
let produtos = [];

async function carregarProdutos() {
  try {
    const resposta = await fetch("/api/produtos");
    produtos = await resposta.json();
    mostrarProdutos();
  } catch {
    mensagem.textContent = "Não foi possível carregar os produtos. Verifique se o servidor está iniciado.";
  }
}

function mostrarProdutos() {
  const termo = pesquisa.value.trim().toLocaleLowerCase("pt-BR");
  const filtrados = produtos.filter(p =>
    p.nome.toLocaleLowerCase("pt-BR").includes(termo) ||
    p.codigo.toLocaleLowerCase("pt-BR").includes(termo)
  );
  lista.replaceChildren();
  if (!filtrados.length) {
    const linha = document.createElement("tr");
    const celula = document.createElement("td");
    celula.colSpan = 6;
    celula.textContent = "Nenhum produto encontrado.";
    linha.append(celula);
    lista.append(linha);
    return;
  }
  filtrados.forEach(p => {
    const linha = document.createElement("tr");
    const valores = [p.nome, p.codigo, Number(p.preco).toLocaleString("pt-BR", {style:"currency", currency:"BRL"}), p.quantidade, p.situacaoEstoque];
    valores.forEach((valor, indice) => {
      const celula = document.createElement("td");
      celula.textContent = valor;
      if (indice === 4 && p.quantidade <= 5) celula.className = "estoque-baixo";
      linha.append(celula);
    });
    const acoes = document.createElement("td");
    const atualizar = document.createElement("button");
    atualizar.className = "secundario";
    atualizar.textContent = "Alterar estoque";
    atualizar.setAttribute("aria-label", `Alterar estoque de ${p.nome}`);
    atualizar.addEventListener("click", async () => {
      const valor = prompt(`Nova quantidade para ${p.nome}:`, p.quantidade);
      if (valor === null) return;
      const quantidade = Number(valor);
      if (!Number.isInteger(quantidade) || quantidade < 0) {
        mensagem.textContent = "Informe uma quantidade inteira igual ou maior que zero.";
        return;
      }
      const resposta = await fetch(`/api/produtos/${p.id}/estoque`, {
        method: "PATCH", headers: {"Content-Type":"application/json"},
        body: JSON.stringify({quantidade})
      });
      const dados = await resposta.json();
      mensagem.textContent = resposta.ok ? "Estoque atualizado." : (dados.erro || "Não foi possível atualizar.");
      await carregarProdutos();
    });
    const excluir = document.createElement("button");
    excluir.className = "excluir";
    excluir.textContent = "Excluir";
    excluir.setAttribute("aria-label", `Excluir ${p.nome}`);
    excluir.addEventListener("click", async () => {
      if (!confirm(`Deseja excluir o produto ${p.nome}?`)) return;
      const resposta = await fetch(`/api/produtos/${p.id}`, {method:"DELETE"});
      mensagem.textContent = resposta.ok ? "Produto excluído." : "Não foi possível excluir o produto.";
      await carregarProdutos();
    });
    acoes.append(atualizar, excluir);
    linha.append(acoes);
    lista.append(linha);
  });
}

formulario.addEventListener("submit", async evento => {
  evento.preventDefault();
  const dados = Object.fromEntries(new FormData(formulario).entries());
  dados.preco = Number(dados.preco);
  dados.quantidade = Number(dados.quantidade);
  const resposta = await fetch("/api/produtos", {
    method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify(dados)
  });
  const retorno = await resposta.json();
  if (!resposta.ok) {
    mensagem.textContent = retorno.erros ? retorno.erros.join(" ") : retorno.erro;
    return;
  }
  mensagem.textContent = "Produto cadastrado com sucesso.";
  formulario.reset();
  await carregarProdutos();
});
pesquisa.addEventListener("input", mostrarProdutos);
carregarProdutos();