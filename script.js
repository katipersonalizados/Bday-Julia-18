const SUPABASE_URL = https://vtzdciupcnmhjzfnnplv.supabase.co;
const SUPABASE_ANON_KEY = sb_publishable_kEWDkp4xw6MyBGC95aRv3A_XsWZ6GWl;

const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

const photoInput = document.getElementById("photoInput");
const status = document.getElementById("status");
const photosGrid = document.getElementById("photosGrid");


async function loadPhotos() {

  const { data, error } = await supabaseClient
    .from("photos")
    .select("*")
    .order("created_at", {
      ascending: false
    });

  if (error) {
    console.error(error);
    return;
  }

  photosGrid.innerHTML = "";

  data.forEach(photo => {

    const img = document.createElement("img");

    img.src = photo.image_url;

    photosGrid.appendChild(img);

  });

}


photoInput.addEventListener("change", async function () {

  const file = photoInput.files[0];

  if (!file) return;

  status.innerText = "Enviando sua foto... 📸";

  const fileName =
    Date.now() +
    "-" +
    Math.random().toString(36).substring(2) +
    "." +
    file.name.split(".").pop();


  const { error: uploadError } =
    await supabaseClient
      .storage
      .from("fotos")
      .upload(fileName, file);


  if (uploadError) {

    console.error(uploadError);

    status.innerText =
      "Ops! Não foi possível enviar a foto.";

    return;

  }


  const { data } =
    supabaseClient
      .storage
      .from("fotos")
      .getPublicUrl(fileName);


  const imageUrl = data.publicUrl;


  const { error: databaseError } =
    await supabaseClient
      .from("photos")
      .insert([
        {
          image_url: imageUrl
        }
      ]);


  if (databaseError) {

    console.error(databaseError);

    status.innerText =
      "A foto foi enviada, mas ocorreu um erro.";

    return;

  }


  status.innerText =
    "✨ Foto enviada com sucesso! Obrigada por registrar esse momento!";


  photoInput.value = "";

  loadPhotos();

});


loadPhotos();
