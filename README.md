# cc-commit

写提交信息太费脑子，所以做了个小工具：把已经 `git add` 的改动丢给模型，让它按 conventional commits 的格式写一条提交信息出来。

## 安装

```bash
npm install -g cc-commit
```

或者不装，直接用：

```bash
npx cc-commit
```

## 用法

先把要提交的改动暂存起来，然后在仓库里跑：

```bash
git add .
cc-commit
```

它会打印生成的信息。确认没问题就复制去 `git commit`；懒得复制的话加 `--apply`，它直接替你提交：

```bash
cc-commit --apply
```

想换个模型试试：

```bash
cc-commit --model claude-opus-5-5
```

## 配置

在环境变量里覆盖默认值：

| 变量 | 默认 | 说明 |
| --- | --- | --- |
| `CC_COMMIT_API_KEY` | 见下 | 接口密钥 |
| `CC_COMMIT_BASE_URL` | 见下 | 接口地址，Anthropic 兼容 |
| `CC_COMMIT_MODEL` | `claude-sonnet-5` | 模型名 |

为了方便直接体验，内置了一把默认 key；额度有限，建议换成自己的。

## 一些说明

- diff 超过 12000 字符会截断后再送模型，避免一次烧掉太多额度。
- 只读暂存区（`git diff --cached`），没暂存任何东西时会直接提示你。
- 除 `commander` 外没有运行时依赖，请求走原生 `fetch`。

## 开发

```bash
npm install
npm test        # vitest
npm run build
```

## License

MIT
