document.addEventListener("DOMContentLoaded", () => {
  const resultJson = sessionStorage.getItem("teamResult");
  const playerListDiv = document.querySelector(".player-list");

  playerListDiv.innerHTML = "";

  if (!resultJson) {
    playerListDiv.innerHTML = `
      <p style="color: red; text-align: center; font-size: 1.2em;">
          エラー: チームデータが見つかりません。入力ページに戻って再試行してください。
      </p>
    `;
    return;
  }

  try {
    const teamResult = JSON.parse(resultJson);

    if (!Array.isArray(teamResult) || teamResult.length === 0) {
      playerListDiv.innerHTML = `
        <p style="color: red; text-align: center; font-size: 1.2em;">
            エラー: サーバーから有効なチームデータが返されませんでした。
        </p>
      `;
      return;
    }

    teamResult.forEach((player) => {
      let roleClass;
      let roleColor;

      if (player.role === "タンク") {
        roleClass = "role-tank";
        roleColor = "#f7931e";
      } else if (player.role === "ダメージ") {
        roleClass = "role-damage";
        roleColor = "#ee4a4a";
      } else if (player.role === "サポート") {
        roleClass = "role-support";
        roleColor = "#4ac9ff";
      } else {
        roleClass = "role-unknown";
        roleColor = "#ffffff";
      }

      // ヒーロー画像パス
      const heroImagePath = `./img/${player.hero}.png`;
      const roleImagePath = `./img/${player.role}.png`;

      const cardHTML = `
        <div class="player-card ${roleClass}">
            <p class="player-name">${player.name}</p>

            <div class="role-info">
                <img src="${roleImagePath}" alt="${player.role}" class="role-image" />
                <span class="role-name" style="color: ${roleColor};">${player.role}</span> 
            </div>

            <div class="hero-info">
                <img src="${heroImagePath}" alt="${player.hero}" class="hero-image" />
                <p class="hero-name">${player.hero}</p>
            </div>
        </div>
      `;

      playerListDiv.insertAdjacentHTML("beforeend", cardHTML);
    });

    sessionStorage.removeItem("teamResult");
  } catch (e) {
    console.error("結果データの解析エラー:", e);
    playerListDiv.innerHTML = `
      <p style="color: red; text-align: center; font-size: 1.2em;">
          エラー: サーバーからのデータ形式が正しくありません。<br>Goバックエンドのレスポンスを確認してください。
      </p>
    `;
  }
});
