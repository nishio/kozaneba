# Kozaneba アップグレード計画

## 概要

このドキュメントは、Kozanebaリポジトリの技術的負債を解消するための計画を詳細に記述しています。主な目的は、古いパッケージのアップデートとコードのリファクタリングを通じて、アプリケーションのセキュリティ、パフォーマンス、保守性を向上させることです。

## 現状分析

### 依存関係の問題

- **React**: 現在v17.0.2を使用（最新はv19.0.0）
- **Firebase**: 現在v8.10.1を使用（最新はv11.4.0）
- **TypeScript**: 現在v4.9.4を使用（最新はv5.8.2）
- **Material UI**: 複数のコンポーネントが古いバージョン
- **セキュリティ脆弱性**: npm auditで64件の脆弱性が検出（重大: 6件、高: 24件、中: 31件、低: 3件）

### コードの問題

- **reactn**: グローバル状態管理に広く使用されているが、現在はメンテナンスされていない
- **Firebase API**: 古いバージョンのAPIを使用しており、新しいモジュラーAPIへの移行が必要
- **型定義**: 古いFirebase SDKの型定義に依存している

## アップグレード計画

### フェーズ1: 非破壊的なセキュリティ脆弱性の修正

1. `npm audit fix`を実行して、破壊的変更を伴わない脆弱性を修正
2. アプリケーションが正常に動作することを確認

### フェーズ2: Firebase SDKのアップデート（v8からv11へ）

1. Firebase v11とcompat（互換）ライブラリをインストール
2. `src/Cloud/init_firebase.ts`のFirebase初期化コードを更新
3. `src/Cloud/FirebaseShortTypename.ts`の型定義を更新
4. `src/Cloud/FirestoreIO.ts`のFirebase使用箇所を更新
5. Firebase操作を抽象化するユーティリティファイル`src/Cloud/firebase-utils.ts`を作成

#### Firebase v8からv11への主な変更点

- 名前空間ベースのAPIからモジュラーAPIへの移行
- `firebase.app()`から`initializeApp()`への変更
- `firebase.firestore()`から`getFirestore()`への変更
- `firebase.auth()`から`getAuth()`への変更
- ドキュメント操作メソッドの変更（例: `get()`から`getDoc()`）
- クエリ構築方法の変更

### フェーズ3: reactnからReact Context APIへの移行

1. グローバル状態管理のためのContext APIを実装した`src/Global/GlobalContext.tsx`を作成
2. reactnからContext APIへの移行を支援するユーティリティを作成
3. コンポーネントを段階的に更新して新しい状態管理システムを使用

#### reactnからContext APIへの主な変更点

- `import { useGlobal } from 'reactn'`から`import { useGlobalState, useGlobalDispatch } from '../Global/GlobalContext'`への変更
- `setGlobal()`の代替実装
- `addReducer()`の代替実装
- グローバル状態の初期化方法の変更

### フェーズ4: Reactとその他のUIライブラリのアップデート

1. React v17からv19へのアップデート
2. Material UIとその他のUIライブラリのアップデート
3. テスト関連ライブラリのアップデート
4. 破壊的変更に対応するためのコード修正

#### React v17からv19への主な変更点

- 新しいReact DOM Client API
- Automatic Batchingの導入
- Suspenseの強化
- 新しいフック（useId, useSyncExternalStore, useInsertionEffect）

### フェーズ5: テストと検証

1. テストスイートを実行して問題を特定
2. 発見された問題を修正
3. アプリケーションの機能を検証
4. パフォーマンスとセキュリティの改善を確認

## 実装の詳細

### Firebase SDKのアップデート

