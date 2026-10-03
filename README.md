# 人生は金がすべて（Money Is Everything）

6歳から100歳までの90秒間、上や横から降ってくるお金をキャッチするブラウザゲームです。
2026-10-03 更新：磁石ボタンの大型化・説明追加、年齢別の顔の大型化・成長ゲージ追加。

## まず遊ぶ

1. ZIPを展開します。
2. `dist/index.html` をChrome、Edge、Safariなどのブラウザで開きます。
3. 「人生をはじめる」を押します。

インストール、ビルド、アカウント、APIキーは不要です。画像も同梱しているので、ローカルならオフラインで遊べます。スマホで遊んだりURLを共有する場合は、下記の方法で公開してください。

## 操作

| 操作 | PC | スマホ |
| --- | --- | --- |
| 左右移動 | ← → / A・D / マウス移動 | ゲーム画面を左右にドラッグ |
| 磁石 | SPACE / 「磁石を使う」ボタン | 「磁石を使う」ボタン |
| 一時停止 | P / Escape / Ⅱボタン | Ⅱボタン |
| サウンド | 右上の♪ボタン | 右上の♪ボタン |

磁石は3.6秒間、お金だけを引き寄せます。使用した時点から15秒で回復します。赤い出費は引き寄せません。

8コンボで獲得金額2倍、16コンボで3倍。2.4秒キャッチしないか赤い出費に当たるとコンボはリセットされます。出費で所持金が0円未満になることはありません。6・18・30・50・70歳で顔と時代が変わり、100歳で結果が出ます。

音は初期状態でOFF。別のタブへ移動すると自動で一時停止します。再読み込みするとゲームはリセットされ、記録の保存やオンラインランキングはありません。

## ファイル構成

| ファイル | 役割 |
| --- | --- |
| `dist/index.html` | 画面・ボタン・文章 |
| `dist/style.css` | レイアウト・色・スマホ対応 |
| `dist/game.js` | ゲーム処理・描画・操作・サウンド |
| `dist/background.webp` | 同梱の背景画像 |
| `README.md` | この説明書 |

HTML / CSS / JavaScript / Canvas 2D / Web Audio APIで動作します。ゲームエンジン、npm依存、外部CDN、外部フォント、ゲームサーバー、データベース、有料APIは使っていません。顔は端末内の絵文字フォントなので、OSによって見た目が少し異なります。背景はこのゲーム用のAI生成画像で、既存ゲームの画像・コードは使っていません。

## 無料で公開する：Cloudflare Pages

Cloudflareの無料アカウントを作成し、無料の `pages.dev` URLを使う方法です。このゲームは静的ファイルだけなので、Pagesの静的配信として運用できます。有料ドメインの購入やWorkers・DBの契約は不要です。

### 方法A：管理画面にドラッグ＆ドロップ（最短）

1. https://dash.cloudflare.com/ にログインします。
2. **Workers & Pages** を開き、**Create application → Get started → Drag and drop your files** へ進みます。画面の表記が違う場合はPagesのファイルアップロードを選びます。
3. プロジェクト名を入力します。例：`money-is-everything`。他の人が使っている名前なら変更します。
4. 展開済みの **`dist` フォルダ**をアップロードします。公開ルート直下に `index.html`、`style.css`、`game.js`、`background.webp` が並ぶことを確認します。ソース一式のZIPをそのままアップロードしないでください。
5. **Deploy site / Save and Deploy** を押します。
6. 発行された `https://プロジェクト名.pages.dev` を開きます。このURLは通常、誰でも閲覧可能です。

更新時は、同じプロジェクトの **Create a new deployment** からProductionを選択し、更新した `dist` をアップロードします。

### 方法B：ターミナルから公開

この方法だけはNode.jsとnpmが必要です。ZIPを展開した `money-shower` フォルダ内で実行します。

```bash
npx wrangler login
npx wrangler pages project create money-is-everything
```

プロダクションブランチを聞かれたら `main` を指定します。プロジェクト名が重複した場合は、以下のコマンドも含めて自分の名前に置き換えます。

```bash
npx wrangler pages deploy dist --project-name money-is-everything --branch main
```

2回目以降は最後のdeployコマンドだけで更新できます。Wranglerは公開用の道具で、プレイヤーの端末には不要です。

### GitHub連携で自動更新したい場合

Direct Uploadで作ったプロジェクトは、後からGit連携に切り替えられません。自動公開を使うなら、GitHubにこのフォルダを置き、別のPagesプロジェクトをGit連携で作成してください。

- フレームワーク：None
- ビルドコマンド：`exit 0`
- 出力ディレクトリ：`dist`
- 環境変数：不要

### 費用・公式資料

2026-10-03確認時点で、Pagesの静的アセットのリクエストは無料です。契約内容・サービスの制限はCloudflareの公式情報を確認してください。独自ドメインを購入する場合、その費用は別途かかります。

- Direct Upload（管理画面・Wrangler）：https://developers.cloudflare.com/pages/get-started/direct-upload/
- 静的HTMLの設定：https://developers.cloudflare.com/pages/framework-guides/deploy-anything/
- 静的配信の料金：https://developers.cloudflare.com/pages/functions/pricing/

このREADMEは自分のCloudflareアカウントで公開するための手順です。現在ChatGPT内で公開されているサイトを移動・削除する操作ではありません。配布ZIPにはChatGPT Sites固有のID・認証情報・Git履歴を含めていません。

## ローカルで編集する

`dist` の3つのテキストファイルをVS Codeなどで編集して、ブラウザを再読み込みしてください。ビルド作業は不要です。

ローカルHTTPサーバーを使う場合は、Python 3が入った環境で以下を実行します。

```bash
python3 -m http.server 8000 --directory dist
```

Windowsでは `python3` の代わりに `py` を使えます。`http://localhost:8000` を開き、終了はCtrl+Cです。

## 調整する場所

| 変えたいもの | `game.js` 内の場所 |
| --- | --- |
| 1プレイの長さ | `DURATION=90` |
| 年齢の区切り・顔・基本金額 | `STAGES` |
| お金・出費の出現確率 | `spawn()` |
| コンボ倍率 | `multiplier()` |
| 磁石の効果時間・回復時間 | `activateMagnet()` の `3.6` と `15` |
| 磁石の回復ゲージ | `syncHud()` の `magnetCooldown/15` |
| 人物の大きさ | `render()` 内の年齢別フォントサイズ |
| 結果のランク | `finish()` |

磁石の時間を変更するときは、画面上の説明・READMEも一緒に直してください。年齢の区切りを変更する場合も、HTMLの人生ゲージの表記を更新してください。

`document.modelContext` が存在する環境では、読み取り専用の `read_money_is_everything_state` ツールを登録します。非対応ブラウザでは何もしません。外部通信や課金は発生しません。

## 困ったとき

- 画面が真っ白：`index.html` だけを移動せず、`dist` の4ファイルを同じ場所に置いてください。
- 公開先で404：公開ルートに `index.html` があるか確認してください。
- 更新が見えない：強制再読み込みを試してください。
- 音がしない：右上の♪をONにしてください。端末・ブラウザの音量も確認してください。
- 磁石が押せない：開始前、一時停止中、結果表示中、回復中は使用できません。
