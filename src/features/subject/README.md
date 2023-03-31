## 概要

- RecoilとAspidaとReact Hook Formを組み合わせた設計サンプル

### 思想

- コンポーネント間の状態の共有はLifting state up or Recoil上で行う
  - 期待していること
    - Reactの関心であるUIの構築と、UIを構築するために必要なロジックの分離
    - UIの状態のスコープは可能な限りローカルステートにし凝集度を高める
    - コンポーネントツリー上に重要な状態やロジックを分散させない(SSOT)
  - propsはデータの依存関係やコールバックの制御をコンポーネントツリー内で明示的にしたい場合に利用する
- 状態遷移は基本的にRootに凝集させ、ハンドラをコンポーネントへ単方向に流す
  - コンポーネント階層が深くなる場合にかぎり、適宜Rootと同様の役割を持つコンポーネントを配置する
- この思想に至った経緯
  - 末端のコンポーネントからアプリケーションの状態を分離したい
    - 本来はプレゼンテーションに集中したい
    - 親子のロジックの密結合の回避
    - propsの型定義の冗長性も極力排除したい
  - 状態についてはAtomic State Managementによるデータフローグラフで依存関係を明示化できる
  - 設計意図(命名規則, Rootコンポーネント)によりfeatureのエントリーポイントとなるコンポーネントを定めることが出来る
  - mswによりテストは可能

## コンポーネント設計

以下から構成される

- Root
  - List
    - Item
  - form
    - fields
  - filter

### Root

- 同一feature内で利用するリソース(API)の定義及び、APIにまつわる状態管理
- 責務
  - API定義
  - APIの状態管理
  - レイアウト
  - 役割ごとのコンポーネント配置
  - Formコンポーネントへのprops指定
  - Suspense/ErrorBoundaryで各コンポーネントの境界線を引く

### List

- 一覧表示
- 単体削除後のミューテーション

#### List > Item

- アコーディオンの中身の詳細

### form

- formタグへのprops指定及び配置を行う
- 実装にあたってはReact Hook FormのuseFormを行い、フォームの状態管理を責務とする
- 以下のpropsを持つ
  - formProps
    - React Hook FormのuseFormへ渡される
  - onValid
    - React Hook FormのhandleSubmit後のバリデーション成功時のコールバック
    - formのonSubmitへ渡される
  - onInValid
    - React Hook FormのhandleSubmit後のバリデーション失敗時のコールバック
    - formのonSubmitへ渡される


#### form > fields

- input要素にreact hook formをバインドする

### filter

- 一覧の検索条件のフォーム
- シンプルなので、サンプルの実装にあたってはフォームの宣言とフィールドへの入力をまとめている
