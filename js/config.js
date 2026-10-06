/*
 * Tudo o que muda de uma hamburgueria para outra mora neste arquivo:
 * marca, link de pedido, contato, moeda, as camadas da seção "The Stack" e o cardápio.
 * Os textos das seções ficam no index.html.
 */
window.CONFIG = Object.freeze({
  marca: Object.freeze({
    nome: 'Buzzer Beater Burgers',
    // As duas linhas impressas na caixa de entrega (seções do combo e dos shakes).
    caixaLinha1: 'BUZZER★BEATER',
    caixaLinha2: 'BURGERS',
    slogan: 'MADE FRESH. MADE BOLD.'
  }),

  // Destino de todos os botões "Order now": WhatsApp, iFood, site de pedidos ou uma âncora.
  pedido: Object.freeze({
    url: '#menu',
    abrirEmNovaAba: false
  }),

  contato: Object.freeze({
    endereco: '1200 Court Street, Springfield',
    horario: 'Mon-Sun, 11am to 11pm',
    horarioCurto: 'Open today until 11pm · Pickup & delivery',
    telefone: '(555) 010-2026',
    email: 'hello@example.com'
  }),

  moeda: Object.freeze({ locale: 'en-US', codigo: 'USD' }),

  faixa: Object.freeze(['Smash burgers', 'Crispy fries', 'Overtime shakes']),

  // De cima para baixo. Camadas disponíveis: pao-topo, molho, alface, tomate,
  // cebola, bacon, picles, queijo, carne, pao-base.
  pilha: Object.freeze([
    { camada: 'pao-topo', rotulo: ['Buttery', 'toasted bun'] },
    { camada: 'molho', rotulo: ['Signature', 'house sauce'] },
    { camada: 'cebola', rotulo: ['Caramelized', 'onions'] },
    { camada: 'queijo', rotulo: ['Melted American', 'cheese, 2 slices'] },
    { camada: 'carne', rotulo: ['Juicy', 'beef patty'] },
    { camada: 'pao-base', rotulo: ['Toasted', 'bun'] }
  ]),

  // ilustracao.tipo: hamburguer (com camadas), combo, fritas, batata-recheada, milkshake.
  // ilustracao.fundo: escuro (padrão) ou vermelho.
  cardapio: Object.freeze([
    {
      nome: 'Free Throw Shot Burger',
      descricao: 'Smash patty, American cheese, pickles and house sauce on a toasted bun.',
      ilustracao: { tipo: 'hamburguer', camadas: ['pao-topo', 'molho', 'picles', 'queijo', 'carne', 'pao-base'] },
      precos: [
        { rotulo: 'Single', valor: 4.99 },
        { rotulo: 'Double', valor: 7.49 },
        { rotulo: 'Triple', valor: 10.99 },
        { rotulo: 'Quad', valor: 13.79 }
      ]
    },
    {
      nome: 'Layup Burger',
      descricao: 'Double smash, crispy bacon, cheddar, lettuce and smoky BBQ sauce.',
      ilustracao: { tipo: 'hamburguer', camadas: ['pao-topo', 'molho', 'alface', 'bacon', 'queijo', 'carne', 'queijo', 'carne', 'pao-base'] },
      precos: [
        { rotulo: 'Single', valor: 9.19 },
        { rotulo: 'Double', valor: 13.79 },
        { rotulo: 'Triple', valor: 16.09 }
      ]
    },
    {
      nome: 'Hook Shot Burger',
      descricao: 'Combo: signature burger with caramelized onions, fries and a fountain drink.',
      ilustracao: { tipo: 'combo', fundo: 'vermelho' },
      precos: [
        { rotulo: 'Combo', valor: 14.94 },
        { rotulo: 'Double combo', valor: 19.54 }
      ]
    },
    {
      nome: 'Timeout Fries',
      descricao: 'Hand-cut, double-fried and finished with sea salt.',
      ilustracao: { tipo: 'fritas' },
      precos: [
        { rotulo: 'Regular', valor: 5.16 },
        { rotulo: 'Large', valor: 9.76 }
      ]
    },
    {
      nome: 'All-Star Loaded Fries',
      descricao: 'Cheese sauce, bacon bits, jalapeños and scallions.',
      ilustracao: { tipo: 'batata-recheada' },
      precos: [{ rotulo: 'Shareable', valor: 13.21 }]
    },
    {
      nome: 'Overtime Milkshakes',
      descricao: 'Hand-spun, whipped cream and a cherry on top.',
      ilustracao: { tipo: 'milkshake', sabor: 'chocolate' },
      precos: [
        { rotulo: 'Vanilla', valor: 5.99 },
        { rotulo: 'Chocolate', valor: 5.99 },
        { rotulo: 'Strawberry', valor: 5.99 }
      ]
    }
  ])
});
