// =============================
// CONSUMO DA API JSONSERVER
// =============================

const API_URL = 'http://localhost:3000';

// Funções utilitárias
function qs(selector) {
  return document.querySelector(selector);
}

function qsa(selector) {
  return Array.from(document.querySelectorAll(selector));
}

function escapeHtml(str) {
  if (!str && str !== 0) return "";
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// Converte "YYYY-MM-DD" para Date
function parseDateLocal(dateStr) {
  if (!dateStr) return null;
  const sep = dateStr.includes('-') ? '-' : (dateStr.includes('/') ? '/' : null);
  if (sep) {
    const parts = dateStr.split(sep);
    if (parts.length >= 3) {
      const ano = Number(parts[0]);
      const mes = Number(parts[1]);
      const dia = Number(parts[2]);
      if (!Number.isNaN(ano) && !Number.isNaN(mes) && !Number.isNaN(dia)) {
        return new Date(ano, mes - 1, dia);
      }
    }
  }
  const maybe = new Date(dateStr);
  return isNaN(maybe) ? null : maybe;
}

// =============================
// FUNÇÕES DE UPLOAD DE IMAGENS
// =============================

// Converter arquivo para Base64
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

// Validar tipo de arquivo de imagem
function isValidImageType(file) {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  return validTypes.includes(file.type);
}

// Validar tamanho do arquivo (max 5MB)
function isValidImageSize(file) {
  const maxSize = 5 * 1024 * 1024; // 5MB
  return file.size <= maxSize;
}

// Mostrar preview da imagem
function showImagePreview(input, previewId) {
  const file = input.files[0];
  const preview = document.getElementById(previewId);

  if (!file) {
    preview.style.display = 'none';
    return;
  }

  if (!isValidImageType(file)) {
    alert('Por favor, selecione uma imagem válida (JPEG, PNG, GIF ou WebP).');
    input.value = '';
    preview.style.display = 'none';
    return;
  }

  if (!isValidImageSize(file)) {
    alert('A imagem deve ter no máximo 5MB.');
    input.value = '';
    preview.style.display = 'none';
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    preview.innerHTML = `
      <div class="image-preview-container">
        <img src="${e.target.result}" class="img-fluid rounded" style="max-height: 200px;">
        <button type="button" class="btn btn-sm btn-danger mt-2 remove-image" data-input="${input.id}">
          <i class="fas fa-times me-1"></i>Remover
        </button>
      </div>
    `;
    preview.style.display = 'block';

    // Adicionar evento para remover imagem
    const removeBtn = preview.querySelector('.remove-image');
    removeBtn.addEventListener('click', function () {
      input.value = '';
      preview.style.display = 'none';
    });
  };
  reader.readAsDataURL(file);
}

// =============================
// FUNÇÕES DA API
// =============================

// GET - Buscar todas as notícias
async function carregarNoticias() {
  try {
    const response = await fetch(`${API_URL}/noticias`);
    if (!response.ok) throw new Error('Erro ao carregar notícias');
    return await response.json();
  } catch (error) {
    console.error('Erro:', error);
    mostrarErro('Erro ao carregar notícias. Verifique se o JSONServer está rodando.');
    return [];
  }
}

// GET - Buscar notícia por ID
async function carregarNoticiaPorId(id) {
  try {
    const response = await fetch(`${API_URL}/noticias/${id}`);
    if (!response.ok) throw new Error('Notícia não encontrada');
    return await response.json();
  } catch (error) {
    console.error('Erro:', error);
    return null;
  }
}

// POST - Criar nova notícia
async function criarNoticia(noticiaData) {
  try {
    const response = await fetch(`${API_URL}/noticias`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(noticiaData)
    });

    if (!response.ok) throw new Error('Erro ao criar notícia');
    return await response.json();
  } catch (error) {
    console.error('Erro:', error);
    return null;
  }
}

// PUT - Atualizar notícia
async function atualizarNoticia(id, noticiaData) {
  try {
    const response = await fetch(`${API_URL}/noticias/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(noticiaData)
    });

    if (!response.ok) throw new Error('Erro ao atualizar notícia');
    return await response.json();
  } catch (error) {
    console.error('Erro:', error);
    return null;
  }
}

// DELETE - Excluir notícia
async function excluirNoticia(id) {
  try {
    const response = await fetch(`${API_URL}/noticias/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) throw new Error('Erro ao excluir notícia');
    return true;
  } catch (error) {
    console.error('Erro:', error);
    return false;
  }
}

// =============================
// FUNÇÕES DE UI
// =============================

function mostrarErro(mensagem) {
  const container = qs('#destaquesSection') || qs('.container');
  if (container) {
    container.innerHTML = `
      <div class="alert alert-danger alert-dismissible fade show" role="alert">
        <strong>Erro!</strong> ${mensagem}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
      </div>
    `;
  }
}

function createCard(noticia) {
  const col = document.createElement("div");
  col.className = "col-12 col-sm-6 col-lg-4 mb-3";

  const article = document.createElement("article");
  article.className = "caixa-post h-100 p-2 p-md-3 mx-auto mx-sm-0";

  // Usar imagem base64 se disponível, senão usar URL padrão
  const imagemSrc = noticia.imagemBase64 || noticia.imagem || 'assets/img/img1.jpg';

  article.innerHTML = `
    <img src="${imagemSrc}" alt="${escapeHtml(noticia.titulo)}" class="img-fluid mb-2 w-100" style="height: 200px; object-fit: cover;">
    <h3 class="h5 titulo">${escapeHtml(noticia.titulo)}</h3>
    <p class="texto mb-2">${escapeHtml(noticia.descricao)}</p>
    <div class="d-flex gap-2">
      <a href="detalhe.html?id=${encodeURIComponent(noticia.id)}" class="btn btn-sm detalhe-btn flex-grow-1">Ver detalhe</a>
    </div>
  `;

  col.appendChild(article);
  return col;
}

// =============================
// MONTAGEM DAS PÁGINAS
// =============================

