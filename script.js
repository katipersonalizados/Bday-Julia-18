// ========================================
// CONFIGURAÇÃO DO SUPABASE
// ========================================

const SUPABASE_URL = "https://vtzdciupcnmhjzfnnplv.supabase.co";

const SUPABASE_ANON_KEY = "sb_publishable_kEWDkp4xw6MyBGC95aRv3A_XsWZ6GWl";

const BUCKET_NAME = "Julia18";


// ========================================
// CONECTAR AO SUPABASE
// ========================================

const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);


// ========================================
// ELEMENTOS DO SITE
// ========================================

const photoInput = document.getElementById("photoInput");

const status = document.getElementById("status");

const photosGrid = document.getElementById("photosGrid");


// ========================================
// CARREGAR AS FOTOS DA GALERIA
// ========================================

async function loadPhotos() {

  console.log("Carregando fotos...");

  const { data, error } = await supabaseClient
    .from("photos")
    .select("*")
    .order("created_at", {
      ascending: false
    });


  if (error) {

    console.error("Erro ao carregar fotos:", error);

    photosGrid.innerHTML =
      "<p>Não foi possível carregar as fotos.</p>";

    return;

  }


  // Limpar galeria antes de carregar novamente

  photosGrid.innerHTML = "";


  // Caso ainda não tenha nenhuma foto

  if (!data || data.length === 0) {

    photosGrid.innerHTML =
      "<p class='empty-gallery'>Ainda não há fotos. Seja o primeiro a registrar esse momento! 📸✨</p>";

    return;

  }


  // Criar cada imagem da galeria

  data.forEach(photo => {

    const img = document.createElement("img");

    img.src = photo.image_url;

    img.alt = "Foto da festa";

    img.loading = "lazy";


    photosGrid.appendChild(img);

  });

}


// ========================================
// ENVIAR FOTO
// ========================================

photoInput.addEventListener("change", async function () {

  const file = photoInput.files[0];


  // Verificar se existe arquivo

  if (!file) return;


  // Verificar se é imagem

  if (!file.type.startsWith("image/")) {

    status.innerText =
      "Por favor, selecione apenas uma imagem. 📸";

    photoInput.value = "";

    return;

  }


  // Mensagem durante o envio

  status.innerText =
    "Enviando sua foto... 📸✨";


  try {


    // Criar nome único para a foto

    const fileExtension =
      file.name.split(".").pop();


    const fileName =
      "foto-" +
      Date.now() +
      "-" +
      Math.random()
        .toString(36)
        .substring(2, 10) +
      "." +
      fileExtension;


    console.log("Enviando foto:", fileName);


    // ========================================
    // ENVIAR FOTO PARA O STORAGE
    // ========================================

    const { error: uploadError } =
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


    // Caso aconteça erro no upload

    if (uploadError) {

      console.error(
        "Erro no upload:",
        uploadError
      );

      status.innerText =
        "Ops! Não foi possível enviar a foto. 😢";

      return;

    }


    console.log(
      "Foto enviada para o Storage com sucesso!"
    );


    // ========================================
    // PEGAR URL PÚBLICA DA FOTO
    // ========================================

    const { data: publicUrlData } =
      supabaseClient
        .storage
        .from(BUCKET_NAME)
        .getPublicUrl(fileName);


    const imageUrl =
      publicUrlData.publicUrl;


    console.log(
      "URL da foto:",
      imageUrl
    );


    // ========================================
    // SALVAR FOTO NA TABELA PHOTOS
    // ========================================

    const { error: databaseError } =
      await supabaseClient
        .from("photos")
        .insert([
          {
            image_url: imageUrl
          }
        ]);


    // Caso aconteça erro no banco

    if (databaseError) {

      console.error(
        "Erro ao salvar no banco:",
        databaseError
      );

      status.innerText =
        "A foto foi enviada, mas não conseguimos adicioná-la à galeria. 😢";

      return;

    }


    // ========================================
    // SUCESSO
    // ========================================

    console.log(
      "Foto adicionada à galeria com sucesso!"
    );


    status.innerText =
      " Foto enviada com sucesso! Obrigada por registrar esse momento! ✨";


    // Limpar o input

    photoInput.value = "";


    // Atualizar galeria

    await loadPhotos();


  } catch (error) {


    console.error(
      "Erro inesperado:",
      error
    );


    status.innerText =
      "Ops! Ocorreu um erro inesperado. Tente novamente. 😢";

  }

});


// ========================================
// CARREGAR GALERIA AO ABRIR O SITE
// ========================================

loadPhotos();
