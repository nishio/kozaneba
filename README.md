# Kozaneba

Kozaneba is digital stationery to organize your thought.

Visit: https://kozaneba.netlify.app/

## 概要 / Overview

Kozanebaは思考を整理するためのデジタル文房具です。「小札」（Kozane）と「場」（Ba）という概念を使って、アイデアを整理・可視化するツールです。付箋やホワイトボードのデジタル版と考えることができます。

Kozaneba is a digital stationery tool that helps you organize your thoughts. It uses the concepts of "Kozane" (small cards) and "Ba" (space) to help you organize and visualize your ideas. You can think of it as a digital version of sticky notes and whiteboards.

## 機能 / Features

- 小札（Kozane）の作成と編集
- ドラッグ＆ドロップによる小札の移動
- グループ化機能
- クラウド自動保存機能
- Scrapboxからのインポート

## 開発環境のセットアップ / Development Setup

### 必要条件 / Requirements

- Node.js (LTS version)
- npm または yarn

### インストール手順 / Installation

1. リポジトリをクローン / Clone the repository
   ```
   git clone https://github.com/nishio/kozaneba.git
   cd kozaneba
   ```

2. Node.jsのバージョンを設定 / Set Node.js version
   ```
   nvm install lts/*
   nvm use
   ```

3. 依存パッケージをインストール / Install dependencies
   ```
   npm install --legacy-peer-deps
   ```
   または / or
   ```
   yarn install
   ```

4. 開発サーバーを起動 / Start development server
   ```
   npm start
   ```
   または / or
   ```
   yarn start
   ```

5. ブラウザで http://localhost:3000 にアクセス / Access in browser

## ライセンス / License

[MIT License](LICENSE)
