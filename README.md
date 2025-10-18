## 电话号码查找系统

一个基于 Next.js 和 SQLite 的现代化联系人管理系统,支持全字段模糊搜索和字母索引快速定位。

## 启动方式

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

打开 [http://localhost:3000](http://localhost:3000) 来查看结果

## 技术栈

### 前端技术
- **Next.js 15.5.4** - React 全栈框架,支持服务端渲染和 API 路由
- **React 19.1.0** - 用户界面构建库
- **TypeScript 5.x** - 类型安全的 JavaScript 超集
- **Tailwind CSS 4.x** - 实用优先的 CSS 框架

### 后端技术
- **Next.js API Routes** - 内置的服务端 API 端点
- **SQLite3 5.1.7** - 轻量级嵌入式关系数据库
- **sqlite (promise-based wrapper) 5.1.1** - SQLite 的 Promise 封装库

### 开发工具
- **ESLint 9.x** - 代码质量检查工具
- **Turbopack** - 高性能的打包工具(Next.js 内置)

## 存储结构

### 数据库设计

系统使用 SQLite 作为数据存储引擎,数据库文件位于 `db/contacts.db`。

#### contacts 表结构

```sql
CREATE TABLE IF NOT EXISTS contacts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,  -- 联系人唯一标识
  name TEXT NOT NULL,                    -- 姓名(必填)
  phone TEXT,                            -- 电话号码
  country TEXT,                          -- 国家
  province TEXT,                         -- 省份
  city TEXT,                             -- 城市
  street TEXT,                           -- 街道
  address TEXT                           -- 完整地址(自动组合)
)
```

#### 字段说明

- **id**: 自增主键,唯一标识每个联系人
- **name**: 联系人姓名,唯一必填字段
- **phone**: 电话号码,支持任意格式
- **country/province/city/street**: 分层级的地址信息
- **address**: 自动组合的完整地址字符串,由 `country + province + city + street` 拼接而成

#### 数据持久化

- 数据库文件在首次启动时自动创建
- 使用 SQLite 的事务机制确保数据一致性
- 支持并发读取,写入操作自动加锁

## 查询联系人算法

### 1. 多字段模糊搜索算法

系统实现了高效的全字段模糊搜索功能,算法流程如下:

```typescript
// 伪代码示例
function searchContacts(keyword: string) {
  pattern = '%' + keyword + '%';  // SQL LIKE 模式
  
  // 搜索所有可能包含关键词的字段
  SELECT * FROM contacts
  WHERE name LIKE pattern
     OR phone LIKE pattern
     OR country LIKE pattern
     OR province LIKE pattern
     OR city LIKE pattern
     OR street LIKE pattern
     OR address LIKE pattern
  ORDER BY name;
}
```

**算法特点:**
- **全字段匹配**: 搜索覆盖姓名、电话、国家、省份、城市、街道和完整地址 7 个字段
- **模糊匹配**: 使用 SQL `LIKE` 操作符,支持关键词在任意位置出现
- **OR 逻辑**: 任一字段匹配即返回结果,提高搜索命中率
- **实时搜索**: 前端采用 300ms 防抖延迟,提供流畅的搜索体验

### 2. 字母索引分组算法

联系人列表按首字母分组显示,算法实现如下:

```typescript
// 分组算法伪代码
function groupContactsByInitial(contacts: Contact[]) {
  map = new Map<string, Contact[]>();
  
  // 遍历所有联系人
  for (contact of contacts) {
    // 提取姓名首字符
    firstChar = contact.name[0].toUpperCase();
    
    // 判断是否为英文字母
    letter = /[A-Z]/.test(firstChar) ? firstChar : '#';
    
    // 归类到对应分组
    if (!map.has(letter)) {
      map.set(letter, []);
    }
    map.get(letter).push(contact);
  }
  
  // 对分组进行排序
  groups = Array.from(map.entries()).sort();
  
  // 对每个分组内的联系人按姓名排序
  for (group of groups) {
    group.items.sort((a, b) => a.name.localeCompare(b.name));
  }
  
  return groups;
}
```

**算法特点:**
- **首字母提取**: 取联系人姓名的第一个字符作为分组依据
- **字母规范化**: A-Z 字母归入对应组,非字母归入 '#' 组
- **双层排序**: 分组按字母顺序排序,组内按姓名字典序排序
- **快速定位**: 右侧字母导航支持平滑滚动到指定分组

### 3. 前端搜索优化

```typescript
// 防抖优化
useEffect(() => {
  const timer = setTimeout(() => {
    fetchContacts(query || undefined);
  }, 300);  // 300ms 防抖延迟
  
  return () => clearTimeout(timer);
}, [query]);
```

**优化措施:**
- **防抖处理**: 用户停止输入 300ms 后才发起搜索请求
- **请求合并**: 避免频繁的 API 调用,减轻服务器压力
- **即时响应**: 保持搜索的实时性和流畅性



## API 端点

### GET /api/contacts
- **功能**: 获取所有联系人或搜索联系人
- **参数**: `?q=keyword` (可选)
- **返回**: JSON 数组

### POST /api/contacts
- **功能**: 创建新联系人
- **请求体**: `{ name, phone?, country?, province?, city?, street? }`
- **返回**: 创建的联系人对象

### GET /api/contacts/[id]
- **功能**: 获取指定联系人详情
- **返回**: 联系人对象

### PUT /api/contacts/[id]
- **功能**: 更新联系人信息
- **请求体**: 部分字段更新
- **返回**: 更新后的联系人对象

### DELETE /api/contacts/[id]
- **功能**: 删除指定联系人
- **返回**: 成功状态

## 项目结构

```
phone-number-lookup/
├── db/
│   └── contacts.db              # SQLite 数据库文件
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── contacts/        # RESTful API 路由
│   │   ├── contacts/[id]/       # 联系人详情页面
│   │   ├── page.tsx             # 主页(联系人列表)
│   │   └── layout.tsx           # 应用布局
│   └── db/
│       └── contacts.ts          # 数据访问层(DAL)
├── package.json
└── README.md
```

### 添加新字段

如需扩展联系人字段:
1. 修改 `src/db/contacts.ts` 中的表结构和类型定义
2. 更新 `addContact` 和 `updateContact` 方法
3. 修改前端表单和显示组件

