const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3000;
const publicKlasoru = path.join(__dirname, "public");
const veriDosyasi = path.join(__dirname, "etkinlikler.json");

const mimeTurleri = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".ico": "image/x-icon"
};

const sunucu = http.createServer((req, res) => {
  console.log(req.method + " " + req.url);

  if (req.method !== "GET") {
    res.writeHead(405, {
      "Content-Type": "text/plain; charset=utf-8",
      "Allow": "GET"
    });
    res.end("405 Method Not Allowed: Yalnızca GET yöntemi desteklenmektedir.");
    return;
  }

  const istekUrl = new URL(req.url, "http://localhost:" + PORT);
  const yol = istekUrl.pathname;

  if (yol === "/api/etkinlikler") {
    fs.readFile(veriDosyasi, "utf-8", (err, veri) => {
      if (err) {
        res.writeHead(500, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify({ hata: "Veri dosyası okunamadı" }));
        return;
      }

      let etkinlikler = JSON.parse(veri);
      const tur = istekUrl.searchParams.get("tur");

      if (tur) {
        etkinlikler = etkinlikler.filter((etkinlik) => etkinlik.tur === tur);
      }

      res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify(etkinlikler));
    });
    return;
  }

  if (yol.startsWith("/api/etkinlikler/")) {
    const parcalar = yol.split("/");
    const id = Number(parcalar[3]);

    fs.readFile(veriDosyasi, "utf-8", (err, veri) => {
      if (err) {
        res.writeHead(500, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify({ hata: "Veri dosyası okunamadı" }));
        return;
      }

      const etkinlikler = JSON.parse(veri);
      const etkinlik = etkinlikler.find((item) => item.id === id);

      if (!etkinlik) {
        res.writeHead(404, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify({ hata: "Etkinlik bulunamadı" }));
        return;
      }

      res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify(etkinlik));
    });
    return;
  }

  const goreceliYol = yol === "/" ? "index.html" : yol.slice(1);
  const tamDosyaYolu = path.resolve(publicKlasoru, goreceliYol);

  if (!tamDosyaYolu.startsWith(publicKlasoru + path.sep) && tamDosyaYolu !== publicKlasoru) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("404 Not Found: Dosya bulunamadı.");
    return;
  }

  fs.stat(tamDosyaYolu, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("404 Not Found: Sayfa bulunamadı.");
      return;
    }

    const uzanti = path.extname(tamDosyaYolu).toLowerCase();
    const icerikTuru = mimeTurleri[uzanti] || "application/octet-stream";

    fs.readFile(tamDosyaYolu, (okumaHatasi, icerik) => {
      if (okumaHatasi) {
        res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
        res.end("500 Sunucu Hatası");
        return;
      }

      res.writeHead(200, { "Content-Type": icerikTuru });
      res.end(icerik);
    });
  });
});

sunucu.listen(PORT, () => {
  console.log("Sunucu http://localhost:" + PORT + " adresinde çalışıyor");
});
