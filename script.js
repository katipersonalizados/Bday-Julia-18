// ==========================================
// CONFIGURAÇÕES DO SUPABASE
// ==========================================

const SUPABASE_URL = "https://vtzdciupcnmhjzfnnplv.supabase.co";

// COLE AQUI A SUA CHAVE PUBLICA (ANON KEY)
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
// ELEMENTOS DO SITE
// ==========================================

const photoInput = document.getElementById("photoInput");
const status = document.getElementById("status");
const photosGrid = document.getElementById("photosGrid");
const galleryButton = document.getElementById("galleryButton");
const gallery = document.getElementById("gallery");


// ==========================================
// BOTÃO "VER FOTOS DA FESTA"
// ==========================================

if (galleryButton) {
  galleryButton.addEventListener("click", async function () {

    // Atualiza as fotos antes de abrir a galeria
    await loadPhotos();

    // Desce até a galeria
    gallery.scrollIntoView({
      behavior: "smooth"
    });

  });
}


// ==========================================
// CARREGAR FOTOS DO BUCKET
// ==========================================

async function loadPhotos() {

  if (!photosGrid) return;

  photosGrid.innerHTML = "<p>Carregando fotos...</p>";

  try {

    const { data: files, error } = await supabaseClient
      .storage
      .from(BUCKET_NAME)
      .list("", {
        limit: 100,
        offset: 0,
        sortBy: {
          column: "created_at",
          order: "desc"
        }
      });


    // ERRO AO LISTAR

    if (error) {

      console.error("ERRO AO LISTAR FOTOS:", error);

      photosGrid.innerHTML =
        "<p>Erro ao carregar a galeria: " +
        error.message +
        "</p>";

      return;
    }


    // LIMPAR GALERIA

    photosGrid.innerHTML = "";


    // SEM FOTOS

    if (!files || files.length === 0) {

      photosGrid.innerHTML =
        "<p class='empty-gallery'>" +
        "Ainda não há fotos na galeria. 📸✨" +
        "</p>";

      return;
    }


    // MOSTRAR AS FOTOS

    files.forEach(function (file) {

      // Ignora itens sem nome
      if (!file.name) return;


      // Cria URL pública

      const { data: publicUrlData } = supabaseClient
        .storage
        .from(BUCKET_NAME)
        .getPublicUrl(file.name);


      const imageUrl = publicUrlData.publicUrl;


      // Criar imagem

      const img = document.createElement("img");

      img.src = imageUrl;

      img.alt = "Foto da festa";

      img.loading = "lazy";


      // Se a imagem não carregar

      img.onerror = function () {

        console.error(
          "ERRO AO ABRIR FOTO:",
          file.name,
          imageUrl
        );

      };


      // Adicionar à galeria

      photosGrid.appendChild(img);

    });


  } catch (error) {

    console.error("ERRO INESPERADO NA GALERIA:", error);

    photosGrid.innerHTML =
      "<p>Erro: " +
      error.message +
      "</p>";

  }

}


// ==========================================
// ENVIAR FOTO
// ==========================================

if (photoInput) {

  photoInput.addEventListener("change", async function () {

    const file = photoInput.files[0];

    if (!file) return;


    // VERIFICAR SE É IMAGEM

    if (!file.type.startsWith("image/")) {

      status.innerText =
        "Escolha apenas uma foto ou imagem. 📸";

      photoInput.value = "";

      return;

    }


    // MENSAGEM DE ENVIO

    status.innerText =
      "Enviando sua foto... 📸✨";


    // PEGAR EXTENSÃO

    let extension =
      file.name.split(".").pop().toLowerCase();


    // Caso o arquivo não tenha extensão

    if (!extension || extension === file.name.toLowerCase()) {
      extension = "jpg";
    }


    // CRIAR NOME ÚNICO

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

      // ======================================
      // FAZER UPLOAD
      // ======================================

      const { data, error } = await supabaseClient
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


      // SE DER ERRO

      if (error) {

        console.error("ERRO NO UPLOAD:", error);

        status.innerText =
          "Erro ao enviar a foto: " +
          error.message;

        return;

      }


      console.log(
        "UPLOAD REALIZADO COM SUCESSO:",
        data
      );


      // MENSAGEM DE SUCESSO

      status.innerText =
        "✨ Foto enviada com sucesso!";


      // LIMPAR INPUT

      photoInput.value = "";


      // ATUALIZAR GALERIA

      await loadPhotos();


    } catch (error) {

      console.error("ERRO INESPERADO NO UPLOAD:", error);

      status.innerText =
        "Erro inesperado: " +
        error.message;

    }

  });

}


// ==========================================
// CARREGAR AS FOTOS AO ABRIR O SITE
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

  loadPhotos();

});
