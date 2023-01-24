## react-query

##  気になる点
- キャッシュ管理のコード量がRecoilパターンと比較して増えている
  - [https://github.com/koushisa/recoil-aspida-architecture/blob/9b6f87f63aaa76e22d80735f022c0b2076ffb726/src/features/subject__rq/rq.hooks.tsx#L15-L29](https://github.com/koushisa/recoil-aspida-architecture/blob/9b6f87f63aaa76e22d80735f022c0b2076ffb726/src/features/subject__rq/rq.hooks.tsx#L15-L29)
  - ラッパー作ったり、key generatorあたりが大変
- Suspenseモードで利用してもレスポンスの型にundefinedがついている
- 中央集権的に管理しているkeyやhooksが肥大化していきそう
- コールバックで命令的にキャッシュキーを更新する方法がない
  - 絞り込み検索(Filter)のフォームを一覧APIのキャッシュキーと連動させるあたり
    - watchでなんとかした
    - hooksにするために、絞り込み検索(Filter)のフォームをコンテキストで露出せざるを得なかった
  - ちゃんと調べたらいいやり方があるのかも
- 全体的にreact-queryの処理をコンポーネントを分離させるのは難しい
- 分離とか考えずに愚直にコンポーネントに書くぐらいが丁度いいのかも
- 規模が大きかったり複雑なフォームで依存フェッチやビジネスロジックが必要となるケースのコードベースについては未知数
