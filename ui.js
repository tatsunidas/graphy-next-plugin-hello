/// <reference path="./graphy-plugin.d.ts" />
// @ts-check
/*
 * GRAPHY-Next プラグイン「Hello GRAPHY」のフロント面。
 *
 * これは ES モジュールで、ビルドは不要。GRAPHY-Next の backend が text/javascript として配信し、
 * フロントが動的 import() で読み込む。メニューがクリックされると activate(host) が呼ばれる。
 *
 * 型補完は同梱の graphy-plugin.d.ts による（上の reference / @ts-check の 2 行）。
 */

/**
 * プラグインの入口。メニュークリックのたびに呼ばれる。
 *
 * @param {import('./graphy-plugin').PluginHost} host
 *        サーフェス別のコンテキスト。共通で pluginId / t / notify / runBackend を持つ。
 */
export function activate(host) {
  // notify() はホストの簡易通知。どのサーフェスからでも使える。
  host.notify("Hello, I'm GRAPHY-Next.");

  // ここから下は「host に何が入っているか」を見せるためのおまけ。
  // surface で分岐すると、同じプラグインを 2 つの画面に出しても文脈に合った動きにできる。
  if (host.surface === "mainscreen.menu") {
    // データベース画面: 選択中スタディの UID が取れる（未選択なら null）。
    host.notify("選択中のスタディ: " + (host.selectedStudyUid || "(未選択)"));
  } else {
    // 2D ビューア: 表示中タイルへの操作が host.actions にある。
    // 試しに白黒反転してみる（もう一度メニューを押せば元に戻る）。
    host.actions.invert();
    host.notify("表示中の画像を白黒反転しました（もう一度押すと戻ります）。");
  }
}
