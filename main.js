document.addEventListener("DOMContentLoaded", () => {
  const playerForm = document.getElementById("playerForm");
  const API_BASE_URL =
    "https://exotic-karee-sasato-fccced22.koyeb.app/api/gachaChara";
  const FIELD_COUNT = 5;
  const STORAGE_KEY = "playerFormValues";

  function loadSavedForm() {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const obj = JSON.parse(raw);
      for (let i = 1; i <= FIELD_COUNT; i++) {
        const input = document.getElementById(`player${i}`);
        if (input && obj[`player${i}`] != null) {
          input.value = obj[`player${i}`];
        }
      }
    } catch (e) {
      console.warn("loadSavedForm parse error", e);
    }
  }

  function saveForm() {
    const obj = {};
    for (let i = 1; i <= FIELD_COUNT; i++) {
      const input = document.getElementById(`player{i}`);
      const el = document.getElementById(`player${i}`);
      obj[`player${i}`] = el ? el.value : "";
    }
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
  }

  function clearSavedForm() {
    sessionStorage.removeItem(STORAGE_KEY);
  }

  loadSavedForm();

  for (let i = 1; i <= FIELD_COUNT; i++) {
    const el = document.getElementById(`player${i}`);
    if (el) {
      el.addEventListener("input", () => {
        saveForm();
      });
    }
  }

  window.addEventListener("beforeunload", () => {
    saveForm();
  });

  playerForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const params = [];

    for (let i = 1; i <= FIELD_COUNT; i++) {
      const input = document.getElementById(`player${i}`);
      const playerName = input ? input.value.trim() : "";

      if (playerName) {
        params.push(`name=${encodeURIComponent(playerName)}`);
      }
    }

    if (params.length === 0) {
      alert("プレイヤー名を最低1人入力してください！");
      return;
    }

    const submitButton = playerForm.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = "編成中...";

    try {
      const queryString = params.join("&");
      const response = await fetch(`${API_BASE_URL}?${queryString}`, {
        method: "GET",
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `サーバーエラーが発生しました (${
            response.status
          })。詳細: ${errorText.substring(0, 200)}`
        );
      }

      const raw = await response
        .clone()
        .text()
        .catch((e) => "ERROR: " + e);
      console.log("raw response length:", raw?.length);
      console.log("raw response:", raw);

      let resultData;
      try {
        resultData = await response.json();
      } catch (e) {
        console.error("JSON parse error:", e);
        resultData = null;
      }

      console.log("resultData:", resultData);

      if (
        !resultData ||
        (Array.isArray(resultData) && resultData.length === 0)
      ) {
        alert(
          "サーバーは空の結果を返しました。パラメータ名を確認してください。"
        );
        return;
      }

      sessionStorage.setItem("teamResult", JSON.stringify(resultData));
      saveForm();
      await new Promise((resolve) => setTimeout(resolve, 100));
      window.location.href = "resault.html";
    } catch (error) {
      console.error("通信エラー:", error);
      alert("エラー: " + error.message);
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = "メンバー確定";
    }
  });
});
