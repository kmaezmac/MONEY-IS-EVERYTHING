# 人生は金がすべて（Money Is Everything）

0歳から100歳までの90秒間、上や横から降ってくるお金をキャッチするブラウザゲームです。PC・スマホ対応。

▶ **プレイ：https://money-is-everything.okayama.work/**

## 遊び方

| 操作 | PC | スマホ |
| --- | --- | --- |
| 左右移動 | ← → / A・D / マウス移動 | ゲーム画面を左右にドラッグ |
| 磁石 | SPACE / 「磁石を使う」ボタン | 「磁石を使う」ボタン |
| 一時停止 | P / Escape / Ⅱボタン | Ⅱボタン |
| サウンド | 右上の♪ボタン | 右上の♪ボタン |

- 磁石は3.6秒間お金だけを引き寄せ、15秒で回復します（赤い出費は引き寄せません）。
- 8コンボで獲得金額2倍、16コンボで3倍。2.4秒キャッチしないか出費に当たるとリセット。
- 18・30・50・70歳で顔と時代が変わり、100歳で結果発表。結果はXでシェアできます。

## 技術

HTML / CSS / JavaScript / Canvas 2D / Web Audio API のみ。ビルド不要、npm依存・外部CDN・サーバー・DBなし。

| ファイル | 役割 |
| --- | --- |
| `dist/index.html` | 画面・文章・OGP |
| `dist/style.css` | レイアウト・スマホ対応 |
| `dist/game.js` | ゲーム処理・描画・操作・サウンド・シェア |
| `dist/background.webp` | 背景画像 |
| `dist/image.png` | OGP画像 |
| `wrangler.jsonc` | Cloudflare Workers 配信設定 |

## ローカルで動かす

`dist/index.html` をブラウザで開くだけで遊べます。HTTPサーバーで確認する場合：

```bash
python3 -m http.server 8000 --directory dist
# → http://localhost:8000
```

## デプロイ

Cloudflare Workers（静的アセット）で配信しています。GitHub連携済みなので `main` に push すると自動デプロイされます。手動の場合：

```bash
npx wrangler deploy
```

## 調整ポイント（`dist/game.js`）

| 変えたいもの | 場所 |
| --- | --- |
| 1プレイの長さ | `DURATION=90` |
| 年齢の区切り・顔・基本金額 | `STAGES` |
| お金・出費の出現確率 | `spawn()` |
| コンボ倍率 | `multiplier()` |
| 磁石の効果・回復時間 | `activateMagnet()` の `3.6` と `15` |
| 結果のランク | `finish()` |
| シェア文言 | `shareX()` |

## 困ったとき

- 画面が真っ白：`dist` 内のファイルが同じ場所にそろっているか確認。
- 更新が反映されない：強制再読み込み（Ctrl/Cmd + Shift + R）。
- 音が出ない：右上の♪をONに。端末の音量も確認。
- Xのカード画像が古い・出ない：Xのキャッシュのため、反映まで時間がかかることがあります。