// Montar cards na página inicial
async function montarCardsIndex() {
  const emAltaContainer = qs("#emAltaContainer");
  const recentesContainer = qs("#recentesContainer");

  if (!emAltaContainer || !recentesContainer) return;

  emAltaContainer.innerHTML = '<div class="col-12 text-center"><div class="spinner-border text-success" role="status"><span class="visually-hidden">Carregando...</span></div></div>';
  recentesContainer.innerHTML = '<div class="col-12 text-center"><div class="spinner-border text-success" role="status"><span class="visually-hidden">Carregando...</span></div></div>';

  try {
    const noticias = await carregarNoticias();

    if (noticias.length === 0) {
      emAltaContainer.innerHTML = '<div class="col-12 text-center text-muted">Nenhuma notícia encontrada</div>';
      recentesContainer.innerHTML = '<div class="col-12 text-center text-muted">Nenhuma notícia encontrada</div>';
      return;
    }

    // Filtra as notícias pela categoria
    const emAlta = noticias.filter(noticia => noticia.categoria === "Em Alta");
    const recentes = noticias.filter(noticia => noticia.categoria === "Notícias Recentes");

    emAltaContainer.innerHTML = "";
    recentesContainer.innerHTML = "";

    emAlta.forEach(n => {
      emAltaContainer.appendChild(createCard(n));
    });

    recentes.forEach(n => {
      recentesContainer.appendChild(createCard(n));
    });

  } catch (error) {
    console.error('Erro ao carregar notícias:', error);
  }
}

// Carousel dinâmico
async function montarCarousel() {
  const container = qs("#destaqueCarouselContainer");
  if (!container) return;

  container.innerHTML = '<div class="text-center"><div class="spinner-border text-success" role="status"><span class="visually-hidden">Carregando...</span></div></div>';

  try {
    const noticias = await carregarNoticias();
    const destaques = noticias.filter(n => n.categoria && n.categoria.toLowerCase().includes("em alta"));

    if (destaques.length === 0) {
      container.innerHTML = "<p class='text-muted text-center'>Nenhum item em destaque no momento.</p>";
      return;
    }

    let indicators = '';
    let inner = '';

    destaques.forEach((item, idx) => {
      // Usar imagem base64 se disponível, senão usar URL padrão
      const imagemSrc = item.imagemBase64 || item.imagem || 'assets/img/img1.jpg';

      indicators += `<button type="button" data-bs-target="#destaqueCarousel" data-bs-slide-to="${idx}" ${idx === 0 ? 'class="active" aria-current="true"' : ''} aria-label="Slide ${idx + 1}"></button>`;

      inner += `
        <div class="carousel-item ${idx === 0 ? 'active' : ''}">
          <img src="${imagemSrc}" class="d-block w-100 carousel-img" alt="${escapeHtml(item.titulo)}">
          <div class="carousel-caption d-none d-md-block bg-dark bg-opacity-50 rounded p-2">
            <h5>${escapeHtml(item.titulo)}</h5>
            <p>${escapeHtml(item.descricao)}</p>
            <a href="detalhe.html?id=${item.id}" class="stretched-link"></a>
          </div>
        </div>
      `;
    });

    container.innerHTML = `
      <div id="destaqueCarousel" class="carousel slide" data-bs-ride="carousel">
        <div class="carousel-indicators">
          ${indicators}
        </div>
        <div class="carousel-inner">
          ${inner}
        </div>
        <button class="carousel-control-prev" type="button" data-bs-target="#destaqueCarousel" data-bs-slide="prev">
          <span class="carousel-control-prev-icon" aria-hidden="true"></span>
          <span class="visually-hidden">Anterior</span>
        </button>
        <button class="carousel-control-next" type="button" data-bs-target="#destaqueCarousel" data-bs-slide="next">
          <span class="carousel-control-next-icon" aria-hidden="true"></span>
          <span class="visually-hidden">Próximo</span>
        </button>
      </div>
    `;
  } catch (error) {
    console.error('Erro ao carregar carousel:', error);
  }
}

// Carregar detalhe da notícia
async function carregarDetalhe() {
  const params = new URLSearchParams(location.search);
  const id = Number(params.get("id"));

  const pageTitle = qs("#pageTitle");
  const mainImage = qs("#mainImage");
  const infoData = qs("#infoData");
  const infoAutor = qs("#infoAutor");
  const infoCategoria = qs("#infoCategoria");
  const galeriaContainer = qs("#galeriaContainer");
  const conteudoFull = qs("#conteudoFull");

  // Mostrar loading
  if (conteudoFull) conteudoFull.innerHTML = '<div class="text-center"><div class="spinner-border text-success" role="status"><span class="visually-hidden">Carregando...</span></div></div>';

  try {
    const noticia = await carregarNoticiaPorId(id);

    if (!noticia) {
      if (pageTitle) pageTitle.textContent = "Notícia não encontrada";
      if (conteudoFull) conteudoFull.innerHTML = '<p>Notícia não encontrada.</p><a href="index.html" class="btn voltar-btn mt-2">Voltar à Página Inicial</a>';
      return;
    }

    if (pageTitle) {
      pageTitle.textContent = noticia.titulo || "Detalhe do Item";
      pageTitle.className = "titulo-destaque";
    }

    // Usar imagem base64 se disponível, senão usar URL padrão
    const imagemSrc = noticia.imagemBase64 || noticia.imagem || "assets/img/img1.jpg";
    if (mainImage) mainImage.src = imagemSrc;

    if (infoData) {
      const d = parseDateLocal(noticia.data);
      infoData.textContent = d ? d.toLocaleDateString('pt-BR') : "";
    }

    if (infoAutor) infoAutor.textContent = noticia.autor || "";
    if (infoCategoria) infoCategoria.textContent = noticia.categoria || "";

    // Galeria de fotos
    galeriaContainer.innerHTML = "";
    let fotos = [];

    if (noticia.galeriaBase64 && Array.isArray(noticia.galeriaBase64) && noticia.galeriaBase64.length > 0) {
      fotos = noticia.galeriaBase64;
    } else if (noticia.galeria && Array.isArray(noticia.galeria) && noticia.galeria.length > 0) {
      fotos = noticia.galeria;
    } else {
      // Fallback - carrega algumas notícias para a galeria
      const todasNoticias = await carregarNoticias();
      fotos = todasNoticias.slice(0, 6).map(n => n.imagemBase64 || n.imagem).filter(Boolean);
    }

    fotos.forEach((src, idx) => {
      const col = document.createElement("div");
      col.className = "card";
      col.innerHTML = `
        <img src="${src}" class="card-img-top img-fluid" alt="Foto ${idx + 1}" style="height: 200px; object-fit: cover;">
      `;
      galeriaContainer.appendChild(col);
    });

    if (conteudoFull) conteudoFull.innerHTML = noticia.conteudo || "";

  } catch (error) {
    console.error('Erro ao carregar detalhe:', error);
    if (conteudoFull) conteudoFull.innerHTML = '<p>Erro ao carregar notícia.</p><a href="index.html" class="btn voltar-btn mt-2">Voltar à Página Inicial</a>';
  }
}

