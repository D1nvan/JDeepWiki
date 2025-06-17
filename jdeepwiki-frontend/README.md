# JDeepWiki任务管理系统前端

基于React和Ant Design构建的任务管理系统前端项目。

## 功能特性

- 任务列表展示（支持分页、搜索）
- 任务创建（支持Git仓库和ZIP文件两种方式）
- 任务详情查看
- 任务编辑
- 任务删除

## 技术栈

- React 18
- Ant Design 5.x
- React Router 6.x
- Axios
- Framer Motion

## 开发环境搭建

1. 安装依赖：

```bash
npm install
```

2. 启动开发服务器：

```bash
npm start
```

3. 打开浏览器访问：

```
http://localhost:3000
```

## 生产环境构建

```bash
npm run build
```

## 项目结构

```
jdeepwiki-frontend/
├── public/               # 静态资源
├── src/
│   ├── api/              # API接口
│   ├── assets/           # 图片等资源
│   ├── components/       # 公共组件
│   ├── hooks/            # 自定义Hooks
│   ├── layouts/          # 布局组件
│   ├── pages/            # 页面组件
│   ├── theme/            # 主题配置
│   ├── utils/            # 工具函数
│   ├── App.css           # 全局样式
│   ├── App.jsx           # 应用入口组件
│   └── index.js          # 应用入口文件
├── package.json          # 依赖配置
└── README.md             # 项目说明
```

## 接口文档

本项目对接后端接口列表：

- `/api/task/createFromGit`：从Git仓库创建任务
- `/api/task/createFromZip`：从ZIP文件创建任务
- `/api/task/listPage`：分页获取任务列表
- `/api/task/detail`：获取任务详情
- `/api/task/update`：更新任务
- `/api/task/delete`：删除任务 