// ==========================================
// CONFIGURAÇÕES DO SUPABASE
// ==========================================

const SUPABASE_URL =
  "https://vtzdciupcnmhjzfnnplv.supabase.co";

const SUPABASE_ANON_KEY =
  "sb_publishable_kEWDkp4xw6MyBGC95aRv3A_XsWZ6GWl";

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

const photoInput =
  document.getElementById("photoInput");

const statusMessage =
  document.getElementById("status");

const photosGrid =
  document.getElementById("photosGrid");

const galleryButton =
  document.getElementById("galleryButton");

const gallery =
  document.getElementById("gallery");


// ==========================================
// BOTÃO DA GALERIA
// ==========================================

if (galleryButton) {
  galleryButton.addEventListener(
    "click",
    async function (event) {
      event.preventDefault();

      await loadPhotos();

      if (gallery) {
        gallery.scrollIntoView({
          behavior: "smooth"
        });
      }
    }
  );
}


// ==========================================
// CARREGAR FOTOS
// ==========================================

async function loadPhotos() {
  if (!photosGrid) return;

  photosGrid.innerHTML =
    "<p>Carregando fotos...</p>";

  try {
    const { data: files, error } =
      await supabaseClient
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

    if (error) {
      console.error(
        "ERRO AO LISTAR FOTOS:",
        error
      );

      photosGrid.innerHTML =
        "<p>Erro ao carregar a galeria: " +
        error.message +
        "</p>";

      return;
    }

    photosGrid.innerHTML = "";

    if (!files || files.length === 0) {
      photosGrid.innerHTML =
        "<p class='empty-gallery'>" +
        "Ainda não há fotos na galeria. 📸✨" +
        "</p>";

      return;
    }

    files.forEach(function (file) {
      if (!file.name) return;

      const { data: publicUrlData } =
        supabaseClient
          .storage
          .from(BUCKET_NAME)
          .getPublicUrl(file.name);

      const img =
        document.createElement("img");

      // Não mostra texto caso a imagem falhe
      img.alt = "";
      img.loading = "lazy";

      img.onerror = function () {
        console.error(
          "ERRO AO ABRIR FOTO:",
          file.name
        );

        // Remove imagens quebradas da galeria
        img.remove();
      };

      img.src = publicUrlData.publicUrl;

      photosGrid.appendChild(img);
    });

  } catch (error) {
    console.error(
      "ERRO INESPERADO NA GALERIA:",
      error
    );

    photosGrid.innerHTML =
      "<p>Erro: " +
      error.message +
      "</p>";
  }
}


// ==========================================
// CARREGAR UMA IMAGEM
// ==========================================

function loadImage(source) {
  return new Promise(function (resolve, reject) {
    const image = new Image();

    image.onload = function () {
      resolve(image);
    };

    image.onerror = function () {
      reject(
        new Error(
          "Não foi possível carregar a imagem."
        )
      );
    };

    image.src = source;
  });
}


// ==========================================
// LER A FOTO ESCOLHIDA
// ==========================================