// =============================
// FUNÇÕES PARA PÁGINA DE CADASTRO
// =============================

// Configurar data atual no formulário
function configurarDataAtual() {
  const dataInput = document.getElementById('data');
  if (dataInput) {
    const hoje = new Date().toISOString().split('T')[0];
    dataInput.value = hoje;
    dataInput.max = hoje; // Não permite datas futuras
  }
}

// Contador de caracteres para descrição
function inicializarContadorDescricao() {
  const descricaoTextarea = document.getElementById('descricao');
  const contadorDescricao = document.getElementById('contadorDescricao');

  if (descricaoTextarea && contadorDescricao) {
    descricaoTextarea.addEventListener('input', function () {
      contadorDescricao.textContent = this.value.length;
    });
  }
}

// Gerenciamento da galeria de imagens (agora com upload de arquivos)
function inicializarGaleriaImagens() {
  const galeriaContainer = document.getElementById('galeriaContainer');
  const adicionarImagemBtn = document.getElementById('adicionarImagem');

  if (adicionarImagemBtn && galeriaContainer) {
    adicionarImagemBtn.addEventListener('click', function () {
      const novoInput = document.createElement('div');
      novoInput.className = 'input-group mb-2 galeria-item';
      const inputId = `galeriaImagem_${Date.now()}`;
      novoInput.innerHTML = `
                <input type="file" class="form-control galeria-imagem-file" 
                       id="${inputId}" accept="image/*">
                <button type="button" class="btn btn-outline-danger remover-imagem">
                    <i class="fas fa-times"></i>
                </button>
                <div class="image-preview mt-2" id="preview_${inputId}" style="display: none;"></div>
            `;
      galeriaContainer.appendChild(novoInput);

      // Adicionar evento para o input de arquivo
      const fileInput = novoInput.querySelector('.galeria-imagem-file');
      fileInput.addEventListener('change', function () {
        showImagePreview(this, `preview_${inputId}`);
      });

      // Adicionar evento para o botão de remover
      const removerBtn = novoInput.querySelector('.remover-imagem');
      removerBtn.addEventListener('click', function () {
        novoInput.remove();
        atualizarBotoesRemover();
      });

      // Atualizar botões de remover
      atualizarBotoesRemover();
    });

    // Atualizar botões de remover inicialmente
    atualizarBotoesRemover();
  }
}

// Atualizar estado dos botões de remover
function atualizarBotoesRemover() {
  const botoesRemover = document.querySelectorAll('.remover-imagem');
  const inputsGaleria = document.querySelectorAll('.galeria-item');

  botoesRemover.forEach((btn, index) => {
    // Primeiro botão fica disabled se só tiver um input
    btn.disabled = inputsGaleria.length === 1 && index === 0;

    if (!btn.hasAttribute('data-listener')) {
      btn.setAttribute('data-listener', 'true');
      btn.addEventListener('click', function () {
        this.closest('.galeria-item').remove();
        atualizarBotoesRemover();
      });
    }
  });
}

// Inicializar upload da imagem principal
function inicializarUploadImagemPrincipal() {
  const imagemInput = document.getElementById('imagemUpload');
  const preview = document.getElementById('previewImagemPrincipal');

  if (imagemInput && preview) {
    imagemInput.addEventListener('change', function () {
      showImagePreview(this, 'previewImagemPrincipal');
    });
  }
}

// =============================
// FUNÇÕES PARA GERENCIAMENTO DE NOTÍCIAS
// =============================

