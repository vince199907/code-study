const http = require("http");

const KEY = process.env.MY_KEY;

const server = http.createServer(async function (req, res) {
  if (req.url === "/api/weather") {
    console.log("后端收到请求，用的 key 是：", KEY);
    const url = "https://api.open-meteo.com/v1/forecast?latitude=31.23&longitude=121.47&current=temperature_2m";
    const r = await fetch(url);
    const data = await r.json();
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ temp: data.current.temperature_2m }));
  } else {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.end(`
      <h1>上海气温</h1>
      <button onclick="go()">查询</button>
      <p id="r"></p>
      <script>
        async function go() {
          const res = await fetch("/api/weather");
          const data = await res.json();
          document.getElementById("r").textContent = data.temp + "°C";
        }
      </script>
    `);
  }
});

server.listen(3000, function () {
  console.log("服务器启动了：http://localhost:3000");
});