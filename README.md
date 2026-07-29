# デモ 1: Hello GRAPHY — GRAPHY-Next プラグインの最小サンプル

メニューを押すと **`Hello, I'm GRAPHY-Next.`** と表示するだけのプラグインです。
**ファイルは 2 つ、ビルドツールは不要。** GRAPHY-Next プラグインの骨格をこれ 1 本で把握できます。

- 対象: [GRAPHY-Next](https://github.com/tatsunidas/GRAPHY-Next) v0.1.8 以降
- 動作モード: **デスクトップ版・Web 版の両方**（UI のみのプラグインなので）
- 姉妹デモ: [デモ集ハブ](https://github.com/tatsunidas/graphy-next-plugin-demos) ／
  [デモ 2: 平均化フィルタ](https://github.com/tatsunidas/graphy-next-plugin-mean-filter) ／
  [デモ 3: Gemini 所見推敲](https://github.com/tatsunidas/graphy-next-plugin-gemini-findings)

> このリポジトリの README は**単体で完結**するように書いてあります。
> 他のデモの README と内容が重複していますが、そういう方針です。

---

## 目次

1. [5 分で動かす](#1-5-分で動かす)
2. [ファイルの中身](#2-ファイルの中身)
3. [`plugin.json` の全フィールド](#3-pluginjson-の全フィールド)
4. [`ui.js` と `host` API](#4-uijs-と-host-api)
5. [自分のプラグインに作り変える](#5-自分のプラグインに作り変える)
6. [リリースする（GitHub Release）](#6-リリースするgithub-release)
7. [GRAPHY-Next に入れる（デスクトップ版）](#7-graphy-next-に入れるデスクトップ版)
8. [Web 版に載せる](#8-web-版に載せる)
9. [鍵方式（署名）](#9-鍵方式署名)
10. [うまくいかないとき](#10-うまくいかないとき)
11. [できないこと（正直に）](#11-できないこと正直に)

---

## 1. 5 分で動かす

いちばん速いのは、**プラグイン格納ディレクトリに手で置く**方法です。リリースも導入 UI も要りません。

### 1-1. 格納ディレクトリを開く

| OS | 場所 |
|---|---|
| Windows | `%APPDATA%\GRAPHY-Next\plugins\` （実体は `C:\Users\<ユーザー名>\AppData\Roaming\GRAPHY-Next\plugins\`） |
| macOS | `~/Library/Application Support/GRAPHY-Next/plugins/` |
| Linux (AppImage) | `~/.config/GRAPHY-Next/plugins/` |

> **インストール先ではなく、OS のユーザーデータ領域**です。本体が読み取り専用（AppImage など）でも
> 書けること、アンインストーラがユーザーデータを巻き添えで消さずに済むことが理由です。
> 場所はアプリの **ヘルプ ＞ アンインストール** ダイアログにも表示されます。

`plugins` フォルダが無ければ作ってください。

### 1-2. ファイルを置く

```
<plugins>/
└── hello-graphy/
    ├── plugin.json
    └── ui.js
```

このリポジトリの `plugin.json` と `ui.js` をコピーするだけです。
**フォルダ名は何でもかまいません**（`plugin.json` の `id` と揃えると分かりやすい、というだけ）。

### 1-3. 反映する

**GRAPHY-Next を完全に終了してから起動**します。

2D ビューアの **Plug-ins** メニュー、またはデータベース画面の **Plug-Ins** メニューに
`Hello GRAPHY` が並びます。クリックすると挨拶が出ます。

> **反映のルール（重要）**
>
> | 変更した中身 | 必要な操作 | 理由 |
> |---|---|---|
> | `ui.js` だけ | 画面のリロード | フロントは起動時に `/api/plugins` を読んで動的 import するため |
> | `*.jar` を含む | **アプリの再起動** | クラスローダを id 単位でキャッシュしており、同 id の JAR 差し替えを拾わないため |
>
> マニフェスト一覧はアクセスのたびにディレクトリを走査するので backend の再起動自体は不要ですが、
> パッケージ版にはリロード用の UI 操作がありません。**実務上はアプリを終了→再起動**が確実です。

---

## 2. ファイルの中身

```
plugin.json                     ← 必須。マニフェスト
ui.js                           ← 画面側（ES モジュール・ビルド不要）
graphy-plugin.d.ts              ← エディタ補完用（配布物には含めない）
.github/workflows/release.yml   ← タグ push で zip + sha256 (+ 署名) を作る
LICENSE
```

**1 プラグイン = 1 フォルダ**です。フォルダ直下に `plugin.json`（必須）、
任意で `ui.js`（画面側）と `*.jar`（Java 側）を置きます。それだけです。

このデモは `ui.js` だけなので、**デスクトップ版でも Web 版でも動きます**。
`*.jar` を含むプラグインは現状デスクトップ版のみ実行できます（§8）。

---

## 3. `plugin.json` の全フィールド

このデモの `plugin.json`:

```json
{
  "id": "hello-graphy",
  "name": "Hello GRAPHY",
  "version": "0.1.0",
  "contributes": ["viewer2d.menu", "mainscreen.menu"],
  "ui": "ui.js",
  "engines": { "graphy": ">=0.1.8", "os": ["win32", "darwin", "linux"] },
  "description": "…",
  "author": "…",
  "homepage": "…",
  "license": "MIT"
}
```

| キー | 必須 | 説明 |
|---|---|---|
| `id` | ✅ | 一意な ID（`[A-Za-z0-9._-]`）。フォルダ名と揃えると分かりやすい |
| `name` | ✅ | メニューに出る表示名 |
| `version` | ✅ | semver。**リリースタグ `v<version>` と一致必須** |
| `contributes` | UI を出すなら | 出す先（サーフェス）の配列 |
| `ui` | UI を出すなら | フォルダ直下の ES モジュール名 |
| `entrypoint` | JAR を持つなら | `GraphyPlugin` 実装クラスの完全修飾名 |
| `permissions` | 任意 | 要求権限。**宣言のみで、現状は強制されない** |
| `engines.graphy` | 推奨 | 対応する本体の版の範囲 |
| `engines.os` | 推奨 | 対応 OS |
| `description` / `author` / `homepage` / `license` | 任意 | 一覧・同意画面の表示用 |

### サーフェス（`contributes`）— どこに出るか

| 値 | 出る場所 | 用途 |
|---|---|---|
| `viewer2d.menu` | 2D ビューアの **Plug-ins** メニュー | 表示中の画像に対する処理・ツール |
| `mainscreen.menu` | データベース画面の **Plug-Ins** メニュー | DB・エクスポート等、画像に依存しない機能 |
| `viewer2d.toolbar` | （予約） | ツールバーへの常設ボタン。描画は将来 |

未知のサーフェスは無視されます（前方互換）。このデモのように**両方に出しても**かまいません。

### `engines` — 入れる前に弾くための宣言

- **`engines.graphy`**: 本体の版と照合します。演算子は `>= <= > < =` と空白 AND（`">=0.1.8 <0.3.0"`）。
  `*` / 空 / 未指定は常に互換。本体が開発ビルド（`"dev"`）のときはゲートしません。
- **`engines.os`**: `win32` / `darwin` / `linux`。GRAPHY-Next は OS ごとにリリースが分かれ、
  プラグインも JNI やネイティブバイナリを含めば OS 専用になります。
  **非対応と判定されると、ユーザーが同意しても展開前に拒否されます**（fail-closed）。
  このデモは純 JS なので 3 つとも書いています。省略しても「OS 非依存」と同じ扱いです。

---

## 4. `ui.js` と `host` API

`ui.js` は **ES モジュール**です。バンドラは不要で、backend が `text/javascript` として配信し、
フロントが動的 `import()` で読み込みます。メニューがクリックされると `activate(host)` が呼ばれます。

```js
// named export（推奨）
export function activate(host) { /* … */ }

// default export でも可
// export default { activate };
```

`activate` は `Promise` を返してもかまいません（`async function activate(host)`）。

### このデモのコード

```js
export function activate(host) {
  host.notify("Hello, I'm GRAPHY-Next.");

  if (host.surface === "mainscreen.menu") {
    host.notify("選択中のスタディ: " + (host.selectedStudyUid || "(未選択)"));
  } else {
    host.actions.invert();
    host.notify("表示中の画像を白黒反転しました（もう一度押すと戻ります）。");
  }
}
```

`host.surface` で分岐すると、**同じプラグインを 2 つの画面に出しても文脈に合った動き**にできます。

### `host` に入っているもの

**すべてのサーフェス共通**

| プロパティ | 型 | 説明 |
|---|---|---|
| `surface` | `string` | 呼び出し元（`"viewer2d.menu"` / `"mainscreen.menu"` …） |
| `pluginId` | `string` | 自分の `plugin.json` の `id` |
| `t(key)` | `(k: string) => string` | ホストの i18n 取得関数（アプリの言語に追従） |
| `notify(msg)` | `(m: string) => void` | ユーザーへの簡易通知 |
| `runBackend(payload?)` | `(p?: unknown) => Promise<unknown>` | `POST /api/plugins/{id}/run` を呼ぶ（JAR がある場合） |

**`viewer2d.menu` / `viewer2d.toolbar` のとき追加**

| プロパティ | 説明 |
|---|---|
| `actions` | 表示中タイルへの操作。`fit()` / `reset()` / `rotate90()` / `flipH()` / `flipV()` / `invert()` / `undo()` / `redo()` / `setWindowLevel(center, width)` / `resetWindow()` ほか |

**`mainscreen.menu` のとき追加**

| プロパティ | 説明 |
|---|---|
| `selectedStudyUid` | 選択中スタディの UID（未選択なら `null`） |

### 型補完（ビルド不要）

同梱の `graphy-plugin.d.ts` をプラグインフォルダに置き、`ui.js` の先頭に次の 2 行を書くと、
TypeScript を導入しなくても VS Code で `host` に補完が効きます。

```js
/// <reference path="./graphy-plugin.d.ts" />
// @ts-check
```

`.d.ts` は**配布物（zip）には入れません**（エディタ用なので）。

### `ui.js` はレンダラのフルコンテキストで動く

`ui.js` は隔離されていません。`document` も `fetch` も使えるので、
自前のダイアログを DOM で組み立てたり、backend の REST API を直接叩いたりできます
（[デモ 2](https://github.com/tatsunidas/graphy-next-plugin-mean-filter) がそうしています）。

ただし **裏返せば、プラグインはアプリと同じ権限で動く**ということです。
これが §9 の署名や、導入時の同意画面が存在する理由です。

**外部サイトへは接続できません。** 配布版のレンダラには
`connect-src 'self' http://localhost:* http://127.0.0.1:*` の CSP が効いており、
`ui.js` から外部 API を `fetch` すると**ブロックされます**。外部 API を叩きたい場合は
バックエンド面（JAR）から呼びます（[デモ 3](https://github.com/tatsunidas/graphy-next-plugin-gemini-findings) 参照）。

---

## 5. 自分のプラグインに作り変える

1. このリポジトリを **fork**（または zip でダウンロード）する
2. `plugin.json` の `id` を一意なものに、`name` / `version` / `author` / `homepage` を自分用に変える
3. `ui.js` の `activate(host)` を書き換える
4. 格納ディレクトリに置いて再起動 → 動作確認（§1）
5. 配りたくなったら §6 へ

ローカルでの試行錯誤は「格納ディレクトリのファイルを直接編集 → 画面をリロード」がいちばん速いです。

---

## 6. リリースする（GitHub Release）

配布は **GitHub Release の「ビルド済み zip 資産」**で行います。ソース tarball ではありません
（`ui.js` はトランスパイル後、`*.jar` はコンパイル後の成果物が要るため）。

### 6-1. リリース資産

| 資産 | 内容 | 必須か |
|---|---|---|
| `<id>-<version>.zip` | **直下に `plugin.json`** ＋ 任意 `ui.js` / `*.jar` | ✅ 必須 |
| `<id>-<version>.zip.sha256` | 完全性検証用 | 実質必須（無いと既定で導入拒否） |
| `<id>-<version>.zip.minisig` | 署名（真正性） | 推奨（§9） |
| `minisign.pub` | 署名の公開鍵 | 署名するなら必要 |

このデモなら `hello-graphy-0.1.0.zip` の直下に `plugin.json` と `ui.js` が入ります。

> 単一のラップフォルダ（`repo-0.1.0/plugin.json`）は自動で剥がされますが、
> 直下に置くのが基本です。

### 6-2. タグを push するだけ

同梱の [`.github/workflows/release.yml`](.github/workflows/release.yml) が、
タグ `v<version>` の push で zip・sha256・（鍵があれば）署名まで作って Release に添付します。

```bash
# plugin.json の version を 0.2.0 に上げてコミットしてから
git tag v0.2.0
git push origin v0.2.0
```

**`plugin.json` の `version` とタグは一致必須**です。ずれていると CI がエラーで落ちます
（版と中身が食い違ったまま配られるのを防ぐため）。

---

## 7. GRAPHY-Next に入れる（デスクトップ版）

### 7-1. 導入を許可する（初回だけ）

導入操作は **3 つの条件がすべて揃ったときだけ**許可されます。既定では 3 番目が OFF です。

| # | 条件 | 誰が決めるか | 既定 |
|---|---|---|---|
| 1 | デスクトップ版（standalone）であること | モード | Web は常に `403` |
| 2 | `graphy.plugins.manager-enabled` | 管理者（yml） | `true`（施設で一律禁止したい場合に `false`） |
| 3 | 設定キー `plugins.installEnabled` | **ユーザー** | **`false`** |

**環境設定 ＞ プラグイン ＞「プラグインの導入を許可する」を ON** にしてください。

> 分けてある理由: プラグインはアプリと同じ権限で動きます。「環境として許すか（管理者）」と
> 「今それを使うか（ユーザー）」は別の判断なので、2 段にしてあります。
> トグルを OFF に戻しても**導入済みプラグインは動き続けます**（止めたいなら個別に無効化）。

### 7-2. GitHub から入れる

環境設定 ＞ プラグイン で `tatsunidas/graphy-next-plugin-hello` と入れて「GitHub から導入」。
内部では次が起きます。

```
[1] ゲート判定        standalone か / 管理者ゲート / ユーザーのオプトイン
      │ 欠ければ 403（閲覧のみ）
      ▼
[2] 取得              Release から <id>-<ver>.zip ＋ .sha256 ＋ .minisig / minisign.pub
      │ ※ まだ展開していない
      ▼
[3] 検査 (inspect)    zip を展開せずに読み、中身を提示用データにする
      │
      ├─ 署名が既知の鍵で通った ─────────► [5] へ直行（確認画面なし＝押すだけ）
      │
      └─ 未署名 / 未知の鍵 / 警告あり
      ▼
[4] 同意画面          何を受け入れるのかを提示して承諾を得る
      │ 互換NGなら同意しても導入できない
      ▼
[5] 導入 (install)    再取得 → 同意した sha256 と一致するか確認 → 展開 → 台帳に記録
      ▼
[6] 反映              UI のみ → 画面リロード ／ JAR 入り → アプリ再起動
```

同意画面には次が出ます。**同梱 JAR の一覧は「アプリと同じ権限で動くコードの有無」**なので、必ず見てください。
このデモは JAR を含まないので、そこは空になります。

- id / name / version / 説明 / 作者 / ライセンス
- **同梱 JAR の一覧**、`ui.js` の有無、ファイル数・総サイズ
- 宣言 `permissions`
- 対応 OS の突き合わせ結果、コア版数の互換
- `sha256` と検証状態、署名の状態
- 同じ id が既に入っているか

**[5] の「同意した sha256 と一致するか確認」**は TOCTOU 対策です。同意画面を見てから導入するまでの間に
リリース資産が差し替えられても、**ユーザーが見ていない成果物は入りません**。

### 7-3. ローカル zip から入れる（オフライン / 開発中）

同じ画面から zip ファイルを直接指定できます（エアギャップ環境向け）。
なお、**file 由来のものは「再インストール」ができません**（zip を保持しないため、再アップロードが必要）。

### 7-4. 台帳

`<plugins>/installed.json` に、取得元・sha256・署名鍵・同梱 JAR 名・有効無効が記録されます。
「どこから来たか」を後から確認できるのはこのファイルです。

---

## 8. Web 版に載せる

**Web 版ではエンドユーザーによる導入はできません。** 一覧の閲覧のみで、導入系 API は `403` です。

| | デスクトップ（standalone） | Web |
|---|---|---|
| 導入操作 | ✅ 環境設定 ＞ プラグイン | ❌ `403`（閲覧のみ） |
| 追加方法 | ユーザーが GitHub / ローカル zip から | **運営がイメージに焼き込む** |
| JAR の実行 | ✅ 同一 JVM | ❌ `501`（サンドボックス未実装） |
| UI のみ | ✅ | ✅（運営配備分のみ） |

理由は backend が**共有サーバー**だからです。任意の JAR を共有 JVM に読ませると、そのコードは
サーバー権限で全実行でき、**他患者データの読み取りや他テナント侵害**まで届きます。

### 運営が Web 版へ載せる手順

デモ環境（`deploy/demo/`）のコンテナは `read_only: true` で、`/app/plugins` はボリュームマウント
されていません。したがって**稼働中に書き込む手段がありません**。追加は次のようになります。

1. プラグインのフォルダをデプロイ用ディレクトリに置く
2. `Dockerfile` に `COPY <plugin-dir> /app/plugins/<id>` を追加
3. イメージをビルドして再デプロイ

つまり **Web 版へのプラグイン追加は、コード変更・再デプロイ扱い**です。

**このデモは UI のみなので Web 版でも動きます。**（運営が焼き込めば、の話です。）

---

## 9. 鍵方式（署名）

このデモは署名なしでも導入できますが、配布するなら署名を強く推奨します。

### 9-1. なぜ必要か — sha256 だけでは足りない

導入時の検証は **4 段**あり、それぞれ守っている性質が違います。ここを混同しないことが重要です。

| 段 | 何を見るか | 守れる性質 | 失敗したら |
|---|---|---|---|
| A | zip の構造・`id`・展開先 | **安全な展開**（zip slip / 巨大 zip / パス脱出） | `422` で拒否 |
| B | `engines.os` / `engines.graphy` | **動く環境か** | 展開前に `422`（同意しても不可） |
| C | `<zip>.sha256` | **完全性**（転送中の破損・部分的な差し替え） | 既定で拒否。明示承諾時のみ通す |
| D | `.minisig`（Ed25519 署名） | **真正性**（誰が作ったか・乗っ取り検知） | **無条件で拒否** |

**sha256 は同じリリースから取ってきます。** リポジトリを支配した側は zip とハッシュを両方
差し替えられるので、これは「壊れていないこと」しか保証しません。**誰が作ったかは分かりません。**
そこに答えるのが署名です。

### 9-2. 仕組み — minisign（Ed25519）と TOFU

GRAPHY-Next は [minisign](https://jedisct1.github.io/minisign/) 形式の署名を検証します。
検証に使う鍵は次の順で探します。

| 順 | 鍵の出どころ | 状態 | 挙動 |
|---|---|---|---|
| ① | 本体設定 `trusted-keys`（GRAPHY-Next 公式配布鍵） | `trusted` | **確認画面なしで導入** |
| ② | 台帳に固定した前回の鍵 | `pinned` | **確認画面なしで導入** |
| ③ | リリース同梱の `minisign.pub`（初回のみ） | `first-use` | 確認画面を出し、導入時にこの鍵を固定 |
| — | 検証失敗・鍵 ID 不一致・**署名の剥がし** | `invalid` | **拒否**（承知しても通さない） |

②が **TOFU（trust on first use）** の核心です。初回に見た鍵を台帳に固定し、更新時は
**リリースが同梱してくる鍵ではなく、固定した鍵で**検証します。これにより
**リポジトリ乗っ取りや作者すり替えは、更新の時点で自動的に弾けます。**

「署名を剥がして未署名として出す」抜け道も塞いであります（固定鍵がある id の未署名パッケージは
`invalid` 扱い）。その代わり、**配布者にとって署名は片道の約束**になります。

> **利用者は鍵を一切扱いません。** 鍵の生成・保管は配布者、公式鍵の同梱は本体の仕事で、
> 利用者から見れば「署名されているものは押すだけで入る」だけです。

### 9-3. 作者としてやること（1 回だけ）

```bash
# 1. 鍵を作る。パスフレーズは必ず設定する（空にしない）
minisign -G -p minisign.pub -s minisign.key

# 2. 公開鍵はリポジトリにコミットしてよい（秘密ではない）
git add minisign.pub && git commit -m "add signing public key" && git push

# 3. 秘密鍵とパスフレーズを GitHub の secrets に登録する
gh secret set MINISIGN_SECRET_KEY < minisign.key
gh secret set MINISIGN_PASSWORD     # プロンプトでパスフレーズを入力
```

これだけです。以降、リリースごとの追加作業はありません
（同梱の `release.yml` が署名します。secrets が未登録なら署名ステップは自動でスキップされます）。

**`minisign` の入手**: Ubuntu 22.04 / Pop!\_OS のリポジトリには**ありません**。
[公式のスタティックバイナリ](https://github.com/jedisct1/minisign/releases)を `/usr/local/bin` 等に置いてください。
macOS は `brew install minisign`、Windows は `scoop install minisign` などが使えます。

### 9-4. 秘密鍵の保管がすべて

技術的には Ed25519 の鍵に**有効期限はありません**。失効リストも OCSP も無く、
X.509 証明書のように「期限切れで一斉に動かなくなる」ことは起きません。
鍵の寿命を決めるのは運用だけです。

| 事象 | 起きること | 復旧 |
|---|---|---|
| 秘密鍵を**紛失** | 以後の更新に署名できない。既存利用者は「前回は署名付き＝今回未署名」で**更新を拒否**される | 利用者側でアンインストール→再導入が必要（＝全利用者に影響） |
| 秘密鍵が**漏洩** | 攻撃者が正規の署名を作れる。TOFU も突破される | 鍵のローテーション＋告知 |
| 鍵を**変更**（意図的） | 利用者は「前回と違う鍵」として更新を拒否する | アンインストール→再導入を案内する |

**やること**: オフラインのバックアップを 2 か所（暗号化 USB ＋ パスワードマネージャのセキュアノート等）。
パスフレーズは鍵ファイルと**別の場所**に保管。

**やってはいけないこと**:

- 秘密鍵をリポジトリにコミットする（**公開鍵だけ**コミットする）
- パスフレーズ無しの鍵を作る
- 同じ鍵を他用途（SSH・コード署名など）と兼用する

### 9-5. GRAPHY-Next の「公式鍵」は第三者には配られない

`trusted-keys`（①）に載っているのは **Visionary Imaging Services が自社の公式プラグインを配るための鍵**で、
第三者の作者に渡されることはありません（渡した相手は何でも「公式」として確認画面なしで配れてしまうため）。

第三者の作者は **自分の鍵**を使います。利用者から見た違いは
「初回だけ確認画面が出て、2 回目以降は押すだけになる」ことです。これで十分に機能します。

### 9-6. 手元で検証する

```bash
minisign -V -p minisign.pub -m hello-graphy-0.1.0.zip -x hello-graphy-0.1.0.zip.minisig
```

> **補足（実装者向け）**: 実物の minisign 0.12 は `-H` を付けなくても
> prehashed（algo `ED`・BLAKE2b-512）で署名します。GRAPHY-Next 側は両形式に対応しています。
> また minisign CLI は鍵 ID を**バイト逆順・大文字 hex** で表示します。
> アプリの同意画面も同じ表記に揃えてあるので、そのまま見比べられます。

---

## 10. うまくいかないとき

| 症状 | 見るところ |
|---|---|
| メニューに出ない | `plugin.json` が妥当な JSON か / `id` が空でないか / `contributes` にサーフェス名があるか / アプリを再起動したか |
| メニューには出るがクリックで無反応 | `ui.js` が `activate` を **export** しているか / DevTools のコンソールに import エラーが出ていないか |
| `ui.js` が 404 | `plugin.json` の `ui` とファイル名が一致するか / ファイルがフォルダ直下にあるか |
| 導入ボタンが押せない / `403` | 環境設定 ＞ プラグイン のトグルが OFF、または Web 版 |
| 導入が `422` で拒否される | `engines.os` / `engines.graphy` が非対応、または zip 構造が不正 |
| 「完全性を検証できません」 | Release に `<zip>.sha256` が無い。CI が付けているか確認 |
| CI が「version != tag」で落ちる | `plugin.json` の `version` とタグ `v<version>` を一致させる |
| 確認画面が毎回出る | 未署名。§9-3 で署名すると 2 回目以降は出なくなる |
| `signature check failed: … does not match` | 配布物が署名後に差し替わった、または別の鍵で署名した。**心当たりが無ければ乗っ取りを疑う** |
| `signature check failed: … different key` | 前回と違う鍵で署名した（TOFU）。利用者側の回避はアンインストール→再導入 |
| `… but this package has no signature` | 以前は署名付きだったのに今回未署名。署名を復活させる |
| リリースに `.minisig` が付かない | secrets 未登録（ステップが自動スキップされた） |

---

## 11. できないこと（正直に）

過大評価されると危険なので、限界を明記します。

- **未署名プラグインの真正性は保証できません。** 同意画面は判断材料を出すだけで、
  最終的な防御線は「利用者が配布元を信頼するかどうか」です。
- **宣言 `permissions` は強制されません。** マニフェストに書かれているだけで、
  実際のアクセスは制限していません。
- **実行時の隔離がありません。** プラグインはアプリと同じ権限で動きます
  （backend は同一 JVM、frontend はレンダラのフルコンテキスト）。
- **初回の作者そのものは検証できません。** TOFU は「2 回目以降、同じ相手か」を保証する仕組みです。
- **シリーズの生ピクセル（HU 等）に触れる公式 API はまだありません。**
  `host` から取れるのは表示操作（`actions`）と選択スタディ UID までです。
- **Web 版でのユーザー導入は実現していません。**

---

## 参考

- デモ集ハブ: <https://github.com/tatsunidas/graphy-next-plugin-demos>
- 本体: <https://github.com/tatsunidas/GRAPHY-Next>
- ユーザーマニュアル: <https://tatsunidas.github.io/GRAPHY-Next/>
- GRAPHY Lab: <https://graphy.vis-ionary.com/lab/>

## ライセンス

MIT。自分のプラグインの出発点として自由にコピーしてください。
