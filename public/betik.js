let etkinlikler = [];
let seciliTur = "tumu";

const kartListesi = document.getElementById("kartListesi");
const aramaInput = document.getElementById("aramaInput");
const filtreButonlari = document.querySelectorAll(".filtre-btn");
const oneriFormu = document.getElementById("oneriFormu");
const formMesaj = document.getElementById("formMesaj");

const turAdlari = {
  atolye: "Atölye",
  soylesi: "Söyleşi",
  topluluk: "Topluluk"
};

function kartlariCiz(liste) {
  kartListesi.textContent = "";

  if (liste.length === 0) {
    const bosIleti = document.createElement("p");
    bosIleti.className = "bilgi-mesaji";
    bosIleti.textContent = "Aramanıza uygun etkinlik yok.";
    kartListesi.append(bosIleti);
    return;
  }

  for (const etkinlik of liste) {
    const kart = document.createElement("article");
    kart.className = "kart";

    const etiket = document.createElement("span");
    etiket.className = "tur-etiketi";
    etiket.textContent = turAdlari[etkinlik.tur] || etkinlik.tur;

    const baslik = document.createElement("h3");
    baslik.textContent = etkinlik.baslik;

    const tarih = document.createElement("p");
    const tarihNesnesi = new Date(etkinlik.tarih);
    tarih.textContent = "Tarih: " + tarihNesnesi.toLocaleDateString("tr-TR");

    const yer = document.createElement("p");
    yer.textContent = "Yer: " + etkinlik.yer;

    const kontenjan = document.createElement("p");
    kontenjan.textContent = "Kontenjan: " + etkinlik.kontenjan + " kişi";

    kart.append(etiket, baslik, tarih, yer, kontenjan);
    kartListesi.append(kart);
  }
}

function filtreleVeCiz() {
  const arananMetin = aramaInput.value.trim().toLocaleLowerCase("tr-TR");

  const suzulenEtkinlikler = etkinlikler.filter((etkinlik) => {
    const turUygun = seciliTur === "tumu" || etkinlik.tur === seciliTur;
    const baslikUygun = etkinlik.baslik.toLocaleLowerCase("tr-TR").includes(arananMetin);
    return turUygun && baslikUygun;
  });

  kartlariCiz(suzulenEtkinlikler);
}

async function etkinlikleriGetir() {
  kartListesi.textContent = "Yükleniyor...";

  try {
    const response = await fetch("/api/etkinlikler");

    if (!response.ok) {
      throw new Error("Sunucu hatası: " + response.status);
    }

    etkinlikler = await response.json();
    filtreleVeCiz();
  } catch (hata) {
    kartListesi.textContent = "";
    const hataElemani = document.createElement("p");
    hataElemani.className = "hata";
    hataElemani.textContent = "Etkinlikler yüklenemedi. Lütfen bağlantınızı ve sunucuyu kontrol edin.";
    kartListesi.append(hataElemani);
  }
}

filtreButonlari.forEach((buton) => {
  buton.addEventListener("click", () => {
    filtreButonlari.forEach((b) => b.classList.remove("secili"));
    buton.classList.add("secili");
    seciliTur = buton.dataset.tur;
    filtreleVeCiz();
  });
});

aramaInput.addEventListener("input", () => {
  filtreleVeCiz();
});

oneriFormu.addEventListener("submit", (olay) => {
  olay.preventDefault();

  const ad = document.getElementById("etkinlikAdi").value.trim();
  const tarihDegeri = document.getElementById("etkinlikTarihi").value;
  const eposta = document.getElementById("eposta").value.trim();

  if (ad.length < 5) {
    formMesaj.className = "hata";
    formMesaj.textContent = "Hata: Etkinlik adı en az 5 karakter olmalıdır.";
    return;
  }

  const bugun = new Date();
  bugun.setHours(0, 0, 0, 0);
  const secilenTarih = tarihDegeri ? new Date(tarihDegeri) : null;

  if (!secilenTarih || secilenTarih < bugun) {
    formMesaj.className = "hata";
    formMesaj.textContent = "Hata: Tarih alanı boş bırakılamaz ve geçmiş bir gün olamaz.";
    return;
  }

  const epostaKalibi = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!epostaKalibi.test(eposta)) {
    formMesaj.className = "hata";
    formMesaj.textContent = "Hata: Lütfen geçerli bir e-posta adresi giriniz.";
    return;
  }

  formMesaj.className = "basarili";
  formMesaj.textContent = "Teşekkürler! Etkinlik öneriniz başarıyla alındı.";
  oneriFormu.reset();
});

etkinlikleriGetir();