function readPhotoFile(file) {
  return new Promise(function (resolve, reject) {
    const reader = new FileReader();

    reader.onload = async function () {
      try {
        const image =
          await loadImage(reader.result);

        resolve(image);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = function () {
      reject(
        new Error(
          "Não foi possível abrir a foto."
        )
      );
    };

    reader.readAsDataURL(file);
  });
}


// ==========================================
// DESENHAR FOTO PREENCHENDO O ESPAÇO
// ==========================================

function drawImageCover(
  context,
  image,
  x,
  y,
  width,
  height
) {
  const imageRatio =
    image.naturalWidth / image.naturalHeight;

  const areaRatio =
    width / height;

  let sourceX = 0;
  let sourceY = 0;
  let sourceWidth = image.naturalWidth;
  let sourceHeight = image.naturalHeight;

  if (imageRatio > areaRatio) {
    sourceWidth =
      image.naturalHeight * areaRatio;

    sourceX =
      (image.naturalWidth - sourceWidth) / 2;
  } else {
    sourceHeight =
      image.naturalWidth / areaRatio;

    sourceY =
      (image.naturalHeight - sourceHeight) / 2;
  }

  context.drawImage(
    image,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    x,
    y,
    width,
    height
  );
}


// ==========================================
// APLICAR A MOLDURA
// ==========================================

async function applyFloralFrame(file) {
  const photo =
    await readPhotoFile(file);

  const frame =
    await loadImage(
      "moldura.png?v=1"
    );

  const canvas =
    document.createElement("canvas");

  canvas.width =
    frame.naturalWidth;

  canvas.height =
    frame.naturalHeight;

  const context =
    canvas.getContext("2d");

  if (!context) {
    throw new Error(
      "Seu navegador não conseguiu preparar a moldura."
    );
  }

  /*
    Área transparente da moldura.

    Os valores são proporcionais, portanto
    funcionam mesmo que a imagem tenha outro tamanho.
  */

  const photoX =
    canvas.width * 0.155;

  const photoY =
    canvas.height * 0.12;

  const photoWidth =
    canvas.width * 0.695;

  const photoHeight =
    canvas.height * 0.655;

  drawImageCover(
    context,
    photo,
    photoX,
    photoY,
    photoWidth,
    photoHeight
  );

  // Coloca a moldura por cima da foto

  context.drawImage(
    frame,
    0,
    0,
    canvas.width,
    canvas.height
  );

  return new Promise(function (resolve, reject) {
    canvas.toBlob(
      function (blob) {
        if (blob) {
          resolve(blob);
        } else {
          reject(
            new Error(
              "Não foi possível criar a foto com moldura."
            )
          );
        }
      },
      "image/jpeg",
      0.92
    );
  });
}


// ==========================================
// IDENTIFICAR A OPÇÃO ESCOLHIDA
// ==========================================

function getSelectedFrame() {
  const selected =
    document.querySelector(
      'input[name="frameOption"]:checked'
    );

  return selected
    ? selected.value
    : "none";
}


// ==========================================
// ENVIAR FOTO
// ==========================================

if (photoInput) {
  photoInput.addEventListener(
    "change",
    async function () {
      const file =
        photoInput.files[0];

      if (!file) return;

      if (!file.type.startsWith("image/")) {
        statusMessage.innerText =
          "Escolha apenas uma foto ou imagem. 📸";

        photoInput.value = "";
        return;
      }

      const selectedFrame =
        getSelectedFrame();

      statusMessage.innerText =
        selectedFrame === "floral"
          ? "Aplicando a moldura e enviando... 🌸"
          : "Enviando sua foto... 📸✨";

      try {
        let uploadFile = file;
        let extension = "jpg";

        if (selectedFrame === "floral") {
          uploadFile =
            await applyFloralFrame(file);
        } else {
          extension =
            file.name
              .split(".")
              .pop()
              .toLowerCase();

          if (
            !extension ||
            extension === file.name.toLowerCase()
          ) {
            extension = "jpg";
          }
        }

        const fileName =
          "foto-" +
          Date.now() +
          "-" +
          Math.random()
            .toString(36)
            .substring(2, 10) +
          "." +
          extension;

        const { data, error } =
          await supabaseClient
            .storage
            .from(BUCKET_NAME)
            .upload(
              fileName,
              uploadFile,
              {
                cacheControl: "3600",
                upsert: false,
                contentType:
                  selectedFrame === "floral"
                    ? "image/jpeg"
                    : file.type
              }
            );

        if (error) {
          console.error(
            "ERRO NO UPLOAD:",
            error
          );

          statusMessage.innerText =
            "Erro ao enviar a foto: " +
            error.message;

          return;
        }

        console.log(
          "UPLOAD REALIZADO COM SUCESSO:",
          data
        );

        statusMessage.innerText =
          selectedFrame === "floral"
            ? "✨ Foto com moldura enviada com sucesso!"
            : "✨ Foto enviada com sucesso!";

        photoInput.value = "";

        await loadPhotos();

      } catch (error) {
        console.error(
          "ERRO INESPERADO NO UPLOAD:",
          error
        );

        statusMessage.innerText =
          "Erro inesperado: " +
          error.message;
      }
    }
  );
}


// ==========================================
// CARREGAR AO ABRIR
// ==========================================

document.addEventListener(
  "DOMContentLoaded",
  function () {
    loadPhotos();
  }
);
