const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

async function check() {
  const html = fs.readFileSync(__dirname + "/weather.html", "utf8");
  const select = html.match(/<select\b[^>]*id="city"[^>]*>([\s\S]*?)<\/select>/);
  assert.ok(select, "页面需要城市下拉框");
  const options = Array.from(select[1].matchAll(/<option\b[^>]*value="([^"]+)"[^>]*>([^<]+)<\/option>/g));
  assert.deepEqual(options.map(option => option[2]).sort(), ["北京", "上海", "广州"].sort());

  const cities = [["北京", "39.90", "116.40"], ["上海", "31.23", "121.47"], ["广州", "23.13", "113.26"]];
  for (const [name, latitude, longitude] of cities) {
    const option = options.find(option => option[2] === name);
    const city = { value: option[1], selectedOptions: [{ textContent: name }] };
    const result = { textContent: "" };
    let click;
    let request;
    const btn = { addEventListener: (event, callback) => { assert.equal(event, "click"); click = callback; } };
    vm.runInNewContext(html.match(/<script>([\s\S]*?)<\/script>/)[1], {
      document: { getElementById: id => ({ city, btn, result })[id] },
      console: { log() {} },
      fetch: async url => {
        request = new URL(url);
        assert.equal(result.textContent, "查询中...");
        city.selectedOptions[0].textContent = "已切换城市";
        return { json: async () => ({ current: { temperature_2m: 25, wind_speed_10m: 12 } }) };
      }
    });
    await click();
    assert.equal(request.searchParams.get("latitude"), latitude);
    assert.equal(request.searchParams.get("longitude"), longitude);
    assert.equal(request.searchParams.get("current"), "temperature_2m,wind_speed_10m");
    assert.equal(result.textContent, name + "温度：25°C，风速：12 km/h");
  }
  console.log("通过：三座城市的坐标、温度、风速及查询期间切换城市。");
}

check().catch(error => { console.error(error); process.exitCode = 1; });