```javascript
// 現在のコード（src/Cloud/init_firebase.ts）
import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";

const config = {
  apiKey: "AIzaSyB0wAxxeLeHr4udunpln5jCYpGpFGn7D00",
  authDomain: "regroup-d4932.firebaseapp.com",
  projectId: "regroup-d4932",
};
firebase.initializeApp(config);

export const db = firebase.firestore();
db.settings({ ignoreUndefinedProperties: true, merge: true });

export const auth = firebase.auth();
export const GoogleAuthProvider = firebase.auth.GoogleAuthProvider;
export type TUser = firebase.User | null;

// 新しいコード
import { initializeApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getAuth, GoogleAuthProvider, connectAuthEmulator } from "firebase/auth";
import type { User } from "firebase/auth";

const config = {
  apiKey: "AIzaSyB0wAxxeLeHr4udunpln5jCYpGpFGn7D00",
  authDomain: "regroup-d4932.firebaseapp.com",
  projectId: "regroup-d4932",
};

const app = initializeApp(config);

export const db = getFirestore(app);

// エミュレータを使用しているかチェック
const usingEmulator = window.location.hostname === "localhost";
if (usingEmulator) {
  connectFirestoreEmulator(db, "localhost", 8080);
}

export const auth = getAuth(app);
if (usingEmulator) {
  connectAuthEmulator(auth, "http://localhost:9099");
}

export const googleAuthProvider = new GoogleAuthProvider();
export type TUser = User | null;
```

### React Context APIの実装

```typescript
// src/Global/GlobalContext.tsx
import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { INITIAL_GLOBAL_STATE } from './initializeGlobalState';

type GlobalState = typeof INITIAL_GLOBAL_STATE;
type Action = { type: string; payload?: any };

const GlobalStateContext = createContext<GlobalState | undefined>(undefined);
const GlobalDispatchContext = createContext<React.Dispatch<Action> | undefined>(undefined);

function globalReducer(state: GlobalState, action: Action): GlobalState {
  switch (action.type) {
    case 'SET_GLOBAL':
      return { ...state, ...action.payload };
    // 必要に応じて他のアクションタイプを追加
    default:
      return state;
  }
}

export function GlobalProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(globalReducer, INITIAL_GLOBAL_STATE);
  
  return (
    <GlobalStateContext.Provider value={state}>
      <GlobalDispatchContext.Provider value={dispatch}>
        {children}
      </GlobalDispatchContext.Provider>
    </GlobalStateContext.Provider>
  );
}

export function useGlobalState() {
  const context = useContext(GlobalStateContext);
  if (context === undefined) {
    throw new Error('useGlobalState must be used within a GlobalProvider');
  }
  return context;
}

export function useGlobalDispatch() {
  const context = useContext(GlobalDispatchContext);
  if (context === undefined) {
    throw new Error('useGlobalDispatch must be used within a GlobalProvider');
  }
  return context;
}

export function setGlobal(updates: Partial<GlobalState>) {
  const dispatch = useGlobalDispatch();
  dispatch({ type: 'SET_GLOBAL', payload: updates });
}

export function getGlobal(): GlobalState {
  return useGlobalState();
}
```

## リスクと緩和策

1. **破壊的変更**: 複数のライブラリで破壊的変更が発生する可能性があります。段階的なアップグレードと徹底的なテストで対応します。

2. **Firebase移行の複雑さ**: Firebase SDKの大幅な変更により、多くのコード修正が必要になります。compat（互換）ライブラリを一時的に使用して段階的に移行します。

3. **reactn依存**: 多くのファイル（105ファイル）がreactnに依存しています。互換レイヤーを作成して段階的に移行します。

4. **テスト不足**: テストカバレッジが不十分な場合、リグレッションが発生するリスクがあります。手動テストと自動テストを組み合わせて対応します。

## タイムライン

1. フェーズ1（非破壊的なセキュリティ脆弱性の修正）: 1日
2. フェーズ2（Firebase SDKのアップデート）: 2-3日
3. フェーズ3（reactnからContext APIへの移行）: 3-4日
4. フェーズ4（Reactとその他のライブラリのアップデート）: 2日
5. フェーズ5（テストと検証）: 1-2日

合計: 約9-12日（作業の複雑さによって変動する可能性あり）

## 結論

このアップグレード計画は、Kozanebaリポジトリの技術的負債を段階的に解消するための包括的なアプローチを提供します。各フェーズは独立して実行可能ですが、相互に依存する部分もあるため、計画的な実行が重要です。セキュリティ脆弱性の修正を優先し、その後Firebase SDKのアップデート、reactnの置き換え、そしてReactとその他のライブラリのアップデートを行います。