// Carregar e exibir lista de notícias
async function carregarListaNoticias() {
  const listaContainer = document.getElementById('listaNoticias');
  const contador = document.getElementById('contadorNoticias');

  if (!listaContainer) return;

  try {
    const noticias = await carregarNoticias();

    if (noticias.length === 0) {
      listaContainer.innerHTML = `
                <div class="text-center py-5">
                    <i class="fas fa-newspaper fa-3x text-muted mb-3"></i>
                    <p class="text-muted">Nenhuma notícia cadastrada.</p>
                    <p class="text-muted small">Use o formulário ao lado para criar a primeira notícia.</p>
                </div>
            `;
      if (contador) contador.textContent = '0 notícias';
      // Atualizar gráfico também
      if (typeof montarGraficoCategorias === 'function') {
        await montarGraficoCategorias();
      }
      return;
    }

    // Atualizar contador
    if (contador) {
      contador.textContent = `${noticias.length} ${noticias.length === 1 ? 'notícia' : 'notícias'}`;
    }

    // Ordenar por data (mais recente primeiro)
    noticias.sort((a, b) => new Date(b.data) - new Date(a.data));

    let html = '';
    noticias.forEach(noticia => {
      const dataFormatada = new Date(noticia.data).toLocaleDateString('pt-BR');
      const descricaoResumida = noticia.descricao.length > 100
        ? noticia.descricao.substring(0, 100) + '...'
        : noticia.descricao;

      // Usar imagem base64 se disponível, senão usar URL padrão
      const imagemSrc = noticia.imagemBase64 || noticia.imagem || 'assets/img/img1.jpg';

      html += `
                <div class="card mb-3 noticia-item" data-id="${noticia.id}" data-categoria="${noticia.categoria}">
                    <div class="card-body">
                        <div class="d-flex align-items-start gap-3">
                            <img src="${imagemSrc}" alt="${escapeHtml(noticia.titulo)}" 
                                 class="flex-shrink-0 rounded" style="width: 80px; height: 60px; object-fit: cover;">
                            <div class="flex-grow-1">
                                <h6 class="card-title mb-1 text-success">${escapeHtml(noticia.titulo)}</h6>
                                <p class="card-text small text-muted mb-1">${escapeHtml(descricaoResumida)}</p>
                                <div class="d-flex justify-content-between align-items-center">
                                    <div class="small">
                                        <span class="badge bg-light text-dark">${noticia.categoria}</span>
                                        <span class="text-muted ms-2">${dataFormatada}</span>
                                    </div>
                                    <div class="btn-group btn-group-sm">
                                        <button class="btn btn-outline-primary btn-editar" data-id="${noticia.id}">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button class="btn btn-outline-danger btn-excluir" data-id="${noticia.id}" data-titulo="${escapeHtml(noticia.titulo)}">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
    });

    listaContainer.innerHTML = html;

    // Adicionar eventos aos botões
    adicionarEventosListaNoticias();

    // Atualizar gráfico após montar a lista
    if (typeof montarGraficoCategorias === 'function') {
      await montarGraficoCategorias();
    }

  } catch (error) {
    console.error('Erro ao carregar lista de notícias:', error);
    listaContainer.innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-triangle me-2"></i>
                Erro ao carregar notícias. Verifique se o JSONServer está rodando.
            </div>
        `;
  }
}

// Adicionar eventos aos botões da lista
function adicionarEventosListaNoticias() {
  // Botões de editar
  document.querySelectorAll('.btn-editar').forEach(btn => {
    btn.addEventListener('click', function () {
      const noticiaId = this.getAttribute('data-id');
      carregarNoticiaParaEdicao(noticiaId);
    });
  });

  // Botões de excluir
  document.querySelectorAll('.btn-excluir').forEach(btn => {
    btn.addEventListener('click', function () {
      const noticiaId = this.getAttribute('data-id');
      const noticiaTitulo = this.getAttribute('data-titulo');
      abrirModalExclusao(noticiaId, noticiaTitulo);
    });
  });
}

// Carregar notícia para edição
async function carregarNoticiaParaEdicao(id) {
  try {
    const noticia = await carregarNoticiaPorId(id);

    if (!noticia) {
      alert('Erro ao carregar notícia para edição.');
      return;
    }

    // Preencher formulário com dados da notícia
    document.getElementById('noticiaId').value = noticia.id;
    document.getElementById('titulo').value = noticia.titulo || '';
    document.getElementById('autor').value = noticia.autor || '';
    document.getElementById('data').value = noticia.data || '';
    document.getElementById('categoria').value = noticia.categoria || '';
    document.getElementById('descricao').value = noticia.descricao || '';
    document.getElementById('conteudo').value = noticia.conteudo || '';
    document.getElementById('tags').value = noticia.tags ? noticia.tags.join(', ') : '';
    document.getElementById('destaque').checked = noticia.destaque || false;

    // Limpar preview da imagem principal
    const previewImagem = document.getElementById('previewImagemPrincipal');
    if (previewImagem) {
      previewImagem.style.display = 'none';
    }

    // Preencher galeria de imagens
    const galeriaContainer = document.getElementById('galeriaContainer');
    galeriaContainer.innerHTML = '';

    if (noticia.galeriaBase64 && noticia.galeriaBase64.length > 0) {
      noticia.galeriaBase64.forEach((imagemBase64, index) => {
        const novoInput = document.createElement('div');
        novoInput.className = 'input-group mb-2 galeria-item';
        const inputId = `galeriaImagem_${Date.now()}_${index}`;
        novoInput.innerHTML = `
                    <input type="file" class="form-control galeria-imagem-file" 
                           id="${inputId}" accept="image/*">
                    <button type="button" class="btn btn-outline-danger remover-imagem">
                        <i class="fas fa-times"></i>
                    </button>
                    <div class="image-preview mt-2" id="preview_${inputId}">
                        <div class="image-preview-container">
                            <img src="${imagemBase64}" class="img-fluid rounded" style="max-height: 200px;">
                            <button type="button" class="btn btn-sm btn-danger mt-2 remove-image" data-input="${inputId}">
                                <i class="fas fa-times me-1"></i>Remover
                            </button>
                        </div>
                    </div>
                `;
        galeriaContainer.appendChild(novoInput);

        // Adicionar eventos
        const fileInput = novoInput.querySelector('.galeria-imagem-file');
        const removeBtn = novoInput.querySelector('.remove-image');

        removeBtn.addEventListener('click', function () {
          const preview = document.getElementById(`preview_${inputId}`);
          preview.style.display = 'none';
          fileInput.value = '';
        });
      });
    } else {
      // Input vazio padrão
      const inputPadrao = document.createElement('div');
      inputPadrao.className = 'input-group mb-2 galeria-item';
      const inputId = `galeriaImagem_${Date.now()}`;
      inputPadrao.innerHTML = `
                <input type="file" class="form-control galeria-imagem-file" 
                       id="${inputId}" accept="image/*">
                <button type="button" class="btn btn-outline-danger remover-imagem" disabled>
                    <i class="fas fa-times"></i>
                </button>
                <div class="image-preview mt-2" id="preview_${inputId}" style="display: none;"></div>
            `;
      galeriaContainer.appendChild(inputPadrao);

      // Adicionar evento para o input de arquivo
      const fileInput = inputPadrao.querySelector('.galeria-imagem-file');
      fileInput.addEventListener('change', function () {
        showImagePreview(this, `preview_${inputId}`);
      });
    }

    // Atualizar botões de remover
    atualizarBotoesRemover();

    // Atualizar interface para modo edição
    document.getElementById('tituloFormulario').textContent = 'Editar Notícia';
    document.getElementById('subtituloFormulario').textContent = 'Edite os dados da notícia selecionada';
    document.getElementById('btnSubmit').innerHTML = '<i class="fas fa-save me-2"></i>Salvar Alterações';
    document.getElementById('btnCancelar').style.display = 'block';

    // Rolar para o formulário
    document.getElementById('formCadastroNoticia').scrollIntoView({ behavior: 'smooth' });

  } catch (error) {
    console.error('Erro ao carregar notícia para edição:', error);
    alert('Erro ao carregar notícia para edição.');
  }
}

// Abrir modal de exclusão
function abrirModalExclusao(id, titulo) {
  document.getElementById('tituloNoticiaExcluir').textContent = titulo;

  const modal = new bootstrap.Modal(document.getElementById('modalExcluir'));
  modal.show();

  // Configurar botão de confirmação
  document.getElementById('btnConfirmarExcluir').onclick = function () {
    excluirNoticiaConfirmada(id);
    modal.hide();
  };
}

// Excluir notícia confirmada
async function excluirNoticiaConfirmada(id) {
  try {
    const sucesso = await excluirNoticia(id);

    if (sucesso) {
      // Feedback visual
      const alert = document.createElement('div');
      alert.className = 'alert alert-success alert-dismissible fade show mt-3';
      alert.innerHTML = `
                <i class="fas fa-check-circle me-2"></i>
                <strong>Sucesso!</strong> Notícia excluída com sucesso.
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            `;
      document.querySelector('.principal').prepend(alert);

      // Recarregar lista
      await carregarListaNoticias();

      // Se estava editando a notícia excluída, limpar formulário
      const noticiaIdAtual = document.getElementById('noticiaId').value;
      if (noticiaIdAtual === id) {
        cancelarEdicao();
      }

    } else {
      throw new Error('Erro ao excluir notícia');
    }

  } catch (error) {
    console.error('Erro ao excluir notícia:', error);
    const alert = document.createElement('div');
    alert.className = 'alert alert-danger alert-dismissible fade show mt-3';
    alert.innerHTML = `
            <i class="fas fa-exclamation-triangle me-2"></i>
            <strong>Erro!</strong> Não foi possível excluir a notícia.
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
    document.querySelector('.principal').prepend(alert);
  }
}

// Cancelar edição e voltar ao modo de cadastro
function cancelarEdicao() {
  document.getElementById('formCadastroNoticia').reset();
  document.getElementById('noticiaId').value = '';

  // Restaurar interface para modo cadastro
  document.getElementById('tituloFormulario').textContent = 'Cadastrar Nova Notícia';
  document.getElementById('subtituloFormulario').textContent = 'Preencha os dados abaixo para publicar uma nova notícia';
  document.getElementById('btnSubmit').innerHTML = '<i class="fas fa-paper-plane me-2"></i>Publicar Notícia';
  document.getElementById('btnCancelar').style.display = 'none';

  // Resetar galeria
  const galeriaContainer = document.getElementById('galeriaContainer');
  galeriaContainer.innerHTML = `
        <div class="input-group mb-2 galeria-item">
            <input type="file" class="form-control galeria-imagem-file" 
                   id="galeriaImagem_1" accept="image/*">
            <button type="button" class="btn btn-outline-danger remover-imagem" disabled>
                <i class="fas fa-times"></i>
            </button>
            <div class="image-preview mt-2" id="preview_galeriaImagem_1" style="display: none;"></div>
        </div>
    `;

  // Adicionar evento para o primeiro input
  const firstInput = galeriaContainer.querySelector('.galeria-imagem-file');
  if (firstInput) {
    firstInput.addEventListener('change', function () {
      showImagePreview(this, 'preview_galeriaImagem_1');
    });
  }

  atualizarBotoesRemover();

  // Limpar preview da imagem principal
  const previewImagem = document.getElementById('previewImagemPrincipal');
  if (previewImagem) {
    previewImagem.style.display = 'none';
  }

  // Configurar data atual
  configurarDataAtual();
}

// Filtros e busca
function inicializarFiltrosEBusca() {
  const filtroCategoria = document.getElementById('filtroCategoria');
  const buscaInput = document.getElementById('buscaNoticias');
  const btnBuscar = document.getElementById('btnBuscar');

  if (filtroCategoria) {
    filtroCategoria.addEventListener('change', aplicarFiltros);
  }

  if (btnBuscar) {
    btnBuscar.addEventListener('click', aplicarFiltros);
  }

  if (buscaInput) {
    buscaInput.addEventListener('keypress', function (e) {
      if (e.key === 'Enter') {
        aplicarFiltros();
      }
    });
  }
}

// Aplicar filtros na lista
function aplicarFiltros() {
  const filtroCategoria = document.getElementById('filtroCategoria')?.value || '';
  const termoBusca = document.getElementById('buscaNoticias')?.value.toLowerCase() || '';

  const noticias = document.querySelectorAll('.noticia-item');

  noticias.forEach(noticia => {
    const categoria = noticia.getAttribute('data-categoria');
    const titulo = noticia.querySelector('.card-title').textContent.toLowerCase();
    const descricao = noticia.querySelector('.card-text').textContent.toLowerCase();

    const correspondeCategoria = !filtroCategoria || categoria === filtroCategoria;
    const correspondeBusca = !termoBusca || titulo.includes(termoBusca) || descricao.includes(termoBusca);

    noticia.style.display = correspondeCategoria && correspondeBusca ? 'block' : 'none';
  });
}

// Processar uploads de imagens
async function processarUploads() {
  const imagemPrincipalInput = document.getElementById('imagemUpload');
  const galeriaInputs = document.querySelectorAll('.galeria-imagem-file');

  // Imagem principal é opcional agora
  const imagemPrincipalBase64 = imagemPrincipalInput.files[0]
    ? await fileToBase64(imagemPrincipalInput.files[0])
    : null;

  const galeriaBase64 = [];
  for (const input of galeriaInputs) {
    if (input.files[0]) {
      const base64 = await fileToBase64(input.files[0]);
      galeriaBase64.push(base64);
    }
  }

  return {
    imagemPrincipalBase64,
    galeriaBase64
  };
}

// Atualizar função de submissão do formulário para suportar edição e uploads
function inicializarFormularioCadastro() {
  const form = document.getElementById('formCadastroNoticia');
  const btnCancelar = document.getElementById('btnCancelar');

  if (form) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      const noticiaId = document.getElementById('noticiaId').value;
      const isEdicao = !!noticiaId;

      try {
        // Processar uploads de imagens (agora opcionais)
        const { imagemPrincipalBase64, galeriaBase64 } = await processarUploads();

        // Coletar dados do formulário
        const formData = new FormData(form);

        const noticiaData = {
          titulo: formData.get('titulo'),
          descricao: formData.get('descricao'),
          conteudo: formData.get('conteudo'),
          categoria: formData.get('categoria'),
          autor: formData.get('autor'),
          data: formData.get('data'),
          tags: formData.get('tags') ? formData.get('tags').split(',').map(tag => tag.trim()) : [],
          destaque: formData.get('destaque') === 'on',
          // URL de fallback padrão
          imagem: 'assets/img/img1.jpg'
        };

        // Adicionar imagens base64 se existirem
        if (imagemPrincipalBase64) {
          noticiaData.imagemBase64 = imagemPrincipalBase64;
        }

        if (galeriaBase64.length > 0) {
          noticiaData.galeriaBase64 = galeriaBase64;
        }

        // Mostrar loading
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Salvando...';
        submitBtn.disabled = true;

        let resultado;
        if (isEdicao) {
          // Atualizar notícia existente
          resultado = await atualizarNoticia(noticiaId, { ...noticiaData, id: parseInt(noticiaId) });
        } else {
          // Criar nova notícia
          resultado = await criarNoticia(noticiaData);
        }

        if (resultado) {
          // Feedback visual de sucesso
          const alert = document.createElement('div');
          alert.className = 'alert alert-success alert-dismissible fade show mt-3';
          alert.innerHTML = `
                        <i class="fas fa-check-circle me-2"></i>
                        <strong>Sucesso!</strong> Notícia ${isEdicao ? 'atualizada' : 'publicada'} com sucesso.
                        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                    `;
          form.prepend(alert);

          // Recarregar lista
          await carregarListaNoticias();

          // Limpar formulário após sucesso (apenas se for novo cadastro)
          if (!isEdicao) {
            setTimeout(() => {
              cancelarEdicao();
            }, 2000);
          }

        } else {
          throw new Error(`Erro ao ${isEdicao ? 'atualizar' : 'publicar'} notícia`);
        }

      } catch (error) {
        console.error('Erro:', error);
        const alert = document.createElement('div');
        alert.className = 'alert alert-danger alert-dismissible fade show mt-3';
        alert.innerHTML = `
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    <strong>Erro!</strong> Não foi possível ${isEdicao ? 'atualizar' : 'publicar'} a notícia.
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                `;
        form.prepend(alert);
      } finally {
        // Restaurar botão
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
          submitBtn.innerHTML = isEdicao
            ? '<i class="fas fa-save me-2"></i>Salvar Alterações'
            : '<i class="fas fa-paper-plane me-2"></i>Publicar Notícia';
          submitBtn.disabled = false;
        }
      }
    });

    // Evento para botão cancelar
    if (btnCancelar) {
      btnCancelar.addEventListener('click', cancelarEdicao);
    }

    // Evento para limpar formulário
    const btnLimpar = form.querySelector('#btnLimpar');
    if (btnLimpar) {
      btnLimpar.addEventListener('click', function () {
        cancelarEdicao();
      });
    }
  }
}

// Inicializar página de cadastro (atualizada)
function inicializarPaginaCadastro() {
  configurarDataAtual();
  inicializarContadorDescricao();
  inicializarUploadImagemPrincipal();
  inicializarGaleriaImagens();
  carregarListaNoticias();
  inicializarFiltrosEBusca();

  // Configuração do formulário
  const form = document.getElementById('formCadastroNoticia');

  if (form) {
    form.onsubmit = async function (e) {
      e.preventDefault();

      const noticiaId = document.getElementById('noticiaId').value;
      const isEdicao = !!noticiaId;

      try {
        // Processar uploads de imagens
        const { imagemPrincipalBase64, galeriaBase64 } = await processarUploads();

        // Coletar dados do formulário
        const formData = new FormData(this);

        const noticiaData = {
          titulo: formData.get('titulo'),
          descricao: formData.get('descricao'),
          conteudo: formData.get('conteudo'),
          categoria: formData.get('categoria'),
          autor: formData.get('autor'),
          data: formData.get('data'),
          tags: formData.get('tags') ? formData.get('tags').split(',').map(tag => tag.trim()) : [],
          destaque: formData.get('destaque') === 'on'
        };

        // Adicionar imagens base64 se existirem
        if (imagemPrincipalBase64) {
          noticiaData.imagemBase64 = imagemPrincipalBase64;
        }

        if (galeriaBase64.length > 0) {
          noticiaData.galeriaBase64 = galeriaBase64;
        }

        // Mostrar loading
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Enviando...';
        submitBtn.disabled = true;

        let resultado;
        if (isEdicao) {
          resultado = await atualizarNoticia(noticiaId, { ...noticiaData, id: parseInt(noticiaId) });
        } else {
          resultado = await criarNoticia(noticiaData);
        }

        if (resultado) {
          // Feedback visual de sucesso
          const alert = document.createElement('div');
          alert.className = 'alert alert-success alert-dismissible fade show mt-3';
          alert.innerHTML = `
                        <i class="fas fa-check-circle me-2"></i>
                        <strong>Sucesso!</strong> Notícia ${isEdicao ? 'atualizada' : 'publicada'} com sucesso.
                        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                    `;
          this.prepend(alert);

          // Recarregar lista
          await carregarListaNoticias();

          // Limpar formulário após sucesso (apenas se for novo cadastro)
          if (!isEdicao) {
            setTimeout(() => {
              this.reset();
              configurarDataAtual();
            }, 2000);
          }

        } else {
          throw new Error(`Erro ao ${isEdicao ? 'atualizar' : 'publicar'} notícia`);
        }

      } catch (error) {
        const alert = document.createElement('div');
        alert.className = 'alert alert-danger alert-dismissible fade show mt-3';
        alert.innerHTML = `
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    <strong>Erro!</strong> Não foi possível ${isEdicao ? 'atualizar' : 'publicar'} a notícia.
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                `;
        this.prepend(alert);
      } finally {
        // Restaurar botão
        const submitBtn = this.querySelector('button[type="submit"]');
        if (submitBtn) {
          submitBtn.innerHTML = isEdicao
            ? '<i class="fas fa-save me-2"></i>Salvar Alterações'
            : '<i class="fas fa-paper-plane me-2"></i>Publicar Notícia';
          submitBtn.disabled = false;
        }
      }

      return false;
    };
  }
}

/* ===========================================================
   AQUI COMEÇA O CÓDIGO ADICIONADO: PÁGINA DE NOTÍCIAS (noticias.html)
   As funções abaixo foram incluídas para suportar a página
   noticias.html e seus filtros sem modificar o restante.
   =========================================================== */

// Retorna data a partir de diferentes campos (compatibilidade)
function obterDataNoticia(n) {
  return n.data || n.dataPublicacao || n.data_publicacao || null;
}

// Normalizar texto para buscas
function norm(str) {
  return (str || '').toString().toLowerCase();
}

// Renderiza a lista na página de notícias (usa createCard se disponível)
function renderizarNoticiasLista(noticias) {
  const container = document.getElementById('listaNoticiasPage');
  if (!container) return;
  container.innerHTML = ''; // limpar

  if (!noticias || noticias.length === 0) {
    container.innerHTML = `
      <div class="col-12 text-center py-5">
        <i class="fas fa-newspaper fa-3x text-muted mb-3"></i>
        <p class="text-muted">Nenhuma notícia encontrada com os filtros selecionados.</p>
      </div>
    `;
    return;
  }

  noticias.forEach(noticia => {
    // Se createCard estiver definido, usamos para consistência visual
    if (typeof createCard === 'function') {
      // createCard já retorna um elemento <div class="col-..."> pronto para a grade
      const cardCol = createCard(noticia);
      // assegura que a coluna tem ao menos uma classe de grade se não tiver
      if (!cardCol.className || !cardCol.className.includes('col-')) {
        cardCol.classList.add('col-12', 'col-sm-6', 'col-lg-4');
      }
      container.appendChild(cardCol);
    } else {
      // fallback: cria manualmente colunas responsivas compatíveis com o grid
      const col = document.createElement('div');
      col.className = 'col-12 col-sm-6 col-lg-4 mb-3';
      col.innerHTML = `
        <div class="card h-100">
          <img src="${noticia.imagemBase64 || noticia.imagem || 'assets/img/img1.jpg'}" class="card-img-top" alt="${escapeHtml(noticia.titulo)}" style="height:200px; object-fit:cover;">
          <div class="card-body d-flex flex-column">
            <h5 class="card-title text-success">${escapeHtml(noticia.titulo)}</h5>
            <p class="card-text small text-muted">${escapeHtml(noticia.categoria || '')} • ${new Date(obterDataNoticia(noticia) || '').toLocaleDateString('pt-BR') || ''}</p>
            <p class="card-text flex-grow-1">${escapeHtml(noticia.descricao || '').substring(0, 180)}</p>
            <div class="mt-2">
              <a href="detalhe.html?id=${encodeURIComponent(noticia.id)}" class="btn btn-sm detalhe-btn">Ver detalhe</a>
            </div>
          </div>
        </div>
      `;
      container.appendChild(col);
    }
  });
}

// Aplica filtros ao array de notícias
function filtrarNoticias(noticias) {
  const cat = document.getElementById('filtro_categoria_page') ? document.getElementById('filtro_categoria_page').value : '';
  const busca = document.getElementById('filtro_busca_page') ? norm(document.getElementById('filtro_busca_page').value) : '';
  const tag = document.getElementById('filtro_tag_page') ? norm(document.getElementById('filtro_tag_page').value) : '';
  const destaque = document.getElementById('filtro_destaque_page') ? document.getElementById('filtro_destaque_page').value : '';
  const dataInicio = document.getElementById('filtro_data_inicio_page') ? document.getElementById('filtro_data_inicio_page').value : '';
  const dataFim = document.getElementById('filtro_data_fim_page') ? document.getElementById('filtro_data_fim_page').value : '';

  return (noticias || []).filter(n => {
    // Categoria
    if (cat && (n.categoria || '') !== cat) return false;

    // Destaque
    if (destaque === 'true' && !n.destaque) return false;
    if (destaque === 'false' && n.destaque) return false;

    // Busca
    if (busca) {
      const combinado = norm(n.titulo) + ' ' + norm(n.descricao) + ' ' + norm(n.conteudo);
      if (!combinado.includes(busca)) return false;
    }

    // Tag
    if (tag) {
      let tagsArr = [];
      if (Array.isArray(n.tags)) tagsArr = n.tags.map(t => norm(t));
      else if (typeof n.tags === 'string') tagsArr = n.tags.split(',').map(t => norm(t.trim()));
      if (!tagsArr.some(t => t.includes(tag))) return false;
    }

    // Intervalo de datas
    const dataStr = obterDataNoticia(n);
    const dataNoticia = dataStr ? new Date(dataStr) : null;
    if (dataInicio) {
      const inicio = new Date(dataInicio);
      if (!dataNoticia || dataNoticia < inicio) return false;
    }
    if (dataFim) {
      const fim = new Date(dataFim);
      fim.setHours(23, 59, 59, 999);
      if (!dataNoticia || dataNoticia > fim) return false;
    }

    return true;
  });
}

// Atualiza contador e resumo por categoria (baseado no conjunto completo)
function atualizarResumo(noticiasFiltradas, todasNoticias) {
  const contadorEl = document.getElementById('contador_resultados');
  if (contadorEl) contadorEl.textContent = (noticiasFiltradas || []).length;

  const resumoEl = document.getElementById('resumoCategorias');
  if (!resumoEl) return;

  const contagem = {};
  (todasNoticias || []).forEach(n => {
    const c = n.categoria || 'Outros';
    contagem[c] = (contagem[c] || 0) + 1;
  });

  resumoEl.innerHTML = Object.keys(contagem).map(k => `<div><strong>${escapeHtml(k)}:</strong> ${contagem[k]}</div>`).join('');
}

// Cache local de todas as notícias carregadas na página de notícias
let todasNoticiasCache = [];

// Inicializa a página de notícias: carrega dados, aplica filtros iniciais e prepara eventos
async function inicializarPaginaNoticias() {
  try {
    const container = document.getElementById('listaNoticiasPage');
    const loading = document.getElementById('loadingNoticiasPage');
    if (loading) loading.style.display = 'block';

    const noticias = await carregarNoticias();
    todasNoticiasCache = noticias || [];

    const filtradas = filtrarNoticias(todasNoticiasCache);
    renderizarNoticiasLista(filtradas);
    atualizarResumo(filtradas, todasNoticiasCache);

    if (loading) loading.style.display = 'none';
  } catch (err) {
    console.error('Erro ao inicializar página de notícias:', err);
    const container = document.getElementById('listaNoticiasPage');
    if (container) container.innerHTML = `<div class="col-12"><div class="alert alert-danger">Erro ao carregar notícias.</div></div>`;
  }
}

// Wiring: eventos dos controles da página de notícias (se existirem)
document.addEventListener('DOMContentLoaded', function () {
  // Buscar botão / campo
  const btnBuscarPage = document.getElementById('btnBuscarPage');
  if (btnBuscarPage) {
    btnBuscarPage.addEventListener('click', function () {
      const filtradas = filtrarNoticias(todasNoticiasCache);
      renderizarNoticiasLista(filtradas);
      atualizarResumo(filtradas, todasNoticiasCache);
      window.scrollTo({ top: 200, behavior: 'smooth' });
    });
  }

  const buscaInputPage = document.getElementById('filtro_busca_page');
  if (buscaInputPage) {
    buscaInputPage.addEventListener('keypress', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (btnBuscarPage) btnBuscarPage.click();
      }
    });
  }

  const btnAplicarFiltros = document.getElementById('btnAplicarFiltros');
  if (btnAplicarFiltros) {
    btnAplicarFiltros.addEventListener('click', function () {
      const filtradas = filtrarNoticias(todasNoticiasCache);
      renderizarNoticiasLista(filtradas);
      atualizarResumo(filtradas, todasNoticiasCache);
    });
  }

  const btnLimparFiltros = document.getElementById('btnLimparFiltros');
  if (btnLimparFiltros) {
    btnLimparFiltros.addEventListener('click', function () {
      if (document.getElementById('filtro_categoria_page')) document.getElementById('filtro_categoria_page').value = '';
      if (document.getElementById('filtro_busca_page')) document.getElementById('filtro_busca_page').value = '';
      if (document.getElementById('filtro_tag_page')) document.getElementById('filtro_tag_page').value = '';
      if (document.getElementById('filtro_destaque_page')) document.getElementById('filtro_destaque_page').value = '';
      if (document.getElementById('filtro_data_inicio_page')) document.getElementById('filtro_data_inicio_page').value = '';
      if (document.getElementById('filtro_data_fim_page')) document.getElementById('filtro_data_fim_page').value = '';
      renderizarNoticiasLista(todasNoticiasCache);
      atualizarResumo(todasNoticiasCache, todasNoticiasCache);
    });
  }

  // Applies quick change filters
  ['filtro_categoria_page', 'filtro_destaque_page'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('change', function () {
      const filtradas = filtrarNoticias(todasNoticiasCache);
      renderizarNoticiasLista(filtradas);
      atualizarResumo(filtradas, todasNoticiasCache);
    });
  });
});

/* ===========================================================
   FIM DO BLOCO: Página de notícias
   =========================================================== */

// =============================
// INICIALIZAÇÃO
// =============================

document.addEventListener("DOMContentLoaded", function () {
  // Se a página tem o formulário de cadastro -> inicializa cadastro
  if (window.location.pathname.includes("cadastro_noticias.html") ||
    document.getElementById('formCadastroNoticia')) {
    inicializarPaginaCadastro();
    return;
  }

  // Página inicial (index)
  if (document.getElementById('emAltaContainer') && document.getElementById('recentesContainer')) {
    montarCarousel();
    montarCardsIndex();
    return;
  }

  // Página de detalhe
  if (window.location.pathname.includes("detalhe.html") || document.getElementById('pageTitle')) {
    carregarDetalhe();
    return;
  }

  // Página de notícias
  if (window.location.pathname.includes("noticias.html") ||
    window.location.pathname.includes("noticia.html") ||
    document.getElementById('listaNoticiasPage')) {
    inicializarPaginaNoticias();
    return;
  }

  // fallback: se o elemento de lista existir, inicializa notícias
  if (document.getElementById('listaNoticiasPage')) {
    inicializarPaginaNoticias();
    return;
  }
});

/* ==============================
   GRÁFICO (Chart.js)
   ============================== */

// Variável do gráfico (mantida para atualizações)
let graficoCategorias = null;

async function montarGraficoCategorias() {
  try {
    // Se Chart não está disponível, sai (evita erro se CDN não carregou)
    if (typeof Chart === 'undefined') return;

    const noticias = await carregarNoticias(); // usa a função já existente

    // Contar por categoria (garantir categorias padronizadas)
    const contagem = {};
    const categoriasPadrao = ["Em Alta", "Notícias Recentes", "Transferências", "Lesões", "Campeonatos"];

    // Inicializa contagem com 0 para manter ordem
    categoriasPadrao.forEach(c => contagem[c] = 0);

    noticias.forEach(n => {
      const cat = n.categoria || 'Outros';
      if (contagem.hasOwnProperty(cat)) contagem[cat] += 1;
      else contagem[cat] = (contagem[cat] || 0) + 1;
    });

    const labels = Object.keys(contagem);
    const data = labels.map(l => contagem[l]);

    // Gerar legenda textual simples
    const legendaEl = document.getElementById('legendaChartCategorias');
    if (legendaEl) {
      legendaEl.innerHTML = labels.map((l, i) => `<span class="me-3"><strong>${l}:</strong> ${data[i]}</span>`).join('');
    }

    const ctx = document.getElementById('chartCategorias');
    if (!ctx) return;

    // Se já existe um gráfico, atualiza os dados
    if (graficoCategorias) {
      graficoCategorias.data.labels = labels;
      graficoCategorias.data.datasets[0].data = data;
      graficoCategorias.update();
      return;
    }

    // Criar novo gráfico
    graficoCategorias = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Número de notícias',
          data: data,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              precision: 0
            }
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: { mode: 'index', intersect: false }
        }
      }
    });

  } catch (error) {
    console.error('Erro ao montar gráfico de categorias:', error);
  }
}
