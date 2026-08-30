// ==========================================
// CONFIGURAÇÃO DO SUPABASE
// ==========================================

const SUPABASE_URL = "https://vtzdciupcnmhjzfnnplv.supabase.co";

const SUPABASE_ANON_KEY = "sb_publishable_kEWDkp4xw6MyBGC95aRv3A_XsWZ6GWl";

const BUCKET_NAME = "Julia18";


// ==========================================
// CONECTAR AO SUPABASE
// ==========================================

const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);


// ==========================================
// ELEMENTOS DA PÁGINA
// ==========================================

const photoInput = document.getElementById("photoInput");

const status = document.getElementById("status");

const photosGrid = document.getElementById("photosGrid");

const galleryButton = document.getElementById("galleryButton");


// ==========================================
// BOTÃO PARA IR ATÉ A GALERIA
// ==========================================

if (galleryButton) {

  galleryButton.addEventListener("click", function () {

    document
      .getElementById("gallery")
      .scrollIntoView({
        behavior: "smooth"
      });

  });

}


// ==========================================
// CARREGAR FOTOS DIRETAMENTE DO BUCKET
// ==========================================

async function async function loadPhotos() {

  photosGrid.innerHTML =
    "<p>Carregando fotos...</p>";

  try {

    const { data, error } =
      await supabaseClient
        .storage
        .from(BUCKET_NAME)
        .list("", {
          limit: 100,
          offset: 0
        });

    if (error) {

      console.error(
        "ERRO DETALHADO AO LISTAR:",
        error
      );

      photosGrid.innerHTML =
        "<p>ERRO AO CARREGAR: " +
        error.message +
        "</p>";

      return;
    }

    console.log(
      "ARQUIVOS ENCONTRADOS:",
      data
    );

    photosGrid.innerHTML = "";

    if (!data || data.length === 0) {

      photosGrid.innerHTML =
        "<p class='empty-gallery'>Nenhuma foto encontrada no bucket.</p>";

      return;
    }

    data.forEach(function (file) {

      if (!file.name) return;

      const { data: publicUrlData } =
        supabaseClient
          .storage
          .from(BUCKET_NAME)
          .getPublicUrl(file.name);

      const img =
        document.createElement("img");

      img.src =
        publicUrlData.publicUrl;

      img.alt =
        "Foto da festa";

      img.loading =
        "lazy";

      img.onerror = function () {

        console.error(
          "ERRO AO ABRIR IMAGEM:",
          file.name,
          publicUrlData.publicUrl
        );

      };

      photosGrid.appendChild(img);

    });

  } catch (error) {

    console.error(
      "ERRO INESPERADO NA GALERIA:",
      error
    );

    photosGrid.innerHTML =
      "<p>ERRO: " +
      error.message +
      "</p>";

  }

}


  // ==========================================
  // CASO DÊ ERRO
  // ==========================================

  if (error) {

    console.error(
      "ERRO AO CARREGAR FOTOS:",
      error
    );


    photosGrid.innerHTML =
      "<p>Erro ao carregar fotos: " +
      error.message +
      "</p>";

    return;

  }


  // Limpar mensagem de carregamento

  photosGrid.innerHTML = "";


  // ==========================================
  // CASO NÃO TENHA FOTOS
  // ==========================================

  if (!data || data.length === 0) {

    photosGrid.innerHTML =
      "<p class='empty-gallery'>Ainda não há fotos. Seja o primeiro a registrar essa noite! 📸✨</p>";

    return;

  }


  // ==========================================
  // CRIAR IMAGENS DA GALERIA
  // ==========================================

  data.forEach(function (file) {


    // Ignorar pastas

    if (!file.name) {
      return;
    }


    // Criar URL pública da foto

    const { data: publicUrlData } =
      supabaseClient
        .storage
        .from(BUCKET_NAME)
        .getPublicUrl(file.name);


    const imageUrl =
      publicUrlData.publicUrl;


    // Criar elemento da imagem

    const img =
      document.createElement("img");


    img.src =
      imageUrl;


    img.alt =
      "Foto da festa";


    img.loading =
      "lazy";


    // Caso uma imagem não carregue

    img.onerror = function () {

      console.error(
        "Não foi possível carregar:",
        file.name
      );

    };


    photosGrid.appendChild(img);

  });

}


// ==========================================
// ENVIAR FOTO
// ==========================================

photoInput.addEventListener(
  "change",
  async function () {


    const file =
      photoInput.files[0];


    // Se não escolheu nenhuma foto

    if (!file) {

      return;

    }


    // Verificar se é uma imagem

    if (!file.type.startsWith("image/")) {

      status.innerText =
        "Por favor, escolha apenas uma imagem. 📸";

      photoInput.value =
        "";

      return;

    }


    // Mensagem de carregamento

    status.innerText =
      "Enviando sua foto... 📸✨";


    // ==========================================
    // CRIAR NOME ÚNICO
    // ==========================================

    const extension =
      file.name
        .split(".")
        .pop()
        .toLowerCase();


    const fileName =
      "foto-" +
      Date.now() +
      "-" +
      Math.random()
        .toString(36)
        .substring(2, 10) +
      "." +
      extension;


    try {


      // ==========================================
      // ENVIAR PARA O BUCKET
      // ==========================================

      const { data, error } =
        await supabaseClient
          .storage
          .from(BUCKET_NAME)
          .upload(
            fileName,
            file,
            {
              cacheControl: "3600",
              upsert: false
            }
          );


      // ==========================================
      // CASO DÊ ERRO
      // ==========================================

      if (error) {

        console.error(
          "ERRO NO UPLOAD:",
          error
        );


        status.innerText =
          "Erro ao enviar: " +
          error.message;

        return;

      }


      console.log(
        "Foto enviada com sucesso:",
        data
      );


      // ==========================================
      // SUCESSO
      // ==========================================

      status.innerText =
        "✨ Foto enviada com sucesso!";


      // Limpar seleção

      photoInput.value =
        "";


      // ==========================================
      // ATUALIZAR GALERIA
      // ==========================================

      await loadPhotos();


    } catch (error) {


      console.error(
        "ERRO INESPERADO:",
        error
      );


      status.innerText =
        "Erro inesperado: " +
        error.message;

    }

  }
);


// ==========================================
// CARREGAR GALERIA AO ABRIR O SITE
// ==========================================

loadPhotos();
